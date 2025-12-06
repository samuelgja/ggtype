import {
  StreamMessageType,
  type ClientActionsBase,
  type Router,
  type ServerActionsBase,
  type StreamMessage,
} from '../../router.type'
import type {
  BidirectionalConnection,
  ParamsIt,
  ResultForWithActionResult,
  RouterClientState,
  WebsocketOptions,
} from '../router-client.types'
import { readable } from '../../../utils/readable'
import { Parser } from '../../transports/handle-stream'
import {
  createErrorProcessor,
  createStreamGenerator,
  createWaitForStreamFunction,
  handleClientActionCall,
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
        new Error('websocketURL is required'),
      )
    }

    const encoder = new TextEncoder()
    const ws = new WebSocket(websocketURL!)
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
      if (isClosed || !(data instanceof Uint8Array)) {
        return
      }

      const messages = await parser.feed(data)
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

    ws.addEventListener('error', () => {
      isOpen = false
      if (!isClosed) {
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
