/* eslint-disable sonarjs/cognitive-complexity */
import type { ActionNotGeneric } from '../action/action'
import {
  NOOP_ON_ERROR,
  type ActionResult,
  type RouterResultNotGeneric,
} from '../types'
import { handleError } from '../utils/handle-error'
import {
  isRouterMessage,
  type RouterMessage,
} from './router-message'
import { DEFAULT_ROUTER_TIMEOUT } from '../types'
import { AsyncStream } from '../utils/async-stream'
import { clearMap } from '../utils/clear-map'
import { createId } from '../utils/create-id'
import {
  isErrorResult,
  isHttpTransport,
  isStreamTransport,
  isWsTransport,
} from '../utils/is'
import { createController } from '../utils/stream-helpers'
import type { ClientAction } from './router-client.types-shared'
import type { Router } from '../types'
import type {
  RouterClientOptions,
  FetchOptions,
  ParamsIt,
  ResultForWithActionResult,
} from './router-client.types'
import {
  HttpStreamTransport,
  WebSocketConnectionManager,
} from '../transport'

// Re-export types and utilities
export { hasStatusCode } from './router-client.types'
export type {
  ParamsIt,
  ResultFor,
  ResultForWithActionResult,
  RouterClientOptions,
  FetchOptions,
} from './router-client.types'

/**
 * Handles an error by throwing it if it's not a stream closing error.
 * @param error - The error to handle
 */
function handleThisError(error: unknown) {
  // If there's an error, we still return what we've collected so far
  // The error will have been handled by onError
  if (error instanceof Error) {
    const errorMessage = error.message
    const isStreamClosingError =
      errorMessage.includes('closing') ||
      errorMessage.includes('closed') ||
      errorMessage.includes('stream is closing')
    if (!isStreamClosingError) {
      throw error
    }
  } else {
    throw error
  }
}
/**
 * Creates a router client for communicating with a router server.
 * The client handles sending requests to the server, waiting for responses,
 * and processing streaming results. Supports HTTP, HTTP stream, and WebSocket transports.
 * Client actions can be called from the server, enabling bidirectional RPC communication.
 * @template R - The router type
 * @param options - Router client configuration options
 * @returns A router client with fetch and stream methods for executing server actions
 * @example
 * ```ts
 * import { createRouterClient } from 'ggtype'
 *
 * // Create client with HTTP transport
 * const client = createRouterClient({
 *   url: 'http://localhost:3000',
 *   transport: 'http',
 *   defineClientActions: {
 *     showNotification: async (params) => {
 *       alert(params.message)
 *       return { acknowledged: true }
 *     },
 *   },
 * })
 *
 * // Use fetch() to wait for all results
 * const results = await client.fetch({
 *   getUser: { id: '123' },
 *   createUser: { id: '456', name: 'John' },
 * })
 *
 * if (results.getUser?.status === 'ok') {
 *   console.log('User:', results.getUser.data)
 * }
 *
 * // Use stream() for incremental results
 * const stream = await client.stream({
 *   getUser: { id: '123' },
 * })
 *
 * for await (const result of stream) {
 *   if (result.getUser?.status === 'ok') {
 *     console.log('User:', result.getUser.data)
 *   }
 * }
 * ```
 */
