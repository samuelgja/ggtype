/* eslint-disable sonarjs/no-nested-functions */
import { action, m, type TransportType } from '../..'
import { defineClientActionsSchema } from '../handle-client-actions'
import { createRouter } from '../router'
import { createRouterClient } from '../router-client'

describe('router file upload', () => {
  // Note: HTTP transport doesn't support file uploads because it uses JSON.stringify
  // which cannot serialize File objects. Only 'stream' and 'websocket' transports support files.
  const transports: TransportType[] = [
    'stream',
    'websocket',
  ]

  // Note: HTTP transport uses JSON.stringify which converts File objects to {}
  // This means files cannot be properly transmitted via HTTP transport.
  // Only 'stream' and 'websocket' transports properly support binary file uploads.

  for (const transport of transports) {
    describe(`transport: ${transport}`, () => {
      const timeout = 100
      const serverTimeout = timeout * 2 + 10

      const clientActions = defineClientActionsSchema({
        useFile: {
          params: m.file(),
          return: m.file(),
        },
      })
      type ClientActions = typeof clientActions

      // Simple file action that just returns the file
      const fileAction = action(
        m.file(),
        async ({ params }) => {
          expect(params).toBeInstanceOf(File)
          return params
        },
      )

      // File action that uses client action
      const fileActionWithClientAction = action(
        m.file(),
        // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
        async ({ params, clientActions }) => {
          expect(params).toBeInstanceOf(File)
          const { useFile } = clientActions<ClientActions>()
          const toolFile = await useFile?.(params)
          expect(toolFile?.data).toBeInstanceOf(File)
          return toolFile?.data
        },
      )

      // Streaming file action
      const fileStreamAction = action(
        m.file(),
        // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
        async function* ({ params, clientActions }) {
          expect(params).toBeInstanceOf(File)
          const { useFile } = clientActions<ClientActions>()
          const toolFile = await useFile?.(params)
          expect(toolFile?.data).toBeInstanceOf(File)
          yield toolFile?.data
          yield 'FINISHED'
        },
      )

      const router = createRouter({
        serverActions: {
          fileAction,
          fileActionWithClientAction,
          fileStreamAction,
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

      afterAll(() => {
        if (server) {
          server.stop()
        }
      })

      describe('client.fetch() with file upload', () => {
        it('should send file and receive file back', async () => {
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            defineClientActions: {
              useFile: async (file) => file,
            },
            responseTimeout: timeout,
          })

          const testFile = new File(
            ['test content'],
            'test.txt',
            { type: 'text/plain' },
          )
          const result = await client.fetch({
            fileAction: testFile,
          })

          expect(result.fileAction?.status).toBe('ok')
          expect(result.fileAction?.data).toBeInstanceOf(
            File,
          )
          expect(
            await (result.fileAction?.data as File).text(),
          ).toBe('test content')
        })

        it('should send file with client action and receive file back', async () => {
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            defineClientActions: {
              useFile: async (file) => {
                await new Promise((resolve) =>
                  setTimeout(resolve, timeout / 2),
                )
                return file
              },
            },
            responseTimeout: timeout,
          })

          const testFile = new File(
            ['test content with client action'],
            'test.txt',
            { type: 'text/plain' },
          )
          const result = await client.fetch({
            fileActionWithClientAction: testFile,
          })

          expect(
            result.fileActionWithClientAction?.status,
          ).toBe('ok')
          expect(
            result.fileActionWithClientAction?.data,
          ).toBeInstanceOf(File)
          expect(
            await (
              result.fileActionWithClientAction
                ?.data as File
            ).text(),
          ).toBe('test content with client action')
        })

        it('should handle large file uploads', async () => {
          const largeContent = 'x'.repeat(100_000) // 100KB file
          const largeFile = new File(
            [largeContent],
            'large.txt',
            { type: 'text/plain' },
          )

          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            defineClientActions: {
              useFile: async (file) => file,
            },
            responseTimeout: timeout * 5, // Longer timeout for large files
          })

          const result = await client.fetch({
            fileAction: largeFile,
          })

          expect(result.fileAction?.status).toBe('ok')
          expect(result.fileAction?.data).toBeInstanceOf(
            File,
          )
          expect(
            (result.fileAction?.data as File).size,
          ).toBe(largeFile.size)
          expect(
            await (result.fileAction?.data as File).text(),
          ).toBe(largeContent)
        })

        it('should handle binary file uploads', async () => {
          const binaryContent = new Uint8Array([
            0, 1, 2, 3, 255, 254, 253, 252,
          ])
          const binaryFile = new File(
            [binaryContent],
            'binary.bin',
            { type: 'application/octet-stream' },
          )

          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            defineClientActions: {
              useFile: async (file) => file,
            },
            responseTimeout: timeout,
          })

          const result = await client.fetch({
            fileAction: binaryFile,
          })

          expect(result.fileAction?.status).toBe('ok')
          expect(result.fileAction?.data).toBeInstanceOf(
            File,
          )
          const receivedArrayBuffer = await (
            result.fileAction?.data as File
          ).arrayBuffer()
          const receivedBytes = new Uint8Array(
            receivedArrayBuffer,
          )
          expect(receivedBytes).toEqual(binaryContent)
        })
      })

      describe('client.stream() with file upload', () => {
        it('should send file and receive file back via stream', async () => {
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            defineClientActions: {
              useFile: async (file) => file,
            },
            responseTimeout: timeout,
          })

          const testFile = new File(
            ['test content stream'],
            'test.txt',
            { type: 'text/plain' },
          )
          const result = await client.stream({
            fileAction: testFile,
          })

          const messages = []
          try {
            for await (const message of result) {
              messages.push(message)
            }
          } catch (error) {
            // Ignore stream closing errors - they can happen due to timing/race conditions
            if (error instanceof Error) {
              const errorMessage = error.message
              const isStreamClosingError =
                errorMessage.includes('closing') ||
                errorMessage.includes('closed') ||
                errorMessage.includes('stream is closing')
              if (!isStreamClosingError) {
                throw error
              }
            } else {
              throw error
            }
          }

          expect(messages.length).toBeGreaterThan(0)
          const fileResult = messages.find(
            (message) => message.fileAction,
          )
          expect(
            fileResult?.fileAction?.data,
          ).toBeInstanceOf(File)
          expect(
            await (
              fileResult?.fileAction?.data as File
            ).text(),
          ).toBe('test content stream')
        })

        it('should send file with client action and receive file back via stream', async () => {
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            defineClientActions: {
              useFile: async (file) => {
                await new Promise((resolve) =>
                  setTimeout(resolve, timeout / 2),
                )
                return file
              },
            },
            responseTimeout: timeout,
          })

          const testFile = new File(
            ['test content stream with client action'],
            'test.txt',
            { type: 'text/plain' },
          )
          const result = await client.stream({
            fileActionWithClientAction: testFile,
          })

          const messages = []
          try {
            for await (const message of result) {
              messages.push(message)
            }
          } catch (error) {
            // Ignore stream closing errors
            if (error instanceof Error) {
              const errorMessage = error.message
              const isStreamClosingError =
                errorMessage.includes('closing') ||
                errorMessage.includes('closed') ||
                errorMessage.includes('stream is closing')
              if (!isStreamClosingError) {
                throw error
              }
            } else {
              throw error
            }
          }

          expect(messages.length).toBeGreaterThan(0)
          const fileResult = messages.find(
            (message) => message.fileActionWithClientAction,
          )
          expect(
            fileResult?.fileActionWithClientAction?.data,
          ).toBeInstanceOf(File)
          expect(
            await (
              fileResult?.fileActionWithClientAction
                ?.data as File
            ).text(),
          ).toBe('test content stream with client action')
        })

        it('should handle streaming file action', async () => {
          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            defineClientActions: {
              useFile: async (file) => {
                await new Promise((resolve) =>
                  setTimeout(resolve, timeout / 2),
                )
                return file
              },
            },
            responseTimeout: timeout,
          })

          const testFile = new File(
            ['test content for streaming'],
            'test.txt',
            { type: 'text/plain' },
          )
          const result = await client.stream({
            fileStreamAction: testFile,
          })

          const messages = []
          try {
            for await (const message of result) {
              messages.push(message)
              if (messages.length > 10) {
                break
              }
            }
          } catch (error) {
            // Ignore stream closing errors
            if (error instanceof Error) {
              const errorMessage = error.message
              const isStreamClosingError =
                errorMessage.includes('closing') ||
                errorMessage.includes('closed') ||
                errorMessage.includes('stream is closing')
              if (!isStreamClosingError) {
                throw error
              }
            } else {
              throw error
            }
          }

          expect(messages.length).toBeGreaterThan(0)
          const fileResults = messages.filter(
            (message) => message.fileStreamAction,
          )
          expect(fileResults.length).toBeGreaterThan(0)
          const lastMessage = fileResults.at(-1)
          expect(lastMessage?.fileStreamAction?.data).toBe(
            'FINISHED',
          )
        })

        it('should handle large file uploads via stream', async () => {
          const largeContent = 'y'.repeat(100_000) // 100KB file
          const largeFile = new File(
            [largeContent],
            'large.txt',
            { type: 'text/plain' },
          )

          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            defineClientActions: {
              useFile: async (file) => file,
            },
            responseTimeout: timeout * 5, // Longer timeout for large files
          })

          const result = await client.stream({
            fileAction: largeFile,
          })

          const messages = []
          try {
            for await (const message of result) {
              messages.push(message)
            }
          } catch (error) {
            // Ignore stream closing errors
            if (error instanceof Error) {
              const errorMessage = error.message
              const isStreamClosingError =
                errorMessage.includes('closing') ||
                errorMessage.includes('closed') ||
                errorMessage.includes('stream is closing')
              if (!isStreamClosingError) {
                throw error
              }
            } else {
              throw error
            }
          }

          expect(messages.length).toBeGreaterThan(0)
          const fileResult = messages.find(
            (message) => message.fileAction,
          )
          expect(
            fileResult?.fileAction?.data,
          ).toBeInstanceOf(File)
          expect(
            (fileResult?.fileAction?.data as File).size,
          ).toBe(largeFile.size)
          expect(
            await (
              fileResult?.fileAction?.data as File
            ).text(),
          ).toBe(largeContent)
        })

        it('should handle binary file uploads via stream', async () => {
          const binaryContent = new Uint8Array([
            10, 20, 30, 40, 250, 240, 230, 220,
          ])
          const binaryFile = new File(
            [binaryContent],
            'binary.bin',
            { type: 'application/octet-stream' },
          )

          const client = createRouterClient<Router>({
            ...(transport === 'stream'
              ? { streamURL: `http://localhost:${PORT}` }
              : { websocketURL: `ws://localhost:${PORT}` }),
            defineClientActions: {
              useFile: async (file) => file,
            },
            responseTimeout: timeout,
          })

          const result = await client.stream({
            fileAction: binaryFile,
          })

          const messages = []
          try {
            for await (const message of result) {
              messages.push(message)
            }
          } catch (error) {
            // Ignore stream closing errors
            if (error instanceof Error) {
              const errorMessage = error.message
              const isStreamClosingError =
                errorMessage.includes('closing') ||
                errorMessage.includes('closed') ||
                errorMessage.includes('stream is closing')
              if (!isStreamClosingError) {
                throw error
              }
            } else {
              throw error
            }
          }

          expect(messages.length).toBeGreaterThan(0)
          const fileResult = messages.find(
            (message) => message.fileAction,
          )
          expect(
            fileResult?.fileAction?.data,
          ).toBeInstanceOf(File)
          const receivedArrayBuffer = await (
            fileResult?.fileAction?.data as File
          ).arrayBuffer()
          const receivedBytes = new Uint8Array(
            receivedArrayBuffer,
          )
          expect(receivedBytes).toEqual(binaryContent)
        })
      })
    })
  }
})
