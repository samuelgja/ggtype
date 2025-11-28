[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: isOkResult()

> **isOkResult**\<`T`\>(`result`): `result is ActionResultOk<T>`

Defined in: [src/utils/is.ts:93](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/is.ts#L93)

Type guard to check if a router result is a success result.

## Type Parameters

### T

`T`

The data type

## Parameters

### result

[`RouterResultNotGeneric`](../interfaces/RouterResultNotGeneric.md)

The router result to check

## Returns

`result is ActionResultOk<T>`

True if the result has ok status
