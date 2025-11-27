import type { ModelNotGeneric } from '../model/model'
import type {
  ClientAction,
  ClientCallableActions,
} from '../router/router-client.types-shared'
import { compileModelAndCheck } from '../utils/compile-model'
import { ValidationError } from '../utils/errors'

/**
 * Extracts and types the context object from an unknown value.
 * This is a type-safe way to access the context passed to actions.
 * @template T - The expected type of the context
 * @param ctx - The context value (typically unknown)
 * @returns The context cast to type T
 */
export function getCtx<T>(ctx: unknown): T {
  return ctx as T
}

export type ReturnValue =
  | ModelNotGeneric['infer']
  | void
  | null

export interface ActionCbParameters<
  M extends ModelNotGeneric = ModelNotGeneric,
> {
  /**
   * Validated and parsed action parameters
   */
  readonly params: M['infer']
  /**
   * Optional context object passed from the router
   */
  readonly ctx?: unknown
  /**
   * Function to get client actions for bidirectional communication
   */
  readonly getClientActions?: <
    ClientActions extends Record<string, ClientAction>,
  >() => ClientCallableActions<ClientActions>
}

export type ActionFn<
  M extends ModelNotGeneric = ModelNotGeneric,
> = (
  parameters: ActionCbParameters<M>,
) => Awaited<ReturnValue>

export type Action<
  M extends ModelNotGeneric = ModelNotGeneric,
  F extends ActionFn<M> = ActionFn,
> = {
  /**
   * The model used for parameter validation
   */
  model: M
  /**
   * The action execution function
   */
  run: F
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionNotGeneric = Action<ModelNotGeneric, any>
type InferActionRun<Run> = Run extends (
  parameters: ActionCbParameters<infer M>,
) => infer R
  ? (parameters: ActionCbParameters<M>) => R
  : never
/**
 * Creates an action that validates input parameters and executes a callback function.
 * The action automatically validates parameters against the provided model before execution.
 * If validation fails, a ValidationError is thrown. The action can optionally receive
 * context and client actions for bidirectional communication.
 * @template Model - The model type for parameter validation
 * @template Callback - The callback function type
 * @param parameterModel - The model to validate parameters against
 * @param run - The callback function to execute with validated parameters
 * @returns An action object with the model and run function
 */
export function action<
  Model extends ModelNotGeneric,
  Run extends (
    parameters: ActionCbParameters<Model>,
  ) => unknown,
>(
  parameterModel: Model,
  run: Run,
): Action<Model, InferActionRun<Run>> {
  const validate = compileModelAndCheck(parameterModel)
  const actionFunction = (({
    params,
    ctx,
    getClientActions,
  }: ActionCbParameters<Model>) => {
    const errors = validate(params)
    if (errors) {
      throw new ValidationError(errors)
    }
    const parsedParams = parameterModel.onParse(
      params as never,
    )
    return run({
      params: parsedParams,
      ctx,
      getClientActions,
    })
  }) as InferActionRun<Run>
  return {
    run: actionFunction,
    model: parameterModel,
  }
}
