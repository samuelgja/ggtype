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

export interface OrModel<
  M extends ModelNotGeneric[],
  R extends boolean = true,
> extends Model<M[number], R> {
  /**
   * Inferred TypeScript type for the union model (union of all model inferred types)
   */
  readonly infer: M[number]['infer']
  /**
   * Marks the union model as optional
   * @returns A new OrModel instance marked as optional
   */
  readonly isOptional: () => OrModel<M, false>
  /**
   * Adds custom validation logic to the model
   * @param onValidate - Validation function that receives the parsed data
   * @returns A new OrModel instance with the validation function
   */
  readonly validate: (
    onValidate: (data: M) => void,
  ) => OrModel<M, R>
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new OrModel instance with the updated title
   */
  readonly title: (name: string) => OrModel<M, R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new OrModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => OrModel<M, R>
}

/**
 * Creates a union model that accepts any of the provided models.
 * Validates data against each model in sequence, returning the first successful match.
 * Creates a union type where the value can be any of the provided model types.
 * @template M - Array of model types to union
 * @param models - Variable number of models to create a union from
 * @returns An OrModel instance representing the union of all provided models
 * @example
 * ```ts
 * import { m } from 'ggtype'
 *
 * // Union of string or number (required by default)
 * const idOrName = m.or(m.string(), m.number())
 *
 * // Optional union
 * const optionalId = m.or(m.string(), m.number())
 *
 * // Union of different object types
 * const userOrAdmin = m.or(
 *   m.object({ type: m.enums('user'), name: m.string() }),
 *   m.object({ type: m.enums('admin'), role: m.string() })
 * )
 * ```
 */
export function or<M extends ModelNotGeneric[]>(
  ...models: M
): OrModel<M, true> {
  const baseModel = getBaseModel<OrModel<M, true>>()
  const model: OrModel<M, true> = {
    ...baseModel,
    validate(onValidate) {
      const copied = copyModel(this)
      copied.$internals.onValidate = onValidate
      return copied
    },
    onParse(data: unknown) {
      const { onValidate } = this.$internals

      const parsed = data as M[number] | undefined
      for (const item of models) {
        if (isModel(item) && item.onParse) {
          try {
            // Try to parse with each model
            const result = item.onParse(data as never)
            if (result !== undefined) {
              return result as M[number]
            }
          } catch {
            // Ignore and try next
          }
        }
      }

      if (onValidate) {
        onValidate(parsed as never)
      }
      return data as M[number]
    },
    onStringify(data: M) {
      if (data == null) return data
      for (const item of models) {
        if (isModel(item) && item.onStringify) {
          try {
            // Try to stringify with each model
            return item.onStringify(data as never)
          } catch {
            // Ignore and try next
          }
        }
      }
      return data
    },
    isOptional(): OrModel<M, false> {
      const copied = copyModel(this) as unknown as OrModel<
        M,
        false
      >
      copied.$internals.isRequired = false
      return copied
    },
    getSchema(options?: GetSchemaOptions) {
      const schemas: JSONSchema7[] = []
      for (const item of models) {
        const schema = item.getSchema(options)
        schemas.push(schema)
      }

      const schema: JSONSchema7 = {
        oneOf: schemas,
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
