type Intersect<T> = (
  T extends unknown ? (x: T) => void : never
) extends (x: infer I) => void
  ? I
  : never

import { type Model, type ModelNotGeneric } from './model'
import { getModelId } from '../utils/get-model-id'
import { object } from './object'

export interface AndModel<
  M extends ModelNotGeneric[],
  R extends boolean = false,
> extends Model<Intersect<M[number]>, R> {
  /**
   * Inferred TypeScript type for the intersection model (intersection of all model inferred types)
   */
  readonly infer: Intersect<M[number]['infer']>
  /**
   * Marks the intersection model as required
   * @returns A new AndModel instance marked as required
   */
  readonly isRequired: () => AndModel<M, true>
  /**
   * Adds custom validation logic to the model
   * @param onValidate - Validation function that receives the parsed data
   * @returns A new AndModel instance with the validation function
   */
  readonly validate: (
    onValidate: (data: M) => void,
  ) => AndModel<M, R>
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new AndModel instance with the updated title
   */
  readonly title: (name: string) => AndModel<M, R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new AndModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => AndModel<M, R>
}

/**
 * Creates an intersection model that combines multiple object models.
 * Merges all properties from the provided models into a single object model,
 * creating an intersection type. Useful for composing complex object structures.
 * @template M - Array of model types to intersect
 * @param models - Variable number of models to combine
 * @returns An AndModel instance representing the intersection of all provided models
 */
export function and<M extends ModelNotGeneric[]>(
  ...models: M
): AndModel<M, false> {
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

  return model as never
}
