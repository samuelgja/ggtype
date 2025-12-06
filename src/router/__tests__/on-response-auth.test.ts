import type { ServerWebSocket } from 'bun'
import { m } from '../..'
import { action } from '../../action/action'
import { createRouter } from '../router'
import { createRouterClient } from '../../router-client/router-client'
import { Elysia } from 'elysia'
import { ErrorWithCode } from '../../utils/errors'
import { getTestPort } from './test-utils'

describe('onResponse Authorization Tests', () => {
  const PORT = getTestPort()

  // Router with login and setUser actions
  const router = createRouter({
    serverActions: {
      login: action(m.object({}), async () => {
        // Generate a unique auth header
        // eslint-disable-next-line sonarjs/pseudo-random
        const authHeader = `Bearer Authorized-${Date.now()}-${Math.random()}`
        return {
          authHeader,
        }
      }),

      setUser: action(
        m.object({
          userName: m.string(),
        }),
        async ({ params, ctx }) => {
          // Check for authorization header
          const context = ctx as {
            request?: {
              headers: {
                get: (key: string) => string | null
              }
            }
          }
          const authHeader =
            context.request?.headers?.get('authorization')
          if (
            !authHeader ||
            !authHeader.startsWith('Bearer Authorized')
          ) {
            throw new ErrorWithCode('Unauthorized', 401)
          }

          return {
            userName: params.userName,
            message: 'User set successfully',
          }
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
        ctx: { request },
        type: 'http',
      })
    })
    .post('/http', ({ request }) => {
      return router.onRequest({
        request,
        ctx: { request },
        type: 'http',
      })
    })
    .get('/stream', ({ request }) => {
      return router.onRequest({
        request,
        ctx: { request },
        type: 'stream',
      })
    })
    .post('/stream', ({ request }) => {
      return router.onRequest({
        request,
        ctx: { request },
        type: 'stream',
      })
    })
    .post('/duplex', ({ request }) => {
      return router.onRequest({
        request,
        ctx: { request },
        type: 'duplex',
      })
    })
    .ws('/ws', {
      message(ws, message) {
        // console.log('WS Data keys:', Object.keys(ws.data as object))
        if (router.onWebSocketMessage) {
          router
            .onWebSocketMessage({
              ws: ws.raw as ServerWebSocket<unknown>,
              message: message as Uint8Array,
              ctx: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                request: (ws.data as any).request,
              },
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
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ])
    } catch {
      // Ignore errors when stopping server
    }
  })

  describe('HTTP Transport - onResponse with Authorization', () => {
    it('should handle unauthorized response, login, and retry with auth header', async () => {
      let loginCalled = false
      let setUserAttempts = 0

      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        onResponse: async ({ json, runAgain }) => {
          // Check if setUser failed with unauthorized
          if (
            json.setUser?.status === 'error' &&
            json.setUser.error?.code === 401
          ) {
            setUserAttempts++
            if (!loginCalled) {
              loginCalled = true
              // Call login to get auth header
              const loginResult = await client.fetch({
                login: {},
              })

              if (loginResult.login?.status === 'ok') {
                // Set the authorization header
                client.setHeaders({
                  Authorization: 'Bearer Authorized',
                })
                // Retry the original setUser request
                return runAgain()
              }
            }
          }

          return json
        },
      })

      // First attempt should fail, then succeed after login
      const result = await client.fetch({
        setUser: { userName: 'testuser' },
      })

      expect(loginCalled).toBe(true)
      expect(setUserAttempts).toBeGreaterThan(0)
      expect(result.setUser?.status).toBe('ok')
      expect(result.setUser?.data?.userName).toBe(
        'testuser',
      )
      expect(result.setUser?.data?.message).toBe(
        'User set successfully',
      )
    })
  })

  describe('Stream Transport - onResponse with Authorization', () => {
    it('should handle unauthorized response, login, and retry with auth header', async () => {
      let loginCalled = false
      let setUserAttempts = 0
      let lastRetryResult: unknown = null

      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        streamURL: `http://localhost:${PORT}/stream`,
        onResponse: async ({ json, runAgain }) => {
          // Check if setUser failed with unauthorized
          if (
            json.setUser?.status === 'error' &&
            json.setUser.error?.code === 401
          ) {
            setUserAttempts++
            if (!loginCalled) {
              loginCalled = true
              // Call login to get auth header
              const loginResult = await client.fetch({
                login: {},
              })

              if (loginResult.login?.status === 'ok') {
                // Set the authorization header
                client.setHeaders({
                  Authorization: 'Bearer Authorized',
                })
                // Retry the original setUser request
                // For stream transport, runAgain returns an AsyncGenerator
                const retryGenerator =
                  runAgain() as AsyncGenerator<typeof json>
                // Consume all results from the retry and return the last one
                for await (const retryResult of retryGenerator) {
                  lastRetryResult = retryResult
                }
                return lastRetryResult as typeof json
              }
            }
          }

          return json
        },
      })

      // First attempt should fail, then succeed after login
      const results: unknown[] = []
      for await (const result of client.stream({
        setUser: { userName: 'testuser' },
      })) {
        results.push(result)
      }

      expect(loginCalled).toBe(true)
      expect(setUserAttempts).toBeGreaterThan(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalResult = results.at(-1) as any
      expect(finalResult?.setUser?.status).toBe('ok')
      expect(finalResult?.setUser?.data?.userName).toBe(
        'testuser',
      )
      expect(finalResult?.setUser?.data?.message).toBe(
        'User set successfully',
      )
    })
  })

  describe('Duplex Transport - onResponse with Authorization', () => {
    it('should handle unauthorized response, login, and retry with auth header', async () => {
      let loginCalled = false
      let setUserAttempts = 0
      let lastRetryResult: unknown = null

      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        halfDuplexUrl: `http://localhost:${PORT}/duplex`,
        onResponse: async ({ json, runAgain }) => {
          // Check if setUser failed with unauthorized
          if (
            json.setUser?.status === 'error' &&
            json.setUser.error?.code === 401
          ) {
            setUserAttempts++
            if (!loginCalled) {
              loginCalled = true
              // Call login to get auth header
              const loginResult = await client.fetch({
                login: {},
              })

              if (loginResult.login?.status === 'ok') {
                // Set the authorization header
                client.setHeaders({
                  Authorization: 'Bearer Authorized',
                })
                // Retry the original setUser request
                // For duplex transport, runAgain returns an AsyncGenerator
                const retryGenerator =
                  runAgain() as AsyncGenerator<typeof json>
                // Consume all results from the retry and return the last one
                for await (const retryResult of retryGenerator) {
                  lastRetryResult = retryResult
                }
                return lastRetryResult as typeof json
              }
            }
          }

          return json
        },
      })

      // First attempt should fail, then succeed after login
      const results: unknown[] = []
      for await (const result of client.duplex({
        setUser: { userName: 'testuser' },
      })) {
        results.push(result)
      }

      expect(loginCalled).toBe(true)
      expect(setUserAttempts).toBeGreaterThan(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalResult = results.at(-1) as any
      expect(finalResult?.setUser?.status).toBe('ok')
      expect(finalResult?.setUser?.data?.userName).toBe(
        'testuser',
      )
      expect(finalResult?.setUser?.data?.message).toBe(
        'User set successfully',
      )
    })
  })

  describe('WebSocket Transport - onResponse with Authorization', () => {
    it('should handle unauthorized response, login, and retry with auth header', async () => {
      let loginCalled = false
      let setUserAttempts = 0
      let lastRetryResult: unknown = null

      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        websocketURL: `ws://localhost:${PORT}/ws`,
        onResponse: async ({ json, runAgain }) => {
          // Check if setUser failed with unauthorized
          if (
            json.setUser?.status === 'error' &&
            json.setUser.error?.code === 401
          ) {
            setUserAttempts++
            if (!loginCalled) {
              loginCalled = true
              // Call login to get auth header
              const loginResult = await client.fetch({
                login: {},
              })

              if (loginResult.login?.status === 'ok') {
                // Set the authorization header
                client.setHeaders({
                  Authorization: 'Bearer Authorized',
                })
                // Retry the original setUser request
                // For websocket transport, runAgain returns an AsyncGenerator
                const retryGenerator =
                  runAgain() as AsyncGenerator<typeof json>
                // Consume all results from the retry and return the last one
                for await (const retryResult of retryGenerator) {
                  lastRetryResult = retryResult
                }
                return lastRetryResult as typeof json
              }
            }
          }

          return json
        },
      })

      // First attempt should fail, then succeed after login
      const results: unknown[] = []
      for await (const result of client.websocket({
        setUser: { userName: 'testuser' },
      })) {
        results.push(result)
      }

      expect(loginCalled).toBe(true)
      expect(setUserAttempts).toBeGreaterThan(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalResult = results.at(-1) as any
      expect(finalResult?.setUser?.status).toBe('ok')
      expect(finalResult?.setUser?.data?.userName).toBe(
        'testuser',
      )
      expect(finalResult?.setUser?.data?.message).toBe(
        'User set successfully',
      )
    })
  })

  // onResponse is now supported for stream, websocket, and duplex transports.
  // The hook is called for each yielded result (when isLast is true), and runAgain returns an AsyncGenerator
  // for these transports (instead of a Promise for HTTP transport).
})
