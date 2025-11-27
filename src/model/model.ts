import { getModelId } from '../utils/get-model-id'
import { copy } from 'fast-copy'
import type {
  JSONSchema7,
  JSONSchema7Type,
} from 'json-schema'
import { modelsState } from './model-state'

export type OnValidate<T> = (data: T) => void
export interface ModelInternalsNotGeneric {
  /**
   * Whether the model field is required
   */
  isRequired: boolean
  /**
   * Whether the model represents an array type
   */
  isArray: boolean
  /**
   * Type marker indicating this is a model (always true)
   */
  isModel: true
  /**
   * Format string for validation (e.g., 'email', 'date-time')
   */
  format?: string
  /**
   * Maximum length constraint for strings
   */
  maxLength?: number
  /**
   * Minimum length constraint for strings
   */
  minLength?: number
  /**
   * Regular expression pattern for string validation
   */
  pattern?: string
  /**
   * Maximum number of properties for objects
   */
  maxProperties?: number
  /**
   * Minimum number of properties for objects
   */
  minProperties?: number
  /**
   * Maximum number of items for arrays
   */
  maxItems?: number
  /**
   * Properties definition for object models
   */
  properties?: Record<string, ModelNotGeneric | undefined>
  /**
   * Minimum number of items for arrays
   */
  minItems?: number
  /**
   * Minimum value constraint for numbers
   */
  minimum?: number
  /**
   * Maximum value constraint for numbers
   */
  maximum?: number
  /**
   * Default value for the model
   */
  default?: JSONSchema7Type
  /**
   * Exclusive minimum value constraint for numbers
   */
  exclusiveMinimum?: number
  /**
   * Exclusive maximum value constraint for numbers
   */
  exclusiveMaximum?: number
  /**
   * Enum values for string validation
   */
  enums: string[]
  /**
   * Human-readable title for the model
   */
  title: string
  /**
   * Human-readable description for the model
   */
  description: string
  /**
   * Unique identifier for the model
   */
  id: string
  /**
   * Optional custom validation function
   */
  onValidate?: OnValidate<never>
}
export interface ModelInternals<R extends boolean>
  extends ModelInternalsNotGeneric {
  /**
   * Whether the model field is required (type-safe boolean)
   */
  isRequired: R
}

export interface GetSchemaOptions {
  /**
   * Whether to return just a reference schema (default: false)
   */
  readonly justRef?: boolean
  /**
   * Set of model IDs that have been referenced (used for tracking dependencies)
   */
  readonly usedRefs?: Set<string>
}

export interface ModelBase {
  /**
   * Inferred TypeScript type for the model
   */
  infer: unknown
  /**
   * Internal model configuration and metadata
   */
  $internals: ModelInternalsNotGeneric
  /**
   * Sets a human-readable title for the model
   * @param name - The title to set
   * @returns A new model instance with the updated title
   */
  title: (name: string) => ModelNotGeneric
  /**
   * Sets a human-readable description for the model
   * @param description - The description to set
   * @returns A new model instance with the updated description
   */
  description: (description: string) => ModelNotGeneric
  /**
   * Gets the JSON Schema representation of the model
   * @param options - Optional schema generation options
   * @returns The JSON Schema object
   */
  getSchema: (options?: GetSchemaOptions) => JSONSchema7
  /**
   * Gets the JSON Schema with references (compact form)
   * @returns The JSON Schema object with $defs for referenced models
   */
  getSchemaRef: () => JSONSchema7
}
export interface ModelNotGeneric extends ModelBase {
  /**
   * Optional function to transform data when stringifying (for serialization)
   */
  onStringify?: (data: never) => unknown
  /**
   * Function to parse and validate data according to the model
   */
  onParse: (data: never) => unknown
  /**
   * Marks the model as required
   * @returns A new model instance marked as required
   */
  isRequired: () => ModelNotGeneric
}
export interface Model<T, R extends boolean = false>
  extends ModelNotGeneric {
  /**
   * Function to parse and validate data according to the model, returning typed result
   * @param data - The data to parse
   * @returns The parsed and validated data of type T
   */
  readonly onParse: (data: unknown) => T
  /**
   * Internal model configuration and metadata with type-safe required flag
   */
  $internals: ModelInternals<R>
}

/**
 * Creates a base model instance with default internals and common methods.
 * Returns a model object with title, description, and getSchemaRef methods.
 * Used as a foundation for creating specific model types.
 * @template M - The model base type to create
 * @returns A base model instance with default configuration
 */
export function getBaseModel<M extends ModelBase>(): M {
  const $internals = getInternals()
  return {
    $internals,
    title(name: string) {
      const copied = copyModel(this)
      copied.$internals.title = name
      return copied
    },
    description(description: string) {
      const copied = copyModel(this)
      copied.$internals.description = description
      return copied
    },
    getSchemaRef(): JSONSchema7 {
      const usedRefs = new Set<string>()
      const schema = this.getSchema({
        justRef: true,
        usedRefs,
      })
      const definitions: Record<string, JSONSchema7> = {}
      for (const ref of usedRefs) {
        const refSchema = modelsState.get(ref)
        if (!refSchema) {
          throw new Error(`Model with id ${ref} not found`)
        }
        definitions[ref] = refSchema
      }
      schema.$defs = definitions
      return schema
    },
  } as M
}

/**
 * Extracts base schema properties (title and description) from a model.
 * Returns an object containing the title and description from the model's internals.
 * @param model - The model to extract schema base from
 * @returns An object with title and description properties
 */
export function getSchemaBase(model: ModelBase) {
  return {
    title: model.$internals.title,
    description: model.$internals.description,
  }
}

/**
 * Creates default model internals with a unique ID.
 * Returns a new internals object with default values for model configuration.
 * Each call generates a new unique model ID.
 * @returns A new model internals object with default values
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getInternals(): any {
  return {
    id: getModelId(),
    isRequired: false,
    isArray: false,
    isModel: true,
  }
}

/**
 * Creates a deep copy of a model with a new unique ID.
 * Copies all model properties and internals, but assigns a new unique ID to the copy.
 * This is used when creating modified versions of models (e.g., adding constraints).
 * @template T - The model type to copy
 * @param model - The model to copy
 * @returns A deep copy of the model with a new unique ID
 */
export function copyModel<T extends ModelBase>(
  model: T,
): T {
  const copied = copy(model)
  copied.$internals.id = getModelId()
  return copied
}
