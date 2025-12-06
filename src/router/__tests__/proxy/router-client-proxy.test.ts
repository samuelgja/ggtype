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
import { createRouterClient } from '../../../router-client/router-client'
import { Elysia } from 'elysia'
import { getTestPort } from '../test-utils'

const PORT = getTestPort()

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

    it('should fetch getUser action and return ActionResult directly', async () => {
      const result = await client.fetchActions.getUser({
        id: 'test-123',
      })

      expect(result).toBeDefined()
      expect(result.status).toBe('ok')
      expect(result.data).toEqual({
        id: 'test-123',
        name: 'User test-123',
      })
    })

    it('should fetch createUser action and return ActionResult directly', async () => {
      const result = await client.fetchActions.createUser({
        name: 'John Doe',
      })

      expect(result).toBeDefined()
      expect(result.status).toBe('ok')
      expect(result.data).toEqual({
        id: '123',
        name: 'John Doe',
      })
    })

    it('should handle errors correctly', async () => {
      const result = await client.fetchActions.getError({
        message: 'Test error',
      })

      expect(result).toBeDefined()
      expect(result.status).toBe('error')
      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('Test error')
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

    it('should stream getUser action and return ActionResult directly', async () => {
      const streamGen = client.streamActions.getUser({
        id: 'stream-123',
      })
      expect(streamGen).toBeDefined()
      expect(typeof streamGen[Symbol.asyncIterator]).toBe(
        'function',
      )

      const results: Array<{
        status: string
        data?: unknown
      }> = []
      for await (const item of streamGen) {
        results.push(item)
        expect(item.status).toBe('ok')
      }

      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.data).toEqual({
        id: 'stream-123',
        name: 'User stream-123',
      })
    })

    it('should stream createUser action and return ActionResult directly', async () => {
      const streamGen = client.streamActions.createUser({
        name: 'Stream User',
      })

      const results: Array<{
        status: string
        data?: unknown
      }> = []
      for await (const item of streamGen) {
        results.push(item)
        expect(item.status).toBe('ok')
      }

      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.data).toEqual({
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

    it('should duplex getUser action and return ActionResult directly', async () => {
      const duplexGen = client.duplexActions.getUser({
        id: 'duplex-123',
      })
      expect(duplexGen).toBeDefined()
      expect(typeof duplexGen[Symbol.asyncIterator]).toBe(
        'function',
      )

      const results: Array<{
        status: string
        data?: unknown
      }> = []
      for await (const item of duplexGen) {
        results.push(item)
        expect(item.status).toBe('ok')
      }

      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.data).toEqual({
        id: 'duplex-123',
        name: 'User duplex-123',
      })
    })

    it('should duplex createUser action and return ActionResult directly', async () => {
      const duplexGen = client.duplexActions.createUser({
        name: 'Duplex User',
      })

      const results: Array<{
        status: string
        data?: unknown
      }> = []
      for await (const item of duplexGen) {
        results.push(item)
        expect(item.status).toBe('ok')
      }

      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.data).toEqual({
        id: '123',
        name: 'Duplex User',
      })
    })
  })
})
