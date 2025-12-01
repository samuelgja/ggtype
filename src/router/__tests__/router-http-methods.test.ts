import { object } from '../../model/object'
import { string } from '../../model/string'
import { action } from '../../action/action'
import { createRouter } from '../router'
import { createRouterClient } from '../router-client'

describe('router with http transport - HTTP methods', () => {
  const userModel = object({
    id: string(),
    name: string(),
  }).isOptional()

  const getUser = action(userModel, ({ params }) => {
    return {
      id: params.id,
      name: params.name,
      method: 'get',
    }
  })

  const createUser = action(userModel, ({ params }) => {
    return {
      id: params.id,
      name: params.name,
      method: 'post',
    }
  })

  const updateUser = action(userModel, ({ params }) => {
    return {
      id: params.id,
      name: params.name,
      method: 'put',
    }
  })

  const patchUser = action(userModel, ({ params }) => {
    return {
      id: params.id,
      name: params.name,
      method: 'patch',
    }
  })

  const deleteUser = action(userModel, ({ params }) => {
    return {
      id: params.id,
      name: params.name,
      method: 'delete',
    }
  })

  const router = createRouter({
    serverActions: {
      getUser,
      createUser,
      updateUser,
      patchUser,
      deleteUser,
    },
    clientActions: {},
  })
  type Router = typeof router

  const server = Bun.serve({
    port: 0,
    reusePort: true,
    async fetch(request) {
      return router.onRequest({
        request,
        ctx: {},
      })
    },
  })

  const PORT = server.port

  afterAll(() => {
    server.stop()
  })

  describe('GET method (default for HTTP transport)', () => {
    it('should work with GET method using default', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        defineClientActions: {},
      })

      const result = await client.fetch({
        getUser: { id: '1', name: 'John' },
      })

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '1',
        name: 'John',
        method: 'get',
      })
    })

    it('should work with GET method explicitly specified', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        defineClientActions: {},
      })

      const result = await client.fetch(
        {
          getUser: { id: '2', name: 'Jane' },
        },
        { method: 'GET' },
      )

      expect(result.getUser?.status).toBe('ok')
      expect(result.getUser?.data).toEqual({
        id: '2',
        name: 'Jane',
        method: 'get',
      })
    })

    it('should work with GET method in stream', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        defineClientActions: {},
      })

      const stream = await client.stream(
        {
          getUser: { id: '3', name: 'Bob' },
        },
        { method: 'GET' },
      )

      const results: unknown[] = []
      for await (const result of stream) {
        results.push(result)
      }

      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        getUser: {
          data: { id: '3', name: 'Bob', method: 'get' },
          status: 'ok',
        },
      })
    })
  })

  describe('POST method', () => {
    it('should work with POST method', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        defineClientActions: {},
      })

      const result = await client.fetch(
        {
          createUser: { id: '4', name: 'Alice' },
        },
        { method: 'POST' },
      )

      expect(result.createUser?.status).toBe('ok')
      expect(result.createUser?.data).toEqual({
        id: '4',
        name: 'Alice',
        method: 'post',
      })
    })

    it('should work with POST method in stream', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        defineClientActions: {},
      })

      const stream = await client.stream(
        {
          createUser: { id: '5', name: 'Charlie' },
        },
        { method: 'POST' },
      )

      const results: unknown[] = []
      for await (const result of stream) {
        results.push(result)
      }

      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        createUser: {
          data: {
            id: '5',
            name: 'Charlie',
            method: 'post',
          },
          status: 'ok',
        },
      })
    })
  })

  describe('PUT method', () => {
    it('should work with PUT method', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        defineClientActions: {},
      })

      const result = await client.fetch(
        {
          updateUser: { id: '6', name: 'David' },
        },
        { method: 'PUT' },
      )

      expect(result.updateUser?.status).toBe('ok')
      expect(result.updateUser?.data).toEqual({
        id: '6',
        name: 'David',
        method: 'put',
      })
    })

    it('should work with PUT method in stream', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        defineClientActions: {},
      })

      const stream = await client.stream(
        {
          updateUser: { id: '7', name: 'Eve' },
        },
        { method: 'PUT' },
      )

      const results: unknown[] = []
      for await (const result of stream) {
        results.push(result)
      }

      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        updateUser: {
          data: { id: '7', name: 'Eve', method: 'put' },
          status: 'ok',
        },
      })
    })
  })

  describe('PATCH method', () => {
    it('should work with PATCH method', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        defineClientActions: {},
      })

      const result = await client.fetch(
        {
          patchUser: { id: '8', name: 'Frank' },
        },
        { method: 'PATCH' },
      )

      expect(result.patchUser?.status).toBe('ok')
      expect(result.patchUser?.data).toEqual({
        id: '8',
        name: 'Frank',
        method: 'patch',
      })
    })

    it('should work with PATCH method in stream', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        defineClientActions: {},
      })

      const stream = await client.stream(
        {
          patchUser: { id: '9', name: 'Grace' },
        },
        { method: 'PATCH' },
      )

      const results: unknown[] = []
      for await (const result of stream) {
        results.push(result)
      }

      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        patchUser: {
          data: { id: '9', name: 'Grace', method: 'patch' },
          status: 'ok',
        },
      })
    })
  })

  describe('DELETE method', () => {
    it('should work with DELETE method', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        defineClientActions: {},
      })

      const result = await client.fetch(
        {
          deleteUser: { id: '10', name: 'Henry' },
        },
        { method: 'DELETE' },
      )

      expect(result.deleteUser?.status).toBe('ok')
      expect(result.deleteUser?.data).toEqual({
        id: '10',
        name: 'Henry',
        method: 'delete',
      })
    })

    it('should work with DELETE method in stream', async () => {
      const client = createRouterClient<Router>({
        url: `http://localhost:${PORT}`,
        transport: 'http',
        defineClientActions: {},
      })

      const stream = await client.stream(
        {
          deleteUser: { id: '11', name: 'Ivy' },
        },
        { method: 'DELETE' },
      )

      const results: unknown[] = []
      for await (const result of stream) {
        results.push(result)
      }

      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        deleteUser: {
          data: { id: '11', name: 'Ivy', method: 'delete' },
          status: 'ok',
        },
      })
    })
  })

  describe('stream transport with methods', () => {
    it('should default to POST for stream transport', async () => {
      const streamRouter = createRouter({
        serverActions: {
          createUser,
        },
        clientActions: {},
      })
      type StreamRouter = typeof streamRouter

      const streamServer = Bun.serve({
        port: 0,
        reusePort: true,
        async fetch(request) {
          return streamRouter.onStream({
            request,
            ctx: {},
          })
        },
      })

      const STREAM_PORT = streamServer.port

      try {
        const client = createRouterClient<StreamRouter>({
          url: `http://localhost:${STREAM_PORT}`,
          transport: 'stream',
          defineClientActions: {},
        })

        const stream = await client.stream({
          createUser: { id: '12', name: 'Jack' },
        })

        const results: unknown[] = []
        for await (const result of stream) {
          results.push(result)
        }

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual({
          createUser: {
            data: {
              id: '12',
              name: 'Jack',
              method: 'post',
            },
            status: 'ok',
          },
        })
      } finally {
        streamServer.stop()
      }
    })

    it('should allow PUT method for stream transport', async () => {
      const streamRouter = createRouter({
        serverActions: {
          updateUser,
        },
        clientActions: {},
      })
      type StreamRouter = typeof streamRouter

      const streamServer = Bun.serve({
        port: 0,
        reusePort: true,
        async fetch(request) {
          return streamRouter.onStream({
            request,
            ctx: {},
          })
        },
      })

      const STREAM_PORT = streamServer.port

      try {
        const client = createRouterClient<StreamRouter>({
          url: `http://localhost:${STREAM_PORT}`,
          transport: 'stream',
          defineClientActions: {},
        })

        const stream = await client.stream(
          {
            updateUser: { id: '13', name: 'Kate' },
          },
          { method: 'PUT' },
        )

        const results: unknown[] = []
        try {
          for await (const result of stream) {
            results.push(result)
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

        expect(results.length).toBeGreaterThan(0)
        const updateResult = results.find(
          (r) =>
            (r as Record<string, unknown>)['updateUser'],
        )
        expect(updateResult).toBeDefined()
        expect(
          (updateResult as Record<string, unknown>)[
            'updateUser'
          ],
        ).toEqual({
          data: { id: '13', name: 'Kate', method: 'put' },
          status: 'ok',
        })
      } finally {
        streamServer.stop()
      }
    })
  })
})
