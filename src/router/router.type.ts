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
import type { ClientAction } from '../router-client/router-client.types'
import type { CallableActions } from './router.utils'

import type { ClearMap } from '../utils/clear-map'

/**
 * Base type for server actions.
 * @group Router
 */
export type ServerActionsBase = Record<
  string,
  ActionNotGeneric
>

/**
 * Base type for client actions.
 * @group Router
 */
export type ClientActionsBase = Record<string, ClientAction>

/**
 * Options for router calls.
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
 * Configuration options for creating a router.
 * @group Router
 * @template Actions - The server actions type
 * @template ClientActions - The client actions type
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
 * Raw message type for router communication.
 * @group Router
 */
export type RouterRawMessage = string | Bun.BufferSource

// ============================================================================
// Request/Message Handling Types
// ============================================================================

/**
 * Options for handling HTTP requests.
 * @group Router
 */
export interface OnRequest extends RouterCallOptions {
  /**
   * The incoming HTTP request
   */
  readonly request: Request
  /**
   * The type of the request
   * @default 'http'
   */
  readonly type?: 'http' | 'stream' | 'duplex'
}

/**
 * Pending promise resolver/rejector for client action calls.
 * @group Router
 * @internal
 */
export interface Pending {
  readonly resolve: (value: unknown) => void
  readonly reject: (error: unknown) => void
}

/**
 * Internal request options with additional router internals.
 * @group Router
 * @internal
 */
export interface OnRequestInternal extends OnRequest {
  readonly callableActions: CallableActions
  readonly encoder: TextEncoder
  readonly pendingClientActionCalls: ClearMap<
    string,
    Pending
  >
}

/**
 * Options for handling WebSocket messages.
 * @group Router
 */
export interface OnWebSocketMessage extends RouterCallOptions {
  /**
   * The WebSocket instance
   */
  readonly ws: ServerWebSocket<unknown>
  /**
   * The incoming message (Uint8Array, ArrayBuffer, or Blob)
   */
  readonly message: unknown
}

/**
 * Internal WebSocket message options with additional router internals.
 * @group Router
 * @internal
 */
export interface OnWebSocketMessageInternal extends OnWebSocketMessage {
  readonly callableActions: CallableActions
  readonly responseTimeout?: number
  readonly encoder: TextEncoder
  readonly pendingClientActionCalls: ClearMap<
    string,
    Pending
  >
}

/**
 * Options for sending error messages.
 * @group Router
 * @internal
 */
export interface SendErrorOptions {
  /**
   * Error handler function that processes raw errors
   * @param error - The raw error that occurred
   * @returns The processed error result, or undefined if the error was suppressed
   */
  readonly onError: (error: Error) => Error
  /**
   * The action name associated with the error
   */
  readonly action: string
  /**
   * The raw error that occurred
   */
  readonly rawError: unknown
  /**
   * The client ID to send the error to
   */
  readonly clientId?: string
  /**
   * Optional message ID (will be generated if not provided)
   */
  readonly id?: string
  /**
   * Function to send a raw message (not used in current implementation)
   */
  readonly send: (message: RouterRawMessage) => void
}

/**
 * Options for sending messages to clients.
 * @group Router
 * @internal
 */
export interface SendMessageToClient {
  /**
   * The action name
   */
  readonly action: string
  /**
   * The data to send (can be File, Blob, or any serializable value)
   */
  readonly data: unknown
  /**
   * The client ID to send the message to
   */
  readonly clientId?: string
  /**
   * Optional message ID (will be generated if not provided)
   */
  readonly id?: string
  /**
   * Whether this is the last message in a stream
   */
  readonly isLast?: boolean
  /**
   * Function to send a raw message (not used in current implementation)
   */
  readonly send: (message: RouterRawMessage) => void
}

/**
 * Options for handling streams.
 * @group Router
 * @internal
 */
export interface HandleStream {
  /**
   * Error handler function
   */
  readonly onError: (error: Error) => Error
  /**
   * The action name
   */
  readonly action: string
  /**
   * The async iterable stream to process
   */
  readonly data: AsyncIterable<unknown>
  /**
   * The message ID
   */
  readonly id?: string
  /**
   * Function to send a raw message (not used in current implementation)
   */
  readonly send: (message: RouterRawMessage) => void
}

// ============================================================================
// Router Inference Types
// ============================================================================

/**
 * Non-generic router inference type.
 * @group Router
 */
export type RouterInferNotGeneric = Record<
  string,
  {
    readonly params: unknown
    readonly result: RouterResultNotGeneric
  }
>

/**
 * Type inference helper for router types.
 * @group Router
 * @template ServerActions - The server actions type
 * @template ClientActions - The client actions type
 */
export type InferRouter<
  ServerActions extends ServerActionsBase,
  ClientActions extends ClientActionsBase,
> = {
  readonly serverActions: {
    readonly [ActionName in keyof ServerActions]: {
      readonly params: ServerActions[ActionName]['model']['infer']
      readonly result: Awaited<
        ReturnType<ServerActions[ActionName]['run']>
      >
    }
  }
  readonly clientActions: ClientActions
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

/**
 * Base router interface.
 * @group Router
 */
export interface RouterBase {
  readonly infer: unknown
}

/**
 * Router interface for handling requests and WebSocket messages.
 * @group Router
 * @template ServerActions - The server actions type
 * @template ClientActions - The client actions type
 */
export interface Router<
  ServerActions extends ServerActionsBase =
    ServerActionsBase,
  ClientActions extends ClientActionsBase =
    ClientActionsBase,
> {
  /**
   * Handles HTTP requests for the router
   * @param options - Request handling options. See OnRequest interface for details.
   * @returns A Response object for the HTTP request
   */
  readonly onRequest: (
    options: OnRequest,
  ) => Promise<Response>

  /**
   * Handles WebSocket messages for the router
   * @param options - WebSocket message handling options. See OnWebSocketMessage interface for details.
   */
  readonly onWebSocketMessage: (
    options: OnWebSocketMessage,
  ) => Promise<void>
  /**
   * Type inference helper for router types
   */
  readonly infer: InferRouter<ServerActions, ClientActions>
  /**
   * Cleanup function called when WebSocket connection closes
   */
  readonly onWebsocketCleanUp: () => void
  /**
   * Disposes of the router and cleans up internal resources (e.g., intervals)
   */
  readonly dispose: () => void
}

/**
 * Types of stream messages.
 * @group Router
 */
export enum StreamMessageType {
  CLIENT_ACTION_CALL,
  CLIENT_ACTION_CALL_RESULT,
  RESPONSE,
  SERVER_ACTION_RESULT,
  WS_SEND_FROM_CLIENT,
  UPLOAD_FILE,
}

/**
 * Stream message format for communication between client and server.
 * @group Router
 */
export interface StreamMessage extends RouterResultNotGeneric {
  /**
   * The action name
   */
  readonly action: string
  /**
   * Unique message identifier
   */
  readonly id: string
  /**
   * Whether this message includes a file
   */
  readonly withFile?: boolean
  /**
   * File size in bytes (without the ID prefix)
   */
  readonly fileSize?: number
  /**
   * File name (preserved when sending files)
   */
  readonly fileName?: string
  /**
   * Client-side hydrated file/blob
   */
  readonly file?: Blob
  /**
   * Message type
   */
  readonly type: StreamMessageType
  /**
   * Whether this is the last message in a stream
   */
  readonly isLast?: boolean
}
