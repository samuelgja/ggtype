import type { ModelNotGeneric } from '../model'
import type {
  ActionResult,
  OutputError,
  ResultStatus,
  RouterResultNotGeneric,
} from '../types'
import type {
  ClientActionsBase,
  Router,
  ServerActionsBase,
} from './router.type'
export const UPLOAD_FILE = '__uploadFile'
/**
 * Type representing the parameters object for router client fetch/stream calls.
 * Maps action names to their parameter types.
 * @group Client
 * @template R - The router type
 */
export type ParamsIt<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> = {
  [P in keyof R['infer']['serverActions']]?: R['infer']['serverActions'][P]['params']
}

/**
 * Type representing the result object with basic router results.
 * @group Client
 * @template R - The router type
 * @template Params - The parameters type
 */
export type ResultFor<
  R extends Router<ServerActionsBase, ClientActionsBase>,
  Params extends ParamsIt<R>,
> = {
  [P in keyof Params]: RouterResultNotGeneric
}

/**
 * Type representing callable client actions from the client perspective.
 * Maps action names to async functions that accept parameters and return results.
 * @group Client
 * @template T - The client actions base type
 */
export type ClientCallableActionsFromClient<
  T extends ClientActionsBase,
> = {
  [K in keyof T]: (
    params: T[K]['params']['infer'],
  ) => Promise<T[K]['return']['infer']>
}

/**
 * Type representing the result object with action results wrapped in ActionResult format.
 * @group Client
 * @template R - The router type
 * @template Params - The parameters type
 */
export type ResultForWithActionResult<
  R extends Router<ServerActionsBase, ClientActionsBase>,
  Params extends ParamsIt<R>,
> = {
  [P in keyof Params &
    keyof R['infer']['serverActions']]: ActionResult<
    R['infer']['serverActions'][P]['result']
  >
}

/**
 * Options for fetch and stream calls.
 * @group Client
 * @template R - The router type
 */
/**
 * Options for fetch and stream calls.
 * @group Client
 * @template R - The router type
 */
export interface FetchOptions<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> {
  /**
   * Optional array of files to upload
   */
  readonly files?: readonly File[]
  /**
   * Partial client action handlers that override client-level handlers for this specific request.
   * If an action is defined here, it will be used instead of the client-level definition.
   */
  readonly defineClientActions?: Partial<
    ClientCallableActionsFromClient<
      R['infer']['clientActions']
    >
  >
  /**
   * HTTP method to use for the request.
   * Defaults to 'GET' for HTTP transport, 'POST' for stream transport.
   * Note: Stream transport requires POST (or other methods that support request bodies).
   * For GET requests with HTTP transport, parameters are sent as query parameters.
   */
  readonly method?:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE'
}

/**
 * Helper function to define client action models with proper typing.
 * This is a type-only function that returns the input unchanged, used for type inference.
 * @group Client
 * @template T - The client actions record type
 * @param data - The client actions record to define
 * @returns The same data with proper typing
 */
export function defineClientActionsSchema<
  T extends Record<string, ClientAction>,
>(data: T): T {
  return data
}

/**
 * Options for duplex (bidirectional) stream calls.
 * @group Client
 * @template R - The router type
 */
export interface DuplexOptions<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> {
  /**
   * Optional array of files to upload
   */
  readonly files?: readonly File[]
  /**
   * Partial client action handlers that override client-level handlers for this specific request.
   * If an action is defined here, it will be used instead of the client-level definition.
   */
  readonly defineClientActions?: Partial<
    ClientCallableActionsFromClient<
      R['infer']['clientActions']
    >
  >
  /**
   * HTTP method to use for the request.
   * Defaults to 'GET' for HTTP transport, 'POST' for stream transport.
   * Note: Stream transport requires POST (or other methods that support request bodies).
   * For GET requests with HTTP transport, parameters are sent as query parameters.
   */
  readonly method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}
