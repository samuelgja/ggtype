import type {
  ActionResultError,
  RouterResultNotGeneric,
  ActionResultOk,
  OutputError,
  OutputErrorGeneric,
  OutputValidationError,
} from '../types'
import type { ModelNotGeneric } from '../model'
import { AsyncStream } from './async-stream'
import type { StreamMessage } from '../router/router.type'
/**
 * Type guard to check if a value is a plain object (not null, not array).
 * @group Utils
 * @param value - The value to check
 * @returns True if the value is a plain object
 */
export function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}
/**
 * Type guard to check if a value is a string.
 * @group Utils
 * @param value - The value to check
 * @returns True if the value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}
/**
 * Type guard to check if a value is a number.
 * @group Utils
 * @param value - The value to check
 * @returns True if the value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

/**
 * Type guard to check if a value is a model instance.
 * Checks for the presence of $internals with isModel property.
 * @group Utils
 * @param value - The value to check
 * @returns True if the value is a model instance
 */
export function isModel(
  value: unknown,
): value is ModelNotGeneric {
  if (!isObject(value)) {
    return false
  }
  if (!('$internals' in value)) {
    return true
  }
  const { $internals } = value
  if (!isObject($internals)) {
    return false
  }

  if (
    'isModel' in $internals &&
    typeof $internals['isModel'] === 'boolean'
  ) {
    return $internals['isModel']
  }
  return false
}

/**
 * Type guard to check if a router result is an error result.
 * @group Utils
 * @template T - The error type
 * @param result - The router result to check
 * @returns True if the result has error status
 * @example
 * ```ts
 * import { createRouterClient, isError } from 'ggtype'
 *
 * const client = createRouterClient({
 *   url: 'http://localhost:3000',
 *   transport: 'http',
 * })
 *
 * const results = await client.fetch({
 *   getUser: { id: '123' },
 * })
 *
 * if (isError(results.getUser)) {
 *   // TypeScript knows results.getUser.error exists
 *   console.error('Error:', results.getUser.error.message)
 * }
 * ```
 */
export function isError<T>(
  result: RouterResultNotGeneric,
): result is ActionResultError<T> {
  if (!result) {
    return false
  }
  return result.status === 'error'
}

/**
 * Type guard to check if a router result is a success result.
 * @group Utils
 * @template T - The data type
 * @param result - The router result to check
 * @returns True if the result has ok status
 * @example
 * ```ts
 * import { createRouterClient, isSuccess } from 'ggtype'
 *
 * const client = createRouterClient({
 *   url: 'http://localhost:3000',
 *   transport: 'http',
 * })
 *
 * const results = await client.fetch({
 *   getUser: { id: '123' },
 * })
 *
 * if (isSuccess(results.getUser)) {
 *   // TypeScript knows results.getUser.data exists
 *   console.log('User:', results.getUser.data)
 * }
 * ```
 */
export function isSuccess<T>(
  result: RouterResultNotGeneric,
): result is ActionResultOk<T> {
  if (!result) {
    return false
  }
  return result.status === 'ok'
}

/**
 * Type guard to check if an error is a validation error.
 * @group Utils
 * @param error - The error to check
 * @returns True if the error is a validation error
 */
export function isValidationError(
  error?: OutputError,
): error is OutputValidationError {
  if (!error) {
    return false
  }
  return error.type === 'validation'
}

/**
 * Type guard to check if an error is a generic error.
 * @group Utils
 * @param error - The error to check
 * @returns True if the error is a generic error
 */
export function isGenericError(
  error: OutputError,
): error is OutputErrorGeneric {
  return error.type === 'generic'
}
/**
 * Type guard to check if a value is an AsyncStream or ReadableStream.
 * @group Utils
 * @template T - The stream item type
 * @param value - The value to check
 * @returns True if the value is an AsyncStream or ReadableStream
 */
export function isAsyncStream<T>(
  value: unknown,
): value is AsyncStream<T> {
  return (
    value instanceof AsyncStream ||
    value instanceof ReadableStream
  )
}

/**
 * Type guard to check if a value is an async iterable.
 * @group Utils
 * @template T - The iterable item type
 * @param object - The value to check
 * @returns True if the value is an async iterable
 */
export function isAsyncIterable<T>(
  object: unknown,
): object is AsyncIterable<T> {
  return (
    isObject(object) &&
    typeof (object as unknown as AsyncIterable<T>)[
      Symbol.asyncIterator
    ] === 'function'
  )
}

/**
 * Type guard to check if a value is an iterable.
 * @group Utils
 * @param object - The value to check
 * @returns True if the value is an iterable
 */
export function isIterable(
  object: unknown,
): object is Iterable<unknown> {
  return (
    isObject(object) &&
    typeof (object as unknown as Iterable<unknown>)[
      Symbol.iterator
    ] === 'function'
  )
}

export function isStream<T>(
  object: unknown,
): object is
  | ReadableStream
  | AsyncStream<T>
  | AsyncIterable<T> {
  return (
    isAsyncIterable(object) ||
    isAsyncStream(object) ||
    isIterable(object)
  )
}

export function hasStreamData(message: StreamMessage) {
  const hasData =
    'data' in message ||
    'file' in message ||
    'error' in message
  return hasData
}

/**
 * Checks if any action result in the response has a specific HTTP status code.
 * Useful in onResponse callbacks to check for specific error codes like 401 (Unauthorized).
 * @group Utils
 * @param json - The response object containing action results (from onResponse callback)
 * @param statusCode - The HTTP status code to check for
 * @returns True if any action result has an error with the specified status code
 * @example
 * ```ts
 * import { createRouterClient, hasStatusCode } from 'ggtype'
 *
 * const client = createRouterClient<Router>({
 *   httpURL: 'http://localhost:3000',
 *   async onResponse({ json, runAgain }) {
 *     const isUnauthorized = hasStatusCode(json, 401)
 *     if (isUnauthorized) {
 *       // Handle unauthorized error
 *       // e.g., refresh token and retry
 *       return runAgain()
 *     }
 *   },
 * })
 * ```
 */
export function hasStatusCode(
  json: Record<string, RouterResultNotGeneric>,
  statusCode: number,
): boolean {
  if (!isObject(json)) {
    return false
  }

  for (const result of Object.values(json)) {
    if (
      result &&
      result.status === 'error' &&
      result.error?.code === statusCode
    ) {
      return true
    }
  }

  return false
}
