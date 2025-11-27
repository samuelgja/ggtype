/**
 * A queue for buffering Uint8Array chunks with efficient read operations.
 * Supports peeking at data without consuming it and reading specific amounts of data.
 */
export class BufferQueue {
  private chunks: Uint8Array[] = []
  private totalSize = 0

  push(chunk: Uint8Array) {
    if (chunk.byteLength === 0) return
    this.chunks.push(chunk)
    this.totalSize += chunk.byteLength
  }

  get size() {
    return this.totalSize
  }

  peek(n: number): Uint8Array {
    if (this.totalSize < n)
      throw new Error('Not enough data')

    if (this.chunks[0].byteLength >= n) {
      return this.chunks[0].subarray(0, n)
    }

    const result = new Uint8Array(n)
    let copied = 0
    for (const chunk of this.chunks) {
      const length = Math.min(n - copied, chunk.byteLength)
      result.set(chunk.subarray(0, length), copied)
      copied += length
      if (copied === n) break
    }
    return result
  }

  read(n: number): Uint8Array {
    if (this.totalSize < n)
      throw new Error('Not enough data')

    const [firstChunk] = this.chunks
    if (firstChunk.byteLength === n) {
      this.totalSize -= n
      return this.chunks.shift()!
    }

    if (firstChunk.byteLength > n) {
      const result = firstChunk.slice(0, n)
      this.chunks[0] = firstChunk.subarray(n)
      this.totalSize -= n
      return result
    }

    const result = new Uint8Array(n)
    let copied = 0
    while (copied < n) {
      const [chunk] = this.chunks
      const remaining = n - copied

      if (chunk.byteLength <= remaining) {
        result.set(chunk, copied)
        copied += chunk.byteLength
        this.chunks.shift()
      } else {
        result.set(chunk.subarray(0, remaining), copied)
        this.chunks[0] = chunk.subarray(remaining)
        copied += remaining
      }
    }
    this.totalSize -= n
    return result
  }
}
