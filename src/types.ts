import type { ErrorObject, ValidationError } from 'ajv'
import type {
  Action,
  ActionNotGeneric,
} from './action/action'
import type { AsyncStream } from './utils/async-stream'
import type {
  ClientAction,
  ClientCallableActions,
} from './router/router-client.types-shared'

// ============================================================================
// Constants
// ============================================================================

/**
 * @group Utils
 */
export const NOOP_ON_ERROR = (error: Error): Error => error

/**
 * NOOP callback for client actions that returns an empty object.
 * Used when no client actions are defined.
 * @group Utils
 */
export const NOOP_CLIENT_ACTIONS = <
  ClientActions extends Record<string, ClientAction>,
>(): ClientCallableActions<ClientActions> => {
  return {} as ClientCallableActions<ClientActions>
}

/**
 * @group Utils
 */
export const DEFAULT_ROUTER_TIMEOUT = 60 * 1000

// ============================================================================
// Error Types
// ============================================================================

/**
 * @group Utils
 */
export type AppError = ValidationError | Error

/**
 * @group Utils
 */
export interface ErrorBase {
  /**
   * Error type identifier
   */
  readonly type: string
  /**
   * Optional cause of the error
   */
  readonly cause?: unknown
  /**
   * HTTP status code
   */
  readonly code: number
}

/**
 * @group Utils
 */
export interface OutputErrorGeneric extends ErrorBase {
  /**
   * Error type identifier (always 'generic')
   */
  readonly type: 'generic'
  /**
   * Human-readable error message
   */
  readonly message: string
}

/**
 * @group Utils
 */
export interface OutputValidationError extends ErrorBase {
  /**
   * Error type identifier (always 'validation')
   */
  readonly type: 'validation'
  /**
   * Human-readable error message
   */
  readonly message: string
  /**
   * Detailed validation errors from AJV
   */
  readonly errors?: ErrorObject<
    string,
    Record<string, unknown>,
    unknown
  >[]
}

/**
 * @group Utils
 */
export type OutputError =
  | OutputErrorGeneric
  | OutputValidationError

// ============================================================================
// Result Types
// ============================================================================

/**
 * @group Utils
 */
export type ResultStatus = 'ok' | 'error'

/**
 * @group Utils
 */
export interface RouterResultNotGeneric {
  /**
   * Result status: 'ok' for success, 'error' for failure
   */
  status: ResultStatus
  /**
   * Success data (present when status is 'ok')
   */
  data?: unknown
  /**
   * Error information (present when status is 'error')
   */
  error?: OutputError
}

/**
 * @group Utils
 */
export type UnwrapStreamType<T> = T extends void
  ? void
  : T extends ReadableStream<infer U>
    ? U
    : T extends AsyncStream<infer U>
      ? U
      : T extends AsyncIterable<infer U>
        ? U
        : T extends readonly unknown[]
          ? T // ← preserve arrays & tuples
          : T extends Iterable<infer U>
            ? U
            : T

export interface ActionResultBase<
  T,
> extends RouterResultNotGeneric {
  /**
   * Success data with unwrapped stream types (present when status is 'ok')
   */
  data?: UnwrapStreamType<T>
  /**
   * Error information (present when status is 'error')
   */
  error?: OutputError
}

export interface ActionResultOk<
  T,
> extends ActionResultBase<T> {
  /**
   * Result status (always 'ok' for success)
   */
  status: 'ok'
  /**
   * Success data with unwrapped stream types
   */
  data: UnwrapStreamType<T>
}

export interface ActionResultError<
  T,
> extends ActionResultBase<T> {
  /**
   * Result status (always 'error' for failure)
   */
  status: 'error'
  /**
   * Error information
   */
  error: OutputError
}

export type ActionResult<T> =
  | ActionResultOk<T>
  | ActionResultError<T>

export type ActionsResult<
  Actions extends Record<string, Action>,
> = {
  [ActionName in keyof Actions]: ActionResult<
    Awaited<ReturnType<Actions[ActionName]['run']>>
  >
}

// ============================================================================
// Parameter Types
// ============================================================================

export type ActionsParamsNotGeneric = Record<string, Action>

export type ActionsParams<
  Actions extends Record<string, Action>,
> = {
  [ActionName in keyof Actions]?: Parameters<
    Actions[ActionName]['run']
  >[0]['params']
}

