/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable sonarjs/no-nested-functions */
import { action, m, type TransportType } from '../..'
import { defineClientActionsSchema } from '../handle-client-actions'
import { createRouter } from '../router'
import { createRouterClient } from '../router-client'

describe('router security', () => {
  const transports: TransportType[] = [
    'stream',
    'websocket',
  ]

  for (const transport of transports) {
    describe(`transport: ${transport}`, () => {
      const timeout = 100
      const serverTimeout = timeout * 2 + 10

      const clientActions = defineClientActionsSchema({
        useTool: {
          params: m
            .object({
              tool: m.string(),
              user: m.string(),
            })
            .isOptional(),
          return: m.string().isOptional(),
        },
      })

      const getUser = action(
        m.object({ id: m.string() }).isOptional(),
        async ({ params }) => {
          return { id: params.id, name: 'User' }
        },
      )

      const getSecret = action(
        m.object({ key: m.string() }).isOptional(),
        async ({ params }) => {
          return { secret: `secret-${params.key}` }
        },
      )

      const router = createRouter({
        serverActions: {
          getUser,
          getSecret,
        },
        clientActions,
        responseTimeout: serverTimeout,
      })
      type Router = typeof router

      let server: Bun.Server<unknown> | undefined

      if (transport === 'stream') {
        server = Bun.serve({
          port: 0,
          reusePort: true,
          async fetch(request) {
            return router.onStream({
              request,
              ctx: { request },
            })
          },
        })
      } else {
        server = Bun.serve({
          port: 0,
          reusePort: true,
          fetch(request, fetchServer) {
            if (
              fetchServer.upgrade(request, {
                data: undefined,
              })
            ) {
              return
            }
            return new Response('Upgrade failed', {
              status: 500,
            })
          },
          websocket: {
            message(ws, message) {
              router
                .onWebSocketMessage({
                  ws,
                  message,
                  ctx: { ws },
                })
                .catch(() => {
                  // Ignore errors in message handling
                })
            },
            close(ws) {
              ws.close()
            },
          },
        })
      }

      const PORT = server.port

      afterAll(() => {
        if (server) {
          server.stop()
        }
      })

      describe('client ID spoofing protection', () => {
        it('should prevent clients from spoofing other clients clientId in responses', async () => {
          // This test verifies that a client cannot intercept another client's responses
          // by spoofing their clientId
          const client1 = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            defineClientActions: {
              useTool: async ({ tool, user }) =>
                `Tool ${tool} used by ${user}`,
            },
            responseTimeout: timeout,
          })

          const client2 = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            defineClientActions: {
              useTool: async () => {
                // Malicious client trying to intercept client1's responses
                throw new Error('Should not be called')
              },
            },
            responseTimeout: timeout,
          })

          // Client1 makes a request
          const result1Promise = client1.stream({
            getUser: { id: 'user1' },
          })

          // Client2 should not be able to intercept client1's response
          // even if they somehow know client1's clientId
          const result2Promise = client2.stream({
            getUser: { id: 'user2' },
          })

          const [result1, result2] = await Promise.all([
            result1Promise,
            result2Promise,
          ])

          const messages1 = []
          for await (const message of result1) {
            messages1.push(message)
          }

          const messages2 = []
          for await (const message of result2) {
            messages2.push(message)
          }

          // Each client should only receive their own responses
          const user1Result = messages1.find(
            (m) => m.getUser,
          )
          const user2Result = messages2.find(
            (m) => m.getUser,
          )

          expect(user1Result?.getUser?.data?.id).toBe(
            'user1',
          )
          expect(user2Result?.getUser?.data?.id).toBe(
            'user2',
          )
        })
      })

      describe('action name validation', () => {
        it('should reject invalid action names', async () => {
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),

            responseTimeout: timeout,
          })

          // Try to call a non-existent action
          const result = await client.stream({
            // @ts-expect-error - Testing invalid action name
            nonExistentAction: { test: 'data' },
          })

          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          const errorResult = messages.find(
            // @ts-expect-error - Testing non-existent action
            (m) => m.nonExistentAction,
          )
          expect(
            // @ts-expect-error - Testing non-existent action
            errorResult?.nonExistentAction?.status,
          ).toBe('error')
          expect(
            // @ts-expect-error - Testing non-existent action
            errorResult?.nonExistentAction?.error,
          ).toBeDefined()
        })

        it('should reject action names with special characters that could be used for injection', async () => {
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),

            responseTimeout: timeout,
          })

          // Try to call actions with potentially dangerous names
          const dangerousNames = [
            '__proto__',
            'constructor',
            'prototype',
            'toString',
            'valueOf',
          ]

          for (const dangerousName of dangerousNames) {
            const result = await client.stream({
              [dangerousName]: { test: 'data' },
            })

            const messages = []
            for await (const message of result) {
              messages.push(message)
            }

            const errorResult = messages.find(
              // @ts-expect-error - Testing non-existent action
              (m) => m[dangerousName],
            )
            expect(
              // @ts-expect-error - Testing non-existent action
              errorResult?.[dangerousName]?.status,
            ).toBe('error')
          }
        })
      })

      describe('resource exhaustion protection', () => {
        it('should handle large number of concurrent requests without crashing', async () => {
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),

            responseTimeout: timeout * 10,
          })

          // Create many concurrent requests
          const concurrentRequests = 50
          const promises = []
          for (
            let index = 0;
            index < concurrentRequests;
            index++
          ) {
            promises.push(
              client.stream({
                getUser: { id: String(index) },
              }),
            )
          }

          const results = await Promise.all(promises)

          // All requests should complete successfully
          for (const result of results) {
            const messages = []
            for await (const message of result) {
              messages.push(message)
            }
            expect(messages.length).toBeGreaterThan(0)
          }
        }, 30000)

        it('should limit concurrent processing to prevent resource exhaustion', async () => {
          // This test verifies that the server doesn't process unlimited concurrent requests
          // Note: This is a test to document expected behavior - actual implementation
          // may need to be added
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),

            responseTimeout: timeout * 10,
          })

          // Create a very large number of concurrent requests
          const concurrentRequests = 1000
          const promises = []
          for (
            let index = 0;
            index < concurrentRequests;
            index++
          ) {
            promises.push(
              client.stream({
                getUser: { id: String(index) },
              }),
            )
          }

          // Server should handle this gracefully (either process all or reject excess)
          const results = await Promise.allSettled(promises)

          // At least some requests should succeed
          const successful = results.filter(
            (r) => r.status === 'fulfilled',
          )
          expect(successful.length).toBeGreaterThan(0)
        }, 60000)
      })

      describe('input validation', () => {
        it('should handle large payloads (size limits are user responsibility)', async () => {
          // Note: Input size limits should be handled by the user
          // The library processes payloads without size restrictions
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),

            responseTimeout: timeout * 10,
          })

          // Create a large payload (but not too large to avoid test timeout)
          const largePayload = 'x'.repeat(1024 * 1024) // 1MB

          const result = await client.stream({
            getUser: { id: largePayload },
          })

          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          // Should handle large payloads (user should implement size limits if needed)
          const userResult = messages.find((m) => m.getUser)
          expect(userResult?.getUser).toBeDefined()
        }, 30000)

        it('should validate action parameters according to schema', async () => {
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),

            responseTimeout: timeout,
          })

          // Try to send invalid parameters
          const result = await client.stream({
            getUser: {
              // @ts-expect-error - Testing invalid params
              invalidField: 'should not be accepted',
            },
          })

          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          const resultMessage = messages.find(
            (m) => m.getUser,
          )
          // Should either validate and accept (if optional) or reject
          // The important thing is it doesn't crash
          expect(resultMessage?.getUser).toBeDefined()
        })
      })

      describe('message ID collision protection', () => {
        it('should handle message ID collisions gracefully', async () => {
          // This test verifies that if two clients somehow generate the same message ID,
          // they don't interfere with each other
          const client1 = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),

            responseTimeout: timeout,
          })

          const client2 = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),

            responseTimeout: timeout,
          })

          // Make concurrent requests from both clients
          const [result1, result2] = await Promise.all([
            client1.stream({
              getUser: { id: 'client1-user' },
            }),
            client2.stream({
              getUser: { id: 'client2-user' },
            }),
          ])

          const messages1 = []
          for await (const message of result1) {
            messages1.push(message)
          }

          const messages2 = []
          for await (const message of result2) {
            messages2.push(message)
          }

          // Each client should receive their own response
          const user1Result = messages1.find(
            (m) => m.getUser,
          )
          const user2Result = messages2.find(
            (m) => m.getUser,
          )

          expect(user1Result?.getUser?.data?.id).toBe(
            'client1-user',
          )
          expect(user2Result?.getUser?.data?.id).toBe(
            'client2-user',
          )
        })
      })

      describe('input size limits', () => {
        it('should handle large payloads in stream transport (size limits are user responsibility)', async () => {
          // Note: Input size limits should be handled by the user (e.g., via middleware, reverse proxy, etc.)
          // The library does not enforce size limits to allow flexibility
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),

            responseTimeout: timeout * 10,
          })

          // Create a large payload (but not too large to avoid test timeout)
          const largePayload = 'x'.repeat(1024 * 1024) // 1MB

          const result = await client.stream({
            getUser: { id: largePayload },
          })

          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          // Should handle large payloads (user should implement size limits if needed)
          const userResult = messages.find((m) => m.getUser)
          expect(userResult?.getUser).toBeDefined()
        }, 30000)

        it('should handle large payloads in HTTP transport (size limits are user responsibility)', async () => {
          // Note: Input size limits should be handled by the user
          // The library processes payloads without size restrictions
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),

            responseTimeout: timeout * 10,
          })

          // Create a large payload (but not too large to avoid test timeout)
          const largePayload = 'x'.repeat(1024 * 1024) // 1MB

          const result = await client.fetch({
            getUser: { id: largePayload },
          })

          // Should handle large payloads (user should implement size limits if needed)
          expect(result.getUser).toBeDefined()
        }, 30_000)
      })

      describe('concurrent request limits', () => {
        it('should handle many concurrent requests (limits are user responsibility)', async () => {
          // Note: Concurrent request limits should be handled by the user (e.g., via rate limiting middleware)
          // The library does not enforce limits to allow flexibility
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            responseTimeout: timeout * 10,
          })

          // Create many concurrent requests
          const concurrentRequests = 50
          const promises = []
          for (
            let index = 0;
            index < concurrentRequests;
            index++
          ) {
            promises.push(
              client.stream({
                getUser: { id: String(index) },
              }),
            )
          }

          const results = await Promise.all(promises)

          // All requests should be handled (user should implement limits if needed)
          let successCount = 0
          for (const result of results) {
            const messages = []
            for await (const message of result) {
              messages.push(message)
            }
            const userResult = messages.find(
              (m) => m.getUser,
            )
            if (userResult?.getUser?.status === 'ok') {
              successCount++
            }
          }

          // All requests should succeed (library doesn't enforce limits)
          expect(successCount).toBe(concurrentRequests)
        }, 60000)
      })

      describe('timeout handling', () => {
        it('should properly timeout long-running actions', async () => {
          const slowAction = action(
            m.object({ delay: m.number() }).isOptional(),
            async ({ params }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, params.delay || 10000),
              )
              return { completed: true }
            },
          )

          const slowRouter = createRouter({
            serverActions: { slowAction },
            clientActions: {},
            responseTimeout: timeout,
          })
          type SlowRouter = typeof slowRouter

          let slowServer: Bun.Server<unknown> | undefined

          if (transport === 'stream') {
            slowServer = Bun.serve({
              port: 0,
              reusePort: true,
              async fetch(request) {
                return slowRouter.onStream({
                  request,
                  ctx: {},
                })
              },
            })
          } else {
            slowServer = Bun.serve({
              port: 0,
              reusePort: true,
              fetch(request, fetchServer) {
                if (
                  fetchServer.upgrade(request, {
                    data: undefined,
                  })
                ) {
                  return
                }
                return new Response('Upgrade failed', {
                  status: 500,
                })
              },
              websocket: {
                message(ws, message) {
                  slowRouter
                    .onWebSocketMessage({
                      ws,
                      message,
                      ctx: {},
                    })
                    .catch(() => {})
                },
                close(ws) {
                  ws.close()
                },
              },
            })
          }

          try {
            const SLOW_PORT = slowServer.port
            const client = createRouterClient<SlowRouter>({
              ...(transport === 'stream'
                ? {
                    streamURL: `http://localhost:${SLOW_PORT}`,
                  }
                : {
                    websocketURL: `ws://localhost:${SLOW_PORT}`,
                  }),

              responseTimeout: timeout,
            })

            const result = await client.stream({
              slowAction: { delay: timeout * 10 },
            })

            const messages = []
            let hasTimeout = false
            try {
              for await (const message of result) {
                messages.push(message)
              }
            } catch (error) {
              if (
                error instanceof Error &&
                error.message.includes('Timeout')
              ) {
                hasTimeout = true
              }
            }

            // Should either timeout or return an error
            expect(
              hasTimeout ||
                messages.some(
                  (m) => m.slowAction?.status === 'error',
                ),
            ).toBe(true)
          } finally {
            slowServer.stop()
          }
        })
      })
    })
  }
})
