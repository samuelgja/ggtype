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

export interface DateModel<R extends boolean = false>
  extends Model<Date, R> {
  /**
   * Marks the date model as required
   * @returns A new DateModel instance marked as required
   */
  readonly isRequired: () => DateModel<true>
  /**
   * Inferred TypeScript type for the date model (always Date)
   */
  readonly infer: Date
  /**
   * Converts a Date to a string representation based on the format (time, date, or date-time)
   * @param data - The Date to stringify
   * @returns String representation of the date
   */
  readonly onStringify: (data: Date) => string
  /**
   * Validates the date as a time value (HH:mm:ss format)
   * @returns A new DateModel instance with time format validation
   */
  readonly isTime: () => DateModel<R>
  /**
   * Validates the date as a date value (YYYY-MM-DD format)
   * @returns A new DateModel instance with date format validation
   */
  readonly isDate: () => DateModel<R>
  /**
   * Validates the date as a date-time value (ISO 8601 format)
   * @returns A new DateModel instance with date-time format validation
   */
  readonly isDateTime: () => DateModel<R>
  /**
   * Sets the minimum date constraint
   * @param value - Minimum allowed date
   * @returns A new DateModel instance with the constraint
   */
  readonly minimum: (value: Date) => DateModel<R>
  /**
   * Sets the maximum date constraint
   * @param value - Maximum allowed date
   * @returns A new DateModel instance with the constraint
   */
  readonly maximum: (value: Date) => DateModel<R>
  /**
   * Sets the minimum date constraint using a Unix timestamp
   * @param value - Minimum allowed timestamp in milliseconds
   * @returns A new DateModel instance with the constraint
   */
  readonly minimumTimestamp: (value: number) => DateModel<R>
  /**
   * Sets the maximum date constraint using a Unix timestamp
   * @param value - Maximum allowed timestamp in milliseconds
   * @returns A new DateModel instance with the constraint
   */
  readonly maximumTimestamp: (value: number) => DateModel<R>
  /**
   * Adds custom validation logic to the model
   * @param onValidate - Validation function that receives the parsed date data
   * @returns A new DateModel instance with the validation function
   */
  readonly validate: (
    onValidate: OnValidate<Date>,
  ) => DateModel<R>
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new DateModel instance with the updated title
   */
  readonly title: (name: string) => DateModel<R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new DateModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => DateModel<R>
}

/**
 * Converts various data types to a Date object.
 * Handles string dates, Date instances, and returns undefined for invalid inputs.
 * @param data - The data to convert to a Date
 * @returns A Date object if conversion is possible, undefined otherwise
 */
function getDate(data: unknown) {
  if (typeof data === 'string') {
    return new Date(data)
  }
  if (data instanceof Date) {
    return data
  }
  return
}

/**
 * Creates a date model for validation and type inference.
 * Returns a model that validates Date values with optional custom validation.
 * Supports parsing from strings, numbers (timestamps), and Date instances.
 * @returns A DateModel instance for validating Date values
 */
export function date(): DateModel<false> {
  const baseModel = getBaseModel<DateModel<false>>()

  const model: DateModel<false> = {
    ...baseModel,
    validate(onValidate: (data: Date) => void) {
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
    onStringify(data: Date) {
      if (data == undefined || !data) return data
      if (!(data instanceof Date)) return data
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
    isRequired() {
      const copied = copyModel(
        this,
      ) as unknown as DateModel<true>
      copied.$internals.isRequired = true
      return copied
    },
    maximum(value: Date) {
      const unix = value.getTime()
      return this.maximumTimestamp(unix)
    },
    minimum(value: Date) {
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
