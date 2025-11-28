[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Function: date()

> **date**(): [`DateModel`](../interfaces/DateModel.md)\<`false`\>

Defined in: [src/model/date.ts:135](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/date.ts#L135)

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
