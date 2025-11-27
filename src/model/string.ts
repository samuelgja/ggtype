import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
  type OnValidate,
} from './model'
import type { JSONSchema7 } from 'json-schema'
import { setModelState } from './model-state'

export interface StringModel<
  R extends boolean = false,
> extends Model<string, R> {
  /**
   * Sets the maximum length constraint for the string
   * @param length - Maximum number of characters
   * @returns A new StringModel instance with the constraint
   */
  readonly maxLength: (length: number) => StringModel<R>
  /**
   * Sets the minimum length constraint for the string
   * @param length - Minimum number of characters
   * @returns A new StringModel instance with the constraint
   */
  readonly minLength: (length: number) => StringModel<R>
  /**
   * Sets a regular expression pattern for string validation
   * @param pattern - Regular expression pattern
   * @returns A new StringModel instance with the pattern constraint
   */
  readonly regex: (pattern: RegExp) => StringModel<R>
  /**
   * Marks the string model as required
   * @returns A new StringModel instance marked as required
   */
  readonly isRequired: () => StringModel<true>
  /**
   * Validates the string as an email address
   * @returns A new StringModel instance with email format validation
   */
  readonly isEmail: () => StringModel<R>
  /**
   * Validates the string as a password
   * @returns A new StringModel instance with password format validation
   */
  readonly isPassword: () => StringModel<R>
  /**
   * Adds custom validation logic to the model
   * @param onValidate - Validation function that receives the parsed string data
   * @returns A new StringModel instance with the validation function
   */
  readonly validate: (
    onValidate: OnValidate<string>,
  ) => StringModel<R>
  /**
   * Inferred TypeScript type for the string model (always string)
   */
  readonly infer: string
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new StringModel instance with the updated title
   */
  readonly title: (name: string) => StringModel<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new StringModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => StringModel<R>
}

/**
 * Creates a string model for validation and type inference.
 * Returns a model that validates string values with optional constraints like
 * min/max length, regex patterns, email/password formats, and custom validation.
 * @returns A StringModel instance for validating string values
 */
export function string(): StringModel<false> {
  const baseModel = getBaseModel<StringModel<false>>()
  const model: StringModel<false> = {
    ...baseModel,
    $internals: baseModel.$internals,
    validate(onValidate) {
      const copied = copyModel(this)
      copied.$internals.onValidate = onValidate
      return copied
    },
    onParse(data: unknown) {
      const { onValidate } = this.$internals
      if (onValidate) {
        onValidate(data as never)
      }
      return data as string
    },
    isRequired(): StringModel<true> {
      const copied = copyModel(
        this,
      ) as unknown as StringModel<true>
      copied.$internals.isRequired = true
      return copied
    },
    isEmail() {
      const copied = copyModel(this)
      // copied.schema.format = 'email'
      copied.$internals.format = 'email'
      return copied
    },
    isPassword() {
      const copied = copyModel(this)
      copied.$internals.format = 'password'
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
    regex(pattern: RegExp) {
      const copied = copyModel(this)
      copied.$internals.pattern = pattern.source
      return copied
    },
    getSchema(options?: GetSchemaOptions) {
      const schema: JSONSchema7 = {
        type: 'string',
        ...getSchemaBase(this),
      }
      if (this.$internals.maxLength) {
        schema.maxLength = this.$internals.maxLength
      }
      if (this.$internals.minLength) {
        schema.minLength = this.$internals.minLength
      }
      if (this.$internals.pattern) {
        schema.pattern = this.$internals.pattern
      }
      if (this.$internals.format) {
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