/**
 * Options for WebSocket calls.
 * @group Client
 * @template R - The router type
 */
export interface WebsocketOptions<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> {
  /**
   * Partial client action handlers that override client-level handlers for this specific request.
   * If an action is defined here, it will be used instead of the client-level definition.
   */
  readonly defineClientActions?: Partial<
    ClientCallableActionsFromClient<
      R['infer']['clientActions']
    >
  >
  /**
   * HTTP method to use for the request.
   * Defaults to 'GET' for HTTP transport, 'POST' for stream transport.
   * Note: Stream transport requires POST (or other methods that support request bodies).
   * For GET requests with HTTP transport, parameters are sent as query parameters.
   */
  readonly method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /**
   * Optional array of files to upload
   */
  readonly files?: readonly File[]
}

/**
 * Configuration options for creating a router client.
 * @group Client
 * @template R - The router type
 */
export interface RouterClientOptions<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> {
  /**
   * URL for stream transport
   */
  readonly streamURL?: string | URL
  /**
   * URL for half-duplex (bidirectional) stream transport
   */
  readonly halfDuplexUrl?: string | URL
  /**
   * URL for WebSocket transport. If provided and streamURL is not provided, will be used.
   */
  readonly websocketURL?: string | URL
  /**
   * URL for HTTP transport. If provided and neither streamURL nor websocketURL are provided, will be used.
   */
  readonly httpURL?: string | URL
  /**
   * Handlers for client actions (called by server)
   */
  readonly defineClientActions?: ClientCallableActionsFromClient<
    R['infer']['clientActions']
  >
  /**
   * Timeout in milliseconds for waiting responses (default: 60000)
   */
  readonly responseTimeout?: number
  /**
   * Optional callback invoked after receiving a response.
   * Can modify the response or throw an error to retry.
   * @param options - Response options with json (result), statusCode, and runAgain method. See the inline type definition for property details.
   * @returns The modified response JSON, or undefined to use the original
   */
  onResponse?: <Params extends ParamsIt<R>>(options: {
    readonly json: ResultForWithActionResult<R, Params>
    readonly statusCode: number
    readonly runAgain: <
      NewParams extends ParamsIt<R> = Params,
    >(
      newParams?: NewParams,
      newOptions?: FetchOptions<R>,
    ) => Promise<ResultForWithActionResult<R, NewParams>>
  }) =>
    | ResultForWithActionResult<R, ParamsIt<R>>
    | void
    | Promise<ResultForWithActionResult<
        R,
        ParamsIt<R>
      > | void>
  /**
   * Optional error handler invoked whenever the client encounters a transport
   * error or client action failure before propagation. Should return the error
   * that will be thrown to the caller.
   */
  readonly onError?: (error: Error) => Error
}

type ActionProxy<
  R extends Router<ServerActionsBase, ClientActionsBase>,
  ActionName extends keyof R['infer']['serverActions'],
> = (
  params: R['infer']['serverActions'][ActionName]['params'],
  options?: FetchOptions<R>,
) => Promise<
  ActionResult<
    R['infer']['serverActions'][ActionName]['result']
  >
>

type StreamActionProxy<
  R extends Router<ServerActionsBase, ClientActionsBase>,
  ActionName extends keyof R['infer']['serverActions'],
> = (
  params: R['infer']['serverActions'][ActionName]['params'],
  options?: FetchOptions<R>,
) => AsyncGenerator<
  ActionResult<
    R['infer']['serverActions'][ActionName]['result']
  >
>

type DuplexActionProxy<
  R extends Router<ServerActionsBase, ClientActionsBase>,
  ActionName extends keyof R['infer']['serverActions'],
> = (
  params: R['infer']['serverActions'][ActionName]['params'],
  options?: DuplexOptions<R>,
) => AsyncGenerator<
  ActionResult<
    R['infer']['serverActions'][ActionName]['result']
  >
>

