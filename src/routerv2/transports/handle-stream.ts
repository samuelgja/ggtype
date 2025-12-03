/* eslint-disable prefer-destructuring */
import {
  fromArrayBuffer,
  ID_LENGTH,
  isFile,
  toArrayBuffer,
} from '../../utils/array-buffer-handler'
import type { AsyncStream } from '../../utils/async-stream'
import { isStream } from '../../utils/is'
import { readable } from '../../utils/readable'
import { JSONL } from '../../utils/stream-helpers'
import {
  StreamMessageType,
  type StreamMessage,
} from '../router.type'

/**
 * Options for handling stream responses.
 * @group Router
 * @internal
 */
interface Options {
  readonly send: (message: Uint8Array) => void
  readonly actionResult: unknown
  readonly actionName: string
  readonly id: string
  readonly encoder: TextEncoder
  readonly type: StreamMessageType
}

/**
 * Encodes action results into a streaming protocol:
 * - Normal result: single JSON/JSONL message
 * - File result: JSON header + raw [ID (ID_LENGTH) + file bytes]
 * - Async stream: JSONL per item
 */

async function handleFileStreamResponse(
  file: File,
  actionName: string,
  id: string,
  type: StreamMessageType,
  encoder: TextEncoder,
  stringify: (message: unknown) => string,
  send: (message: Uint8Array) => void,
): Promise<void> {
  const message: StreamMessage = {
    action: actionName,
    id,
    status: 'ok',
    withFile: true,
    fileSize: file.size,
    type,
    isLast: true,
  }

  const rawMessage = stringify(message)
  const encodedMessage = encoder.encode(rawMessage)

  const fileBufferWithId = await toArrayBuffer(id, file)

  // Send JSON header, then [ID + file bytes]
  send(encodedMessage)
  send(new Uint8Array(fileBufferWithId))
}

async function handleAsyncStreamResponse(
  asyncStream: AsyncStream<unknown>,
  actionName: string,
  id: string,
  type: StreamMessageType,
  encoder: TextEncoder,
  stringify: (message: unknown) => string,
  send: (message: Uint8Array) => void,
): Promise<void> {
  const iterator = asyncStream[Symbol.asyncIterator]()
  let previousItem: unknown | null = null
  let done = false

  while (!done) {
    const result = await iterator.next()
    done = result.done ?? false

    if (!done && result.value !== undefined) {
      if (previousItem !== null) {
        // Send previous item (not the last one) - recursively call handleStreamResponse
        // but we need to mark it as not last
        const message: StreamMessage = {
          action: actionName,
          id,
          status: 'ok',
          data: previousItem,
          type,
          isLast: false,
        }
        const rawMessage = stringify(message)
        const encodedMessage = encoder.encode(rawMessage)
        send(encodedMessage)
      }
      previousItem = result.value
    } else if (done && previousItem !== null) {
      // This is the last item, mark it with isLast: true
      const lastItemMessage: StreamMessage = {
        action: actionName,
        id,
        status: 'ok',
        data: previousItem,
        type,
        isLast: true,
      }
      const rawMessage = stringify(lastItemMessage)
      const encodedMessage = encoder.encode(rawMessage)
      send(encodedMessage)
    } else if (done && previousItem === null) {
      // Empty stream, send a last message
      const lastMessage: StreamMessage = {
        action: actionName,
        id,
        status: 'ok',
        type,
        isLast: true,
      }
      const rawMessage = stringify(lastMessage)
      const encodedMessage = encoder.encode(rawMessage)
      send(encodedMessage)
    }
  }
}

function handleNormalStreamResponse(
  actionResult: unknown,
  actionName: string,
  id: string,
  type: StreamMessageType,
  encoder: TextEncoder,
  stringify: (message: unknown) => string,
  send: (message: Uint8Array) => void,
): void {
  const message: StreamMessage = {
    action: actionName,
    id,
    status: 'ok',
    data: actionResult,
    type,
    isLast: true,
  }
  const rawMessage = stringify(message)
  const encodedMessage = encoder.encode(rawMessage)
  send(encodedMessage)
}

/**
 * Handles stream response encoding for action results.
 * @group Router
 * @internal
 * @param options - Stream response options. See Options interface for details.
 */
