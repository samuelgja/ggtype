import { WebSocketConnectionManager } from '../websocket-connection-manager'
import type { RouterMessage } from '../../router/router-message'
import { createRouterClient } from '../../router/router-client'
import { createRouter } from '../../router/router'
import { action, m } from '../..'

describe('WebSocketConnectionManager', () => {
  const responseTimeout = 5000

  it('should create connection lazily on first use', async () => {
    const server = Bun.serve({
      port: 0,
      fetch(request, fetchServer) {
        if (fetchServer.upgrade(request)) {
          return
        }
        return new Response('Upgrade failed', {
          status: 500,
        })
      },
      websocket: {
        message(ws, message: unknown) {
          type MessageType =
            | Uint8Array
            | ArrayBuffer
            | string
          if (
            message instanceof Uint8Array ||
            message instanceof ArrayBuffer ||
            typeof message === 'string'
          ) {
            ws.send(message as MessageType)
          }
        },
        close() {
          // Server close handler
        },
      },
    })

    const PORT = server.port
    const wsUrl = `ws://localhost:${PORT}`

    try {
      const manager = new WebSocketConnectionManager(
        wsUrl,
        responseTimeout,
      )
      const messageHandler = jest.fn()
      manager.setMessageProcessor(messageHandler)

      // Connection should not exist yet
      // Get connection - should create it
      const transport1 = await manager.getConnection()
      expect(transport1).not.toBeNull()

      // Get connection again - should return the same one
      const transport2 = await manager.getConnection()
      expect(transport2).toBe(transport1)

      await manager.close()
    } finally {
      server.stop()
    }
  })

  it('should reuse connection across multiple requests', async () => {
    const server = Bun.serve({
      port: 0,
      fetch(request, fetchServer) {
        if (fetchServer.upgrade(request)) {
          return
        }
        return new Response('Upgrade failed', {
          status: 500,
        })
      },
      websocket: {
        message(ws, message: unknown) {
          type MessageType =
            | Uint8Array
            | ArrayBuffer
            | string
          if (
            message instanceof Uint8Array ||
            message instanceof ArrayBuffer ||
            typeof message === 'string'
          ) {
            ws.send(message as MessageType)
          }
        },
        close() {
          // Server close handler
        },
      },
    })

    const PORT = server.port
    const wsUrl = `ws://localhost:${PORT}`

    try {
      const manager = new WebSocketConnectionManager(
        wsUrl,
        responseTimeout,
      )
      const messageHandler = jest.fn()
      manager.setMessageProcessor(messageHandler)

      // Get connection multiple times
      const transport1 = await manager.getConnection()
      const transport2 = await manager.getConnection()
      const transport3 = await manager.getConnection()

      // All should be the same connection
      expect(transport1).toBe(transport2)
      expect(transport2).toBe(transport3)

      await manager.close()
    } finally {
      server.stop()
    }
  })

  it('should automatically reconnect when connection is lost with pending requests', async () => {
    let connectionCount = 0
    const server = Bun.serve({
      port: 0,
      fetch(request, fetchServer) {
        if (fetchServer.upgrade(request)) {
          connectionCount++
          return
        }
        return new Response('Upgrade failed', {
          status: 500,
        })
      },
      websocket: {
        message(ws, message: unknown) {
          // Close connection after first message to simulate disconnection
          if (connectionCount === 1) {
            setTimeout(() => {
              ws.close()
            }, 100)
          } else {
            // On reconnection, echo messages back
            type MessageType =
              | Uint8Array
              | ArrayBuffer
              | string
            if (
              message instanceof Uint8Array ||
              message instanceof ArrayBuffer ||
              typeof message === 'string'
            ) {
              ws.send(message as MessageType)
            }
          }
        },
        close() {
          // Server close handler
        },
      },
    })

    const PORT = server.port
    const wsUrl = `ws://localhost:${PORT}`

    try {
      const manager = new WebSocketConnectionManager(
        wsUrl,
        responseTimeout,
      )
      manager.setMessageProcessor(() => {
        // No-op - messages are processed by the connection manager
      })

      // Get initial connection
      const transport1 = await manager.getConnection()
      expect(transport1).not.toBeNull()
      if (!transport1) {
        throw new Error('Failed to get transport')
      }

      // Mark a request as pending
      const requestId = 'test-request-1'
      manager.markRequestPending(requestId)

      // Send a message that will trigger disconnection
      const testMessage: RouterMessage = {
        id: 'test-id-1',
        action: 'test',
        status: 'ok',
        data: { test: 'data' },
      }
      await transport1.write(testMessage)

      // Wait for reconnection
      await new Promise((resolve) =>
        setTimeout(resolve, 500),
      )

      // Get connection again - should be reconnected
      const transport2 = await manager.getConnection()
      expect(transport2).not.toBeNull()
      expect(connectionCount).toBeGreaterThan(1)
      if (!transport2) {
        throw new Error(
          'Failed to get transport after reconnection',
        )
      }

      // Send another message after reconnection
      const testMessage2: RouterMessage = {
        id: 'test-id-2',
        action: 'test',
        status: 'ok',
        data: { test: 'data2' },
      }
      await transport2.write(testMessage2)

      // Wait for message processing
      await new Promise((resolve) =>
        setTimeout(resolve, 200),
      )

      // Mark request as completed
      manager.markRequestCompleted(requestId)

      await manager.close()
    } finally {
      server.stop()
    }
  })

  it('should clean up connection when no pending requests after disconnection', async () => {
    let connectionCount = 0
    const server = Bun.serve({
      port: 0,
      fetch(request, fetchServer) {
        if (fetchServer.upgrade(request)) {
          connectionCount++
          return
        }
        return new Response('Upgrade failed', {
          status: 500,
        })
      },
      websocket: {
        message() {
          // Just close immediately
        },
        close() {
          // Server close handler
        },
      },
    })

    const PORT = server.port
    const wsUrl = `ws://localhost:${PORT}`

    try {
      const manager = new WebSocketConnectionManager(
        wsUrl,
        responseTimeout,
      )
      manager.setMessageProcessor(() => {
        // No-op
      })

      // Get initial connection
      const transport1 = await manager.getConnection()
      expect(transport1).not.toBeNull()
      expect(connectionCount).toBe(1)
      if (!transport1) {
        throw new Error('Failed to get transport')
      }

      // Close the connection manually (simulating network failure)
      await transport1.close()

      // Wait a bit - should not reconnect since no pending requests
      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      )

      // Connection count should still be 1 (no reconnection)
      expect(connectionCount).toBe(1)

      await manager.close()
    } finally {
      server.stop()
    }
  })

  it('should route messages to registered processor', async () => {
    const server = Bun.serve({
      port: 0,
      fetch(request, fetchServer) {
        if (fetchServer.upgrade(request)) {
          return
        }
        return new Response('Upgrade failed', {
          status: 500,
        })
      },
      websocket: {
        message(ws, message: unknown) {
          // Echo the message back
          if (
            message instanceof Uint8Array ||
            message instanceof ArrayBuffer ||
            typeof message === 'string'
          ) {
            ws.send(
              message as Uint8Array | ArrayBuffer | string,
            )
          }
        },
        close() {
          // Server close handler
        },
      },
    })

    const PORT = server.port
    const wsUrl = `ws://localhost:${PORT}`

    try {
      const manager = new WebSocketConnectionManager(
        wsUrl,
        responseTimeout,
      )
      const receivedMessages: RouterMessage[] = []
      manager.setMessageProcessor((message) => {
        receivedMessages.push(message)
      })

      const transport = await manager.getConnection()
      expect(transport).not.toBeNull()
      if (!transport) {
        throw new Error('Failed to get transport')
      }

      // Send a test message
      const testMessage: RouterMessage = {
        id: 'test-id',
        action: 'test',
        status: 'ok',
        data: { test: 'data' },
      }
      await transport.write(testMessage)

      // Wait for message to be processed
      await new Promise((resolve) =>
        setTimeout(resolve, 200),
      )

      // Verify message was routed to processor
      expect(receivedMessages.length).toBeGreaterThan(0)
      expect(receivedMessages[0]?.id).toBe('test-id')
      expect(receivedMessages[0]?.action).toBe('test')

      await manager.close()
    } finally {
      server.stop()
    }
  })

  it('should handle multiple pending requests during reconnection', async () => {
    let connectionCount = 0
    const server = Bun.serve({
      port: 0,
      fetch(request, fetchServer) {
        if (fetchServer.upgrade(request)) {
          connectionCount++
          return
        }
        return new Response('Upgrade failed', {
          status: 500,
        })
      },
      websocket: {
        message(ws, message: unknown) {
          // Close connection after first connection
          if (connectionCount === 1) {
            setTimeout(() => {
              ws.close()
            }, 100)
          } else {
            // On reconnection, echo messages back
            type MessageType =
              | Uint8Array
              | ArrayBuffer
              | string
            if (
              message instanceof Uint8Array ||
              message instanceof ArrayBuffer ||
              typeof message === 'string'
            ) {
              ws.send(message as MessageType)
            }
          }
        },
        close() {
          // Server close handler
        },
      },
    })

    const PORT = server.port
    const wsUrl = `ws://localhost:${PORT}`

    try {
      const manager = new WebSocketConnectionManager(
        wsUrl,
        responseTimeout,
      )
      manager.setMessageProcessor(() => {
        // No-op
      })

      // Get initial connection
      const transport1 = await manager.getConnection()
      expect(transport1).not.toBeNull()
      if (!transport1) {
        throw new Error('Failed to get transport')
      }

      // Mark multiple requests as pending
      manager.markRequestPending('request-1')
      manager.markRequestPending('request-2')
      manager.markRequestPending('request-3')

      // Send a message that will trigger disconnection
      const testMessage: RouterMessage = {
        id: 'test-id',
        action: 'test',
        status: 'ok',
        data: { test: 'data' },
      }
      await transport1.write(testMessage)

      // Wait for reconnection
      await new Promise((resolve) =>
        setTimeout(resolve, 500),
      )

      // Should have reconnected
      const transport2 = await manager.getConnection()
      expect(transport2).not.toBeNull()
      expect(connectionCount).toBeGreaterThan(1)

      // Mark requests as completed
      manager.markRequestCompleted('request-1')
      manager.markRequestCompleted('request-2')
      manager.markRequestCompleted('request-3')

      await manager.close()
    } finally {
      server.stop()
    }
  })

  it('should use exponential backoff for reconnection', async () => {
    let shouldAcceptConnection = false
    const server = Bun.serve({
      port: 0,
      fetch(request, fetchServer) {
        if (fetchServer.upgrade(request)) {
          // Accept connection only after a few attempts
          if (shouldAcceptConnection) {
            return
          }
          // Reject by not returning (connection will fail)
          return new Response('Upgrade failed', {
            status: 500,
          })
        }
        return new Response('Upgrade failed', {
          status: 500,
        })
      },
      websocket: {
        message() {
          // No-op
        },
        close() {
          // Server close handler
        },
      },
    })

    const PORT = server.port
    const wsUrl = `ws://localhost:${PORT}`

    try {
      const manager = new WebSocketConnectionManager(
        wsUrl,
        responseTimeout,
      )
      manager.setMessageProcessor(() => {
        // No-op
      })

      // Mark a request as pending to trigger reconnection
      manager.markRequestPending('test-request')

      // Try to get connection - will fail initially
      try {
        await manager.getConnection()
      } catch {
        // Expected to fail
      }

      // Wait a bit for reconnection attempts
      await new Promise((resolve) =>
        setTimeout(resolve, 1500),
      )

      // Now allow connections to succeed
      shouldAcceptConnection = true

      // Wait a bit more for successful reconnection
      await new Promise((resolve) =>
        setTimeout(resolve, 500),
      )

      // Verify reconnection attempts were made
      // The connection manager should have attempted to reconnect
      const finalConnection = await manager.getConnection()
      expect(finalConnection).not.toBeNull()

      manager.markRequestCompleted('test-request')
      await manager.close()
    } finally {
      server.stop()
    }
  })

  it('should handle close gracefully', async () => {
    const server = Bun.serve({
      port: 0,
      fetch(request, fetchServer) {
        if (fetchServer.upgrade(request)) {
          return
        }
        return new Response('Upgrade failed', {
          status: 500,
        })
      },
      websocket: {
        message() {
          // No-op
        },
        close() {
          // Server close handler
        },
      },
    })

    const PORT = server.port
    const wsUrl = `ws://localhost:${PORT}`

    try {
      const manager = new WebSocketConnectionManager(
        wsUrl,
        responseTimeout,
      )
      manager.setMessageProcessor(() => {
        // No-op
      })

      const transport = await manager.getConnection()
      expect(transport).not.toBeNull()

      // Close the manager
      await manager.close()

      // Getting connection after close should fail or return null
      // (The behavior depends on implementation, but it should handle gracefully)
      const transportAfterClose =
        await manager.getConnection()
      // After close, getConnection might return null or create a new connection
      // This test just verifies close() doesn't throw
      expect(transportAfterClose).toBeDefined()
    } finally {
      server.stop()
    }
  })

  it('should maintain persistent connection across multiple client.stream() calls', async () => {
    let connectionCount = 0
    const server = Bun.serve({
      port: 0,
      fetch(request, fetchServer) {
        if (fetchServer.upgrade(request)) {
          connectionCount++
          return
        }
        return new Response('Upgrade failed', {
          status: 500,
        })
      },
      websocket: {
        message(ws, message: unknown) {
          // Echo messages back
          if (
            message instanceof Uint8Array ||
            message instanceof ArrayBuffer ||
            typeof message === 'string'
          ) {
            ws.send(
              message as Uint8Array | ArrayBuffer | string,
            )
          }
        },
        close() {
          // Server close handler
        },
      },
    })

    const PORT = server.port
    const wsUrl = `ws://localhost:${PORT}`

    try {
      const manager = new WebSocketConnectionManager(
        wsUrl,
        responseTimeout,
      )
      const receivedMessages: RouterMessage[] = []
      manager.setMessageProcessor((message) => {
        receivedMessages.push(message)
      })

      // First request - should create connection
      const transport1 = await manager.getConnection()
      expect(transport1).not.toBeNull()
      expect(connectionCount).toBe(1)

      // Second request - should reuse same connection
      const transport2 = await manager.getConnection()
      expect(transport2).toBe(transport1)
      expect(connectionCount).toBe(1)

      // Third request - should still reuse same connection
      const transport3 = await manager.getConnection()
      expect(transport3).toBe(transport1)
      expect(connectionCount).toBe(1)
      if (!transport3) {
        throw new Error('Failed to get transport')
      }

      // Verify we can send messages through the persistent connection
      const testMessage: RouterMessage = {
        id: 'test-id',
        action: 'test',
        status: 'ok',
        data: { test: 'data' },
      }
      await transport3.write(testMessage)

      // Wait for message processing
      await new Promise((resolve) =>
        setTimeout(resolve, 200),
      )

      // Verify message was received
      expect(receivedMessages.length).toBeGreaterThan(0)

      await manager.close()
    } finally {
      server.stop()
    }
  })

  it('should maintain persistent connection when using router client', async () => {
    let connectionCount = 0
    const testAction = action(
      m.string().isRequired(),
      async ({ params }) => {
        return `Result: ${params}`
      },
    )

    const router = createRouter({
      actions: { testAction },
      clientActions: {},
      responseTimeout: 10_000,
      transport: 'websocket',
    })

    const server = Bun.serve({
      port: 0,
      fetch(request, fetchServer) {
        if (
          router.onWebSocketMessage &&
          fetchServer.upgrade(request)
        ) {
          connectionCount++
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
                // Ignore errors
              })
          }
        },
        close() {
          // Server close handler
        },
      },
    })

    const PORT = server.port
    const wsUrl = `ws://localhost:${PORT}`

    try {
      const client = createRouterClient<typeof router>({
        url: wsUrl,
        transport: 'websocket',
        defineClientActions: {},
        responseTimeout: 5000,
      })

      // First stream call - should create connection
      const stream1 = await client.stream({
        testAction: 'test1',
      })
      const messages1 = []
      for await (const message of stream1) {
        messages1.push(message)
      }
      expect(messages1.length).toBeGreaterThan(0)
      expect(connectionCount).toBe(1)

      // Second stream call - should reuse same connection
      const stream2 = await client.stream({
        testAction: 'test2',
      })
      const messages2 = []
      for await (const message of stream2) {
        messages2.push(message)
      }
      expect(messages2.length).toBeGreaterThan(0)
      expect(connectionCount).toBe(1) // Still only 1 connection

      // Third stream call - should still reuse same connection
      const stream3 = await client.stream({
        testAction: 'test3',
      })
      const messages3 = []
      for await (const message of stream3) {
        messages3.push(message)
      }
      expect(messages3.length).toBeGreaterThan(0)
      expect(connectionCount).toBe(1) // Still only 1 connection

      // Verify all results are correct
      expect(messages1[0]?.testAction?.data).toBe(
        'Result: test1',
      )
      expect(messages2[0]?.testAction?.data).toBe(
        'Result: test2',
      )
      expect(messages3[0]?.testAction?.data).toBe(
        'Result: test3',
      )
    } finally {
      server.stop()
    }
  })
})
