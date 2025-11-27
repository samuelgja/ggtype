import type {
  ActionResultError,
  RouterResultNotGeneric,
  ActionResultOk,
  OutputError,
  OutputErrorGeneric,
  OutputValidationError,
  TransportType,
} from '../types'
import type { ModelNotGeneric } from '../model'
import { AsyncStream } from './async-stream'
/**
 * Type guard to check if a value is a plain object (not null, not array).
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
 * @param value - The value to check
 * @returns True if the value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}
/**
 * Type guard to check if a value is a number.
 * @param value - The value to check
 * @returns True if the value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

/**
 * Type guard to check if a value is a model instance.
 * Checks for the presence of $internals with isModel property.
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
 * @template T - The error type
 * @param result - The router result to check
 * @returns True if the result has error status
 */
export function isErrorResult<T>(
  result: RouterResultNotGeneric,
): result is ActionResultError<T> {
  if (!result) {
    return false
  }
  return result.status === 'error'
}

/**
 * Type guard to check if a router result is a success result.
 * @template T - The data type
 * @param result - The router result to check
 * @returns True if the result has ok status
 */
export function isOkResult<T>(
  result: RouterResultNotGeneric,
): result is ActionResultOk<T> {
  if (!result) {
    return false
  }
  return result.status === 'ok'
}

/**
 * Type guard to check if an error is a validation error.
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

/**
 * Type guard to check if a transport type is HTTP.
 * @param transport - The transport type to check
 * @returns True if the transport is 'http'
 */
export function isHttpTransport(
  transport: TransportType | undefined,
): transport is 'http' {
  return transport === 'http'
}

/**
 * Type guard to check if a transport type is Stream.
 * @param transport - The transport type to check
 * @returns True if the transport is 'stream'
 */
export function isStreamTransport(
  transport: TransportType | undefined,
): transport is 'stream' {
  return transport === 'stream'
}

/**
 * Type guard to check if a transport type is WebSocket.
 * @param transport - The transport type to check
 * @returns True if the transport is 'websocket'
 */
export function isWsTransport(
  transport: TransportType | undefined,
): transport is 'websocket' {
  return transport === 'websocket'
}