export async function handleStreamResponse(
  options: Options,
) {
  const {
    send,
    actionResult,
    actionName,
    id,
    encoder,
    type,
  } = options

  const stringify = JSONL

  // 1) File result
  if (isFile(actionResult)) {
    await handleFileStreamResponse(
      actionResult as File,
      actionName,
      id,
      type,
      encoder,
      stringify,
      send,
    )
    return
  }

  // 2) Async stream result
  if (isStream(actionResult)) {
    await handleAsyncStreamResponse(
      actionResult as AsyncStream<unknown>,
      actionName,
      id,
      type,
      encoder,
      stringify,
      send,
    )
    return
  }

  // 3) Normal result
  handleNormalStreamResponse(
    actionResult,
    actionName,
    id,
    type,
    encoder,
    stringify,
    send,
  )
}

/**
 * State for file mode parsing.
 * @group Router
 * @internal
 */
type FileModeState = {
  readonly header: StreamMessage & {
    readonly fileSize: number
  }
  remaining: number
  chunks: Uint8Array[]
}

function concatBuffers(
  a: Uint8Array,
  b: Uint8Array,
): Uint8Array {
  if (a.length === 0) return b
  if (b.length === 0) return a
  const out = new Uint8Array(a.length + b.length)
  out.set(a, 0)
  out.set(b, a.length)
  return out
}

/**
 * Internal incremental parser shared by Parser/feed and HTTP stream handling.
 * It:
 * - Reads newline-delimited JSON headers
 * - For withFile: true messages, enters "file mode" and consumes raw bytes for [ID + file]
 */

function processFileMode(
  currentPending: Uint8Array,
  currentFileMode: FileModeState,
  onMessage: (message: StreamMessage) => void,
): Promise<{
  pending: Uint8Array
  fileMode: FileModeState | null
  consumed: boolean
}> {
  return (async () => {
    if (currentPending.length === 0) {
      return {
        pending: currentPending,
        fileMode: currentFileMode,
        consumed: false,
      }
    }

    const toConsume = Math.min(
      currentFileMode.remaining,
      currentPending.length,
    )
    const part = currentPending.slice(0, toConsume)
    const newPending = currentPending.subarray(toConsume)

    currentFileMode.chunks.push(part)
    currentFileMode.remaining -= toConsume

    // Need more bytes
    if (currentFileMode.remaining > 0) {
      return {
        pending: newPending,
        fileMode: currentFileMode,
        consumed: true,
      }
    }

    // We have full [ID + file] payload
    let totalLength = 0
    for (const chunk of currentFileMode.chunks) {
      totalLength += chunk.length
    }
    const merged = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of currentFileMode.chunks) {
      merged.set(chunk, offset)
      offset += chunk.length
    }

    const arrayBuffer = merged.buffer.slice(
      merged.byteOffset,
      merged.byteOffset + merged.byteLength,
    )
    const { id, input } = await fromArrayBuffer(arrayBuffer)

    const result: StreamMessage = {
      ...currentFileMode.header,
      id,
      file: input, // Blob
    }

    onMessage(result)
    return {
      pending: newPending,
      fileMode: null,
      consumed: true,
    }
  })()
}

function processJsonMode(
  currentPending: Uint8Array,
  textDecoder: TextDecoder,
  NEWLINE: number,
  onMessage: (message: StreamMessage) => void,
  onError: (error: Error) => void,
): {
  pending: Uint8Array
  fileMode: FileModeState | null
  hasError: boolean
} {
  const newlineIndex = currentPending.indexOf(NEWLINE)
  if (newlineIndex === -1) {
    // no full line yet
    return {
      pending: currentPending,
      fileMode: null,
      hasError: false,
    }
  }

  const lineBytes = currentPending.slice(0, newlineIndex)
  const newPending = currentPending.subarray(
    newlineIndex + 1,
  )

  const line = textDecoder.decode(lineBytes).trim()
  if (!line) {
    return {
      pending: newPending,
      fileMode: null,
      hasError: false,
    }
  }

  let message: StreamMessage
  try {
    message = JSON.parse(line) as StreamMessage
  } catch (error) {
    onError(
      new Error(
        `Failed to parse stream message: ${
          (error as Error).message
        }`,
      ),
    )
    return {
      pending: newPending,
      fileMode: null,
      hasError: true,
    }
  }

  // Normal JSON-only message
  if (!message.withFile) {
    onMessage(message)
    return {
      pending: newPending,
      fileMode: null,
      hasError: false,
    }
  }

  if (typeof message.fileSize !== 'number') {
    onError(
      new Error(
        'Stream message with file must contain fileSize',
      ),
    )
    return {
      pending: newPending,
      fileMode: null,
      hasError: true,
    }
  }

  // Enter file mode: expect [ID_LENGTH + fileSize] raw bytes
  const fileMode: FileModeState = {
    header: message as StreamMessage & {
      fileSize: number
    },
    remaining: message.fileSize + ID_LENGTH,
    chunks: [],
  }

  return {
    pending: newPending,
    fileMode,
    hasError: false,
  }
}

