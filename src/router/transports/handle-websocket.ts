import type { ServerWebSocket } from 'bun'
import {
  NOOP_ON_ERROR,
  type RouterResultNotGeneric,
} from '../../types'
import { createId } from '../../utils/create-id'
import { handleError } from '../../utils/handle-error'
import { isObject } from '../../utils/is'
import { JSONL } from '../../utils/stream-helpers'
import {
  StreamMessageType,
  type OnWebSocketMessageInternal,
  type StreamMessage,
} from '../router.type'
import {
  handleStreamResponse,
  Parser,
} from './handle-stream'

function isDataWithParser(data: unknown): data is {
  parser?: Parser
  files?: Map<string, File>
} {
  return isObject(data)
}

function handleFileUpload(
  item: StreamMessage,
  files: Map<string, File>,
): boolean {
  if (
    item.type === StreamMessageType.UPLOAD_FILE &&
    item.file
  ) {
    files.set(item.id, new File([item.file], item.id))
    return true
  }
  return false
}

function handleClientActionCallResult(
  item: StreamMessage,
  pendingClientActionCalls: OnWebSocketMessageInternal['pendingClientActionCalls'],
): boolean {
  if (
    item.type !==
    StreamMessageType.CLIENT_ACTION_CALL_RESULT
  ) {
    return false
  }

  const pending = pendingClientActionCalls.take(item.id)
  if (!pending) {
    throw new Error('Client action call result not found')
  }
  const resultPayload: RouterResultNotGeneric =
    item.status === 'ok'
      ? {
          status: 'ok',
          data: item.file ?? item.data,
        }
      : {
          status: 'error',
          error: item.error,
        }
  pending.resolve(resultPayload)
  return true
}

function createClientActionCallHandler(
  ws: ServerWebSocket<unknown>,
  encoder: TextEncoder,
  pendingClientActionCalls: OnWebSocketMessageInternal['pendingClientActionCalls'],
) {
  return async (clientActionOptions: {
    readonly params: unknown
    readonly actionName: string
  }): Promise<RouterResultNotGeneric> => {
    const clientActionId = createId()
    await handleStreamResponse({
      actionResult: clientActionOptions.params,
      send: (newMessage) => ws.send(newMessage),
      actionName: clientActionOptions.actionName,
      id: clientActionId,
      encoder,
      type: StreamMessageType.CLIENT_ACTION_CALL,
    })
    return new Promise<RouterResultNotGeneric>(
      (resolve, reject) => {
        pendingClientActionCalls.add(
          clientActionId,
          {
            resolve: resolve as (value: unknown) => void,
            reject,
          },
          () => {
            reject(new Error('Client action call expired'))
          },
        )
      },
    )
  }
}

async function executeServerAction(
  item: StreamMessage,
  callableActions: OnWebSocketMessageInternal['callableActions'],
  ctx: OnWebSocketMessageInternal['ctx'],
  files: Map<string, File>,
  encoder: TextEncoder,
  ws: ServerWebSocket<unknown>,
  onError: (error: Error) => Error,
  pendingClientActionCalls: OnWebSocketMessageInternal['pendingClientActionCalls'],
): Promise<void> {
  try {
    const onClientActionCall =
      createClientActionCallHandler(
        ws,
        encoder,
        pendingClientActionCalls,
      )
    const result = await callableActions({
      actionName: item.action,
      params: item.file ?? item.data,
      ctx,
      files,
      onClientActionCall,
    })
    await handleStreamResponse({
      actionResult: result,
      send: (newMessage) => ws.send(newMessage),
      actionName: item.action,
      id: item.id,
      encoder,
      type: StreamMessageType.SERVER_ACTION_RESULT,
    })
  } catch (rawError) {
    const error = handleError(
      onError ?? NOOP_ON_ERROR,
      rawError,
    )
    if (error) {
      const newMessage: StreamMessage = {
        action: item.action,
        id: item.id,
        status: 'error',
        error: error.error,
        type: StreamMessageType.SERVER_ACTION_RESULT,
        isLast: true,
      }
      const rawMessage = JSONL(newMessage)
      const encodedMessage = encoder.encode(rawMessage)
      ws.send(encodedMessage)
    }
  }
}

export async function handleWebSocket(
  options: OnWebSocketMessageInternal,
) {
  const {
    ws,
    message,
    callableActions,
    encoder,
    ctx,
    pendingClientActionCalls,
    onError = NOOP_ON_ERROR,
  } = options
  const { data } = ws
  if (!isDataWithParser(data)) {
    throw new Error('WebSocket data is not available')
  }
  if (!data.parser) {
    data.parser = new Parser()
  }

  const { parser } = data
  if (!(message instanceof Uint8Array)) {
    throw new TypeError(
      'Invalid data format expected Uint8Array',
    )
  }

  const messages = await parser.feed(message)

  const promises: Promise<void>[] = []
  if (!data.files) {
    data.files = new Map<string, File>()
  }
  const { files } = data
  for (const item of messages) {
    if (handleFileUpload(item, files)) {
      continue
    }
    if (
      handleClientActionCallResult(
        item,
        pendingClientActionCalls,
      )
    ) {
      continue
    }
    if (
      item.type !== StreamMessageType.WS_SEND_FROM_CLIENT
    ) {
      continue
    }
    const promise = executeServerAction(
      item,
      callableActions,
      ctx,
      files,
      encoder,
      ws,
      onError,
      pendingClientActionCalls,
    )
    promises.push(promise)
  }
  await Promise.all(promises)
}
