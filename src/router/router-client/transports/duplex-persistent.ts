import type {
  ClientActionsBase,
  Router,
  ServerActionsBase,
  StreamMessage,
} from '../../router.type'
import type {
  BidirectionalConnection,
  DuplexOptions,
  ParamsIt,
  ResultForWithActionResult,
  RouterClientState,
} from '../router-client.types'
import { readable } from '../../../utils/readable'
import { parseStreamResponse } from '../../transports/handle-stream'
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

export function createDuplexPersistent<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(options: {
  halfDuplexUrl?: string | URL
  state: RouterClientState
  defineClientActions?: Record<
    string,
    (params: unknown) => Promise<unknown>
  >
}) {
  const { halfDuplexUrl, state, defineClientActions } =
    options
  const { throwClientError } = createErrorProcessor(
    state.onError,
  )

  return (
    duplexOptions?: DuplexOptions<RouterType>,
  ): BidirectionalConnection<RouterType> => {
    const {
      defineClientActions: maybeClientActions,
      files = [],
    } = duplexOptions ?? {}

    const clientActions = mergeClientActions(
      defineClientActions,
      maybeClientActions,
    )
    if (!halfDuplexUrl) {
      throwClientError(
        new Error('halfDuplexUrl is required'),
      )
    }

    const url = new URL(halfDuplexUrl!)
    const encoder = new TextEncoder()
    let isClosed = false
    let requestController:
      | ReadableStreamDefaultController<unknown>
      | undefined
    let responseReader: ReadableStreamDefaultReader<Uint8Array> | null =
      null

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

    const readableStream = readable({
      async start(controller) {
        requestController = controller
        await sendInitialParams(
          {} as ParamsIt<RouterType>,
          files,
          encoder,
          (message) => requestController?.enqueue(message),
        )
      },
    })

    const processMessage = async (
      item: StreamMessage,
    ): Promise<void> => {
      if (isClosed) {
        return
      }
      if (
        await handleClientActionCall(
          item,
          clientActions as Record<
            string,
            (params: unknown) => Promise<unknown>
          >,
          encoder,
          (message) => {
            if (!requestController) {
              throwClientError(
                new Error('Controller is not available'),
              )
            }
            // TypeScript: requestController is defined after the check above
            requestController!.enqueue(message)
          },
          state.onError,
        )
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

    const startReading = async (): Promise<void> => {
      const headers = new Headers(state.defaultHeaders)
      const response = await fetch(url, {
        method: 'POST',
        body: readableStream,
        headers,
      })

      const reader = response.body?.getReader()
      if (!reader) {
        throwClientError(
          new Error('Reader is not available'),
        )
      }
      responseReader =
        reader as ReadableStreamDefaultReader<Uint8Array>
      const typedReader =
        reader as ReadableStreamDefaultReader<Uint8Array>

      const parsedStream = parseStreamResponse(typedReader)
      for await (const item of parsedStream) {
        if (isClosed) {
          break
        }
        await processMessage(item)
      }
    }

    startReading().catch((error) => {
      if (streamControllerRef.current && !isClosed) {
        streamControllerRef.current.error(error)
      }
    })

    const send = async <
      Params extends ParamsIt<RouterType>,
    >(
      sendParams: Params,
    ): Promise<void> => {
      if (isClosed || !requestController) {
        throwClientError(new Error('Connection is closed'))
      }
      await sendInitialParams(
        sendParams,
        [],
        encoder,
        (message) => requestController?.enqueue(message),
      )
    }

    const close = (): void => {
      if (isClosed) {
        return
      }
      isClosed = true
      if (requestController) {
        ;(
          requestController as { close: () => void }
        ).close()
      }
      if (responseReader) {
        responseReader.cancel()
      }
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