function processAllJsonMessages(
  currentPending: Uint8Array,
  textDecoder: TextDecoder,
  NEWLINE: number,
  onMessage: (message: StreamMessage) => void,
  onError: (error: Error) => void,
): {
  pending: Uint8Array
  fileMode: FileModeState | null
  hasError: boolean
} {
  let pending = currentPending

  while (true) {
    const previousPendingLength = pending.length
    const jsonResult = processJsonMode(
      pending,
      textDecoder,
      NEWLINE,
      onMessage,
      onError,
    )
    pending = jsonResult.pending
    if (jsonResult.hasError) {
      return {
        pending,
        fileMode: null,
        hasError: true,
      }
    }
    if (jsonResult.fileMode) {
      return {
        pending,
        fileMode: jsonResult.fileMode,
        hasError: false,
      }
    }
    // Check if we processed a message and if there are more newlines
    const processedMessage =
      pending.length < previousPendingLength
    const hasMoreNewlines = pending.includes(NEWLINE)
    if (!processedMessage || !hasMoreNewlines) {
      return {
        pending,
        fileMode: null,
        hasError: false,
      }
    }
  }
}

async function parseBufferChunk(
  buffer: Uint8Array,
  textDecoder: TextDecoder,
  NEWLINE: number,
  pending: Uint8Array,
  fileMode: FileModeState | null,
  onMessage: (message: StreamMessage) => void,
  onError: (error: Error) => void,
): Promise<{
  pending: Uint8Array
  fileMode: FileModeState | null
  hasError: boolean
}> {
  let currentPending = concatBuffers(pending, buffer)
  let currentFileMode = fileMode

  while (true) {
    // 1) File mode – collect raw bytes for [ID + file]
    if (currentFileMode) {
      const fileResult = await processFileMode(
        currentPending,
        currentFileMode,
        onMessage,
      )
      currentPending = fileResult.pending
      currentFileMode = fileResult.fileMode
      if (!fileResult.consumed) {
        break
      }
      continue
    }

    // 2) JSON mode – read newline-delimited JSON
    const jsonResult = processAllJsonMessages(
      currentPending,
      textDecoder,
      NEWLINE,
      onMessage,
      onError,
    )
    currentPending = jsonResult.pending
    if (jsonResult.hasError) {
      return {
        pending: currentPending,
        fileMode: currentFileMode,
        hasError: true,
      }
    }
    if (jsonResult.fileMode) {
      currentFileMode = jsonResult.fileMode
      continue
    }
    // No more data to process
    break
  }

  return {
    pending: new Uint8Array(currentPending),
    fileMode: currentFileMode,
    hasError: false,
  }
}

/**
 * Options for finalizing parser state.
 * @group Router
 * @internal
 */
export interface ParserFinalizeOptions {
  /**
   * When true, if we only ever received a header for an UPLOAD_FILE
   * message and no file bytes, we emit a header-only message.
   *
   * This keeps compatibility with your tests:
   *  - "return header message when only file header is received
   *     for UPLOAD_FILE type"
   */
  readonly allowUploadHeaderWithoutFile?: boolean
}

/**
 * Stateful parser that can be reused per connection / per stream.
 * Safe for concurrent connections (one Parser per connection).
 * @group Router
 * @internal
 */
export class Parser {
  private readonly textDecoder: TextDecoder
  private readonly NEWLINE: number
  private pending: Uint8Array
  private fileMode: FileModeState | null

  constructor(newlineChar = '\n') {
    this.textDecoder = new TextDecoder()
    this.NEWLINE = newlineChar.codePointAt(0)!
    this.pending = new Uint8Array(0)
    this.fileMode = null
  }

