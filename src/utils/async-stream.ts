export class AsyncStream<T>
  extends ReadableStream<T>
  implements AsyncIterable<T>
{
  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    const reader = this.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        yield value
      }
    } finally {
      reader.releaseLock()
    }
  }
}
