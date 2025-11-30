import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
  type OnValidate,
} from './model'
import { isNumber } from '../utils/is'
import type { ErrorObject } from 'ajv'
import { ValidationError } from '../utils/errors'
import type { JSONSchema7 } from 'json-schema'
import { setModelState } from './model-state'

export interface Date<
  R extends boolean = true,
> extends Model<globalThis.Date, R> {
  /**
   * Marks the date model as optional
   * @returns A new Date instance marked as optional
   */
  readonly isOptional: () => Date<false>
  /**
   * Inferred TypeScript type for the date model (always Date)
   */
  readonly infer: globalThis.Date
  /**
   * Converts a Date to a string representation based on the format (time, date, or date-time)
   * @param data - The Date to stringify
   * @returns String representation of the date
   */
  readonly onStringify: (data: globalThis.Date) => string
  /**
   * Validates the date as a time value (HH:mm:ss format)
   * @returns A new Date instance with time format validation
   */
  readonly isTime: () => Date<R>
  /**
   * Validates the date as a date value (YYYY-MM-DD format)
   * @returns A new Date instance with date format validation
   */
  readonly isDate: () => Date<R>
  /**
   * Validates the date as a date-time value (ISO 8601 format)
   * @returns A new Date instance with date-time format validation
   */
  readonly isDateTime: () => Date<R>
  /**
   * Sets the minimum date constraint
   * @param value - Minimum allowed date
   * @returns A new Date instance with the constraint
   */
  readonly minimum: (value: globalThis.Date) => Date<R>
  /**
   * Sets the maximum date constraint
   * @param value - Maximum allowed date
   * @returns A new Date instance with the constraint
   */
  readonly maximum: (value: globalThis.Date) => Date<R>
  /**
   * Sets the minimum date constraint using a Unix timestamp
   * @param value - Minimum allowed timestamp in milliseconds
   * @returns A new Date instance with the constraint
   */
  readonly minimumTimestamp: (value: number) => Date<R>
  /**
   * Sets the maximum date constraint using a Unix timestamp
   * @param value - Maximum allowed timestamp in milliseconds
   * @returns A new Date instance with the constraint
   */
  readonly maximumTimestamp: (value: number) => Date<R>
  /**
   * Adds custom validation logic to the model
   * @param onValidate - Validation function that receives the parsed date data
   * @returns A new Date instance with the validation function
   */
  readonly validate: (
    onValidate: OnValidate<globalThis.Date>,
  ) => Date<R>
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new Date instance with the updated title
   */
  readonly title: (name: string) => Date<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new Date instance with the updated description
   */
  readonly description: (description: string) => Date<R>
}

/**
 * Converts various data types to a Date object.
 * Handles string dates, Date instances, and returns undefined for invalid inputs.
 * @param data - The data to convert to a Date
 * @returns A Date object if conversion is possible, undefined otherwise
 */
function getDate(data: unknown) {
  if (typeof data === 'string') {
    return new globalThis.Date(data)
  }
  if (data instanceof globalThis.Date) {
    return data
  }
  return
}

/**
 * Creates a date model for validation and type inference.
 * Returns a model that validates Date values with optional custom validation.
 * Supports parsing from strings, numbers (timestamps), and Date instances.
 * @returns A Date instance for validating Date values
 * @example
 * ```ts
 * import { m } from 'ggtype'
 *
 * // Basic date (required by default)
 * const createdAt = m.date()
 *
 * // Optional date
 * const publishedAt = m.date()
 *
 * // Use in object
 * const postParams = m.object({
 *   title: m.string(),
 *   createdAt: m.date(),
 *   publishedAt: m.date(),
 * })
 * ```
 */
export function date(): Date<true> {
  const baseModel = getBaseModel<Date<true>>()

  const model: Date<true> = {
    ...baseModel,
    validate(onValidate: (data: globalThis.Date) => void) {
      const copied = copyModel(this)
      copied.$internals.onValidate = onValidate
      return copied
    },
    onParse(value: unknown) {
      const dateValue = getDate(value)
      if (!dateValue) {
        return undefined as never
      }

      const { onValidate, maximum, minimum } =
        this.$internals
      if (
        isNumber(minimum) &&
        dateValue.getTime() < minimum
      ) {
        const errors: ErrorObject[] = [
          {
            message: 'Date is below minimum',
            keyword: 'minimum',
            instancePath: '',
            params: { limit: minimum },
            schemaPath: '',
          },
        ]
        throw new ValidationError(errors)
      }
      if (
        isNumber(maximum) &&
        dateValue.getTime() > maximum
      ) {
        const errors: ErrorObject[] = [
          {
            message: 'Date is above maximum',
            keyword: 'maximum',
            instancePath: '',
            params: { limit: maximum },
            schemaPath: '',
          },
        ]
        throw new ValidationError(errors)
      }
      if (onValidate) {
        onValidate(dateValue as never)
      }
      return dateValue
    },
    onStringify(data: globalThis.Date) {
      if (data == undefined || !data) return data
      if (!(data instanceof globalThis.Date)) return data
      switch (this.$internals.format) {
        case 'time': {
          return data.toISOString().split('T')[1]
        }
        case 'date': {
          return data.toISOString().split('T')[0]
        }
        default: {
          return data.toISOString()
        }
      }
    },
    isTime() {
      const copied = copyModel(this)
      copied.$internals.format = 'time'
      return copied
    },
    isDate() {
      const copied = copyModel(this)
      copied.$internals.format = 'date'
      return copied
    },
    isDateTime() {
      const copied = copyModel(this)
      copied.$internals.format = 'date-time'
      return copied
    },
    isOptional() {
      const copied = copyModel(
        this,
      ) as unknown as Date<false>
      copied.$internals.isRequired = false
      return copied
    },
    maximum(value: globalThis.Date) {
      const unix = value.getTime()
      return this.maximumTimestamp(unix)
    },
    minimum(value: globalThis.Date) {
      const unix = value.getTime()
      return this.minimumTimestamp(unix)
    },
    minimumTimestamp(value: number) {
      const copied = copyModel(this)
      copied.$internals.minimum = value
      return copied
    },
    maximumTimestamp(value: number) {
      const copied = copyModel(this)
      copied.$internals.maximum = value
      return copied
    },
    getSchema(options?: GetSchemaOptions) {
      const schema: JSONSchema7 = {
        type: 'string',
        format: 'date-time',
        ...getSchemaBase(this),
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
