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
    try {
      const result = await this.reader.read()
      if (result.done) {
        this.isDisposed = true
        this.reader.releaseLock()
        return { done: true, value: undefined }
      }
      return { done: false, value: result.value }
    } catch (error) {
      this.isDisposed = true
      this.reader.releaseLock()
      throw error
    }
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
  constructor(
    source?: ReadableStream<T> | UnderlyingSource<T>,
  ) {
    if (source instanceof ReadableStream) {
      // Wrap an existing ReadableStream by creating a new stream that reads from it
      super({
        async start(controller) {
          const reader = source.getReader()
          try {
            while (true) {
              const result = await reader.read()
              if (result.done) {
                controller.close()
                break
              }
              controller.enqueue(result.value)
            }
          } catch (error) {
            controller.error(error)
          } finally {
            reader.releaseLock()
          }
        },
      })
    } else {
      // Pass through to parent constructor for source objects
      super(source as UnderlyingSource<T>)
    }
  }

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
