import { HEADER_PARAM_NAME } from '../../consts'
import {
  StreamMessageType,
  type ClientActionsBase,
  type Router,
  type ServerActionsBase,
  type StreamMessage,
} from '../../router/router.type'
import type {
  BidirectionalConnection,
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
  createWaitForStreamFunction,
  handleClientActionCall,
  hasHeaders,
  headersToObject,
  mergeClientActions,
  processQueueAfterStreamReady,
  sendInitialParams,
  streamMessageToResult,
} from '../router-client.utils'

export function createWebsocketPersistent<
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

  return (
    websocketOptions?: WebsocketOptions<RouterType>,
  ): BidirectionalConnection<RouterType> => {
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

    const encoder = new TextEncoder()
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
    const parser = new Parser()
    let isClosed = false
    let isOpen = false
    const openPromise = new Promise<void>((resolve) => {
      ws.addEventListener('open', () => {
        isOpen = true
        resolve()
      })
    })
    const messageQueue: ResultForWithActionResult<
      RouterType,
      ParamsIt<RouterType>
    >[] = []
    const streamControllerRef: {
      current: ReadableStreamDefaultController<
        ResultForWithActionResult<
          RouterType,
          ParamsIt<RouterType>
        >
      > | null
    } = { current: null }
    const streamResolverRef: {
      current: (() => void) | null
    } = { current: null }

    const stream = readable<
      ResultForWithActionResult<
        RouterType,
        ParamsIt<RouterType>
      >
    >({
      start(
        controller: ReadableStreamDefaultController<
          ResultForWithActionResult<
            RouterType,
            ParamsIt<RouterType>
          >
        >,
      ) {
        streamControllerRef.current = controller
        if (streamResolverRef.current) {
          streamResolverRef.current()
        }
      },
    })

    const processMessage = async (
      item: StreamMessage,
    ): Promise<void> => {
      if (isClosed) {
        return
      }

      try {
        if (
          await handleClientActionCall(
            item,
            clientActions as Record<
              string,
              (params: unknown) => Promise<unknown>
            >,
            encoder,
            (message: Uint8Array) => {
              ws.send(message)
            },
            state.onError,
          )
        ) {
          return
        }
      } catch (error) {
        if (!isClosed) {
          isClosed = true
          if (streamControllerRef.current) {
            streamControllerRef.current.error(
              error as Error,
            )
          }
          ws.close()
        }
        return
      }

      if (
        item.type ===
        StreamMessageType.CLIENT_ACTION_CALL_RESULT
      ) {
        return
      }

      const result =
        streamMessageToResult<ParamsIt<RouterType>>(item)
      if (result) {
        if (streamControllerRef.current) {
          streamControllerRef.current.enqueue(
            result as ResultForWithActionResult<
              RouterType,
              ParamsIt<RouterType>
            >,
          )
        } else {
          messageQueue.push(
            result as ResultForWithActionResult<
              RouterType,
              ParamsIt<RouterType>
            >,
          )
        }
      }
    }

    ws.addEventListener('message', async ({ data }) => {
      if (isClosed) {
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
        await processMessage(item)
      }
    })

    ws.addEventListener('open', async () => {
      isOpen = true
      if (files.length > 0) {
        await sendInitialParams(
          {} as ParamsIt<RouterType>,
          files,
          encoder,
          (message) => ws.send(message),
        )
      }
    })

    ws.addEventListener('close', () => {
      if (isClosed) {
        return
      }
      isOpen = false
      const tail = parser.finalize({
        allowUploadHeaderWithoutFile: true,
      })
      for (const item of tail) {
        const result =
          streamMessageToResult<ParamsIt<RouterType>>(item)
        if (result && streamControllerRef.current) {
          streamControllerRef.current.enqueue(
            result as ResultForWithActionResult<
              RouterType,
              ParamsIt<RouterType>
            >,
          )
        }
      }
      if (streamControllerRef.current) {
        streamControllerRef.current.close()
      }
      isClosed = true
    })

    ws.addEventListener('error', (event) => {
      isOpen = false
      if (!isClosed) {
        if (streamControllerRef.current) {
          streamControllerRef.current.error(
            new Error(
              `WebSocket error: ${'message' in event ? event.message : 'Unknown error'}`,
            ),
          )
        }
        ws.close()
      }
    })

    const send = async <
      Params extends ParamsIt<RouterType>,
    >(
      sendParams: Params,
    ): Promise<void> => {
      if (isClosed) {
        throwClientError(new Error('Connection is closed'))
      }
      if (!isOpen) {
        await openPromise
      }
      if (ws.readyState !== WebSocket.OPEN) {
        throwClientError(new Error('WebSocket is not open'))
      }
      await sendInitialParams(
        sendParams,
        [],
        encoder,
        (message) => ws.send(message),
      )
    }

    const close = (): void => {
      if (isClosed) {
        return
      }
      isClosed = true
      ws.close()
      if (streamControllerRef.current) {
        streamControllerRef.current.close()
      }
    }

    const waitForStream = createWaitForStreamFunction(
      streamControllerRef,
      streamResolverRef,
    )
    processQueueAfterStreamReady(
      waitForStream,
      streamControllerRef.current,
      messageQueue,
    )

    return {
      stream: createStreamGenerator(stream),
      send,
      close,
    }
  }
}
