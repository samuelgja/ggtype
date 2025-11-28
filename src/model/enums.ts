import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
} from './model'
import type { JSONSchema7 } from 'json-schema'
import { setModelState } from './model-state'

export interface EnumModel<
  T extends string,
  R extends boolean = false,
> extends Model<T, R> {
  /**
   * Sets the maximum length constraint for the enum string
   * @param length - Maximum number of characters
   * @returns A new EnumModel instance with the constraint
   */
  readonly maxLength: (length: number) => EnumModel<T, R>
  /**
   * Sets the minimum length constraint for the enum string
   * @param length - Minimum number of characters
   * @returns A new EnumModel instance with the constraint
   */
  readonly minLength: (length: number) => EnumModel<T, R>
  /**
   * Sets a regular expression pattern for enum validation
   * @param pattern - Regular expression pattern
   * @returns A new EnumModel instance with the pattern constraint
   */
  readonly pattern: (pattern: RegExp) => EnumModel<T, R>
  /**
   * Restricts the enum to only the specified values
   * @param values - Allowed enum values
   * @returns A new EnumModel instance with restricted values
   */
  readonly only: <N extends T[]>(
    ...values: N
  ) => EnumModel<N[number], R>
  /**
   * Marks the enum model as required
   * @returns A new EnumModel instance marked as required
   */
  readonly isRequired: () => EnumModel<T, true>
  /**
   * Sets a default value for the enum
   * @param value - Default enum value
   * @returns A new EnumModel instance with the default value
   */
  readonly default: (value: T) => EnumModel<T, R>
  /**
   * Inferred TypeScript type for the enum model (string literal union)
   */
  readonly infer: T
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new EnumModel instance with the updated title
   */
  readonly title: (name: string) => EnumModel<T, R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new EnumModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => EnumModel<T, R>
}

/**
 * Creates an enum model for validation and type inference.
 * Returns a model that validates string values against a set of allowed enum values.
 * Supports additional string constraints like min/max length, regex patterns, and default values.
 * @template T - The enum string literal type
 * @param enumParameters - Array of allowed string values for the enum
 * @returns An EnumModel instance for validating enum string values
 * @example
 * ```ts
 * import { m } from 'ggtype'
 *
 * // Simple enum
 * const role = m.enums('admin', 'user', 'guest').isRequired()
 *
 * // Enum with default
 * const status = m.enums('pending', 'active', 'inactive')
 *   .default('pending')
 *   .isRequired()
 *
 * // Use in object
 * const userParams = m.object({
 *   role: m.enums('admin', 'user').isRequired(),
 *   status: m.enums('active', 'inactive').isRequired(),
 * })
 * ```
 */
export function enums<T extends string>(
  ...enumParameters: T[]
): EnumModel<T, false> {
  const baseModel = getBaseModel<EnumModel<T, false>>()
  baseModel.$internals.enums = enumParameters
  const model: EnumModel<T, false> = {
    ...baseModel,
    onParse: (data: unknown) => data as T,
    isRequired(): EnumModel<T, true> {
      const copied = copyModel(
        this,
      ) as unknown as EnumModel<T, true>
      copied.$internals.isRequired = true
      return copied
    },
    default(value: T) {
      const copied = copyModel(this)
      copied.$internals.default = value
      return copied
    },
    maxLength(length: number) {
      const copied = copyModel(this)
      copied.$internals.maxLength = length
      return copied
    },
    minLength(length: number) {
      const copied = copyModel(this)
      copied.$internals.minLength = length
      return copied
    },
    only<N extends T[]>(...values: N) {
      const copied = copyModel(this)
      copied.$internals.enums = values
      return copied as unknown as EnumModel<
        N[number],
        false
      >
    },
    pattern(pattern: RegExp) {
      const copied = copyModel(this)
      copied.$internals.pattern = pattern.source
      return copied
    },
    getSchema(options?: GetSchemaOptions) {
      const schema: JSONSchema7 = {
        type: 'string',
        enum: this.$internals.enums,
        ...getSchemaBase(this),
      }

      if (this.$internals.default !== undefined) {
        schema.default = this.$internals.default
      }
      if (this.$internals.maxLength !== undefined) {
        schema.maxLength = this.$internals.maxLength
      }
      if (this.$internals.minLength !== undefined) {
        schema.minLength = this.$internals.minLength
      }
      if (this.$internals.pattern !== undefined) {
        schema.pattern = this.$internals.pattern
      }
      if (this.$internals.format !== undefined) {
        schema.format = this.$internals.format
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
