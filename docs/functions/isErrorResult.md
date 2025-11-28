[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: isErrorResult()

> **isErrorResult**\<`T`\>(`result`): `result is ActionResultError<T>`

Defined in: [src/utils/is.ts:78](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/is.ts#L78)

Type guard to check if a router result is an error result.

## Type Parameters

### T

`T`

The error type

## Parameters

### result

[`RouterResultNotGeneric`](../interfaces/RouterResultNotGeneric.md)

The router result to check

## Returns

`result is ActionResultError<T>`

True if the result has error status
