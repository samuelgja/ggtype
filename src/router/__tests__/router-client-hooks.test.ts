/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unicorn/prefer-at */
import { action, m } from '../..'
import { ErrorWithCode } from '../../utils/errors'
import { createRouter } from '../router'
import {
  createRouterClient,
  hasStatusCode,
} from '../router-client'

describe('router client hooks and headers', () => {
  const userModel = m
    .object({
      id: m.string(),
      name: m.string(),
    })
    .isOptional()

  const getUserAction = action(userModel, ({ params }) => {
    return { id: params.id, name: params.name }
  })

  const getErrorAction = action(m.string(), () => {
    throw new ErrorWithCode('Unauthorized', 401)
  })

  const getForbiddenAction = action(m.string(), () => {
    throw new ErrorWithCode('Forbidden', 403)
  })

  const router = createRouter({
    serverActions: {
      getUser: getUserAction,
      getError: getErrorAction,
      getForbidden: getForbiddenAction,
    },
    clientActions: {},
  })

  type Router = typeof router

  let server: ReturnType<typeof Bun.serve> | null = null
  let PORT: number = 0

  beforeEach(() => {
    server = Bun.serve({
      port: 0,
      reusePort: true,
      async fetch(request) {
        // Check for Authorization header
        const authHeader =
          request.headers.get('Authorization')
        if (
          authHeader &&
          authHeader !== 'Bearer valid-token'
        ) {
          return Response.json(
            {
              getUser: {
                status: 'error',
                error: {
                  type: 'generic',
                  message: 'Invalid token',
                  code: 401,
                },
              },
            },
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
        }

        return router.onRequest({
          request,
          ctx: {},
        })
      },
    })
    PORT = server.port ?? 0
  })

  afterEach(() => {
    if (server) {
      server.stop()
    }
  })

  describe('setHeaders', () => {
    it('should set headers and include them in requests', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
      })

      client.setHeaders({
        Authorization: 'Bearer valid-token',
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

    it('should reset headers when called with no arguments', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
      })

      client.setHeaders({
        Authorization: 'Bearer valid-token',
      })
      client.setHeaders() // Reset headers

      const result = await client.fetch({
        getUser: { id: '1', name: 'John' },
      })

      // Should still work without auth header for this endpoint
      expect(result.getUser?.status).toBe('ok')
    })

    it('should update headers when called multiple times', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
      })

      client.setHeaders({
        Authorization: 'Bearer invalid-token',
      })
      client.setHeaders({
        Authorization: 'Bearer valid-token',
      })

      const result = await client.fetch({
        getUser: { id: '1', name: 'John' },
      })

      const aha = result.getUser
      // eslint-disable-next-line no-console
      console.log(aha)

      expect(result.getUser?.status).toBe('ok')
    })

    it('should include headers in stream transport', async () => {
      const streamRouter = createRouter({
        serverActions: {
          getUser: getUserAction,
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

      const streamPort = streamServer.port

      const client = createRouterClient<StreamRouter>({
        url: `http://localhost:${streamPort}`,
        transport: 'stream',
      })

      client.setHeaders({
        'X-Custom-Header': 'custom-value',
      })

      const stream = await client.stream({
        getUser: { id: '1', name: 'John' },
      })

      const results: unknown[] = []
      for await (const result of stream) {
        results.push(result)
      }

      expect(results.length).toBeGreaterThan(0)
      const lastResult = results[results.length - 1]
      expect(
        (lastResult as { getUser?: { status: string } })
          .getUser?.status,
      ).toBe('ok')

      streamServer.stop()
    })
  })

  describe('onResponse', () => {
    it('should be called with json and runAgain method', async () => {
      let callCount = 0
      let lastArgs: unknown = null

      const onResponseMock = (options: unknown) => {
        callCount++
        lastArgs = options
      }

      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        onResponse: onResponseMock,
      })

      const params = { getUser: { id: '1', name: 'John' } }

      await client.fetch(params)

      expect(callCount).toBe(1)
      expect(lastArgs).toMatchObject({
        json: expect.objectContaining({
          getUser: expect.objectContaining({
            status: 'ok',
          }),
        }),
        runAgain: expect.any(Function),
      })
    })

    it('should allow modifying the response', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        onResponse: ({ json }) => {
          if (
            json.getUser?.status === 'ok' &&
            json.getUser.data
          ) {
            return {
              ...json,
              getUser: {
                ...json.getUser,
                data: {
                  ...json.getUser.data,
                  name: 'Modified Name',
                },
              },
            }
          }
          return json
        },
      })

      const result = await client.fetch({
        getUser: { id: '1', name: 'John' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '1',
        name: 'Modified Name',
      })
    })

    it('should handle authorization errors and retry with token refresh', async () => {
      let tokenRefreshCount = 0
      let requestCount = 0

      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        onResponse: async ({
          json,
          runAgain,
        }): Promise<typeof json | void> => {
          requestCount++
          if (
            hasStatusCode(json, 401) &&
            tokenRefreshCount === 0
          ) {
            tokenRefreshCount++
            // Simulate token refresh
            client.setHeaders({
              Authorization: 'Bearer valid-token',
            })
            // Retry the request
            return runAgain()
          }
          return json
        },
      })

      // Start with invalid token
      client.setHeaders({
        Authorization: 'Bearer invalid-token',
      })

      const result = await client.fetch({
        getUser: { id: '1', name: 'John' },
      })

      expect(tokenRefreshCount).toBe(1)
      expect(result.getUser?.status).toBe('ok')
    })

    it('should throw error to prevent response from being returned', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        onResponse: ({ json }) => {
          if (hasStatusCode(json, 401)) {
            throw new Error('Token expired')
          }
          return json
        },
      })

      client.setHeaders({
        Authorization: 'Bearer invalid-token',
      })

      await expect(
        client.fetch({
          getUser: { id: '1', name: 'John' },
        }),
      ).rejects.toThrow('Token expired')
    })

    it('should work with multiple actions in response', async () => {
      let lastArgs: unknown = null

      const onResponseMock = (options: unknown) => {
        lastArgs = options
      }

      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        onResponse: onResponseMock,
      })

      await client.fetch({
        getUser: { id: '1', name: 'John' },
        getError: 'test',
      })

      expect(lastArgs).toMatchObject({
        json: expect.objectContaining({
          getUser: expect.any(Object),
          getError: expect.any(Object),
        }),
        runAgain: expect.any(Function),
      })
    })
  })

  describe('onRequest', () => {
    it('should be called with params and runAgain method', async () => {
      let callCount = 0
      let lastArgs: {
        params: unknown
        runAgain: unknown
      } | null = null

      const onRequestMock = (options: {
        params: unknown
        runAgain: unknown
      }) => {
        callCount++
        lastArgs = options
      }

      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        onRequest: onRequestMock,
      })

      const params = { getUser: { id: '1', name: 'John' } }

      await client.fetch(params)

      expect(callCount).toBe(1)
      expect(lastArgs).toMatchObject({
        params,
        runAgain: expect.any(Function),
      })
    })

    it('should allow modifying request parameters', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        onRequest: ({ params }) => {
          if (params.getUser) {
            return {
              ...params,
              getUser: {
                ...params.getUser,
                name: 'Modified Request Name',
              },
            }
          }
          return params
        },
      })

      const result = await client.fetch({
        getUser: { id: '1', name: 'John' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '1',
        name: 'Modified Request Name',
      })
    })

    it('should allow retrying request with runAgain', async () => {
      let attemptCount = 0

      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        onRequest: async ({
          params,
          runAgain,
        }): Promise<typeof params | void> => {
          attemptCount++
          if (attemptCount === 1) {
            // First attempt - set token and retry
            client.setHeaders({
              Authorization: 'Bearer valid-token',
            })
            await runAgain()
            // Return undefined to use the result from runAgain
            return undefined
          }
          return params
        },
      })

      const result = await client.fetch({
        getUser: { id: '1', name: 'John' },
      })

      expect(attemptCount).toBe(2)
      expect(result.getUser?.status).toBe('ok')
    })

    it('should work with stream transport', async () => {
      const streamRouter = createRouter({
        serverActions: {
          getUser: getUserAction,
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

      const streamPort = streamServer.port

      let lastArgs: {
        params: unknown
        runAgain: unknown
      } | null = null
      const onRequestMock = (options: {
        params: unknown
        runAgain: unknown
      }) => {
        lastArgs = options
      }

      const client = createRouterClient<StreamRouter>({
        url: `http://localhost:${streamPort}`,
        transport: 'stream',
        onRequest: onRequestMock,
      })

      const params = { getUser: { id: '1', name: 'John' } }

      const stream = await client.stream(params)

      // Consume the stream
      // eslint-disable-next-line sonarjs/no-unused-vars
      for await (const _ of stream) {
        // Consume all chunks
      }

      expect(lastArgs).toMatchObject({
        params,
        runAgain: expect.any(Function),
      })

      streamServer.stop()
    })
  })

  describe('hasStatusCode', () => {
    it('should return true when result contains error with specified status code', () => {
      const result = {
        getError: {
          status: 'error' as const,
          error: {
            type: 'generic' as const,
            message: 'Unauthorized',
            code: 401,
          },
        },
        getUser: {
          status: 'ok' as const,
          data: { id: '1', name: 'John' },
        },
      }

      expect(hasStatusCode(result, 401)).toBe(true)
      expect(hasStatusCode(result, 403)).toBe(false)
    })

    it('should return false when no errors match the status code', () => {
      const result = {
        getUser: {
          status: 'ok' as const,
          data: { id: '1', name: 'John' },
        },
        getForbidden: {
          status: 'error' as const,
          error: {
            type: 'generic' as const,
            message: 'Forbidden',
            code: 403,
          },
        },
      }

      expect(hasStatusCode(result, 401)).toBe(false)
      expect(hasStatusCode(result, 403)).toBe(true)
    })

    it('should return false for empty result', () => {
      const result = {}

      expect(hasStatusCode(result, 401)).toBe(false)
    })

    it('should work with multiple errors', () => {
      const result = {
        getError: {
          status: 'error' as const,
          error: {
            type: 'generic' as const,
            message: 'Unauthorized',
            code: 401,
          },
        },
        getForbidden: {
          status: 'error' as const,
          error: {
            type: 'generic' as const,
            message: 'Forbidden',
            code: 403,
          },
        },
      }

      expect(hasStatusCode(result, 401)).toBe(true)
      expect(hasStatusCode(result, 403)).toBe(true)
      expect(hasStatusCode(result, 404)).toBe(false)
    })
  })

  describe('integration: authorization flow', () => {
    it('should handle complete authorization flow with token refresh', async () => {
      let refreshTokenCallCount = 0
      let maxRetries = 2
      let retryCount = 0

      const refreshTokenAction = action(
        m.object({ refreshToken: m.string() }).isOptional(),
        ({ params }) => {
          refreshTokenCallCount++
          if (params.refreshToken === 'valid-refresh') {
            return {
              accessToken: 'new-valid-token',
              refreshToken: 'new-refresh-token',
            }
          }
          throw new ErrorWithCode(
            'Invalid refresh token',
            401,
          )
        },
      )

      const authRouter = createRouter({
        serverActions: {
          getUser: getUserAction,
          refreshToken: refreshTokenAction,
        },
        clientActions: {},
      })

      type AuthRouter = typeof authRouter

      const authServer = Bun.serve({
        port: 0,
        reusePort: true,
        async fetch(request) {
          const authHeader =
            request.headers.get('Authorization')
          if (
            authHeader &&
            authHeader !== 'Bearer new-valid-token' &&
            authHeader !== 'Bearer valid-token'
          ) {
            return Response.json(
              {
                getUser: {
                  status: 'error',
                  error: {
                    type: 'generic',
                    message: 'Invalid token',
                    code: 401,
                  },
                },
              },
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            )
          }

          return authRouter.onRequest({
            request,
            ctx: {},
          })
        },
      })

      const authPort = authServer.port ?? 0

      const client = createRouterClient<AuthRouter>({
        url: `http://localhost:${authPort}`,
        transport: 'http',
        onResponse: async ({
          json,
          runAgain,
        }): Promise<typeof json | void> => {
          if (
            hasStatusCode(json, 401) &&
            retryCount < maxRetries
          ) {
            retryCount++

            // Try to refresh token - create a client without onResponse to avoid recursion
            const refreshClient =
              createRouterClient<AuthRouter>({
                url: `http://localhost:${authPort}`,
                transport: 'http',
              })
            const refreshResult = await refreshClient.fetch(
              {
                refreshToken: {
                  refreshToken: 'valid-refresh',
                },
              },
            )

            if (
              refreshResult.refreshToken?.status === 'ok' &&
              refreshResult.refreshToken.data
            ) {
              // Update headers with new token
              const tokenData = refreshResult.refreshToken
                .data as {
                accessToken: string
                refreshToken: string
              }
              client.setHeaders({
                Authorization: `Bearer ${tokenData.accessToken}`,
              })
              // Retry original request - this will go through onResponse again, but retryCount is already incremented
              return runAgain()
            } else {
              throw new Error('Token refresh failed')
            }
          }

          if (hasStatusCode(json, 401)) {
            throw new Error(
              'Token expired - max tries reached',
            )
          }

          return json
        },
      })

      // Start with invalid token
      client.setHeaders({
        Authorization: 'Bearer invalid-token',
      })

      const result = await client.fetch({
        getUser: { id: '1', name: 'John' },
      })

      expect(refreshTokenCallCount).toBe(1)
      expect(retryCount).toBe(1)
      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '1',
        name: 'John',
      })

      authServer.stop()
    })

    it('should handle max retries exceeded', async () => {
      let retryCount = 0
      const maxRetries = 2

      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        onResponse: async ({
          json,
          runAgain,
        }): Promise<typeof json | void> => {
          if (
            hasStatusCode(json, 401) &&
            retryCount < maxRetries
          ) {
            retryCount++
            // Try to refresh but keep invalid token
            client.setHeaders({
              Authorization: 'Bearer still-invalid-token',
            })
            return runAgain()
          }

          if (hasStatusCode(json, 401)) {
            throw new Error(
              'Token expired - max tries reached',
            )
          }

          return json
        },
      })

      client.setHeaders({
        Authorization: 'Bearer invalid-token',
      })

      await expect(
        client.fetch({
          getUser: { id: '1', name: 'John' },
        }),
      ).rejects.toThrow('Token expired - max tries reached')

      expect(retryCount).toBe(maxRetries)
    })
  })
})
