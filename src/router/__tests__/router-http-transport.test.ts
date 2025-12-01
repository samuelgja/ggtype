import { object } from '../../model/object'
import { string } from '../../model/string'
import { ErrorWithCode } from '../../utils/errors'
import { action, getCtx } from '../../action/action'
import { createRouter } from '../router'
import { createRouterClient } from '../router-client'

describe('router with http transport', () => {
  it('should parse router simple', async () => {
    const userModel = object({
      id: string(),
      createdAt: string(),
    }).isOptional()

    const someAction1 = action(userModel, ({ params }) => {
      return params.createdAt
    })
    const someAction2 = action(userModel, ({ params }) => {
      return params.createdAt
    })
    const someAction3 = action(userModel, () => {
      throw new Error('Some error')
    })

    const router = createRouter({
      serverActions: {
        someAction1,
        someAction2,
        someAction3,
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

    const client = createRouterClient<Router>({
      url: `http://localhost:${PORT}`,
      transport: 'http',
      defineClientActions: {},
    })

    const stream = await client.stream({
      someAction1: { createdAt: '2021-01-01', id: '1' },
      someAction2: {
        createdAt: '2021-01-01',
      } as unknown as { id: string; createdAt: string },
      someAction3: { createdAt: '2021-01-01', id: '1' },
    })

    const results: unknown[] = []
    for await (const result of stream) {
      results.push(result)
    }

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      someAction1: { data: '2021-01-01', status: 'ok' },
      someAction2: {
        status: 'error',
        error: {
          code: 400,
          type: 'validation',
          errors: [
            {
              instancePath: '',
              schemaPath: '#/required',
              keyword: 'required',
              params: { missingProperty: 'id' },
              message: "must have required property 'id'",
            },
          ],
          message: 'Validation error',
        },
      },
      someAction3: {
        error: {
          type: 'generic',
          message: 'Some error',
          code: 400,
        },
        status: 'error',
      },
    })
  })

  it('should parse router with ctx', async () => {
    type DefinedCtx = {
      some: string
    }
    const ctx: DefinedCtx = { some: 'thing' }
    const userModel = object({
      id: string(),
      createdAt: string().isOptional(),
    }).isOptional()

    const someAction1 = action(
      userModel,
      ({ ctx: context }) => {
        return getCtx<DefinedCtx>(context).some
      },
    )

    const router = createRouter({
      serverActions: {
        someAction1,
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
          ctx,
        })
      },
    })

    const PORT = server.port

    afterAll(() => {
      server.stop()
    })

    const client = createRouterClient<Router>({
      url: `http://localhost:${PORT}`,
      transport: 'http',
      defineClientActions: {},
    })

    const stream = await client.stream({
      someAction1: { createdAt: '2021-01-01', id: '1' },
    })

    const results: unknown[] = []
    for await (const result of stream) {
      results.push(result)
    }

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      someAction1: { data: 'thing', status: 'ok' },
    })
  })

  it('should parse validation but action will return error', async () => {
    const userModel = object({
      id: string(),
      createdAt: string().isOptional(),
    }).isOptional()
    const someAction1 = action(userModel, ({ params }) => {
      return params.createdAt
    })
    const someAction3 = action(userModel, () => {
      throw new Error('Some error')
    })

    const router = createRouter({
      serverActions: {
        someAction1,
        someAction3,
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

    const client = createRouterClient<Router>({
      url: `http://localhost:${PORT}`,
      transport: 'http',
      defineClientActions: {},
    })

    const stream = await client.stream({
      someAction1: { createdAt: '2021-01-01', id: '1' },
      someAction3: { createdAt: '2021-01-01', id: '1' },
    })

    const results: unknown[] = []
    for await (const result of stream) {
      results.push(result)
    }

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      someAction1: {
        status: 'ok',
        data: '2021-01-01',
      },
      someAction3: {
        status: 'error',
        error: {
          code: 400,
          type: 'generic',
          message: 'Some error',
        },
      },
    })
  })

  it('should throw error on invalid json', async () => {
    const userModel = object({
      id: string(),
      createdAt: string().isOptional(),
    }).isOptional()
    const someAction1 = action(userModel, ({ params }) => {
      return params.createdAt
    })
    const someAction2 = action(userModel, ({ params }) => {
      return params.createdAt
    })
    const someAction3 = action(userModel, () => {
      throw new Error('Some error')
    })

    const router = createRouter({
      serverActions: {
        someAction1,
        someAction2,
        someAction3,
      },
      clientActions: {},
    })

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

    const response = await fetch(
      `http://localhost:${PORT}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'someAction1":{}}',
      },
    )

    const result = await response.json()
    expect(result).toEqual({
      $valid: {
        error: {
          type: 'generic',
          message: expect.stringContaining(
            'Failed to parse JSON',
          ),
          code: 400,
        },
      },
    })
  })

  it('should throw error 401', async () => {
    const userModel = object({
      id: string(),
      createdAt: string().isOptional(),
    }).isOptional()
    const someAction1 = action(userModel, () => {
      throw new ErrorWithCode('Some error', 401)
    })

    const router = createRouter({
      serverActions: {
        someAction1,
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

    const client = createRouterClient<Router>({
      url: `http://localhost:${PORT}`,
      transport: 'http',
      defineClientActions: {},
    })

    const stream = await client.stream({
      someAction1: { createdAt: '2021-01-01', id: '1' },
    })

    const results: unknown[] = []
    for await (const result of stream) {
      results.push(result)
    }

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      someAction1: {
        status: 'error',
        error: {
          code: 401,
          type: 'generic',
          message: 'Some error',
        },
      },
    })
  })

  it('should ignore clientActions', async () => {
    const userModel = object({
      id: string(),
      createdAt: string().isOptional(),
    }).isOptional()

    const someAction1 = action(userModel, ({ params }) => {
      return params.createdAt
    })

    // HTTP transport ignores clientActions - they are not used
    const router = createRouter({
      serverActions: {
        someAction1,
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

    const client = createRouterClient<Router>({
      url: `http://localhost:${PORT}`,
      transport: 'http',
      defineClientActions: {},
    })

    const stream = await client.stream({
      someAction1: { createdAt: '2021-01-01', id: '1' },
    })

    const results: unknown[] = []
    for await (const result of stream) {
      results.push(result)
    }

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      someAction1: { data: '2021-01-01', status: 'ok' },
    })
  })
})
