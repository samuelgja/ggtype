class AsyncStreamIterator<T> {
  private reader: ReadableStreamDefaultReader<T>
  private isDisposed = false

  constructor(reader: ReadableStreamDefaultReader<T>) {
    this.reader = reader
  }

  [Symbol.asyncIterator](): AsyncStreamIterator<T> {
    return this
  }

  async next(): Promise<IteratorResult<T, undefined>> {
    if (this.isDisposed) {
      return { done: true, value: undefined }
    }
    const result = await this.reader.read()
    if (result.done) {
      this.reader.releaseLock()
      return { done: true, value: undefined }
    }
    return { done: false, value: result.value }
  }

  async [Symbol.asyncDispose](): Promise<void> {
    if (this.isDisposed) {
      return
    }
    this.isDisposed = true
    try {
      await this.reader.cancel()
    } finally {
      this.reader.releaseLock()
    }
  }
}

/**
 * @group Utils
 */
export class AsyncStream<T>
  extends ReadableStream<T>
  implements AsyncIterable<T>
{
  [Symbol.asyncIterator](): AsyncStreamIterator<T> & {
    [Symbol.asyncIterator]: () => AsyncStreamIterator<T> & {
      [Symbol.asyncDispose]: () => Promise<void>
    }
  } {
    return new AsyncStreamIterator(
      this.getReader(),
    ) as AsyncStreamIterator<T> & {
      [Symbol.asyncIterator]: () => AsyncStreamIterator<T> & {
        [Symbol.asyncDispose]: () => Promise<void>
      }
    }
  }
}
