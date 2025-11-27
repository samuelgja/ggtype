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
})
