/* eslint-disable sonarjs/no-labels */
/* eslint-disable sonarjs/cognitive-complexity */
import {
  fromArrayBuffer,
  ID_LENGTH,
  isFile,
  toArrayBuffer,
} from '../../utils/array-buffer-handler'
import type { AsyncStream } from '../../utils/async-stream'
import { isStream } from '../../utils/is'
import { JSONL } from '../../utils/stream-helpers'
import type { StreamMessage } from '../router.type'

interface Options {
  controller: ReadableStreamDefaultController
  actionResult: unknown
  actionName: string
  id: string
  encoder: TextEncoder
}

export async function handleStreamResponse(
  options: Options,
) {
  const {
    controller,
    actionResult,
    actionName,
    id,
    encoder,
  } = options

  // 1) File result
  if (isFile(actionResult)) {
    const file = actionResult as File
    const message: StreamMessage = {
      action: actionName,
      id,
      status: 'ok',
      withFile: true,
      fileSize: file.size,
    }

    const rawMessage = JSONL(message)
    const encodedMessage = encoder.encode(rawMessage)

    const fileBufferWithId = await toArrayBuffer(id, file)

    controller.enqueue(encodedMessage)
    controller.enqueue(new Uint8Array(fileBufferWithId))
    return
  }

  // 2) Async stream result
  if (isStream(actionResult)) {
    const asyncStream = actionResult as AsyncStream<unknown>
    for await (const item of asyncStream) {
      const message: StreamMessage = {
        action: actionName,
        id,
        status: 'ok',
        data: item,
      }
      const rawMessage = JSONL(message)
      const encodedMessage = encoder.encode(rawMessage)
      controller.enqueue(encodedMessage)
    }
    return
  }

  // 3) Normal result
  const message: StreamMessage = {
    action: actionName,
    id,
    status: 'ok',
    data: actionResult,
  }
  const rawMessage = JSONL(message)
  const encodedMessage = encoder.encode(rawMessage)
  controller.enqueue(encodedMessage)
}

export function parseStreamResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncIterable<StreamMessage> {
  return new ReadableStream<StreamMessage>({
    async start(controller) {
      const textDecoder = new TextDecoder()
      const NEWLINE = '\n'.codePointAt(0)

      let pending = new Uint8Array(0)

      type FileModeState = {
        header: StreamMessage & { fileSize: number }
        remaining: number
        chunks: Uint8Array[]
      }

      let fileMode: FileModeState | null = null

      const concat = (
        a: Uint8Array,
        b: Uint8Array,
      ): Uint8Array => {
        if (a.length === 0) return b
        if (b.length === 0) return a
        const out = new Uint8Array(a.length + b.length)
        out.set(a, 0)
        out.set(b, a.length)
        return out
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done && !value) break

          if (value && value.length > 0) {
            pending = concat(pending, value) as never
          }

          // Process as much as we can from the buffer
          processLoop: while (true) {
            // 1) Expecting next JSON header
            if (fileMode) {
              // 2) We are in "file mode" – consume raw bytes
              if (pending.length === 0) {
                break processLoop
              }

              const toConsume = Math.min(
                fileMode.remaining,
                pending.length,
              )
              const part = pending.slice(0, toConsume)
              pending = pending.slice(toConsume)

              fileMode.chunks.push(part)
              fileMode.remaining -= toConsume

              // Got full file payload (ID + file bytes)
              if (fileMode.remaining === 0) {
                const totalLength = fileMode.chunks.reduce(
                  (sum, chunk) => sum + chunk.length,
                  0,
                )
                const merged = new Uint8Array(totalLength)
                let offset = 0
                for (const chunk of fileMode.chunks) {
                  merged.set(chunk, offset)
                  offset += chunk.length
                }

                // Decode ID + Blob
                const arrayBuffer = merged.buffer.slice(
                  merged.byteOffset,
                  merged.byteOffset + merged.byteLength,
                )
                const { id, input } =
                  await fromArrayBuffer(arrayBuffer)

                const result: StreamMessage = {
                  ...fileMode.header,
                  id,
                  file: input, // Blob
                }

                controller.enqueue(result)
                fileMode = null
              }
            } else {
              const newlineIndex = pending.indexOf(
                NEWLINE as number,
              )
              if (
                typeof newlineIndex !== 'number' ||
                newlineIndex === -1
              ) {
                // no full line yet
                break processLoop
              }

              const lineBytes = pending.slice(
                0,
                newlineIndex,
              )
              pending = pending.slice(newlineIndex + 1)

              const line = textDecoder
                .decode(lineBytes)
                .trim()
              if (!line) {
                continue processLoop
              }

              let message: StreamMessage
              try {
                message = JSON.parse(line) as StreamMessage
              } catch (error) {
                controller.error(
                  new Error(
                    `Failed to parse stream message: ${
                      (error as Error).message
                    }`,
                  ),
                )
                return
              }

              if (message.withFile) {
                if (typeof message.fileSize !== 'number') {
                  controller.error(
                    new Error(
                      'Stream message with file must contain fileSize',
                    ),
                  )
                  return
                }

                fileMode = {
                  header: message as StreamMessage & {
                    fileSize: number
                  },
                  remaining: message.fileSize + ID_LENGTH,
                  chunks: [],
                }
              } else {
                controller.enqueue(message)
              }
            }
          }

          if (done) break
        }

        // Flush a final JSON line without trailing newline (if any)
        if (pending.length > 0 && !fileMode) {
          try {
            const line = textDecoder.decode(pending).trim()
            if (line) {
              const message = JSON.parse(
                line,
              ) as StreamMessage
              controller.enqueue(message)
            }
          } catch {
            // ignore trailing garbage
          }
        }

        controller.close()
      } catch (error) {
        controller.error(error)
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
