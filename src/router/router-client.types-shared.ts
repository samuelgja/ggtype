import type {
  ResultStatus,
  OutputError,
  RouterRawMessage,
} from '../types'
import type { ModelNotGeneric } from '../model'
import type { RouterMessage } from './router-message'

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
  T extends Record<string, ClientAction>,
> = {
  [K in keyof T]: (
    params: T[K]['params']['infer'],
  ) => Promise<ClientActionResult<T[K]>>
}

/**
 * @group Client
 */
export type ClientCallableActionsBefore<
  T extends Record<string, ClientAction>,
> = {
  [K in keyof T]: (
    send: (message: RouterRawMessage) => void,
    message: RouterMessage,
    params: T[K]['params']['infer'],
  ) => Promise<ClientActionResult<T[K]>>
}

/**
 * @group Client
 */
export type ClientCallableActionsFromClient<
  T extends Record<string, ClientAction>,
> = {
  [K in keyof T]: (
    params: T[K]['params']['infer'],
  ) => Promise<T[K]['return']['infer']>
}
