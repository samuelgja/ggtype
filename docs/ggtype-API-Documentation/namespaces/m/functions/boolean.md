[**ggtype API Documentation v0.5.1**](../../../../README.md)

***

# Function: boolean()

> **boolean**(): [`Boolean`](../interfaces/Boolean.md)\<`true`\>

Defined in: [src/model/boolean.ts:59](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/boolean.ts#L59)

Creates a boolean model for validation and type inference.
Returns a model that validates boolean values with optional required constraint.

## Returns

[`Boolean`](../interfaces/Boolean.md)\<`true`\>

A Boolean instance for validating boolean values

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
