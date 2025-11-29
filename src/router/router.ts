import { type ActionNotGeneric } from '../action/action'
import {
  NOOP_ON_ERROR,
  NOOP_CLIENT_ACTIONS,
  type RouterResultNotGeneric,
} from '../types'
import { handleError } from '../utils/handle-error'
import type {
  ClientAction,
  ClientActionResult,
  ClientCallableActions,
  ClientCallableActionsBefore,
} from './router-client.types-shared'
import { clearMap } from '../utils/clear-map'
import { compileModelAndCheck } from '../utils/compile-model'
import { createId } from '../utils/create-id'
import { ValidationError } from '../utils/errors'
import {
  isAsyncIterable,
  isAsyncStream,
  isIterable,
} from '../utils/is'
import { markLast } from '../utils/stream-helpers'
import type { RouterMessage } from './router-message'
import {
  DEFAULT_ROUTER_TIMEOUT,
  type Router,
  type RouterOptions,
  type OnRequest,
  type OnWebSocketMessage,
  type SendErrorOptions,
  type SendMessageToClient,
  type HandleStream,
} from '../types'
import type { Transport } from '../transport'
import {
  HttpStreamTransport,
  WebSocketTransport,
} from '../transport'

interface Key {
  readonly id: string
  readonly clientId: string
}

const TRANSPORT_SYMBOL = Symbol('transport')
const PROCESSORS_SYMBOL = Symbol('processors')

/**
 * Sends an error message to the client via the transport layer.
 * Processes the raw error through the error handler, creates a RouterMessage with error details,
 * and sends it to the client. If the error handler suppresses the error, nothing is sent.
 * @internal
 * @param options - Options containing error handling configuration and transport
 * @returns The processed error result, or undefined if the error was suppressed
 */
function sendErrorMessage(
  options: SendErrorOptions & { transport: Transport },
) {
  const {
    onError,
    action,
    rawError,
    clientId,
    id,
    transport,
  } = options
  const error = handleError(onError, rawError)
  if (!error) {
    return
  }

  const message: RouterMessage = {
    id: id ?? createId(),
    clientId,
    action,
    ...error,
  }
  transport.write(message).catch(() => {
    // Ignore write errors
  })
  return error
}

/**
 * Creates a new router instance for handling server actions and client actions.
 * The router manages bidirectional communication between server and client, supporting
 * both HTTP stream and WebSocket transports. It handles action execution, error handling,
 * and response management with timeout support. Server actions can call client actions
 * and wait for their responses, enabling full bidirectional RPC communication.
 * @group Router
 * @template Actions - The type of server actions record
 * @template ClientActions - The type of client actions record
 * @param options - Router configuration options
 * @returns A router instance with `onRequest` and optional `onWebSocketMessage` handlers
 * @example
 * ```ts
 * import { action, createRouter, defineClientActionsSchema, m } from 'ggtype'
 *
 * // Define actions
 * const createUser = action(
 *   m.object({ id: m.string(), name: m.string() }).isOptional(),
 *   async ({ params }) => ({ ...params, createdAt: new Date() })
 * )
 *
 * const getUser = action(
 *   m.object({ id: m.string() }).isOptional(),
 *   async ({ params }) => ({ id: params.id, name: 'John' })
 * )
 *
 * // Define client actions schema
 * const clientActions = defineClientActionsSchema({
 *   showNotification: {
 *     params: m.object({
 *       message: m.string(),
 *       type: m.string(),
 *     }).isOptional(),
 *     return: m.object({ acknowledged: m.boolean().isOptional() }).isOptional(),
 *   },
 * })
 *
 * // Create router
 * const router = createRouter({
 *   serverActions: { createUser, getUser },
 *   clientActions,
 *   transport: 'http', // or 'stream' or 'websocket'
 *   responseTimeout: 60000,
 * })
 *
 * // Use with Bun server
 * Bun.serve({
 *   port: 3000,
 *   async fetch(request) {
 *     const user = extractUserFromRequest(request)
 *     return router.onRequest({ request, ctx: { user } })
 *   },
 * })
 * ```
 */
