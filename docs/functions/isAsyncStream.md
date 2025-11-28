[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: isAsyncStream()

> **isAsyncStream**\<`T`\>(`value`): `value is AsyncStream<T>`

Defined in: [src/utils/is.ts:132](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/is.ts#L132)

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
