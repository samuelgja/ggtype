[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: object()

> **object**\<`T`, `R`\>(`properties`): [`ObjectModel`](../interfaces/ObjectModel.md)\<`T`, `R`\>

Defined in: [src/model/object.ts:122](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/model/object.ts#L122)

Creates an object model for validation and type inference.
Returns a model that validates objects with specified properties, where each property
has its own model for validation. Supports nested objects and optional/required properties.

## Type Parameters

### T

`T` *extends* `Properties`

The properties type

### R

`R` *extends* `boolean` = `false`

Whether the model is required

## Parameters

### properties

`T`

Record of property names to their corresponding models

## Returns

[`ObjectModel`](../interfaces/ObjectModel.md)\<`T`, `R`\>

An ObjectModel instance for validating objects with the specified structure
