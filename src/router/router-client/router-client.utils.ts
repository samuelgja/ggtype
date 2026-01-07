import { type RouterResultNotGeneric } from '../../types'
import { createId } from '../../utils/create-id'
import { handleError } from '../../utils/handle-error'
import { hasStreamData } from '../../utils/is'
import { JSONL } from '../../utils/stream-helpers'
import { UPLOAD_FILE } from './router-client.types'
import {
  StreamMessageType,
  type StreamMessage,
} from '../router.type'
import { reconstructFileFromStreamMessage } from '../router.utils'
import { handleStreamResponse } from '../transports/handle-stream'

export async function* createStreamGenerator<T>(
  stream: ReadableStream<T>,
): AsyncGenerator<T, void, unknown> {
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      if (value != undefined) {
        yield value
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }
  if (typeof error === 'string') {
    return new Error(error)
  }
  return new Error('Unknown client error')
}

export function createErrorProcessor(
  onError: (error: Error) => Error,
): {
  processError: (error: unknown) => Error
  throwClientError: (error: unknown) => never
} {
  const processError = (error: unknown): Error => {
    const normalized = normalizeError(error)
    return onError(normalized)
  }

  const throwClientError = (error: unknown): never => {
    throw processError(error)
  }

  return { processError, throwClientError }
}

export async function handleClientActionCall(
  item: StreamMessage,
  clientActions: Record<
    string,
    (params: unknown) => Promise<unknown>
  >,
  encoder: TextEncoder,
  send: (message: Uint8Array) => void,
  onError: (error: Error) => Error,
): Promise<boolean> {
  if (item.type !== StreamMessageType.CLIENT_ACTION_CALL) {
    return false
  }

  const sendErrorPayload = (
    errorResult: RouterResultNotGeneric,
  ) => {
    const message: StreamMessage = {
      action: item.action,
      id: item.id,
      status: 'error',
      error: errorResult.error,
      type: StreamMessageType.CLIENT_ACTION_CALL_RESULT,
      isLast: true,
    }
    const rawMessage = JSONL(message)
    const encodedMessage = encoder.encode(rawMessage)
    send(encodedMessage)
  }

  const normalizeErrorResult = (
    rawError: unknown,
    defaultMessage: string,
  ): RouterResultNotGeneric => {
    const normalized = handleError(
      onError,
      rawError instanceof Error
        ? rawError
        : new Error(defaultMessage),
    )
    if (normalized) {
      return normalized
    }
    return {
      status: 'error',
      error: {
        type: 'generic',
        message: defaultMessage,
        code: 400,
      },
    }
  }

  const clientAction = clientActions[item.action]
  if (!clientAction) {
    sendErrorPayload(
      normalizeErrorResult(
        new Error(`Client action ${item.action} not found`),
        `Client action ${item.action} not found`,
      ),
    )
    return true
  }

  try {
    const result = await clientAction(item.data)
    await handleStreamResponse({
      actionName: item.action,
      actionResult: result,
      id: item.id,
      encoder,
      type: StreamMessageType.CLIENT_ACTION_CALL_RESULT,
      send,
    })
  } catch (rawError) {
    const actionError = normalizeErrorResult(
      rawError,
      'Client action failed',
    )
    sendErrorPayload(actionError)
  }
  return true
}

export function mergeClientActions<
  T extends Record<
    string,
    (params: unknown) => Promise<unknown>
  >,
>(baseActions?: T, overrideActions?: Partial<T>): T {
  return {
    ...baseActions,
    ...overrideActions,
  } as T
}

export function createWaitForStreamFunction(
  streamControllerRef: {
    current: ReadableStreamDefaultController<unknown> | null
  },
  streamResolverRef: {
    current: (() => void) | null
  },
): () => Promise<void> {
  return async (): Promise<void> => {
    if (streamControllerRef.current) {
      return
    }
    return new Promise((resolve) => {
      streamResolverRef.current = resolve
    })
  }
}

export function processQueueAfterStreamReady(
  waitForStream: () => Promise<void>,
  streamController: ReadableStreamDefaultController<unknown> | null,
  messageQueue: unknown[],
): void {
  waitForStream().then(() => {
    for (const queued of messageQueue) {
      streamController?.enqueue(queued)
    }
    messageQueue.length = 0
  })
}

export function streamMessageToResult<
  Params extends Record<string, unknown>,
>(
  item: StreamMessage,
):
  | {
      [K in keyof Params]: {
        data?: unknown
        error?: unknown
        status: 'ok' | 'error'
      }
    }
  | null {
  if (!hasStreamData(item)) {
    return null
  }

  if (item.status === 'ok') {
    return {
      [item.action]: {
        data: reconstructFileFromStreamMessage(item),
        status: item.status,
      },
    } as {
      [K in keyof Params]: {
        data?: unknown
        error?: unknown
        status: 'ok' | 'error'
      }
    }
  }

  if (item.status === 'error') {
    return {
      [item.action]: {
        error: item.error,
        status: item.status,
      },
    } as {
      [K in keyof Params]: {
        data?: unknown
        error?: unknown
        status: 'ok' | 'error'
      }
    }
  }

  return null
}

export async function sendInitialParams(
  params: Record<string, unknown>,
  files: readonly File[],
  encoder: TextEncoder,
  send: (message: Uint8Array) => void,
): Promise<void> {
  for (const file of files) {
    await handleStreamResponse({
      actionName: UPLOAD_FILE,
      actionResult: file,
      encoder,
      send,
      id: createId(),
      type: StreamMessageType.UPLOAD_FILE,
    })
  }

  for (const actionName in params) {
    const actionParams = params[actionName]
    await handleStreamResponse({
      actionName,
      actionResult: actionParams,
      encoder,
      send,
      id: createId(),
      type: StreamMessageType.WS_SEND_FROM_CLIENT,
    })
  }
}
