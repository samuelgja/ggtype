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
import { HttpStreamTransport } from '../../transport'
import type { StreamTransportOptions } from './transport-options'

/**
 * Handles HTTP stream transport for router client communication.
 * Creates a bidirectional stream, sends requests to the server, and processes responses.
 * Manages message encoding/decoding, response waiting, and error handling for stream transport.
 * Each stream() call creates a new long-lived HTTP stream connection.
 * @internal
 * @template R - The router type
 * @template Params - The parameters type
 * @param options - Stream transport options
 * @returns An AsyncStream of results
 */
export async function handleStreamTransport<
  R extends Router<
    Record<string, ActionNotGeneric>,
    Record<string, ClientAction>
  >,
  Params extends ParamsIt<R>,
>(
  options: StreamTransportOptions<R, Params>,
): Promise<
  AsyncStream<{
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }>
> {
  const {
    url,
    params,
    defineClientActions: defineClientActionsInput,
    waitingResponses,
    processClientData,
    headers,
    method = 'POST',
    keepAlive = true,
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

  const { readable, writable } = new TransformStream<
    Uint8Array,
    Uint8Array
  >()
  const writeTransport = new HttpStreamTransport(
    null,
    writable,
  )

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/octet-stream',
    ...headers,
  }
  if (keepAlive) {
    requestHeaders['Connection'] = 'keep-alive'
  }

  // Add timeout to fetch to detect connection failures quickly
  const abortController = new AbortController()
  const timeoutId = setTimeout(
    () => abortController.abort('Stream transport timeout'),
    2000,
  )

  type Result = {
    [P in keyof Params &
      keyof R['infer']['serverActions']]: ActionResult<
      R['infer']['serverActions'][P]['result']
    >
  }

  let isResolved = false

  // Create fetch promise for the HTTP stream connection
  const responsePromise: Promise<Response> = fetch(url, {
    method,
    headers: requestHeaders,
    body: readable,
    duplex: 'half',
    signal: abortController.signal,
  } as RequestInit).finally(() => {
    clearTimeout(timeoutId)
    isResolved = true
  })

  // Create the async stream that will yield results as they arrive
  const stream = new AsyncStream<Result>({
    async start(control) {
      const controller = createController(control)

      // Track how many actions have finished (for cleanup)
      const finishedCount = { value: 0 }
      const entryNames = Object.keys(params) as Array<
        keyof Params
      >
      const count = entryNames.length
      let isWriterClosed = false

      /**
       * Safely closes the write transport stream.
       * Idempotent - can be called multiple times safely.
       */
      const closeWriter = async () => {
        if (isWriterClosed) {
          return
        }
        isWriterClosed = true
        await writeTransport.close().catch(() => {
          // Ignore close errors - stream may already be closed
        })
      }

      // If no actions to execute, close immediately
      if (count === 0) {
        controller.close()
        await closeWriter()
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

              await writeTransport.write(
                clientActionMessage,
              )
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
              try {
                await writeTransport.write(
                  clientActionMessage,
                )
              } catch (writeError) {
                // Ignore stream closing errors - the stream may be closing
                if (writeError instanceof Error) {
                  const errorMessage = writeError.message
                  if (
                    !errorMessage.includes('closing') &&
                    !errorMessage.includes('closed') &&
                    !errorMessage.includes(
                      'stream is closing',
                    ) &&
                    !errorMessage.includes(
                      'stream is closing or closed',
                    )
                  ) {
                    throw writeError
                  }
                } else {
                  throw writeError
                }
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
            finishedCount.value++
            if (count === finishedCount.value) {
              controller.close()
              await closeWriter()
            }
          }
        }
      }

      /**
       * Creates a timeout handler for an action that triggers when the response timeout is exceeded.
       * Closes the controller with an error and manages cleanup when all actions are finished.
       * @param actionName - The name of the action this timeout handler is for
       * @returns A function that handles timeout errors
       */
      function createTimeoutHandler(
        actionName: keyof Params,
      ) {
        return () => {
          const error = new Error(
            'Timeout waiting for response for ' +
              String(actionName),
          )
          controller.error(error)
          finishedCount.value++
          if (count === finishedCount.value) {
            void closeWriter()
          }
        }
      }

      // Send all initial action request messages to the server
      for (const actionName of entryNames) {
        const id = createId()
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

        await writeTransport.write(routerMessage)

        waitingResponses.add(
          id,
          createMessageHandler(actionName, id),
          createTimeoutHandler(actionName),
        )
      }

      // Handle the HTTP response / stream
      let response: Response
      try {
        response = await responsePromise
      } catch (rawError) {
        // Fetch failed (e.g., network error, Safari abort errors when streaming is not supported)
        const error =
          rawError instanceof Error
            ? rawError
            : new Error(String(rawError))
        controller.error(error)
        await closeWriter()
        return
      }

      // Check if response is successful
      if (!response.ok || !response.body) {
        const httpError = new Error(
          `HTTP request failed: ${response.status} ${response.statusText}`,
        )
        controller.error(httpError)
        await closeWriter()
        return
      }

      // Create read transport for processing incoming messages from the server
      const readTransport = new HttpStreamTransport(
        response.body,
        null,
      )

      /**
       * Processes incoming messages from the server stream.
       * Reads messages continuously until the stream closes (message === null).
       */
      const processResponse = async () => {
        while (true) {
          const message = await readTransport.read()
          if (message === null) {
            // Stream closed - exit loop
            break
          }
          // Process the message and route it to the appropriate handler
          processClientData(message, waitingResponses)
        }
      }

      processResponse().catch((error) => {
        // Stream processing error (e.g., connection closed, read error)
        const streamError =
          error instanceof Error
            ? error
            : new Error('Stream processing error')
        controller.error(streamError)
      })
    },
  })

  if (!isResolved) {
    await responsePromise
  }

  // Return the stream - errors will be thrown when the stream is actually used
  return stream
}
