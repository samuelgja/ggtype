import {
  NOOP_ON_ERROR,
  type RouterResultNotGeneric,
} from '../types'
import { createId } from '../utils/create-id'
import { handleError } from '../utils/handle-error'
import { hasStreamData } from '../utils/is'
import { readable } from '../utils/readable'
import { JSONL } from '../utils/stream-helpers'
import {
  UPLOAD_FILE,
  type BidirectionalConnection,
  type DuplexActionsProxyType,
  type DuplexOptions,
  type FetchActionsProxyType,
  type FetchOptions,
  type ParamsIt,
  type ResultForWithActionResult,
  type RouterClientOptions,
  type RouterClientState,
  type StreamActionsProxyType,
  type WebsocketOptions,
} from './router.client.types'
import {
  StreamMessageType,
  type ClientActionsBase,
  type Router,
  type ServerActionsBase,
  type StreamMessage,
} from './router.type'
import { handleHttpClient } from './transports/handle-http-client'
import {
  handleStreamResponse,
  Parser,
  parseStreamResponse,
} from './transports/handle-stream'

async function* createStreamGenerator<T>(
  stream: ReadableStream<T>,
): AsyncGenerator<T, void, unknown> {
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      if (value !== undefined) {
        yield value
      }
    }
  } finally {
    reader.releaseLock()
  }
}

async function handleClientActionCall(
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

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }
  if (typeof error === 'string') {
    return new Error(error)
  }
  return new Error('Unknown client error')
}

