import { DEFAULT_ROUTER_TIMEOUT } from '../types'
import { clearMap } from '../utils/clear-map'
import type {
  ClientActionsBase,
  InferRouter,
  Pending,
  Router,
  RouterOptions,
  ServerActionsBase,
} from './router.type'
import { createCallableActions } from './router.utils'
import { handleDuplexRequest } from './transports/handle-duplex-request'
import { handleHttpRequest } from './transports/handle-http.request'
import { handleStreamRequest } from './transports/handle-stream-request'
import { handleWebSocket } from './transports/handle-websocket'

export function createRouter<
  ServerActions extends ServerActionsBase,
  ClientActions extends ClientActionsBase,
>(
  options: RouterOptions<ServerActions, ClientActions>,
): Router<ServerActions, ClientActions> {
  const {
    serverActions,
    clientActions,
    responseTimeout = DEFAULT_ROUTER_TIMEOUT,
  } = options
  const callableActions = createCallableActions({
    clientActions,
    serverActions,
  })

  const encoder = new TextEncoder()
  const pendingClientActionCalls = clearMap<
    string,
    Pending
  >({
    checkIntervalMs: 500,
    expiresMs: responseTimeout,
  })

  return {
    infer: undefined as unknown as InferRouter<
      ServerActions,
      ClientActions
    >,
    async onRequest(requestOptions) {
      const { type = 'http' } = requestOptions
      switch (type) {
        case 'http': {
          return handleHttpRequest({
            ...requestOptions,
            callableActions,
            encoder,
            pendingClientActionCalls,
          })
        }
        case 'stream': {
          return handleStreamRequest({
            ...requestOptions,
            callableActions,
            encoder,
            pendingClientActionCalls,
          })
        }
        case 'duplex': {
          return handleDuplexRequest({
            ...requestOptions,
            callableActions,
            encoder,
            pendingClientActionCalls,
          })
        }
        default: {
          throw new Error(`Invalid request type: ${type}`)
        }
      }
    },
    async onWebSocketMessage(wsOptions) {
      return handleWebSocket({
        ...wsOptions,
        callableActions,
        responseTimeout,
        encoder,
        pendingClientActionCalls,
      })
    },

    onWebsocketCleanUp() {},
  }
}
