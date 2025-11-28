import { NOOP_ON_ERROR } from '..'
import { handleError } from '../utils/handle-error'
import {
  isRouterMessage,
  type RouterMessage,
} from './router-message'
import type {
  ClientAction,
  ClientCallableActionsFromClient,
} from './router-client.types-shared'

/**
 * Helper function to define client action models with proper typing.
 * This is a type-only function that returns the input unchanged, used for type inference.
 * @template T - The client actions record type
 * @param data - The client actions record to define
 * @returns The same data with proper typing
 * @example
 * ```ts
 * import { defineClientActionsSchema, m } from 'ggtype'
 *
 * // Define client actions schema for server-side
 * const clientActions = defineClientActionsSchema({
 *   showNotification: {
 *     params: m.object({
 *       message: m.string().isRequired(),
 *       type: m.string().isRequired(),
 *     }),
 *     return: m.object({ acknowledged: m.boolean() }),
 *   },
 *   updateUI: {
 *     params: m.object({
 *       component: m.string().isRequired(),
 *       data: m.record(m.string()),
 *     }),
 *     return: m.object({ success: m.boolean() }),
 *   },
 * })
 *
 * // Use with createRouter
 * const router = createRouter({
 *   serverActions: { /* ... */ },
 *   clientActions,
 *   transport: 'stream',
 * })
 * ```
 */
export function defineClientActionsSchema<
  T extends Record<string, ClientAction>,
>(data: T): T {
  return data
}

/**
 * Creates a handler function for processing client action messages.
 * Parses incoming messages, validates them, executes the corresponding client action,
 * and returns a serialized response. Handles errors and converts them to proper error messages.
 * @template Actions - The client actions record type
 * @param clientActions - Record of client action handlers
 * @returns An async function that processes raw messages and returns serialized responses
 */
export function handleClientActions<
  Actions extends Record<string, ClientAction>,
>(clientActions: ClientCallableActionsFromClient<Actions>) {
  const parseMessage = JSON.parse
  const serializeMessage = JSON.stringify

  /**
   * Parses and processes a raw client action message.
   * Validates the message format, looks up the corresponding client action handler,
   * executes it with the message data, and returns a RouterMessage with the result.
   * Handles errors and converts them to error messages.
   * @param rawMessage - The raw message to parse and process
   * @returns A RouterMessage with the action result or error
   */
  async function parseAction(
    rawMessage: unknown,
  ): Promise<RouterMessage> {
    const message = parseMessage(rawMessage as never)
    if (!isRouterMessage(message)) {
      throw new Error('Invalid message format')
    }
    const action = clientActions[message.action]
    if (!action) {
      throw new Error(`Action ${message.action} not found`)
    }

    try {
      const clientAction = await action(message.data)
      return {
        action: message.action,
        status: 'ok',
        data: clientAction,
        id: message.id,
        clientId: message.clientId,
      }
    } catch (rawError) {
      const error = handleError(NOOP_ON_ERROR, rawError)

      return {
        id: message.id,
        action: message.action,
        status: 'error',
        ...error,
        clientId: message.clientId,
      }
    }
  }

  return async function (rawMessage: unknown) {
    const parsed = await parseAction(rawMessage)
    return serializeMessage(parsed)
  }
}
