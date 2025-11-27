/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-shadow */
import { action, m, type TransportType } from '../..'
import { createRouter } from '../router'
import { createRouterClient } from '../router-client'
import { AsyncStream } from '../../utils/async-stream'

describe('router client return types', () => {
  const transports: TransportType[] = [
    'stream',
    'websocket',
  ]

  for (const transport of transports) {
    describe(`transport: ${transport}`, () => {
      const timeout = 1000
      const serverTimeout = timeout * 2 + 10

      const paramsModel = m.object({
        value: m.string().isRequired(),
      })

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
            start(controller) {
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
        actions: {
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
        transport,
      })
      type Router = typeof router

      let server: Bun.Server<unknown> | undefined

      if (transport === 'stream') {
        server = Bun.serve({
          port: 0,
          reusePort: true,
          async fetch(request) {
            return router.onRequest({
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
              router.onWebSocketMessage &&
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
              if (router.onWebSocketMessage) {
                router
                  .onWebSocketMessage({
                    ws,
                    message,
                    ctx: {},
                  })
                  .catch(() => {
                    // Ignore errors in message handling
                  })
              }
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

      describe('client.fetch()', () => {
        it('should fetch normal (non-streaming) action return', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
            defineClientActions: {},
            responseTimeout: timeout,
          })

          const result = await client.fetch({
            normalAction: { value: 'test' },
          })

          expect(result.normalAction?.status).toBe('ok')
          expect(result.normalAction?.data).toEqual({
            result: 'normal-test',
          })
        })

        it('should fetch generator function return and return final value', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
            defineClientActions: {},
            responseTimeout: timeout,
          })

          const result = await client.fetch({
            generatorAction: { value: 'test' },
          })

          expect(result.generatorAction?.status).toBe('ok')
          // fetch() should return the final value from the stream
          expect(result.generatorAction?.data).toBe(
            'gen-test-3',
          )
        })

        it('should fetch async generator function return and return final value', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
            defineClientActions: {},
            responseTimeout: timeout,
          })

          const result = await client.fetch({
            asyncGeneratorAction: { value: 'test' },
          })

          expect(result.asyncGeneratorAction?.status).toBe(
            'ok',
          )
          // fetch() should return the final value from the stream
          expect(result.asyncGeneratorAction?.data).toBe(
            'async-gen-test-3',
          )
        })

        it('should fetch ReadableStream return and return final value', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
            defineClientActions: {},
            responseTimeout: timeout,
          })

          const result = await client.fetch({
            readableStreamAction: { value: 'test' },
          })

          expect(result.readableStreamAction?.status).toBe(
            'ok',
          )
          // fetch() should return the final value from the stream
          expect(result.readableStreamAction?.data).toBe(
            'readable-test-3',
          )
        })

        it('should fetch AsyncStream return and return final value', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
            defineClientActions: {},
            responseTimeout: timeout,
          })

          const result = await client.fetch({
            asyncStreamAction: { value: 'test' },
          })

          expect(result.asyncStreamAction?.status).toBe(
            'ok',
          )
          // fetch() should return the final value from the stream
          expect(result.asyncStreamAction?.data).toBe(
            'async-stream-test-3',
          )
        })

        it('should fetch empty stream return', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
            defineClientActions: {},
            responseTimeout: timeout,
          })

          const result = await client.fetch({
            emptyStreamAction: { value: 'test' },
          })

          expect(result.emptyStreamAction?.status).toBe(
            'ok',
          )
          // Empty stream should still have a result
          expect(
            result.emptyStreamAction?.data,
          ).toBeUndefined()
        })

        it('should fetch single value stream return', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
            defineClientActions: {},
            responseTimeout: timeout,
          })

          const result = await client.fetch({
            singleValueStreamAction: { value: 'test' },
          })

          expect(
            result.singleValueStreamAction?.status,
          ).toBe('ok')
          expect(result.singleValueStreamAction?.data).toBe(
            'single-test',
          )
        })

        it('should fetch all return types in a single request', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
            defineClientActions: {},
            responseTimeout: timeout * 2,
          })

          const result = await client.fetch({
            normalAction: { value: 'all' },
            generatorAction: { value: 'all' },
            asyncGeneratorAction: { value: 'all' },
            readableStreamAction: { value: 'all' },
            asyncStreamAction: { value: 'all' },
            singleValueStreamAction: { value: 'all' },
            emptyStreamAction: { value: 'all' },
          })

          // Normal action
          expect(result.normalAction?.status).toBe('ok')
          expect(result.normalAction?.data).toEqual({
            result: 'normal-all',
          })

          // Generator - should have final value
          expect(result.generatorAction?.status).toBe('ok')
          expect(result.generatorAction?.data).toBe(
            'gen-all-3',
          )

          // Async generator - should have final value
          expect(result.asyncGeneratorAction?.status).toBe(
            'ok',
          )
          expect(result.asyncGeneratorAction?.data).toBe(
            'async-gen-all-3',
          )

          // ReadableStream - should have final value
          expect(result.readableStreamAction?.status).toBe(
            'ok',
          )
          expect(result.readableStreamAction?.data).toBe(
            'readable-all-3',
          )

          // AsyncStream - should have final value
          expect(result.asyncStreamAction?.status).toBe(
            'ok',
          )
          expect(result.asyncStreamAction?.data).toBe(
            'async-stream-all-3',
          )

          // Single value stream
          expect(
            result.singleValueStreamAction?.status,
          ).toBe('ok')
          expect(result.singleValueStreamAction?.data).toBe(
            'single-all',
          )

          // Empty stream
          expect(result.emptyStreamAction?.status).toBe(
            'ok',
          )
        })
      })

      describe('client.stream()', () => {
        it('should stream normal (non-streaming) action return', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
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
            (m) => m.normalAction,
          )
          expect(normalResult?.normalAction?.status).toBe(
            'ok',
          )
          expect(normalResult?.normalAction?.data).toEqual({
            result: 'normal-test',
          })
        })

        it('should stream generator function return', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
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
            (m) => m.generatorAction,
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

          // Last message should have final value
          const lastMessage = generatorResults.at(-1)
          expect(lastMessage?.generatorAction?.data).toBe(
            'gen-test-3',
          )
        })

        it('should stream async generator function return', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
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
            (m) => m.asyncGeneratorAction,
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

        it('should stream ReadableStream return', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
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
            (m) => m.readableStreamAction,
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

        it('should stream AsyncStream return', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
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
            (m) => m.asyncStreamAction,
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

        it('should stream empty stream return', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
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
            (m) => m.emptyStreamAction,
          )
          expect(
            emptyResults.length,
          ).toBeGreaterThanOrEqual(1)
          // Last message should indicate completion
          const lastMessage = emptyResults.at(-1)
          expect(
            lastMessage?.emptyStreamAction?.status,
          ).toBe('ok')
        })

        it('should stream single value stream return', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
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
            (m) => m.singleValueStreamAction,
          )
          expect(
            singleResults.length,
          ).toBeGreaterThanOrEqual(1)
          expect(
            singleResults[0]?.singleValueStreamAction?.data,
          ).toBe('single-test')
        })

        it('should stream all return types in a single request', async () => {
          const client = createRouterClient<Router>({
            url,
            transport,
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
            emptyStreamAction: { value: 'all' },
          })

          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          // Normal action should have single result
          const normalResults = messages.filter(
            (m) => m.normalAction,
          )
          expect(normalResults.length).toBeGreaterThan(0)
          expect(
            normalResults[0]?.normalAction?.status,
          ).toBe('ok')
          expect(
            normalResults[0]?.normalAction?.data,
          ).toEqual({ result: 'normal-all' })

          // Generator should have multiple results
          const genResults = messages.filter(
            (m) => m.generatorAction,
          )
          expect(genResults.length).toBeGreaterThanOrEqual(
            3,
          )

          // Async generator should have multiple results
          const asyncGenResults = messages.filter(
            (m) => m.asyncGeneratorAction,
          )
          expect(
            asyncGenResults.length,
          ).toBeGreaterThanOrEqual(3)

          // ReadableStream should have multiple results
          const readableResults = messages.filter(
            (m) => m.readableStreamAction,
          )
          expect(
            readableResults.length,
          ).toBeGreaterThanOrEqual(3)

          // AsyncStream should have multiple results
          const asyncStreamResults = messages.filter(
            (m) => m.asyncStreamAction,
          )
          expect(
            asyncStreamResults.length,
          ).toBeGreaterThanOrEqual(3)

          // Single value stream should have one result
          const singleResults = messages.filter(
            (m) => m.singleValueStreamAction,
          )
          expect(
            singleResults.length,
          ).toBeGreaterThanOrEqual(1)
          expect(
            singleResults[0]?.singleValueStreamAction?.data,
          ).toBe('single-all')

          // Empty stream should have completion message
          const emptyResults = messages.filter(
            (m) => m.emptyStreamAction,
          )
          expect(
            emptyResults.length,
          ).toBeGreaterThanOrEqual(1)
        })
      })
    })
  }
})
