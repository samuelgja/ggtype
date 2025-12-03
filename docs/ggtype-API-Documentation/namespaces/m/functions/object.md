[**ggtype API Documentation v0.5.1**](../../../../README.md)

***

# Function: object()

> **object**\<`T`, `R`\>(`properties`): [`Object`](../interfaces/Object.md)\<`T`, `R`\>

Defined in: [src/model/object.ts:148](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/object.ts#L148)

Creates an object model for validation and type inference.
Returns a model that validates objects with specified properties, where each property
has its own model for validation. Supports nested objects and optional/required properties.

## Type Parameters

### T

`T` *extends* `Properties`

The properties type

### R

`R` *extends* `boolean` = `true`

Whether the model is required

## Parameters

### properties

`T`

Record of property names to their corresponding models

## Returns

[`Object`](../interfaces/Object.md)\<`T`, `R`\>

An Object instance for validating objects with the specified structure

## Example

```ts
import { m } from 'ggtype'

// Simple object
const userParams = m.object({
  id: m.string(),
  name: m.string(),
  email: m.string().isEmail(),
  age: m.number().minimum(0).maximum(120),
})

// Nested object
const addressParams = m.object({
  street: m.string(),
  city: m.string(),
  zipCode: m.string(),
})

const userWithAddress = m.object({
  id: m.string(),
  name: m.string(),
  address: addressParams,
})
```