export function createRouterClient<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
>(options: RouterClientOptions<R>) {
  const {
    url,
    responseTimeout = DEFAULT_ROUTER_TIMEOUT,
    defineClientActions,
    onError,
    onRequest,
    onResponse,
    transport: transportType = 'stream',
  } = options

  // Extract transport-specific options
  const httpMethod =
    isHttpTransport(transportType) && 'method' in options
      ? options.method
      : undefined
  const httpKeepAlive =
    isHttpTransport(transportType) && 'keepAlive' in options
      ? (options.keepAlive ?? false)
      : false
  const streamKeepAlive =
    isStreamTransport(transportType) &&
    'keepAlive' in options
      ? (options.keepAlive ?? true)
      : true
  const maxReconnectAttempts =
    (isStreamTransport(transportType) ||
      isWsTransport(transportType)) &&
    'maxReconnectAttempts' in options
      ? (options.maxReconnectAttempts ?? 5)
      : undefined
  const initialReconnectDelay =
    (isStreamTransport(transportType) ||
      isWsTransport(transportType)) &&
    'initialReconnectDelay' in options
      ? (options.initialReconnectDelay ?? 1000)
      : undefined
  const maxReconnectDelay =
    (isStreamTransport(transportType) ||
      isWsTransport(transportType)) &&
    'maxReconnectDelay' in options
      ? (options.maxReconnectDelay ?? 30_000)
      : undefined
  const connectionTimeout =
    (isStreamTransport(transportType) ||
      isWsTransport(transportType)) &&
    'connectionTimeout' in options
      ? (options.connectionTimeout ?? responseTimeout)
      : undefined

  const waitingResponses = clearMap<
    string,
    (data: RouterMessage) => void
  >({
    expiresMs: responseTimeout,
    checkIntervalMs: responseTimeout,
    getKey: (key) => key,
  })

  // Headers storage
  let headers: Record<string, string> = {}

  // Create connection manager for persistent WebSocket connections
  const websocketConnectionManager = isWsTransport(
    transportType,
  )
    ? new WebSocketConnectionManager(
        url,
        responseTimeout,
        onError,
        maxReconnectAttempts,
        initialReconnectDelay,
        maxReconnectDelay,
        connectionTimeout,
      )
    : null

  /**
   * Processes incoming client data messages from the server.
   * Looks up waiting response handlers by message ID and invokes them with the message.
   * Handles error cases like invalid message format, error messages, and orphaned messages.
   * @param message - The router message to process
   * @param waitingResponsesMap - Map of waiting response handlers keyed by message ID
   */
  function processClientData(
    message: RouterMessage,
    waitingResponsesMap: ReturnType<
      typeof clearMap<string, (data: RouterMessage) => void>
    >,
  ) {
    if (!isRouterMessage(message)) {
      onError?.(
        new Error('Invalid message format', {
          cause: message,
        }),
      )
      return
    }

    const callResponse = waitingResponsesMap.get(message.id)
    if (callResponse) {
      callResponse(message)
      return
    }

    if (message.status === 'error') {
      onError?.(
        new Error('Error message received', {
          cause: message,
        }),
      )
      return
    }

    onError?.(
      new Error(
        'No waiting response for message: ' + message.id,
        { cause: message },
      ),
    )
  }

  // Set up message processor for WebSocket connection manager
  if (websocketConnectionManager) {
    websocketConnectionManager.setMessageProcessor(
      (message) => {
        processClientData(message, waitingResponses)
      },
    )
  }

  type ResultForLocal<Params extends ParamsIt<R>> =
    ResultForWithActionResult<R, Params>

  // Create client object first so methods can reference each other
  const client = {
    /**
     * Sets headers to be included in all requests.
     * Call with an object to set headers, or with no arguments to reset headers.
     * @param newHeaders - Optional headers object. If not provided, headers are reset.
     */
    setHeaders(newHeaders?: Record<string, string>): void {
      headers =
        newHeaders === undefined ? {} : { ...newHeaders }
    },
    /**
     * Fetches results for multiple actions, waiting for all to complete.
     * Returns a Promise that resolves with the final result state.
     * @template Params - The parameters type
     * @param params - Object with action names as keys and their parameters as values
     * @param fetchOptions - Optional fetch options including files and client actions
     * @returns A Promise that resolves to the final result state
     */
    async fetch<Params extends ParamsIt<R>>(
      params: Params,
      fetchOptions?: FetchOptions<R>,
    ): Promise<ResultForLocal<Params>> {
      const requestClientActions =
        fetchOptions?.defineClientActions
      const mergedClientActions: Record<string, unknown> =
        {}
      if (defineClientActions) {
        Object.assign(
          mergedClientActions,
          defineClientActions,
        )
      }
      if (requestClientActions) {
        Object.assign(
          mergedClientActions,
          requestClientActions,
        )
      }

      // Create runAgain function for onRequest hook
      const runAgain = async (): Promise<
        ResultForWithActionResult<R, Params>
      > => {
        return client.fetch(params, fetchOptions)
      }

      // Apply onRequest hook if provided
      let requestParams: Params = params
      if (onRequest) {
        const modifiedParams = await onRequest({
          params,
          runAgain,
        })
        if (modifiedParams !== undefined) {
          requestParams = modifiedParams
        }
      }

      let stream: AsyncStream<ResultForLocal<Params>>

      if (isHttpTransport(transportType)) {
        const method =
          fetchOptions?.method ?? httpMethod ?? 'GET'
        stream = await handleHttpTransport<R, Params>(
          url,
          requestParams,
          headers,
          onError,
          method,
          httpKeepAlive,
        )
      } else if (isWsTransport(transportType)) {
        stream = await handleWebSocketTransport<R, Params>({
          connectionManager: websocketConnectionManager!,
          params: requestParams,
          defineClientActions: mergedClientActions,
          waitingResponses,
        })
      } else {
        const method = fetchOptions?.method ?? 'POST'
        stream = await handleStreamTransport<R, Params>({
          url,
          params: requestParams,
          defineClientActions: mergedClientActions,
          waitingResponses,
          processClientData,
          headers,
          onError,
          method,
          keepAlive: streamKeepAlive,
        })
      }

      // Collect all results from the stream and return the final state
      const result: ResultForLocal<Params> =
        {} as ResultForLocal<Params>
      try {
        for await (const chunk of stream) {
          // Merge each chunk into the result, keeping the latest value for each action
          for (const key in chunk) {
            if (
              Object.prototype.hasOwnProperty.call(
                chunk,
                key,
              )
            ) {
              ;(result as Record<string, unknown>)[key] = (
                chunk as Record<string, unknown>
              )[key]
            }
          }
        }
      } catch (error) {
        handleThisError(error)
      }

      // Apply onResponse hook if provided
      if (onResponse) {
        try {
          const responseRunAgain = async (
            newParams?: Params,
            newOptions?: FetchOptions<R>,
          ): Promise<ResultForLocal<Params>> => {
            return client.fetch(
              newParams ?? params,
              newOptions ?? fetchOptions,
            )
          }
          const modifiedResult = await onResponse({
            json: result,
            runAgain: responseRunAgain,
          })
          if (modifiedResult !== undefined) {
            return modifiedResult as ResultForLocal<Params>
          }
        } catch (error) {
          handleThisError(error)
        }
      }

      return result
    },

    /**
     * Streams results for multiple actions as they arrive.
     * Returns an AsyncStream that yields results incrementally.
     * @template Params - The parameters type
     * @param params - Object with action names as keys and their parameters as values
     * @param streamOptions - Optional stream options including files and client actions
     * @returns An AsyncStream that yields results as they arrive
     */
    async stream<Params extends ParamsIt<R>>(
      params: Params,
      streamOptions?: FetchOptions<R>,
    ): Promise<AsyncStream<ResultForLocal<Params>>> {
      const requestClientActions =
        streamOptions?.defineClientActions
      const mergedClientActions: Record<string, unknown> =
        {}
      if (defineClientActions) {
        Object.assign(
          mergedClientActions,
          defineClientActions,
        )
      }
      if (requestClientActions) {
        Object.assign(
          mergedClientActions,
          requestClientActions,
        )
      }

      // Create runAgain function for onRequest hook
      const runAgain = async (): Promise<
        ResultForWithActionResult<R, Params>
      > => {
        return client.fetch(params, streamOptions)
      }

      // Apply onRequest hook if provided
      let requestParams: Params = params
      if (onRequest) {
        const modifiedParams = await onRequest({
          params,
          runAgain,
        })
        if (modifiedParams !== undefined) {
          requestParams = modifiedParams
        }
      }

      if (isHttpTransport(transportType)) {
        const method =
          streamOptions?.method ?? httpMethod ?? 'GET'
        return handleHttpTransport<R, Params>(
          url,
          requestParams,
          headers,
          onError,
          method,
          httpKeepAlive,
        )
      }

      if (isWsTransport(transportType)) {
        return handleWebSocketTransport<R, Params>({
          connectionManager: websocketConnectionManager!,
          params: requestParams,
          defineClientActions: mergedClientActions,
          waitingResponses,
        })
      }

      const method = streamOptions?.method ?? 'POST'
      return handleStreamTransport<R, Params>({
        url,
        params: requestParams,
        defineClientActions: mergedClientActions,
        waitingResponses,
        processClientData,
        headers,
        onError,
        method,
        keepAlive: streamKeepAlive,
      })
    },
  }

  return client
}

