import type { ErrorObject, ValidationError } from 'ajv'
import type { Action } from './action/action'
import type { AsyncStream } from './utils/async-stream'

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
