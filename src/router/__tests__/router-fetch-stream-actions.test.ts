/* eslint-disable @typescript-eslint/no-shadow */
import {
  action,
  m,
  type TransportType,
  isSuccess,
  isError,
} from '../..'
import { createRouter } from '../router'
import { createRouterClient } from '../router-client'

describe('router fetchActions and streamActions', () => {
  const transports: TransportType[] = [
    'http',
    'stream',
    'websocket',
  ]

  for (const transport of transports) {
    describe(`transport: ${transport}`, () => {
      const userModel = m.object({
        id: m.string().isRequired(),
        name: m.string().isRequired(),
      })

      const getUser = action(
        userModel,
        async ({ params }) => {
          return {
            id: params.id,
            name: params.name,
            email: `${params.id}@example.com`,
          }
        },
      )

      const createUser = action(
        userModel,
        async ({ params }) => {
          return {
            ...params,
            createdAt: new Date().toISOString(),
          }
        },
      )

      const searchUsers = action(
        m.object({ query: m.string().isRequired() }),
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
          yield {
            id: '3',
            name: 'Bob',
            query: params.query,
          }
        },
      )

      const router = createRouter({
        serverActions: {
          getUser,
          createUser,
          searchUsers,
        },
        transport,
      })
      type Router = typeof router

      let server: ReturnType<typeof Bun.serve>
      let client: ReturnType<
        typeof createRouterClient<Router>
      >

      beforeAll(() => {
        if (transport === 'websocket') {
          server = Bun.serve({
            port: 0,
            reusePort: true,
            fetch(request, fetchServer) {
              if (
                router.onWebSocketMessage &&
                fetchServer.upgrade(request, {
                  data: {},
                })
              ) {
                return
              }
              return router.onRequest({ request, ctx: {} })
            },
            websocket: {
              message(ws, message) {
                router.onWebSocketMessage?.({
                  ws: ws as never,
                  message,
                  ctx: {},
                })
              },
            },
          })
        } else {
          server = Bun.serve({
            port: 0,
            reusePort: true,
            async fetch(request) {
              return router.onRequest({ request, ctx: {} })
            },
          })
        }

        client = createRouterClient<Router>({
          url: `http://localhost:${server.port}`,
          transport,
        })
      })

      afterAll(() => {
        server.stop()
      })

      describe('fetchActions', () => {
        test('should call single action using fetchActions', async () => {
          const { getUser: fetchGetUser } =
            client.fetchActions
          const result = await fetchGetUser({
            id: '123',
            name: 'Test User',
          })

          expect(result).toBeDefined()
          if (isSuccess(result)) {
            expect(result.data?.id).toBe('123')
            expect(result.data?.name).toBe('Test User')
            expect(result.data?.email).toBe(
              '123@example.com',
            )
          } else {
            throw new Error('Expected success result')
          }
        })

        test('should handle errors with fetchActions', async () => {
          const { getUser: fetchGetUser } =
            client.fetchActions
          // Missing required field
          const result = await fetchGetUser({
            id: '123',
          } as never)

          expect(result).toBeDefined()
          if (isError(result)) {
            expect(result.error).toBeDefined()
            expect(result.status).toBe('error')
          } else {
            throw new Error('Expected error result')
          }
        })

        test('should work with multiple different actions', async () => {
          const {
            getUser: fetchGetUser,
            createUser: fetchCreateUser,
          } = client.fetchActions

          const userResult = await fetchGetUser({
            id: '1',
            name: 'User 1',
          })
          const createResult = await fetchCreateUser({
            id: '2',
            name: 'User 2',
          })

          if (isSuccess(userResult)) {
            expect(userResult.data?.id).toBe('1')
            expect(userResult.data?.name).toBe('User 1')
          } else {
            throw new Error(
              'Expected success result for getUser',
            )
          }

          if (isSuccess(createResult)) {
            expect(createResult.data?.id).toBe('2')
            expect(createResult.data?.name).toBe('User 2')
            expect(
              createResult.data?.createdAt,
            ).toBeDefined()
          } else {
            throw new Error(
              'Expected success result for createUser',
            )
          }
        })

        test('should accept optional FetchOptions', async () => {
          const { getUser: fetchGetUser } =
            client.fetchActions
          const result = await fetchGetUser(
            { id: '123', name: 'Test' },
            {
              method:
                transport === 'http' ? 'POST' : undefined,
            },
          )

          expect(result).toBeDefined()
          if (isSuccess(result)) {
            expect(result.data?.id).toBe('123')
          }
        })
      })

      describe('streamActions', () => {
        test('should stream single action using streamActions', async () => {
          const { searchUsers: streamSearchUsers } =
            client.streamActions
          const stream = await streamSearchUsers({
            query: 'test',
          })

          const results: unknown[] = []
          for await (const chunk of stream) {
            results.push(chunk)
            if (isSuccess(chunk.searchUsers)) {
              // HTTP transport returns final result, not individual stream items
              if (transport === 'http') {
                // HTTP doesn't support streaming, so we just check the result exists
                expect(chunk.searchUsers.data).toBeDefined()
              } else if (chunk.searchUsers.data) {
                expect(chunk.searchUsers.data.query).toBe(
                  'test',
                )
              }
            }
          }

          expect(results.length).toBeGreaterThan(0)
        })

        test('should handle streaming errors', async () => {
          const { searchUsers: streamSearchUsers } =
            client.streamActions
          // Missing required field
          const stream = await streamSearchUsers(
            {} as never,
          )

          let hasError = false
          for await (const chunk of stream) {
            if (isError(chunk.searchUsers)) {
              hasError = true
              expect(chunk.searchUsers.error).toBeDefined()
            }
          }

          expect(hasError).toBe(true)
        })

        test('should work with multiple different streaming actions', async () => {
          const { searchUsers: streamSearchUsers } =
            client.streamActions

          const stream1 = await streamSearchUsers({
            query: 'query1',
          })
          const stream2 = await streamSearchUsers({
            query: 'query2',
          })

          const results1: unknown[] = []
          for await (const chunk of stream1) {
            results1.push(chunk)
            if (
              isSuccess(chunk.searchUsers) &&
              transport !== 'http' &&
              chunk.searchUsers.data
            ) {
              // HTTP transport returns final result, not individual stream items
              expect(chunk.searchUsers.data.query).toBe(
                'query1',
              )
            }
          }

          const results2: unknown[] = []
          for await (const chunk of stream2) {
            results2.push(chunk)
            if (
              isSuccess(chunk.searchUsers) &&
              transport !== 'http' &&
              chunk.searchUsers.data
            ) {
              // HTTP transport returns final result, not individual stream items
              expect(chunk.searchUsers.data.query).toBe(
                'query2',
              )
            }
          }

          expect(results1.length).toBeGreaterThan(0)
          expect(results2.length).toBeGreaterThan(0)
        })

        test('should accept optional FetchOptions', async () => {
          const { searchUsers: streamSearchUsers } =
            client.streamActions
          const stream = await streamSearchUsers(
            { query: 'test' },
            {
              method:
                transport === 'http' ? 'POST' : undefined,
            },
          )

          let hasResult = false
          for await (const chunk of stream) {
            hasResult = true
            if (
              isSuccess(chunk.searchUsers) &&
              transport !== 'http' &&
              chunk.searchUsers.data
            ) {
              // HTTP transport returns final result, not individual stream items
              expect(chunk.searchUsers.data.query).toBe(
                'test',
              )
            }
            break // Just check first result
          }

          expect(hasResult).toBe(true)
        })
      })

      describe('type safety', () => {
        test('fetchActions should have correct types', async () => {
          const {
            getUser: fetchGetUser,
            createUser: fetchCreateUser,
          } = client.fetchActions

          // These should compile with correct types
          const userResult = await fetchGetUser({
            id: '1',
            name: 'User',
          })
          const createResult = await fetchCreateUser({
            id: '2',
            name: 'User',
          })

          if (isSuccess(userResult) && userResult.data) {
            // TypeScript should know about data.id and data.name
            const { id, name } = userResult.data
            expect(id).toBe('1')
            expect(name).toBe('User')
          }

          if (
            isSuccess(createResult) &&
            createResult.data
          ) {
            // TypeScript should know about data.id and data.name
            const { id, name } = createResult.data
            expect(id).toBe('2')
            expect(name).toBe('User')
          }
        })

        test('streamActions should have correct types', async () => {
          const { searchUsers: streamSearchUsers } =
            client.streamActions
          const stream = await streamSearchUsers({
            query: 'test',
          })

          for await (const chunk of stream) {
            if (
              isSuccess(chunk.searchUsers) &&
              chunk.searchUsers.data
            ) {
              // TypeScript should know about data.query
              // HTTP transport doesn't support streaming, so data might not have query
              if (transport !== 'http') {
                const { query } = chunk.searchUsers
                  .data as { query: string }
                expect(query).toBe('test')
              }
              break
            }
          }
        })
      })

      describe('edge cases', () => {
        test('fetchActions should handle non-existent action gracefully', async () => {
          // TypeScript won't allow this, but runtime should handle it
          const actions = client.fetchActions as Record<
            string,
            unknown
          >
          const nonExistent = actions['nonExistent'] as (
            params: unknown,
          ) => Promise<unknown>

          if (nonExistent) {
            const result = await nonExistent({})
            expect(result).toBeDefined()
            // Should be an error result - check if it has error status
            if (
              result &&
              typeof result === 'object' &&
              'status' in result
            ) {
              expect(
                (result as { status: string }).status,
              ).toBe('error')
            }
          }
        })

        test('streamActions should handle non-existent action gracefully', async () => {
          // TypeScript won't allow this, but runtime should handle it
          const actions = client.streamActions as Record<
            string,
            unknown
          >
          const nonExistent = actions['nonExistent'] as (
            params: unknown,
          ) => Promise<AsyncIterable<unknown>>

          if (nonExistent) {
            const stream = await nonExistent({})
            let hasError = false
            for await (const chunk of stream) {
              hasError = true
              // Should have error in the chunk
              expect(chunk).toBeDefined()
              break
            }
            expect(hasError).toBe(true)
          }
        })
      })
    })
  }
})
