/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable unicorn/consistent-function-scoping */
import { HEADER_PARAM_NAME } from '../../consts'
import {
  StreamMessageType,
  type ClientActionsBase,
  type Router,
  type ServerActionsBase,
  type StreamMessage,
} from '../../router/router.type'
import type {
  ParamsIt,
  ResultForWithActionResult,
  RouterClientState,
  WebsocketOptions,
} from '../router-client.types'
import { readable } from '../../utils/readable'
import { Parser } from '../../router/transports/handle-stream'
import {
  createErrorProcessor,
  createStreamGenerator,
  handleClientActionCall,
  hasHeaders,
  headersToObject,
  isAsyncGenerator,
  mergeClientActions,
  sendInitialParams,
  streamMessageToResult,
} from '../router-client.utils'

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
  onResponse?: <
    Params extends ParamsIt<RouterType>,
  >(options: {
    readonly json: ResultForWithActionResult<
      RouterType,
      Params
    >
    readonly statusCode: number
    readonly runAgain: <
      NewParams extends ParamsIt<RouterType> = Params,
    >(
      newParams?: NewParams,
      newOptions?: WebsocketOptions<RouterType>,
    ) => AsyncGenerator<
      ResultForWithActionResult<RouterType, NewParams>
    >
  }) =>
    | ResultForWithActionResult<
        RouterType,
        ParamsIt<RouterType>
      >
    | void
    | Promise<ResultForWithActionResult<
        RouterType,
        ParamsIt<RouterType>
      > | void>
}) {
  const {
    websocketURL,
    state,
    defineClientActions,
    onResponse,
  } = options
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
        new Error(
          'Missing websocket URL. Please provide `websocketURL` in routerClient options.',
        ),
      )
    }

    const runAgain = <
      NewParams extends ParamsIt<RouterType> = Params,
    >(
      newParams?: NewParams,
      newOptions?: WebsocketOptions<RouterType>,
    ): AsyncGenerator<ResultForLocal<NewParams>> => {
      if (newParams !== undefined) {
        return createWebsocketHandler<RouterType>({
          websocketURL,
          state,
          defineClientActions,
          onResponse,
        })(
          newParams as unknown as Params,
          newOptions ?? websocketOptions,
        ) as AsyncGenerator<ResultForLocal<NewParams>>
      }
      if (newOptions !== undefined) {
        return createWebsocketHandler<RouterType>({
          websocketURL,
          state,
          defineClientActions,
          onResponse,
        })(params, newOptions) as AsyncGenerator<
          ResultForLocal<NewParams>
        >
      }
      return createWebsocketHandler<RouterType>({
        websocketURL,
        state,
        defineClientActions,
        onResponse,
      })(params, websocketOptions) as AsyncGenerator<
        ResultForLocal<NewParams>
      >
    }

    const encoder = new TextEncoder()
    const enqueueModifiedResult = async (
      modifiedResult:
        | ResultForLocal<Params>
        | AsyncGenerator<ResultForLocal<Params>>,
      controller: ReadableStreamDefaultController<
        ResultForLocal<Params>
      >,
    ): Promise<void> => {
      if (
        isAsyncGenerator<ResultForLocal<Params>>(
          modifiedResult,
        )
      ) {
        for await (const rerunResult of modifiedResult) {
          controller.enqueue(rerunResult)
        }
        return
      }
      controller.enqueue(modifiedResult)
    }

    // Browser WebSocket API doesn't support custom headers
    // Headers can only be set via URL query params or in the first message
    // Append headers to the WebSocket URL as query parameters
    const url = new URL(websocketURL!)
    if (
      state.defaultHeaders &&
      hasHeaders(state.defaultHeaders)
    ) {
      const headersObject = headersToObject(
        state.defaultHeaders,
      )
      url.searchParams.set(
        HEADER_PARAM_NAME,
        JSON.stringify(headersObject),
      )
    }
    const ws = new WebSocket(url)
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
        const resultTyped = result as ResultForLocal<Params>
        // Only call onResponse for the final result (when isLast is true)
        // This ensures we have the complete result before processing
        // Also call onResponse for error messages even if isLast is not set,
        // as errors are typically final messages
        const isFinalMessage =
          item.isLast ?? item.status === 'error'
        if (onResponse && isFinalMessage) {
          // For websocket, we can't easily get the status code from individual messages
          // Use 200 as default since errors are in the ActionResult format
          const modifiedResult = await onResponse({
            json: resultTyped,
            statusCode: 200,
            runAgain,
          })
          if (modifiedResult !== undefined) {
            await enqueueModifiedResult(
              modifiedResult as
                | ResultForLocal<Params>
                | AsyncGenerator<ResultForLocal<Params>>,
              controller,
            )
            if (item.isLast) {
              actionsResolved++
            }
            return true
          }
        }
        controller.enqueue(resultTyped)
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

        // Convert different data types to Uint8Array
        let uint8Data: Uint8Array
        if (data instanceof Uint8Array) {
          uint8Data = data
        } else if (data instanceof ArrayBuffer) {
          uint8Data = new Uint8Array(data)
        } else if (data instanceof Blob) {
          const arrayBuffer = await data.arrayBuffer()
          uint8Data = new Uint8Array(arrayBuffer)
        } else {
          return
        }

        const messages = await parser.feed(uint8Data)
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
      return async () => {
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
          const result = streamMessageToResult<Params>(item)
          if (result && !isControllerClosed) {
            const resultTyped =
              result as ResultForLocal<Params>
            // Call onResponse for final messages in close handler
            // Items from finalize() are typically final (isLast should be true or undefined)
            if (onResponse && (item.isLast ?? true)) {
              const modifiedResult = await onResponse({
                json: resultTyped,
                statusCode: 200,
                runAgain,
              })
              if (modifiedResult !== undefined) {
                await enqueueModifiedResult(
                  modifiedResult as
                    | ResultForLocal<Params>
                    | AsyncGenerator<
                        ResultForLocal<Params>
                      >,
                  controller,
                )
                continue
              }
            }
            controller.enqueue(resultTyped)
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
        ws.addEventListener('error', (event) => {
          if (!isControllerClosed) {
            isControllerClosed = true
            controller.error(
              new Error(
                `WebSocket error: ${'message' in event ? event.message : 'Unknown error'}`,
              ),
            )
          }
          if (!isWebSocketClosed) {
            isWebSocketClosed = true
            ws.close()
          }
        })
        // Handle race condition: if WebSocket is already open, send params immediately
        if (ws.readyState === WebSocket.OPEN) {
          await sendInitialParams(
            params,
            files,
            encoder,
            sendMessage,
          )
        }
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