/**
 * Handles plain HTTP transport for router client communication.
 * Sends an HTTP request (default GET with query params, or POST/PUT/PATCH/DELETE with JSON body) and returns a single JSON response.
 * @template Params - The parameters type
 * @param url - The server URL to connect to
 * @param params - The action parameters to send
 * @param headers - Headers to include in the request
 * @param onError - Optional error handler
 * @param method - HTTP method to use (default: 'GET')
 * @param keepAlive - Whether to use HTTP keep-alive connections (default: false)
 * @returns An AsyncStream that yields the result once and closes
 */
async function handleHttpTransport<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
>(
  url: string | URL,
  params: Params,
  headers: Record<string, string>,
  onError: ((error: Error) => void) | undefined,
  method:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE' = 'GET',
  keepAlive: boolean = false,
): Promise<
  AsyncStream<{
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }>
> {
  type Result = {
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }

  return new AsyncStream<Result>({
    async start(controller) {
      try {
        const urlObject =
          typeof url === 'string' ? new URL(url) : url
        const isGet = method === 'GET'

        if (isGet) {
          // For GET requests, encode params as query parameter
          urlObject.searchParams.set(
            'q',
            JSON.stringify(params),
          )
        }

        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...headers,
        }
        if (keepAlive) {
          requestHeaders['Connection'] = 'keep-alive'
        }

        const response = await fetch(urlObject, {
          method,
          headers: requestHeaders,
          body: isGet ? undefined : JSON.stringify(params),
        })

        if (!response.ok) {
          throw new Error(
            `HTTP request failed: ${response.status} ${response.statusText}`,
          )
        }

        const result = (await response.json()) as Result
        controller.enqueue(result)
        controller.close()
      } catch (error) {
        onError?.(
          error instanceof Error
            ? error
            : new Error('HTTP request error'),
        )
        controller.error(
          error instanceof Error
            ? error
            : new Error('HTTP request error'),
        )
      }
    },
  })
}

