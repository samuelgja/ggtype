import { AsyncStream } from '../async-stream'

describe('async-stream', () => {
  it('should test async stream', async () => {
    const count = 10
    const stream = new ReadableStream<number>({
      start(controlled) {
        for (let index = 0; index < count; index++) {
          controlled.enqueue(index)
        }
        controlled.close()
      },
    })

    const asyncStream = new AsyncStream<number>(stream)
    expect(asyncStream).toBeInstanceOf(AsyncStream)
  })

  it('should iterate through all values', async () => {
    const count = 10
    const stream = new ReadableStream<number>({
      start(controlled) {
        for (let index = 0; index < count; index++) {
          controlled.enqueue(index)
        }
        controlled.close()
      },
    })

    const asyncStream = new AsyncStream<number>(stream)
    const values: number[] = []

    for await (const value of asyncStream) {
      values.push(value)
    }

    expect(values).toHaveLength(count)
    expect(values).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('should handle empty stream', async () => {
    const stream = new ReadableStream<number>({
      start(controlled) {
        controlled.close()
      },
    })

    const asyncStream = new AsyncStream<number>(stream)
    const values: number[] = []

    for await (const value of asyncStream) {
      values.push(value)
    }

    expect(values).toHaveLength(0)
  })

  it('should support manual iteration with next()', async () => {
    const stream = new ReadableStream<number>({
      start(controlled) {
        controlled.enqueue(1)
        controlled.enqueue(2)
        controlled.enqueue(3)
        controlled.close()
      },
    })

    const asyncStream = new AsyncStream<number>(stream)
    const iterator = asyncStream[Symbol.asyncIterator]()

    const result1 = await iterator.next()
    expect(result1.done).toBe(false)
    expect(result1.value).toBe(1)

    const result2 = await iterator.next()
    expect(result2.done).toBe(false)
    expect(result2.value).toBe(2)

    const result3 = await iterator.next()
    expect(result3.done).toBe(false)
    expect(result3.value).toBe(3)

    const result4 = await iterator.next()
    expect(result4.done).toBe(true)
    expect(result4.value).toBeUndefined()
  })

  it('should handle errors during iteration', async () => {
    const stream = new ReadableStream<number>({
      async start(controlled) {
        controlled.enqueue(1)
        controlled.enqueue(2)
        await new Promise((resolve) =>
          setTimeout(resolve, 10),
        )
        controlled.error(new Error('mid-stream error'))
      },
    })

    const asyncStream = new AsyncStream<number>(stream)
    const values: number[] = []
    let errorThrown = false

    try {
      for await (const value of asyncStream) {
        values.push(value)
      }
    } catch (error) {
      errorThrown = true
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe(
        'mid-stream error',
      )
    }

    expect(errorThrown).toBe(true)
    expect(values.length).toBeGreaterThan(0)
  })

  it('should stop and throw on error', async () => {
    const stream = new ReadableStream<number>({
      async start(controlled) {
        controlled.error(new Error('test error'))
      },
    })
    const asyncStream = new AsyncStream<number>(stream)
    let errorThrown = false
    try {
      // eslint-disable-next-line sonarjs/no-unused-vars
      for await (const _item of asyncStream) {
        // This should never execute because the stream errors immediately
        expect(true).toBe(false)
      }
    } catch (error) {
      errorThrown = true
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe('test error')
    }
    expect(errorThrown).toBe(true)
  })

  it('should support async disposal', async () => {
    let cancelCalled = false
    const asyncStream = new AsyncStream<number>({
      start(controlled) {
        const controller =
          controlled as ReadableStreamDefaultController<number>
        controller.enqueue(1)
        controller.enqueue(2)
        // Don't close - keep stream open for cancellation
      },
      cancel() {
        cancelCalled = true
      },
    })

    const iterator = asyncStream[Symbol.asyncIterator]()

    const result1 = await iterator.next()
    expect(result1.done).toBe(false)
    expect(result1.value).toBe(1)

    if (Symbol.asyncDispose in iterator) {
      await (
        iterator as {
          [Symbol.asyncDispose]: () => Promise<void>
        }
      )[Symbol.asyncDispose]()
    }

    expect(cancelCalled).toBe(true)

    const result2 = await iterator.next()
    expect(result2.done).toBe(true)
  })

  it('should handle disposal when already disposed', async () => {
    const stream = new ReadableStream<number>({
      start(controlled) {
        controlled.close()
      },
    })

    const asyncStream = new AsyncStream<number>(stream)
    const iterator = asyncStream[Symbol.asyncIterator]()

    await iterator.next()

    if (Symbol.asyncDispose in iterator) {
      await (
        iterator as {
          [Symbol.asyncDispose]: () => Promise<void>
        }
      )[Symbol.asyncDispose]()
      await (
        iterator as {
          [Symbol.asyncDispose]: () => Promise<void>
        }
      )[Symbol.asyncDispose]()
    }

    const result = await iterator.next()
    expect(result.done).toBe(true)
  })

  it('should construct with UnderlyingSource directly', async () => {
    const asyncStream = new AsyncStream<number>({
      start(controlled) {
        const controller =
          controlled as ReadableStreamDefaultController<number>
        controller.enqueue(1)
        controller.enqueue(2)
        controller.enqueue(3)
        controller.close()
      },
    })

    const values: number[] = []
    for await (const value of asyncStream) {
      values.push(value)
    }

    expect(values).toEqual([1, 2, 3])
  })

  it('should handle async value production', async () => {
    const asyncStream = new AsyncStream<number>({
      async start(controlled) {
        const controller =
          controlled as ReadableStreamDefaultController<number>
        for (let index = 0; index < 5; index++) {
          await new Promise((resolve) =>
            setTimeout(resolve, 10),
          )
          controller.enqueue(index)
        }
        controller.close()
      },
    })

    const values: number[] = []
    for await (const value of asyncStream) {
      values.push(value)
    }

    expect(values).toEqual([0, 1, 2, 3, 4])
  })

  it('should handle large streams', async () => {
    const count = 1000
    const stream = new ReadableStream<number>({
      start(controlled) {
        for (let index = 0; index < count; index++) {
          controlled.enqueue(index)
        }
        controlled.close()
      },
    })

    const asyncStream = new AsyncStream<number>(stream)
    const values: number[] = []

    for await (const value of asyncStream) {
      values.push(value)
    }

    expect(values).toHaveLength(count)
    expect(values[0]).toBe(0)
    expect(values[count - 1]).toBe(count - 1)
  })

  it('should handle partial consumption with disposal', async () => {
    const stream = new ReadableStream<number>({
      start(controlled) {
        for (let index = 0; index < 10; index++) {
          controlled.enqueue(index)
        }
        controlled.close()
      },
    })

    const asyncStream = new AsyncStream<number>(stream)
    const iterator = asyncStream[Symbol.asyncIterator]()
    const values: number[] = []

    for (let index = 0; index < 3; index++) {
      const result = await iterator.next()
      if (!result.done) {
        values.push(result.value)
      }
    }

    if (Symbol.asyncDispose in iterator) {
      await (
        iterator as {
          [Symbol.asyncDispose]: () => Promise<void>
        }
      )[Symbol.asyncDispose]()
    }

    expect(values).toEqual([0, 1, 2])
  })

  it('should handle string values', async () => {
    const stream = new ReadableStream<string>({
      start(controlled) {
        controlled.enqueue('hello')
        controlled.enqueue('world')
        controlled.enqueue('test')
        controlled.close()
      },
    })

    const asyncStream = new AsyncStream<string>(stream)
    const values: string[] = []

    for await (const value of asyncStream) {
      values.push(value)
    }

    expect(values).toEqual(['hello', 'world', 'test'])
  })

  it('should handle object values', async () => {
    interface TestObject {
      readonly id: number
      readonly name: string
    }

    const stream = new ReadableStream<TestObject>({
      start(controlled) {
        controlled.enqueue({ id: 1, name: 'first' })
        controlled.enqueue({ id: 2, name: 'second' })
        controlled.close()
      },
    })

    const asyncStream = new AsyncStream<TestObject>(stream)
    const values: TestObject[] = []

    for await (const value of asyncStream) {
      values.push(value)
    }

    expect(values).toHaveLength(2)
    expect(values[0]).toEqual({ id: 1, name: 'first' })
    expect(values[1]).toEqual({ id: 2, name: 'second' })
  })

  it('should not allow multiple concurrent iterations', async () => {
    const stream = new ReadableStream<number>({
      start(controlled) {
        controlled.enqueue(1)
        controlled.enqueue(2)
        controlled.close()
      },
    })

    const asyncStream = new AsyncStream<number>(stream)

    const iterator1 = asyncStream[Symbol.asyncIterator]()
    const result1 = await iterator1.next()
    expect(result1.done).toBe(false)

    // Second call to getReader should throw because stream is locked
    expect(() => {
      asyncStream[Symbol.asyncIterator]()
    }).toThrow()
  })
})
