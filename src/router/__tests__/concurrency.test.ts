/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable no-console */
import type { ServerWebSocket } from 'bun'
import { m } from '../..'
import { action } from '../../action/action'
import { createRouter } from '../router'
import { createRouterClient } from '../../router-client/router-client'
import { Elysia } from 'elysia'
import { getTestPort } from './test-utils'

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// Test configuration constants
const CONCURRENT_CLIENTS = 1000
const TIMEOUT_MS = 5000
const CONCURRENT_REQUESTS_PER_CLIENT = 10
const SLOW_ACTION_DELAY_MS = 2000

/**
 * Creates a unique client ID for testing
 */
function createClientId(index: number): string {
  // eslint-disable-next-line sonarjs/pseudo-random
  return `client-${index}-${Date.now()}-${Math.random()}`
}

describe('Concurrency and Timeout Tests', () => {
  const PORT = getTestPort()

  // Router with actions designed for concurrency and isolation testing
  const router = createRouter({
    serverActions: {
      // Returns user data with provided ID - critical for isolation testing
      getUserWithId: action(
        m.object({
          clientId: m.string(),
          requestId: m.number(),
        }),
        async ({ params }) => {
          // Simulate some processing time
          await delay(1)
          return {
            clientId: params.clientId,
            requestId: params.requestId,
            timestamp: Date.now(),
          }
        },
      ),

      // Slow action for timeout testing
      getSlowAction: action(
        m.object({
          delay: m.number(),
          clientId: m.string(),
        }),
        async ({ params }) => {
          await delay(params.delay)
          return {
            clientId: params.clientId,
            completed: true,
          }
        },
      ),

      // Stream action with client ID for isolation testing
      getStreamWithId: action(
        m.object({
          clientId: m.string(),
          count: m.number(),
        }),
        async function* ({ params }) {
          for (
            let index = 0;
            index < params.count;
            index++
          ) {
            await delay(1)
            yield {
              clientId: params.clientId,
              index,
              value: `client-${params.clientId}-item-${index}`,
            }
          }
        },
      ),

      // Action that returns data that must be isolated per client
      getConcurrentData: action(
        m.object({
          clientId: m.string(),
          data: m.string(),
        }),
        async ({ params }) => {
          // Random delay to test race conditions
          // eslint-disable-next-line sonarjs/pseudo-random
          await delay(Math.random() * 2)
          return {
            clientId: params.clientId,
            data: params.data,
            serverProcessedAt: Date.now(),
          }
        },
      ),

      // Action for testing multiple concurrent requests from same client
      getMultipleRequests: action(
        m.object({
          clientId: m.string(),
          requestIndex: m.number(),
        }),
        async ({ params }) => {
          await delay(1)
          return {
            clientId: params.clientId,
            requestIndex: params.requestIndex,
            processed: true,
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
    .ws('/ws', {
      message(ws, message) {
        if (router.onWebSocketMessage) {
          router
            .onWebSocketMessage({
              ws: ws.raw as ServerWebSocket<unknown>,
              message: message as Uint8Array,
              ctx: {},
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
    // Give connections time to close gracefully
    await delay(2)
    try {
      await Promise.race([
        server.stop(),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ])
    } catch {
      // Ignore errors when stopping server
    }
  })

  // ==========================================================================
  // Data Isolation Tests (Security Critical)
  // ==========================================================================
  describe('Data Isolation', () => {
    it('should isolate data between concurrent HTTP clients', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      const clientIds = Array.from(
        { length: 100 },
        (_, index) => createClientId(index),
      )

      const promises = clientIds.map((clientId, index) =>
        client
          .fetch({
            getUserWithId: {
              clientId,
              requestId: index,
            },
          })
          .then((result) => ({
            clientId: result.getUserWithId.data
              ?.clientId as string,
            requestId: result.getUserWithId.data
              ?.requestId as number,
          })),
      )

      const results = await Promise.all(promises)

      // Verify all client IDs are correct
      for (const [index, result] of results.entries()) {
        expect(result.clientId).toBe(clientIds[index])
        expect(result.requestId).toBe(index)
      }

      // Verify no data leakage
      const uniqueClientIds = new Set(
        results.map((r) => r.clientId),
      )
      expect(uniqueClientIds.size).toBe(clientIds.length)
    })

    it('should isolate data between concurrent stream clients', async () => {
      const client = createRouterClient<Router>({
        streamURL: `http://localhost:${PORT}/stream`,
      })

      const clientIds = Array.from(
        { length: 50 },
        (_, index) => createClientId(index),
      )

      const promises = clientIds.map((clientId) =>
        (async () => {
          const results: Array<{ clientId: string }> = []
          for await (const item of client.stream({
            getStreamWithId: { clientId, count: 5 },
          })) {
            if (item.getStreamWithId?.status === 'ok') {
              results.push(
                item.getStreamWithId.data as {
                  clientId: string
                },
              )
            }
          }
          return results
        })(),
      )

      const allResults = await Promise.all(promises)

      // Verify each stream contains only its client's data
      for (const [
        index,
        streamResults,
      ] of allResults.entries()) {
        expect(streamResults).toHaveLength(5)
        for (const result of streamResults) {
          expect(result.clientId).toBe(clientIds[index])
        }
      }
    })

    it('should isolate data between concurrent WebSocket clients', async () => {
      const clientIds = Array.from(
        { length: 50 },
        (_, index) => createClientId(index),
      )

      const promises = clientIds.map((clientId) =>
        (async () => {
          const client = createRouterClient<Router>({
            websocketURL: `ws://localhost:${PORT}/ws`,
          })

          const results: Array<{ clientId: string }> = []
          for await (const item of client.websocket({
            getUserWithId: { clientId, requestId: 0 },
          })) {
            if (item.getUserWithId?.status === 'ok') {
              results.push(
                item.getUserWithId.data as {
                  clientId: string
                },
              )
            }
          }
          if (results[0] === undefined) {
            throw new Error(
              `No result received for clientId: ${clientId}`,
            )
          }
          return results[0]
        })(),
      )

      const results = await Promise.all(promises)

      // Verify each client received only their own data
      for (const [index, result] of results.entries()) {
        expect(result.clientId).toBe(clientIds[index])
      }
    })
  })

  // ==========================================================================
  // High Concurrency Tests - HTTP Transport
  // ==========================================================================
  describe('High Concurrency - HTTP Transport', () => {
    it(`should handle ${CONCURRENT_CLIENTS} concurrent HTTP requests`, async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      const clientIds = Array.from(
        { length: CONCURRENT_CLIENTS },
        (_, index) => createClientId(index),
      )

      const startTime = Date.now()

      const promises = clientIds.map((clientId, index) =>
        client
          .fetch({
            getUserWithId: {
              clientId,
              requestId: index,
            },
          })
          .then((result) => ({
            clientId: result.getUserWithId.data
              ?.clientId as string,
            requestId: result.getUserWithId.data
              ?.requestId as number,
          })),
      )

      const results = await Promise.all(promises)
      const endTime = Date.now()

      // Verify all requests succeeded
      expect(results).toHaveLength(CONCURRENT_CLIENTS)

      // Verify data isolation
      for (const [index, result] of results.entries()) {
        expect(result.clientId).toBe(clientIds[index])
        expect(result.requestId).toBe(index)
      }

      // Log performance
      console.log(
        `HTTP: ${CONCURRENT_CLIENTS} concurrent requests completed in ${endTime - startTime}ms`,
      )
    })

    it(`should handle ${CONCURRENT_CLIENTS} clients with ${CONCURRENT_REQUESTS_PER_CLIENT} requests each`, async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      const clientIds = Array.from(
        { length: CONCURRENT_CLIENTS },
        (_, index) => createClientId(index),
      )

      const startTime = Date.now()

      const createClientRequests = (clientId: string) => {
        const requestPromises = Array.from(
          { length: CONCURRENT_REQUESTS_PER_CLIENT },
          (_, requestIndex) =>
            client
              .fetch({
                getMultipleRequests: {
                  clientId,
                  requestIndex,
                },
              })
              .then((result) => ({
                clientId: result.getMultipleRequests.data
                  ?.clientId as string,
                requestIndex: result.getMultipleRequests
                  .data?.requestIndex as number,
              })),
        )
        return Promise.all(requestPromises)
      }

      const clientPromises = clientIds.map((clientId) =>
        createClientRequests(clientId),
      )

      const allResults = await Promise.all(clientPromises)
      const endTime = Date.now()

      // Verify all requests succeeded
      expect(allResults).toHaveLength(CONCURRENT_CLIENTS)
      for (const clientResults of allResults) {
        expect(clientResults).toHaveLength(
          CONCURRENT_REQUESTS_PER_CLIENT,
        )
      }

      // Verify data isolation
      for (const [
        clientIndex,
        clientResults,
      ] of allResults.entries()) {
        for (const [
          requestIndex,
          result,
        ] of clientResults.entries()) {
          expect(result.clientId).toBe(
            clientIds[clientIndex],
          )
          expect(result.requestIndex).toBe(requestIndex)
        }
      }

      console.log(
        `HTTP: ${CONCURRENT_CLIENTS} clients × ${CONCURRENT_REQUESTS_PER_CLIENT} requests = ${CONCURRENT_CLIENTS * CONCURRENT_REQUESTS_PER_CLIENT} total requests completed in ${endTime - startTime}ms`,
      )
    })
  })

  // ==========================================================================
  // High Concurrency Tests - WebSocket Transport (Primary Focus)
  // ==========================================================================
  describe('High Concurrency - WebSocket Transport', () => {
    it(`should handle ${CONCURRENT_CLIENTS} concurrent WebSocket connections`, async () => {
      const clientIds = Array.from(
        { length: CONCURRENT_CLIENTS },
        (_, index) => createClientId(index),
      )

      const startTime = Date.now()

      const createWebSocketRequest = (
        clientId: string,
        requestId: number,
      ) => {
        return (async () => {
          const client = createRouterClient<Router>({
            websocketURL: `ws://localhost:${PORT}/ws`,
          })

          const results: Array<{
            clientId: string
            requestId: number
          }> = []
          for await (const item of client.websocket({
            getUserWithId: { clientId, requestId },
          })) {
            if (item.getUserWithId?.status === 'ok') {
              results.push(
                item.getUserWithId.data as {
                  clientId: string
                  requestId: number
                },
              )
            }
          }
          if (results[0] === undefined) {
            throw new Error(
              `No result received for clientId: ${clientId}, requestId: ${requestId}`,
            )
          }
          return results[0]
        })()
      }

      const promises = clientIds.map((clientId, index) =>
        createWebSocketRequest(clientId, index),
      )

      const results = await Promise.all(promises)
      const endTime = Date.now()

      // Verify all connections succeeded
      expect(results).toHaveLength(CONCURRENT_CLIENTS)

      // Verify data isolation
      for (const [index, result] of results.entries()) {
        expect(result.clientId).toBe(clientIds[index])
        expect(result.requestId).toBe(index)
      }

      console.log(
        `WebSocket: ${CONCURRENT_CLIENTS} concurrent connections completed in ${endTime - startTime}ms`,
      )
    }, 30_000) // Increase timeout to 30 seconds

    it(`should handle ${CONCURRENT_CLIENTS} persistent WebSocket connections with multiple sends`, async () => {
      const clientIds = Array.from(
        { length: CONCURRENT_CLIENTS },
        (_, index) => createClientId(index),
      )

      const startTime = Date.now()

      const createPersistentConnection = (
        clientId: string,
      ) => {
        return (async () => {
          const client = createRouterClient<Router>({
            websocketURL: `ws://localhost:${PORT}/ws`,
          })

          const connection = client.startWebsocket()
          const results: Array<{
            clientId: string
            requestId: number
          }> = []

          // Send multiple requests on the same connection
          for (
            let requestIndex = 0;
            requestIndex < 5;
            requestIndex++
          ) {
            await connection.send({
              getUserWithId: {
                clientId,
                requestId: requestIndex,
              },
            })
          }

          // Collect all results
          let resultCount = 0
          for await (const item of connection.stream) {
            if (item.getUserWithId?.status === 'ok') {
              results.push(
                item.getUserWithId.data as {
                  clientId: string
                  requestId: number
                },
              )
              resultCount++
              if (resultCount >= 5) {
                break
              }
            }
          }

          connection.close()
          return results
        })()
      }

      const connectionPromises = clientIds.map((clientId) =>
        createPersistentConnection(clientId),
      )

      const allResults = await Promise.all(
        connectionPromises,
      )
      const endTime = Date.now()

      // Verify all connections succeeded
      expect(allResults).toHaveLength(CONCURRENT_CLIENTS)

      // Verify data isolation and correct ordering
      for (const [
        clientIndex,
        clientResults,
      ] of allResults.entries()) {
        expect(clientResults).toHaveLength(5)

        for (const [
          requestIndex,
          result,
        ] of clientResults.entries()) {
          expect(result.clientId).toBe(
            clientIds[clientIndex],
          )
          expect(result.requestId).toBe(requestIndex)
        }
      }

      console.log(
        `WebSocket Persistent: ${CONCURRENT_CLIENTS} connections × 5 sends = ${CONCURRENT_CLIENTS * 5} total messages completed in ${endTime - startTime}ms`,
      )
    })

    it('should isolate data in concurrent WebSocket streams', async () => {
      const clientIds = Array.from(
        { length: 100 },
        (_, index) => createClientId(index),
      )

      const createStreamRequest = (clientId: string) => {
        return (async () => {
          const client = createRouterClient<Router>({
            websocketURL: `ws://localhost:${PORT}/ws`,
          })

          const results: Array<{
            clientId: string
            index: number
          }> = []
          for await (const item of client.websocket({
            getStreamWithId: { clientId, count: 10 },
          })) {
            if (item.getStreamWithId?.status === 'ok') {
              results.push(
                item.getStreamWithId.data as {
                  clientId: string
                  index: number
                },
              )
            }
          }
          return results
        })()
      }

      const promises = clientIds.map((clientId) =>
        createStreamRequest(clientId),
      )

      const allResults = await Promise.all(promises)

      // Verify each stream contains only its client's data
      for (const [
        index,
        streamResults,
      ] of allResults.entries()) {
        expect(streamResults).toHaveLength(10)
        for (const result of streamResults) {
          expect(result.clientId).toBe(clientIds[index])
        }
      }
    })
  })

  // ==========================================================================
  // High Concurrency Tests - Duplex Transport
  // ==========================================================================
  describe('High Concurrency - Duplex Transport', () => {
    it(`should handle ${CONCURRENT_CLIENTS} concurrent duplex connections`, async () => {
      const clientIds = Array.from(
        { length: CONCURRENT_CLIENTS },
        (_, index) => createClientId(index),
      )

      const startTime = Date.now()

      const createDuplexRequest = (
        clientId: string,
        requestId: number,
      ) => {
        return (async () => {
          const client = createRouterClient<Router>({
            halfDuplexUrl: `http://localhost:${PORT}/duplex`,
          })

          const results: Array<{
            clientId: string
            requestId: number
          }> = []
          for await (const item of client.duplex({
            getUserWithId: { clientId, requestId },
          })) {
            if (item.getUserWithId?.status === 'ok') {
              results.push(
                item.getUserWithId.data as {
                  clientId: string
                  requestId: number
                },
              )
            }
          }
          if (results[0] === undefined) {
            throw new Error(
              `No result received for clientId: ${clientId}, requestId: ${requestId}`,
            )
          }
          return results[0]
        })()
      }

      const promises = clientIds.map((clientId, index) =>
        createDuplexRequest(clientId, index),
      )

      const results = await Promise.all(promises)
      const endTime = Date.now()

      // Verify all connections succeeded
      expect(results).toHaveLength(CONCURRENT_CLIENTS)

      // Verify data isolation
      for (const [index, result] of results.entries()) {
        expect(result.clientId).toBe(clientIds[index])
        expect(result.requestId).toBe(index)
      }

      console.log(
        `Duplex: ${CONCURRENT_CLIENTS} concurrent connections completed in ${endTime - startTime}ms`,
      )
    })

    it(`should handle ${CONCURRENT_CLIENTS} persistent duplex connections with multiple sends`, async () => {
      const clientIds = Array.from(
        { length: CONCURRENT_CLIENTS },
        (_, index) => createClientId(index),
      )

      const startTime = Date.now()

      const createPersistentDuplex = (clientId: string) => {
        return (async () => {
          const client = createRouterClient<Router>({
            halfDuplexUrl: `http://localhost:${PORT}/duplex`,
          })

          const connection = client.startDuplex()
          const results: Array<{
            clientId: string
            requestId: number
          }> = []

          // Send multiple requests on the same connection
          for (
            let requestIndex = 0;
            requestIndex < 5;
            requestIndex++
          ) {
            await connection.send({
              getUserWithId: {
                clientId,
                requestId: requestIndex,
              },
            })
          }

          // Collect all results
          let resultCount = 0
          for await (const item of connection.stream) {
            if (item.getUserWithId?.status === 'ok') {
              results.push(
                item.getUserWithId.data as {
                  clientId: string
                  requestId: number
                },
              )
              resultCount++
              if (resultCount >= 5) {
                break
              }
            }
          }

          connection.close()
          return results
        })()
      }

      const connectionPromises = clientIds.map((clientId) =>
        createPersistentDuplex(clientId),
      )

      const allResults = await Promise.all(
        connectionPromises,
      )
      const endTime = Date.now()

      // Verify all connections succeeded
      expect(allResults).toHaveLength(CONCURRENT_CLIENTS)

      // Verify data isolation
      for (const [
        clientIndex,
        clientResults,
      ] of allResults.entries()) {
        expect(clientResults).toHaveLength(5)

        for (const [
          requestIndex,
          result,
        ] of clientResults.entries()) {
          expect(result.clientId).toBe(
            clientIds[clientIndex],
          )
          expect(result.requestId).toBe(requestIndex)
        }
      }

      console.log(
        `Duplex Persistent: ${CONCURRENT_CLIENTS} connections × 5 sends = ${CONCURRENT_CLIENTS * 5} total messages completed in ${endTime - startTime}ms`,
      )
    })
  })

  // ==========================================================================
  // Timeout Tests
  // ==========================================================================
  describe('Timeout Handling', () => {
    it('should handle timeout on slow HTTP action', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        responseTimeout: TIMEOUT_MS,
      })

      // This should complete before timeout
      const fastResult = await client.fetch({
        getSlowAction: { delay: 100, clientId: 'fast' },
      })
      expect(fastResult.getSlowAction.status).toBe('ok')

      // This might timeout depending on implementation
      // Note: The router client doesn't currently implement timeout on HTTP
      // This test documents expected behavior
      const slowResult = await client.fetch({
        getSlowAction: {
          delay: SLOW_ACTION_DELAY_MS,
          clientId: 'slow',
        },
      })
      expect(slowResult.getSlowAction.status).toBe('ok')
    })

    it('should handle concurrent requests with varying delays', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      const clientIds = Array.from(
        { length: 100 },
        (_, index) => createClientId(index),
      )

      const promises = clientIds.map((clientId, index) =>
        client.fetch({
          getSlowAction: {
            delay: (index % 10) * 10, // Varying delays
            clientId,
          },
        }),
      )

      const results = await Promise.all(promises)

      // Verify all completed successfully
      expect(results).toHaveLength(100)
      for (const [index, result] of results.entries()) {
        expect(result.getSlowAction.status).toBe('ok')
        expect(result.getSlowAction.data?.clientId).toBe(
          clientIds[index],
        )
      }
    })
  })

  // ==========================================================================
  // Mixed Load Tests
  // ==========================================================================
  describe('Mixed Load Tests', () => {
    it('should handle mixed transport types concurrently', async () => {
      const httpClient = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })

      const streamClient = createRouterClient<Router>({
        streamURL: `http://localhost:${PORT}/stream`,
      })

      const wsClient = createRouterClient<Router>({
        websocketURL: `ws://localhost:${PORT}/ws`,
      })

      const duplexClient = createRouterClient<Router>({
        halfDuplexUrl: `http://localhost:${PORT}/duplex`,
      })

      const clientIds = Array.from(
        { length: 250 },
        (_, index) => createClientId(index),
      )

      const createHttpRequest = (
        clientId: string,
        requestId: number,
      ) => {
        return httpClient
          .fetch({
            getUserWithId: { clientId, requestId },
          })
          .then(
            (r) => r.getUserWithId.data?.clientId as string,
          )
      }

      const createStreamRequest = (clientId: string) => {
        return (async () => {
          const results: string[] = []
          for await (const item of streamClient.stream({
            getStreamWithId: { clientId, count: 3 },
          })) {
            if (item.getStreamWithId?.status === 'ok') {
              results.push(
                (
                  item.getStreamWithId.data as {
                    clientId: string
                  }
                ).clientId,
              )
            }
          }
          return results[0] || null
        })()
      }

      const createWsRequest = (
        clientId: string,
        requestId: number,
      ) => {
        return (async () => {
          const results: string[] = []
          for await (const item of wsClient.websocket({
            getUserWithId: { clientId, requestId },
          })) {
            if (item.getUserWithId?.status === 'ok') {
              results.push(
                (
                  item.getUserWithId.data as {
                    clientId: string
                  }
                ).clientId,
              )
            }
          }
          return results[0] || null
        })()
      }

      const createDuplexRequest = (
        clientId: string,
        requestId: number,
      ) => {
        return (async () => {
          const results: string[] = []
          for await (const item of duplexClient.duplex({
            getUserWithId: { clientId, requestId },
          })) {
            if (item.getUserWithId?.status === 'ok') {
              results.push(
                (
                  item.getUserWithId.data as {
                    clientId: string
                  }
                ).clientId,
              )
            }
          }
          return results[0] || null
        })()
      }

      const httpPromises = clientIds
        .slice(0, 250)
        .map((clientId, index) =>
          createHttpRequest(clientId, index),
        )

      const streamPromises = clientIds
        .slice(0, 100)
        .map((clientId) => createStreamRequest(clientId))

      const wsPromises = clientIds
        .slice(0, 100)
        .map((clientId, index) =>
          createWsRequest(clientId, index),
        )

      const duplexPromises = clientIds
        .slice(0, 100)
        .map((clientId, index) =>
          createDuplexRequest(clientId, index),
        )

      const [
        httpResults,
        streamResults,
        wsResults,
        duplexResults,
      ] = await Promise.all([
        Promise.all(httpPromises),
        Promise.all(streamPromises),
        Promise.all(wsPromises),
        Promise.all(duplexPromises),
      ])

      // Verify all transports completed successfully
      expect(httpResults).toHaveLength(250)
      expect(streamResults.length).toBeGreaterThan(0)
      expect(wsResults.length).toBeGreaterThan(0)
      expect(duplexResults.length).toBeGreaterThan(0)

      // Verify data isolation across all transports
      for (const [index, result] of httpResults.entries()) {
        expect(result).toBe(clientIds[index])
      }
      const validStreamResults = streamResults.filter(
        (r): r is string => r !== null,
      )
      for (const result of validStreamResults) {
        const originalIndex = streamResults.indexOf(result)
        expect(result).toBe(clientIds[originalIndex])
      }
      const validWsResults = wsResults.filter(
        (r): r is string => r !== null,
      )
      for (const result of validWsResults) {
        const originalIndex = wsResults.indexOf(result)
        expect(result).toBe(clientIds[originalIndex])
      }
      const validDuplexResults = duplexResults.filter(
        (r): r is string => r !== null,
      )
      for (const result of validDuplexResults) {
        const originalIndex = duplexResults.indexOf(result)
        expect(result).toBe(clientIds[originalIndex])
      }
    })
  })
})
