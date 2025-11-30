import type { JSONSchema7 } from 'json-schema'
import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
} from './model'
import { setModelState } from './model-state'

export interface Null<
  R extends boolean = true,
> extends Model<null, R> {
  /**
   * Marks the null model as optional
   * @returns A new Null instance marked as optional
   */
  readonly isOptional: () => Null<false>
  /**
   * Inferred TypeScript type for the null model (always null)
   */
  readonly infer: null
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new Null instance with the updated title
   */
  readonly title: (name: string) => Null<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new Null instance with the updated description
   */
  readonly description: (description: string) => Null<R>
}

/**
 * Creates a null model for validation and type inference.
 * Returns a model that validates null values with optional required constraint.
 * @returns A Null instance for validating null values
 * @example
 * ```ts
 * import { m } from 'ggtype'
 *
 * // Nullable field
 * const optionalField = m.nullable()
 *
 * // Use with or for optional values
 * const optionalString = m.or(m.string(), m.nullable())
 *
 * // Use in object
 * const userParams = m.object({
 *   name: m.string(),
 *   deletedAt: m.nullable(),
 * })
 * ```
 */
export function nullable(): Null<true> {
  const baseModel = getBaseModel<Null<true>>()
  const model: Null<true> = {
    ...baseModel,
    onParse: (data: unknown) => data as null,
    isOptional() {
      const copied = copyModel(
        this,
      ) as unknown as Null<false>
      copied.$internals.isRequired = false
      return copied
    },
    getSchema(options?: GetSchemaOptions) {
      const schema: JSONSchema7 = {
        type: 'null',
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
