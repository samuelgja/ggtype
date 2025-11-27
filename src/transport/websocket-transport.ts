import type { RouterMessage } from '../router/router-message'
import type { Transport } from './http-stream-transport'
import { BufferQueue } from '../utils/buffer-queue'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const MSG_TYPE_JSON = 0
const MSG_TYPE_JSON_WITH_BINARY = 1

type WebSocketLike =
  | {
      send: (data: Uint8Array | string) => void
      close: () => void
      addEventListener: (
        type: 'message' | 'error' | 'close',
        handler:
          | ((event: { data: unknown }) => void)
          | ((event: unknown) => void)
          | (() => void),
      ) => void
      readyState: number
    }
  | {
      send: (data: Uint8Array | string) => void
      close: () => void
      onmessage: ((event: { data: unknown }) => void) | null
      onerror: ((event: unknown) => void) | null
      onclose: (() => void) | null
      readyState: number
    }
  | Bun.ServerWebSocket<unknown>

const WebSocketOpen = 1

export class WebSocketTransport implements Transport {
  private ws: WebSocketLike
  private buffer = new BufferQueue()
  private _isClosed = false
  private readQueue: Array<{
    resolve: (value: RouterMessage | null) => void
    reject: (error: Error) => void
  }> = []

  get isClosed() {
    return this._isClosed
  }

  constructor(ws: WebSocketLike) {
    this.ws = ws
    this.setupMessageHandlers()
  }

  private handleMessage = (event: { data: unknown }) => {
    const { data: eventData } = event
    let data: Uint8Array
    if (eventData instanceof ArrayBuffer) {
      data = new Uint8Array(eventData)
    } else if (eventData instanceof Uint8Array) {
      data = eventData
    } else if (eventData instanceof Blob) {
      eventData
        .arrayBuffer()
        .then((buffer) => {
          this.handleIncomingData(new Uint8Array(buffer))
        })
        .catch((error) => {
          this.handleError(error)
        })
      return
    } else {
      this.handleError(new Error('Unexpected message type'))
      return
    }
    this.handleIncomingData(data)
  }

  private handleErrorEvent = (event: unknown) => {
    this.handleError(
      new Error('WebSocket error', { cause: event }),
    )
  }

  private handleClose = () => {
    this._isClosed = true
    this.resolvePendingReads(null)
  }

  private setupMessageHandlers() {
    if ('addEventListener' in this.ws) {
      this.ws.addEventListener(
        'message',
        this.handleMessage,
      )
      this.ws.addEventListener(
        'error',
        this.handleErrorEvent,
      )
      this.ws.addEventListener('close', this.handleClose)
    } else if (
      'onmessage' in this.ws &&
      this.ws.onmessage === null
    ) {
      // For WebSocket implementations that only support onmessage/onerror/onclose
      // We need to use these properties as Bun's WebSocket may not support addEventListener
      // This is a fallback for compatibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wsAny = this.ws as any
      // eslint-disable-next-line unicorn/prefer-add-event-listener
      wsAny.onmessage = this.handleMessage
      // eslint-disable-next-line unicorn/prefer-add-event-listener
      wsAny.onerror = this.handleErrorEvent
      // eslint-disable-next-line unicorn/prefer-add-event-listener
      wsAny.onclose = this.handleClose
    }
    // Bun.ServerWebSocket doesn't have event listeners, messages are handled externally
  }

  feedMessage(data: Uint8Array) {
    this.buffer.push(data)
    this.processBuffer()
  }

  private handleIncomingData(data: Uint8Array) {
    this.buffer.push(data)
    this.processBuffer()
  }

  private parseMessageHeader(): {
    type: number
    jsonLength: number
    binLength: number
  } | null {
    if (this.buffer.size < 5) {
      return null
    }

    const header = this.buffer.peek(5)
    const view = new DataView(
      header.buffer,
      header.byteOffset,
      header.byteLength,
    )
    const type = view.getUint8(0)
    const jsonLength = view.getUint32(1, false)

    if (this.buffer.size < 5 + jsonLength) {
      return null
    }

    let binLength = 0

    if (type === MSG_TYPE_JSON_WITH_BINARY) {
      if (this.buffer.size < 5 + jsonLength + 4) {
        return null
      }

      const binLengthHeader = this.buffer.peek(
        5 + jsonLength + 4,
      )
      const binLengthView = new DataView(
        binLengthHeader.buffer,
        binLengthHeader.byteOffset + 5 + jsonLength,
        4,
      )
      binLength = binLengthView.getUint32(0, false)

      if (
        this.buffer.size <
        5 + jsonLength + 4 + binLength
      ) {
        return null
      }
    }

    return { type, jsonLength, binLength }
  }

  private parseMessage(
    type: number,
    jsonLength: number,
    binLength: number,
  ): RouterMessage {
    this.buffer.read(5)
    const jsonBytes = this.buffer.read(jsonLength)
    const jsonString = decoder.decode(jsonBytes)
    const message = JSON.parse(jsonString) as RouterMessage

    if (type === MSG_TYPE_JSON_WITH_BINARY) {
      this.buffer.read(4)
      const binData = this.buffer.read(binLength)
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
  }

  private processBuffer() {
    while (this.readQueue.length > 0) {
      try {
        const headerInfo = this.parseMessageHeader()
        if (!headerInfo) {
          break
        }

        const { type, jsonLength, binLength } = headerInfo
        const message = this.parseMessage(
          type,
          jsonLength,
          binLength,
        )

        const reader = this.readQueue.shift()
        if (reader) {
          reader.resolve(message)
        }
      } catch (error) {
        const reader = this.readQueue.shift()
        if (reader) {
          reader.reject(
            error instanceof Error
              ? error
              : new Error('Failed to parse message'),
          )
        }
      }
    }
  }

  private handleError(_error: Error) {
    this.resolvePendingReads(null)
  }

  private resolvePendingReads(value: RouterMessage | null) {
    while (this.readQueue.length > 0) {
      const reader = this.readQueue.shift()
      if (reader) {
        reader.resolve(value)
      }
    }
  }

  read: Transport['read'] =
    async (): Promise<RouterMessage | null> => {
      if (this._isClosed) return null

      return new Promise((resolve, reject) => {
        this.readQueue.push({ resolve, reject })
        this.processBuffer()
      })
    }

  write: Transport['write'] = async (
    message: RouterMessage,
  ): Promise<void> => {
    if (this._isClosed) {
      return
    }

    // Check readyState if available (browser WebSocket), but Bun's ServerWebSocket doesn't have it
    if (
      'readyState' in this.ws &&
      this.ws.readyState !== WebSocketOpen
    ) {
      return
    }

    const isBinary =
      message.data instanceof File ||
      message.data instanceof Blob ||
      message.data instanceof ArrayBuffer ||
      message.data instanceof Uint8Array

    let jsonMessage = message
    let binaryData: Uint8Array | null = null

    if (isBinary) {
      jsonMessage = { ...message, data: null }
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
    }

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

    this.ws.send(frame)
  }

  close: Transport['close'] = async (): Promise<void> => {
    if (this._isClosed) return
    this._isClosed = true
    if (
      this.ws.readyState === WebSocketOpen ||
      this.ws.readyState === 0
    ) {
      this.ws.close()
    }
  }
}
