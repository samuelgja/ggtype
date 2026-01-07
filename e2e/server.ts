/* eslint-disable unicorn/no-process-exit */
import type { ServerWebSocket } from 'bun'
import {
  createRouter,
  action,
  m,
  defineClientActionsSchema,
  ErrorWithCode,
} from '../src'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

export const PORT = 3000

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// Define client actions schema
const clientActionsSchema = defineClientActionsSchema({
  // Client action that returns a file
  getClientFile: {
    params: m.object({ fileName: m.string() }),
    return: m.file(),
  },
  // Client action that receives a file
  receiveClientFile: {
    params: m.file(),
    return: m.object({
      received: m.boolean(),
      fileName: m.string(),
    }),
  },
  // Client action that processes data
  processData: {
    params: m.object({ data: m.string() }),
    return: m.object({
      processed: m.boolean(),
      data: m.string(),
    }),
  },
  // Client action that returns user info
  getUserInfo: {
    params: m.object({ id: m.string() }),
    return: m.object({
      id: m.string(),
      name: m.string(),
    }),
  },
})

type ClientActions = typeof clientActionsSchema

// Router with actions designed for concurrency and isolation testing
export const router = createRouter({
  clientActions: clientActionsSchema,
  serverActions: {
    // Returns user data with provided ID - critical for isolation testing
    getUserWithId: action(
      m.object({
        clientId: m.string(),
        requestId: m.number(),
      }),
      async ({ params }) => {
        // Simulate some processing time
        // await delay(1)
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

    // Server action that receives files
    uploadFile: action(
      m.object({
        fileName: m.string(),
      }),
      async ({ params, files }) => {
        if (!files || files.size === 0) {
          throw new Error('No file received')
        }
        // Files are stored by their upload ID, get the first one
        const file = files.values().next().value
        if (!file) {
          throw new Error('No file received')
        }
        return {
          fileName: params.fileName,
          receivedFileName: file.name,
          fileSize: file.size,
          success: true,
        }
      },
    ),

    // Server action that returns a file
    getFile: action(
      m.object({
        fileName: m.string(),
        content: m.string().isOptional(),
      }),
      async ({ params }) => {
        const content = params.content ?? 'default content'
        return new File([content], params.fileName, {
          type: 'text/plain',
        })
      },
    ),

    // Server action that calls client action to get a file
    getFileFromClient: action(
      m.object({
        fileName: m.string(),
      }),
      async ({ params, clientActions }) => {
        const { getClientFile } =
          clientActions<ClientActions>()
        const result = await getClientFile({
          fileName: params.fileName,
        })

        if (result.status === 'error') {
          throw new Error(
            result.error?.message ??
              'Failed to get file from client',
          )
        }

        const file = result.data
        if (!file) {
          throw new Error('No file received from client')
        }

        const fileAsBlob = file as unknown
        if (
          !(fileAsBlob instanceof File) &&
          !(fileAsBlob instanceof Blob)
        ) {
          throw new TypeError(
            'Invalid file type received from client',
          )
        }

        const fileName =
          fileAsBlob instanceof File
            ? fileAsBlob.name
            : 'unknown'
        const fileSize = fileAsBlob.size

        return {
          fileName,
          fileSize,
          success: true,
        }
      },
    ),

    // Server action that sends a file to client action
    sendFileToClient: action(
      m.object({
        fileName: m.string(),
        content: m.string(),
      }),
      async ({ params, clientActions }) => {
        const file = new File(
          [params.content],
          params.fileName,
          {
            type: 'text/plain',
          },
        )

        // Pass the File directly to the client action
        // handleStreamResponse will handle File serialization
        const { receiveClientFile } =
          clientActions<ClientActions>()
        const result = await receiveClientFile(file)

        if (result.status === 'error') {
          throw new Error(
            result.error?.message ??
              'Failed to send file to client',
          )
        }

        return {
          fileName: params.fileName,
          fileSize: file.size,
          clientReceived: result.data?.received ?? false,
          success: true,
        }
      },
    ),

    // Server action that processes file and calls client action
    processFileWithClient: action(
      m.object({
        fileName: m.string(),
      }),
      async ({ params, files, clientActions }) => {
        if (!files || files.size === 0) {
          throw new Error('No file received')
        }
        // Files are stored by their upload ID, get the first one
        const file = files.values().next().value
        if (!file) {
          throw new Error('No file received')
        }

        const fileContent = await file.text()
        const { processData } =
          clientActions<ClientActions>()
        const result = await processData({
          data: fileContent,
        })

        if (result.status === 'error') {
          throw new Error(
            result.error?.message ??
              'Failed to process data with client',
          )
        }

        return {
          fileName: params.fileName,
          originalSize: file.size,
          processed: result.data?.processed ?? false,
          processedData: result.data?.data,
          success: true,
        }
      },
    ),

    // Server action that returns multiple files
    getMultipleFiles: action(
      m.object({
        count: m.number(),
      }),
      async ({ params }) => {
        const files: File[] = []
        for (let index = 0; index < params.count; index++) {
          files.push(
            new File(
              [`content-${index}`],
              `file-${index}.txt`,
              {
                type: 'text/plain',
              },
            ),
          )
        }
        return {
          files,
          count: files.length,
        }
      },
    ),

    // Server action that receives multiple files
    uploadMultipleFiles: action(
      m.object({
        description: m.string(),
      }),
      async ({ params, files }) => {
        if (!files || files.size === 0) {
          throw new Error('No files received')
        }

        const fileInfo = [...files.entries()].map(
          ([key, file]) => ({
            key,
            name: file.name,
            size: file.size,
          }),
        )

        return {
          description: params.description,
          fileCount: files.size,
          files: fileInfo,
          success: true,
        }
      },
    ),

    // Server action that calls client action to get user info
    getUserWithClientAction: action(
      m.object({
        id: m.string(),
      }),
      async ({ params, clientActions }) => {
        const { getUserInfo } =
          clientActions<ClientActions>()
        const result = await getUserInfo({
          id: params.id,
        })

        if (result.status === 'error') {
          throw new Error(
            result.error?.message ??
              'Failed to get user info from client',
          )
        }

        return {
          id: result.data?.id ?? 'unknown',
          name: result.data?.name ?? 'unknown',
          serverProcessed: true,
        }
      },
    ),

    // Server action that streams files
    getFileStream: action(
      m.object({
        count: m.number(),
        fileName: m.string(),
      }),
      async function* ({ params }) {
        for (let index = 0; index < params.count; index++) {
          yield new File(
            [`chunk-${index}`],
            `${params.fileName}-${index}.txt`,
            {
              type: 'text/plain',
            },
          )
        }
      },
    ),

    // Server action that receives file and returns file
    transformFile: action(
      m.object({
        transform: m.string(),
      }),
      async ({ params, files }) => {
        if (!files || files.size === 0) {
          throw new Error('No file received')
        }
        // Files are stored by their upload ID, get the first one
        const file = files.values().next().value
        if (!file) {
          throw new Error('No file received')
        }

        const content = await file.text()
        const transformedContent = `${params.transform}: ${content}`

        return new File(
          [transformedContent],
          `transformed-${file.name}`,
          {
            type: file.type,
          },
        )
      },
    ),
    // Protected action for auth testing
    getProtectedData: action(
      m.object({}),
      async ({ ctx }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context = (ctx as any) ?? {}
        const auth =
          context.auth ??
          context.request?.headers?.get('authorization')
        // eslint-disable-next-line security/detect-possible-timing-attacks
        if (auth !== 'valid-token') {
          // eslint-disable-next-line security/detect-possible-timing-attacks
          if (auth === 'expired-token') {
            throw new ErrorWithCode('Token expired', 401)
          }
          throw new ErrorWithCode('Unauthorized', 401)
        }
        return { secret: 'data' }
      },
    ),
  },
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
    const auth = request.headers.get('authorization')
    return router.onRequest({
      request,
      ctx: { auth },
      type: 'http',
    })
  })
  .post('/http', ({ request }) => {
    const auth = request.headers.get('authorization')
    return router.onRequest({
      request,
      ctx: { auth },
      type: 'http',
    })
  })
  .get('/stream', ({ request }) => {
    const auth = request.headers.get('authorization')
    return router.onRequest({
      request,
      ctx: { auth },
      type: 'stream',
    })
  })
  .post('/stream', ({ request }) => {
    const auth = request.headers.get('authorization')
    return router.onRequest({
      request,
      ctx: { auth },
      type: 'stream',
    })
  })
  .post('/duplex', ({ request }) => {
    const auth = request.headers.get('authorization')
    return router.onRequest({
      request,
      ctx: { auth },
      type: 'duplex',
    })
  })
  .ws('/ws', {
    message(ws, message) {
      if (router.onWebSocketMessage) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = ws.data as any
        const auth = data?.headers?.['authorization']
        router
          .onWebSocketMessage({
            ws: ws.raw as ServerWebSocket<unknown>,
            message: message as Uint8Array,
            ctx: { auth },
          })
          .catch(() => {
            // Handle errors
          })
      }
    },
    upgrade(request: unknown) {
      return {
        data: {
          url: (request as any).url, // eslint-disable-line @typescript-eslint/no-explicit-any
        },
      }
    },
  })
  .get('/close', () => {
    server.stop()
    if (server) {
      server.stop()
    }
    process.exit(0)
  })
  .listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`)
  })
