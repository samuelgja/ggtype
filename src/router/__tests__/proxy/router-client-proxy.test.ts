import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from 'bun:test'
import { action } from '../../../action/action'
import * as m from '../../../model'
import { createRouter } from '../../router'
import { createRouterClient } from '../../router.client'
import { Elysia } from 'elysia'

const PORT = 3010

describe('Router Client Proxy', () => {
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
        m.object({ name: m.string() }),
        async ({ params }) => {
          return {
            id: '123',
            name: params.name,
          }
        },
      ),
      getError: action(
        m.object({ message: m.string() }),
        async ({ params }) => {
          throw new Error(params.message)
        },
      ),
    },
    clientActions: {},
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
    .listen(PORT)

  beforeAll(() => {
    // Server is ready
  })

  afterAll(async () => {
    router.dispose()
    try {
      await Promise.race([
        server.stop(),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ])
    } catch {
      // Ignore errors when stopping server
    }
  })

  const client = createRouterClient<Router>({
    httpURL: `http://localhost:${PORT}/http`,
    streamURL: `http://localhost:${PORT}/stream`,
    halfDuplexUrl: `http://localhost:${PORT}/duplex`,
  })

  describe('fetchActions', () => {
    it('should call action via proxy with correct types', async () => {
      expect(client.fetchActions).toBeDefined()
      expect(typeof client.fetchActions.getUser).toBe(
        'function',
      )
      expect(typeof client.fetchActions.createUser).toBe(
        'function',
      )
    })

    it('should fetch getUser action and return only getUser in result', async () => {
      const result = await client.fetchActions.getUser({
        id: 'test-123',
      })

      expect(result).toBeDefined()
      expect(result.getUser).toBeDefined()
      expect(result.getUser.status).toBe('ok')
      expect(result.getUser.data).toEqual({
        id: 'test-123',
        name: 'User test-123',
      })

      // Type check: result should only have getUser, not createUser
      // TypeScript should error if trying to access createUser on getUser result
      // result.createUser // This would cause a TypeScript error
    })

    it('should fetch createUser action and return only createUser in result', async () => {
      const result = await client.fetchActions.createUser({
        name: 'John Doe',
      })

      expect(result).toBeDefined()
      expect(result.createUser).toBeDefined()
      expect(result.createUser.status).toBe('ok')
      expect(result.createUser.data).toEqual({
        id: '123',
        name: 'John Doe',
      })

      // Type check: result should only have createUser, not getUser
      // TypeScript should error if trying to access getUser on createUser result
      // result.getUser // This would cause a TypeScript error
    })

    it('should handle errors correctly', async () => {
      const result = await client.fetchActions.getError({
        message: 'Test error',
      })

      expect(result).toBeDefined()
      expect(result.getError).toBeDefined()
      expect(result.getError.status).toBe('error')
      expect(result.getError.error).toBeDefined()
      expect(result.getError.error?.message).toContain(
        'Test error',
      )
    })
  })

  describe('streamActions', () => {
    it('should call action via proxy with correct types', async () => {
      expect(client.streamActions).toBeDefined()
      expect(typeof client.streamActions.getUser).toBe(
        'function',
      )
      expect(typeof client.streamActions.createUser).toBe(
        'function',
      )
    })

    it('should stream getUser action and return only getUser in result', async () => {
      const streamGen = client.streamActions.getUser({
        id: 'stream-123',
      })
      expect(streamGen).toBeDefined()
      expect(typeof streamGen[Symbol.asyncIterator]).toBe(
        'function',
      )

      const results: Array<{
        getUser: { status: string; data?: unknown }
      }> = []
      for await (const item of streamGen) {
        results.push(item)
        expect(item.getUser).toBeDefined()
        expect(item.getUser.status).toBe('ok')
        // TypeScript ensures item only has getUser, not createUser
      }

      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.getUser.data).toEqual({
        id: 'stream-123',
        name: 'User stream-123',
      })
    })

    it('should stream createUser action and return only createUser in result', async () => {
      const streamGen = client.streamActions.createUser({
        name: 'Stream User',
      })

      const results: Array<{
        createUser: { status: string; data?: unknown }
      }> = []
      for await (const item of streamGen) {
        results.push(item)
        expect(item.createUser).toBeDefined()
        expect(item.createUser.status).toBe('ok')
        // TypeScript ensures item only has createUser, not getUser
      }

      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.createUser.data).toEqual({
        id: '123',
        name: 'Stream User',
      })
    })
  })

  describe('duplexActions', () => {
    it('should call action via proxy with correct types', async () => {
      expect(client.duplexActions).toBeDefined()
      expect(typeof client.duplexActions.getUser).toBe(
        'function',
      )
      expect(typeof client.duplexActions.createUser).toBe(
        'function',
      )
    })

    it('should duplex getUser action and return only getUser in result', async () => {
      const duplexGen = client.duplexActions.getUser({
        id: 'duplex-123',
      })
      expect(duplexGen).toBeDefined()
      expect(typeof duplexGen[Symbol.asyncIterator]).toBe(
        'function',
      )

      const results: Array<{
        getUser: { status: string; data?: unknown }
      }> = []
      for await (const item of duplexGen) {
        results.push(item)
        expect(item.getUser).toBeDefined()
        expect(item.getUser.status).toBe('ok')
        // TypeScript ensures item only has getUser, not createUser
      }

      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.getUser.data).toEqual({
        id: 'duplex-123',
        name: 'User duplex-123',
      })
    })

    it('should duplex createUser action and return only createUser in result', async () => {
      const duplexGen = client.duplexActions.createUser({
        name: 'Duplex User',
      })

      const results: Array<{
        createUser: { status: string; data?: unknown }
      }> = []
      for await (const item of duplexGen) {
        results.push(item)
        expect(item.createUser).toBeDefined()
        expect(item.createUser.status).toBe('ok')
        // TypeScript ensures item only has createUser, not getUser
      }

      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.createUser.data).toEqual({
        id: '123',
        name: 'Duplex User',
      })
    })
  })
})
