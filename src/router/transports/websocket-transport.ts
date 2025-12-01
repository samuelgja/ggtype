/* eslint-disable sonarjs/cognitive-complexity */
import type { ActionNotGeneric } from '../../action/action'
import {
  NOOP_ON_ERROR,
  type ActionResult,
  type RouterResultNotGeneric,
} from '../../types'
import { handleError } from '../../utils/handle-error'
import type { RouterMessage } from '../router-message'
import { AsyncStream } from '../../utils/async-stream'
import { createId } from '../../utils/create-id'
import { isError } from '../../utils/is'
import { createController } from '../../utils/stream-helpers'
import type { ClientAction } from '../router-client.types-shared'
import type { Router } from '../../types'
import type { ParamsIt } from '../router-client.types'
import type { WebSocketTransportOptions } from './transport-options'

/**
 * Handles WebSocket transport for router client communication.
 * Uses a persistent connection manager to send requests and process responses.
 * Manages message encoding/decoding, response waiting, error handling, and client action handling for WebSocket transport.
 * @internal
 * @template R - The router type
 * @template Params - The parameters type
 * @param options - WebSocket transport options
 * @returns An AsyncStream of results
 */
export async function handleWebSocketTransport<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
>(
  options: WebSocketTransportOptions<R, Params>,
): Promise<
  AsyncStream<{
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }>
> {
  const {
    connectionManager,
    params,
    defineClientActions: defineClientActionsInput,
    waitingResponses,
  } = options

  // Create an isolated copy of defineClientActions to avoid race conditions
  // when multiple concurrent streams are active
  const defineClientActions: Record<string, unknown> = {}
  for (const key in defineClientActionsInput) {
    if (
      Object.prototype.hasOwnProperty.call(
        defineClientActionsInput,
        key,
      )
    ) {
      defineClientActions[key] =
        defineClientActionsInput[key]
    }
  }

  type Result = {
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }

  return new AsyncStream<Result>({
    async start(control) {
      const controller = createController(control)

      // Track how many actions have finished (for cleanup)
      const finishedCount = { value: 0 }
      const entryNames = Object.keys(params) as Array<
        keyof Params
      >
      const count = entryNames.length

      // Get or create WebSocket connection from the connection manager
      // The connection manager handles connection pooling and reconnection
      const transport =
        await connectionManager.getConnection()
      if (!transport) {
        // Connection failed - throw error
        const error = new Error(
          'Failed to establish WebSocket connection',
        )
        controller.error(error)
        return
      }

      // If no actions to execute, close immediately
      if (count === 0) {
        controller.close()
        return
      }

      /**
       * Creates a message handler for processing incoming router messages for a specific action.
       * Handles both regular server responses and client action calls from the server.
       * Manages response completion tracking and cleanup.
       * @param actionName - The name of the action this handler is for
       * @param id - The message ID to track responses
       * @returns An async function that processes incoming messages
       */
      function createMessageHandler(
        actionName: keyof Params,
        id: string,
      ) {
        return async (incomingMessage: RouterMessage) => {
          // Handle client action calls (server calling client-side functions)
          if (incomingMessage.clientId) {
            try {
              const clientAction = defineClientActions[
                incomingMessage.action
              ] as (data: unknown) => Promise<unknown>
              if (!clientAction) {
                throw new Error(
                  `Client action not found: ${incomingMessage.action}`,
                )
              }
              if (isError(incomingMessage)) {
                controller.enqueue({
                  [incomingMessage.action]:
                    incomingMessage.error,
                } as unknown as Result)
                return
              }

              const clientActionResult = await clientAction(
                incomingMessage.data,
              )

              const clientActionMessage: RouterMessage = {
                id: incomingMessage.id,
                action: incomingMessage.action,
                status: 'ok',
                data: clientActionResult,
                clientId: incomingMessage.clientId,
                bufferType:
                  clientActionResult instanceof File ||
                  clientActionResult instanceof Blob
                    ? 'file'
                    : undefined,
              }

              if (transport) {
                await transport.write(clientActionMessage)
              }
            } catch (rawError) {
              const error = handleError(
                NOOP_ON_ERROR,
                rawError,
              )
              controller.enqueue({
                [incomingMessage.action]: error?.error,
              } as unknown as Result)
              const clientActionMessage: RouterMessage = {
                id: incomingMessage.id,
                action: incomingMessage.action,
                status: 'error',
                error: error?.error,
                clientId: incomingMessage.clientId,
              }
              if (transport) {
                await transport.write(clientActionMessage)
              }
            }
            return
          }

          // Handle normal server action response
          const { isLast } = incomingMessage
          const isErrorAndNotClient =
            !incomingMessage.clientId &&
            isError(incomingMessage)
          const isFinish = isLast || isErrorAndNotClient

          const result: RouterResultNotGeneric = {
            status: incomingMessage.status,
            data: incomingMessage.data,
            error: incomingMessage.error,
          }
          controller.enqueue({
            [actionName]: result,
          } as Result)

          if (isFinish) {
            waitingResponses.delete(id)
            connectionManager.markRequestCompleted(id)
            finishedCount.value++
            if (count === finishedCount.value) {
              controller.close()
            }
          }
        }
      }

      /**
       * Creates a timeout handler for an action that triggers when the response timeout is exceeded.
       * Closes the controller with an error and manages cleanup when all actions are finished.
       * @param actionName - The name of the action this timeout handler is for
       * @param id - The message ID
       * @returns A function that handles timeout errors
       */
      function createTimeoutHandler(
        actionName: keyof Params,
        id: string,
      ) {
        return () => {
          const error = new Error(
            'Timeout waiting for response for ' +
              String(actionName),
          )
          controller.error(error)
          connectionManager.markRequestCompleted(id)
          finishedCount.value++
          if (count === finishedCount.value) {
            controller.close()
          }
        }
      }

      // Send all initial action request messages to the server
      for (const actionName of entryNames) {
        const id = createId()
        // Mark request as pending in the connection manager
        connectionManager.markRequestPending(id)
        const actionParams = params[actionName]
        const routerMessage: RouterMessage = {
          action: String(actionName),
          data: actionParams,
          id,
          status: 'ok',
          bufferType:
            actionParams instanceof File ||
            actionParams instanceof Blob
              ? 'file'
              : undefined,
        }

        await transport.write(routerMessage)

        waitingResponses.add(
          id,
          createMessageHandler(actionName, id),
          createTimeoutHandler(actionName, id),
        )
      }
    },
  })
}
