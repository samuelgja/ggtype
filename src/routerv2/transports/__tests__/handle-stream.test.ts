/* eslint-disable sonarjs/no-unused-vars */
import { describe, expect, it } from 'bun:test'
import { AsyncStream } from '../../../utils/async-stream'
import {
  handleStreamResponse,
  parseStreamResponse,
  parseWsStream,
  Parser,
} from '../handle-stream'
import {
  StreamMessageType,
  type StreamMessage,
} from '../../router.type'

function createSendFunction(
  messagesById: Record<string, unknown[]>,
  id: string,
) {
  return (message: unknown) => {
    if (!messagesById[id]) {
      messagesById[id] = []
    }
    messagesById[id].push(message)
  }
}

async function* generateItemsForStream(
  id: string,
  count: number,
) {
  for (let index = 0; index < count; index++) {
    yield { id, item: index }
  }
}

async function* generateItems() {
  yield { item: 1 }
  yield { item: 2 }
  yield { item: 3 }
}

function createStream(
  chunks: Uint8Array[],
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk)
      }
      controller.close()
    },
  })
}

describe('handleStreamResponse', () => {
  const encoder = new TextEncoder()
  const actionName = 'testAction'
  const type = StreamMessageType.RESPONSE

  it('should handle normal result', async () => {
    const messages: unknown[] = []
    const send = (message: unknown) => {
      messages.push(message)
    }

    await handleStreamResponse({
      send,
      actionResult: { value: 'test' },
      actionName,
      id: '1234567890123456',
      encoder,
      type,
    })

    expect(messages).toHaveLength(1)
    const decoded = new TextDecoder().decode(
      messages[0] as Uint8Array,
    )
    const parsed = JSON.parse(decoded.trim())
    expect(parsed).toEqual({
      action: actionName,
      id: '1234567890123456',
      status: 'ok',
      data: { value: 'test' },
      type,
    })
  })

  it('should handle file result', async () => {
    const messages: unknown[] = []
    const send = (message: unknown) => {
      messages.push(message)
    }

    const fileContent = 'file content'
    const file = new File([fileContent], 'test.txt')

    await handleStreamResponse({
      send,
      actionResult: file,
      actionName,
      id: '1234567890123456',
      encoder,
      type,
    })

    expect(messages).toHaveLength(2)
    const headerDecoded = new TextDecoder().decode(
      messages[0] as Uint8Array,
    )
    const headerParsed = JSON.parse(headerDecoded.trim())
    expect(headerParsed).toEqual({
      action: actionName,
      id: '1234567890123456',
      status: 'ok',
      withFile: true,
      fileSize: fileContent.length,
      type,
    })
    expect(messages[1]).toBeInstanceOf(Uint8Array)
  })

  it('should handle async stream result', async () => {
    const messages: unknown[] = []
    const send = (message: unknown) => {
      messages.push(message)
    }

    const stream = new AsyncStream<{ item: number }>({
      async start(controller) {
        for await (const item of generateItems()) {
          controller.enqueue(
            item as { item: number } as never,
          )
        }
        controller.close()
      },
    })

    await handleStreamResponse({
      send,
      actionResult: stream,
      actionName,
      id: '1234567890123456',
      encoder,
      type,
    })

    expect(messages).toHaveLength(3)
    for (let index = 0; index < 3; index++) {
      const decoded = new TextDecoder().decode(
        messages[index] as Uint8Array,
      )
      const parsed = JSON.parse(decoded.trim())
      const isLast = index === 2
      expect(parsed).toEqual({
        action: actionName,
        id: '1234567890123456',
        status: 'ok',
        data: { item: index + 1 },
        type,
        ...(isLast ? { isLast: true } : {}),
      })
    }
  })

  it('should handle concurrent calls with different IDs', async () => {
    const messagesById: Record<string, unknown[]> = {}

    const ids = [
      '1111111111111111',
      '2222222222222222',
      '3333333333333333',
      '4444444444444444',
      '5555555555555555',
    ]

    const promises = ids.map((id) =>
      handleStreamResponse({
        send: createSendFunction(messagesById, id),
        actionResult: { id, value: `value-${id}` },
        actionName,
        id,
        encoder,
        type,
      }),
    )

    await Promise.all(promises)

    expect(Object.keys(messagesById)).toHaveLength(
      ids.length,
    )
    for (const id of ids) {
      expect(messagesById[id]).toHaveLength(1)
      const decoded = new TextDecoder().decode(
        messagesById[id][0] as Uint8Array,
      )
      const parsed = JSON.parse(decoded.trim())
      expect(parsed).toEqual({
        action: actionName,
        id,
        status: 'ok',
        data: { id, value: `value-${id}` },
        type,
      })
    }
  })

  it('should handle concurrent file responses with different IDs', async () => {
    const messagesById: Record<string, unknown[]> = {}

    const ids = [
      '1111111111111111',
      '2222222222222222',
      '3333333333333333',
    ]

    const promises = ids.map((id, index) => {
      const fileContent = `file content for ${id}`
      const file = new File(
        [fileContent],
        `test-${index}.txt`,
      )
      return handleStreamResponse({
        send: createSendFunction(messagesById, id),
        actionResult: file,
        actionName,
        id,
        encoder,
        type,
      })
    })

    await Promise.all(promises)

    expect(Object.keys(messagesById)).toHaveLength(
      ids.length,
    )
    for (const id of ids) {
      expect(messagesById[id]).toHaveLength(2)
      const headerDecoded = new TextDecoder().decode(
        messagesById[id][0] as Uint8Array,
      )
      const headerParsed = JSON.parse(headerDecoded.trim())
      expect(headerParsed).toEqual({
        action: actionName,
        id,
        status: 'ok',
        withFile: true,
        fileSize: `file content for ${id}`.length,
        type,
      })
      expect(messagesById[id][1]).toBeInstanceOf(Uint8Array)
    }
  })

  it('should handle concurrent stream responses with different IDs', async () => {
    const messagesById: Record<string, unknown[]> = {}

    const ids = [
      '1111111111111111',
      '2222222222222222',
      '3333333333333333',
    ]

    const promises = ids.map((id) => {
      const stream = new AsyncStream({
        async start(controller) {
          for await (const item of generateItemsForStream(
            id,
            5,
          )) {
            controller.enqueue(
              item as { id: string; item: number } as never,
            )
          }
          controller.close()
        },
      })
      return handleStreamResponse({
        send: createSendFunction(messagesById, id),
        actionResult: stream,
        actionName,
        id,
        encoder,
        type,
      })
    })

    await Promise.all(promises)

    expect(Object.keys(messagesById)).toHaveLength(
      ids.length,
    )
    for (const id of ids) {
      expect(messagesById[id]).toHaveLength(5)
      for (let index = 0; index < 5; index++) {
        const decoded = new TextDecoder().decode(
          messagesById[id][index] as Uint8Array,
        )
        const parsed = JSON.parse(decoded.trim())
        const isLast = index === 4
        expect(parsed).toEqual({
          action: actionName,
          id,
          status: 'ok',
          data: { id, item: index },
          type,
          ...(isLast ? { isLast: true } : {}),
        })
      }
    }
  })

  it('should handle many concurrent calls', async () => {
    const messagesById: Record<string, unknown[]> = {}

    const count = 100
    const ids = Array.from({ length: count }, (_, index) =>
      String(index).padStart(16, '0'),
    )

    const promises = ids.map((id) =>
      handleStreamResponse({
        send: createSendFunction(messagesById, id),
        actionResult: {
          id,
          index: Number.parseInt(id, 10),
        },
        actionName,
        id,
        encoder,
        type,
      }),
    )

    await Promise.all(promises)

    expect(Object.keys(messagesById)).toHaveLength(count)
    for (const id of ids) {
      expect(messagesById[id]).toHaveLength(1)
      const decoded = new TextDecoder().decode(
        messagesById[id][0] as Uint8Array,
      )
      const parsed = JSON.parse(decoded.trim())
      expect(parsed.id).toBe(id)
      expect(parsed.data).toEqual({
        id,
        index: Number.parseInt(id, 10),
      })
    }
  })
})

