import type { ActionNotGeneric } from '../action/action'
import type {
  Router,
  ActionResult,
  RouterOptions,
} from '../types'
import type {
  ClientAction,
  ClientCallableActionsFromClient,
} from '../router/router-client.types-shared'
import type { AsyncStream } from './async-stream'
import { createRouter } from '../router/router'
import { createRouterClient } from '../router/router-client'

export interface TestRouterOptions {
  /**
   * Timeout in milliseconds for waiting responses (default: 60000)
   */
  readonly responseTimeout?: number
  /**
   * Transport type: 'stream', 'websocket', or 'http' (default: 'stream')
   */
  readonly transport?: RouterOptions['transport']
  /**
   * Optional error handler callback
   */
  readonly onError?: (error: Error) => void
}

type RouterInfer<
  Actions extends Record<string, ActionNotGeneric>,
  ClientActions extends Record<string, ClientAction>,
> = Router<Actions, ClientActions>['infer']

type TestRouterActions<
  Actions extends Record<string, ActionNotGeneric>,
> = {
  readonly [ActionName in keyof Actions]: (
    params: RouterInfer<
      Actions,
      Record<string, ClientAction>
    >['serverActions'][ActionName]['params'],
  ) => Promise<
    AsyncStream<{
      [K in ActionName]?: ActionResult<
        RouterInfer<
          Actions,
          Record<string, ClientAction>
        >['serverActions'][K]['params']
      >
    }>
  >
}

export interface TestRouter<
  Actions extends Record<string, ActionNotGeneric>,
> {
  /**
   * Test actions that can be called directly
   */
  readonly actions: TestRouterActions<Actions>
  /**
   * Cleanup function to stop the test server
   */
  readonly cleanup: () => void
}

/**
 * Creates a test router with both server and client for testing purposes.
 * Sets up a local server (HTTP stream or WebSocket) and a client connected to it,
 * allowing easy testing of router functionality without external dependencies.
 * The server runs on a random available port and is automatically cleaned up.
 *
 * **Note**: For stream transport, we use Bun.serve to test the full HTTP integration.
 * While we could use in-memory streams to avoid the server, using Bun.serve ensures
 * we test the real integration path including HTTP request/response handling.
 * For WebSocket transport, Bun.serve is required.
 * @template Actions - The server actions record type
 * @template ClientActions - The client actions record type
 * @param actions - Record of server actions
 * @param clientActions - Record of client action definitions
 * @param clientActionHandlers - Handlers for client actions
 * @param options - Optional test router configuration
 * @param options.responseTimeout - Timeout for responses in milliseconds (default: 60000)
 * @param options.transport - Transport type: 'stream' or 'websocket' (default: 'stream')
 * @param options.onError - Optional error handler
 * @returns A test router with actions and cleanup function
 */
export function createTestRouter<
  Actions extends Record<string, ActionNotGeneric>,
  ClientActions extends Record<string, ClientAction>,
>(
  actions: Actions,
  clientActions: ClientActions,
  clientActionHandlers: ClientCallableActionsFromClient<ClientActions>,
  options?: TestRouterOptions,
): TestRouter<Actions> {
  const {
    responseTimeout = 60 * 1000,
    transport = 'stream',
    onError,
  } = options || {}
  const serverTimeout = responseTimeout * 2 + 10

  const router = createRouter({
    actions,
    clientActions,
    responseTimeout: serverTimeout,
    transport,
  })

  let server: Bun.Server | undefined

  if (transport === 'stream') {
    server = Bun.serve({
      port: 0,
      reusePort: true,
      async fetch(request) {
        return router.onRequest({
          request,
          ctx: {},
        })
      },
    })
  } else {
    server = Bun.serve({
      port: 0,
      reusePort: true,
      fetch(request, fetchServer) {
        if (
          router.onWebSocketMessage &&
          fetchServer.upgrade(request)
        ) {
          return
        }
        return new Response('Upgrade failed', {
          status: 500,
        })
      },
      websocket: {
        message(ws, message) {
          if (router.onWebSocketMessage) {
            router
              .onWebSocketMessage({
                ws,
                message,
                ctx: {},
              })
              .catch(() => {
                // Ignore errors in message handling
              })
          }
        },
        close(ws) {
          ws.close()
        },
      },
    })
  }

  const PORT = server.port
  const url =
    transport === 'stream'
      ? `http://localhost:${PORT}`
      : `ws://localhost:${PORT}`

  const client = createRouterClient({
    url,
    transport,
    defineClientActions: clientActionHandlers,
    responseTimeout,
    onError,
  })

  const testActions = {} as TestRouterActions<Actions>

  for (const actionName in actions) {
    const actionNameTyped = actionName as keyof Actions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(testActions as any)[actionNameTyped] = async (
      params: unknown,
    ) => {
      return client.stream({
        [actionName]: params,
      } as Record<string, unknown>)
    }
  }

  const cleanup = () => {
    if (server) {
      server.stop()
      server = undefined
    }
  }

  return {
    actions: testActions,
    cleanup,
  }
}
