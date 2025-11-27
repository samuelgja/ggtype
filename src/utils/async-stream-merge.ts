/**
 * Merges multiple async iterables concurrently, yielding values as they become available.
 * Iterates through all iterables in parallel, collecting and yielding values from all sources.
 * Continues until all iterables are exhausted.
 * @template T - The type of items in the iterables
 * @param iterables - Variable number of async iterables to merge
 * @yields {T} Values from all iterables as they become available
 */
export async function* mergeConcurrent<T>(
  ...iterables: AsyncIterable<T>[]
): AsyncIterable<T> {
  const iterators = iterables.map((iterable) =>
    iterable[Symbol.asyncIterator](),
  )
  const results: T[] = []
  let completed = 0

  while (completed < iterators.length) {
    for (const iterator of iterators) {
      const { done, value } = await iterator.next()
      if (done) {
        completed++
        continue
      }
      results.push(value)
    }
    yield* results
    results.length = 0
  }
}
