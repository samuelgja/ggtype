import { m } from '../..'
import { defineClientActionsSchema } from '../../../dist/cjs'
import { action } from '../../action/action'
import { createRouter } from '../router'
import { createRouterClient } from '../router.client'

describe('router', () => {
  const clientActions = defineClientActionsSchema({
    useUser: {
      params: m.object({ id: m.string() }),
      return: m.object({
        id: m.string(),
        value: m.string(),
      }),
    },
  })
  const router = createRouter({
    clientActions,
    serverActions: {
      getUserWithFiles: action(
        m.object({ id: m.string() }),
        async ({ params, files }) => {
          expect(files).toBeDefined()
          return { id: params.id }
        },
      ),
      getFile: action(m.object({ id: m.string() }), () => {
        return new File([], 'test.txt')
      }),
      getUser: action(
        m.object({ id: m.string() }),
        async ({ params }) => {
          return { id: params.id }
        },
      ),
      getUserStream: action(
        m.object({ id: m.string() }),
        async function* ({ params }) {
          yield { id: params.id }
          yield { id: params.id }
        },
      ),
    },
  })
  type Router = typeof router

  const httpServer = Bun.serve({
    port: 0,
    async fetch(request) {
      return router.onRequest({
        request,
        ctx: {},
        type: 'http',
      })
    },
  })
  const HTTP_PORT = httpServer.port

  const streamServer = Bun.serve({
    port: 1,
    async fetch(request) {
      return router.onRequest({
        request,
        ctx: {},
        type: 'stream',
      })
    },
  })
  const STREAM_PORT = streamServer.port

  const duplexServer = Bun.serve({
    port: 2,
    async fetch(request) {
      return router.onRequest({
        request,
        ctx: {},
        type: 'duplex',
      })
    },
  })
  const DUPLEX_PORT = duplexServer.port

  afterAll(() => {
    httpServer.stop()
    streamServer.stop()
    duplexServer.stop()
  })
  it('should fetch GET', async () => {
    const client = createRouterClient<Router>({
      httpURL: `http://localhost:${HTTP_PORT}`,
    })
    const result = await client.fetch(
      {
        getUser: { id: '1' },
      },
      { method: 'GET' },
    )
    expect(result).toEqual({
      getUser: {
        data: { id: '1' },
        status: 'ok',
      },
    })
  })
  it('should fetch POST', async () => {
    const client = createRouterClient<Router>({
      httpURL: `http://localhost:${HTTP_PORT}`,
    })
    const result = await client.fetch(
      {
        getUser: { id: '1' },
      },
      { method: 'POST' },
    )
    expect(result).toEqual({
      getUser: {
        data: { id: '1' },
        status: 'ok',
      },
    })
  })

  it('should fetch with file POST', async () => {
    const content = 'test content'
    const file = new File([content], 'test.txt')
    const client = createRouterClient<Router>({
      httpURL: `http://localhost:${HTTP_PORT}`,
    })
    const result = await client.fetch(
      {
        getUserWithFiles: { id: '1' },
      },
      { method: 'POST', files: [file] },
    )
    expect(result).toEqual({
      getUserWithFiles: {
        data: { id: '1' },
        status: 'ok',
      },
    })
  })
  it('should fetch with stream POST', async () => {
    const client = createRouterClient<Router>({
      httpURL: `http://localhost:${HTTP_PORT}`,
    })
    const result = await client.fetch(
      { getUserStream: { id: '1' } },
      { method: 'POST' },
    )
    expect(result).toEqual({
      getUserStream: {
        status: 'error',
        error: {
          type: 'generic',
          message:
            'Stream results are not supported for HTTP transport',
          code: 400,
        },
      },
    })
  })
  it('should stream GET', async () => {
    const client = createRouterClient<Router>({
      httpURL: `http://localhost:${STREAM_PORT}`,
    })
    const result = client.stream({
      getUserStream: { id: '1' },
    })
    const results: unknown[] = []
    for await (const item of result) {
      results.push(item)
    }
    expect(results).toEqual([
      {
        getUserStream: {
          data: { id: '1' },
          status: 'ok',
        },
      },
      {
        getUserStream: {
          data: { id: '1' },
          status: 'ok',
        },
      },
    ])
  })
  it('should stream GET with file', async () => {
    const client = createRouterClient<Router>({
      streamURL: `http://localhost:${STREAM_PORT}`,
    })
    const result = client.stream({
      getFile: { id: '1' },
    })
    const results: unknown[] = []
    for await (const item of result) {
      results.push(item)
    }
    expect(results).toEqual([
      {
        getFile: {
          data: new File([], 'test.txt'),
          status: 'ok',
        },
      },
    ])
  })

  it('should upload file with stream POST', async () => {
    const client = createRouterClient<Router>({
      streamURL: `http://localhost:${STREAM_PORT}`,
      defineClientActions: {
        useUser: async (value) => {
          return { id: value.id, value: 'test' }
        },
      },
    })
    const result = client.stream(
      {
        getUserWithFiles: { id: '1' },
      },
      {
        files: [new File([], 'test.txt')],
        method: 'POST',
      },
    )

    const results: unknown[] = []
    for await (const item of result) {
      results.push(item)
    }
    expect(results).toEqual([
      {
        getUserWithFiles: {
          data: { id: '1' },
          status: 'ok',
        },
      },
    ])
  })

  it('should upload file with duplex POST', async () => {
    const client = createRouterClient<Router>({
      halfDuplexUrl: `http://localhost:${DUPLEX_PORT}`,
      defineClientActions: {
        useUser: async (value) => {
          return { id: value.id, value: 'test' }
        },
      },
    })
    const result = client.duplex({
      getUserWithFiles: { id: '1' },
    })
    const results: unknown[] = []
    for await (const item of result) {
      results.push(item)
    }
    expect(results).toEqual([
      {
        getUserWithFiles: {
          data: { id: '1' },
          status: 'ok',
        },
      },
    ])
  })
})