interface HandleStreamTransportOptions<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
> {
  url: string | URL
  params: Params
  defineClientActions: Record<string, unknown>
  waitingResponses: ReturnType<
    typeof clearMap<string, (data: RouterMessage) => void>
  >
  processClientData: (
    message: RouterMessage,
    waitingResponsesMap: ReturnType<
      typeof clearMap<string, (data: RouterMessage) => void>
    >,
  ) => void
  headers: Record<string, string>
  onError: ((error: Error) => void) | undefined
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  keepAlive?: boolean
}

/**
 * Handles HTTP stream transport for router client communication.
 * Creates a bidirectional stream, sends requests to the server, and processes responses.
 * Manages message encoding/decoding, response waiting, and error handling for stream transport.
 * Each stream() call creates a new long-lived HTTP stream connection.
 * @template Params - The parameters type
 * @param options - Stream transport options
 * @param options.url - The server URL to connect to
 * @param options.params - The action parameters to send
 * @param options.defineClientActions - Merged client action handlers (client-level + request-level)
 * @param options.waitingResponses - Map for tracking waiting responses
 * @param options.processClientData - Function to process incoming client data
 * @param options.headers - Headers to include in the request
 * @param options.onError - Optional error handler
 * @param options.method - HTTP method to use (default: 'POST', stream transport requires methods that support request bodies)
 * @returns An AsyncStream of results
 */