function createWaitForStreamFunction(
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

function processQueueAfterStreamReady(
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

export function createRouterClient<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(options: RouterClientOptions<RouterType>) {
  const {
    defineClientActions,
    halfDuplexUrl,
    httpURL,
    onResponse,
    onError = NOOP_ON_ERROR,
    streamURL,
    websocketURL,
  } = options

  type ResultForLocal<Params extends ParamsIt<RouterType>> =
    ResultForWithActionResult<RouterType, Params>

  function streamMessageToResult<
    Params extends ParamsIt<RouterType>,
  >(item: StreamMessage): ResultForLocal<Params> | null {
    if (!hasStreamData(item)) {
      return null
    }

    if (item.status === 'ok') {
      return {
        [item.action]: {
          data: item.file ?? item.data,
          status: item.status,
        },
      } as ResultForLocal<Params>
    }

    if (item.status === 'error') {
      return {
        [item.action]: {
          error: item.error,
          status: item.status,
        },
      } as ResultForLocal<Params>
    }

    return null
  }

  async function sendInitialParams(
    params: ParamsIt<RouterType>,
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

  const state: RouterClientState = {
    defaultHeaders: new Headers(),
    onError,
  }

  async function onResponseHook<
    Params extends ParamsIt<RouterType>,
  >(onResponseHookOptions: {
    json: ResultForWithActionResult<RouterType, Params>
    statusCode: number
    runAgain: <
      NewParams extends ParamsIt<RouterType> = Params,
    >(
      newParams?: NewParams,
      newOptions?: FetchOptions<RouterType>,
    ) => Promise<
      ResultForWithActionResult<RouterType, NewParams>
    >
  }): Promise<
    ResultForWithActionResult<
      RouterType,
      ParamsIt<RouterType>
    >
  > {
    const { json, statusCode, runAgain } =
      onResponseHookOptions
    if (onResponse) {
      const modifiedJson = await onResponse({
        json,
        statusCode,
        runAgain,
      })
      if (modifiedJson !== undefined) {
        return modifiedJson
      }
    }
    return json
  }

  const processError = (error: unknown): Error => {
    const normalized = normalizeError(error)
    return state.onError(normalized)
  }

  const throwClientError = (error: unknown): never => {
    throw processError(error)
  }

  const executeFetch = async <
    Params extends ParamsIt<RouterType>,
  >(
    params: Params,
    fetchOptions?: FetchOptions<RouterType>,
  ): Promise<ResultForLocal<Params>> => {
    if (!httpURL) {
      throwClientError(new Error('httpURL is required'))
    }

    const runAgain = <
      NewParams extends ParamsIt<RouterType> = Params,
    >(
      newParams?: NewParams,
      newOptions?: FetchOptions<RouterType>,
    ): Promise<ResultForLocal<NewParams>> => {
      if (newParams !== undefined) {
        return executeFetch(
          newParams as unknown as Params,
          newOptions ?? fetchOptions,
        ) as Promise<ResultForLocal<NewParams>>
      }
      if (newOptions !== undefined) {
        return executeFetch(params, newOptions) as Promise<
          ResultForLocal<NewParams>
        >
      }
      return executeFetch(params, fetchOptions) as Promise<
        ResultForLocal<NewParams>
      >
    }

    try {
      const response = await handleHttpClient(
        httpURL!,
        params,
        fetchOptions,
        state.defaultHeaders,
      )
      if (!response.ok) {
        throw new Error(
          `HTTP request failed: ${response.status} ${response.statusText}`,
        )
      }
      const json = await response.json()
      return await onResponseHook({
        json,
        statusCode: response.status,
        runAgain,
      })
    } catch (error) {
      throwClientError(error)
      // This line is never reached, but TypeScript needs it for type checking
      throw new Error('Unreachable')
    }
  }

  const client = {
    /**
     * Sets headers to be included in all requests.
     * Call with an object to set headers, or with no arguments to reset headers.
     * @param newHeaders - Optional headers object. If not provided, headers are reset.
     */
    setHeaders(newHeaders?: Record<string, string>): void {
      state.defaultHeaders = new Headers(
        newHeaders ?? undefined,
      )
    },

    async fetch<Params extends ParamsIt<RouterType>>(
      params: Params,
      fetchOptions?: FetchOptions<RouterType>,
    ): Promise<ResultForLocal<Params>> {
      return executeFetch(params, fetchOptions)
    },
    async *stream<Params extends ParamsIt<RouterType>>(
      params: Params,
      fetchOptions?: FetchOptions<RouterType>,
    ): AsyncGenerator<ResultForLocal<Params>> {
      if (!streamURL) {
        throwClientError(new Error('streamURL is required'))
      }

      let response: Response
      try {
        response = await handleHttpClient(
          streamURL!,
          params,
          fetchOptions,
          state.defaultHeaders,
        )
      } catch (error) {
        throwClientError(error)
      }
      // TypeScript control flow: response is definitely assigned here
      // because throwClientError never returns
      const finalResponse = response!
      if (!finalResponse.ok) {
        throwClientError(
          `HTTP request failed: ${finalResponse.status} ${finalResponse.statusText}`,
        )
      }
      const reader = finalResponse.body?.getReader()
      if (!reader) {
        throwClientError(
          new Error('Reader is not available'),
        )
      }
      const stream = parseStreamResponse(
        reader as ReadableStreamDefaultReader<Uint8Array>,
      )
      for await (const item of stream) {
        const result = streamMessageToResult<Params>(item)
        if (result) {
          yield result
        }
      }
    },

    async *duplex<Params extends ParamsIt<RouterType>>(
      params: Params,
      fetchOptions?: DuplexOptions<RouterType>,
    ): AsyncGenerator<ResultForLocal<Params>> {
      const {
        defineClientActions: maybeClientActions,
        files = [],
      } = fetchOptions ?? {}
      const clientActions = {
        ...defineClientActions,
        ...maybeClientActions,
      }
      if (!halfDuplexUrl) {
        throwClientError(
          new Error('halfDuplexUrl is required'),
        )
      }

      const url = new URL(halfDuplexUrl!)

      const encoder = new TextEncoder()
      let controller:
        | ReadableStreamDefaultController<unknown>
        | undefined = undefined
      const readableStream = readable({
        async start(c) {
          controller = c
          await sendInitialParams(
            params,
            files,
            encoder,
            (message) => controller?.enqueue(message),
          )
        },
      })
      const headers = new Headers(state.defaultHeaders)
      let response: Response
      try {
        response = await fetch(url, {
          method: 'POST',
          body: readableStream,
          headers,
        })
      } catch (error) {
        throwClientError(error)
      }
      // TypeScript: response is definitely assigned because throwClientError never returns
      const finalResponse = response!
      const reader = finalResponse.body?.getReader()
      if (!reader) {
        throwClientError(
          new Error('Reader is not available'),
        )
      }
      const stream = parseStreamResponse(
        reader as ReadableStreamDefaultReader<Uint8Array>,
      )
      let isControllerClosed = false

      const duplexSendFunction = (message: Uint8Array) => {
        if (!controller || isControllerClosed) {
          throwClientError(
            new Error('Controller is not available'),
          )
        }
        // TypeScript: controller is defined after the check above
        controller!.enqueue(message)
      }

      const processDuplexStreamItem = async (
        item: StreamMessage,
      ): Promise<ResultForLocal<Params> | null> => {
        const handled = await handleClientActionCall(
          item,
          clientActions as Record<
            string,
            (params: unknown) => Promise<unknown>
          >,
          encoder,
          duplexSendFunction,
          state.onError,
        )
        if (handled) {
          return null
        }

        const result = streamMessageToResult<Params>(item)
        if (
          item.isLast &&
          controller &&
          !isControllerClosed
        ) {
          isControllerClosed = true
          ;(controller as { close: () => void }).close()
        }

        return result
      }

      const closeDuplexController = (): void => {
        if (controller && !isControllerClosed) {
          try {
            isControllerClosed = true
            ;(controller as { close: () => void }).close()
          } catch {
            // Controller might already be closed
          }
        }
      }

      try {
        for await (const item of stream) {
          const result = await processDuplexStreamItem(item)
          if (result) {
            yield result
          }
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          // Stream was closed, but we might have already processed the error
          // Let the error propagate if we haven't yielded anything
        } else {
          throw error
        }
      } finally {
        closeDuplexController()
      }
    },

    async *websocket<Params extends ParamsIt<RouterType>>(
      params: Params,
      websocketOptions?: WebsocketOptions<RouterType>,
    ): AsyncGenerator<ResultForLocal<Params>> {
      const {
        defineClientActions: maybeClientActions,
        files = [],
      } = websocketOptions ?? {}

      const clientActions = {
        ...defineClientActions,
        ...maybeClientActions,
      }
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
          ws.close()
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
          controller.enqueue(result)
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
        // eslint-disable-next-line unicorn/consistent-function-scoping
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
          ws.close()
        }
      }

      const stream = readable({
        async start(controller) {
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
            ws.close()
          })
        },
      })
      const streamGenerator = createStreamGenerator(
        stream as ReadableStream<
          ResultForWithActionResult<RouterType, Params>
        >,
      )
      for await (const item of streamGenerator) {
        yield item
      }
    },

    startWebsocket(
      websocketOptions?: WebsocketOptions<RouterType>,
    ): BidirectionalConnection<RouterType> {
      const {
        defineClientActions: maybeClientActions,
        files = [],
      } = websocketOptions ?? {}

      const clientActions = {
        ...defineClientActions,
        ...maybeClientActions,
      }
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
        start(controller) {
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
            streamControllerRef.current.enqueue(result)
          } else {
            messageQueue.push(result)
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
            streamMessageToResult<ParamsIt<RouterType>>(
              item,
            )
          if (result && streamControllerRef.current) {
            streamControllerRef.current.enqueue(result)
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
          throwClientError(
            new Error('Connection is closed'),
          )
        }
        if (!isOpen) {
          await openPromise
        }
        if (ws.readyState !== WebSocket.OPEN) {
          throwClientError(
            new Error('WebSocket is not open'),
          )
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
    },

    startDuplex(
      duplexOptions?: DuplexOptions<RouterType>,
    ): BidirectionalConnection<RouterType> {
      const {
        defineClientActions: maybeClientActions,
        files = [],
      } = duplexOptions ?? {}

      const clientActions = {
        ...defineClientActions,
        ...maybeClientActions,
      }
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
        start(controller) {
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
            (message) =>
              requestController?.enqueue(message),
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
            streamControllerRef.current.enqueue(result)
          } else {
            messageQueue.push(result)
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

        const parsedStream =
          parseStreamResponse(typedReader)
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
          throwClientError(
            new Error('Connection is closed'),
          )
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
    },
  }

  return {
    ...client,
    fetchActions:
      createFetchActionsProxy<RouterType>(executeFetch),
    streamActions: createStreamActionsProxy<RouterType>(
      async function* (params, streamOptions) {
        yield* client.stream(params, streamOptions)
      },
    ),
    duplexActions: createDuplexActionsProxy<RouterType>(
      async function* (params, duplexOptions) {
        yield* client.duplex(params, duplexOptions)
      },
    ),
  }
}

function createFetchActionsProxy<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(
  executeFetch: <Params extends ParamsIt<RouterType>>(
    params: Params,
    fetchOptions?: FetchOptions<RouterType>,
  ) => Promise<
    ResultForWithActionResult<RouterType, Params>
  >,
): FetchActionsProxyType<RouterType> {
  return new Proxy(
    {} as FetchActionsProxyType<RouterType>,
    {
      get(_target, actionName: string | symbol) {
        if (typeof actionName !== 'string') {
          return
        }
        return async (
          params: unknown,
          options?: FetchOptions<RouterType>,
        ) => {
          const wrapped = await executeFetch(
            {
              [actionName]: params,
            } as unknown as ParamsIt<RouterType>,
            options,
          )
          return wrapped[actionName]
        }
      },
    },
  ) as FetchActionsProxyType<RouterType>
}

function createStreamActionsProxy<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(
  streamFn: <Params extends ParamsIt<RouterType>>(
    params: Params,
    options?: FetchOptions<RouterType>,
  ) => AsyncGenerator<
    ResultForWithActionResult<RouterType, Params>
  >,
): StreamActionsProxyType<RouterType> {
  return new Proxy(
    {} as StreamActionsProxyType<RouterType>,
    {
      get(_target, actionName: string | symbol) {
        if (typeof actionName !== 'string') {
          return
        }
        return async function* (
          params: unknown,
          options?: FetchOptions<RouterType>,
        ) {
          for await (const wrapped of streamFn(
            {
              [actionName]: params,
            } as unknown as ParamsIt<RouterType>,
            options,
          )) {
            yield wrapped[actionName]
          }
        }
      },
    },
  ) as StreamActionsProxyType<RouterType>
}

function createDuplexActionsProxy<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(
  duplexFn: <Params extends ParamsIt<RouterType>>(
    params: Params,
    options?: DuplexOptions<RouterType>,
  ) => AsyncGenerator<
    ResultForWithActionResult<RouterType, Params>
  >,
): DuplexActionsProxyType<RouterType> {
  return new Proxy(
    {} as DuplexActionsProxyType<RouterType>,
    {
      get(_target, actionName: string | symbol) {
        if (typeof actionName !== 'string') {
          return
        }
        return async function* (
          params: unknown,
          options?: DuplexOptions<RouterType>,
        ) {
          for await (const wrapped of duplexFn(
            {
              [actionName]: params,
            } as unknown as ParamsIt<RouterType>,
            options,
          )) {
            yield wrapped[actionName]
          }
        }
      },
    },
  ) as DuplexActionsProxyType<RouterType>
}
