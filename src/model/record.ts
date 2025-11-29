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

export interface RecordModel<
  M extends ModelNotGeneric,
  R extends boolean = true,
> extends Model<M, R> {
  /**
   * Inferred TypeScript type for the record model (object with string keys and values matching the item model)
   */
  readonly infer: Record<string, M['infer']>
  /**
   * Marks the record model as optional
   * @returns A new RecordModel instance marked as optional
   */
  readonly isOptional: () => RecordModel<M, false>
  /**
   * Adds custom validation logic to the model
   * @param onValidate - Validation function that receives the parsed record data
   * @returns A new RecordModel instance with the validation function
   */
  readonly validate: (
    onValidate: (data: M) => void,
  ) => RecordModel<M, R>
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new RecordModel instance with the updated title
   */
  readonly title: (name: string) => RecordModel<M, R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new RecordModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => RecordModel<M, R>
}

/**
 * Creates a record model for validating objects with dynamic keys.
 * Returns a model that validates objects where all values match the provided item model,
 * regardless of the keys. Useful for dictionaries and key-value stores.
 * @template M - The model type for record values
 * @param item - The model to validate each value in the record against
 * @returns A RecordModel instance for validating record objects
 * @example
 * ```ts
 * import { m } from 'ggtype'
 *
 * // Record of strings (required by default)
 * const metadata = m.record(m.string())
 * // Valid: { key1: 'value1', key2: 'value2' }
 *
 * // Record of numbers
 * const scores = m.record(m.number())
 * // Valid: { user1: 100, user2: 200 }
 *
 * // Optional record
 * const optionalScores = m.record(m.number())
 *
 * // Record of objects
 * const userData = m.record(
 *   m.object({ name: m.string(), age: m.number() })
 * )
 * ```
 */
export function record<M extends ModelNotGeneric>(
  item: M,
): RecordModel<M, true> {
  const baseModel = getBaseModel<RecordModel<M, true>>()
  const model: RecordModel<M, true> = {
    ...baseModel,
    validate(onValidate) {
      const copied = copyModel(this)
      copied.$internals.onValidate = onValidate
      return copied
    },
    onParse(data: unknown) {
      if (typeof data !== 'object' || Array.isArray(data))
        return data as M

      const { onValidate } = this.$internals
      const parsed: Record<string, unknown> =
        data as Record<string, unknown>
      for (const key in data) {
        const itemData = (data as Record<string, unknown>)[
          key
        ]
        parsed[key] = isModel(item)
          ? item.onParse(itemData as never)
          : itemData
      }
      if (onValidate) {
        onValidate(parsed as never)
      }
      return parsed as M
    },
    onStringify(data: M) {
      if (data == null) return data
      if (typeof data !== 'object' || Array.isArray(data))
        return data
      const parsed: Record<string, unknown> =
        data as Record<string, unknown>
      for (const key in data) {
        const itemData = (data as Record<string, unknown>)[
          key
        ]
        parsed[key] =
          isModel(item) && item.onStringify
            ? item.onStringify(itemData as never)
            : itemData
      }
      return parsed
    },
    isOptional(): RecordModel<M, false> {
      const copied = copyModel(
        this,
      ) as unknown as RecordModel<M, false>
      copied.$internals.isRequired = false
      return copied
    },
    getSchema(options?: GetSchemaOptions) {
      const modelSchema = item.getSchema(options)
      const schema: JSONSchema7 = {
        type: 'object',
        additionalProperties: modelSchema,
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
