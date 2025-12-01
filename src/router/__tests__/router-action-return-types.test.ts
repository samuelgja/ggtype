import { action, m, type TransportType } from '../..'
import { createRouter } from '../router'
import { createRouterClient } from '../router-client'
import { AsyncStream } from '../../utils/async-stream'
import { createController } from '../../utils/stream-helpers'

describe('router action return types', () => {
  const transports: TransportType[] = [
    'stream',
    'websocket',
  ]

  for (const transport of transports) {
    describe(`transport: ${transport}`, () => {
      const timeout = 1000
      const serverTimeout = timeout * 2 + 10

      const paramsModel = m
        .object({
          value: m.string(),
        })
        .isOptional()

      // 1. Normal return (non-streaming)
      const normalAction = action(
        paramsModel,
        async ({ params }) => {
          return { result: `normal-${params.value}` }
        },
      )

      // 2. Generator function (synchronous iterable) - converted to async
      const generatorAction = action(
        paramsModel,
        async ({ params }) => {
          function* gen() {
            yield `gen-${params.value}-1`
            yield `gen-${params.value}-2`
            yield `gen-${params.value}-3`
          }
          // Convert sync generator to async iterable
          const syncGen = gen()
          return {
            async *[Symbol.asyncIterator]() {
              for (const value of syncGen) {
                yield value
              }
            },
          }
        },
      )

      // 3. Async generator function
      const asyncGeneratorAction = action(
        paramsModel,
        async function* ({ params }) {
          yield `async-gen-${params.value}-1`
          await new Promise((resolve) =>
            setTimeout(resolve, 10),
          )
          yield `async-gen-${params.value}-2`
          await new Promise((resolve) =>
            setTimeout(resolve, 10),
          )
          yield `async-gen-${params.value}-3`
        },
      )

      // 4. ReadableStream
      const readableStreamAction = action(
        paramsModel,
        async ({ params }) => {
          return new ReadableStream({
            start(controller) {
              controller.enqueue(
                `readable-${params.value}-1`,
              )
              controller.enqueue(
                `readable-${params.value}-2`,
              )
              controller.enqueue(
                `readable-${params.value}-3`,
              )
              controller.close()
            },
          })
        },
      )

      // 5. AsyncStream (extends ReadableStream and implements AsyncIterable)
      const asyncStreamAction = action(
        paramsModel,
        async ({ params }) => {
          return new AsyncStream({
            start(control) {
              const controller =
                createController<string>(control)
              controller.enqueue(
                `async-stream-${params.value}-1`,
              )
              controller.enqueue(
                `async-stream-${params.value}-2`,
              )
              controller.enqueue(
                `async-stream-${params.value}-3`,
              )
              controller.close()
            },
          })
        },
      )

      // 6. Empty stream
      const emptyStreamAction = action(
        paramsModel,
        async function* () {
          // No yields - empty stream
        },
      )

      // 7. Single value stream
      const singleValueStreamAction = action(
        paramsModel,
        async function* ({ params }) {
          yield `single-${params.value}`
        },
      )

      const router = createRouter({
        serverActions: {
          normalAction,
          generatorAction,
          asyncGeneratorAction,
          readableStreamAction,
          asyncStreamAction,
          emptyStreamAction,
          singleValueStreamAction,
        },
        clientActions: {},
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
              ctx: {},
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
                  ctx: {},
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
      const url =
        transport === 'stream'
          ? `http://localhost:${PORT}`
          : `ws://localhost:${PORT}`

      afterAll(() => {
        if (server) {
          server.stop()
        }
      })

      it('should handle normal (non-streaming) action return', async () => {
        const client =
          transport === 'stream'
            ? createRouterClient<Router>({
                streamURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })
            : createRouterClient<Router>({
                websocketURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })

        const result = await client.stream({
          normalAction: { value: 'test' },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        expect(messages.length).toBeGreaterThan(0)
        const normalResult = messages.find(
          (message) => message.normalAction,
        )
        expect(normalResult?.normalAction?.status).toBe(
          'ok',
        )
        expect(normalResult?.normalAction?.data).toEqual({
          result: 'normal-test',
        })
      })

      it('should handle generator function return', async () => {
        const client =
          transport === 'stream'
            ? createRouterClient<Router>({
                streamURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })
            : createRouterClient<Router>({
                websocketURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })

        const result = await client.stream({
          generatorAction: { value: 'test' },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        const generatorResults = messages.filter(
          (message) => message.generatorAction,
        )
        expect(
          generatorResults.length,
        ).toBeGreaterThanOrEqual(3)

        expect(
          generatorResults[0]?.generatorAction?.data,
        ).toBe('gen-test-1')
        expect(
          generatorResults[1]?.generatorAction?.data,
        ).toBe('gen-test-2')
        expect(
          generatorResults[2]?.generatorAction?.data,
        ).toBe('gen-test-3')

        // Last message should have isLast flag
        const lastMessage = generatorResults.at(-1)
        expect(lastMessage?.generatorAction?.data).toBe(
          'gen-test-3',
        )
      })

      it('should handle async generator function return', async () => {
        const client =
          transport === 'stream'
            ? createRouterClient<Router>({
                streamURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })
            : createRouterClient<Router>({
                websocketURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })

        const result = await client.stream({
          asyncGeneratorAction: { value: 'test' },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        const asyncGenResults = messages.filter(
          (message) => message.asyncGeneratorAction,
        )
        expect(
          asyncGenResults.length,
        ).toBeGreaterThanOrEqual(3)

        expect(
          asyncGenResults[0]?.asyncGeneratorAction?.data,
        ).toBe('async-gen-test-1')
        expect(
          asyncGenResults[1]?.asyncGeneratorAction?.data,
        ).toBe('async-gen-test-2')
        expect(
          asyncGenResults[2]?.asyncGeneratorAction?.data,
        ).toBe('async-gen-test-3')
      })

      it('should handle ReadableStream return', async () => {
        const client =
          transport === 'stream'
            ? createRouterClient<Router>({
                streamURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })
            : createRouterClient<Router>({
                websocketURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })

        const result = await client.stream({
          readableStreamAction: { value: 'test' },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        const readableResults = messages.filter(
          (message) => message.readableStreamAction,
        )
        expect(
          readableResults.length,
        ).toBeGreaterThanOrEqual(3)

        expect(
          readableResults[0]?.readableStreamAction?.data,
        ).toBe('readable-test-1')
        expect(
          readableResults[1]?.readableStreamAction?.data,
        ).toBe('readable-test-2')
        expect(
          readableResults[2]?.readableStreamAction?.data,
        ).toBe('readable-test-3')
      })

      it('should handle AsyncStream return', async () => {
        const client =
          transport === 'stream'
            ? createRouterClient<Router>({
                streamURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })
            : createRouterClient<Router>({
                websocketURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })

        const result = await client.stream({
          asyncStreamAction: { value: 'test' },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        const asyncStreamResults = messages.filter(
          (message) => message.asyncStreamAction,
        )
        expect(
          asyncStreamResults.length,
        ).toBeGreaterThanOrEqual(3)

        expect(
          asyncStreamResults[0]?.asyncStreamAction?.data,
        ).toBe('async-stream-test-1')
        expect(
          asyncStreamResults[1]?.asyncStreamAction?.data,
        ).toBe('async-stream-test-2')
        expect(
          asyncStreamResults[2]?.asyncStreamAction?.data,
        ).toBe('async-stream-test-3')
      })

      it('should handle empty stream return', async () => {
        const client =
          transport === 'stream'
            ? createRouterClient<Router>({
                streamURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })
            : createRouterClient<Router>({
                websocketURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })

        const result = await client.stream({
          emptyStreamAction: { value: 'test' },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        // Empty stream should still send a completion message
        const emptyResults = messages.filter(
          (message) => message.emptyStreamAction,
        )
        expect(emptyResults.length).toBeGreaterThanOrEqual(
          1,
        )
        // Last message should indicate completion
        const lastMessage = emptyResults.at(-1)
        expect(lastMessage?.emptyStreamAction?.status).toBe(
          'ok',
        )
      })

      it('should handle single value stream return', async () => {
        const client =
          transport === 'stream'
            ? createRouterClient<Router>({
                streamURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })
            : createRouterClient<Router>({
                websocketURL: url,
                defineClientActions: {},
                responseTimeout: timeout,
              })

        const result = await client.stream({
          singleValueStreamAction: { value: 'test' },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        const singleResults = messages.filter(
          (message) => message.singleValueStreamAction,
        )
        expect(singleResults.length).toBeGreaterThanOrEqual(
          1,
        )
        expect(
          singleResults[0]?.singleValueStreamAction?.data,
        ).toBe('single-test')
      })

      it('should handle all return types in a single request', async () => {
        const client =
          transport === 'stream'
            ? createRouterClient<Router>({
                streamURL: url,
                defineClientActions: {},
                responseTimeout: timeout * 2,
              })
            : createRouterClient<Router>({
                websocketURL: url,
                defineClientActions: {},
                responseTimeout: timeout * 2,
              })

        const result = await client.stream({
          normalAction: { value: 'all' },
          generatorAction: { value: 'all' },
          asyncGeneratorAction: { value: 'all' },
          readableStreamAction: { value: 'all' },
          asyncStreamAction: { value: 'all' },
          singleValueStreamAction: { value: 'all' },
        })

        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        // Normal action should have single result
        const normalResults = messages.filter(
          (message) => message.normalAction,
        )
        expect(normalResults.length).toBeGreaterThan(0)
        expect(normalResults[0]?.normalAction?.status).toBe(
          'ok',
        )
        expect(
          normalResults[0]?.normalAction?.data,
        ).toEqual({ result: 'normal-all' })

        // Generator should have multiple results
        const genResults = messages.filter(
          (message) => message.generatorAction,
        )
        expect(genResults.length).toBeGreaterThanOrEqual(3)

        // Async generator should have multiple results
        const asyncGenResults = messages.filter(
          (message) => message.asyncGeneratorAction,
        )
        expect(
          asyncGenResults.length,
        ).toBeGreaterThanOrEqual(3)

        // ReadableStream should have multiple results
        const readableResults = messages.filter(
          (message) => message.readableStreamAction,
        )
        expect(
          readableResults.length,
        ).toBeGreaterThanOrEqual(3)

        // AsyncStream should have multiple results
        const asyncStreamResults = messages.filter(
          (message) => message.asyncStreamAction,
        )
        expect(
          asyncStreamResults.length,
        ).toBeGreaterThanOrEqual(3)

        // Single value stream should have one result
        const singleResults = messages.filter(
          (message) => message.singleValueStreamAction,
        )
        expect(singleResults.length).toBeGreaterThanOrEqual(
          1,
        )
        expect(
          singleResults[0]?.singleValueStreamAction?.data,
        ).toBe('single-all')
      })
    })
  }
})
