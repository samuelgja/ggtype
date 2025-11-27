import type {
  AppError,
  RouterResultNotGeneric,
} from '../types'
import { ErrorWithCode, ValidationError } from './errors'

/**
 * Handles errors by processing them through an error handler and converting them to RouterResult format.
 * Processes ValidationError, ErrorWithCode, and generic Error instances, converting them to
 * standardized error responses. Returns undefined if the error handler suppresses the error.
 * @param onError - Error handler function that processes raw errors
 * @param rawError - The raw error that occurred
 * @returns A RouterResult with error status, or undefined if the error was suppressed
 */
export function handleError(
  onError: (error: Error) => Error,
  rawError: unknown,
): RouterResultNotGeneric | undefined {
  const error = onError(rawError as AppError)

  if (error instanceof ValidationError) {
    return {
      status: 'error',
      error: {
        code: 400,
        type: 'validation',
        errors: error.errors,
        message: error.message,
      },
    }
  } else if (error instanceof ErrorWithCode) {
    return {
      status: 'error',
      error: {
        code: error.code,
        type: 'generic',
        message: error.message,
        cause: error.cause,
      },
    }
  } else if (error instanceof Error) {
    return {
      status: 'error',
      error: {
        code: 400,
        type: 'generic',
        message: error.message,
        cause: error.cause,
      },
    }
  }
}
