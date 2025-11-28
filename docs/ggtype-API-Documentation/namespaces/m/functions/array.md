[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: array()

> **array**\<`T`\>(`list`): [`ArrayModel`](../interfaces/ArrayModel.md)\<`T`, `false`\>

Defined in: [src/model/array.ts:70](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/model/array.ts#L70)

Creates an array model for validation and type inference.
Returns a model that validates arrays of items matching the provided model type,
with optional constraints like min/max items and custom validation.

## Type Parameters

### T

`T` *extends* [`ModelNotGeneric`](../interfaces/ModelNotGeneric.md)

The model type for array items

## Parameters

### list

`T`

The model to validate each array item against

## Returns

[`ArrayModel`](../interfaces/ArrayModel.md)\<`T`, `false`\>

An ArrayModel instance for validating arrays of the specified type
