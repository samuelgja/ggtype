import type { JSONSchema7 } from 'json-schema'
import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
} from './model'
import { setModelState } from './model-state'

export interface NullModel<
  R extends boolean = false,
> extends Model<null, R> {
  /**
   * Marks the null model as required
   * @returns A new NullModel instance marked as required
   */
  readonly isRequired: () => NullModel<true>
  /**
   * Inferred TypeScript type for the null model (always null)
   */
  readonly infer: null
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new NullModel instance with the updated title
   */
  readonly title: (name: string) => NullModel<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new NullModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => NullModel<R>
}

/**
 * Creates a null model for validation and type inference.
 * Returns a model that validates null values with optional required constraint.
 * @returns A NullModel instance for validating null values
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
 *   name: m.string().isRequired(),
 *   deletedAt: m.nullable(),
 * })
 * ```
 */
export function nullable(): NullModel<false> {
  const baseModel = getBaseModel<NullModel<false>>()
  const model: NullModel<false> = {
    ...baseModel,
    onParse: (data: unknown) => data as null,
    isRequired() {
      const copied = copyModel(
        this,
      ) as unknown as NullModel<true>
      copied.$internals.isRequired = true
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
