import { describe, it, expect } from 'bun:test'
import { AsyncStream } from '../../../utils/async-stream'
import { readable } from '../../../utils/readable'
import { handleStreamResponse } from '../handle-stream'
import {
  Parser,
  parseStreamResponse,
  parseWsStream,
} from '../handle-stream'
import { StreamMessageType } from '../../router.type'

describe('handleStreamResponse', () => {
  it('should handle normal result', async () => {
    const messages: Uint8Array[] = []
    const encoder = new TextEncoder()

    await handleStreamResponse({
      send: (message) => messages.push(message),
      actionResult: { value: 'test' },
      actionName: 'testAction',
      id: '1234567890123456',
      encoder,
      type: StreamMessageType.SERVER_ACTION_RESULT,
    })

    expect(messages).toHaveLength(1)
    const decoded = new TextDecoder().decode(
      messages[0] as Uint8Array,
    )
    const parsed = JSON.parse(decoded.trim())
    expect(parsed).toEqual({
      action: 'testAction',
      data: {
        value: 'test',
      },
      id: '1234567890123456',
      status: 'ok',
      type: StreamMessageType.SERVER_ACTION_RESULT,
      isLast: true,
    })
  })

  it('should handle file result', async () => {
    const messages: Uint8Array[] = []
    const encoder = new TextEncoder()
    const file = new File(['test content'], 'test.txt')

    await handleStreamResponse({
      send: (message) => messages.push(message),
      actionResult: file,
      actionName: 'testAction',
      id: '1234567890123456',
      encoder,
      type: StreamMessageType.SERVER_ACTION_RESULT,
    })

    expect(messages).toHaveLength(2)
    const headerDecoded = new TextDecoder().decode(
      messages[0] as Uint8Array,
    )
    const headerParsed = JSON.parse(headerDecoded.trim())
    expect(headerParsed).toEqual({
      action: 'testAction',
      fileSize: 12,
      id: '1234567890123456',
      status: 'ok',
      type: StreamMessageType.SERVER_ACTION_RESULT,
      withFile: true,
      isLast: true,
    })
    expect(messages[1]).toBeInstanceOf(Uint8Array)
  })

  it('should handle async stream result', async () => {
    const messages: Uint8Array[] = []
    const encoder = new TextEncoder()

    const readableStream = readable<{ item: number }>({
      start(controller: {
        enqueue: (argument0: { item: number }) => void
        close: () => void
      }) {
        for (let index = 1; index <= 3; index++) {
          controller.enqueue({ item: index })
        }
        controller.close()
      },
    })
    const stream = new AsyncStream<{ item: number }>(
      readableStream,
    )

    await handleStreamResponse({
      send: (message) => messages.push(message),
      actionResult: stream,
      actionName: 'testAction',
      id: '1234567890123456',
      encoder,
      type: StreamMessageType.SERVER_ACTION_RESULT,
    })

    expect(messages).toHaveLength(3)
    for (let index = 0; index < 3; index++) {
      const decoded = new TextDecoder().decode(
        messages[index] as Uint8Array,
      )
      const parsed = JSON.parse(decoded.trim())
      const isLast = index === 2
      expect(parsed).toEqual({
        action: 'testAction',
        data: {
          item: index + 1,
        },
        id: '1234567890123456',
        status: 'ok',
        type: StreamMessageType.SERVER_ACTION_RESULT,
        isLast,
      })
    }
  })

  it('should handle empty async stream', async () => {
    const messages: Uint8Array[] = []
    const encoder = new TextEncoder()

    const readableStream = readable<unknown>({
      start(controller) {
        controller.close()
      },
    })
    const stream = new AsyncStream<unknown>(readableStream)

    await handleStreamResponse({
      send: (message) => messages.push(message),
      actionResult: stream,
      actionName: 'testAction',
      id: '1234567890123456',
      encoder,
      type: StreamMessageType.SERVER_ACTION_RESULT,
    })

    expect(messages).toHaveLength(1)
    const decoded = new TextDecoder().decode(
      messages[0] as Uint8Array,
    )
    const parsed = JSON.parse(decoded.trim())
    expect(parsed).toEqual({
      action: 'testAction',
      id: '1234567890123456',
      status: 'ok',
      type: StreamMessageType.SERVER_ACTION_RESULT,
      isLast: true,
    })
  })
})

