import type { ServerWebSocket } from 'bun'
import { m } from '../..'
import { action } from '../../action/action'
import { createRouter } from '../router'
import { createRouterClient } from '../router.client'
import { Elysia } from 'elysia'
import { defineClientActionsSchema } from '../router.client.types'
import {
  ErrorWithCode,
  ValidationError,
} from '../../utils/errors'

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

describe('router', () => {
  const ca = defineClientActionsSchema({
    useUser: {
      params: m.object({ id: m.string() }),
      return: m.object({
        id: m.string(),
        value: m.string(),
      }),
    },
    useProcess: {
      params: m.object({ duration: m.number() }),
      return: m.object({
        completed: m.boolean(),
      }),
    },
  })
  type ClientAction = typeof ca

  const router = createRouter({
    clientActions: ca,
    serverActions: {
      getUserWithFiles: action(
        m.object({ id: m.string() }),
        async ({ params, files }) => {
          expect(files).toBeDefined()
          expect(files?.size).toBeGreaterThan(0)
          return { id: params.id }
        },
      ),

      getUserWithClientAction: action(
        m.object({ id: m.string() }),
        async ({ params, clientActions }) => {
          const { useUser } = clientActions<ClientAction>()
          const result = await useUser({
            id: `${params.id}-CALL`,
          })

          if (result.status === 'error') {
            throw new Error(
              result.error?.message ??
                'Client action failed',
            )
          }

          return { id: result.data?.id ?? 'error' }
        },
      ),

      getMultipleClientActions: action(
        m.object({ count: m.number() }),
        async ({ params, clientActions }) => {
          const { useProcess } =
            clientActions<ClientAction>()

          const promises = []
          for (
            let index = 0;
            index < params.count;
            index++
          ) {
            // Random delay to test out-of-order completion if possible/relevant
            // or just concurrent execution
            promises.push(
              useProcess({ duration: 10 + index * 5 }),
            )
          }

          const results = await Promise.all(promises)
          return {
            success: results.every(
              (r) => r.status === 'ok' && r.data?.completed,
            ),
            count: results.length,
          }
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
      getError: action(m.object({}), async () => {
        throw new Error('Test Error')
      }),
      getErrorWithCode: action(
        m.object({ code: m.number() }),
        async ({ params }) => {
          throw new ErrorWithCode(
            'Error with code',
            params.code,
          )
        },
      ),
      getValidationError: action(
        m.object({ id: m.string() }),
        async ({ params }) => {
          if (params.id === 'invalid') {
            throw new ValidationError([
              {
                instancePath: '/id',
                schemaPath: '#/properties/id',
                keyword: 'custom',
                message: 'ID is invalid',
                params: {},
              },
            ])
          }
          return { id: params.id }
        },
      ),
      getClientActionError: action(
        m.object({ id: m.string() }),
        async ({ params, clientActions }) => {
          const { useUser } = clientActions<ClientAction>()
          // This will cause an error if client action fails
          const result = await useUser({
            id: params.id,
          })
          if (result.status === 'error') {
            throw new Error(
              result.error?.message ??
                'Client action failed',
            )
          }
          return { id: result.data?.id ?? 'error' }
        },
      ),
      getUserOptional: action(
        m.object({ id: m.string() }).isOptional(),
        async ({ params }) => {
          return { id: params?.id ?? 'default' }
        },
      ),
      getUserWithRequiredNumber: action(
        m.object({ id: m.string(), count: m.number() }),
        async ({ params }) => {
          return { id: params.id, count: params.count }
        },
      ),
      getEmptyResponse: action(m.object({}), async () => {
        return {}
      }),
      getLargeStream: action(
        m.object({ count: m.number() }),
        async function* ({ params }) {
          for (
            let index = 0;
            index < params.count;
            index++
          ) {
            yield { index, value: `item-${index}` }
          }
        },
      ),
    },
  })
  type Router = typeof router
  const PORT = 10
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
        onError: (error) => {
          return error
        },
      })
    })
    .ws('/ws', {
      message(ws, message) {
        return router.onWebSocketMessage({
          ws: ws.raw as ServerWebSocket<unknown>,
          message,
          ctx: {},
        })
      },
    })
    .listen(PORT)

  afterAll(() => {
    server.stop()
  })

  // ==========================================================================
  // HTTP Transport Tests
  // ==========================================================================
  describe('HTTP Transport', () => {
    const client = createRouterClient<Router>({
      httpURL: `http://localhost:${PORT}/http`,
    })

    it('should fetch GET', async () => {
      const result = await client.fetch(
        { getUser: { id: '1' } },
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
      const result = await client.fetch(
        { getUser: { id: '1' } },
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
      const result = await client.fetch(
        { getUserWithFiles: { id: '1' } },
        { method: 'POST', files: [file] },
      )
      expect(result).toEqual({
        getUserWithFiles: {
          data: { id: '1' },
          status: 'ok',
        },
      })
    })

    it('should return error for stream action on HTTP', async () => {
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
  })

  // ==========================================================================
  // Stream Transport Tests
  // ==========================================================================
  describe('Stream Transport', () => {
    const client = createRouterClient<Router>({
      streamURL: `http://localhost:${PORT}/stream`,
    })

    it('should stream GET without file', async () => {
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

    it('should stream GET with file response', async () => {
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
      const result = client.stream(
        { getUserWithFiles: { id: '1' } },
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
  })

  // ==========================================================================
  // Duplex Transport Tests
  // ==========================================================================
  describe('Duplex Transport', () => {
    const client = createRouterClient<Router>({
      halfDuplexUrl: `http://localhost:${PORT}/duplex`,
      defineClientActions: {
        useUser: async (value) => {
          return { id: value.id, value: 'test' }
        },
        useProcess: async (value) => {
          await delay(value.duration)
          return { completed: true }
        },
      },
    })

    it('should handle client action call (server calls client)', async () => {
      const result = client.duplex({
        getUserWithClientAction: { id: '1' },
      })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results).toEqual([
        {
          getUserWithClientAction: {
            status: 'ok',
            data: { id: '1-CALL' },
          },
        },
      ])
    })

    it('should handle multiple concurrent client action calls (race condition check)', async () => {
      const result = client.duplex({
        getMultipleClientActions: { count: 5 },
      })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results).toEqual([
        {
          getMultipleClientActions: {
            status: 'ok',
            data: { success: true, count: 5 },
          },
        },
      ])
    })

    it('should upload file with duplex POST', async () => {
      const result = client.duplex(
        {
          getUserWithFiles: { id: '1' },
        },
        {
          files: [new File(['content'], 'test.txt')],
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

    it('should handle file download', async () => {
      const result = client.duplex({
        getFile: { id: '1' },
      })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        getFile: {
          data: new File([], 'test.txt'),
          status: 'ok',
        },
      })
    })
  })

  // ==========================================================================
  // WebSocket Transport Tests
  // ==========================================================================
  describe('WebSocket Transport', () => {
    const client = createRouterClient<Router>({
      websocketURL: `ws://localhost:${PORT}/ws`,
      defineClientActions: {
        useUser: async (value) => {
          return { id: value.id, value: 'test' }
        },
        useProcess: async (value) => {
          await delay(value.duration)
          return { completed: true }
        },
      },
    })

    it('should handle simple call', async () => {
      const result = client.websocket({
        getUser: { id: '1' },
      })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }

      expect(results).toEqual([
        {
          getUser: {
            data: { id: '1' },
            status: 'ok',
          },
        },
      ])
    })

    it('should handle file upload', async () => {
      const result = client.websocket(
        {
          getUserWithFiles: { id: '1' },
        },
        {
          files: [new File(['test content'], 'test.txt')],
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

    it('should handle client action call', async () => {
      const result = client.websocket({
        getUserWithClientAction: { id: '1' },
      })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results).toEqual([
        {
          getUserWithClientAction: {
            status: 'ok',
            data: { id: '1-CALL' },
          },
        },
      ])
    })

    it('should handle multiple concurrent client action calls (race condition check)', async () => {
      const result = client.websocket({
        getMultipleClientActions: { count: 5 },
      })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results).toEqual([
        {
          getMultipleClientActions: {
            status: 'ok',
            data: { success: true, count: 5 },
          },
        },
      ])
    })
  })

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================
  describe('Error Handling', () => {
    const client = createRouterClient<Router>({
      httpURL: `http://localhost:${PORT}/http`,
    })

    it('should handle generic error from server', async () => {
      const result = await client.fetch({ getError: {} })
      expect(result.getError).toEqual({
        status: 'error',
        error: {
          type: 'generic',
          message: 'Test Error',
          code: 400,
        },
      })
    })

    it('should handle ErrorWithCode from server', async () => {
      const result = await client.fetch({
        getErrorWithCode: { code: 401 },
      })
      expect(result.getErrorWithCode).toEqual({
        status: 'error',
        error: {
          type: 'generic',
          message: 'Error with code',
          code: 401,
        },
      })
    })

    it('should handle ValidationError from server', async () => {
      const result = await client.fetch({
        getValidationError: { id: 'invalid' },
      })
      expect(result.getValidationError).toEqual({
        status: 'error',
        error: {
          type: 'validation',
          message: 'Validation error',
          code: 400,
          errors: [
            {
              instancePath: '/id',
              schemaPath: '#/properties/id',
              keyword: 'custom',
              message: 'ID is invalid',
              params: {},
            },
          ],
        },
      })
    })

    it('should handle validation error for invalid params', async () => {
      const result = await client.fetch({
        getUserWithRequiredNumber: { id: '1' } as never,
      })
      expect(result.getUserWithRequiredNumber).toEqual({
        status: 'error',
        error: expect.objectContaining({
          type: 'validation',
          code: 400,
        }),
      })
    })

    it('should handle error on stream transport', async () => {
      const streamClient = createRouterClient<Router>({
        streamURL: `http://localhost:${PORT}/stream`,
      })
      const result = streamClient.stream({ getError: {} })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        getError: {
          status: 'error',
          error: {
            type: 'generic',
            message: 'Test Error',
            code: 400,
          },
        },
      })
    })

    it('should handle error on duplex transport', async () => {
      const duplexClient = createRouterClient<Router>({
        halfDuplexUrl: `http://localhost:${PORT}/duplex`,
        defineClientActions: {
          useUser: async (value) => ({
            id: value.id,
            value: 'test',
          }),
          useProcess: async (value) => {
            await delay(value.duration)
            return { completed: true }
          },
        },
      })
      const result = duplexClient.duplex({ getError: {} })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]).toEqual({
        getError: {
          status: 'error',
          error: {
            type: 'generic',
            message: 'Test Error',
            code: 400,
          },
        },
      })
    })

    it('should handle error on websocket transport', async () => {
      const wsClient = createRouterClient<Router>({
        websocketURL: `ws://localhost:${PORT}/ws`,
        defineClientActions: {
          useUser: async (value) => ({
            id: value.id,
            value: 'test',
          }),
          useProcess: async (value) => {
            await delay(value.duration)
            return { completed: true }
          },
        },
      })
      const result = wsClient.websocket({ getError: {} })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]).toEqual({
        getError: {
          status: 'error',
          error: {
            type: 'generic',
            message: 'Test Error',
            code: 400,
          },
        },
      })
    })
  })

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================
  describe('Edge Cases', () => {
    const client = createRouterClient<Router>({
      httpURL: `http://localhost:${PORT}/http`,
    })

    it('should handle optional params', async () => {
      const result = await client.fetch({
        getUserOptional: undefined as unknown as
          | {
              id: string
            }
          | undefined,
      })
      expect(result.getUserOptional).toEqual({
        status: 'ok',
        data: { id: 'default' },
      })
    })

    it('should handle optional params with value', async () => {
      const result = await client.fetch({
        getUserOptional: { id: 'test' },
      })
      expect(result.getUserOptional).toEqual({
        status: 'ok',
        data: { id: 'test' },
      })
    })

    it('should handle empty response', async () => {
      const result = await client.fetch({
        getEmptyResponse: {},
      })
      expect(result.getEmptyResponse).toEqual({
        status: 'ok',
        data: {},
      })
    })

    it('should handle empty file array', async () => {
      const result = await client.fetch(
        { getUser: { id: '1' } },
        { files: [] },
      )
      expect(result.getUser).toEqual({
        status: 'ok',
        data: { id: '1' },
      })
    })

    it('should handle empty file', async () => {
      const result = await client.fetch(
        { getUserWithFiles: { id: '1' } },
        { files: [new File([], 'empty.txt')] },
      )
      // This should still work, just with an empty file
      expect(result.getUserWithFiles.status).toBe('ok')
    })

    it('should handle large stream', async () => {
      const streamClient = createRouterClient<Router>({
        streamURL: `http://localhost:${PORT}/stream`,
      })
      const result = streamClient.stream({
        getLargeStream: { count: 10 },
      })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results).toHaveLength(10)
      expect(results[0]).toEqual({
        getLargeStream: {
          status: 'ok',
          data: { index: 0, value: 'item-0' },
        },
      })
      expect(results[9]).toEqual({
        getLargeStream: {
          status: 'ok',
          data: { index: 9, value: 'item-9' },
        },
      })
    })

    it('should handle multiple actions in single request', async () => {
      const result = await client.fetch({
        getUser: { id: '1' },
        getUserOptional: { id: '2' },
        getEmptyResponse: {},
      })
      expect(result.getUser).toEqual({
        status: 'ok',
        data: { id: '1' },
      })
      expect(result.getUserOptional).toEqual({
        status: 'ok',
        data: { id: '2' },
      })
      expect(result.getEmptyResponse).toEqual({
        status: 'ok',
        data: {},
      })
    })

    it('should handle concurrent requests', async () => {
      const promises = [
        client.fetch({ getUser: { id: '1' } }),
        client.fetch({ getUser: { id: '2' } }),
        client.fetch({ getUser: { id: '3' } }),
      ]
      const results = await Promise.all(promises)
      expect(results[0].getUser.data?.id).toBe('1')
      expect(results[1].getUser.data?.id).toBe('2')
      expect(results[2].getUser.data?.id).toBe('3')
    })
  })

  // ==========================================================================
  // New API Tests - setHeaders
  // ==========================================================================
  describe('setHeaders API', () => {
    it('should set and use custom headers', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })
      client.setHeaders({ 'X-Custom-Header': 'test-value' })
      // Note: This test verifies the API exists and can be called
      // Actual header verification would require server-side checking
      const result = await client.fetch({
        getUser: { id: '1' },
      })
      expect(result.getUser.status).toBe('ok')
    })

    it('should reset headers when called with no args', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })
      client.setHeaders({ 'X-Custom-Header': 'test-value' })
      client.setHeaders()
      const result = await client.fetch({
        getUser: { id: '1' },
      })
      expect(result.getUser.status).toBe('ok')
    })

    it('should merge headers', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
      })
      client.setHeaders({ 'X-Header-1': 'value1' })
      client.setHeaders({ 'X-Header-2': 'value2' })
      const result = await client.fetch({
        getUser: { id: '1' },
      })
      expect(result.getUser.status).toBe('ok')
    })
  })

  // ==========================================================================
  // New API Tests - onResponse Hook
  // ==========================================================================
  describe('onResponse Hook', () => {
    it('should call onResponse hook', async () => {
      let hookCalled = false
      let receivedStatusCode = 0
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        onResponse: ({ json, statusCode }) => {
          hookCalled = true
          receivedStatusCode = statusCode
          return json
        },
      })
      const result = await client.fetch({
        getUser: { id: '1' },
      })
      expect(hookCalled).toBe(true)
      expect(receivedStatusCode).toBe(200)
      expect(result.getUser.status).toBe('ok')
    })

    it('should allow modifying response in onResponse', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        onResponse: ({ json }) => {
          if (json.getUser?.status === 'ok') {
            return {
              ...json,
              getUser: {
                ...json.getUser,
                data: { id: 'modified' },
              },
            }
          }
          return json
        },
      })
      const result = await client.fetch({
        getUser: { id: '1' },
      })
      expect(result.getUser.data?.id).toBe('modified')
    })

    it('should allow retrying with runAgain', async () => {
      let attemptCount = 0
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        onResponse: ({ json, statusCode, runAgain }) => {
          attemptCount++
          expect(statusCode).toBe(200)
          if (attemptCount === 1) {
            return runAgain()
          }
          return json
        },
      })
      const result = await client.fetch({
        getUser: { id: '1' },
      })
      expect(attemptCount).toBe(2)
      expect(result.getUser.status).toBe('ok')
    })

    it('should allow retrying with runAgain with new params', async () => {
      let attemptCount = 0
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        onResponse: ({ json, statusCode, runAgain }) => {
          attemptCount++
          expect(statusCode).toBe(200)
          if (attemptCount === 1) {
            return runAgain({ getUser: { id: '2' } })
          }
          return json
        },
      })
      const result = await client.fetch({
        getUser: { id: '1' },
      })
      expect(attemptCount).toBe(2)
      expect(result.getUser.data?.id).toBe('2')
    })

    it('should allow retrying with runAgain with new options', async () => {
      let attemptCount = 0
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        onResponse: ({ json, statusCode, runAgain }) => {
          attemptCount++
          expect(statusCode).toBe(200)
          if (attemptCount === 1) {
            return runAgain(undefined, { method: 'POST' })
          }
          return json
        },
      })
      const result = await client.fetch(
        { getUser: { id: '1' } },
        { method: 'GET' },
      )
      expect(attemptCount).toBe(2)
      expect(result.getUser.status).toBe('ok')
    })

    it('should handle errors thrown by runAgain', async () => {
      // Create a client with an invalid URL to force network error
      const invalidClient = createRouterClient<Router>({
        httpURL: `http://localhost:99999/invalid`,
        onResponse: ({ runAgain }) => {
          // runAgain will fail because the URL is invalid
          return runAgain()
        },
      })

      await expect(
        invalidClient.fetch({ getUser: { id: '1' } }),
      ).rejects.toThrow()
    })

    it('should handle runAgain throwing synchronously in onResponse', async () => {
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        onResponse: () => {
          // Throw an error directly in onResponse
          throw new Error('onResponse error')
        },
      })

      await expect(
        client.fetch({ getUser: { id: '1' } }),
      ).rejects.toThrow('onResponse error')
    })

    it('should handle multiple retries with runAgain', async () => {
      let attemptCount = 0
      const client = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        onResponse: ({ json, statusCode, runAgain }) => {
          attemptCount++
          expect(statusCode).toBe(200)
          if (attemptCount < 3) {
            return runAgain()
          }
          return json
        },
      })
      const result = await client.fetch({
        getUser: { id: '1' },
      })
      expect(attemptCount).toBe(3)
      expect(result.getUser.status).toBe('ok')
    })
  })

  // ==========================================================================
  // setHeaders API - All Transports
  // ==========================================================================
  describe('setHeaders API - All Transports', () => {
    it('should work with stream transport', async () => {
      const client = createRouterClient<Router>({
        streamURL: `http://localhost:${PORT}/stream`,
      })
      client.setHeaders({ 'X-Custom-Header': 'test-value' })
      const result = client.stream({
        getUserStream: { id: '1' },
      })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results.length).toBeGreaterThan(0)
    })

    it('should work with websocket transport', async () => {
      const client = createRouterClient<Router>({
        websocketURL: `ws://localhost:${PORT}/ws`,
        defineClientActions: {
          useUser: async (value) => ({
            id: value.id,
            value: 'test',
          }),
          useProcess: async (value) => {
            await delay(value.duration)
            return { completed: true }
          },
        },
      })
      client.setHeaders({ 'X-Custom-Header': 'test-value' })
      const result = client.websocket({
        getUser: { id: '1' },
      })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results.length).toBeGreaterThan(0)
    })

    it('should work with duplex transport', async () => {
      const client = createRouterClient<Router>({
        halfDuplexUrl: `http://localhost:${PORT}/duplex`,
        defineClientActions: {
          useUser: async (value) => ({
            id: value.id,
            value: 'test',
          }),
          useProcess: async (value) => {
            await delay(value.duration)
            return { completed: true }
          },
        },
      })
      client.setHeaders({ 'X-Custom-Header': 'test-value' })
      const result = client.duplex({
        getUser: { id: '1' },
      })
      const results: unknown[] = []
      for await (const item of result) {
        results.push(item)
      }
      expect(results.length).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // New API Tests - startWebsocket (Bidirectional Connection)
  // ==========================================================================
  describe('startWebsocket API', () => {
    const client = createRouterClient<Router>({
      websocketURL: `ws://localhost:${PORT}/ws`,
      defineClientActions: {
        useUser: async (value) => ({
          id: value.id,
          value: 'test',
        }),
        useProcess: async (value) => {
          await delay(value.duration)
          return { completed: true }
        },
      },
    })

    it('should create bidirectional connection', async () => {
      const connection = client.startWebsocket()
      await connection.send({ getUser: { id: '1' } })

      const results: unknown[] = []
      for await (const item of connection.stream) {
        results.push(item)
        if (results.length > 0) {
          break
        }
      }

      expect(results).toEqual([
        {
          getUser: {
            status: 'ok',
            data: { id: '1' },
          },
        },
      ])

      connection.close()
    })

    it('should handle multiple sends on same connection', async () => {
      const connection = client.startWebsocket()

      await connection.send({ getUser: { id: '1' } })
      await delay(20)
      await connection.send({ getUser: { id: '2' } })

      const results: unknown[] = []
      for await (const item of connection.stream) {
        results.push(item)
        if (results.length >= 2) {
          break
        }
      }

      expect(results).toHaveLength(2)
      connection.close()
    })

    it('should handle client action calls in bidirectional connection', async () => {
      const connection = client.startWebsocket()
      await connection.send({
        getUserWithClientAction: { id: '1' },
      })

      const results: unknown[] = []
      for await (const item of connection.stream) {
        results.push(item)
        if (results.length > 0) {
          break
        }
      }

      expect(results[0]).toEqual({
        getUserWithClientAction: {
          status: 'ok',
          data: { id: '1-CALL' },
        },
      })

      connection.close()
    })

    it('should handle errors when sending after close', async () => {
      const connection = client.startWebsocket()
      connection.close()

      await expect(
        connection.send({ getUser: { id: '1' } }),
      ).rejects.toThrow('Connection is closed')
    })
  })

  // ==========================================================================
  // New API Tests - startDuplex (Bidirectional Connection)
  // ==========================================================================
  describe('startDuplex API', () => {
    const client = createRouterClient<Router>({
      halfDuplexUrl: `http://localhost:${PORT}/duplex`,
      defineClientActions: {
        useUser: async (value) => ({
          id: value.id,
          value: 'test',
        }),
        useProcess: async (value) => {
          await delay(value.duration)
          return { completed: true }
        },
      },
    })

    it('should create bidirectional duplex connection', async () => {
      const connection = client.startDuplex()
      await connection.send({ getUser: { id: '1' } })

      const results: unknown[] = []
      for await (const item of connection.stream) {
        results.push(item)
        if (results.length > 0) {
          break
        }
      }

      expect(results).toEqual([
        {
          getUser: {
            status: 'ok',
            data: { id: '1' },
          },
        },
      ])

      connection.close()
    })

    it('should handle multiple sends on same duplex connection', async () => {
      const connection = client.startDuplex()
      await connection.send({ getUser: { id: '1' } })
      await delay(20)
      await connection.send({ getUser: { id: '2' } })

      const results: unknown[] = []
      for await (const item of connection.stream) {
        results.push(item)
        if (results.length >= 2) {
          break
        }
      }

      expect(results).toHaveLength(2)
      connection.close()
    })

    it('should handle client action calls in duplex connection', async () => {
      const connection = client.startDuplex()
      await connection.send({
        getUserWithClientAction: { id: '1' },
      })

      const results: unknown[] = []
      for await (const item of connection.stream) {
        results.push(item)
        if (results.length > 0) {
          break
        }
      }

      expect(results[0]).toEqual({
        getUserWithClientAction: {
          status: 'ok',
          data: { id: '1-CALL' },
        },
      })

      connection.close()
    })

    it('should handle errors when sending after close', async () => {
      const connection = client.startDuplex()
      connection.close()

      await expect(
        connection.send({ getUser: { id: '1' } }),
      ).rejects.toThrow('Connection is closed')
    })
  })

  // ==========================================================================
  // Client Action Error Handling
  // ==========================================================================
  describe('Client Action Error Handling', () => {
    it('should handle client action error in duplex', async () => {
      const client = createRouterClient<Router>({
        halfDuplexUrl: `http://localhost:${PORT}/duplex`,
        defineClientActions: {
          useUser: async () => {
            throw new Error('Client action error')
          },
          useProcess: async (value) => {
            await delay(value.duration)
            return { completed: true }
          },
        },
      })

      const result = client.duplex({
        getUserWithClientAction: { id: '1' },
      })

      const outputs: unknown[] = []
      for await (const item of result) {
        outputs.push(item)
      }

      expect(outputs).toHaveLength(1)
      expect(
        (
          outputs[0] as {
            getUserWithClientAction: {
              error?: { message?: string }
            }
          }
        ).getUserWithClientAction.error?.message,
      ).toContain('Client action error')
    })

    it('should handle client action returning error status', async () => {
      const client = createRouterClient<Router>({
        halfDuplexUrl: `http://localhost:${PORT}/duplex`,
        defineClientActions: {
          useUser: async () => {
            // Simulate client action that returns error
            throw new Error('Client action failed')
          },
          useProcess: async (value) => {
            await delay(value.duration)
            return { completed: true }
          },
        },
      })

      const result = client.duplex({
        getClientActionError: { id: '1' },
      })

      const outputs: unknown[] = []
      for await (const item of result) {
        outputs.push(item)
      }

      expect(outputs).toHaveLength(1)
      expect(
        (
          outputs[0] as {
            getClientActionError: {
              error?: { message?: string }
            }
          }
        ).getClientActionError.error?.message,
      ).toContain('Client action failed')
    })
  })
})
