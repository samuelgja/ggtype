[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Function: date()

> **date**(): [`Date`](../interfaces/Date.md)\<`true`\>

Defined in: [src/model/date.ts:133](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L133)

Creates a date model for validation and type inference.
Returns a model that validates Date values with optional custom validation.
Supports parsing from strings, numbers (timestamps), and Date instances.

## Returns

[`Date`](../interfaces/Date.md)\<`true`\>

A Date instance for validating Date values

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
