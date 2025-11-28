[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: date()

> **date**(): [`DateModel`](../interfaces/DateModel.md)\<`false`\>

Defined in: [src/model/date.ts:135](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/date.ts#L135)

Creates a date model for validation and type inference.
Returns a model that validates Date values with optional custom validation.
Supports parsing from strings, numbers (timestamps), and Date instances.

## Returns

[`DateModel`](../interfaces/DateModel.md)\<`false`\>

A DateModel instance for validating Date values

## Example

```ts
import { m } from 'ggtype'

// Basic date
const createdAt = m.date().isRequired()

// Optional date
const publishedAt = m.date()

// Use in object
const postParams = m.object({
  title: m.string().isRequired(),
  createdAt: m.date().isRequired(),
  publishedAt: m.date(),
})
```
