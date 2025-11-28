import Ajv, { type Options } from 'ajv'
import addFormats from 'ajv-formats'
import type { ModelNotGeneric } from '../model/model'

const ajvDefaultOptions: Options = {
  allErrors: false, // Disable reporting all errors
  verbose: false, // Disable verbose output
  removeAdditional: false, // Don't remove additional properties
  useDefaults: false, // Don't assign default values to missing properties
  coerceTypes: false, // Don't coerce types
  // formats: {}, // Disable format validation if you don't need it
  strict: false, // Disable strict mode
  code: { source: true, esm: true, optimize: 2 }, // Enable source code generation
}

export const AJV = new Ajv(ajvDefaultOptions)

addFormats(AJV, {
  mode: 'fast',
  formats: [
    'date',
    'time',
    'date-time',
    'email',
    'password',
  ],
})

/**
 * Compiles a model for testing purposes, validating both full and compact schemas.
 * Creates validation functions for both the full schema and schema with references.
 * @group Utils
 * @internal
 * @template T - The model type
 * @param model - The model to compile for testing
 * @returns A validation function that checks both full and compact schemas
 */
export function compileTestModel<T extends ModelNotGeneric>(
  model: T,
) {
  const validate = AJV.compile(model.getSchema())
  const validateWithRefs = AJV.compile(model.getSchemaRef())

  /**
   * Validates data against the full schema after parsing and stringifying.
   * @param data - The data to validate
   * @returns True if validation passes, false otherwise
   */
  function validateFull(data: T['infer']): boolean {
    try {
      const parsedData = model.onParse(data as never)
      const stringifiedData = model.onStringify
        ? model.onStringify(parsedData as never)
        : parsedData
      const result = validate(stringifiedData)
      return result
    } catch {
      return false
    }
  }

  /**
   * Validates data against the compact schema (with references) after parsing and stringifying.
   * @param data - The data to validate
   * @returns True if validation passes, false otherwise
   */
  function validateCompact(data: T['infer']): boolean {
    try {
      const parsedData = model.onParse(data as never)
      const stringifiedData = model.onStringify
        ? model.onStringify(parsedData as never)
        : parsedData
      const result = validateWithRefs(stringifiedData)
      return result
    } catch {
      return false
    }
  }
  return function (data: T['infer']): boolean {
    const isValid = validateFull(data)
    if (isValid) {
      return validateCompact(data)
    }
    return false
  }
}

/**
 * Compiles a model into a validation function that checks data against the model's schema.
 * Uses AJV to compile the model's schema reference and returns a function that validates data.
 * Returns validation errors if the data doesn't match the schema, or null if valid.
 * @group Utils
 * @template T - The model type
 * @param model - The model to compile
 * @returns A validation function that returns validation errors or null
 */
export function compileModelAndCheck<
  T extends ModelNotGeneric,
>(model: T) {
  const __compiled = model.getSchemaRef()
  const validate = AJV.compile(__compiled)

  return (data: T['infer']) => {
    const isValid = validate(
      model.onStringify
        ? model.onStringify(data as never)
        : data,
    )

    if (isValid) {
      return null
    }
    return validate.errors || null
  }
}
