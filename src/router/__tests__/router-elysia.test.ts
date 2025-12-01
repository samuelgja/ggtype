/* eslint-disable sonarjs/no-nested-functions */
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import {
  action,
  createRouter,
  createRouterClient,
  defineClientActionsSchema,
  isSuccess,
  m,
} from '../..'

describe('Router with Elysia integration', () => {
  describe('HTTP transport with Elysia', () => {
    it('should work with HTTP transport using router.onRequest', async () => {
      const getUser = action(
        m.object({ id: m.string() }),
        async ({ params }) => {
          return {
            id: params.id,
            name: 'John Doe',
            email: 'john@example.com',
          }
        },
      )

      const router = createRouter({
        serverActions: { getUser },
      })
      type Router = typeof router

      const app = new Elysia()
        .get('/api', async ({ request }) => {
          return router.onRequest({ request, ctx: {} })
        })
        .listen(0)

      const PORT = app.server?.port || 0

      try {
        const client = createRouterClient<Router>({
          url: `http://localhost:${PORT}/api`,
          transport: 'http',
        })

        const result = await client.fetch({
          getUser: { id: '1' },
        })

        expect(result.getUser).toBeDefined()
        if (isSuccess(result.getUser)) {
          expect(result.getUser.data.id).toBe('1')
          expect(result.getUser.data.name).toBe('John Doe')
        }
      } finally {
        app.stop()
      }
    })

    it('should handle multiple actions with HTTP transport', async () => {
      const getUser = action(
        m.object({ id: m.string() }),
        async ({ params }) => ({
          id: params.id,
          name: 'John',
        }),
      )

      const createUser = action(
        m.object({ name: m.string() }),
        async ({ params }) => ({
          id: '2',
          name: params.name,
        }),
      )

      const router = createRouter({
        serverActions: { getUser, createUser },
      })
      type Router = typeof router

      const app = new Elysia()
        .all('/api', async ({ request }) => {
          return router.onRequest({ request, ctx: {} })
        })
        .listen(0)

      const PORT = app.server?.port || 0

      try {
        const client = createRouterClient<Router>({
          url: `http://localhost:${PORT}/api`,
          transport: 'http',
        })

        const result = await client.fetch({
          getUser: { id: '1' },
          createUser: { name: 'Jane' },
        })

        expect(result.getUser).toBeDefined()
        expect(result.createUser).toBeDefined()
        if (
          isSuccess(result.getUser) &&
          isSuccess(result.createUser)
        ) {
          expect(result.getUser.data.id).toBe('1')
          expect(result.createUser.data.name).toBe('Jane')
        }
      } finally {
        app.stop()
      }
    })
  })

  describe('Stream transport with Elysia', () => {
    it('should work with stream transport using router.onStream', async () => {
      const getUser = action(
        m.object({ id: m.string() }),
        async ({ params }) => {
          return {
            id: params.id,
            name: 'John Doe',
            email: 'john@example.com',
          }
        },
      )

      const searchUsers = action(
        m.object({ query: m.string() }),
        async function* ({ params }) {
          yield {
            id: '1',
            name: 'John',
            query: params.query,
          }
          yield {
            id: '2',
            name: 'Jane',
            query: params.query,
          }
        },
      )

      const router = createRouter({
        serverActions: { getUser, searchUsers },
      })
      type Router = typeof router

      const app = new Elysia()
        .post('/api', async ({ request }) => {
          return router.onStream({ request, ctx: {} })
        })
        .listen(0)

      const PORT = app.server?.port || 0

      try {
        const client = createRouterClient<Router>({
          url: `http://localhost:${PORT}/api`,
          transport: 'stream',
        })

        // Test single action
        const result = await client.fetch({
          getUser: { id: '1' },
        })

        expect(result.getUser).toBeDefined()
        if (isSuccess(result.getUser)) {
          expect(result.getUser.data.id).toBe('1')
        }

        // Test streaming action
        const { searchUsers: searchUsersAction } =
          client.streamActions
        const stream = await searchUsersAction({
          query: 'john',
        })

        const results: unknown[] = []
        for await (const chunk of stream) {
          if (isSuccess(chunk.searchUsers)) {
            results.push(chunk.searchUsers.data)
          }
        }

        expect(results.length).toBeGreaterThan(0)
      } finally {
        app.stop()
      }
    })

    it('should handle bidirectional RPC with stream transport', async () => {
      const clientActions = defineClientActionsSchema({
        showNotification: {
          params: m.object({ message: m.string() }),
          return: m.object({ acknowledged: m.boolean() }),
        },
      })

      type ClientActions = typeof clientActions

      const getUser = action(
        m.object({ id: m.string() }),
        async ({ params, clientActions: client }) => {
          const { showNotification } =
            client<ClientActions>()
          await showNotification?.({
            message: `Fetching user ${params.id}`,
          })

          return {
            id: params.id,
            name: 'John Doe',
            email: 'john@example.com',
          }
        },
      )

      const router = createRouter({
        serverActions: { getUser },
        clientActions,
      })
      type Router = typeof router

      const app = new Elysia()
        .post('/api', async ({ request }) => {
          return router.onStream({ request, ctx: {} })
        })
        .listen(0)

      const PORT = app.server?.port || 0

      try {
        let notificationReceived = false

        const client = createRouterClient<Router>({
          url: `http://localhost:${PORT}/api`,
          transport: 'stream',
          defineClientActions: {
            showNotification: async (params) => {
              notificationReceived = true
              expect(params.message).toContain(
                'Fetching user',
              )
              return { acknowledged: true }
            },
          },
        })

        const result = await client.fetch({
          getUser: { id: '1' },
        })

        expect(result.getUser).toBeDefined()
        expect(notificationReceived).toBe(true)
        if (isSuccess(result.getUser)) {
          expect(result.getUser.data.id).toBe('1')
        }
      } finally {
        app.stop()
      }
    })
  })

  describe('WebSocket transport with Elysia', () => {
    it('should work with WebSocket transport using Elysia', async () => {
      const getUser = action(
        m.object({ id: m.string() }),
        async ({ params }) => {
          return {
            id: params.id,
            name: 'John Doe',
            email: 'john@example.com',
          }
        },
      )

      const subscribeToUpdates = action(
        m.object({ userId: m.string() }),
        async function* ({ params }) {
          for (let index = 0; index < 3; index++) {
            yield {
              userId: params.userId,
              update: `Update ${index + 1}`,
              timestamp: Date.now(),
            }
            await new Promise((resolve) =>
              setTimeout(resolve, 10),
            )
          }
        },
      )

      const router = createRouter({
        serverActions: { getUser, subscribeToUpdates },
      })
      type Router = typeof router

      const app = new Elysia()
        .get('/', () => 'Hello from Elysia!')
        .get('/health', () => ({ status: 'ok' }))
        .ws('/ws', {
          message(ws, message) {
            router
              .onWebSocketMessage({
                ws: ws.raw as Bun.ServerWebSocket<unknown>,
                message,
                ctx: {},
              })
              .catch(() => {
                // Ignore errors
              })
          },
          close(ws) {
            ws.raw.close()
          },
        })
        .listen(0)

      const PORT = app.server?.port || 0

      try {
        const client = createRouterClient<Router>({
          url: `ws://localhost:${PORT}/ws`,
          transport: 'websocket',
        })

        // Test HTTP route through Elysia
        const httpResponse = await fetch(
          `http://localhost:${PORT}/`,
        )
        expect(await httpResponse.text()).toBe(
          'Hello from Elysia!',
        )

        const healthResponse = await fetch(
          `http://localhost:${PORT}/health`,
        )
        expect(await healthResponse.json()).toEqual({
          status: 'ok',
        })

        // Test WebSocket action
        const result = await client.fetch({
          getUser: { id: '1' },
        })

        expect(result.getUser).toBeDefined()
        if (isSuccess(result.getUser)) {
          expect(result.getUser.data.id).toBe('1')
          expect(result.getUser.data.name).toBe('John Doe')
        }

        // Test streaming action
        const { subscribeToUpdates: subscribeAction } =
          client.streamActions
        const stream = await subscribeAction({
          userId: '1',
        })

        const updates: unknown[] = []
        for await (const chunk of stream) {
          if (isSuccess(chunk.subscribeToUpdates)) {
            updates.push(chunk.subscribeToUpdates.data)
          }
        }

        expect(updates.length).toBeGreaterThan(0)
      } finally {
        app.stop()
      }
    })

    it('should handle bidirectional RPC with WebSocket transport', async () => {
      const clientActions = defineClientActionsSchema({
        showNotification: {
          params: m.object({ message: m.string() }),
          return: m.object({ acknowledged: m.boolean() }),
        },
      })

      type ClientActions = typeof clientActions

      const getUser = action(
        m.object({ id: m.string() }),
        async ({ params, clientActions: client }) => {
          const { showNotification } =
            client<ClientActions>()
          await showNotification?.({
            message: `Fetching user ${params.id}`,
          })

          return {
            id: params.id,
            name: 'John Doe',
            email: 'john@example.com',
          }
        },
      )

      const router = createRouter({
        serverActions: { getUser },
        clientActions,
      })
      type Router = typeof router

      const app = new Elysia()
        .get('/', () => 'Elysia + WebSocket')
        .ws('/ws', {
          message(ws, message) {
            router
              .onWebSocketMessage({
                ws: ws.raw as Bun.ServerWebSocket<unknown>,
                message,
                ctx: {},
              })
              .catch(() => {
                // Ignore errors
              })
          },
          close(ws) {
            ws.raw.close()
          },
        })
        .listen(0)

      const PORT = app.server?.port || 0

      try {
        let notificationReceived = false

        const client = createRouterClient<Router>({
          url: `ws://localhost:${PORT}/ws`,
          transport: 'websocket',
          defineClientActions: {
            showNotification: async (params) => {
              notificationReceived = true
              expect(params.message).toContain(
                'Fetching user',
              )
              return { acknowledged: true }
            },
          },
        })

        const result = await client.fetch({
          getUser: { id: '1' },
        })

        expect(result.getUser).toBeDefined()
        expect(notificationReceived).toBe(true)
        if (isSuccess(result.getUser)) {
          expect(result.getUser.data.id).toBe('1')
        }
      } finally {
        app.stop()
      }
    })
  })

  describe('Multiple transports simultaneously with Elysia', () => {
    it('should support HTTP, stream, and WebSocket all at once', async () => {
      const getUser = action(
        m.object({ id: m.string() }),
        async ({ params }) => ({
          id: params.id,
          name: 'John Doe',
        }),
      )

      const router = createRouter({
        serverActions: { getUser },
      })
      type Router = typeof router

      const app = new Elysia()
        .get('/http', async ({ request }) => {
          return router.onRequest({ request, ctx: {} })
        })
        .post('/stream', async ({ request }) => {
          return router.onStream({ request, ctx: {} })
        })
        .ws('/ws', {
          message(ws, message) {
            router
              .onWebSocketMessage({
                ws: ws.raw as Bun.ServerWebSocket<unknown>,
                message,
                ctx: {},
              })
              .catch(() => {
                // Ignore errors
              })
          },
          close(ws) {
            ws.raw.close()
          },
        })
        .listen(0)

      const PORT = app.server?.port || 0

      try {
        // Test HTTP transport
        const httpClient = createRouterClient<Router>({
          url: `http://localhost:${PORT}/http`,
          transport: 'http',
        })

        const httpResult = await httpClient.fetch({
          getUser: { id: '1' },
        })
        expect(httpResult.getUser).toBeDefined()
        if (isSuccess(httpResult.getUser)) {
          expect(httpResult.getUser.data.id).toBe('1')
        }

        // Test stream transport
        const streamClient = createRouterClient<Router>({
          url: `http://localhost:${PORT}/stream`,
          transport: 'stream',
        })

        const streamResult = await streamClient.fetch({
          getUser: { id: '2' },
        })
        expect(streamResult.getUser).toBeDefined()
        if (isSuccess(streamResult.getUser)) {
          expect(streamResult.getUser.data.id).toBe('2')
        }

        // Test WebSocket transport
        const wsClient = createRouterClient<Router>({
          url: `ws://localhost:${PORT}/ws`,
          transport: 'websocket',
        })

        const wsResult = await wsClient.fetch({
          getUser: { id: '3' },
        })
        expect(wsResult.getUser).toBeDefined()
        if (isSuccess(wsResult.getUser)) {
          expect(wsResult.getUser.data.id).toBe('3')
        }
      } finally {
        app.stop()
      }
    })
  })
})
