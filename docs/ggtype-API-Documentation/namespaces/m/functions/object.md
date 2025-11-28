[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: object()

> **object**\<`T`, `R`\>(`properties`): [`ObjectModel`](../interfaces/ObjectModel.md)\<`T`, `R`\>

Defined in: [src/model/object.ts:147](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/object.ts#L147)

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

## Example

```ts
import { m } from 'ggtype'

// Simple object
const userParams = m.object({
  id: m.string().isRequired(),
  name: m.string().isRequired(),
  email: m.string().isEmail().isRequired(),
  age: m.number().minimum(0).maximum(120),
})

// Nested object
const addressParams = m.object({
  street: m.string().isRequired(),
  city: m.string().isRequired(),
  zipCode: m.string().isRequired(),
})

const userWithAddress = m.object({
  id: m.string().isRequired(),
  name: m.string().isRequired(),
  address: addressParams.isRequired(),
})
```
