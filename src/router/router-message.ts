/* eslint-disable sonarjs/prefer-single-boolean-return */
import type { RouterResultNotGeneric } from '../types'
import { isObject, isString } from '../utils/is'
type BufferType = 'blob' | 'file'
export interface RouterMessage
  extends RouterResultNotGeneric {
  /**
   * Unique message identifier
   */
  id: string
  /**
   * Action name associated with this message
   */
  action: string
  /**
   * Client ID (present for client action responses)
   */
  clientId?: string
  /**
   * Whether this is the last message in a stream
   */
  isLast?: boolean
  /**
   * Buffer identifier for file/blob data
   */
  bufferId?: string
  /**
   * Type of buffer: 'blob' or 'file'
   */
  bufferType?: BufferType
}

/**
 * Type guard to check if a value is a valid RouterMessage.
 * Validates that the message is an object with required string properties: id, action, and status.
 * @param message - The value to check
 * @returns True if the value is a valid RouterMessage, false otherwise
 */
export function isRouterMessage(
  message: unknown,
): message is RouterMessage {
  // return isObject(message) && 'id' in message && 'action' in message && 'status' in message
  if (!isObject(message)) {
    return false
  }
  const { id, action, status } = message
  if (!isString(id)) {
    return false
  }
  if (!isString(action)) {
    return false
  }
  if (!isString(status)) {
    return false
  }
  return true
}
