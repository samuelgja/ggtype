[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: array()

> **array**\<`T`\>(`list`): [`ArrayModel`](../interfaces/ArrayModel.md)\<`T`, `false`\>

Defined in: [src/model/array.ts:88](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/array.ts#L88)

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

## Example

```ts
import { m } from 'ggtype'

// Array of strings
const tags = m.array(m.string()).isRequired()

// Array of numbers
const scores = m.array(m.number()).minItems(1).maxItems(10)

// Array of objects
const users = m.array(
  m.object({
    id: m.string().isRequired(),
    name: m.string().isRequired(),
  })
).isRequired()
```
