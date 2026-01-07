import { describe, test, expect } from 'vitest'
import { createRouterClient } from '../../src/router-client/router-client'
import type { Router } from '../../src/router/router.type'
const PORT = 3000

describe('Performance Tests', () => {
  const client = createRouterClient<Router>({
    httpURL: `http://localhost:${PORT}/http`,
    streamURL: `http://localhost:${PORT}/stream`,
    websocketURL: `ws://localhost:${PORT}/ws`,
  })

  interface PerformanceMetrics {
    readonly totalRequests: number
    readonly totalTimeMs: number
    readonly averageTimeMs: number
    readonly requestsPerSecond: number
    readonly minTimeMs: number
    readonly maxTimeMs: number
    readonly p50TimeMs: number
    readonly p95TimeMs: number
    readonly p99TimeMs: number
  }

  function calculateMetrics(
    times: number[],
    totalTimeMs: number,
  ): PerformanceMetrics {
    const sorted = times.toSorted((a, b) => a - b)
    const totalRequests = times.length
    const averageTimeMs = totalTimeMs / totalRequests
    const requestsPerSecond =
      (totalRequests / totalTimeMs) * 1000

    const getPercentile = (percentile: number): number => {
      const index =
        Math.ceil((sorted.length * percentile) / 100) - 1
      return sorted[Math.max(0, index)] ?? 0
    }

    return {
      totalRequests,
      totalTimeMs,
      averageTimeMs,
      requestsPerSecond,
      minTimeMs: sorted[0] ?? 0,
      maxTimeMs: sorted.at(-1) ?? 0,
      p50TimeMs: getPercentile(50),
      p95TimeMs: getPercentile(95),
      p99TimeMs: getPercentile(99),
    }
  }

  function printReport(
    testName: string,
    metrics: PerformanceMetrics,
  ): void {
    // eslint-disable-next-line no-console
    console.log(`\n=== Performance Report: ${testName} ===`)
    // eslint-disable-next-line no-console
    console.log(`Total Requests: ${metrics.totalRequests}`)
    // eslint-disable-next-line no-console
    console.log(
      `Total Time: ${metrics.totalTimeMs.toFixed(2)}ms`,
    )
    // eslint-disable-next-line no-console
    console.log(
      `Average Time: ${metrics.averageTimeMs.toFixed(2)}ms`,
    )
    // eslint-disable-next-line no-console
    console.log(
      `Requests Per Second: ${metrics.requestsPerSecond.toFixed(2)}`,
    )
    // eslint-disable-next-line no-console
    console.log(
      `Min Time: ${metrics.minTimeMs.toFixed(2)}ms`,
    )
    // eslint-disable-next-line no-console
    console.log(
      `Max Time: ${metrics.maxTimeMs.toFixed(2)}ms`,
    )
    // eslint-disable-next-line no-console
    console.log(
      `P50 Time: ${metrics.p50TimeMs.toFixed(2)}ms`,
    )
    // eslint-disable-next-line no-console
    console.log(
      `P95 Time: ${metrics.p95TimeMs.toFixed(2)}ms`,
    )
    // eslint-disable-next-line no-console
    console.log(
      `P99 Time: ${metrics.p99TimeMs.toFixed(2)}ms`,
    )
    // eslint-disable-next-line no-console
    console.log('='.repeat(50))
  }

  test('HTTP transport - simple action performance', async () => {
    const iterations = 100
    const times: number[] = []
    const startTime = Date.now()

    for (let index = 0; index < iterations; index++) {
      const requestStart = Date.now()
      await client.fetch({
        getUserWithId: {
          clientId: `perf-${index}`,
          requestId: index,
        },
      })
      const requestEnd = Date.now()
      times.push(requestEnd - requestStart)
    }

    const totalTime = Date.now() - startTime
    const metrics = calculateMetrics(times, totalTime)
    printReport('HTTP - Simple Action', metrics)

    expect(metrics.totalRequests).toBe(iterations)
    expect(metrics.averageTimeMs).toBeLessThan(100) // Should be fast
  })

  test('HTTP transport - file upload performance', async () => {
    const iterations = 50
    const times: number[] = []
    const startTime = Date.now()

    for (let index = 0; index < iterations; index++) {
      const file = new File(
        [`content-${index}`],
        `file-${index}.txt`,
      )
      const requestStart = Date.now()
      await client.fetch(
        {
          uploadFile: {
            fileName: `perf-${index}.txt`,
          },
        },
        {
          files: [file],
        },
      )
      const requestEnd = Date.now()
      times.push(requestEnd - requestStart)
    }

    const totalTime = Date.now() - startTime
    const metrics = calculateMetrics(times, totalTime)
    printReport('HTTP - File Upload', metrics)

    expect(metrics.totalRequests).toBe(iterations)
    expect(metrics.averageTimeMs).toBeLessThan(200) // File uploads take longer
  })

  test('Stream transport - simple action performance', async () => {
    const iterations = 100
    const times: number[] = []
    const startTime = Date.now()

    for (let index = 0; index < iterations; index++) {
      const requestStart = Date.now()
      const result = client.stream({
        getUserWithId: {
          clientId: `stream-perf-${index}`,
          requestId: index,
        },
      })
      // eslint-disable-next-line sonarjs/no-unused-vars
      for await (const _item of result) {
        // Consume the stream
      }
      const requestEnd = Date.now()
      times.push(requestEnd - requestStart)
    }

    const totalTime = Date.now() - startTime
    const metrics = calculateMetrics(times, totalTime)
    printReport('Stream - Simple Action', metrics)

    expect(metrics.totalRequests).toBe(iterations)
    expect(metrics.averageTimeMs).toBeLessThan(150)
  })

  test('Stream transport - file stream performance', async () => {
    const iterations = 30
    const times: number[] = []
    const startTime = Date.now()

    for (let index = 0; index < iterations; index++) {
      const requestStart = Date.now()
      const result = client.stream({
        getFileStream: {
          count: 5,
          fileName: 'perf-stream',
        },
      })
      let itemCount = 0
      // eslint-disable-next-line sonarjs/no-unused-vars
      for await (const _item of result) {
        itemCount++
        if (itemCount >= 5) {
          break
        }
      }
      const requestEnd = Date.now()
      times.push(requestEnd - requestStart)
    }

    const totalTime = Date.now() - startTime
    const metrics = calculateMetrics(times, totalTime)
    printReport('Stream - File Stream', metrics)

    expect(metrics.totalRequests).toBe(iterations)
    expect(metrics.averageTimeMs).toBeLessThan(300)
  })

  test('WebSocket transport - simple action performance', async () => {
    const iterations = 100
    const times: number[] = []
    const startTime = Date.now()

    for (let index = 0; index < iterations; index++) {
      const requestStart = Date.now()
      const result = client.websocket({
        getUserWithId: {
          clientId: `ws-perf-${index}`,
          requestId: index,
        },
      })
      // eslint-disable-next-line sonarjs/no-unused-vars
      for await (const _item of result) {
        // Consume the stream
      }
      const requestEnd = Date.now()
      times.push(requestEnd - requestStart)
    }

    const totalTime = Date.now() - startTime
    const metrics = calculateMetrics(times, totalTime)
    printReport('WebSocket - Simple Action', metrics)

    expect(metrics.totalRequests).toBe(iterations)
    expect(metrics.averageTimeMs).toBeLessThan(150)
  })

  test('WebSocket transport - file upload performance', async () => {
    const iterations = 50
    const times: number[] = []
    const startTime = Date.now()

    for (let index = 0; index < iterations; index++) {
      const file = new File(
        [`ws-content-${index}`],
        `ws-file-${index}.txt`,
      )
      const requestStart = Date.now()
      const result = client.websocket(
        {
          uploadFile: {
            fileName: `ws-perf-${index}.txt`,
          },
        },
        {
          files: [file],
        },
      )
      // eslint-disable-next-line sonarjs/no-unused-vars
      for await (const _item of result) {
        // Consume the stream
      }
      const requestEnd = Date.now()
      times.push(requestEnd - requestStart)
    }

    const totalTime = Date.now() - startTime
    const metrics = calculateMetrics(times, totalTime)
    printReport('WebSocket - File Upload', metrics)

    expect(metrics.totalRequests).toBe(iterations)
    expect(metrics.averageTimeMs).toBeLessThan(200)
  })

  test('WebSocket transport - client action performance', async () => {
    const clientWithActions = createRouterClient<Router>({
      websocketURL: `ws://localhost:${PORT}/ws`,
      defineClientActions: {
        getClientFile: async (params: unknown) => {
          const { fileName } = params as {
            fileName: string
          }
          return new File(
            [`content: ${fileName}`],
            fileName,
          )
        },
        getUserInfo: async (params: unknown) => {
          const { id } = params as { id: string }
          return {
            id,
            name: `User ${id}`,
          }
        },
      },
    })

    const iterations = 50
    const times: number[] = []
    const startTime = Date.now()

    for (let index = 0; index < iterations; index++) {
      const requestStart = Date.now()
      const result = clientWithActions.websocket({
        getFileFromClient: {
          fileName: `perf-client-${index}.txt`,
        },
      })
      // eslint-disable-next-line sonarjs/no-unused-vars
      for await (const _item of result) {
        // Consume the stream
      }
      const requestEnd = Date.now()
      times.push(requestEnd - requestStart)
    }

    const totalTime = Date.now() - startTime
    const metrics = calculateMetrics(times, totalTime)
    printReport('WebSocket - Client Action', metrics)

    expect(metrics.totalRequests).toBe(iterations)
    expect(metrics.averageTimeMs).toBeLessThan(250)
  })

  test('Bidirectional WebSocket - concurrent requests performance', async () => {
    const connection = client.startWebsocket()
    const iterations = 50
    const times: number[] = []
    const startTime = Date.now()

    for (let index = 0; index < iterations; index++) {
      const requestStart = Date.now()
      await connection.send({
        getUserWithId: {
          clientId: `bidir-perf-${index}`,
          requestId: index,
        },
      })
      // Wait for response
      let responseCount = 0
      // eslint-disable-next-line sonarjs/no-unused-vars
      for await (const _item of connection.stream) {
        responseCount++
        if (responseCount >= 1) {
          break
        }
      }
      const requestEnd = Date.now()
      times.push(requestEnd - requestStart)
    }

    const totalTime = Date.now() - startTime
    const metrics = calculateMetrics(times, totalTime)
    printReport(
      'Bidirectional WebSocket - Concurrent',
      metrics,
    )

    connection.close()
    expect(metrics.totalRequests).toBe(iterations)
    expect(metrics.averageTimeMs).toBeLessThan(200)
  })

  test('Concurrent HTTP requests performance', async () => {
    const iterations = 100
    const concurrency = 10
    const times: number[] = []
    const startTime = Date.now()

    for (
      let batch = 0;
      batch < iterations / concurrency;
      batch++
    ) {
      const batchStart = Date.now()
      const promises = []
      for (let index = 0; index < concurrency; index++) {
        const requestIndex = batch * concurrency + index
        promises.push(
          client.fetch({
            getUserWithId: {
              clientId: `concurrent-${requestIndex}`,
              requestId: requestIndex,
            },
          }),
        )
      }
      await Promise.all(promises)
      const batchEnd = Date.now()
      const batchTime = batchEnd - batchStart
      times.push(batchTime / concurrency) // Average per request in batch
    }

    const totalTime = Date.now() - startTime
    const metrics = calculateMetrics(times, totalTime)
    printReport('HTTP - Concurrent Requests', metrics)

    expect(metrics.totalRequests).toBe(
      iterations / concurrency,
    )
    expect(metrics.averageTimeMs).toBeLessThan(150)
  })
})
