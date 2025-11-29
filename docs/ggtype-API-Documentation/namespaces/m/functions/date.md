[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: date()

> **date**(): [`DateModel`](../interfaces/DateModel.md)\<`true`\>

Defined in: [src/model/date.ts:135](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/date.ts#L135)

Creates a date model for validation and type inference.
Returns a model that validates Date values with optional custom validation.
Supports parsing from strings, numbers (timestamps), and Date instances.

## Returns

[`DateModel`](../interfaces/DateModel.md)\<`true`\>

A DateModel instance for validating Date values

## Example

```ts
import { m } from 'ggtype'

// Basic date (required by default)
const createdAt = m.date()

// Optional date
const publishedAt = m.date()

// Use in object
const postParams = m.object({
  title: m.string(),
  createdAt: m.date(),
  publishedAt: m.date(),
})
```
