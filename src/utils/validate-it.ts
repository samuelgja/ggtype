import type { ValidateFunction } from 'ajv'

/**
 * Wraps an AJV validate function to return validation errors or null.
 * Converts the boolean return value of AJV validation to an errors array or null.
 * @group Utils
 * @internal
 * @param validate - The AJV validate function to wrap
 * @returns A function that returns validation errors or null
 */
export function validateIt(
  validate: ValidateFunction<unknown>,
) {
  return (data: unknown) => {
    const isValid = validate(data)
    if (isValid) {
      return null
    }
    return validate.errors || null
  }
}
