export function readable<T>(
  source: UnderlyingDefaultSource<T>,
): ReadableStream<T> {
  let isClosed = false
  const newSource: UnderlyingDefaultSource<T> = {
    ...source,
    start(controller) {
      source.start?.({
        ...controller,
        close: () => {
          if (isClosed) return
          isClosed = true
          controller.close()
        },
        enqueue: (value) => {
          if (isClosed) return
          controller.enqueue(value)
        },
        error: (error) => {
          if (isClosed) return
          controller.error(error)
        },
      })
    },
    cancel() {
      if (isClosed) return
      isClosed = true
      source.cancel?.()
    },
  }
  return new ReadableStream(newSource)
}