export function createRouter<
  Actions extends Record<string, ActionNotGeneric>,
  ClientActions extends Record<string, ClientAction>,
>(
  options: RouterOptions<Actions, ClientActions>,
): Router<Actions, ClientActions> {
  const {
    serverActions,
    clientActions: clientActionsSchema,
    responseTimeout = DEFAULT_ROUTER_TIMEOUT,
    transport: transportType = 'stream',
  } = options

  const waitingResponses = clearMap<
    Key,
    (message: RouterMessage) => void
  >({
    checkIntervalMs: responseTimeout / 2,
    expiresMs: responseTimeout,
    getKey: (key) => `${key.clientId}-${key.id}`,
  })

  /**
   * Sends a message to the client via the transport layer.
   * Creates a RouterMessage with the provided data and sends it through the transport.
   * Automatically detects File/Blob types and sets the appropriate bufferType.
   * @param sendMessageOptions - Options for sending the message
   */
  async function sendMessageToClient(
    sendMessageOptions: SendMessageToClient & {
      transport: Transport
    },
  ) {
    const {
      action,
      data,
      clientId,
      id,
      isLast,
      transport,
    } = sendMessageOptions

    const message: RouterMessage = {
      id: id ?? createId(),
      action,
      status: 'ok',
      clientId,
      data,
      isLast,
      bufferType:
        data instanceof File || data instanceof Blob
          ? 'file'
          : undefined,
    }
    await transport.write(message)
  }

  /**
   * Handles streaming results from an action, sending each value as a separate message.
   * Iterates through the async iterable, marking each item with `isLast` flag, and sends
   * them sequentially to the client. If the stream is empty, sends a final message to
   * indicate completion. Errors during streaming are caught and sent as error messages.
   * @param handleStreamOptions - Options for handling the stream
   */
  async function handleStreamResult(
    handleStreamOptions: HandleStream & {
      transport: Transport
    },
  ) {
    const { onError, action, data, id, transport } =
      handleStreamOptions
    try {
      let hasAnyMessages = false
      for await (const { value, isLast } of markLast(
        data,
      )) {
        hasAnyMessages = true
        await sendMessageToClient({
          action,
          data: value,
          id,
          isLast,
          transport,
          send: () => {},
        })
      }
      // If the stream was empty (no messages), send a final message to indicate completion
      if (!hasAnyMessages) {
        await sendMessageToClient({
          action,
          data: undefined,
          id,
          isLast: true,
          transport,
          send: () => {},
        })
      }
    } catch (rawError) {
      sendErrorMessage({
        onError,
        action,
        rawError,
        transport,
        id,
        send: () => {},
      })
    }
  }

  const clientFunctionsBefore: ClientCallableActionsBefore<ClientActions> =
    {} as ClientCallableActionsBefore<ClientActions>
  if (clientActionsSchema) {
    for (const clientActionName in clientActionsSchema) {
      const clientId = createId()
      const clientAction =
        clientActionsSchema[clientActionName]
      type ClientParams =
        (typeof clientAction)['params']['infer']
      const validateResponse = compileModelAndCheck(
        clientAction.return,
      )

      const createResponseHandler = (
        resolve: (
          value: ClientActionResult<typeof clientAction>,
        ) => void,
        transport: Transport,
        currentClientId: string,
        currentId: string,
      ) => {
        return (responseMessage: RouterMessage) => {
          try {
            if (!responseMessage.clientId) {
              throw new Error(
                'Response is not a ClientAction',
              )
            }
            if (responseMessage.error) {
              resolve({
                status: 'error',
                error: responseMessage.error,
              })
              waitingResponses.delete({
                clientId: currentClientId,
                id: currentId,
              })
              return
            }
            const errors = validateResponse(
              responseMessage.data,
            )
            if (errors) {
              throw new ValidationError(errors)
            }

            const parsedResponse =
              clientAction.return.onParse(
                responseMessage.data as never,
              )
            resolve({
              status: 'ok',
              data: parsedResponse,
            })
            waitingResponses.delete({
              clientId: currentClientId,
              id: currentId,
            })
          } catch (rawError) {
            const error = sendErrorMessage({
              onError: NOOP_ON_ERROR,
              action: clientActionName,
              rawError,
              clientId: currentClientId,
              id: currentId,
              transport,
              send: () => {},
            })
            if (!error) {
              return
            }
            resolve(error)
            waitingResponses.delete({
              clientId: currentClientId,
              id: currentId,
            })
          }
        }
      }

      const createTimeoutHandler = (
        resolve: (
          value: ClientActionResult<typeof clientAction>,
        ) => void,
        transport: Transport,
        currentClientId: string,
        currentId: string,
      ) => {
        return () => {
          const error = sendErrorMessage({
            onError: NOOP_ON_ERROR,
            action: clientActionName,
            rawError: new Error('Timeout'),
            clientId: currentClientId,
            id: currentId,
            transport,
            send: () => {},
          })
          if (!error) {
            return
          }
          resolve(error)
          waitingResponses.delete({
            clientId: currentClientId,
            id: currentId,
          })
        }
      }

      const clientFn = async function (
        _send: unknown,
        fromMessage: RouterMessage & {
          _transport?: Transport
        },
        parameters: ClientParams,
      ): Promise<ClientActionResult<typeof clientAction>> {
        const { id, _transport: transport } = fromMessage
        if (!transport)
          throw new Error(
            'Transport not available in context',
          )

        return new Promise<
          ClientActionResult<typeof clientAction>
        >((resolve) => {
          const responseHandler = createResponseHandler(
            resolve,
            transport,
            clientId,
            id,
          )
          const timeoutHandler = createTimeoutHandler(
            resolve,
            transport,
            clientId,
            id,
          )

          waitingResponses.add(
            { clientId, id },
            responseHandler,
            timeoutHandler,
          )

          const message: RouterMessage = {
            id,
            action: clientActionName,
            clientId,
            status: 'ok',
            data: parameters,
            bufferType:
              parameters instanceof File ||
              parameters instanceof Blob
                ? 'file'
                : undefined,
          }

          transport.write(message).catch(() => {
            // Ignore write errors
          })
        })
      }
      ;(clientFunctionsBefore as Record<string, unknown>)[
        clientActionName
      ] = clientFn
    }
  }

  /**
   * Creates a client actions object that can be called from server actions.
   * This function wraps the client action functions with the transport context,
   * allowing server actions to call client actions and wait for their responses.
   * Each client action function returns a Promise that resolves when the client responds.
   * @param transport - The transport instance to use for communication
   * @param fromMessage - The router message that triggered the server action
   * @returns An object containing callable client action functions
   */
  function clientActions(
    transport: Transport,
    fromMessage: RouterMessage,
  ): ClientCallableActions<ClientActions> {
    if (!clientActionsSchema) {
      return NOOP_CLIENT_ACTIONS<ClientActions>()
    }

    const clientFunctions: ClientCallableActions<ClientActions> =
      {} as ClientCallableActions<ClientActions>
    const messageWithTransport = {
      ...fromMessage,
      _transport: transport,
    }

    for (const clientActionName in clientActionsSchema) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientAction =
        clientActionsSchema[clientActionName]
      type ClientParams =
        (typeof clientAction)['params']['infer']
      const clientFn = async function (
        parameters: ClientParams,
      ): Promise<ClientActionResult<typeof clientAction>> {
        return clientFunctionsBefore[clientActionName](
          () => {},
          messageWithTransport,
          parameters,
        )
      }
      ;(clientFunctions as Record<string, unknown>)[
        clientActionName
      ] = clientFn
    }
    return clientFunctions
  }

  /**
   * Handles a response message from a client action.
   * If the message has a clientId, it's treated as a client action response.
   * The function looks up the waiting response handler in the waitingResponses map
   * and invokes it with the message, resolving the Promise that was waiting for the response.
   * If no handler is found (timeout or already processed), sends a timeout error.
   * @param clientMessage - The router message from the client
   * @param onError - Error handler function
   * @param transport - The transport instance to use for sending error messages
   * @returns True if the message was handled as a client response, false otherwise
   */
  function handleClientResponse(
    clientMessage: RouterMessage,
    onError: (error: Error) => Error,
    transport: Transport,
  ): boolean {
    const { clientId, id } = clientMessage
    if (clientId === undefined) {
      return false
    }

    const waitingResponse = waitingResponses.get({
      clientId,
      id,
    })
    if (!waitingResponse) {
      sendErrorMessage({
        onError,
        action: clientMessage.action,
        rawError: new Error('timeout'),
        clientId: clientMessage.clientId,
        id,
        transport,
        send: () => {},
      })
      return true
    }
    waitingResponse(clientMessage)
    return true
  }

  /**
   * Handles a server action execution request.
   * Looks up the action by name from the actions record, validates and executes it with
   * the provided parameters and context. If the action returns an async iterable or stream,
   * it's handled as a streaming response. Otherwise, the single result is sent back.
   * Errors are caught, processed through the error handler, and sent as error messages.
   * @param serverMessage - The router message containing the action request
   * @param ctx - The context object to pass to the action
   * @param onError - Error handler function
   * @param transport - The transport instance to use for sending responses
   */
  async function handleServerAction(
    serverMessage: RouterMessage,
    ctx: unknown,
    onError: (error: Error) => Error,
    transport: Transport,
  ): Promise<void> {
    const { id, data, action: actionName } = serverMessage
    const action = serverActions[actionName]

    if (!action) {
      sendErrorMessage({
        onError,
        action: actionName,
        rawError: new Error(
          `Action ${actionName} not found`,
        ),
        id,
        transport,
        send: () => {},
      })
      return
    }

    try {
      const actionResult = await action.run({
        params: data,
        ctx,
        clientActions: () =>
          clientActions(transport, serverMessage),
      })

      if (
        isAsyncStream(actionResult) ||
        isAsyncIterable(actionResult) ||
        isIterable(actionResult)
      ) {
        const actionStream =
          actionResult as AsyncIterable<unknown>
        await handleStreamResult({
          action: actionName,
          data: actionStream,
          onError,
          id,
          transport,
          send: () => {},
        })
        return
      }
      await sendMessageToClient({
        action: actionName,
        data: actionResult,
        id,
        isLast: true,
        transport,
        send: () => {},
      })
    } catch (rawError) {
      sendErrorMessage({
        onError,
        action: actionName,
        rawError,
        id,
        transport,
        send: () => {},
      })
    }
  }

  /**
   * Processes an incoming router message, routing it to either client response handler
   * or server action handler based on the message type. First checks if it's a client
   * response (has clientId), otherwise treats it as a server action request.
   * @param processOptions - Options for processing the message
   * @param processOptions.onError - Error handler function
   * @param processOptions.message - The router message to process
   * @param processOptions.ctx - Context object for the request
   * @param processOptions.transport - The transport type being used
   */
  async function processData(processOptions: {
    onError: (error: Error) => Error
    message: RouterMessage
    ctx: unknown
    transport: Transport
  }) {
    const { onError, message, ctx, transport } =
      processOptions

    if (handleClientResponse(message, onError, transport)) {
      return
    }

    await handleServerAction(
      message,
      ctx,
      onError,
      transport,
    )
  }

  /**
   * Handles HTTP requests for the router.
   * For WebSocket transport, handles the upgrade request and returns a 101 response.
   * For stream transport, creates a bidirectional TransformStream, sets up an HttpStreamTransport,
   * and processes incoming messages asynchronously. Multiple messages can be processed concurrently.
   * Returns a Response with appropriate headers for streaming (application/octet-stream, keep-alive).
   * @param onRequestOptions - Request handling options
   * @returns A Response object for the HTTP request
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async function onRequest(
    onRequestOptions: OnRequest,
  ): Promise<Response> {
    const {
      onError = NOOP_ON_ERROR,
      ctx,
      request,
      server,
    } = onRequestOptions

    if (transportType === 'websocket') {
      // For WebSocket, we need to handle the upgrade
      // The actual WebSocket handling will be done in the server's websocket handler
      // This function just needs to indicate that WebSocket upgrade should happen
      if (server?.upgrade(request)) {
        // Return undefined response - Bun handles this case
        return new Response(null, { status: 101 })
      }
      return new Response('WebSocket upgrade failed', {
        status: 500,
      })
    }

    if (transportType === 'http') {
      // Plain HTTP transport - works like router.parse
      // Ignores clientActions and returns a single JSON response
      // Supports both query parameter format (?q=...) and JSON body format
      // Supports GET, POST, PUT, PATCH, DELETE methods
      // GET requests use query parameters, other methods use request body

      try {
        let body: Record<string, unknown>
        const url = new URL(request.url)
        const queryParameter = url.searchParams.get('q')

        if (request.method === 'GET' || queryParameter) {
          // GET requests or explicit query parameter format
          if (queryParameter) {
            body = JSON.parse(queryParameter)
          } else {
            // For GET without query parameter, return empty result
            return Response.json(
              {},
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            )
          }
        } else {
          // POST, PUT, PATCH, DELETE use request body
          body = (await request.json()) as Record<
            string,
            unknown
          >
        }

        const result: Record<
          string,
          RouterResultNotGeneric
        > = {}

        for (const key in body) {
          const action = serverActions[key]
          const model = action?.model
          try {
            if (!model) {
              throw new Error(`Action ${key} not found.`)
            }
            const data = await action?.run({
              params: body[key],
              ctx,
              clientActions: () =>
                NOOP_CLIENT_ACTIONS<ClientActions>(),
            })
            result[key] = {
              status: 'ok',
              data,
            }
          } catch (rawError) {
            const error = handleError(onError, rawError)
            if (error) {
              result[key] = error
            }
          }
        }

        return Response.json(result, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (rawError) {
        const error = handleError(
          onError,
          rawError as Error,
        )
        const errorResult: Record<string, unknown> = {
          ['$valid']: {
            error: error?.error ?? {
              type: 'generic',
              message: 'Unknown error',
              code: 500,
            },
          },
        }
        return Response.json(errorResult, {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
    }

    // Stream transport handling
    // Stream transport requires methods that support request bodies (POST, PUT, PATCH)
    // GET and DELETE typically don't have request bodies, but we allow them for flexibility
    const methodsWithBody = [
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
    ]
    if (!methodsWithBody.includes(request.method)) {
      // For GET requests, return empty response since stream transport needs a body
      if (request.method === 'GET') {
        return new Response(
          'Stream transport requires a request body. Use POST, PUT, PATCH, or DELETE.',
          { status: 400 },
        )
      }
      return new Response('Method not allowed', {
        status: 405,
      })
    }

    if (!request.body) {
      return new Response('Request body required', {
        status: 400,
      })
    }

    const { readable, writable } = new TransformStream<
      Uint8Array,
      Uint8Array
    >()
    const transport = new HttpStreamTransport(
      request.body,
      writable,
    )

    const activeProcessors = new Set<Promise<void>>()

    const processStream = async () => {
      try {
        while (true) {
          const message = await transport.read()
          if (message === null) {
            break
          }

          try {
            const promise = processData({
              message,
              onError,
              ctx,
              transport,
            })
            activeProcessors.add(promise)
            promise.finally(() => {
              activeProcessors.delete(promise)
            })
          } catch (rawError) {
            sendErrorMessage({
              onError,
              action: 'unknown',
              rawError,
              transport,
              send: () => {},
            })
          }
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message !== 'Stream closed'
        ) {
          sendErrorMessage({
            onError,
            action: 'unknown',
            rawError: error,
            transport,
            send: () => {},
          })
        }
      } finally {
        await Promise.all(activeProcessors)
        await transport.close()
      }
    }

    processStream().catch(() => {
      // Ignore errors in background processing
    })

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }

  /**
   * Handles WebSocket messages for the router.
   * Creates or retrieves the transport instance for the WebSocket connection (stored using
   * a Symbol to avoid conflicts). On first call, starts a background message processing loop
   * that reads messages from the transport and processes them. Incoming messages are fed
   * to the transport's feedMessage method, which buffers and parses complete RouterMessages.
   * @param onWsMessageOptions - WebSocket message handling options
   */
  async function onWebSocketMessage(
    onWsMessageOptions: OnWebSocketMessage,
  ): Promise<void> {
    const {
      ws,
      message,
      onError = NOOP_ON_ERROR,
      ctx,
    } = onWsMessageOptions

    // Get or create transport for this WebSocket connection
    let transport = (
      ws as { [TRANSPORT_SYMBOL]?: WebSocketTransport }
    )[TRANSPORT_SYMBOL]
    let activeProcessors = (
      ws as { [PROCESSORS_SYMBOL]?: Set<Promise<void>> }
    )[PROCESSORS_SYMBOL]

    if (!transport) {
      transport = new WebSocketTransport(ws)
      ;(ws as { [TRANSPORT_SYMBOL]?: WebSocketTransport })[
        TRANSPORT_SYMBOL
      ] = transport

      // Get or create active processors set
      activeProcessors = new Set<Promise<void>>()
      ;(ws as { [PROCESSORS_SYMBOL]?: Set<Promise<void>> })[
        PROCESSORS_SYMBOL
      ] = activeProcessors

      // Start message processing loop
      const processMessages = async () => {
        const currentTransport = transport!
        try {
          while (true) {
            const routerMessage =
              await currentTransport.read()
            if (routerMessage === null) {
              break
            }

            try {
              const promise = processData({
                message: routerMessage,
                onError,
                ctx,
                transport: currentTransport,
              })
              activeProcessors!.add(promise)
              promise.finally(() => {
                activeProcessors!.delete(promise)
              })
            } catch (rawError) {
              sendErrorMessage({
                onError,
                action: 'unknown',
                rawError,
                transport: currentTransport,
                send: () => {},
              })
            }
          }
        } catch (error) {
          if (
            error instanceof Error &&
            error.message !== 'Stream closed'
          ) {
            sendErrorMessage({
              onError,
              action: 'unknown',
              rawError: error,
              transport: currentTransport,
              send: () => {},
            })
          }
        }
      }

      // Start processing loop immediately
      processMessages().catch(() => {
        // Ignore errors in background processing
      })
    }

    // Feed the incoming message to the transport
    const currentTransport = transport!
    if (
      message instanceof Uint8Array ||
      message instanceof ArrayBuffer
    ) {
      const data =
        message instanceof ArrayBuffer
          ? new Uint8Array(message)
          : message
      currentTransport.feedMessage(data)
    } else if (message instanceof Blob) {
      const buffer = await message.arrayBuffer()
      currentTransport.feedMessage(new Uint8Array(buffer))
    }
  }

  return {
    infer: [] as never,
    onRequest,
    onWebSocketMessage:
      transportType === 'websocket'
        ? onWebSocketMessage
        : undefined,
  } as Router<Actions, ClientActions>
}
