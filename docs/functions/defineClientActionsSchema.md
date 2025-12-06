[**ggtype API Documentation v0.6.0**](../README.md)

***

# Function: defineClientActionsSchema()

> **defineClientActionsSchema**\<`T`\>(`data`): `T`

Defined in: [src/router-client/router-client.types.ts:117](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L117)

Helper function to define client action models with proper typing.
This is a type-only function that returns the input unchanged, used for type inference.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, [`ClientAction`](../interfaces/ClientAction.md)\>

The client actions record type

## Parameters

### data

`T`

The client actions record to define

## Returns

`T`

The same data with proper typing
