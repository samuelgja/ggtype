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
})