  /**
   * Feed one or more buffers into the parser and get
   * zero or more fully parsed StreamMessages.
   * @param input - Buffer(s) to parse
   * @returns Array of parsed stream messages
   */
  async feed(
    input: Uint8Array | readonly Uint8Array[],
  ): Promise<readonly StreamMessage[]> {
    const buffers = Array.isArray(input) ? input : [input]

    let merged: Uint8Array
    if (buffers.length === 0) {
      merged = new Uint8Array(0)
    } else if (buffers.length === 1) {
      merged = buffers[0]!
    } else {
      let total = 0
      for (const buf of buffers) {
        total += buf.length
      }
      merged = new Uint8Array(total)
      let offset = 0
      for (const buf of buffers) {
        merged.set(buf, offset)
        offset += buf.length
      }
    }

    const messages: StreamMessage[] = []
    let thrownError: Error | null = null

    const onMessage = (message: StreamMessage) => {
      messages.push(message)
    }
    const onError = (error: Error) => {
      if (!thrownError) {
        thrownError = error
      }
    }

    const result = await parseBufferChunk(
      merged,
      this.textDecoder,
      this.NEWLINE,
      this.pending,
      this.fileMode,
      onMessage,
      onError,
    )

    this.pending = result.pending
    this.fileMode = result.fileMode

    if (result.hasError || thrownError) {
      throw (
        thrownError ??
        new Error('Failed to parse stream message')
      )
    }

    return messages
  }

  /**
   * Flush remaining state:
   * - If in file mode:
   *   - For UPLOAD_FILE with no file bytes consumed and
   *     allowUploadHeaderWithoutFile: true -> emit header-only message.
   *   - Otherwise, treated as incomplete file and throws.
   * - If pending JSON without newline -> parse it as one message (best effort).
   * @param options - Finalize options. See ParserFinalizeOptions interface for details.
   * @returns Array of remaining stream messages
   */
  finalize(
    options: ParserFinalizeOptions = {},
  ): readonly StreamMessage[] {
    const messages: StreamMessage[] = []
    const { allowUploadHeaderWithoutFile } = options

    if (this.fileMode) {
      const totalExpected =
        this.fileMode.header.fileSize + ID_LENGTH
      const consumed =
        totalExpected - this.fileMode.remaining

      if (
        allowUploadHeaderWithoutFile &&
        this.fileMode.header.type ===
          StreamMessageType.UPLOAD_FILE &&
        consumed === 0
      ) {
        // Header-only UPLOAD_FILE, no payload consumed → emit header
        messages.push(this.fileMode.header)
      } else if (consumed > 0) {
        // Partial file payload → considered an error
        throw new Error('Incomplete file payload in stream')
      }
      this.fileMode = null
    }

    if (this.pending.length > 0) {
      try {
        const line = this.textDecoder
          .decode(this.pending)
          .trim()
        if (line) {
          const message = JSON.parse(line) as StreamMessage
          messages.push(message)
        }
      } catch {
        // Ignore trailing garbage
      }
    }

    this.pending = new Uint8Array(0)
    return messages
  }
}

/* ------------------------------------------------------------------
 * HTTP stream parser (ReadableStream)
 * ------------------------------------------------------------------ */

/**
 * Parses a stream response into an async iterable of stream messages.
 * @group Router
 * @internal
 * @param reader - Readable stream reader
 * @returns Async iterable of stream messages
 */
export function parseStreamResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncIterable<StreamMessage> {
  return readable<StreamMessage>({
    async start(controller) {
      const parser = new Parser()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done && !value) break

          if (value && value.length > 0) {
            const messages = await parser.feed(value)
            for (const message of messages) {
              controller.enqueue(message)
            }
          }

          if (done) break
        }

        const tail = parser.finalize({
          allowUploadHeaderWithoutFile: true,
        })
        for (const message of tail) {
          controller.enqueue(message)
        }

        controller.close()
      } catch (error) {
        controller.error(error as Error)
      } finally {
        try {
          reader.releaseLock()
        } catch {
          // ignore
        }
      }
    },
  }) as unknown as AsyncIterable<StreamMessage>
}

/* ------------------------------------------------------------------
 * WebSocket helper (for tests)
 * ------------------------------------------------------------------ */

/**
 * Parses WebSocket stream buffers into stream messages.
 * @group Router
 * @internal
 * @param buffers - Array of buffers to parse
 * @returns Array of parsed stream messages
 */
export async function parseWsStream(
  buffers: readonly Uint8Array[],
): Promise<readonly StreamMessage[]> {
  const parser = new Parser()
  const messages = await parser.feed(buffers)
  const tail = parser.finalize({
    allowUploadHeaderWithoutFile: true,
  })
  return [...messages, ...tail]
}
