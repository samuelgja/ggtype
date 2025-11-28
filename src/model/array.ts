import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
  type ModelNotGeneric,
} from './model'
import { isModel } from '../utils/is'
import type { JSONSchema7 } from 'json-schema'
import { setModelState } from './model-state'

export interface ArrayModel<
  T extends ModelNotGeneric,
  R extends boolean = false,
> extends Model<T[], R> {
  /**
   * Sets the maximum number of items allowed in the array
   * @param length - Maximum number of items
   * @returns A new ArrayModel instance with the constraint
   */
  readonly maxItems: (length: number) => ArrayModel<T, R>
  /**
   * Sets the minimum number of items required in the array
   * @param length - Minimum number of items
   * @returns A new ArrayModel instance with the constraint
   */
  readonly minItems: (length: number) => ArrayModel<T, R>
  /**
   * Inferred TypeScript type for the array model (array of the item model's inferred type)
   */
  readonly infer: T['infer'][]
  /**
   * Marks the array model as required
   * @returns A new ArrayModel instance marked as required
   */
  readonly isRequired: () => ArrayModel<T, true>
  /**
   * Adds custom validation logic to the model
   * @param onValidate - Validation function that receives the parsed array data
   * @returns A new ArrayModel instance with the validation function
   */
  readonly validate: (
    onValidate: (data: T[]) => void,
  ) => ArrayModel<T, R>
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new ArrayModel instance with the updated title
   */
  readonly title: (name: string) => ArrayModel<T, R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new ArrayModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => ArrayModel<T, R>
}

/**
 * Creates an array model for validation and type inference.
 * Returns a model that validates arrays of items matching the provided model type,
 * with optional constraints like min/max items and custom validation.
 * @template T - The model type for array items
 * @param list - The model to validate each array item against
 * @returns An ArrayModel instance for validating arrays of the specified type
 * @example
 * ```ts
 * import { m } from 'ggtype'
 *
 * // Array of strings
 * const tags = m.array(m.string()).isRequired()
 *
 * // Array of numbers
 * const scores = m.array(m.number()).minItems(1).maxItems(10)
 *
 * // Array of objects
 * const users = m.array(
 *   m.object({
 *     id: m.string().isRequired(),
 *     name: m.string().isRequired(),
 *   })
 * ).isRequired()
 * ```
 */
export function array<T extends ModelNotGeneric>(
  list: T,
): ArrayModel<T, false> {
  const baseModel = getBaseModel<ArrayModel<T, false>>()
  const model: ArrayModel<T, false> = {
    ...baseModel,
    validate(onValidate) {
      const copied = copyModel(this)
      copied.$internals.onValidate = onValidate
      return copied
    },
    onParse(data: unknown) {
      if (!Array.isArray(data)) return data as T[]
      const { onValidate } = this.$internals
      const parsed = data as T[]
      for (const item of parsed) {
        if (isModel(list) && list.onParse) {
          try {
            // Try to parse each item
            list.onParse(item as never)
          } catch {
            // Ignore and continue
          }
        }
      }
      if (onValidate) {
        onValidate(parsed as never)
      }
      return parsed as T[]
    },
    onStringify(data: T[]) {
      if (!data) return data
      if (!Array.isArray(data)) return data

      const newData = data as ModelNotGeneric['infer'][]
      for (let index = 0; index < newData.length; index++) {
        const item = newData[index]
        if (isModel(list) && list.onStringify) {
          try {
            // Try to stringify each item
            newData[index] = list.onStringify(item as never)
          } catch {
            // Ignore and continue
          }
        }
      }
      return newData
    },
    isRequired(): ArrayModel<T, true> {
      const copied = copyModel(
        this,
      ) as unknown as ArrayModel<T, true>
      copied.$internals.isRequired = true
      return copied
    },
    maxItems(length: number) {
      const copied = copyModel(this)
      copied.$internals.maxItems = length
      return copied
    },
    minItems(length: number) {
      const copied = copyModel(this)
      copied.$internals.minItems = length
      return copied
    },
    getSchema(options?: GetSchemaOptions) {
      const schema: JSONSchema7 = {
        type: 'array',
        items: { ...list.getSchema(options) },
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
