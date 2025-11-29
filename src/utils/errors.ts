import type { ErrorObject } from 'ajv'

/**
 * Error class with an HTTP status code.
 * Useful for returning errors with specific status codes from actions.
 * @group Utils
 * @example
 * ```ts
 * import { action, ErrorWithCode, m } from 'ggtype'
 *
 * const deleteUser = action(
 *   m.object({ id: m.string() }).isOptional(),
 *   async ({ params, ctx }) => {
 *     if (!ctx?.user) {
 *       throw new ErrorWithCode('Unauthorized', 401)
 *     }
 *
 *     if (params.id !== ctx.user.id) {
 *       throw new ErrorWithCode('Forbidden', 403)
 *     }
 *
 *     return { success: true }
 *   }
 * )
 * ```
 */
export class ErrorWithCode extends Error {
  public readonly code: number
  constructor(message: string, code: number) {
    super(message)
    this.code = code
  }
}

/**
 * Error class for validation failures.
 * Thrown automatically when action parameters fail validation.
 * Can also be thrown manually for custom validation logic.
 * @group Utils
 * @example
 * ```ts
 * import { action, ValidationError, m } from 'ggtype'
 *
 * const createUser = action(
 *   m.object({ email: m.string() }).isOptional(),
 *   async ({ params }) => {
 *     // Custom validation
 *     if (params.email.includes('spam')) {
 *       throw new ValidationError([
 *         {
 *           instancePath: '/email',
 *           schemaPath: '#/properties/email',
 *           keyword: 'custom',
 *           message: 'Email domain not allowed',
 *         },
 *       ])
 *     }
 *
 *     return { email: params.email }
 *   }
 * )
 * ```
 */
export class ValidationError extends Error {
  constructor(public errors?: ErrorObject[]) {
    super('Validation error')
  }
}
