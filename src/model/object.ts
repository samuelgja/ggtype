/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-shadow */
import {
  copyModel,
  getBaseModel,
  getSchemaBase,
  type GetSchemaOptions,
  type Model,
  type ModelNotGeneric,
  type OnValidate,
} from './model'
import { copy } from 'fast-copy'
import { isModel, isObject } from '../utils/is'
import type { JSONSchema7 } from 'json-schema'
import { setModelState } from './model-state'

// Ignore undefined properties
type Properties = {
  [key: string]: ModelNotGeneric | undefined
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface ObjectModel<
  T extends Properties,
  R extends boolean = true,
> extends Model<T, R> {
  /**
   * Inferred TypeScript type for the object model
   * Required properties are non-optional, optional properties are marked with ?
   */
  readonly infer: {
    [K in keyof T as T[K] extends ModelNotGeneric
      ? T[K]['$internals']['isRequired'] extends true
        ? K
        : never
      : never]: T[K] extends ModelNotGeneric
      ? T[K]['infer']
      : never
  } & {
    [K in keyof T as T[K] extends ModelNotGeneric
      ? T[K]['$internals']['isRequired'] extends false
        ? K
        : never
      : never]?: T[K] extends ModelNotGeneric
      ? T[K]['infer']
      : never
  }
  /**
   * Sets the maximum number of keys allowed in the object
   * @param maxKeys - Maximum number of keys
   * @returns A new ObjectModel instance with the constraint
   */
  readonly maxKeys: (maxKeys: number) => ObjectModel<T, R>
  /**
   * Sets the minimum number of keys required in the object
   * @param minKeys - Minimum number of keys
   * @returns A new ObjectModel instance with the constraint
   */
  readonly minKeys: (minKeys: number) => ObjectModel<T, R>
  /**
   * Marks the object model as optional
   * @returns A new ObjectModel instance marked as optional
   */
  readonly isOptional: () => ObjectModel<T, false>
  /**
   * Parses and validates an object according to the model
   * @param data - The object data to parse
   * @returns The parsed and validated object of type T
   */
  readonly onParse: (
    data: {
      [K in keyof T as T[K] extends ModelNotGeneric
        ? T[K]['$internals']['isRequired'] extends true
          ? K
          : never
        : never]: T[K] extends ModelNotGeneric
        ? T[K]['infer']
        : never
    } & {
      [K in keyof T as T[K] extends ModelNotGeneric
        ? T[K]['$internals']['isRequired'] extends false
          ? K
          : never
        : never]?: T[K] extends ModelNotGeneric
        ? T[K]['infer']
        : never
    },
  ) => T
  /**
   * Adds custom validation logic to the model
   * @param onValidate - Validation function that receives the parsed data
   * @returns A new ObjectModel instance with the validation function
   */
  readonly validate: (
    onValidate: OnValidate<T>,
  ) => ObjectModel<T, R>
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new ObjectModel instance with the updated title
   */
  readonly title: (name: string) => ObjectModel<T, R>
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new ObjectModel instance with the updated description
   */
  readonly description: (
    description: string,
  ) => ObjectModel<T, R>
}

/**
 * Creates an object model for validation and type inference.
 * Returns a model that validates objects with specified properties, where each property
 * has its own model for validation. Supports nested objects and optional/required properties.
 * @template T - The properties type
 * @template R - Whether the model is required
 * @param properties - Record of property names to their corresponding models
 * @returns An ObjectModel instance for validating objects with the specified structure
 * @example
 * ```ts
 * import { m } from 'ggtype'
 *
 * // Simple object
 * const userParams = m.object({
 *   id: m.string(),
 *   name: m.string(),
 *   email: m.string().isEmail(),
 *   age: m.number().minimum(0).maximum(120),
 * })
 *
 * // Nested object
 * const addressParams = m.object({
 *   street: m.string(),
 *   city: m.string(),
 *   zipCode: m.string(),
 * })
 *
 * const userWithAddress = m.object({
 *   id: m.string(),
 *   name: m.string(),
 *   address: addressParams,
 * })
 * ```
 */
export function object<
  T extends Properties,
  R extends boolean = true,
>(properties: T): ObjectModel<T, R> {
  const props: Record<string, ModelNotGeneric> = {}
  for (const key in properties) {
    const property = properties[key]
    if (property == undefined) {
      continue
    }
    if (!isModel(property)) {
      throw new Error(
        `Property "${key}" is not a valid model`,
      )
    }
    props[key] = property
  }
  const baseModel = getBaseModel<ObjectModel<T, R>>()
  baseModel.$internals.properties = props
  const model: ObjectModel<T, R> = {
    ...baseModel,
    validate(onValidate) {
      const copied = copyModel(this)
      copied.$internals.onValidate = onValidate
      return copied
    },
    onParse(data: unknown) {
      if (!data) return data as T
      if (!isObject(data)) {
        throw new Error('Invalid data')
      }

      // 1) detect unknown keys:
      const { properties } = this.$internals
      if (properties) {
        const extras = Object.keys(data).filter(
          (key) => !(key in properties),
        )
        if (extras.length > 0) {
          throw new Error(
            `Unknown propert${extras.length > 1 ? 'ies' : 'y'}: ${extras.join(', ')}`,
          )
        }
      }

      // 2) build newData, but skip self-references
      const newData: Record<string, unknown> =
        data as Record<string, unknown>
      for (const key in this.$internals.properties) {
        const property = this.$internals.properties[key]
        const raw = data[key]

        // if it’s one of our circular get(() => this) fields, just copy it verbatim
        newData[key] =
          isModel(property) &&
          property.$internals.id !== this.$internals.id
            ? property.onParse(raw as never)
            : raw
      }

      const { onValidate } = this.$internals
      if (onValidate) {
        onValidate(newData as never)
      }
      return newData as T
    },
    onStringify(data: T) {
      if (!data) return data
      if (!isObject(data)) return data
      const newData: Record<string, unknown> =
        data as Record<string, unknown>
      for (const key in data) {
        const property =
          this.$internals.properties?.[key as string]
        if (!property) {
          throw new Error(`Unknown property: ${key}`)
        }
        if (isModel(property)) {
          newData[key] = property.onStringify
            ? property.onStringify(data[key] as never)
            : data[key]
        }
      }
      return newData
    },
    isOptional(): ObjectModel<T, false> {
      const copied = copyModel(
        this,
      ) as unknown as ObjectModel<T, false>
      copied.$internals.isRequired = false
      return copied
    },
    maxKeys(maxKeys: number) {
      const copied = copyModel(this)
      copied.$internals.maxProperties = maxKeys
      return copied
    },
    minKeys(minKeys: number) {
      const copied = copyModel(this)
      copied.$internals.minProperties = minKeys
      return copied
    },
    getSchema(options?: GetSchemaOptions) {
      const jsonProperties: Record<string, JSONSchema7> = {}
      const requiredKeys: string[] = []

      const { properties } = this.$internals

      for (const key in properties) {
        const property = properties[key]
        if (property == undefined) {
          continue
        }
        const schema = property?.getSchema(options)
        if (!schema) {
          continue
        }
        jsonProperties[key] = copy(schema)

        if (property.$internals.isRequired) {
          requiredKeys.push(key)
        }
      }

      const schema: JSONSchema7 = {
        type: 'object',
        properties: jsonProperties,
        required: requiredKeys,
        additionalProperties: false,
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
