[**ggtype API Documentation v0.5.1**](../../../../README.md)

***

# Function: nullable()

> **nullable**(): [`Null`](../interfaces/Null.md)\<`true`\>

Defined in: [src/model/null.ts:58](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/null.ts#L58)

Creates a null model for validation and type inference.
Returns a model that validates null values with optional required constraint.

## Returns

[`Null`](../interfaces/Null.md)\<`true`\>

A Null instance for validating null values

## Example

```ts
import { m } from 'ggtype'

// Nullable field
const optionalField = m.nullable()

// Use with or for optional values
const optionalString = m.or(m.string(), m.nullable())

// Use in object
const userParams = m.object({
  name: m.string(),
  deletedAt: m.nullable(),
})
```
