[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: and()

> **and**\<`M`\>(...`models`): [`AndModel`](../interfaces/AndModel.md)\<`M`, `false`\>

Defined in: [src/model/and.ts:56](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/model/and.ts#L56)

Creates an intersection model that combines multiple object models.
Merges all properties from the provided models into a single object model,
creating an intersection type. Useful for composing complex object structures.

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../interfaces/ModelNotGeneric.md)[]

Array of model types to intersect

## Parameters

### models

...`M`

Variable number of models to combine

## Returns

[`AndModel`](../interfaces/AndModel.md)\<`M`, `false`\>

An AndModel instance representing the intersection of all provided models
