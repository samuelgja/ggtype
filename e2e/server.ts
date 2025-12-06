import type { ServerWebSocket } from 'bun'
import { createRouter, action, m } from '../src'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

export const PORT = 3000

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))
// Router with actions designed for concurrency and isolation testing
export const router = createRouter({
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
        for (let index = 0; index < params.count; index++) {
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

export type Router = typeof router

const server = new Elysia()

  .use(
    cors({
      origin: '*', // your Tauri app origin
      methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  )
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
  .get('/close', () => {
    server.stop()
  })
  .listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`)
  })
