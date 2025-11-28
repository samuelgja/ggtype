[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: or()

> **or**\<`M`\>(...`models`): [`OrModel`](../interfaces/OrModel.md)\<`M`, `false`\>

Defined in: [src/model/or.ts:58](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/model/or.ts#L58)

Creates a union model that accepts any of the provided models.
Validates data against each model in sequence, returning the first successful match.
Creates a union type where the value can be any of the provided model types.

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../interfaces/ModelNotGeneric.md)[]

Array of model types to union

## Parameters

### models

...`M`

Variable number of models to create a union from

## Returns

[`OrModel`](../interfaces/OrModel.md)\<`M`, `false`\>

An OrModel instance representing the union of all provided models
