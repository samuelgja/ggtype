[**ggtype API Documentation v0.5.1**](../../../../README.md)

***

# Function: array()

> **array**\<`T`\>(`list`): [`Array`](../interfaces/Array.md)\<`T`, `true`\>

Defined in: [src/model/array.ts:89](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/array.ts#L89)

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

[`Array`](../interfaces/Array.md)\<`T`, `true`\>

An Array instance for validating arrays of the specified type

## Example

```ts
import { m } from 'ggtype'

// Array of strings (required by default)
const tags = m.array(m.string())

// Array of numbers
const scores = m.array(m.number()).minItems(1).maxItems(10)

// Optional array
const optionalTags = m.array(m.string())

// Array of objects
const users = m.array(
  m.object({
    id: m.string(),
    name: m.string(),
  })
)
```
