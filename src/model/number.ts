import type { JSONSchema7 } from 'json-schema'
import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
} from './model'
import { setModelState } from './model-state'

export interface NumberModel<R extends boolean = false>
  extends Model<number, R> {
  /**
   * Sets the minimum value constraint for the number
   * @param minimum - Minimum allowed value
   * @returns A new NumberModel instance with the constraint
   */
  readonly minimum: (minimum: number) => NumberModel<R>
  /**
   * Sets the maximum value constraint for the number
   * @param maximum - Maximum allowed value
   * @returns A new NumberModel instance with the constraint
   */
  readonly maximum: (maximum: number) => NumberModel<R>
  /**
   * Validates that the number is positive (greater than 0)
   * @returns A new NumberModel instance with positive validation
   */
  readonly positive: () => NumberModel<R>
  /**
   * Validates that the number is negative (less than 0)
   * @returns A new NumberModel instance with negative validation
   */
  readonly negative: () => NumberModel<R>
  /**
   * Marks the number model as required
   * @returns A new NumberModel instance marked as required
   */
  readonly isRequired: () => NumberModel<true>
  /**
   * Adds custom validation logic to the model
   * @param onValidate - Validation function that receives the parsed number data
   * @returns A new NumberModel instance with the validation function
   */
  readonly validate: (
    onValidate: (data: number) => void,
  ) => NumberModel<R>
  /**
   * Inferred TypeScript type for the number model (always number)
   */
  readonly infer: number
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new NumberModel instance with the updated title
   */
  readonly title: (name: string) => NumberModel<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new NumberModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => NumberModel<R>
}

/**
 * Creates a number model for validation and type inference.
 * Returns a model that validates number values with optional constraints like
 * minimum/maximum values, positive/negative checks, and custom validation.
 * @returns A NumberModel instance for validating number values
 */
export function number(): NumberModel<false> {
  const baseModel = getBaseModel<NumberModel<false>>()
  const model: NumberModel<false> = {
    ...baseModel,
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
      return data as number
    },
    isRequired() {
      const copied = copyModel(
        this,
      ) as unknown as NumberModel<true>
      copied.$internals.isRequired = true
      return copied
    },
    minimum(minimum: number) {
      const copied = copyModel(this)
      copied.$internals.minimum = minimum
      return copied
    },
    maximum(maximum: number) {
      const copied = copyModel(this)
      copied.$internals.maximum = maximum
      return copied
    },
    positive() {
      const copied = copyModel(this)
      copied.$internals.exclusiveMinimum = 0
      return copied
    },
    negative() {
      const copied = copyModel(this)
      copied.$internals.exclusiveMaximum = 0
      return copied
    },
    getSchema(options?: GetSchemaOptions) {
      const schema: JSONSchema7 = {
        type: 'number',
        ...getSchemaBase(this),
      }
      if (this.$internals.minimum !== undefined) {
        schema.minimum = this.$internals.minimum
      }
      if (this.$internals.maximum !== undefined) {
        schema.maximum = this.$internals.maximum
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
