import { expect, test, describe } from 'vitest'
import { createRouterClient } from '../../src'
import type { Router } from '../server'

describe('Router client tests', () => {
  const PORT = 3000
  const client = createRouterClient<Router>({
    httpURL: `http://localhost:${PORT}/http`,
    streamURL: `http://localhost:${PORT}/stream`,
    halfDuplexUrl: `http://localhost:${PORT}/duplex`,
  })

  test('renders name', async () => {
    // await awaiter(10_000)
    const fetchResult = await client.fetch({
      getUserWithId: {
        clientId: '1',
        requestId: 1,
      },
    })

    expect(fetchResult).toEqual({
      getUserWithId: {
        status: 'ok',
        data: {
          clientId: '1',
          requestId: 1,
        },
      },
    })
  })

  test('renders stream', async () => {
    // await awaiter(10_000)
    const fetchResult = client.stream({
      getUserWithId: {
        clientId: '1',
        requestId: 1,
      },
    })
    const results: unknown[] = []
    for await (const item of fetchResult) {
      results.push(item)
    }

    expect(results).toEqual([
      {
        getUserWithId: {
          status: 'ok',
          data: {
            clientId: '1',
            requestId: 1,
          },
        },
      },
    ])
  })
  test('renders duplex', async () => {
    const duplex = client.startDuplex()
    const results: unknown[] = []
    for await (const item of duplex.stream) {
      results.push(item)
    }
    expect(results).toEqual([
      {
        getUserWithId: {
          status: 'ok',
          data: {
            clientId: '1',
            requestId: 1,
          },
        },
      },
    ])
  })
})
