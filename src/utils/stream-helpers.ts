/**
 * Creates a wrapper around a ReadableStream controller that prevents operations after closure.
 * Wraps the controller's enqueue, close, and error methods to check if the stream is already closed,
 * preventing errors from operations on closed streams.
 * @group Utils
 * @internal
 * @template Result - The type of data in the stream
 * @param controller - The ReadableStream controller to wrap
 * @returns A wrapped controller with closure protection
 */
export function createController<Result>(
  controller: ReadableStreamController<Result>,
): ReadableStreamDefaultController<Result> {
  const defaultController =
    controller as ReadableStreamDefaultController<Result>
  let isClosed = false
  return {
    enqueue(data: Result) {
      if (isClosed) {
        return
      }
      defaultController.enqueue(data)
    },
    close() {
      if (isClosed) {
        return
      }
      isClosed = true
      defaultController.close()
    },
    error(error) {
      if (isClosed) {
        return
      }
      isClosed = true
      defaultController.error(error)
    },
    get desiredSize() {
      return defaultController.desiredSize
    },
  }
}

/**
 * Marks each item in an async iterable with an `isLast` flag indicating if it's the last item.
 * This is useful for streaming operations where the client needs to know when the stream has ended.
 * @group Utils
 * @internal
 * @template T - The type of items in the iterable
 * @param iterable - The async iterable to process
 * @yields {object} An object containing the value and an optional `isLast` boolean flag
 * @returns An async iterable iterator that yields values with `isLast` flags
 */
export async function* markLast<T>(
  iterable: AsyncIterable<T>,
): AsyncIterableIterator<{ value: T; isLast?: boolean }> {
  const iterator = iterable[Symbol.asyncIterator]()
  let result = await iterator.next()
  while (!result.done) {
    const current = result.value
    result = await iterator.next()
    const isLast = result.done
    yield { value: current, isLast }
  }
}
