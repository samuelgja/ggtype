import type {
  ClientActionsBase,
  InferRouter,
  Router,
  RouterOptions,
  ServerActionsBase,
} from './router.type'
import { createCallableActions } from './router.utils'
import { handleDuplexRequest } from './transports/handle-duplex-request'
import { handleHttpRequest } from './transports/handle-http.request'
import { handleStreamRequest } from './transports/handle-stream-request'

export function createRouter<
  ServerActions extends ServerActionsBase,
  ClientActions extends ClientActionsBase,
>(
  options: RouterOptions<ServerActions, ClientActions>,
): Router<ServerActions, ClientActions> {
  const { serverActions, clientActions } = options
  const callableActions = createCallableActions({
    clientActions,
    serverActions,
  })

  return {
    infer: null as unknown as InferRouter<
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
          })
        }
        case 'stream': {
          return handleStreamRequest({
            ...requestOptions,
            callableActions,
          })
        }
        case 'duplex': {
          return handleDuplexRequest({
            ...requestOptions,
            callableActions,
          })
        }
        default: {
          throw new Error(`Invalid request type: ${type}`)
        }
      }
    },
    async onWebSocketMessage(options) {},
  }
}
