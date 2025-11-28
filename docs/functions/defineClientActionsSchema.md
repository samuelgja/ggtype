[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: defineClientActionsSchema()

> **defineClientActionsSchema**\<`T`\>(`data`): `T`

Defined in: [src/router/handle-client-actions.ts:19](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/router/handle-client-actions.ts#L19)

Helper function to define client action models with proper typing.
This is a type-only function that returns the input unchanged, used for type inference.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `ClientAction`\>

The client actions record type

## Parameters

### data

`T`

The client actions record to define

## Returns

`T`

The same data with proper typing