export type FetchActionsProxyType<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> = {
  readonly [ActionName in keyof R['infer']['serverActions']]: ActionProxy<
    R,
    ActionName
  >
} & {
  readonly __brand?: never
}

export type StreamActionsProxyType<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> = {
  readonly [ActionName in keyof R['infer']['serverActions']]: StreamActionProxy<
    R,
    ActionName
  >
} & {
  readonly __brand?: never
}

export type DuplexActionsProxyType<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> = {
  readonly [ActionName in keyof R['infer']['serverActions']]: DuplexActionProxy<
    R,
    ActionName
  >
} & {
  readonly __brand?: never
}

/**
 * Router client for making requests to a router server.
 * @group Client
 * @template R - The router type
 */
export interface RouterClient<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> {
  /**
   * Fetches results for the given parameters using HTTP transport.
   * @param params - Parameters to send. See ParamsIt type for details.
   * @param fetchOptions - Optional fetch options. See FetchOptions interface for details.
   * @returns Promise resolving to action results
   */
  readonly fetch: <Params extends ParamsIt<R>>(
    params: Params,
    fetchOptions?: FetchOptions<R>,
  ) => Promise<ResultForWithActionResult<R, Params>>
  /**
   * Streams results for the given parameters using stream transport.
   * @param params - Parameters to send. See ParamsIt type for details.
   * @param streamOptions - Optional stream options. See FetchOptions interface for details.
   * @returns Async generator yielding action results
   */
  readonly stream: <Params extends ParamsIt<R>>(
    params: Params,
    streamOptions?: FetchOptions<R>,
  ) => AsyncGenerator<ResultForWithActionResult<R, Params>>
  /**
   * Object with methods for fetching individual actions by name
   */
  readonly fetchActions: FetchActionsProxyType<R>
  /**
   * Object with methods for streaming individual actions by name
   */
  readonly streamActions: StreamActionsProxyType<R>
  /**
   * Object with methods for duplex (bidirectional) streaming individual actions by name
   */
  readonly duplexActions: DuplexActionsProxyType<R>
}

/**
 * Internal state for router client.
 * @group Client
 * @internal
 */
export interface RouterClientState {
  defaultHeaders: Headers
  readonly onError: (error: Error) => Error
}

/**
 * Definition of a client action that can be called by the server.
 * @group Client
 */
export interface ClientAction {
  /**
   * Model for validating client action parameters
   */
  readonly params: ModelNotGeneric
  /**
   * Model for validating client action return value
   */
  readonly return: ModelNotGeneric
}

/**
 * Result of a client action call.
 * @group Client
 * @template T - The client action type
 */
export interface ClientActionResult<
  T extends ClientAction,
> {
  /**
   * Status of the client action result
   */
  readonly status: ResultStatus
  /**
   * Success data (present when status is 'ok')
   */
  readonly data?: T['return']['infer']
  /**
   * Error information (present when status is 'error')
   */
  readonly error?: OutputError
}

/**
 * Type representing callable client actions that return ClientActionResult.
 * @group Client
 * @template T - The client actions base type
 */
export type ClientCallableActions<
  T extends ClientActionsBase,
> = {
  [K in keyof T]: (
    params: T[K]['params']['infer'],
  ) => Promise<ClientActionResult<T[K]>>
}

/**
 * Bidirectional connection for sending and receiving messages.
 * @group Client
 * @template R - The router type
 */
export interface BidirectionalConnection<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> {
  /**
   * Async generator for receiving messages from the server
   */
  readonly stream: AsyncGenerator<
    ResultForWithActionResult<R, ParamsIt<R>>,
    void,
    unknown
  >
  /**
   * Sends parameters to the server
   * @param params - Parameters to send. See ParamsIt type for details.
   */
  readonly send: <Params extends ParamsIt<R>>(
    params: Params,
  ) => Promise<void>
  /**
   * Closes the connection
   */
  readonly close: () => void
}
