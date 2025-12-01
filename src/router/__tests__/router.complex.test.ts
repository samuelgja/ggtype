/* eslint-disable no-shadow */
/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable @typescript-eslint/no-shadow */
import { action, m, type TransportType } from '../..'
import { defineClientActionsSchema } from '../handle-client-actions'
import { createRouter } from '../router'
import { createRouterClient } from '../router-client'
import type { ClientCallableActions } from '../router-client.types-shared'

describe('router complex', () => {
  const transports: TransportType[] = [
    'stream',
    'websocket',
  ]

  for (const transport of transports) {
    describe(`transport: ${transport}`, () => {
      let timeout = 10
      const serverTimeout = timeout * 2 + 10

      const clientActions = defineClientActionsSchema({
        fetchUserData: {
          params: m
            .object({
              userId: m.string(),
            })
            .isOptional(),
          return: m
            .object({
              userId: m.string(),
              name: m.string(),
              email: m.string(),
            })
            .isOptional(),
        },
        fetchUserPosts: {
          params: m
            .object({
              userId: m.string(),
            })
            .isOptional(),
          return: m
            .array(
              m
                .object({
                  postId: m.string(),
                  title: m.string(),
                })
                .isOptional(),
            )
            .isOptional(),
        },
        fetchUserComments: {
          params: m
            .object({
              userId: m.string(),
            })
            .isOptional(),
          return: m
            .array(
              m
                .object({
                  commentId: m.string(),
                  text: m.string(),
                })
                .isOptional(),
            )
            .isOptional(),
        },
        processData: {
          params: m
            .object({
              data: m.string(),
              operation: m.string(),
            })
            .isOptional(),
          return: m.string().isOptional(),
        },
        validateInput: {
          params: m
            .object({
              input: m.string(),
            })
            .isOptional(),
          return: m.boolean().isOptional(),
        },
        transformData: {
          params: m
            .object({
              data: m.string(),
            })
            .isOptional(),
          return: m.string().isOptional(),
        },
      })
      type ClientActions = typeof clientActions

      // Action 1: Calls 3 client actions in parallel using Promise.all()
      const getUserCompleteProfile = action(
        m
          .object({
            userId: m.string(),
          })
          .isOptional(),
        async ({
          params,
          clientActions: clientActions,
        }) => {
          const clientActionsFunctions =
            (clientActions?.<ClientActions>() ??
              {}) as ClientCallableActions<ClientActions>
          const {
            fetchUserData,
            fetchUserPosts,
            fetchUserComments,
          } = clientActionsFunctions

          // Call 3 client actions in parallel
          const [
            userDataResult,
            postsResult,
            commentsResult,
          ] = await Promise.all([
            fetchUserData?.({ userId: params.userId }),
            fetchUserPosts?.({ userId: params.userId }),
            fetchUserComments?.({ userId: params.userId }),
          ])

          return {
            user: userDataResult?.data,
            posts: postsResult?.data ?? [],
            comments: commentsResult?.data ?? [],
          }
        },
      )

      // Action 2: Calls multiple client actions with different operations
      const processUserWorkflow = action(
        m
          .object({
            userId: m.string(),
            data: m.string(),
          })
          .isOptional(),
        async ({
          params,
          clientActions: clientActions,
        }) => {
          const clientActionsFunctions =
            (clientActions?.<ClientActions>() ??
              {}) as ClientCallableActions<ClientActions>
          const {
            fetchUserData,
            processData,
            validateInput,
            transformData,
          } = clientActionsFunctions

          // Sequential operations with some parallel calls
          const userDataResult = await fetchUserData?.({
            userId: params.userId,
          })

          // Parallel processing and validation
          const [processedResult, validationResult] =
            await Promise.all([
              processData?.({
                data: params.data,
                operation: 'process',
              }),
              validateInput?.({ input: params.data }),
            ])

          if (!validationResult?.data) {
            throw new Error('Validation failed')
          }

          // Transform the processed data
          const transformedResult = await transformData?.({
            data: processedResult?.data ?? params.data,
          })

          return {
            user: userDataResult?.data,
            processed: processedResult?.data,
            transformed: transformedResult?.data,
            validated: validationResult?.data,
          }
        },
      )

      // Action 3: Streaming action with concurrent client actions
      const streamUserActivity = action(
        m
          .object({
            userId: m.string(),
          })
          .isOptional(),
        async function* ({ params, clientActions }) {
          const clientActionsFunctions =
            (clientActions?.<ClientActions>() ??
              {}) as ClientCallableActions<ClientActions>
          const {
            fetchUserData,
            fetchUserPosts,
            fetchUserComments,
          } = clientActionsFunctions

          // First yield: user data
          const userDataResult = await fetchUserData?.({
            userId: params.userId,
          })
          yield { type: 'user', data: userDataResult?.data }

          // Second yield: parallel fetch of posts and comments
          const [postsResult, commentsResult] =
            await Promise.all([
              fetchUserPosts?.({ userId: params.userId }),
              fetchUserComments?.({
                userId: params.userId,
              }),
            ])
          yield {
            type: 'posts',
            data: postsResult?.data ?? [],
          }
          yield {
            type: 'comments',
            data: commentsResult?.data ?? [],
          }

          // Final yield: summary
          yield {
            type: 'summary',
            data: {
              hasUser: !!userDataResult?.data,
              postsCount: postsResult?.data?.length ?? 0,
              commentsCount:
                commentsResult?.data?.length ?? 0,
            },
          }
        },
      )

      const router = createRouter({
        serverActions: {
          getUserCompleteProfile,
          processUserWorkflow,
          streamUserActivity,
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
      } else if (transport === 'http') {
        server = Bun.serve({
          port: 0,
          reusePort: true,
          async fetch(request) {
            return router.onRequest({
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
        timeout = 1000
        if (server) {
          server.stop()
        }
      })

      it('should handle 3 client actions called in parallel with Promise.all()', async () => {
        const client = createRouterClient<Router>({
          ...(transport === 'stream'
            ? { streamURL: `http://localhost:${PORT}` }
            : { websocketURL: `ws://localhost:${PORT}` }),
          defineClientActions: {
            fetchUserData: async ({ userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return {
                userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`,
              }
            },
            fetchUserPosts: async ({ userId: _userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [
                { postId: '1', title: 'Post 1' },
                { postId: '2', title: 'Post 2' },
              ]
            },
            fetchUserComments: async ({
              userId: _userId,
            }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [
                { commentId: '1', text: 'Comment 1' },
                { commentId: '2', text: 'Comment 2' },
              ]
            },
            processData: async ({ data, operation }) =>
              `${operation}:${data}`,
            validateInput: async ({ input }) =>
              input.length > 0,
            transformData: async ({ data }) =>
              data.toUpperCase(),
          },
          responseTimeout: timeout * 3,
        })

        const result = await client.stream({
          getUserCompleteProfile: { userId: '123' },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        expect(messages.length).toBeGreaterThan(0)
        const profileResult = messages.find(
          (m) => m.getUserCompleteProfile,
        )
        expect(
          profileResult?.getUserCompleteProfile?.status,
        ).toBe('ok')
        expect(
          profileResult?.getUserCompleteProfile?.data,
        ).toEqual({
          user: {
            userId: '123',
            name: 'User 123',
            email: 'user123@example.com',
          },
          posts: [
            { postId: '1', title: 'Post 1' },
            { postId: '2', title: 'Post 2' },
          ],
          comments: [
            { commentId: '1', text: 'Comment 1' },
            { commentId: '2', text: 'Comment 2' },
          ],
        })
      })

      it('should handle mixed sequential and parallel client actions', async () => {
        const client = createRouterClient<Router>({
          ...(transport === 'stream'
            ? { streamURL: `http://localhost:${PORT}` }
            : { websocketURL: `ws://localhost:${PORT}` }),
          defineClientActions: {
            fetchUserData: async ({ userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return {
                userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`,
              }
            },
            processData: async ({ data, operation }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return `${operation}:${data}`
            },
            validateInput: async ({ input }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return input.length > 0
            },
            transformData: async ({ data }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return data.toUpperCase()
            },
            fetchUserPosts: async ({
              userId: _userId,
            }) => [],
            fetchUserComments: async ({
              userId: _userId,
            }) => [],
          },
          responseTimeout: timeout * 5,
        })

        const result = await client.stream({
          processUserWorkflow: {
            userId: '456',
            data: 'test-data',
          },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        expect(messages.length).toBeGreaterThan(0)
        const workflowResult = messages.find(
          (m) => m.processUserWorkflow,
        )
        expect(
          workflowResult?.processUserWorkflow?.status,
        ).toBe('ok')
        expect(
          workflowResult?.processUserWorkflow?.data,
        ).toEqual({
          user: {
            userId: '456',
            name: 'User 456',
            email: 'user456@example.com',
          },
          processed: 'process:test-data',
          transformed: 'PROCESS:TEST-DATA',
          validated: true,
        })
      })

      it('should handle streaming with concurrent client actions', async () => {
        const client = createRouterClient<Router>({
          ...(transport === 'stream'
            ? { streamURL: `http://localhost:${PORT}` }
            : { websocketURL: `ws://localhost:${PORT}` }),
          defineClientActions: {
            fetchUserData: async ({ userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return {
                userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`,
              }
            },
            fetchUserPosts: async ({ userId: _userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [
                { postId: '1', title: 'Post 1' },
                { postId: '2', title: 'Post 2' },
              ]
            },
            fetchUserComments: async ({
              userId: _userId,
            }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [
                { commentId: '1', text: 'Comment 1' },
                { commentId: '2', text: 'Comment 2' },
              ]
            },
            processData: async ({ data, operation }) =>
              `${operation}:${data}`,
            validateInput: async ({ input }) =>
              input.length > 0,
            transformData: async ({ data }) =>
              data.toUpperCase(),
          },
          responseTimeout: timeout * 5,
        })

        const result = await client.stream({
          streamUserActivity: { userId: '789' },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
          if (messages.length > 10) {
            break
          }
        }

        expect(messages.length).toBeGreaterThan(0)
        const activityMessages = messages.filter(
          (m) => m.streamUserActivity,
        )
        expect(
          activityMessages.length,
        ).toBeGreaterThanOrEqual(4)

        const summaryMessage = activityMessages.at(-1)
        expect(
          summaryMessage?.streamUserActivity?.data?.type,
        ).toBe('summary')
        const summaryData = summaryMessage
          ?.streamUserActivity?.data?.data as
          | {
              hasUser: boolean
              postsCount: number
              commentsCount: number
            }
          | undefined
        expect(summaryData?.hasUser).toBe(true)
        expect(summaryData?.postsCount).toBe(2)
        expect(summaryData?.commentsCount).toBe(2)
      })

      it('should handle high concurrency with multiple parallel requests', async () => {
        const client = createRouterClient<Router>({
          ...(transport === 'stream'
            ? { streamURL: `http://localhost:${PORT}` }
            : { websocketURL: `ws://localhost:${PORT}` }),
          defineClientActions: {
            fetchUserData: async ({ userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return {
                userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`,
              }
            },
            fetchUserPosts: async ({ userId: _userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [{ postId: '1', title: 'Post 1' }]
            },
            fetchUserComments: async ({
              userId: _userId,
            }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [{ commentId: '1', text: 'Comment 1' }]
            },
            processData: async ({ data, operation }) =>
              `${operation}:${data}`,
            validateInput: async ({ input }) =>
              input.length > 0,
            transformData: async ({ data }) =>
              data.toUpperCase(),
          },
          responseTimeout: timeout * 5,
        })

        // Create 10 concurrent requests, each calling an action that uses Promise.all() with 3 client actions
        const concurrentRequests = Array.from(
          { length: 10 },
          (_, index) =>
            client.stream({
              getUserCompleteProfile: {
                userId: String(index),
              },
            }),
        )

        const results = await Promise.all(
          concurrentRequests,
        )

        for (const [index, result] of results.entries()) {
          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          expect(messages.length).toBeGreaterThan(0)
          const profileResult = messages.find(
            (m) => m.getUserCompleteProfile,
          )
          expect(
            profileResult?.getUserCompleteProfile?.status,
          ).toBe('ok')
          expect(
            profileResult?.getUserCompleteProfile?.data
              ?.user?.userId,
          ).toBe(String(index))
        }
      })

      it('should handle concurrent requests with different actions', async () => {
        const client = createRouterClient<Router>({
          ...(transport === 'stream'
            ? { streamURL: `http://localhost:${PORT}` }
            : { websocketURL: `ws://localhost:${PORT}` }),
          defineClientActions: {
            fetchUserData: async ({ userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return {
                userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`,
              }
            },
            fetchUserPosts: async ({ userId: _userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [{ postId: '1', title: 'Post 1' }]
            },
            fetchUserComments: async ({
              userId: _userId,
            }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [{ commentId: '1', text: 'Comment 1' }]
            },
            processData: async ({ data, operation }) =>
              `${operation}:${data}`,
            validateInput: async ({ input }) =>
              input.length > 0,
            transformData: async ({ data }) =>
              data.toUpperCase(),
          },
          responseTimeout: timeout * 5,
        })

        // Mix different actions in parallel
        const [result1, result2, result3] =
          await Promise.all([
            client.stream({
              getUserCompleteProfile: { userId: 'user1' },
            }),
            client.stream({
              processUserWorkflow: {
                userId: 'user2',
                data: 'workflow-data',
              },
            }),
            client.stream({
              streamUserActivity: { userId: 'user3' },
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
        const messages3 = []
        for await (const message of result3) {
          messages3.push(message)
        }

        expect(messages1.length).toBeGreaterThan(0)
        expect(messages2.length).toBeGreaterThan(0)
        expect(messages3.length).toBeGreaterThan(0)

        const profileResult = messages1.find(
          (m) => m.getUserCompleteProfile,
        )
        expect(
          profileResult?.getUserCompleteProfile?.status,
        ).toBe('ok')

        const workflowResult = messages2.find(
          (m) => m.processUserWorkflow,
        )
        expect(
          workflowResult?.processUserWorkflow?.status,
        ).toBe('ok')

        const activityMessages = messages3.filter(
          (m) => m.streamUserActivity,
        )
        expect(activityMessages.length).toBeGreaterThan(0)
      })

      it('should handle errors in parallel client actions gracefully', async () => {
        const client = createRouterClient<Router>({
          ...(transport === 'stream'
            ? { streamURL: `http://localhost:${PORT}` }
            : { websocketURL: `ws://localhost:${PORT}` }),
          defineClientActions: {
            fetchUserData: async ({ userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return {
                userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`,
              }
            },
            fetchUserPosts: async ({ userId: _userId }) => {
              throw new Error('Failed to fetch posts')
            },
            fetchUserComments: async ({
              userId: _userId,
            }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [{ commentId: '1', text: 'Comment 1' }]
            },
            processData: async ({ data, operation }) =>
              `${operation}:${data}`,
            validateInput: async ({ input }) =>
              input.length > 0,
            transformData: async ({ data }) =>
              data.toUpperCase(),
          },
          responseTimeout: timeout * 5,
        })

        const result = await client.stream({
          getUserCompleteProfile: { userId: 'error-test' },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        expect(messages.length).toBeGreaterThan(0)
        const profileResult = messages.find(
          (m) => m.getUserCompleteProfile,
        )
        // The action should handle the error gracefully
        // It may return partial data or an error status
        expect(
          profileResult?.getUserCompleteProfile,
        ).toBeDefined()
      })

      it('should handle rapid sequential calls with parallel client actions', async () => {
        const client = createRouterClient<Router>({
          ...(transport === 'stream'
            ? { streamURL: `http://localhost:${PORT}` }
            : { websocketURL: `ws://localhost:${PORT}` }),
          defineClientActions: {
            fetchUserData: async ({ userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return {
                userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`,
              }
            },
            fetchUserPosts: async ({ userId: _userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [{ postId: '1', title: 'Post 1' }]
            },
            fetchUserComments: async ({
              userId: _userId,
            }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [{ commentId: '1', text: 'Comment 1' }]
            },
            processData: async ({ data, operation }) =>
              `${operation}:${data}`,
            validateInput: async ({ input }) =>
              input.length > 0,
            transformData: async ({ data }) =>
              data.toUpperCase(),
          },
          responseTimeout: timeout * 5,
        })

        // Make 5 rapid sequential calls
        const results = []
        for (let index = 0; index < 5; index++) {
          const result = await client.stream({
            getUserCompleteProfile: {
              userId: `seq-${index}`,
            },
          })
          results.push({ result, index })
        }

        // Process all results
        for (const { result, index } of results) {
          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          expect(messages.length).toBeGreaterThan(0)
          const profileResult = messages.find(
            (m) => m.getUserCompleteProfile,
          )
          expect(
            profileResult?.getUserCompleteProfile?.status,
          ).toBe('ok')
          expect(
            profileResult?.getUserCompleteProfile?.data
              ?.user?.userId,
          ).toBe(`seq-${index}`)
        }
      })

      it('should handle fetch() with parallel client actions', async () => {
        const client = createRouterClient<Router>({
          ...(transport === 'stream'
            ? { streamURL: `http://localhost:${PORT}` }
            : { websocketURL: `ws://localhost:${PORT}` }),
          defineClientActions: {
            fetchUserData: async ({ userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return {
                userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`,
              }
            },
            fetchUserPosts: async ({ userId: _userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [
                { postId: '1', title: 'Post 1' },
                { postId: '2', title: 'Post 2' },
              ]
            },
            fetchUserComments: async ({
              userId: _userId,
            }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [
                { commentId: '1', text: 'Comment 1' },
                { commentId: '2', text: 'Comment 2' },
              ]
            },
            processData: async ({ data, operation }) =>
              `${operation}:${data}`,
            validateInput: async ({ input }) =>
              input.length > 0,
            transformData: async ({ data }) =>
              data.toUpperCase(),
          },
          responseTimeout: timeout * 5,
        })

        const result = await client.fetch({
          getUserCompleteProfile: { userId: 'fetch-test' },
        })

        expect(result.getUserCompleteProfile?.status).toBe(
          'ok',
        )
        expect(result.getUserCompleteProfile?.data).toEqual(
          {
            user: {
              userId: 'fetch-test',
              name: 'User fetch-test',
              email: 'userfetch-test@example.com',
            },
            posts: [
              { postId: '1', title: 'Post 1' },
              { postId: '2', title: 'Post 2' },
            ],
            comments: [
              { commentId: '1', text: 'Comment 1' },
              { commentId: '2', text: 'Comment 2' },
            ],
          },
        )
      })

      it('should handle concurrent fetch() calls with parallel client actions', async () => {
        const client = createRouterClient<Router>({
          ...(transport === 'stream'
            ? { streamURL: `http://localhost:${PORT}` }
            : { websocketURL: `ws://localhost:${PORT}` }),
          defineClientActions: {
            fetchUserData: async ({ userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return {
                userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`,
              }
            },
            fetchUserPosts: async ({ userId: _userId }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [{ postId: '1', title: 'Post 1' }]
            },
            fetchUserComments: async ({
              userId: _userId,
            }) => {
              await new Promise((resolve) =>
                setTimeout(resolve, timeout / 2),
              )
              return [{ commentId: '1', text: 'Comment 1' }]
            },
            processData: async ({ data, operation }) =>
              `${operation}:${data}`,
            validateInput: async ({ input }) =>
              input.length > 0,
            transformData: async ({ data }) =>
              data.toUpperCase(),
          },
          responseTimeout: timeout * 5,
        })

        // Make 5 concurrent fetch() calls
        const fetchPromises = Array.from(
          { length: 5 },
          (_, index) =>
            client
              .fetch({
                getUserCompleteProfile: {
                  userId: `fetch-${index}`,
                },
              })
              .then((result) => ({ result, index })),
        )

        const results = await Promise.all(fetchPromises)

        for (const { result, index } of results) {
          expect(
            result.getUserCompleteProfile?.status,
          ).toBe('ok')
          expect(
            result.getUserCompleteProfile?.data?.user
              ?.userId,
          ).toBe(`fetch-${index}`)
        }
      })
    })
  }
})
