[**ggtype API Documentation v0.4.8**](../README.md)

***

# Function: isAsyncStream()

> **isAsyncStream**\<`T`\>(`value`): `value is AsyncStream<T>`

Defined in: [src/utils/is.ts:177](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/utils/is.ts#L177)

Type guard to check if a value is an AsyncStream or ReadableStream.

## Type Parameters

### T

`T`

The stream item type

## Parameters

### value

`unknown`

The value to check

## Returns

`value is AsyncStream<T>`

True if the value is an AsyncStream or ReadableStream
