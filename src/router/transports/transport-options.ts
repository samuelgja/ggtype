import type { ActionNotGeneric } from '../../action/action'
import type { Router } from '../../types'
import type { ClientAction } from '../router-client.types-shared'
import type { ParamsIt } from '../router-client.types'
import type { RouterMessage } from '../router-message'
import type { clearMap } from '../../utils/clear-map'
import type { WebSocketConnectionManager } from '../../transport'

/**
 * Shared base options for all transport handlers.
 * @internal
 * @template R - The router type
 * @template Params - The parameters type
 */
export interface BaseTransportOptions<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
> {
  readonly params: Params
  readonly defineClientActions: Record<string, unknown>
  readonly waitingResponses: ReturnType<
    typeof clearMap<string, (data: RouterMessage) => void>
  >
}

/**
 * Options for HTTP transport handler.
 * @internal
 * @template R - The router type
 * @template Params - The parameters type
 */
export interface HttpTransportOptions<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
> extends BaseTransportOptions<R, Params> {
  readonly url: string | URL
  readonly headers: Record<string, string>
  readonly method?:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE'
  readonly keepAlive?: boolean
}

/**
 * Options for stream transport handler.
 * @internal
 * @template R - The router type
 * @template Params - The parameters type
 */
export interface StreamTransportOptions<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
> extends BaseTransportOptions<R, Params> {
  readonly url: string | URL
  readonly processClientData: (
    message: RouterMessage,
    waitingResponsesMap: ReturnType<
      typeof clearMap<string, (data: RouterMessage) => void>
    >,
  ) => void
  readonly headers: Record<string, string>
  readonly method?:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'DELETE'
  readonly keepAlive?: boolean
}

/**
 * Options for WebSocket transport handler.
 * @internal
 * @template R - The router type
 * @template Params - The parameters type
 */
export interface WebSocketTransportOptions<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
> extends BaseTransportOptions<R, Params> {
  readonly connectionManager: WebSocketConnectionManager
}
