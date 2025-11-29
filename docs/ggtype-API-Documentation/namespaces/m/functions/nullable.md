[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: nullable()

> **nullable**(): [`NullModel`](../interfaces/NullModel.md)\<`true`\>

Defined in: [src/model/null.ts:60](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/null.ts#L60)

Creates a null model for validation and type inference.
Returns a model that validates null values with optional required constraint.

## Returns

[`NullModel`](../interfaces/NullModel.md)\<`true`\>

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
  name: m.string(),
  deletedAt: m.nullable(),
})
```
