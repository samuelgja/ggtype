/* eslint-disable unicorn/consistent-function-scoping */
import {
  StreamMessageType,
  type ClientActionsBase,
  type Router,
  type ServerActionsBase,
  type StreamMessage,
} from '../../router.type'
import type {
  ParamsIt,
  ResultForWithActionResult,
  RouterClientState,
  WebsocketOptions,
} from '../router-client.types'
import { Parser } from '../../transports/handle-stream'
import {
  createErrorProcessor,
  createStreamGenerator,
  handleClientActionCall,
  mergeClientActions,
  sendInitialParams,
  streamMessageToResult,
} from '../router-client.utils'
import { readable } from '../../../utils/readable'

export function createWebsocketHandler<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(options: {
  websocketURL?: string | URL
  state: RouterClientState
  defineClientActions?: Record<
    string,
    (params: unknown) => Promise<unknown>
  >
}) {
  const { websocketURL, state, defineClientActions } =
    options
  const { throwClientError } = createErrorProcessor(
    state.onError,
  )

  type ResultForLocal<Params extends ParamsIt<RouterType>> =
    ResultForWithActionResult<RouterType, Params>

  return async function* <
    Params extends ParamsIt<RouterType>,
  >(
    params: Params,
    websocketOptions?: WebsocketOptions<RouterType>,
  ): AsyncGenerator<ResultForLocal<Params>> {
    const {
      defineClientActions: maybeClientActions,
      files = [],
    } = websocketOptions ?? {}

    const clientActions = mergeClientActions(
      defineClientActions,
      maybeClientActions,
    )
    if (!websocketURL) {
      throwClientError(
        new Error('websocketURL is required'),
      )
    }
    const encoder = new TextEncoder()
    const ws = new WebSocket(websocketURL!)
    const numberOfActions = Object.keys(params).length
    let actionsResolved = 0

    const parser = new Parser()
    let isControllerClosed = false
    let isWebSocketClosed = false

    const sendMessage = (message: Uint8Array) => {
      ws.send(message)
    }

    const handleWebSocketError = (
      error: unknown,
      controller: ReadableStreamDefaultController<
        ResultForLocal<Params>
      >,
    ): void => {
      if (!isControllerClosed) {
        isControllerClosed = true
        controller.error(error as Error)
        if (!isWebSocketClosed) {
          isWebSocketClosed = true
          ws.close()
        }
      }
    }

    const processWebSocketMessageItem = async (
      item: StreamMessage,
      controller: ReadableStreamDefaultController<
        ResultForLocal<Params>
      >,
    ): Promise<boolean> => {
      if (isControllerClosed) {
        return false
      }

      try {
        const handled = await handleClientActionCall(
          item,
          clientActions as Record<
            string,
            (params: unknown) => Promise<unknown>
          >,
          encoder,
          sendMessage,
          state.onError,
        )
        if (handled) {
          return true
        }
      } catch (error) {
        handleWebSocketError(error, controller)
        return false
      }

      if (
        item.type ===
        StreamMessageType.CLIENT_ACTION_CALL_RESULT
      ) {
        return true
      }

      const result = streamMessageToResult<Params>(item)
      if (result && !isControllerClosed) {
        controller.enqueue(result as ResultForLocal<Params>)
        if (item.isLast) {
          actionsResolved++
        }
      }

      return true
    }

    const checkAndCloseIfComplete = (
      controller: ReadableStreamDefaultController<
        ResultForLocal<Params>
      >,
    ): void => {
      if (
        actionsResolved === numberOfActions &&
        !isControllerClosed
      ) {
        isControllerClosed = true
        controller.close()
      }
    }

    const createWebSocketMessageHandler = (
      controller: ReadableStreamDefaultController<
        ResultForLocal<Params>
      >,
    ) => {
      return async ({ data }: { data: unknown }) => {
        if (isControllerClosed) {
          return
        }
        if (!(data instanceof Uint8Array)) {
          return
        }

        const messages = await parser.feed(data)
        for (const item of messages) {
          const shouldContinue =
            await processWebSocketMessageItem(
              item,
              controller,
            )
          if (!shouldContinue) {
            return
          }
        }

        checkAndCloseIfComplete(controller)
      }
    }

    const createWebSocketOpenHandler = () => {
      return async () => {
        await sendInitialParams(
          params,
          files,
          encoder,
          sendMessage,
        )
      }
    }

    const createWebSocketCloseHandler = (
      controller: ReadableStreamDefaultController<
        ResultForLocal<Params>
      >,
    ) => {
      return () => {
        if (isControllerClosed) {
          return
        }
        const tail = parser.finalize({
          allowUploadHeaderWithoutFile: true,
        })
        for (const item of tail) {
          if (isControllerClosed) {
            break
          }
          switch (item.status) {
            case 'ok': {
              if (!isControllerClosed) {
                controller.enqueue({
                  [item.action]: {
                    data: item.file ?? item.data,
                    status: item.status,
                  },
                } as ResultForWithActionResult<
                  RouterType,
                  Params
                >)
              }
              break
            }
            case 'error': {
              if (!isControllerClosed) {
                controller.enqueue({
                  [item.action]: {
                    error: item.error,
                    status: item.status,
                  },
                } as ResultForWithActionResult<
                  RouterType,
                  Params
                >)
              }
              break
            }
          }
        }
        if (!isControllerClosed) {
          isControllerClosed = true
          controller.close()
        }
        if (!isWebSocketClosed) {
          isWebSocketClosed = true
          ws.close()
        }
      }
    }

    const stream = readable({
      async start(
        controller: ReadableStreamDefaultController<
          ResultForLocal<Params>
        >,
      ) {
        ws.addEventListener(
          'message',
          createWebSocketMessageHandler(controller),
        )
        ws.addEventListener(
          'open',
          createWebSocketOpenHandler(),
        )
        ws.addEventListener(
          'close',
          createWebSocketCloseHandler(controller),
        )
        ws.addEventListener('error', (_event) => {
          if (!isWebSocketClosed) {
            isWebSocketClosed = true
            ws.close()
          }
        })
      },
    })
    const streamGenerator = createStreamGenerator(
      stream as ReadableStream<
        ResultForWithActionResult<RouterType, Params>
      >,
    )
    try {
      for await (const item of streamGenerator) {
        yield item
      }
    } finally {
      // Ensure WebSocket is closed when generator finishes
      // Only close if controller was closed (all actions resolved) and WebSocket is still open
      if (
        isControllerClosed &&
        !isWebSocketClosed &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        isWebSocketClosed = true
        ws.close()
      }
    }
  }
}
