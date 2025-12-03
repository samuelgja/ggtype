import type { ErrorObject, ValidationError } from 'ajv'
import type { Action } from './action/action'
import type { AsyncStream } from './utils/async-stream'
import type {
  ClientAction,
  ClientCallableActions,
} from './routerv2/router.client.types'

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
 * Base interface for error types.
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
 * Generic error output format.
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
 * Validation error output format.
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
  readonly errors?: readonly ErrorObject<
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
 * Non-generic router result format.
 * @group Utils
 */
export interface RouterResultNotGeneric {
  /**
   * Result status: 'ok' for success, 'error' for failure
   */
  readonly status: ResultStatus
  /**
   * Success data (present when status is 'ok')
   */
  readonly data?: unknown
  /**
   * Error information (present when status is 'error')
   */
  readonly error?: OutputError
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

/**
 * Base interface for action results.
 * @group Utils
 * @template T - The result type
 */
export interface ActionResultBase<
  T,
> extends RouterResultNotGeneric {
  /**
   * Success data with unwrapped stream types (present when status is 'ok')
   */
  readonly data?: UnwrapStreamType<T>
  /**
   * Error information (present when status is 'error')
   */
  readonly error?: OutputError
}

/**
 * Success result for an action.
 * @group Utils
 * @template T - The result type
 */
export interface ActionResultOk<
  T,
> extends ActionResultBase<T> {
  /**
   * Result status (always 'ok' for success)
   */
  readonly status: 'ok'
  /**
   * Success data with unwrapped stream types
   */
  readonly data: UnwrapStreamType<T>
}

/**
 * Error result for an action.
 * @group Utils
 * @template T - The result type
 */
export interface ActionResultError<
  T,
> extends ActionResultBase<T> {
  /**
   * Result status (always 'error' for failure)
   */
  readonly status: 'error'
  /**
   * Error information
   */
  readonly error: OutputError
}

export type ActionResult<T> =
  | ActionResultOk<T>
  | ActionResultError<T>

/**
 * Type representing results for multiple actions.
 * @group Utils
 * @template Actions - The actions record type
 */
export type ActionsResult<
  Actions extends Record<string, Action>,
> = {
  readonly [ActionName in keyof Actions]: ActionResult<
    Awaited<ReturnType<Actions[ActionName]['run']>>
  >
}

// ============================================================================
// Parameter Types
// ============================================================================

/**
 * Non-generic type for action parameters.
 * @group Utils
 */
export type ActionsParamsNotGeneric = Record<string, Action>

/**
 * Type representing parameters for multiple actions.
 * @group Utils
 * @template Actions - The actions record type
 */
export type ActionsParams<
  Actions extends Record<string, Action>,
> = {
  readonly [ActionName in keyof Actions]?: Parameters<
    Actions[ActionName]['run']
  >[0]['params']
}
