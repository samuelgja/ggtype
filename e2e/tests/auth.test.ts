/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, describe } from 'vitest'
import { createRouterClient } from '../../src'
import type { Router } from '../server'

const PORT = 3000

const check401 = (json: any, statusCode?: number) => {
  const hasError = Object.values(json).some((r: any) => {
    const result = r as {
      status: string
      error?: { code?: number }
    }
    return (
      result.status === 'error' &&
      result.error?.code === 401
    )
  })
  if (statusCode !== undefined) {
    return hasError || statusCode === 401
  }
  return hasError
}

describe('Authentication and Retry', () => {
  describe('HTTP Transport', () => {
    const client = createRouterClient<Router>({
      httpURL: `http://localhost:${PORT}/http`,
      responseTimeout: 1000,
    })

    test('should fail without auth', async () => {
      client.setHeaders({}) // Reset headers
      const result = await client.fetch({
        getProtectedData: {},
      })

      expect(result.getProtectedData.status).toBe('error')
      const protectedDataError =
        result.getProtectedData.status === 'error'
          ? result.getProtectedData.error
          : undefined
      expect(protectedDataError?.message).toBe(
        'Unauthorized',
      )
    })

    test('should succeed with auth headers', async () => {
      client.setHeaders({ Authorization: 'valid-token' })
      const result = await client.fetch({
        getProtectedData: {},
      })

      expect(result.getProtectedData.status).toBe('ok')
      expect(result.getProtectedData.data).toEqual({
        secret: 'data',
      })
    })

    test('should handle token expiration and retry', async () => {
      let retryCount = 0

      const retryClient = createRouterClient<Router>({
        httpURL: `http://localhost:${PORT}/http`,
        responseTimeout: 1000,
        onResponse: async ({
          json,
          statusCode,
          runAgain,
        }) => {
          if (
            check401(json, statusCode) &&
            retryCount === 0
          ) {
            retryCount++
            // Simulate token refresh
            retryClient.setHeaders({
              Authorization: 'valid-token',
            })
            return runAgain()
          }
        },
      })

      retryClient.setHeaders({
        Authorization: 'expired-token',
      })

      const result = await retryClient.fetch({
        getProtectedData: {},
      })

      expect(retryCount).toBe(1)
      expect(result.getProtectedData.status).toBe('ok')
      expect(result.getProtectedData.data).toEqual({
        secret: 'data',
      })
    })
  })

  describe('WebSocket Transport', () => {
    const client = createRouterClient<Router>({
      websocketURL: `ws://localhost:${PORT}/ws`,
      responseTimeout: 1000,
    })

    test('should fail without auth', async () => {
      client.setHeaders({})
      const result = client.websocket({
        getProtectedData: {},
      })

      const results: any[] = []
      for await (const item of result) {
        results.push(item)
      }

      const [response] = results
      expect(response.getProtectedData.status).toBe('error')
      expect(response.getProtectedData.error.message).toBe(
        'Unauthorized',
      )
    })

    test('should succeed with auth headers', async () => {
      client.setHeaders({ Authorization: 'valid-token' })
      const result = client.websocket({
        getProtectedData: {},
      })

      const results: any[] = []
      for await (const item of result) {
        results.push(item)
      }

      const [response] = results
      expect(response.getProtectedData.status).toBe('ok')
      expect(response.getProtectedData.data).toEqual({
        secret: 'data',
      })
    })

    test('should handle token expiration and retry', async () => {
      let retryCount = 0

      const retryClient = createRouterClient<Router>({
        websocketURL: `ws://localhost:${PORT}/ws`,
        responseTimeout: 1000,
        onResponse: async ({ json, runAgain }) => {
          if (check401(json) && retryCount === 0) {
            retryCount++
            retryClient.setHeaders({
              Authorization: 'valid-token',
            })
            // Async generator retry
            return runAgain()
          }
        },
      })

      retryClient.setHeaders({
        Authorization: 'expired-token',
      })

      const result = retryClient.websocket({
        getProtectedData: {},
      })

      const results: any[] = []
      for await (const item of result) {
        results.push(item)
      }

      // Should contain the successful result after retry
      // The generator might yield the error first?
      // runAgain returns a NEW generator.
      // onResponse return value replaces the current yield.

      expect(retryCount).toBe(1)
      const [finalResponse] = results
      expect(finalResponse.getProtectedData.status).toBe(
        'ok',
      )
      expect(finalResponse.getProtectedData.data).toEqual({
        secret: 'data',
      })
    })
  })
})
