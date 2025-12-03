import type { ModelNotGeneric } from '../model'
import type {
  ActionResult,
  OutputError,
  ResultStatus,
  RouterResultNotGeneric,
} from '../types'
import type { AsyncStream } from '../utils/async-stream'
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

export type ClientCallableActionsFromClient<
  T extends ClientActionsBase,
> = {
  [K in keyof T]: (
    params: T[K]['params']['infer'],
  ) => Promise<T[K]['return']['infer']>
}

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
export interface FetchOptions<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> {
  /**
   * Optional array of files to upload
   */
  files?: File[]
  /**
   * Partial client action handlers that override client-level handlers for this specific request.
   * If an action is defined here, it will be used instead of the client-level definition.
   */
  defineClientActions?: Partial<
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
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}

/**
 * Helper function to define client action models with proper typing.
 * This is a type-only function that returns the input unchanged, used for type inference.
 * @template T - The client actions record type
 * @param data - The client actions record to define
 * @returns The same data with proper typing
 */
export function defineClientActionsSchema<
  T extends Record<string, ClientAction>,
>(data: T): T {
  return data
}

export interface DuplexOptions<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> {
  /**
   * Optional array of files to upload
   */
  files?: File[]
  /**
   * Partial client action handlers that override client-level handlers for this specific request.
   * If an action is defined here, it will be used instead of the client-level definition.
   */
  defineClientActions?: Partial<
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
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}
export interface WebsocketOptions<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> {
  /**
   * Partial client action handlers that override client-level handlers for this specific request.
   * If an action is defined here, it will be used instead of the client-level definition.
   */
  defineClientActions?: Partial<
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
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  files?: File[]
}

export interface RouterClientOptions<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> {
  readonly streamURL?: string | URL

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
  defineClientActions?: ClientCallableActionsFromClient<
    R['infer']['clientActions']
  >
  /**
   * Timeout in milliseconds for waiting responses (default: 60000)
   */
  responseTimeout?: number
  /**
   * Optional callback invoked after receiving a response.
   * Can modify the response or throw an error to retry.
   * @param options - Response options with json (result) and runAgain method
   * @param options.json - The response result
   * @param options.runAgain - Method to retry the request with optional new params and options
   * @returns The modified response JSON, or undefined to use the original
   */
  onResponse?: <Params extends ParamsIt<R>>(options: {
    json: ResultForWithActionResult<R, Params>
    runAgain: (
      newParams?: Params,
      newOptions?: FetchOptions<R>,
    ) => Promise<ResultForWithActionResult<R, Params>>
  }) =>
    | ResultForWithActionResult<R, Params>
    | void
    | Promise<ResultForWithActionResult<R, Params> | void>
}

export interface RouterClient<
  R extends Router<ServerActionsBase, ClientActionsBase>,
> {
  readonly fetch: <Params extends ParamsIt<R>>(
    params: Params,
    fetchOptions?: FetchOptions<R>,
  ) => Promise<ResultForWithActionResult<R, Params>>
  readonly stream: <Params extends ParamsIt<R>>(
    params: Params,
    streamOptions?: FetchOptions<R>,
  ) => Promise<
    AsyncStream<ResultForWithActionResult<R, Params>>
  >
}

export interface RouterClientState {
  defaultHeaders: Record<string, string>
}

/**
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
 * @group Client
 */
export interface ClientActionResult<
  T extends ClientAction,
> {
  /**
   * Status of the client action result
   */
  status: ResultStatus
  /**
   * Success data (present when status is 'ok')
   */
  data?: T['return']['infer']
  /**
   * Error information (present when status is 'error')
   */
  error?: OutputError
}

/**
 * @group Client
 */
export type ClientCallableActions<
  T extends ClientActionsBase,
> = {
  [K in keyof T]: (
    params: T[K]['params']['infer'],
  ) => Promise<ClientActionResult<T[K]>>
}
