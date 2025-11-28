[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: nullable()

> **nullable**(): [`NullModel`](../interfaces/NullModel.md)\<`false`\>

Defined in: [src/model/null.ts:60](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/null.ts#L60)

Creates a null model for validation and type inference.
Returns a model that validates null values with optional required constraint.

## Returns

[`NullModel`](../interfaces/NullModel.md)\<`false`\>

A NullModel instance for validating null values

## Example

```ts
import { m } from 'ggtype'

// Nullable field
const optionalField = m.nullable()

// Use with or for optional values
const optionalString = m.or(m.string(), m.nullable())

// Use in object
const userParams = m.object({
  name: m.string().isRequired(),
  deletedAt: m.nullable(),
})
```
