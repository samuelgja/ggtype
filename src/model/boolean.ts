import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
} from './model'
import type { JSONSchema7 } from 'json-schema'
import { setModelState } from './model-state'

export interface Boolean<
  R extends boolean = true,
> extends Model<boolean, R> {
  /**
   * Marks the boolean model as optional
   * @returns A new Boolean instance marked as optional
   */
  readonly isOptional: () => Boolean<false>
  /**
   * Inferred TypeScript type for the boolean model (always boolean)
   */
  readonly infer: boolean
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new Boolean instance with the updated title
   */
  readonly title: (name: string) => Boolean<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new Boolean instance with the updated description
   */
  readonly description: (description: string) => Boolean<R>
}

/**
 * Creates a boolean model for validation and type inference.
 * Returns a model that validates boolean values with optional required constraint.
 * @returns A Boolean instance for validating boolean values
 * @example
 * ```ts
 * import { m } from 'ggtype'
 *
 * // Basic boolean (required by default)
 * const isActive = m.boolean()
 *
 * // Optional boolean
 * const isPublished = m.boolean()
 *
 * // Use in object
 * const userParams = m.object({
 *   name: m.string(),
 *   isActive: m.boolean(),
 *   isVerified: m.boolean(),
 * })
 * ```
 */
export function boolean(): Boolean<true> {
  const baseModel = getBaseModel<Boolean<true>>()
  const model: Boolean<true> = {
    ...baseModel,
    onParse: (data: unknown) => data as boolean,
    isOptional() {
      const copied = copyModel(
        this,
      ) as unknown as Boolean<false>
      copied.$internals.isRequired = false
      return copied
    },
    getSchema(options?: GetSchemaOptions) {
      const schema: JSONSchema7 = {
        type: 'boolean',
        ...getSchemaBase(this),
      }
      return setModelState({
        schema,
        $internal: this.$internals,
        ...options,
      })
    },
  }
  return model
}
