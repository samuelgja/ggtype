type Intersect<T> = (
  T extends unknown ? (x: T) => void : never
) extends (x: infer I) => void
  ? I
  : never

import { type Model, type ModelNotGeneric } from './model'
import { getModelId } from '../utils/get-model-id'
import { object } from './object'
import { copyModel } from './model'

export interface And<
  M extends ModelNotGeneric[],
  R extends boolean = true,
> extends Model<Intersect<M[number]>, R> {
  /**
   * Inferred TypeScript type for the intersection model (intersection of all model inferred types)
   */
  readonly infer: Intersect<M[number]['infer']>
  /**
   * Marks the intersection model as optional
   * @returns A new And instance marked as optional
   */
  readonly isOptional: () => And<M, false>
  /**
   * Adds custom validation logic to the model
   * @param onValidate - Validation function that receives the parsed data
   * @returns A new And instance with the validation function
   */
  readonly validate: (
    onValidate: (data: M) => void,
  ) => And<M, R>
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new And instance with the updated title
   */
  readonly title: (name: string) => And<M, R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new And instance with the updated description
   */
  readonly description: (description: string) => And<M, R>
}

/**
 * Creates an intersection model that combines multiple object models.
 * Merges all properties from the provided models into a single object model,
 * creating an intersection type. Useful for composing complex object structures.
 * @template M - Array of model types to intersect
 * @param models - Variable number of models to combine
 * @returns An And instance representing the intersection of all provided models
 * @example
 * ```ts
 * import { m } from 'ggtype'
 *
 * // Base user model
 * const userBase = m.object({
 *   id: m.string(),
 *   name: m.string(),
 * })
 *
 * // Role model
 * const roleModel = m.object({
 *   role: m.enums('admin', 'user'),
 *   permissions: m.array(m.string()),
 * })
 *
 * // Combined user with role (required by default)
 * const userWithRole = m.and(userBase, roleModel)
 * // Result: { id: string, name: string, role: 'admin' | 'user', permissions?: string[] }
 * ```
 */
export function and<M extends ModelNotGeneric[]>(
  ...models: M
): And<M, true> {
  const id = getModelId()
  let fullProps: Record<string, ModelNotGeneric> = {}
  for (const item of models) {
    const { properties } = item.$internals
    if (properties) {
      fullProps = { ...fullProps, ...properties } as Record<
        string,
        ModelNotGeneric
      >
    }
  }
  const model = object(fullProps)
  model.$internals.id = id

  // Override isRequired/isOptional logic for AndModel
  const andModel = model as unknown as And<M, true>

  // Create a new object with the correct isOptional method
  const result: And<M, true> = {
    ...andModel,
    isOptional(): And<M, false> {
      const copied = copyModel(this) as unknown as And<
        M,
        false
      >
      copied.$internals.isRequired = false
      return copied
    },
  }

  return result
}