async function handleStreamTransport<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
>(
  options: HandleStreamTransportOptions<R, Params>,
): Promise<
  AsyncStream<{
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }>
> {
  const {
    url,
    params,
    defineClientActions,
    waitingResponses,
    processClientData,
    headers,
    onError,
    method = 'POST',
    keepAlive = true,
  } = options
  const { readable, writable } = new TransformStream<
    Uint8Array,
    Uint8Array
  >()
  const writeTransport = new HttpStreamTransport(
    null,
    writable,
  )

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/octet-stream',
    ...headers,
  }
  if (keepAlive) {
    requestHeaders['Connection'] = 'keep-alive'
  }

  const responsePromise = fetch(url, {
    method,
    headers: requestHeaders,
    body: readable,
    duplex: 'half',
  } as RequestInit)

  type Result = {
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }

  const stream = new AsyncStream<Result>({
    async start(control) {
      const controller = createController(control)
      const finishedCount = { value: 0 }
      const entryNames = Object.keys(params) as Array<
        keyof Params
      >
      const count = entryNames.length
      let isWriterClosed = false

      const closeWriter = async () => {
        if (isWriterClosed) {
          return
        }
        isWriterClosed = true
        await writeTransport.close().catch(() => {
          // Ignore close errors
        })
      }

      if (count === 0) {
        controller.close()
        await closeWriter()
        return
      }

      /**
       * Creates a message handler for processing incoming router messages for a specific action.
       * Handles both regular responses and client action calls, managing response completion and cleanup.
       * @param actionName - The name of the action this handler is for
       * @param id - The message ID to track
       * @returns An async function that processes incoming messages
       */
      function createMessageHandler(
        actionName: keyof Params,
        id: string,
      ) {
        return async (incomingMessage: RouterMessage) => {
          if (incomingMessage.clientId) {
            try {
              const clientAction = defineClientActions[
                incomingMessage.action
              ] as (data: unknown) => Promise<unknown>
              if (!clientAction) {
                throw new Error(
                  `Client action not found: ${incomingMessage.action}`,
                )
              }
              if (isErrorResult(incomingMessage)) {
                controller.enqueue({
                  [incomingMessage.action]:
                    incomingMessage.error,
                } as unknown as Result)
                return
              }

              const clientActionResult = await clientAction(
                incomingMessage.data,
              )

              const clientActionMessage: RouterMessage = {
                id: incomingMessage.id,
                action: incomingMessage.action,
                status: 'ok',
                data: clientActionResult,
                clientId: incomingMessage.clientId,
                bufferType:
                  clientActionResult instanceof File ||
                  clientActionResult instanceof Blob
                    ? 'file'
                    : undefined,
              }

              await writeTransport.write(
                clientActionMessage,
              )
            } catch (rawError) {
              const error = handleError(
                NOOP_ON_ERROR,
                rawError,
              )
              controller.enqueue({
                [incomingMessage.action]: error?.error,
              } as unknown as Result)
              const clientActionMessage: RouterMessage = {
                id: incomingMessage.id,
                action: incomingMessage.action,
                status: 'error',
                error: error?.error,
                clientId: incomingMessage.clientId,
              }
              try {
                await writeTransport.write(
                  clientActionMessage,
                )
              } catch (writeError) {
                // Ignore stream closing errors - the stream may be closing
                if (writeError instanceof Error) {
                  const errorMessage = writeError.message
                  if (
                    !errorMessage.includes('closing') &&
                    !errorMessage.includes('closed') &&
                    !errorMessage.includes(
                      'stream is closing',
                    ) &&
                    !errorMessage.includes(
                      'stream is closing or closed',
                    )
                  ) {
                    throw writeError
                  }
                } else {
                  throw writeError
                }
              }
            }
            return
          }

          const { isLast } = incomingMessage
          const isErrorAndNotClient =
            !incomingMessage.clientId &&
            isErrorResult(incomingMessage)
          const isFinish = isLast || isErrorAndNotClient

          const result: RouterResultNotGeneric = {
            status: incomingMessage.status,
            data: incomingMessage.data,
            error: incomingMessage.error,
          }
          controller.enqueue({
            [actionName]: result,
          } as Result)

          if (isFinish) {
            waitingResponses.delete(id)
            finishedCount.value++
            if (count === finishedCount.value) {
              controller.close()
              await closeWriter()
            }
          }
        }
      }

      /**
       * Creates a timeout handler for an action that triggers when the response timeout is exceeded.
       * Closes the controller with an error and manages cleanup when all actions are finished.
       * @param actionName - The name of the action this timeout handler is for
       * @returns A function that handles timeout errors
       */
      function createTimeoutHandler(
        actionName: keyof Params,
      ) {
        return () => {
          controller.error(
            new Error(
              'Timeout waiting for response for ' +
                String(actionName),
            ),
          )
          finishedCount.value++
          if (count === finishedCount.value) {
            closeWriter()
          }
        }
      }

      for (const actionName of entryNames) {
        const id = createId()
        const actionParams = params[actionName]
        const routerMessage: RouterMessage = {
          action: String(actionName),
          data: actionParams,
          id,
          status: 'ok',
          bufferType:
            actionParams instanceof File ||
            actionParams instanceof Blob
              ? 'file'
              : undefined,
        }

        await writeTransport.write(routerMessage)

        waitingResponses.add(
          id,
          createMessageHandler(actionName, id),
          createTimeoutHandler(actionName),
        )
      }

      try {
        const response = await responsePromise
        if (!response.ok || !response.body) {
          throw new Error(
            `HTTP request failed: ${response.status} ${response.statusText}`,
          )
        }

        const readTransport = new HttpStreamTransport(
          response.body,
          null,
        )

        const processResponse = async () => {
          try {
            while (true) {
              const message = await readTransport.read()
              if (message === null) {
                break
              }
              processClientData(message, waitingResponses)
            }
          } catch (error) {
            onError?.(
              error instanceof Error
                ? error
                : new Error('Stream error'),
            )
            controller.error(
              error instanceof Error
                ? error
                : new Error('Stream error'),
            )
          }
        }

        processResponse().catch((error) => {
          onError?.(
            error instanceof Error
              ? error
              : new Error('Stream processing error'),
          )
          controller.error(
            error instanceof Error
              ? error
              : new Error('Stream processing error'),
          )
        })
      } catch (error) {
        controller.close()
        await closeWriter()
        throw error
      }
    },
  })

  return stream
}

