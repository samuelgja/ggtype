import { WebSocketTransport } from '../websocket-transport'
import type { RouterMessage } from '../../router/router-message'

describe('WebSocketTransport', () => {
  it('should send and receive messages', async () => {
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
        close(ws) {
          ws.close()
        },
      },
    })

    const PORT = server.port

    try {
      const ws = new WebSocket(`ws://localhost:${PORT}`)
      ws.binaryType = 'arraybuffer'
      const transport = new WebSocketTransport(ws)

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        if (ws.readyState === WebSocket.OPEN) {
          resolve()
          return
        }
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 1000)

        ws.addEventListener('open', () => {
          clearTimeout(timeout)
          resolve()
        })

        ws.addEventListener('error', (error) => {
          clearTimeout(timeout)
          reject(
            new Error('Connection error', { cause: error }),
          )
        })
      })

      // Send a test message
      const testMessage: RouterMessage = {
        id: 'test-id',
        action: 'test',
        status: 'ok',
        data: { test: 'data' },
      }

      await transport.write(testMessage)

      // Read the echoed message
      const received = await transport.read()

      expect(received).not.toBeNull()
      expect(received?.id).toBe('test-id')
      expect(received?.action).toBe('test')
      expect(received?.data).toEqual({ test: 'data' })

      await transport.close()
    } finally {
      server.stop()
    }
  })

  it('should handle binary messages with files', async () => {
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
        close(ws) {
          ws.close()
        },
      },
    })

    const PORT = server.port

    try {
      const ws = new WebSocket(`ws://localhost:${PORT}`)
      ws.binaryType = 'arraybuffer'
      const transport = new WebSocketTransport(ws)

      await new Promise<void>((resolve, reject) => {
        if (ws.readyState === WebSocket.OPEN) {
          resolve()
          return
        }
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 1000)

        ws.addEventListener('open', () => {
          clearTimeout(timeout)
          resolve()
        })

        ws.addEventListener('error', (error) => {
          clearTimeout(timeout)
          reject(
            new Error('Connection error', { cause: error }),
          )
        })
      })

      const testFile = new File(
        ['test content'],
        'test.txt',
      )
      const testMessage: RouterMessage = {
        id: 'file-id',
        action: 'file',
        status: 'ok',
        data: testFile,
      }

      await transport.write(testMessage)

      const received = await transport.read()

      expect(received).not.toBeNull()
      expect(received?.id).toBe('file-id')
      expect(received?.data).toBeInstanceOf(File)
      expect(await (received?.data as File).text()).toBe(
        'test content',
      )

      await transport.close()
    } finally {
      server.stop()
    }
  })
})
