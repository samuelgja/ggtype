import { NOOP_ON_ERROR } from '../types'
import type {
  ClientActionsBase,
  Router,
  ServerActionsBase,
} from '../router/router.type'
import type {
  FetchOptions,
  ParamsIt,
  ResultForWithActionResult,
  RouterClientOptions,
  RouterClientState,
} from './router-client.types'
import { createFetchHandler } from './transports/fetch'
import { createStreamHandler } from './transports/stream'
import { createDuplexHandler } from './transports/duplex'
import { createWebsocketHandler } from './transports/websocket'
import { createWebsocketPersistent } from './transports/websocket-persistent'
import { createDuplexPersistent } from './transports/duplex-persistent'
import {
  createDuplexActionsProxy,
  createFetchActionsProxy,
  createStreamActionsProxy,
} from './transports/proxies'

export function createRouterClient<
  RouterType extends Router<
    ServerActionsBase,
    ClientActionsBase
  >,
>(options: RouterClientOptions<RouterType>) {
  const {
    defineClientActions,
    halfDuplexUrl,
    httpURL,
    onResponse,
    onError = NOOP_ON_ERROR,
    streamURL,
    websocketURL,
  } = options

  type ResultForLocal<Params extends ParamsIt<RouterType>> =
    ResultForWithActionResult<RouterType, Params>

  const state: RouterClientState = {
    defaultHeaders: new Headers(),
    onError,
  }

  const executeFetch = createFetchHandler<RouterType>({
    httpURL,
    state,
    onResponse: onResponse as Parameters<
      typeof createFetchHandler<RouterType>
    >[0]['onResponse'],
  })

  const streamHandler = createStreamHandler<RouterType>({
    streamURL,
    state,
    onResponse: onResponse as Parameters<
      typeof createStreamHandler<RouterType>
    >[0]['onResponse'],
  })

  const duplexHandler = createDuplexHandler<RouterType>({
    halfDuplexUrl,
    state,
    defineClientActions: defineClientActions as Record<
      string,
      (params: unknown) => Promise<unknown>
    >,
    onResponse: onResponse as Parameters<
      typeof createDuplexHandler<RouterType>
    >[0]['onResponse'],
  })

  const websocketHandler =
    createWebsocketHandler<RouterType>({
      websocketURL,
      state,
      defineClientActions: defineClientActions as Record<
        string,
        (params: unknown) => Promise<unknown>
      >,
      onResponse: onResponse as Parameters<
        typeof createWebsocketHandler<RouterType>
      >[0]['onResponse'],
    })

  const createStartWebsocket =
    createWebsocketPersistent<RouterType>({
      websocketURL,
      state,
      defineClientActions: defineClientActions as Record<
        string,
        (params: unknown) => Promise<unknown>
      >,
    })

  const createStartDuplex =
    createDuplexPersistent<RouterType>({
      halfDuplexUrl,
      state,
      defineClientActions: defineClientActions as Record<
        string,
        (params: unknown) => Promise<unknown>
      >,
    })

  const client = {
    /**
     * Sets headers to be included in all requests.
     * Call with an object to set headers, or with no arguments to reset headers.
     * @param newHeaders - Optional headers object. If not provided, headers are reset.
     */
    setHeaders(newHeaders?: Record<string, string>): void {
      state.defaultHeaders = new Headers(
        newHeaders ?? undefined,
      )
    },

    async fetch<Params extends ParamsIt<RouterType>>(
      params: Params,
      fetchOptions?: FetchOptions<RouterType>,
    ): Promise<ResultForLocal<Params>> {
      return executeFetch(params, fetchOptions)
    },

    async *stream<Params extends ParamsIt<RouterType>>(
      params: Params,
      fetchOptions?: FetchOptions<RouterType>,
    ): AsyncGenerator<ResultForLocal<Params>> {
      yield* streamHandler(params, fetchOptions)
    },

    async *duplex<Params extends ParamsIt<RouterType>>(
      params: Params,
      fetchOptions?: Parameters<typeof duplexHandler>[1],
    ): AsyncGenerator<ResultForLocal<Params>> {
      yield* duplexHandler(params, fetchOptions)
    },

    async *websocket<Params extends ParamsIt<RouterType>>(
      params: Params,
      websocketOptions?: Parameters<
        typeof websocketHandler
      >[1],
    ): AsyncGenerator<ResultForLocal<Params>> {
      yield* websocketHandler(params, websocketOptions)
    },

    startWebsocket(
      websocketOptions?: Parameters<
        typeof createStartWebsocket
      >[0],
    ) {
      return createStartWebsocket(websocketOptions)
    },

    startDuplex(
      duplexOptions?: Parameters<
        typeof createStartDuplex
      >[0],
    ) {
      return createStartDuplex(duplexOptions)
    },
  }

  return {
    ...client,
    fetchActions:
      createFetchActionsProxy<RouterType>(executeFetch),
    streamActions: createStreamActionsProxy<RouterType>(
      async function* (params, streamOptions) {
        yield* client.stream(params, streamOptions)
      },
    ),
    duplexActions: createDuplexActionsProxy<RouterType>(
      async function* (params, duplexOptions) {
        yield* client.duplex(params, duplexOptions)
      },
    ),
  }
}