describe('parseStreamResponse', () => {
  const encoder = new TextEncoder()
  const type = StreamMessageType.RESPONSE

  it('should parse single normal message', async () => {
    const message: unknown = {
      action: 'testAction',
      id: '1234567890123456',
      status: 'ok',
      data: { value: 'test' },
      type,
    }
    const encoded = encoder.encode(
      JSON.stringify(message) + '\n',
    )
    const stream = createStream([encoded])
    const reader = stream.getReader()
    const parsed = parseStreamResponse(reader)

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual(message)
  })

  it('should parse multiple normal messages', async () => {
    const messages: unknown[] = []
    for (let index = 0; index < 10; index++) {
      messages.push({
        action: 'testAction',
        id: '1234567890123456',
        status: 'ok',
        data: { index },
        type,
      })
    }

    const encoded = encoder.encode(
      messages.map((m) => JSON.stringify(m)).join('\n') +
        '\n',
    )
    const stream = createStream([encoded])
    const reader = stream.getReader()
    const parsed = parseStreamResponse(reader)

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(10)
    for (let index = 0; index < 10; index++) {
      expect(results[index]).toEqual(messages[index])
    }
  })

  it('should parse messages split across chunks', async () => {
    const message1 = {
      action: 'testAction',
      id: '1111111111111111',
      status: 'ok',
      data: { value: 1 },
      type,
    }
    const message2 = {
      action: 'testAction',
      id: '2222222222222222',
      status: 'ok',
      data: { value: 2 },
      type,
    }

    const full = encoder.encode(
      JSON.stringify(message1) +
        '\n' +
        JSON.stringify(message2) +
        '\n',
    )

    const chunk1 = full.slice(0, 50)
    const chunk2 = full.slice(50)

    const stream = createStream([chunk1, chunk2])
    const reader = stream.getReader()
    const parsed = parseStreamResponse(reader)

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual(message1)
    expect(results[1]).toEqual(message2)
  })

  it('should parse file message', async () => {
    const { toArrayBuffer } =
      await import('../../../utils/array-buffer-handler')

    const id = '1234567890123456'
    const fileContent = 'test file content'
    const file = new File([fileContent], 'test.txt')

    const fileBuffer = await toArrayBuffer(id, file)
    const fileUint8 = new Uint8Array(fileBuffer)

    const header: unknown = {
      action: 'testAction',
      id,
      status: 'ok',
      withFile: true,
      fileSize: fileContent.length,
      type,
    }

    const headerEncoded = encoder.encode(
      JSON.stringify(header) + '\n',
    )

    const stream = createStream([headerEncoded, fileUint8])
    const reader = stream.getReader()
    const parsed = parseStreamResponse(reader)

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(1)
    const result = results[0] as {
      action: string
      id: string
      status: string
      withFile: boolean
      fileSize: number
      file: Blob
      type: StreamMessageType
    }

    expect(result.action).toBe('testAction')
    expect(result.id).toBe(id)
    expect(result.status).toBe('ok')
    expect(result.withFile).toBe(true)
    expect(result.fileSize).toBe(fileContent.length)
    expect(result.file).toBeInstanceOf(Blob)

    const blobContent = await result.file.text()
    expect(blobContent).toBe(fileContent)
  })

  it('should parse file message split across chunks', async () => {
    const { toArrayBuffer } =
      await import('../../../utils/array-buffer-handler')

    const id = '1234567890123456'
    const fileContent =
      'test file content for chunked parsing'
    const file = new File([fileContent], 'test.txt')

    const fileBuffer = await toArrayBuffer(id, file)
    const fileUint8 = new Uint8Array(fileBuffer)

    const header: unknown = {
      action: 'testAction',
      id,
      status: 'ok',
      withFile: true,
      fileSize: fileContent.length,
      type,
    }

    const headerEncoded = encoder.encode(
      JSON.stringify(header) + '\n',
    )

    const chunk1 = fileUint8.slice(0, 10)
    const chunk2 = fileUint8.slice(10, 20)
    const chunk3 = fileUint8.slice(20)

    const stream = createStream([
      headerEncoded,
      chunk1,
      chunk2,
      chunk3,
    ])
    const reader = stream.getReader()
    const parsed = parseStreamResponse(reader)

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(1)
    const result = results[0] as {
      file: Blob
    }

    const blobContent = await result.file.text()
    expect(blobContent).toBe(fileContent)
  })

  it('should parse many messages in sequence', async () => {
    const count = 1000
    const messages: unknown[] = []
    for (let index = 0; index < count; index++) {
      messages.push({
        action: 'testAction',
        id: String(index).padStart(16, '0'),
        status: 'ok',
        data: { index },
        type,
      })
    }

    const encoded = encoder.encode(
      messages.map((m) => JSON.stringify(m)).join('\n') +
        '\n',
    )
    const stream = createStream([encoded])
    const reader = stream.getReader()
    const parsed = parseStreamResponse(reader)

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(count)
    for (let index = 0; index < count; index++) {
      expect(
        (results[index] as { data: { index: number } }).data
          .index,
      ).toBe(index)
    }
  })

  it('should handle concurrent streams with different IDs', async () => {
    const streamCount = 10
    const messagesPerStream = 20

    const createStreamForId = (streamId: string) => {
      const messages: unknown[] = []
      for (
        let index = 0;
        index < messagesPerStream;
        index++
      ) {
        messages.push({
          action: 'testAction',
          id: streamId,
          status: 'ok',
          data: { streamId, index },
          type,
        })
      }

      const encoded = encoder.encode(
        messages.map((m) => JSON.stringify(m)).join('\n') +
          '\n',
      )
      return createStream([encoded])
    }

    const streamIds = Array.from(
      { length: streamCount },
      (_, index) => String(index).padStart(16, '0'),
    )

    const parsePromises = streamIds.map(
      async (streamId) => {
        const stream = createStreamForId(streamId)
        const reader = stream.getReader()
        const parsed = parseStreamResponse(reader)

        const results: unknown[] = []
        for await (const item of parsed) {
          results.push(item)
        }
        return { streamId, results }
      },
    )

    const allResults = await Promise.all(parsePromises)

    expect(allResults).toHaveLength(streamCount)
    for (const { streamId, results } of allResults) {
      expect(results).toHaveLength(messagesPerStream)
      for (
        let index = 0;
        index < messagesPerStream;
        index++
      ) {
        const message = results[index] as {
          id: string
          data: { streamId: string; index: number }
        }
        expect(message.id).toBe(streamId)
        expect(message.data.streamId).toBe(streamId)
        expect(message.data.index).toBe(index)
      }
    }
  })

  it('should handle concurrent file streams with different IDs', async () => {
    const { toArrayBuffer } =
      await import('../../../utils/array-buffer-handler')

    const streamCount = 5

    const createFileStreamForId = async (
      streamId: string,
    ) => {
      const fileContent = `file content for stream ${streamId}`
      const file = new File(
        [fileContent],
        `test-${streamId}.txt`,
      )

      const fileBuffer = await toArrayBuffer(streamId, file)
      const fileUint8 = new Uint8Array(fileBuffer)

      const header: unknown = {
        action: 'testAction',
        id: streamId,
        status: 'ok',
        withFile: true,
        fileSize: fileContent.length,
        type,
      }

      const headerEncoded = encoder.encode(
        JSON.stringify(header) + '\n',
      )

      return createStream([headerEncoded, fileUint8])
    }

    const streamIds = Array.from(
      { length: streamCount },
      (_, index) => String(index).padStart(16, '0'),
    )

    const parsePromises = streamIds.map(
      async (streamId) => {
        const stream = await createFileStreamForId(streamId)
        const reader = stream.getReader()
        const parsed = parseStreamResponse(reader)

        const results: unknown[] = []
        for await (const item of parsed) {
          results.push(item)
        }
        return { streamId, results }
      },
    )

    const allResults = await Promise.all(parsePromises)

    expect(allResults).toHaveLength(streamCount)
    for (const { streamId, results } of allResults) {
      expect(results).toHaveLength(1)
      const result = results[0] as {
        id: string
        file: Blob
      }
      expect(result.id).toBe(streamId)
      expect(result.file).toBeInstanceOf(Blob)

      const blobContent = await result.file.text()
      expect(blobContent).toBe(
        `file content for stream ${streamId}`,
      )
    }
  })

  it('should handle mixed normal and file messages in sequence', async () => {
    const { toArrayBuffer } =
      await import('../../../utils/array-buffer-handler')

    const normalMessage1: unknown = {
      action: 'testAction',
      id: '1111111111111111',
      status: 'ok',
      data: { value: 1 },
      type,
    }

    const fileId = '2222222222222222'
    const fileContent = 'file content'
    const file = new File([fileContent], 'test.txt')
    const fileBuffer = await toArrayBuffer(fileId, file)
    const fileUint8 = new Uint8Array(fileBuffer)

    const fileHeader: unknown = {
      action: 'testAction',
      id: fileId,
      status: 'ok',
      withFile: true,
      fileSize: fileContent.length,
      type,
    }

    const normalMessage2: unknown = {
      action: 'testAction',
      id: '3333333333333333',
      status: 'ok',
      data: { value: 2 },
      type,
    }

    const chunks = [
      encoder.encode(JSON.stringify(normalMessage1) + '\n'),
      encoder.encode(JSON.stringify(fileHeader) + '\n'),
      fileUint8,
      encoder.encode(JSON.stringify(normalMessage2) + '\n'),
    ]

    const stream = createStream(chunks)
    const reader = stream.getReader()
    const parsed = parseStreamResponse(reader)

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(3)

    expect(results[0]).toEqual(normalMessage1)

    const fileResult = results[1] as {
      id: string
      file: Blob
    }
    expect(fileResult.id).toBe(fileId)
    expect(fileResult.file).toBeInstanceOf(Blob)
    const blobContent = await fileResult.file.text()
    expect(blobContent).toBe(fileContent)

    expect(results[2]).toEqual(normalMessage2)
  })

  it('should parse file message from handleStreamResponse with UPLOAD_FILE type', async () => {
    const actionName = '__uploadFile'
    const id = '1234567890123456'
    const fileContent = 'test file content for upload'
    const file = new File([fileContent], 'test.txt')

    const buffers: Uint8Array[] = []
    const send = (message: unknown) => {
      buffers.push(message as Uint8Array)
    }

    await handleStreamResponse({
      send,
      actionResult: file,
      actionName,
      id,
      encoder,
      type: StreamMessageType.UPLOAD_FILE,
    })

    expect(buffers).toHaveLength(2)

    const stream = createStream(buffers)
    const reader = stream.getReader()
    const parsed = parseStreamResponse(reader)

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(1)
    const result = results[0] as {
      action: string
      id: string
      status: string
      withFile: boolean
      fileSize: number
      file: Blob
      type: StreamMessageType
    }

    expect(result.action).toBe(actionName)
    expect(result.id).toBe(id)
    expect(result.status).toBe('ok')
    expect(result.withFile).toBe(true)
    expect(result.fileSize).toBe(fileContent.length)
    expect(result.type).toBe(StreamMessageType.UPLOAD_FILE)
    expect(result.file).toBeInstanceOf(Blob)

    const blobContent = await result.file.text()
    expect(blobContent).toBe(fileContent)
  })

  it('should return header message when only file header is received for UPLOAD_FILE type', async () => {
    const actionName = '__uploadFile'
    const id = '1234567890123456'
    const fileContent = 'test file content for upload'
    const file = new File([fileContent], 'test.txt')

    const buffers: Uint8Array[] = []
    const send = (message: unknown) => {
      buffers.push(message as Uint8Array)
    }

    await handleStreamResponse({
      send,
      actionResult: file,
      actionName,
      id,
      encoder,
      type: StreamMessageType.UPLOAD_FILE,
    })

    expect(buffers).toHaveLength(2)

    const headerBuffer = buffers[0]!
    const stream = createStream([headerBuffer])
    const reader = stream.getReader()
    const parsed = parseStreamResponse(reader)

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(1)
    const result = results[0] as {
      action: string
      id: string
      status: string
      withFile: boolean
      fileSize: number
      type: StreamMessageType
    }

    expect(result.action).toBe(actionName)
    expect(result.id).toBe(id)
    expect(result.status).toBe('ok')
    expect(result.withFile).toBe(true)
    expect(result.fileSize).toBe(fileContent.length)
    expect(result.type).toBe(StreamMessageType.UPLOAD_FILE)
    expect('file' in result).toBe(false)
  })

  it('should error on invalid JSON in stream', async () => {
    const invalid = encoder.encode('not-json\n')
    const stream = createStream([invalid])
    const reader = stream.getReader()
    const parsed = parseStreamResponse(reader)

    let caughtError: Error | null = null
    try {
      // eslint-disable-next-line no-empty, unicorn/empty-brace-spaces
      for await (const _ of parsed) {
      }
    } catch (error) {
      caughtError = error as Error
    }

    expect(caughtError).not.toBeNull()
    expect(caughtError?.message).toMatch(/Failed to parse/)
  })
})

