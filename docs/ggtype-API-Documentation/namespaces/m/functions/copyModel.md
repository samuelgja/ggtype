[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: copyModel()

> **copyModel**\<`T`\>(`model`): `T`

Defined in: [src/model/model.ts:262](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/model/model.ts#L262)

Creates a deep copy of a model with a new unique ID.
Copies all model properties and internals, but assigns a new unique ID to the copy.
This is used when creating modified versions of models (e.g., adding constraints).

## Type Parameters

### T

`T` *extends* [`ModelBase`](../interfaces/ModelBase.md)

The model type to copy

## Parameters

### model

`T`

The model to copy

## Returns

`T`

A deep copy of the model with a new unique ID
