[**ggtype API Documentation v0.4.7**](../README.md)

***

# Function: isAsyncStream()

> **isAsyncStream**\<`T`\>(`value`): `value is AsyncStream<T>`

Defined in: [src/utils/is.ts:177](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/utils/is.ts#L177)

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