describe('parseWsStream', () => {
  const encoder = new TextEncoder()
  const type = StreamMessageType.RESPONSE

  it('should parse single normal message', async () => {
    const message: StreamMessage = {
      action: 'testAction',
      id: '1234567890123456',
      status: 'ok',
      data: { value: 'test' },
      type,
    }
    const encoded = encoder.encode(
      JSON.stringify(message) + '\n',
    )
    const results = await parseWsStream([encoded])

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual(message)
  })

  it('should parse multiple normal messages', async () => {
    const messages: StreamMessage[] = []
    for (let index = 0; index < 10; index++) {
      messages.push({
        action: 'testAction',
        id: '1234567890123456',
        status: 'ok',
        data: { index },
        type,
      })
    }

    const encoded = encoder.encode(
      messages.map((m) => JSON.stringify(m)).join('\n') +
        '\n',
    )
    const results = await parseWsStream([encoded])

    expect(results).toHaveLength(10)
    for (let index = 0; index < 10; index++) {
      expect(results[index]).toEqual(messages[index])
    }
  })

  it('should parse messages split across multiple buffers', async () => {
    const message1: StreamMessage = {
      action: 'testAction',
      id: '1111111111111111',
      status: 'ok',
      data: { value: 1 },
      type,
    }
    const message2: StreamMessage = {
      action: 'testAction',
      id: '2222222222222222',
      status: 'ok',
      data: { value: 2 },
      type,
    }

    const full = encoder.encode(
      JSON.stringify(message1) +
        '\n' +
        JSON.stringify(message2) +
        '\n',
    )

    const buffer1 = full.slice(0, 50)
    const buffer2 = full.slice(50)

    const results = await parseWsStream([buffer1, buffer2])

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual(message1)
    expect(results[1]).toEqual(message2)
  })

  it('should parse file message', async () => {
    const { toArrayBuffer } =
      await import('../../../utils/array-buffer-handler')

    const id = '1234567890123456'
    const fileContent = 'test file content'
    const file = new File([fileContent], 'test.txt')

    const fileBuffer = await toArrayBuffer(id, file)
    const fileUint8 = new Uint8Array(fileBuffer)

    const header: unknown = {
      action: 'testAction',
      id,
      status: 'ok',
      withFile: true,
      fileSize: fileContent.length,
      type,
    }

    const headerEncoded = encoder.encode(
      JSON.stringify(header) + '\n',
    )

    const results = await parseWsStream([
      headerEncoded,
      fileUint8,
    ])

    expect(results).toHaveLength(1)
    const result = results[0] as {
      action: string
      id: string
      status: string
      withFile: boolean
      fileSize: number
      file: Blob
      type: StreamMessageType
    }

    expect(result.action).toBe('testAction')
    expect(result.id).toBe(id)
    expect(result.status).toBe('ok')
    expect(result.withFile).toBe(true)
    expect(result.fileSize).toBe(fileContent.length)
    expect(result.file).toBeInstanceOf(Blob)

    const blobContent = await result.file.text()
    expect(blobContent).toBe(fileContent)
  })

  it('should parse file message split across multiple buffers', async () => {
    const { toArrayBuffer } =
      await import('../../../utils/array-buffer-handler')

    const id = '1234567890123456'
    const fileContent =
      'test file content for chunked parsing'
    const file = new File([fileContent], 'test.txt')

    const fileBuffer = await toArrayBuffer(id, file)
    const fileUint8 = new Uint8Array(fileBuffer)

    const header: unknown = {
      action: 'testAction',
      id,
      status: 'ok',
      withFile: true,
      fileSize: fileContent.length,
      type,
    }

    const headerEncoded = encoder.encode(
      JSON.stringify(header) + '\n',
    )

    const buffer1 = fileUint8.slice(0, 10)
    const buffer2 = fileUint8.slice(10, 20)
    const buffer3 = fileUint8.slice(20)

    const results = await parseWsStream([
      headerEncoded,
      buffer1,
      buffer2,
      buffer3,
    ])

    expect(results).toHaveLength(1)
    const result = results[0] as {
      file: Blob
    }

    const blobContent = await result.file.text()
    expect(blobContent).toBe(fileContent)
  })

  it('should parse many messages in sequence', async () => {
    const count = 1000
    const messages: unknown[] = []
    for (let index = 0; index < count; index++) {
      messages.push({
        action: 'testAction',
        id: String(index).padStart(16, '0'),
        status: 'ok',
        data: { index },
        type,
      })
    }

    const encoded = encoder.encode(
      messages.map((m) => JSON.stringify(m)).join('\n') +
        '\n',
    )
    const results = await parseWsStream([encoded])

    expect(results).toHaveLength(count)
    for (let index = 0; index < count; index++) {
      expect(
        (results[index] as { data: { index: number } }).data
          .index,
      ).toBe(index)
    }
  })

  it('should handle mixed normal and file messages in sequence', async () => {
    const { toArrayBuffer } =
      await import('../../../utils/array-buffer-handler')

    const normalMessage1: StreamMessage = {
      action: 'testAction',
      id: '1111111111111111',
      status: 'ok',
      data: { value: 1 },
      type,
    }

    const fileId = '2222222222222222'
    const fileContent = 'file content'
    const file = new File([fileContent], 'test.txt')
    const fileBuffer = await toArrayBuffer(fileId, file)
    const fileUint8 = new Uint8Array(fileBuffer)

    const fileHeader: StreamMessage = {
      action: 'testAction',
      id: fileId,
      status: 'ok',
      withFile: true,
      fileSize: fileContent.length,
      type,
    }

    const normalMessage2: StreamMessage = {
      action: 'testAction',
      id: '3333333333333333',
      status: 'ok',
      data: { value: 2 },
      type,
    }

    const buffers = [
      encoder.encode(JSON.stringify(normalMessage1) + '\n'),
      encoder.encode(JSON.stringify(fileHeader) + '\n'),
      fileUint8,
      encoder.encode(JSON.stringify(normalMessage2) + '\n'),
    ]

    const results = await parseWsStream(buffers)

    expect(results).toHaveLength(3)

    expect(results[0]).toEqual(normalMessage1)

    const fileResult = results[1] as {
      id: string
      file: Blob
    }
    expect(fileResult.id).toBe(fileId)
    expect(fileResult.file).toBeInstanceOf(Blob)
    const blobContent = await fileResult.file.text()
    expect(blobContent).toBe(fileContent)

    expect(results[2]).toEqual(normalMessage2)
  })

  it('should handle empty buffer array', async () => {
    const results = await parseWsStream([])
    expect(results).toHaveLength(0)
  })

  it('should handle single empty buffer', async () => {
    const results = await parseWsStream([new Uint8Array(0)])
    expect(results).toHaveLength(0)
  })

  it('should handle message without trailing newline', async () => {
    const message: StreamMessage = {
      action: 'testAction',
      id: '1234567890123456',
      status: 'ok',
      data: { value: 'test' },
      type,
    }
    const encoded = encoder.encode(JSON.stringify(message))
    const results = await parseWsStream([encoded])

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual(message)
  })

  it('should handle multiple buffers with partial messages', async () => {
    const message1: StreamMessage = {
      action: 'testAction',
      id: '1111111111111111',
      status: 'ok',
      data: { value: 1 },
      type,
    }
    const message2: StreamMessage = {
      action: 'testAction',
      id: '2222222222222222',
      status: 'ok',
      data: { value: 2 },
      type,
    }

    const full = encoder.encode(
      JSON.stringify(message1) +
        '\n' +
        JSON.stringify(message2) +
        '\n',
    )

    const buffer1 = full.slice(0, 30)
    const buffer2 = full.slice(30, 60)
    const buffer3 = full.slice(60)

    const results = await parseWsStream([
      buffer1,
      buffer2,
      buffer3,
    ])

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual(message1)
    expect(results[1]).toEqual(message2)
  })

  it('should parse file message from handleStreamResponse with UPLOAD_FILE type', async () => {
    const actionName = '__uploadFile'
    const id = '1234567890123456'
    const fileContent = 'test file content for upload'
    const file = new File([fileContent], 'test.txt')

    const buffers: Uint8Array[] = []
    const send = (message: unknown) => {
      buffers.push(message as Uint8Array)
    }

    await handleStreamResponse({
      send,
      actionResult: file,
      actionName,
      id,
      encoder,
      type: StreamMessageType.UPLOAD_FILE,
    })

    expect(buffers).toHaveLength(2)

    const messages = await parseWsStream(buffers)

    expect(messages).toHaveLength(1)
    const result = messages[0] as {
      action: string
      id: string
      status: string
      withFile: boolean
      fileSize: number
      file: Blob
      type: StreamMessageType
    }

    expect(result.action).toBe(actionName)
    expect(result.id).toBe(id)
    expect(result.status).toBe('ok')
    expect(result.withFile).toBe(true)
    expect(result.fileSize).toBe(fileContent.length)
    expect(result.type).toBe(StreamMessageType.UPLOAD_FILE)
    expect(result.file).toBeInstanceOf(Blob)

    const blobContent = await result.file.text()
    expect(blobContent).toBe(fileContent)
  })

  it('should return header message when only file header is received for UPLOAD_FILE type', async () => {
    const actionName = '__uploadFile'
    const id = '1234567890123456'
    const fileContent = 'test file content for upload'
    const file = new File([fileContent], 'test.txt')

    const buffers: Uint8Array[] = []
    const send = (message: unknown) => {
      buffers.push(message as Uint8Array)
    }

    await handleStreamResponse({
      send,
      actionResult: file,
      actionName,
      id,
      encoder,
      type: StreamMessageType.UPLOAD_FILE,
    })

    expect(buffers).toHaveLength(2)

    const headerBuffer = buffers[0]!
    const messages = await parseWsStream([headerBuffer])

    expect(messages).toHaveLength(1)
    const result = messages[0] as {
      action: string
      id: string
      status: string
      withFile: boolean
      fileSize: number
      type: StreamMessageType
    }

    expect(result.action).toBe(actionName)
    expect(result.id).toBe(id)
    expect(result.status).toBe('ok')
    expect(result.withFile).toBe(true)
    expect(result.fileSize).toBe(fileContent.length)
    expect(result.type).toBe(StreamMessageType.UPLOAD_FILE)
    expect('file' in result).toBe(false)
  })

  it('should handle empty file (fileSize: 0) with UPLOAD_FILE type', async () => {
    const actionName = '__uploadFile'
    const id = '1234567890123456'
    const fileContent = ''
    const file = new File([fileContent], 'empty.txt')

    const buffers: Uint8Array[] = []
    const send = (message: unknown) => {
      buffers.push(message as Uint8Array)
    }

    await handleStreamResponse({
      send,
      actionResult: file,
      actionName,
      id,
      encoder,
      type: StreamMessageType.UPLOAD_FILE,
    })

    expect(buffers).toHaveLength(2)

    const messages = await parseWsStream(buffers)

    expect(messages).toHaveLength(1)
    const result = messages[0] as {
      action: string
      id: string
      status: string
      withFile: boolean
      fileSize: number
      file: Blob
      type: StreamMessageType
    }

    expect(result.action).toBe(actionName)
    expect(result.id).toBe(id)
    expect(result.status).toBe('ok')
    expect(result.withFile).toBe(true)
    expect(result.fileSize).toBe(0)
    expect(result.type).toBe(StreamMessageType.UPLOAD_FILE)
    expect(result.file).toBeInstanceOf(Blob)

    const blobContent = await result.file.text()
    expect(blobContent).toBe(fileContent)
    expect(blobContent.length).toBe(0)
  })

  it('should verify file content matches exactly when parsing UPLOAD_FILE', async () => {
    const actionName = '__uploadFile'
    const id = '1234567890123456'
    const fileContent =
      'test file content that must match exactly'
    const file = new File([fileContent], 'test.txt')

    const buffers: Uint8Array[] = []
    const send = (message: unknown) => {
      buffers.push(message as Uint8Array)
    }

    await handleStreamResponse({
      send,
      actionResult: file,
      actionName,
      id,
      encoder,
      type: StreamMessageType.UPLOAD_FILE,
    })

    const messages = await parseWsStream(buffers)

    expect(messages).toHaveLength(1)
    const result = messages[0] as {
      file: Blob
      fileSize: number
    }

    expect(result.fileSize).toBe(fileContent.length)

    const blobContent = await result.file.text()
    expect(blobContent).toBe(fileContent)
    expect(blobContent.length).toBe(fileContent.length)
  })

  it('should error on invalid JSON for WebSocket stream', async () => {
    const invalid = encoder.encode('not-json\n')

    let caughtError: Error | null = null
    try {
      await parseWsStream([invalid])
    } catch (error) {
      caughtError = error as Error
    }

    expect(caughtError).not.toBeNull()
    expect(caughtError?.message).toMatch(/Failed to parse/)
  })
})