interface HandleWebSocketTransportOptions<
  Params extends ParamsIt<
    Router<
      Record<string, ActionNotGeneric>,
      Record<string, ClientAction>
    >
  >,
> {
  connectionManager: WebSocketConnectionManager
  params: Params
  defineClientActions: Record<string, unknown>
  waitingResponses: ReturnType<
    typeof clearMap<string, (data: RouterMessage) => void>
  >
}

/**
 * Handles WebSocket transport for router client communication.
 * Uses a persistent connection manager to send requests and process responses.
 * Manages message encoding/decoding, response waiting, error handling, and client action handling for WebSocket transport.
 * @template Params - The parameters type
 * @param options - WebSocket transport options
 * @param options.connectionManager - The WebSocket connection manager
 * @param options.params - The action parameters to send
 * @param options.defineClientActions - Merged client action handlers (client-level + request-level)
 * @param options.waitingResponses - Map for tracking waiting responses
 * @returns An AsyncStream of results
 */
async function handleWebSocketTransport<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
>(
  options: HandleWebSocketTransportOptions<Params>,
): Promise<
  AsyncStream<{
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }>
> {
  const {
    connectionManager,
    params,
    defineClientActions,
    waitingResponses,
  } = options

  type Result = {
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }

  return new AsyncStream<Result>({
    async start(control) {
      const controller = createController(control)
      const finishedCount = { value: 0 }
      const entryNames = Object.keys(params) as Array<
        keyof Params
      >
      const count = entryNames.length

      // Get or create connection
      const transport =
        await connectionManager.getConnection()
      if (!transport) {
        controller.error(
          new Error(
            'Failed to establish WebSocket connection',
          ),
        )
        return
      }

      if (count === 0) {
        controller.close()
        return
      }

      /**
       * Creates a message handler for processing incoming router messages for a specific action.
       * Handles both regular responses and client action calls, managing response completion and cleanup.
       * @param actionName - The name of the action this handler is for
       * @param id - The message ID to track
       * @returns An async function that processes incoming messages
       */
      function createMessageHandler(
        actionName: keyof Params,
        id: string,
      ) {
        return async (incomingMessage: RouterMessage) => {
          if (incomingMessage.clientId) {
            try {
              const clientAction = defineClientActions[
                incomingMessage.action
              ] as (data: unknown) => Promise<unknown>
              if (!clientAction) {
                throw new Error(
                  `Client action not found: ${incomingMessage.action}`,
                )
              }
              if (isErrorResult(incomingMessage)) {
                controller.enqueue({
                  [incomingMessage.action]:
                    incomingMessage.error,
                } as unknown as Result)
                return
              }

              const clientActionResult = await clientAction(
                incomingMessage.data,
              )

              const clientActionMessage: RouterMessage = {
                id: incomingMessage.id,
                action: incomingMessage.action,
                status: 'ok',
                data: clientActionResult,
                clientId: incomingMessage.clientId,
                bufferType:
                  clientActionResult instanceof File ||
                  clientActionResult instanceof Blob
                    ? 'file'
                    : undefined,
              }

              if (transport) {
                await transport.write(clientActionMessage)
              }
            } catch (rawError) {
              const error = handleError(
                NOOP_ON_ERROR,
                rawError,
              )
              controller.enqueue({
                [incomingMessage.action]: error?.error,
              } as unknown as Result)
              const clientActionMessage: RouterMessage = {
                id: incomingMessage.id,
                action: incomingMessage.action,
                status: 'error',
                error: error?.error,
                clientId: incomingMessage.clientId,
              }
              if (transport) {
                await transport.write(clientActionMessage)
              }
            }
            return
          }

          const { isLast } = incomingMessage
          const isErrorAndNotClient =
            !incomingMessage.clientId &&
            isErrorResult(incomingMessage)
          const isFinish = isLast || isErrorAndNotClient

          const result: RouterResultNotGeneric = {
            status: incomingMessage.status,
            data: incomingMessage.data,
            error: incomingMessage.error,
          }
          controller.enqueue({
            [actionName]: result,
          } as Result)

          if (isFinish) {
            waitingResponses.delete(id)
            connectionManager.markRequestCompleted(id)
            finishedCount.value++
            if (count === finishedCount.value) {
              controller.close()
            }
          }
        }
      }

      /**
       * Creates a timeout handler for an action that triggers when the response timeout is exceeded.
       * Closes the controller with an error and manages cleanup when all actions are finished.
       * @param actionName - The name of the action this timeout handler is for
       * @param id - The message ID
       * @returns A function that handles timeout errors
       */
      function createTimeoutHandler(
        actionName: keyof Params,
        id: string,
      ) {
        return () => {
          controller.error(
            new Error(
              'Timeout waiting for response for ' +
                String(actionName),
            ),
          )
          connectionManager.markRequestCompleted(id)
          finishedCount.value++
          if (count === finishedCount.value) {
            controller.close()
          }
        }
      }

      for (const actionName of entryNames) {
        const id = createId()
        connectionManager.markRequestPending(id)
        const actionParams = params[actionName]
        const routerMessage: RouterMessage = {
          action: String(actionName),
          data: actionParams,
          id,
          status: 'ok',
          bufferType:
            actionParams instanceof File ||
            actionParams instanceof Blob
              ? 'file'
              : undefined,
        }

        await transport.write(routerMessage)

        waitingResponses.add(
          id,
          createMessageHandler(actionName, id),
          createTimeoutHandler(actionName, id),
        )
      }
    },
  })
}
