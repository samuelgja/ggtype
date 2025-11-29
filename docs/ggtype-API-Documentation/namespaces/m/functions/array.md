[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: array()

> **array**\<`T`\>(`list`): [`ArrayModel`](../interfaces/ArrayModel.md)\<`T`, `true`\>

Defined in: [src/model/array.ts:91](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/array.ts#L91)

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

[`ArrayModel`](../interfaces/ArrayModel.md)\<`T`, `true`\>

An ArrayModel instance for validating arrays of the specified type

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
