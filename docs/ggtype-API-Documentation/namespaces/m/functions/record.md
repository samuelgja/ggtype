[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: record()

> **record**\<`M`\>(`item`): [`RecordModel`](../interfaces/RecordModel.md)\<`M`, `false`\>

Defined in: [src/model/record.ts:58](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/model/record.ts#L58)

Creates a record model for validating objects with dynamic keys.
Returns a model that validates objects where all values match the provided item model,
regardless of the keys. Useful for dictionaries and key-value stores.

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../interfaces/ModelNotGeneric.md)

The model type for record values

## Parameters

### item

`M`

The model to validate each value in the record against

## Returns

[`RecordModel`](../interfaces/RecordModel.md)\<`M`, `false`\>

A RecordModel instance for validating record objects
