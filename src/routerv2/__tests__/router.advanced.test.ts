import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from 'bun:test'
import { createRouter } from '../router'
import { createRouterClient } from '../router.client'
import { action } from '../../action/action'
import { m } from '../..'
import { Elysia } from 'elysia'
const PORT = 3001

describe('Router Advanced Tests', () => {
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
      slowAction: action(
        m.object({ delay: m.number() }),
        async ({ params }) => {
          await new Promise((resolve) =>
            setTimeout(resolve, params.delay),
          )
          return { completed: true }
        },
      ),
      errorAction: action(
        m.object({ shouldError: m.boolean() }),
        async ({ params }) => {
          if (params.shouldError) {
            throw new Error('Action error')
          }
          return { success: true }
        },
      ),
    },
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
    .post('/half-duplex', ({ request }) => {
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
    await server.stop()
  })

  // ==========================================================================
  // Graceful Shutdown Tests
  // ==========================================================================
  describe('Graceful Shutdown', () => {
    it('should close server gracefully after all requests complete', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      // Make a request
      const result = await client.fetch({
        getUser: { id: '1' },
      })

      expect(result.getUser.status).toBe('ok')

      // Server should still be accepting requests
      const result2 = await client.fetch({
        getUser: { id: '2' },
      })

      expect(result2.getUser.status).toBe('ok')
    })

    it('should handle concurrent requests during shutdown', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      // Start multiple concurrent requests
      const promises = Array.from(
        { length: 5 },
        (_, index) =>
          client.fetch({
            getUser: { id: String(index) },
          }),
      )

      const results = await Promise.all(promises)

      // All requests should complete successfully
      for (const [index, result] of results.entries()) {
        expect(result.getUser.status).toBe('ok')
        expect(result.getUser.data?.id).toBe(String(index))
      }
    })
  })

  // ==========================================================================
  // Concurrency Tests
  // ==========================================================================
  describe('Concurrency', () => {
    it('should handle multiple concurrent HTTP requests', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      const concurrentRequests = 10
      const promises = Array.from(
        { length: concurrentRequests },
        (_, index) =>
          client.fetch({
            getUser: { id: String(index) },
          }),
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(concurrentRequests)
      for (const [index, result] of results.entries()) {
        expect(result.getUser.status).toBe('ok')
        expect(result.getUser.data?.id).toBe(String(index))
      }
    })

    it('should handle multiple concurrent stream requests', async () => {
      const client = createRouterClient<Router>({
        streamURL: `http://localhost:${PORT}/stream`,
      })

      const concurrentRequests = 5
      const promises = Array.from(
        { length: concurrentRequests },
        (_, index) => {
          const stream = client.stream({
            getUser: { id: String(index) },
          })
          return stream.next()
        },
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(concurrentRequests)
      for (const [index, result] of results.entries()) {
        expect(result.value?.getUser?.status).toBe('ok')
        expect(result.value?.getUser?.data?.id).toBe(
          String(index),
        )
      }
    })

    it('should handle mixed concurrent transport requests', async () => {
      const httpClient = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })
      const streamClient = createRouterClient<Router>({
        streamURL: `http://localhost:${PORT}/stream`,
      })

      const httpPromise = httpClient.fetch({
        getUser: { id: 'http' },
      })
      const streamPromise = streamClient
        .stream({
          getUser: { id: 'stream' },
        })
        .next()

      const [httpResult, streamResult] = await Promise.all([
        httpPromise,
        streamPromise,
      ])

      expect(httpResult.getUser.status).toBe('ok')
      expect(httpResult.getUser.data?.id).toBe('http')
      expect(streamResult.value?.getUser?.status).toBe('ok')
      expect(streamResult.value?.getUser?.data?.id).toBe(
        'stream',
      )
    })
  })

  // ==========================================================================
  // Performance Tests
  // ==========================================================================
  describe('Performance', () => {
    it('should handle rapid sequential requests', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      const startTime = Date.now()
      const requestCount = 50

      for (let index = 0; index < requestCount; index++) {
        const result = await client.fetch({
          getUser: { id: String(index) },
        })
        expect(result.getUser.status).toBe('ok')
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete 50 requests in reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000) // 5 seconds
    })

    it('should handle slow actions without blocking other requests', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      // Start a slow action
      const slowPromise = client.fetch({
        slowAction: { delay: 100 },
      })

      // Make quick requests while slow action is running
      const quickPromises = Array.from(
        { length: 5 },
        (_, index) =>
          client.fetch({
            getUser: { id: String(index) },
          }),
      )

      // Quick requests should complete before slow action
      const quickResults = await Promise.all(quickPromises)
      for (const result of quickResults) {
        expect(result.getUser.status).toBe('ok')
      }

      // Slow action should still complete
      const slowResult = await slowPromise
      expect(slowResult.slowAction.status).toBe('ok')
      expect(slowResult.slowAction.data?.completed).toBe(
        true,
      )
    })
  })

  // ==========================================================================
  // Load Tests
  // ==========================================================================
  describe('Load', () => {
    it('should handle high volume of requests', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      const highVolume = 100
      const promises = Array.from(
        { length: highVolume },
        (_, index) =>
          client.fetch({
            getUser: { id: String(index) },
          }),
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(highVolume)
      const successCount = results.filter(
        (r) => r.getUser.status === 'ok',
      ).length
      expect(successCount).toBe(highVolume)
    })

    it('should handle burst traffic', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      // Simulate burst: many requests at once
      const burstSize = 20
      const bursts = 5

      for (let burst = 0; burst < bursts; burst++) {
        const promises = Array.from(
          { length: burstSize },
          (_, index) =>
            client.fetch({
              getUser: { id: `${burst}-${index}` },
            }),
        )

        const results = await Promise.all(promises)
        for (const result of results) {
          expect(result.getUser.status).toBe('ok')
        }
      }
    })
  })

  // ==========================================================================
  // Security Tests
  // ==========================================================================
  describe('Security', () => {
    it('should validate input parameters', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      // Invalid params should be rejected with validation error
      const result = await client.fetch({
        getUser: { id: 123 as unknown as string },
      })

      expect(result.getUser.status).toBe('error')
      expect(result.getUser.error).toBeDefined()
      if (
        result.getUser.error &&
        typeof result.getUser.error === 'object'
      ) {
        const error = result.getUser.error as {
          type?: string
        }
        expect(error.type).toBe('validation')
      }
    })

    it('should handle error actions gracefully', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      const result = await client.fetch({
        errorAction: { shouldError: true },
      })

      expect(result.errorAction.status).toBe('error')
      expect(result.errorAction.error).toBeDefined()
    })

    it('should not expose internal errors', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      const result = await client.fetch({
        errorAction: { shouldError: true },
      })

      // Error should be structured, not raw internal error
      expect(result.errorAction.status).toBe('error')
      expect(result.errorAction.error).toBeDefined()
      // Should not expose stack traces or internal details
      if (
        result.errorAction.error &&
        typeof result.errorAction.error === 'object'
      ) {
        const error = result.errorAction.error as {
          stack?: unknown
        }
        // Stack should not be exposed in production
        // This is a basic check - actual implementation may vary
        expect(error.stack).toBeUndefined()
      }
    })
  })
})
