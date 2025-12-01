import { object } from '../../model/object'
import { string } from '../../model/string'
import { action } from '../../action/action'
import { createRouter } from '../router'
import { createRouterClient } from '../router-client'

describe('router client options', () => {
  const userModel = object({
    id: string(),
    name: string(),
  }).isOptional()

  const getUser = action(userModel, ({ params }) => {
    return {
      id: params.id,
      name: params.name,
    }
  })

  const router = createRouter({
    serverActions: {
      getUser,
    },
    clientActions: {},
  })
  type Router = typeof router

  const server = Bun.serve({
    port: 0,
    reusePort: true,
    async fetch(request) {
      return router.onRequest({
        request,
        ctx: {},
      })
    },
  })

  const PORT = server.port

  afterAll(() => {
    server.stop()
  })

  describe('HTTP transport options', () => {
    it('should use default GET method when method is not specified', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}`,
      })

      const result = await client.fetch({
        getUser: { id: '1', name: 'John' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '1',
        name: 'John',
      })
    })

    it('should use specified method option', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}`,
        method: 'POST',
      })

      const result = await client.fetch({
        getUser: { id: '2', name: 'Jane' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '2',
        name: 'Jane',
      })
    })

    it('should allow keepAlive option', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}`,
        keepAlive: true,
      })

      const result = await client.fetch({
        getUser: { id: '3', name: 'Bob' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '3',
        name: 'Bob',
      })
    })

    it('should allow keepAlive option to be false', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}`,
        keepAlive: false,
      })

      const result = await client.fetch({
        getUser: { id: '4', name: 'Alice' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '4',
        name: 'Alice',
      })
    })
  })

  describe('Stream transport options', () => {
    const streamRouter = createRouter({
      serverActions: {
        getUser,
      },
      clientActions: {},
    })
    type StreamRouter = typeof streamRouter

    const streamServer = Bun.serve({
      port: 0,
      reusePort: true,
      async fetch(request) {
        return streamRouter.onStream({
          request,
          ctx: {},
        })
      },
    })

    const STREAM_PORT = streamServer.port

    afterAll(() => {
      streamServer.stop()
    })

    it('should allow keepAlive option for stream transport', async () => {
      const client = createRouterClient<StreamRouter>({
        streamURL: `http://localhost:${STREAM_PORT}`,
        keepAlive: true,
      })

      const result = await client.fetch({
        getUser: { id: '5', name: 'Charlie' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '5',
        name: 'Charlie',
      })
    })

    it('should allow keepAlive option to be false for stream transport', async () => {
      const client = createRouterClient<StreamRouter>({
        streamURL: `http://localhost:${STREAM_PORT}`,
        keepAlive: false,
      })

      const result = await client.fetch({
        getUser: { id: '6', name: 'Diana' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '6',
        name: 'Diana',
      })
    })

    it('should allow maxReconnectAttempts option', async () => {
      const client = createRouterClient<StreamRouter>({
        streamURL: `http://localhost:${STREAM_PORT}`,
        maxReconnectAttempts: 3,
      })

      const result = await client.fetch({
        getUser: { id: '7', name: 'Eve' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '7',
        name: 'Eve',
      })
    })

    it('should allow initialReconnectDelay option', async () => {
      const client = createRouterClient<StreamRouter>({
        streamURL: `http://localhost:${STREAM_PORT}`,
        initialReconnectDelay: 2000,
      })

      const result = await client.fetch({
        getUser: { id: '8', name: 'Frank' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '8',
        name: 'Frank',
      })
    })

    it('should allow maxReconnectDelay option', async () => {
      const client = createRouterClient<StreamRouter>({
        streamURL: `http://localhost:${STREAM_PORT}`,
        maxReconnectDelay: 60_000,
      })

      const result = await client.fetch({
        getUser: { id: '9', name: 'Grace' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '9',
        name: 'Grace',
      })
    })

    it('should allow connectionTimeout option', async () => {
      const client = createRouterClient<StreamRouter>({
        streamURL: `http://localhost:${STREAM_PORT}`,
        connectionTimeout: 10_000,
      })

      const result = await client.fetch({
        getUser: { id: '10', name: 'Henry' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '10',
        name: 'Henry',
      })
    })
  })

  describe('WebSocket transport options', () => {
    const wsRouter = createRouter({
      serverActions: {
        getUser,
      },
      clientActions: {},
    })
    type WSRouter = typeof wsRouter

    const wsServer = Bun.serve({
      port: 0,
      reusePort: true,
      async fetch(request, fetchServer) {
        if (fetchServer.upgrade(request)) {
          return
        }
        return new Response('Not a websocket request', {
          status: 400,
        })
      },
      websocket: {
        message: async (ws, message) => {
          await wsRouter.onWebSocketMessage({
            ws,
            message,
            ctx: {},
          })
        },
      },
    })

    const WS_PORT = wsServer.port

    afterAll(() => {
      wsServer.stop()
    })

    it('should allow maxReconnectAttempts option for websocket', async () => {
      const client = createRouterClient<WSRouter>({
        websocketURL: `ws://localhost:${WS_PORT}`,
        maxReconnectAttempts: 3,
      })

      const result = await client.fetch({
        getUser: { id: '11', name: 'Iris' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '11',
        name: 'Iris',
      })
    })

    it('should allow initialReconnectDelay option for websocket', async () => {
      const client = createRouterClient<WSRouter>({
        websocketURL: `ws://localhost:${WS_PORT}`,
        initialReconnectDelay: 2000,
      })

      const result = await client.fetch({
        getUser: { id: '12', name: 'Jack' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '12',
        name: 'Jack',
      })
    })

    it('should allow maxReconnectDelay option for websocket', async () => {
      const client = createRouterClient<WSRouter>({
        websocketURL: `ws://localhost:${WS_PORT}`,
        maxReconnectDelay: 60_000,
      })

      const result = await client.fetch({
        getUser: { id: '13', name: 'Kate' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '13',
        name: 'Kate',
      })
    })

    it('should allow connectionTimeout option for websocket', async () => {
      const client = createRouterClient<WSRouter>({
        websocketURL: `ws://localhost:${WS_PORT}`,
        connectionTimeout: 10_000,
      })

      const result = await client.fetch({
        getUser: { id: '14', name: 'Liam' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '14',
        name: 'Liam',
      })
    })
  })
})
