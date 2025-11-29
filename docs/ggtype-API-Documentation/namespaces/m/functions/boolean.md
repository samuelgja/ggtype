[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: boolean()

> **boolean**(): [`BooleanModel`](../interfaces/BooleanModel.md)\<`true`\>

Defined in: [src/model/boolean.ts:61](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/boolean.ts#L61)

Creates a boolean model for validation and type inference.
Returns a model that validates boolean values with optional required constraint.

## Returns

[`BooleanModel`](../interfaces/BooleanModel.md)\<`true`\>

A BooleanModel instance for validating boolean values

## Example

```ts
import { m } from 'ggtype'

// Basic boolean (required by default)
const isActive = m.boolean()

// Optional boolean
const isPublished = m.boolean()

// Use in object
const userParams = m.object({
  name: m.string(),
  isActive: m.boolean(),
  isVerified: m.boolean(),
})
```
