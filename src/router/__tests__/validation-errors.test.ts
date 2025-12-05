import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from 'bun:test'
import type { ServerWebSocket } from 'bun'
import { action } from '../../action/action'
import * as m from '../../model'
import { createRouter } from '../router'
import { createRouterClient } from '../router.client'
import { defineClientActionsSchema } from '../router.client.types'
import { Elysia } from 'elysia'
import { getTestPort } from './test-utils'

const PORT = getTestPort()

describe('Validation Error Handling', () => {
  const clientActionsSchema = defineClientActionsSchema({
    showNotification: {
      params: m.object({ message: m.string() }),
      return: m.object({ acknowledged: m.boolean() }),
    },
  })

  type ClientActions = typeof clientActionsSchema

  const router = createRouter({
    serverActions: {
      getUser: action(
        m.object({ id: m.string() }),
        async ({ params }) => {
          return {
            id: params.id,
            name: `User ${params.id}`,
          }
        },
      ),
      createUser: action(
        m.object({
          name: m.string(),
          email: m.string().isEmail(),
        }),
        async ({ params }) => {
          return {
            id: '123',
            name: params.name,
            email: params.email,
          }
        },
      ),
      getUserWithClientAction: action(
        m.object({ id: m.string() }),
        async ({ params, clientActions }) => {
          const { showNotification } =
            clientActions<ClientActions>()
          await showNotification?.({
            message: `Fetching user ${params.id}`,
          })
          return {
            id: params.id,
            name: `User ${params.id}`,
          }
        },
      ),
    },
    clientActions: clientActionsSchema,
  })

  type Router = typeof router

  const server = new Elysia()
    .get('/http', ({ request }) => {
      return router.onRequest({
        request,
        ctx: {},
        type: 'http',
      })
    })
    .post('/http', ({ request }) => {
      return router.onRequest({
        request,
        ctx: {},
        type: 'http',
      })
    })
    .get('/stream', ({ request }) => {
      return router.onRequest({
        request,
        ctx: {},
        type: 'stream',
      })
    })
    .post('/stream', ({ request }) => {
      return router.onRequest({
        request,
        ctx: {},
        type: 'stream',
      })
    })
    .post('/duplex', ({ request }) => {
      return router.onRequest({
        request,
        ctx: {},
        type: 'duplex',
      })
    })
    .ws('/ws', {
      message(ws, message) {
        if (router.onWebSocketMessage) {
          router
            .onWebSocketMessage({
              ws: ws.raw as ServerWebSocket<unknown>,
              message: message as Uint8Array,
              ctx: {},
            })
            .catch(() => {
              // Handle errors
            })
        }
      },
    })
    .listen(PORT)

  beforeAll(() => {
    // Server is ready
  })

  afterAll(async () => {
    router.dispose()
    try {
      await Promise.race([
        server.stop(),
        new Promise((resolve) => setTimeout(resolve, 40)),
      ])
    } catch {
      // Ignore errors when stopping server
    }
  })

  const client = createRouterClient<Router>({
    httpURL: `http://localhost:${PORT}/http`,
    streamURL: `http://localhost:${PORT}/stream`,
    halfDuplexUrl: `http://localhost:${PORT}/duplex`,
    websocketURL: `ws://localhost:${PORT}/ws`,
    defineClientActions: {
      showNotification: async () => {
        return { acknowledged: true }
      },
    },
  })

  describe('fetchActions validation errors', () => {
    it('should return validation error for invalid params (number instead of string)', async () => {
      const result = await client.fetchActions.getUser({
        id: 2 as never,
      })

      expect(result.status).toBe('error')
      expect(result.error).toBeDefined()
      expect(result.error?.type).toBe('validation')
      expect(result.error?.code).toBe(400)
      expect(result.error?.message).toBeDefined()
      if (
        result.error &&
        'type' in result.error &&
        result.error.type === 'validation'
      ) {
        expect(result.error.errors).toBeDefined()
        expect(Array.isArray(result.error.errors)).toBe(
          true,
        )
        expect(result.error.errors?.length).toBeGreaterThan(
          0,
        )
      }
    })

    it('should return validation error for missing required field', async () => {
      const result = await client.fetchActions.getUser(
        {} as never,
      )

      expect(result.status).toBe('error')
      expect(result.error?.type).toBe('validation')
      expect(result.error?.code).toBe(400)
    })

    it('should return validation error for invalid email format', async () => {
      const result = await client.fetchActions.createUser({
        name: 'John',
        email: 'invalid-email' as never,
      })

      expect(result.status).toBe('error')
      expect(result.error?.type).toBe('validation')
      expect(result.error?.code).toBe(400)
    })
  })

  describe('streamActions validation errors', () => {
    it('should return validation error for invalid params (number instead of string)', async () => {
      const streamGen = client.streamActions.getUser({
        id: 2 as never,
      })

      const results: Array<{
        status: string
        error?: unknown
      }> = []
      for await (const item of streamGen) {
        results.push(item)
      }

      expect(results.length).toBeGreaterThan(0)
      const [errorResult] = results
      expect(errorResult?.status).toBe('error')
      expect(errorResult?.error).toBeDefined()
    })

    it('should return validation error for missing required field', async () => {
      const streamGen = client.streamActions.getUser(
        {} as never,
      )

      const results: Array<{
        status: string
        error?: unknown
      }> = []
      for await (const item of streamGen) {
        results.push(item)
      }

      expect(results.length).toBeGreaterThan(0)
      const [errorResult] = results
      expect(errorResult?.status).toBe('error')
    })
  })

  describe('duplexActions validation errors', () => {
    it('should return validation error for invalid params (number instead of string)', async () => {
      const duplexGen = client.duplexActions.getUser({
        id: 2 as never,
      })

      const results: Array<{
        status: string
        error?: unknown
      }> = []
      for await (const item of duplexGen) {
        results.push(item)
      }

      expect(results.length).toBeGreaterThan(0)
      const [errorResult] = results
      expect(errorResult?.status).toBe('error')
      expect(errorResult?.error).toBeDefined()
    })

    it('should return validation error for missing required field', async () => {
      const duplexGen = client.duplexActions.getUser(
        {} as never,
      )

      const results: Array<{
        status: string
        error?: unknown
      }> = []
      for await (const item of duplexGen) {
        results.push(item)
      }

      expect(results.length).toBeGreaterThan(0)
      const [errorResult] = results
      expect(errorResult?.status).toBe('error')
    })
  })

  describe('non-proxy fetch validation errors', () => {
    it('should return validation error for invalid params', async () => {
      const result = await client.fetch({
        getUser: { id: 2 as never },
      })

      expect(result.getUser).toBeDefined()
      expect(result.getUser.status).toBe('error')
      expect(result.getUser.error?.type).toBe('validation')
      expect(result.getUser.error?.code).toBe(400)
    })
  })

  describe('non-proxy stream validation errors', () => {
    it('should return validation error for invalid params', async () => {
      const streamGen = client.stream({
        getUser: { id: 2 as never },
      })

      const results: Array<{
        getUser?: { status: string; error?: unknown }
      }> = []
      for await (const item of streamGen) {
        results.push(item)
      }

      expect(results.length).toBeGreaterThan(0)
      const [errorResult] = results
      expect(errorResult?.getUser?.status).toBe('error')
      expect(errorResult?.getUser?.error).toBeDefined()
    })
  })

  describe('websocket validation errors', () => {
    it('should return validation error for invalid params', async () => {
      const connection = client.startWebsocket()
      await connection.send({
        getUser: { id: 2 as never },
      })

      const results: Array<{
        getUser?: { status: string; error?: unknown }
      }> = []
      for await (const item of connection.stream) {
        results.push(item)
        if (results.length > 0) {
          break
        }
      }

      expect(results.length).toBeGreaterThan(0)
      const [errorResult] = results
      expect(errorResult?.getUser?.status).toBe('error')
      expect(errorResult?.getUser?.error).toBeDefined()
      if (
        errorResult?.getUser?.error &&
        typeof errorResult.getUser.error === 'object' &&
        'type' in errorResult.getUser.error
      ) {
        expect(errorResult.getUser.error.type).toBe(
          'validation',
        )
      }

      connection.close()
    })
  })

  describe('client action validation errors in duplex', () => {
    it('should return validation error when client action returns invalid data', async () => {
      const clientWithInvalidAction =
        createRouterClient<Router>({
          httpURL: `http://localhost:${PORT}/http`,
          streamURL: `http://localhost:${PORT}/stream`,
          halfDuplexUrl: `http://localhost:${PORT}/duplex`,
          defineClientActions: {
            showNotification: async (_params) => {
              // Return invalid data (should be { acknowledged: boolean })
              return { invalid: 'data' } as never
            },
          },
        })

      const duplexGen =
        clientWithInvalidAction.duplexActions.getUserWithClientAction(
          {
            id: 'test',
          },
        )

      const results: Array<{
        status: string
        error?: unknown
      }> = []
      for await (const item of duplexGen) {
        results.push(item)
      }

      // Should have error because client action validation failed
      expect(results.length).toBeGreaterThan(0)
      const [errorResult] = results
      expect(errorResult?.status).toBe('error')
    })
  })

  describe('client action validation errors in websocket', () => {
    it('should return validation error when client action returns invalid data', async () => {
      const clientWithInvalidAction =
        createRouterClient<Router>({
          websocketURL: `ws://localhost:${PORT}/ws`,
          defineClientActions: {
            showNotification: async (_params) => {
              // Return invalid data (should be { acknowledged: boolean })
              return { invalid: 'data' } as never
            },
          },
        })

      const connection =
        clientWithInvalidAction.startWebsocket()
      await connection.send({
        getUserWithClientAction: { id: 'test' },
      })

      const results: Array<{
        getUserWithClientAction?: {
          status: string
          error?: unknown
        }
      }> = []
      for await (const item of connection.stream) {
        results.push(item)
        if (results.length > 0) {
          break
        }
      }

      // Should have error because client action validation failed
      expect(results.length).toBeGreaterThan(0)
      const [errorResult] = results
      expect(
        errorResult?.getUserWithClientAction?.status,
      ).toBe('error')

      connection.close()
    })
  })

  describe('validation error structure', () => {
    it('should include proper validation error details', async () => {
      const result = await client.fetchActions.getUser({
        id: 2 as never,
      })

      expect(result.status).toBe('error')
      expect(result.error).toBeDefined()

      if (
        result.error &&
        'type' in result.error &&
        result.error.type === 'validation'
      ) {
        const validationError = result.error
        expect(validationError.code).toBe(400)
        expect(validationError.message).toBeDefined()
        expect(validationError.errors).toBeDefined()
        expect(Array.isArray(validationError.errors)).toBe(
          true,
        )
        expect(
          validationError.errors?.length,
        ).toBeGreaterThan(0)

        // Check error structure
        const firstError = validationError.errors?.[0]
        expect(firstError).toBeDefined()
        expect(firstError?.instancePath).toBeDefined()
        expect(firstError?.message).toBeDefined()
      }
    })
  })
})
