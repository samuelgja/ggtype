// ============================================================================
// Router Configuration Types
// ============================================================================
import type { ServerWebSocket } from 'bun'
import type { ActionNotGeneric } from '../action/action'
import type {
  ActionResult,
  AppError,
  RouterResultNotGeneric,
} from '../types'
import type { ClientAction } from './router.client.types'
import type { CallableActions } from './router.utils'

import type { ClearMap } from '../utils/clear-map'

export type ServerActionsBase = Record<
  string,
  ActionNotGeneric
>

export type ClientActionsBase = Record<string, ClientAction>
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
  Actions extends ServerActionsBase,
  ClientActions extends ClientActionsBase,
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

  /**
   * The type of the request
   * @default 'http'
   */
  type?: 'http' | 'stream' | 'duplex'
}

export interface Pending {
  readonly resolve: (value: unknown) => void
  readonly reject: (error: unknown) => void
}

export interface OnRequestInternal extends OnRequest {
  callableActions: CallableActions
  readonly encoder: TextEncoder
  readonly pendingClientActionCalls: ClearMap<
    string,
    Pending
  >
}

/**
 * @group Router
 */
export interface OnWebSocketMessage extends RouterCallOptions {
  /**
   * The WebSocket instance
   */
  ws: ServerWebSocket<unknown>
  /**
   * The incoming message (Uint8Array, ArrayBuffer, or Blob)
   */
  message: unknown
  /**
   * The context object to pass to actions
   */
  ctx?: unknown
}

export interface OnWebSocketMessageInternal extends OnWebSocketMessage {
  callableActions: CallableActions
  readonly responseTimeout?: number
  readonly encoder: TextEncoder
  readonly pendingClientActionCalls: ClearMap<
    string,
    Pending
  >
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

export type InferRouter<
  ServerActions extends ServerActionsBase,
  ClientActions extends ClientActionsBase,
> = {
  serverActions: {
    [ActionName in keyof ServerActions]: {
      params: ServerActions[ActionName]['model']['infer']
      result: Awaited<
        ReturnType<ServerActions[ActionName]['run']>
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
  R extends Router<ServerActionsBase, ClientActionsBase>,
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
  | InferRouter<ServerActionsBase, ClientActionsBase>

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly infer: any
}

export interface Router<
  ServerActions extends ServerActionsBase =
    ServerActionsBase,
  ClientActions extends ClientActionsBase =
    ClientActionsBase,
> {
  /**
   * Handles HTTP requests for the router
   * @param options - Request handling options
   * @returns A Response object for the HTTP request
   */
  readonly onRequest: (
    options: OnRequest,
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
  readonly infer: InferRouter<ServerActions, ClientActions>

  readonly onWebsocketCleanUp: () => void
}

export enum StreamMessageType {
  CLIENT_ACTION_CALL,
  CLIENT_ACTION_CALL_RESULT,
  RESPONSE,
  SERVER_ACTION_RESULT,
  WS_SEND_FROM_CLIENT,
  UPLOAD_FILE,
}
export interface StreamMessage extends RouterResultNotGeneric {
  action: string
  id: string
  withFile?: boolean
  fileSize?: number // bytes, without the ID prefix
  file?: Blob // client-side hydrated file/blob
  type: StreamMessageType
  isLast?: boolean
}
