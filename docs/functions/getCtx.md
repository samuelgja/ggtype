[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: getCtx()

> **getCtx**\<`T`\>(`ctx`): `T`

Defined in: [src/action/action.ts:16](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/action/action.ts#L16)

Extracts and types the context object from an unknown value.
This is a type-safe way to access the context passed to actions.

## Type Parameters

### T

`T`

The expected type of the context

## Parameters

### ctx

`unknown`

The context value (typically unknown)

## Returns

`T`

The context cast to type T