// ============================================================================
// Router Configuration Types
// ============================================================================

/**
 * @group Utils
 */
export type TransportType = 'stream' | 'websocket' | 'http'

/**
 * @group Router
 */
export interface RouterCallOptions {
  /**
   * Optional context object to pass to actions
   */
  readonly ctx?: unknown
  /**
   * Optional error handler function that processes errors
   * @param error - The error that occurred
   * @returns The processed error, or undefined to suppress it
   */
  readonly onError?: (error: AppError) => AppError
}

/**
 * @group Router
 */
export interface RouterOptions<
  Actions extends Record<string, ActionNotGeneric> = Record<
    string,
    ActionNotGeneric
  >,
  ClientActions extends Record<string, ClientAction> =
    Record<string, ClientAction>,
> {
  /**
   * Record of server actions that can be called by clients
   */
  readonly serverActions: Actions
  /**
   * Record of client actions that can be called by the server
   */
  readonly clientActions?: ClientActions
  /**
   * Timeout in milliseconds for waiting responses (default: 60000)
   */
  readonly responseTimeout?: number
}

// ============================================================================
// Message Types
// ============================================================================

/**
 * @group Router
 */
export type RouterRawMessage = string | Bun.BufferSource

// ============================================================================
// Request/Message Handling Types
// ============================================================================

/**
 * @group Router
 */
export interface OnRequest extends RouterCallOptions {
  /**
   * The incoming HTTP request
   */
  request: Request
  /**
   * The context object to pass to actions
   */
  ctx?: unknown
}

/**
 * @group Router
 */
export interface OnStream extends RouterCallOptions {
  /**
   * The incoming HTTP request
   */
  request: Request
  /**
   * The context object to pass to actions
   */
  ctx?: unknown
}

/**
 * @group Router
 */
export interface OnWebSocketMessage extends RouterCallOptions {
  /**
   * The WebSocket instance
   */
  ws: Bun.ServerWebSocket<unknown>
  /**
   * The incoming message (Uint8Array, ArrayBuffer, or Blob)
   */
  message: unknown
  /**
   * The context object to pass to actions
   */
  ctx?: unknown
}

/**
 * @group Router
 */
export interface SendErrorOptions {
  /**
   * Error handler function that processes raw errors
   * @param error - The raw error that occurred
   * @returns The processed error result, or undefined if the error was suppressed
   */
  onError: (error: Error) => Error
  /**
   * The action name associated with the error
   */
  action: string
  /**
   * The raw error that occurred
   */
  rawError: unknown
  /**
   * The client ID to send the error to
   */
  clientId?: string
  /**
   * Optional message ID (will be generated if not provided)
   */
  id?: string
  /**
   * Function to send a raw message (not used in current implementation)
   */
  send: (message: RouterRawMessage) => void
}

/**
 * @group Router
 */
export interface SendMessageToClient {
  /**
   * The action name
   */
  action: string
  /**
   * The data to send (can be File, Blob, or any serializable value)
   */
  data: unknown
  /**
   * The client ID to send the message to
   */
  clientId?: string
  /**
   * Optional message ID (will be generated if not provided)
   */
  id?: string
  /**
   * Whether this is the last message in a stream
   */
  isLast?: boolean
  /**
   * Function to send a raw message (not used in current implementation)
   */
  send: (message: RouterRawMessage) => void
}

/**
 * @group Router
 */
export interface HandleStream {
  /**
   * Error handler function
   */
  onError: (error: Error) => Error
  /**
   * The action name
   */
  action: string
  /**
   * The async iterable stream to process
   */
  data: AsyncIterable<unknown>
  /**
   * The message ID
   */
  id?: string
  /**
   * Function to send a raw message (not used in current implementation)
   */
  send: (message: RouterRawMessage) => void
}

// ============================================================================
// Router Inference Types
// ============================================================================

/**
 * @group Router
 */
export type RouterInferNotGeneric = Record<
  string,
  {
    params: unknown
    result: RouterResultNotGeneric
  }
>

type InferRouter<
  Actions extends Record<string, ActionNotGeneric>,
  ClientActions extends Record<string, ClientAction>,
