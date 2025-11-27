import type { ActionNotGeneric } from '../action/action'
import type {
  Router,
  TransportType,
  RouterResultNotGeneric,
  ActionResult,
} from '../types'
import type {
  ClientAction,
  ClientCallableActionsFromClient,
} from './router-client.types-shared'

/**
 * Type representing the parameters object for router client fetch/stream calls.
 * Maps action names to their parameter types.
 * @template R - The router type
 */
type ParamsIt<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
> = {
  [P in keyof R['infer']['serverActions']]?: R['infer']['serverActions'][P]['params']
}

/**
 * Type representing the result object with basic router results.
 * @template R - The router type
 * @template Params - The parameters type
 */
type ResultFor<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
> = {
  [P in keyof Params]: RouterResultNotGeneric
}

/**
 * Type representing the result object with action results (includes unwrapped stream types).
 * @template R - The router type
 * @template Params - The parameters type
 */
type ResultForWithActionResult<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
> = {
  [P in keyof Params &
    keyof R['infer']['serverActions']]: ActionResult<
    R['infer']['serverActions'][P]['result']
  >
}

type HasStatusCodeResult =
  | {
      [key: string]:
        | RouterResultNotGeneric
        | ActionResult<unknown>
        | undefined
    }
  | Record<
      string,
      | RouterResultNotGeneric
      | ActionResult<unknown>
      | undefined
    >

/**
 * Checks if any result in the response has a specific status code.
 * Useful for checking authorization errors (e.g., 401) in onResponse hooks.
 * @example ```typescript
 * onResponse: ({ json, runAgain }) => {
 *   if (hasStatusCode(json, 401)) {
 *     // Handle unauthorized error
 *     return runAgain()
 *   }
 *   return json
 * }
 * ```
 * @param result - The result object from a router client fetch
 * @param code - The HTTP status code to check for
 * @returns True if any result has an error with the specified status code
 */
export function hasStatusCode(
  result: HasStatusCodeResult,
  code: number,
): boolean {
  const resultRecord = result as Record<
    string,
    | RouterResultNotGeneric
    | ActionResult<unknown>
    | undefined
  >
  for (const key in resultRecord) {
    const item = resultRecord[key]
    if (
      item &&
      'status' in item &&
      item.status === 'error' &&
      'error' in item &&
      item.error?.code === code
    ) {
      return true
    }
  }
  return false
}

/**
 * Options for creating a router client.
 * @template R - The router type
 */
export interface RouterClientOptions<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
> {
  /**
   * The server URL to connect to
   */
  url: string | URL
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
   * Transport type: 'stream', 'websocket', or 'http' (must match server transport)
   */
  transport?: TransportType
  /**
   * Optional error handler callback
   */
  onError?: (error: Error) => void
  /**
   * Optional callback invoked before sending a request.
   * Receives the request parameters and a runAgain method to retry the request.
   * @param options - Request options with params and runAgain method
   * @returns The modified parameters to send, or undefined to use the original
   */
  onRequest?: <Params extends ParamsIt<R>>(options: {
    params: Params
    runAgain: () => Promise<
      ResultForWithActionResult<R, Params>
    >
  }) => Params | void | Promise<Params | void>
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

/**
 * Options for fetch and stream calls.
 * @template R - The router type
 */
export interface FetchOptions<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
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

export type {
  ParamsIt,
  ResultFor,
  ResultForWithActionResult,
}
