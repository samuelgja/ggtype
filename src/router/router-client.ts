/* eslint-disable sonarjs/cognitive-complexity */
import type { ActionNotGeneric } from '../action/action'
import type { ActionResult } from '../types'
import { isRouterMessage } from './router-message'
import type { RouterMessage } from './router-message'
import { DEFAULT_ROUTER_TIMEOUT } from '../types'
import type { AsyncStream } from '../utils/async-stream'
import { clearMap } from '../utils/clear-map'
import type { ClientAction } from './router-client.types-shared'
import type { Router } from '../types'
import type {
  RouterClientOptions,
  FetchOptions,
  ParamsIt,
  ResultForWithActionResult,
} from './router-client.types'
import { WebSocketConnectionManager } from '../transport'
import {
  handleHttpTransport,
  handleStreamTransport,
  handleWebSocketTransport,
} from './transports'

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
 * Used in onResponse hook error handling.
 * @internal
 * @param error - The error to handle
 */
function handleThisError(error: unknown) {
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
 * @group Client
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
    streamURL,
    websocketURL,
    httpURL,
    responseTimeout = DEFAULT_ROUTER_TIMEOUT,
    defineClientActions,
    onRequest,
    onResponse,
    method: httpMethod,
    keepAlive,
    maxReconnectAttempts = 5,
    initialReconnectDelay = 1000,
    maxReconnectDelay = 30_000,
    connectionTimeout,
  } = options

  // Determine which transports are available based on provided URLs
  const hasStreamURL = streamURL !== undefined
  const hasWebSocketURL = websocketURL !== undefined
  const hasHttpURL = httpURL !== undefined

  if (!hasStreamURL && !hasWebSocketURL && !hasHttpURL) {
    throw new Error(
      'At least one of streamURL, websocketURL, or httpURL must be provided',
    )
  }

  // Extract transport-specific options
  const httpKeepAlive = keepAlive ?? false
  const streamKeepAlive = keepAlive ?? true
  const connectionTimeoutValue =
    connectionTimeout ?? responseTimeout

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

  // Create connection managers for persistent WebSocket connections
  // We'll create them lazily when needed
  const websocketConnectionManagers = new Map<
    string | URL,
    WebSocketConnectionManager
  >()

  /**
   * Gets or creates a WebSocket connection manager for the given URL.
   * Connection managers are cached per URL to reuse persistent connections.
   * @param url - The WebSocket URL
   * @returns The WebSocket connection manager
   */
  function getWebSocketConnectionManager(
    url: string | URL,
  ): WebSocketConnectionManager {
    const urlKey =
      typeof url === 'string' ? url : url.toString()
    let manager = websocketConnectionManagers.get(urlKey)
    if (!manager) {
      manager = new WebSocketConnectionManager(
        url,
        responseTimeout,
        undefined, // No error handler - errors will throw naturally
        maxReconnectAttempts,
        initialReconnectDelay,
        maxReconnectDelay,
        connectionTimeoutValue,
      )
      websocketConnectionManagers.set(urlKey, manager)
    }
    return manager
  }

  /**
   * Processes incoming client data messages from the server.
   * Routes messages to their corresponding waiting response handlers based on message ID.
   * Invalid or orphaned messages are silently ignored (they may arrive after timeout or connection issues).
   * @param message - The router message to process
   * @param waitingResponsesMap - Map of waiting response handlers keyed by message ID
   */
  function processClientData(
    message: RouterMessage,
    waitingResponsesMap: ReturnType<
      typeof clearMap<string, (data: RouterMessage) => void>
    >,
  ) {
    // Validate message format
    if (!isRouterMessage(message)) {
      // Invalid message format - silently ignore
      // This prevents crashes from malformed server responses
      return
    }

    // Look up waiting response handler by message ID
    const callResponse = waitingResponsesMap.get(message.id)
    if (callResponse) {
      // Found handler - invoke it with the message
      callResponse(message)
      return
    }

    // Orphaned message (no waiting handler) - silently ignore
    // This can happen if:
    // - Message arrives after timeout
    // - Connection was reset and re-established
    // - Message ID doesn't match any pending request
  }

  // Set up message processors for WebSocket connection managers
  // This will be done lazily when a WebSocket connection is first used

  /**
   * Selects and creates a stream using the first available transport in priority order.
   * Transport priority: stream -> websocket -> http
   * If the selected transport fails, the error is thrown (no automatic downgrade).
   * @param params - The request parameters
   * @param fetchOptions - Optional fetch options (method, client actions, etc.)
   * @returns An AsyncStream of results
   */
  async function selectTransport<
    Params extends ParamsIt<R>,
  >(
    params: Params,
    fetchOptions: FetchOptions<R> | undefined,
  ): Promise<AsyncStream<ResultForLocal<Params>>> {
    // Merge client actions from client-level and request-level definitions
    // Request-level definitions override client-level ones
    // Create a fresh copy to avoid race conditions with concurrent requests
    const requestClientActions =
      fetchOptions?.defineClientActions
    const mergedClientActions: Record<string, unknown> = {}
    if (defineClientActions) {
      // Copy client-level actions into a new object to avoid reference sharing
      for (const key in defineClientActions) {
        if (
          Object.prototype.hasOwnProperty.call(
            defineClientActions,
            key,
          )
        ) {
          mergedClientActions[key] =
            defineClientActions[key]
        }
      }
    }
    if (requestClientActions) {
      // Override with per-request actions (also copying to avoid reference sharing)
      for (const key in requestClientActions) {
        if (
          Object.prototype.hasOwnProperty.call(
            requestClientActions,
            key,
          )
        ) {
          mergedClientActions[key] =
            requestClientActions[key]
        }
      }
    }

    // Determine HTTP methods for different transports
    // HTTP transport defaults to GET, stream transport defaults to POST
    const method =
      fetchOptions?.method ?? httpMethod ?? 'GET'
    const streamMethod = fetchOptions?.method ?? 'POST'

    // Try transports in priority order: stream -> websocket -> http
    // Each transport is tried only if its URL is available
    // Errors are thrown naturally - no automatic fallback to next transport

    // Priority 1: Stream transport (bidirectional HTTP stream)
    // Best for real-time bidirectional communication
    if (hasStreamURL && streamURL) {
      // Validate URL format
      try {
        new URL(streamURL)
      } catch {
        throw new Error('Invalid stream URL')
      }
      return await handleStreamTransport<R, Params>({
        url: streamURL,
        params,
        defineClientActions: mergedClientActions,
        waitingResponses,
        processClientData,
        headers,
        method: streamMethod,
        keepAlive: streamKeepAlive,
      })
    }

    // Priority 2: WebSocket transport (persistent connection)
    // Good for long-lived connections with multiple requests
    if (hasWebSocketURL && websocketURL) {
      // Validate URL format
      try {
        new URL(websocketURL)
      } catch {
        throw new Error('Invalid websocket URL')
      }
      // Get or create connection manager (handles connection pooling)
      const wsManager =
        getWebSocketConnectionManager(websocketURL)
      // Set up message processor (idempotent - safe to call multiple times)
      wsManager.setMessageProcessor((message) => {
        processClientData(message, waitingResponses)
      })
      return await handleWebSocketTransport<R, Params>({
        connectionManager: wsManager,
        params,
        defineClientActions: mergedClientActions,
        waitingResponses,
      })
    }

    // Priority 3: HTTP transport (simple request/response)
    // Fallback for basic HTTP requests without streaming
    if (hasHttpURL && httpURL) {
      return await handleHttpTransport<R, Params>({
        url: httpURL,
        params,
        defineClientActions: mergedClientActions,
        waitingResponses,
        headers,
        method,
        keepAlive: httpKeepAlive,
      })
    }

    // No transports available
    throw new Error(
      'No transport URLs provided. Please provide at least one of streamURL, websocketURL, or httpURL.',
    )
  }

  type ResultForLocal<Params extends ParamsIt<R>> =
    ResultForWithActionResult<R, Params>

  // Helper type for single action fetch result
  type SingleActionFetchResult<
    ActionName extends keyof R['infer']['serverActions'],
  > = ActionResult<
    R['infer']['serverActions'][ActionName]['result']
  >

  // Helper type for single action stream result
  type SingleActionStreamResult<
    ActionName extends keyof R['infer']['serverActions'],
  > = AsyncStream<{
    [K in ActionName]: ActionResult<
      R['infer']['serverActions'][K]['result']
    >
  }>

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

      // selectTransport will merge client-level and per-request defineClientActions
      const stream = await selectTransport(
        requestParams,
        fetchOptions,
      )

      // Collect all results from the stream and return the final state
      const result: ResultForLocal<Params> =
        {} as ResultForLocal<Params>
      for await (const chunk of stream) {
        // Merge each chunk into the result, keeping the latest value for each action
        for (const key in chunk) {
          if (
            Object.prototype.hasOwnProperty.call(chunk, key)
          ) {
            ;(result as Record<string, unknown>)[key] = (
              chunk as Record<string, unknown>
            )[key]
          }
        }
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

      // selectTransport will merge client-level and per-request defineClientActions
      return await selectTransport(
        requestParams,
        streamOptions,
      )
    },

    /**
     * Sugar methods for calling individual actions.
     * Each action name is available as a method that calls fetch() with just that action.
     * @example
     * ```ts
     * const { getUser } = client.fetchActions
     * const result = await getUser({ id: '123' })
     * if (isSuccess(result)) {
     *   console.log(result.data)
     * }
     * ```
     */
    fetchActions: new Proxy(
      {} as {
        [ActionName in keyof R['infer']['serverActions']]: (
          params: R['infer']['serverActions'][ActionName]['params'],
          options?: FetchOptions<R>,
        ) => Promise<SingleActionFetchResult<ActionName>>
      },
      {
        get(_target, actionName: string) {
          return async (
            params: unknown,
            fetchActionsOptions?: FetchOptions<R>,
          ): Promise<
            SingleActionFetchResult<
              keyof R['infer']['serverActions']
            >
          > => {
            const result = await client.fetch(
              { [actionName]: params } as ParamsIt<R>,
              fetchActionsOptions,
            )
            return (result as Record<string, unknown>)[
              actionName
            ] as SingleActionFetchResult<
              keyof R['infer']['serverActions']
            >
          }
        },
      },
    ),

    /**
     * Sugar methods for streaming individual actions.
     * Each action name is available as a method that calls stream() with just that action.
     * @example
     * ```ts
     * const { searchUsers } = client.streamActions
     * const stream = await searchUsers({ query: 'john' })
     * for await (const result of stream) {
     *   if (isSuccess(result.searchUsers)) {
     *     console.log(result.searchUsers.data)
     *   }
     * }
     * ```
     */
    streamActions: new Proxy(
      {} as {
        [ActionName in keyof R['infer']['serverActions']]: (
          params: R['infer']['serverActions'][ActionName]['params'],
          options?: FetchOptions<R>,
        ) => Promise<SingleActionStreamResult<ActionName>>
      },
      {
        get(_target, actionName: string) {
          return async (
            params: unknown,
            streamActionsOptions?: FetchOptions<R>,
          ): Promise<
            SingleActionStreamResult<
              keyof R['infer']['serverActions']
            >
          > => {
            return client.stream(
              { [actionName]: params } as ParamsIt<R>,
              streamActionsOptions,
            ) as Promise<
              SingleActionStreamResult<
                keyof R['infer']['serverActions']
              >
            >
          }
        },
      },
    ),
  }

  return client
}