describe('Parser class (incremental use)', () => {
  const encoder = new TextEncoder()
  const type = StreamMessageType.RESPONSE

  it('should parse incremental file message across multiple feed calls', async () => {
    const { toArrayBuffer } =
      await import('../../../utils/array-buffer-handler')

    const id = '1234567890123456'
    const fileContent = 'incremental file content'
    const file = new File([fileContent], 'test.txt')

    const fileBuffer = await toArrayBuffer(id, file)
    const fileUint8 = new Uint8Array(fileBuffer)

    const header: StreamMessage = {
      action: 'testAction',
      id,
      status: 'ok',
      withFile: true,
      fileSize: fileContent.length,
      type,
    }

    const headerEncoded = encoder.encode(
      JSON.stringify(header) + '\n',
    )

    const parser = new Parser()

    const firstMessages = await parser.feed(headerEncoded)
    expect(firstMessages).toHaveLength(0)

    const secondMessages = await parser.feed(fileUint8)
    expect(secondMessages).toHaveLength(1)

    const result = secondMessages[0] as {
      id: string
      file: Blob
    }
    expect(result.id).toBe(id)
    expect(result.file).toBeInstanceOf(Blob)
    const blobContent = await result.file.text()
    expect(blobContent).toBe(fileContent)

    const tail = parser.finalize({
      allowUploadHeaderWithoutFile: true,
    })
    expect(tail).toHaveLength(0)
  })

  it('should emit header-only message for UPLOAD_FILE when finalized without payload', async () => {
    const actionName = '__uploadFile'
    const id = '1234567890123456'
    const fileContent = 'header-only upload'
    const file = new File([fileContent], 'test.txt')

    const buffers: Uint8Array[] = []
    const send = (message: unknown) => {
      buffers.push(message as Uint8Array)
    }

    await handleStreamResponse({
      send,
      actionResult: file,
      actionName,
      id,
      encoder,
      type: StreamMessageType.UPLOAD_FILE,
    })

    const headerBuffer = buffers[0]!
    const parser = new Parser()
    const messages = await parser.feed(headerBuffer)
    expect(messages).toHaveLength(0)

    const tail = await parser.feed([buffers[1]!])

    const result = tail[0] as {
      action: string
      id: string
      withFile: boolean
      fileSize: number
      type: StreamMessageType
    }
    expect(result.action).toBe(actionName)
    expect(result.id).toBe(id)
    expect(result.withFile).toBe(true)
    expect(result.fileSize).toBe(fileContent.length)
    expect(result.type).toBe(StreamMessageType.UPLOAD_FILE)
    expect('file' in result).toBe(true)
  })

  it('should throw on incomplete non-UPLOAD_FILE file payload on finalize', async () => {
    const id = '1234567890123456'
    const header: unknown = {
      action: 'testAction',
      id,
      status: 'ok',
      withFile: true,
      fileSize: 10,
      type: StreamMessageType.RESPONSE, // not UPLOAD_FILE
    }

    const headerEncoded = encoder.encode(
      JSON.stringify(header) + '\n',
    )

    const partialPayload = new Uint8Array(5) // less than fileSize + ID_LENGTH

    const parser = new Parser()
    await parser.feed(headerEncoded)
    await parser.feed(partialPayload)

    let caughtError: Error | null = null
    try {
      parser.finalize({
        allowUploadHeaderWithoutFile: true,
      })
    } catch (error) {
      caughtError = error as Error
    }

    expect(caughtError).not.toBeNull()
    expect(caughtError?.message).toMatch(/Incomplete file/)
  })
  it('should handle just single message', async () => {
    const message: StreamMessage = {
      action: 'testAction',
      id: '1234567890123456',
      status: 'ok',
      data: { value: 'test' },
      type,
    }
    const buffers: Uint8Array[] = []
    const onMessage = (data: Uint8Array) => {
      buffers.push(data)
    }
    await handleStreamResponse({
      actionName: 'testAction',
      id: '1234567890123456',
      encoder,
      type,
      actionResult: message,
      send: onMessage,
    })

    const parser = new Parser()
    const messages = await parser.feed(buffers)
    expect(messages).toHaveLength(1)
    expect(messages[0].data).toEqual(message)
  })
})