> = {
  serverActions: {
    [ActionName in keyof Actions]: {
      params: Actions[ActionName]['model']['infer']
      result: Awaited<
        ReturnType<Actions[ActionName]['run']>
      >
    }
  }
  clientActions: ClientActions
}

/**
 * Converts router's serverActions to a format compatible with Client (RouterInferNotGeneric).
 * This type wraps router action results in ActionResultNotGeneric format.
 * The params are preserved exactly as they are inferred from the router to ensure type compatibility.
 * @group Router
 */
export type RouterInfer<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
> = {
  [K in keyof R['infer']['serverActions']]: {
    params: R['infer']['serverActions'][K]['params']
    result: ActionResult<
      R['infer']['serverActions'][K]['result']
    >
  }
} & RouterInferNotGeneric

// ============================================================================
// Helper Types
// ============================================================================

type RouterInferLike =
  | RouterInferNotGeneric
  | InferRouter<
      Record<string, ActionNotGeneric>,
      Record<string, ClientAction>
    >

/**
 * Extracts the parameter type for a specific action from a router type.
 * @group Router
 * @template T - The router type (RouterInfer or RouterInferNotGeneric)
 * @template K - The action name
 * @example
 * ```ts
 * import { createRouter, type ParamsInfer } from 'ggtype'
 *
 * const router = createRouter({
 *   serverActions: {
 *     getUser: action(m.object({ id: m.string() }).isOptional(), async ({ params }) => ({})),
 *   },
 *   clientActions: {},
 * })
 *
 * type Router = typeof router.infer
 * type GetUserParams = ParamsInfer<Router, 'getUser'>
 * // Result: { id: string }
 * ```
 */
export type ParamsInfer<
  T extends RouterInferLike,
  K extends
    | keyof T
    | keyof (T extends { serverActions: infer SA }
        ? SA
        : never),
> = T extends {
  serverActions: infer SA
}
  ? K extends keyof SA
    ? SA[K] extends { params: infer P }
      ? P
      : never
    : never
  : K extends keyof T
    ? T[K] extends { params: infer P }
      ? P
      : never
    : never

/**
 * Extracts the result type for a specific action from a router type.
 * Returns the ActionResult type (ok/error union) for the action.
 * @group Router
 * @template T - The router type (RouterInfer or RouterInferNotGeneric)
 * @template K - The action name
 * @example
 * ```ts
 * import { createRouter, type ResultInfer } from 'ggtype'
 *
 * const router = createRouter({
 *   serverActions: {
 *     getUser: action(m.object({ id: m.string() }).isOptional(), async ({ params }) => ({
 *       id: params.id,
 *       name: 'John',
 *     })),
 *   },
 *   clientActions: {},
 * })
 *
 * type Router = typeof router.infer
 * type GetUserResult = ResultInfer<Router, 'getUser'>
 * // Result: { status: 'ok', data: { id: string; name: string } } | { status: 'error', error: {...} }
 * ```
 */
export type ResultInfer<
  T extends RouterInferLike,
  K extends
    | keyof T
    | keyof (T extends { serverActions: infer SA }
        ? SA
        : never),
> = T extends {
  serverActions: infer SA
}
  ? K extends keyof SA
    ? SA[K] extends { result: infer R }
      ? R
      : never
    : never
  : K extends keyof T
    ? T[K] extends { result: infer R }
      ? R
      : never
    : never

// ============================================================================
// Router Interface Types
// ============================================================================

export interface RouterBase {
  /**
   * Handles HTTP requests for the router
   * @param options - Request handling options
   * @returns A Response object for the HTTP request
   */
  readonly onRequest: (
    options: OnRequest,
  ) => Promise<Response>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly infer: any
}

export interface Router<
  Actions extends Record<string, ActionNotGeneric>,
  ClientActions extends Record<string, ClientAction>,
> extends RouterBase {
  /**
   * Handles HTTP stream requests for the router
   * @param options - Stream request handling options
   * @returns A Response object for the stream request
   */
  readonly onStream: (
    options: OnStream,
  ) => Promise<Response>
  /**
   * Handles WebSocket messages for the router
   * @param options - WebSocket message handling options
   */
  readonly onWebSocketMessage: (
    options: OnWebSocketMessage,
  ) => Promise<void>
  /**
   * Type inference helper for router types
   */
  readonly infer: InferRouter<Actions, ClientActions>
}