describe('parseStreamResponse', () => {
  it('should parse single normal message', async () => {
    const encoder = new TextEncoder()
    const message = {
      action: 'testAction',
      id: '1234567890123456',
      status: 'ok' as const,
      data: { value: 'test' },
      type: StreamMessageType.SERVER_ACTION_RESULT,
    }
    const encoded = encoder.encode(
      JSON.stringify(message) + '\n',
    )

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoded)
        controller.close()
      },
    })

    const reader = stream.getReader()
    const parsed = parseStreamResponse(
      reader as ReadableStreamDefaultReader<Uint8Array>,
    )

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual(message)
  })

  it('should parse multiple normal messages', async () => {
    const encoder = new TextEncoder()
    const messages = Array.from(
      { length: 10 },
      (_, index) => ({
        action: 'testAction',
        id: '1234567890123456',
        status: 'ok' as const,
        data: { item: index },
        type: StreamMessageType.SERVER_ACTION_RESULT,
      }),
    )

    const encoded = encoder.encode(
      messages.map((m) => JSON.stringify(m)).join('\n') +
        '\n',
    )

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoded)
        controller.close()
      },
    })

    const reader = stream.getReader()
    const parsed = parseStreamResponse(
      reader as ReadableStreamDefaultReader<Uint8Array>,
    )

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(10)
    expect(results).toEqual(messages)
  })

  it('should parse messages split across chunks', async () => {
    const encoder = new TextEncoder()
    const message1 = {
      action: 'testAction',
      id: '1111111111111111',
      status: 'ok' as const,
      data: { value: 'first' },
      type: StreamMessageType.SERVER_ACTION_RESULT,
    }
    const message2 = {
      action: 'testAction',
      id: '2222222222222222',
      status: 'ok' as const,
      data: { value: 'second' },
      type: StreamMessageType.SERVER_ACTION_RESULT,
    }

    const encoded1 = encoder.encode(
      JSON.stringify(message1) + '\n',
    )
    const encoded2 = encoder.encode(
      JSON.stringify(message2) + '\n',
    )

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoded1.slice(0, 20))
        controller.enqueue(encoded1.slice(20))
        controller.enqueue(encoded2)
        controller.close()
      },
    })

    const reader = stream.getReader()
    const parsed = parseStreamResponse(
      reader as ReadableStreamDefaultReader<Uint8Array>,
    )

    const results: unknown[] = []
    for await (const item of parsed) {
      results.push(item)
    }

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual(message1)
    expect(results[1]).toEqual(message2)
  })
})

describe('parseWsStream', () => {
  it('should parse single normal message', async () => {
    const encoder = new TextEncoder()
    const message = {
      action: 'testAction',
      id: '1234567890123456',
      status: 'ok' as const,
      data: { value: 'test' },
      type: StreamMessageType.SERVER_ACTION_RESULT,
    }
    const encoded = encoder.encode(
      JSON.stringify(message) + '\n',
    )

    const results = await parseWsStream([encoded])

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual(message)
  })

  it('should parse multiple normal messages', async () => {
    const encoder = new TextEncoder()
    const messages = Array.from(
      { length: 10 },
      (_, index) => ({
        action: 'testAction',
        id: '1234567890123456',
        status: 'ok' as const,
        data: { item: index },
        type: StreamMessageType.SERVER_ACTION_RESULT,
      }),
    )

    const encoded = encoder.encode(
      messages.map((m) => JSON.stringify(m)).join('\n') +
        '\n',
    )

    const results = await parseWsStream([encoded])

    expect(results).toHaveLength(10)
    expect(results).toEqual(messages)
  })

  it('should parse messages split across multiple buffers', async () => {
    const encoder = new TextEncoder()
    const message1 = {
      action: 'testAction',
      id: '1111111111111111',
      status: 'ok' as const,
      data: { value: 'first' },
      type: StreamMessageType.SERVER_ACTION_RESULT,
    }
    const message2 = {
      action: 'testAction',
      id: '2222222222222222',
      status: 'ok' as const,
      data: { value: 'second' },
      type: StreamMessageType.SERVER_ACTION_RESULT,
    }

    const encoded1 = encoder.encode(
      JSON.stringify(message1) + '\n',
    )
    const encoded2 = encoder.encode(
      JSON.stringify(message2) + '\n',
    )

    const buffers = [
      encoded1.slice(0, 20),
      encoded1.slice(20),
      encoded2,
    ]

    const results = await parseWsStream(buffers)

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual(message1)
    expect(results[1]).toEqual(message2)
  })
})

describe('Parser class', () => {
  it('should parse incremental messages', async () => {
    const parser = new Parser()
    const encoder = new TextEncoder()

    const message1 = {
      action: 'testAction',
      id: '1111111111111111',
      status: 'ok' as const,
      data: { value: 'first' },
      type: StreamMessageType.SERVER_ACTION_RESULT,
    }
    const message2 = {
      action: 'testAction',
      id: '2222222222222222',
      status: 'ok' as const,
      data: { value: 'second' },
      type: StreamMessageType.SERVER_ACTION_RESULT,
    }

    const encoded1 = encoder.encode(
      JSON.stringify(message1) + '\n',
    )
    const encoded2 = encoder.encode(
      JSON.stringify(message2) + '\n',
    )

    const results1 = await parser.feed(encoded1)
    expect(results1).toHaveLength(1)
    expect(results1[0]).toEqual(message1)

    const results2 = await parser.feed(encoded2)
    expect(results2).toHaveLength(1)
    expect(results2[0]).toEqual(message2)
  })

  it('should handle partial messages across feed calls', async () => {
    const parser = new Parser()
    const encoder = new TextEncoder()

    const message = {
      action: 'testAction',
      id: '1234567890123456',
      status: 'ok' as const,
      data: { value: 'test' },
      type: StreamMessageType.SERVER_ACTION_RESULT,
    }

    const encoded = encoder.encode(
      JSON.stringify(message) + '\n',
    )

    const results1 = await parser.feed(encoded.slice(0, 20))
    expect(results1).toHaveLength(0)

    const results2 = await parser.feed(encoded.slice(20))
    expect(results2).toHaveLength(1)
    expect(results2[0]).toEqual(message)
  })
})
