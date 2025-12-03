/* eslint-disable sonarjs/no-nested-functions */
import { NOOP_ON_ERROR } from '../../types'
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

  const m = await parser.feed(message)
  const messages = m

  const promises: Promise<void>[] = []
  if (!data.files) {
    data.files = new Map<string, File>()
  }
  const { files } = data
  for (const item of messages) {
    if (
      item.type === StreamMessageType.UPLOAD_FILE &&
      item.file
    ) {
      files.set(item.id, new File([item.file], item.id))
      continue
    }
    if (
      item.type ===
      StreamMessageType.CLIENT_ACTION_CALL_RESULT
    ) {
      const pending = pendingClientActionCalls.take(item.id)
      if (!pending) {
        throw new Error(
          'Client action call result not found',
        )
      }
      pending.resolve(item.file ?? item.data)
      continue
    }
    if (
      item.type !== StreamMessageType.WS_SEND_FROM_CLIENT
    ) {
      continue
    }
    async function run() {
      try {
        const result = await callableActions({
          actionName: item.action,
          params: item.file ?? item.data,
          ctx,
          files,
          onClientActionCall: async (
            clientActionOptions,
          ) => {
            const clientActionId = createId()
            await handleStreamResponse({
              actionResult: clientActionOptions.params,
              send: (newMessage) => ws.send(newMessage),
              actionName: clientActionOptions.actionName,
              id: clientActionId,
              encoder,
              type: StreamMessageType.CLIENT_ACTION_CALL,
            })
            return new Promise((resolve, reject) => {
              pendingClientActionCalls.add(
                clientActionId,
                {
                  resolve,
                  reject,
                },
                () => {
                  reject(
                    new Error('Client action call expired'),
                  )
                },
              )
            })
          },
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
        const error = handleError(onError, rawError)
        const newMessage: StreamMessage = {
          action: item.action,
          id: item.id,
          status: 'error',
          error: error?.error,
          type: StreamMessageType.SERVER_ACTION_RESULT,
          isLast: true,
        }
        const rawMessage = JSONL(newMessage)
        const encodedMessage = encoder.encode(rawMessage)
        ws.send(encodedMessage)
      }
    }
    const promise = run()
    promises.push(promise)
  }
  await Promise.all(promises)
}
