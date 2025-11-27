import type { RouterMessage } from '../router/router-message'
import { BufferQueue } from '../utils/buffer-queue'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const MSG_TYPE_JSON = 0
const MSG_TYPE_JSON_WITH_BINARY = 1

export interface Transport {
  /**
   * Reads a router message from the transport
   * @returns The router message, or null if the stream is closed
   */
  read: () => Promise<RouterMessage | null>
  /**
   * Writes a router message to the transport
   * @param message - The router message to send
   */
  write: (message: RouterMessage) => Promise<void>
  /**
   * Closes the transport connection
   */
  close: () => Promise<void>
}

export class HttpStreamTransport implements Transport {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null
  private writer: WritableStreamDefaultWriter<Uint8Array> | null
  private buffer = new BufferQueue()
  private isClosed = false

  constructor(
    readable: ReadableStream<Uint8Array> | null,
    writable: WritableStream<Uint8Array> | null,
  ) {
    this.reader = readable
      ? (readable.getReader() as ReadableStreamDefaultReader<Uint8Array>)
      : null
    this.writer = writable ? writable.getWriter() : null
  }

  read = async (): Promise<RouterMessage | null> => {
    if (!this.reader) return null

    try {
      const header = await this.readBytes(5)
      if (!header) return null

      const view = new DataView(
        header.buffer,
        header.byteOffset,
        header.byteLength,
      )
      const type = view.getUint8(0)
      const jsonLength = view.getUint32(1, false)

      const jsonBytes = await this.readBytes(jsonLength)
      if (!jsonBytes)
        throw new Error('Unexpected EOF reading JSON')

      const jsonString = decoder.decode(jsonBytes)
      const message = JSON.parse(
        jsonString,
      ) as RouterMessage

      if (type === MSG_TYPE_JSON_WITH_BINARY) {
        const binLengthBytes = await this.readBytes(4)
        if (!binLengthBytes)
          throw new Error(
            'Unexpected EOF reading binary length',
          )
        const binLength = new DataView(
          binLengthBytes.buffer,
          binLengthBytes.byteOffset,
          binLengthBytes.byteLength,
        ).getUint32(0, false)

        const binData = await this.readBytes(binLength)
        if (!binData)
          throw new Error(
            'Unexpected EOF reading binary data',
          )

        const buffer =
          binData.buffer instanceof SharedArrayBuffer
            ? new ArrayBuffer(binData.byteLength)
            : binData.buffer
        const slice = buffer.slice(
          binData.byteOffset,
          binData.byteOffset + binData.byteLength,
        )
        const file = new File([slice], 'file')
        message.data = file
      }

      return message
    } catch {
      // Stream closed or error occurred
      return null
    }
  }
  private async extractBinaryData(
    message: RouterMessage,
  ): Promise<{
    jsonMessage: RouterMessage
    binaryData: Uint8Array | null
  }> {
    const isBinary =
      message.data instanceof File ||
      message.data instanceof Blob ||
      message.data instanceof ArrayBuffer ||
      message.data instanceof Uint8Array

    if (!isBinary) {
      return { jsonMessage: message, binaryData: null }
    }

    const jsonMessage = { ...message, data: null }
    let binaryData: Uint8Array | null = null

    if (message.data instanceof Uint8Array) {
      binaryData = message.data
    } else if (message.data instanceof ArrayBuffer) {
      binaryData = new Uint8Array(message.data)
    } else if (
      message.data instanceof File ||
      message.data instanceof Blob
    ) {
      const buffer = await message.data.arrayBuffer()
      binaryData = new Uint8Array(buffer)
    }

    return { jsonMessage, binaryData }
  }

  private buildFrame(
    jsonMessage: RouterMessage,
    binaryData: Uint8Array | null,
  ): Uint8Array {
    const jsonString = JSON.stringify(jsonMessage)
    const jsonBytes = encoder.encode(jsonString)

    const headerLength = 5
    const binLength = binaryData ? binaryData.byteLength : 0
    const totalLength =
      headerLength +
      jsonBytes.byteLength +
      (binaryData ? 4 + binLength : 0)

    const frame = new Uint8Array(totalLength)
    const view = new DataView(frame.buffer)

    let offset = 0
    view.setUint8(
      offset,
      binaryData
        ? MSG_TYPE_JSON_WITH_BINARY
        : MSG_TYPE_JSON,
    )
    offset += 1

    view.setUint32(offset, jsonBytes.byteLength, false)
    offset += 4

    frame.set(jsonBytes, offset)
    offset += jsonBytes.byteLength

    if (binaryData) {
      view.setUint32(offset, binLength, false)
      offset += 4
      frame.set(binaryData, offset)
    }

    return frame
  }

  private isStreamClosingError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false
    }
    const errorMessage = error.message
    return (
      errorMessage.includes('closing') ||
      errorMessage.includes('closed') ||
      errorMessage.includes('stream is closing') ||
      errorMessage.includes('stream is closing or closed')
    )
  }

  write = async (message: RouterMessage): Promise<void> => {
    if (!this.writer || this.isClosed) return

    try {
      const { jsonMessage, binaryData } =
        await this.extractBinaryData(message)
      const frame = this.buildFrame(jsonMessage, binaryData)

      // Check if stream is still writable before writing
      if (this.isClosed || !this.writer) {
        return
      }

      await this.writer.write(frame)
    } catch (error) {
      // Handle stream closing/closed errors gracefully
      if (this.isStreamClosingError(error)) {
        // Stream is closing/closed - this is acceptable, just return
        this.isClosed = true
        return
      }
      // Re-throw other errors
      throw error
    }
  }

  close = async (): Promise<void> => {
    if (this.isClosed) return
    this.isClosed = true
    if (this.reader) {
      this.reader.releaseLock()
    }
    if (this.writer) {
      await this.writer.close()
    }
  }

  private async readBytes(
    n: number,
  ): Promise<Uint8Array | null> {
    if (!this.reader) return null

    while (this.buffer.size < n) {
      const { done, value } = await this.reader.read()
      if (done) {
        if (this.buffer.size >= n) break
        return null
      }
      if (value) {
        this.buffer.push(value)
      }
    }
    return this.buffer.read(n)
  }
}
