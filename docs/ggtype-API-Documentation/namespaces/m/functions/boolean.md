[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: boolean()

> **boolean**(): [`BooleanModel`](../interfaces/BooleanModel.md)\<`false`\>

Defined in: [src/model/boolean.ts:61](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/boolean.ts#L61)

Creates a boolean model for validation and type inference.
Returns a model that validates boolean values with optional required constraint.

## Returns

[`BooleanModel`](../interfaces/BooleanModel.md)\<`false`\>

A BooleanModel instance for validating boolean values

## Example

```ts
import { m } from 'ggtype'

// Basic boolean
const isActive = m.boolean().isRequired()

// Optional boolean
const isPublished = m.boolean()

// Use in object
const userParams = m.object({
  name: m.string().isRequired(),
  isActive: m.boolean().isRequired(),
  isVerified: m.boolean(),
})
```
