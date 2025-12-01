import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
} from 'bun:test'
import { object } from '../../model/object'
import { string } from '../../model/string'
import { action } from '../../action/action'
import { createRouter } from '../router'
import { createRouterClient } from '../router-client'
import { isSuccess } from '../..'

describe('router client transport selection', () => {
  const userModel = object({
    id: string(),
    name: string(),
  }).isOptional()

  const getUser = action(userModel, ({ params }) => {
    return {
      id: params.id,
      name: params.name,
    }
  })

  const router = createRouter({
    serverActions: {
      getUser,
    },
    clientActions: {},
  })
  type Router = typeof router

  let httpServer: ReturnType<typeof Bun.serve> | null = null
  let streamServer: ReturnType<typeof Bun.serve> | null =
    null
  let wsServer: ReturnType<typeof Bun.serve> | null = null

  let httpPort: number
  let streamPort: number
  let wsPort: number

  beforeEach(() => {
    // Create HTTP server
    httpServer = Bun.serve({
      port: 0,
      reusePort: true,
      async fetch(request) {
        return router.onRequest({
          request,
          ctx: {},
        })
      },
    })
    httpPort = httpServer.port || 0

    // Create Stream server
    streamServer = Bun.serve({
      port: 0,
      reusePort: true,
      async fetch(request) {
        return router.onStream({
          request,
          ctx: {},
        })
      },
    })
    streamPort = streamServer.port || 0

    // Create WebSocket server
    wsServer = Bun.serve({
      port: 0,
      reusePort: true,
      fetch(request, server) {
        if (server.upgrade(request, { data: undefined })) {
          return
        }
        return new Response('Not a websocket', {
          status: 400,
        })
      },
      websocket: {
        message(ws, message) {
          router
            .onWebSocketMessage({
              ws: ws as unknown as Bun.ServerWebSocket<unknown>,
              message,
              ctx: {},
            })
            .catch(() => {
              // Ignore errors
            })
        },
        close(ws) {
          ws.close()
        },
      },
    })
    wsPort = wsServer.port || 0
  })

  afterEach(() => {
    httpServer?.stop()
    streamServer?.stop()
    wsServer?.stop()
    httpServer = null
    streamServer = null
    wsServer = null
  })

  it('should use stream transport when all three URLs are provided and stream works', async () => {
    const client = createRouterClient<Router>({
      streamURL: `http://localhost:${streamPort}`,
      websocketURL: `ws://localhost:${wsPort}`,
      httpURL: `http://localhost:${httpPort}`,
    })

    const result = await client.fetch({
      getUser: { id: '1', name: 'John' },
    })

    expect(result.getUser).toBeDefined()
    if (isSuccess(result.getUser)) {
      expect(result.getUser.data).toEqual({
        id: '1',
        name: 'John',
      })
    }
  })

  it('should fail when stream transport fails (no automatic downgrade)', async () => {
    // Create a client with invalid stream URL but valid websocket and http URLs
    const client = createRouterClient<Router>({
      streamURL: `http://localhost:99999`, // Invalid port
      websocketURL: `ws://localhost:${wsPort}`,
      httpURL: `http://localhost:${httpPort}`,
    })

    // Should throw error since stream transport fails and no downgrade occurs
    await expect(
      client.fetch({
        getUser: { id: '2', name: 'Jane' },
      }),
    ).rejects.toThrow()
  })

  it('should fail when stream transport fails even if http is available (no automatic downgrade)', async () => {
    // Create a client with invalid stream and websocket URLs but valid http URL
    const client = createRouterClient<Router>({
      streamURL: `http://localhost:99999`, // Invalid port
      websocketURL: `ws://localhost:99998`, // Invalid port
      httpURL: `http://localhost:${httpPort}`,
    })

    // Should throw error since stream transport fails and no downgrade occurs
    await expect(
      client.fetch({
        getUser: { id: '3', name: 'Bob' },
      }),
    ).rejects.toThrow()
  })

  it('should work with only stream URL provided', async () => {
    const client = createRouterClient<Router>({
      streamURL: `http://localhost:${streamPort}`,
    })

    const result = await client.fetch({
      getUser: { id: '4', name: 'Alice' },
    })

    expect(result.getUser).toBeDefined()
    if (isSuccess(result.getUser)) {
      expect(result.getUser.data).toEqual({
        id: '4',
        name: 'Alice',
      })
    }
  })

  it('should work with only websocket URL provided', async () => {
    const client = createRouterClient<Router>({
      websocketURL: `ws://localhost:${wsPort}`,
    })

    const result = await client.fetch({
      getUser: { id: '5', name: 'Charlie' },
    })

    expect(result.getUser).toBeDefined()
    if (isSuccess(result.getUser)) {
      expect(result.getUser.data).toEqual({
        id: '5',
        name: 'Charlie',
      })
    }
  })

  it('should work with only http URL provided', async () => {
    const client = createRouterClient<Router>({
      httpURL: `http://localhost:${httpPort}`,
    })

    const result = await client.fetch({
      getUser: { id: '6', name: 'David' },
    })

    expect(result.getUser).toBeDefined()
    if (isSuccess(result.getUser)) {
      expect(result.getUser.data).toEqual({
        id: '6',
        name: 'David',
      })
    }
  })

  it('should throw error when all transports fail', async () => {
    const client = createRouterClient<Router>({
      streamURL: `http://localhost:99999`, // Invalid port
      websocketURL: `ws://localhost:99998`, // Invalid port
      httpURL: `http://localhost:99997`, // Invalid port
    })

    await expect(
      client.fetch({
        getUser: { id: '7', name: 'Eve' },
      }),
    ).rejects.toThrow()
  })

  it('should throw error when no URLs are provided', () => {
    expect(() => {
      createRouterClient<Router>({})
    }).toThrow(
      'At least one of streamURL, websocketURL, or httpURL must be provided',
    )
  })

  it('should fail with stream() method when stream transport fails (no automatic downgrade)', async () => {
    const client = createRouterClient<Router>({
      streamURL: `http://localhost:99999`, // Invalid port
      websocketURL: `ws://localhost:${wsPort}`,
      httpURL: `http://localhost:${httpPort}`,
    })

    // Should throw error since stream transport fails and no downgrade occurs
    await expect(
      client.stream({
        getUser: { id: '8', name: 'Frank' },
      }),
    ).rejects.toThrow()
  })

  it('should use stream transport when all three URLs are provided (priority order)', async () => {
    const transportAttempts: string[] = []

    // Create servers that track which transport was used
    const trackedStreamServer = Bun.serve({
      port: 0,
      reusePort: true,
      async fetch(request) {
        transportAttempts.push('stream')
        return router.onStream({
          request,
          ctx: {},
        })
      },
    })

    const trackedWsServer = Bun.serve({
      port: 0,
      reusePort: true,
      fetch(request, server) {
        if (server.upgrade(request)) {
          return
        }
        return new Response('Not a websocket', {
          status: 400,
        })
      },
      websocket: {
        open() {
          transportAttempts.push('websocket')
        },
        message(ws, message) {
          router
            .onWebSocketMessage({
              ws: ws as unknown as Bun.ServerWebSocket<unknown>,
              message,
              ctx: {},
            })
            .catch(() => {
              // Ignore errors
            })
        },
        close(ws) {
          ws.close()
        },
      },
    })

    const trackedHttpServer = Bun.serve({
      port: 0,
      reusePort: true,
      async fetch(request) {
        transportAttempts.push('http')
        return router.onRequest({
          request,
          ctx: {},
        })
      },
    })

    try {
      const client = createRouterClient<Router>({
        streamURL: `http://localhost:${trackedStreamServer.port}`,
        websocketURL: `ws://localhost:${trackedWsServer.port}`,
        httpURL: `http://localhost:${trackedHttpServer.port}`,
      })

      const result = await client.fetch({
        getUser: { id: '9', name: 'Grace' },
      })

      // Should have used stream transport (first in priority order)
      expect(transportAttempts).toContain('stream')
      // Should not have tried other transports
      expect(transportAttempts).not.toContain('websocket')
      expect(transportAttempts).not.toContain('http')
      expect(result.getUser).toBeDefined()
      if (isSuccess(result.getUser)) {
        expect(result.getUser.data).toEqual({
          id: '9',
          name: 'Grace',
        })
      }
    } finally {
      trackedStreamServer.stop()
      trackedWsServer.stop()
      trackedHttpServer.stop()
    }
  })
})
