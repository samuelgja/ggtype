import type { ModelNotGeneric } from '../model/model'
import type {
  ClientAction,
  ClientCallableActions,
} from '../router/router.client.types'
import { compileModelAndCheck } from '../utils/compile-model'
import { ValidationError } from '../utils/errors'

/**
 * Extracts and types the context object from an unknown value.
 * This is a type-safe way to access the context passed to actions.
 * @group Router
 * @template T - The expected type of the context
 * @param ctx - The context value (typically unknown)
 * @returns The context cast to type T
 * @example
 * ```ts
 * import { action, getCtx, m } from 'ggtype'
 *
 * interface UserContext {
 *   user: { id: string; name: string }
 * }
 *
 * const deleteUser = action(
 *   m.object({ id: m.string() }).isOptional(),
 *   async ({ params, ctx }) => {
 *     // Type-safe context extraction
 *     const { user } = getCtx<UserContext>(ctx)
 *
 *     if (user.id !== params.id) {
 *       throw new Error('Unauthorized')
 *     }
 *
 *     return { success: true }
 *   }
 * )
 * ```
 */
export function getCtx<T>(ctx: unknown): T {
  return ctx as T
}

/**
 * Possible return value types for actions.
 * @group Router
 */
export type ReturnValue =
  | ModelNotGeneric['infer']
  | void
  | null

/**
 * Parameters passed to action callback functions.
 * @group Router
 * @template M - The model type for parameters
 */
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
   * Function to get client actions for bidirectional communication.
   * Always available - returns empty object if no client actions are defined.
   */
  readonly clientActions: <
    ClientActions extends Record<string, ClientAction>,
  >() => ClientCallableActions<ClientActions>
  /**
   * Optional map of uploaded files keyed by file ID
   */
  readonly files?: ReadonlyMap<string, File>
}

/**
 * Function type for action callbacks.
 * @group Router
 * @template M - The model type for parameters
 */
export type ActionFn<
  M extends ModelNotGeneric = ModelNotGeneric,
> = (
  parameters: ActionCbParameters<M>,
) => Awaited<ReturnValue>

/**
 * Action definition with model and execution function.
 * @group Router
 * @template M - The model type for parameters
 * @template F - The action function type
 */
export type Action<
  M extends ModelNotGeneric = ModelNotGeneric,
  F extends ActionFn<M> = ActionFn,
> = {
  /**
   * The model used for parameter validation
   */
  readonly model: M
  /**
   * The action execution function
   */
  readonly run: F
}

/**
 * Non-generic action type for internal use.
 * This type accepts any action with a ModelNotGeneric model and any compatible run function.
 * The run function signature is intentionally flexible to accept all action implementations.
 * @group Router
 * @internal
 */
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
 * @group Router
 * @template Model - The model type for parameter validation
 * @template Run - The callback function type
 * @param parameterModel - The model to validate parameters against
 * @param run - The callback function to execute with validated parameters. See ActionCbParameters interface for parameter details.
 * @returns An action object with the model and run function
 * @example
 * ```ts
 * import { action, m } from 'ggtype'
 *
 * // Define parameter model
 * const userParams = m.object({
 *   id: m.string(),
 *   name: m.string(),
 *   email: m.string().isEmail(),
 * }).isOptional()
 *
 * // Create action with validated parameters
 * const createUser = action(userParams, async ({ params }) => {
 *   // params is fully typed and validated
 *   return {
 *     id: params.id,
 *     name: params.name,
 *     email: params.email,
 *     createdAt: new Date(),
 *   }
 * })
 *
 * // Action with context and client actions
 * const updateUser = action(userParams, async ({ params, ctx, clientActions }) => {
 *   const user = ctx?.user
 *   if (!user) {
 *     throw new Error('Unauthorized')
 *   }
 *
 *   // Call client action for notification (always available - returns empty object if not defined)
 *   const { showNotification } = clientActions()
 *   await showNotification?.({
 *     message: 'User updated!',
 *     type: 'success',
 *   })
 *
 *   return { ...params, updatedAt: new Date() }
 * })
 * ```
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
    clientActions: clientActions,
    files,
  }: ActionCbParameters<Model>) => {
    // Handle null/undefined for optional models
    if (
      (params === null || params === undefined) &&
      !parameterModel.$internals.isRequired
    ) {
      // For optional models, null/undefined is valid
      const parsedParams = parameterModel.onParse(
        params as never,
      )
      return run({
        params: parsedParams,
        ctx,
        clientActions,
        files,
      })
    }

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
      clientActions,
      files,
    })
  }) as InferActionRun<Run>
  return {
    run: actionFunction,
    model: parameterModel,
  }
}
