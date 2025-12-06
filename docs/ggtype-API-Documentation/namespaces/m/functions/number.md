[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Function: number()

> **number**(): [`Number`](../interfaces/Number.md)\<`true`\>

Defined in: [src/model/number.ts:96](https://github.com/samuelgja/ggtype/blob/main/src/model/number.ts#L96)

Creates a number model for validation and type inference.
Returns a model that validates number values with optional constraints like
minimum/maximum values, positive/negative checks, and custom validation.

## Returns

[`Number`](../interfaces/Number.md)\<`true`\>

A Number instance for validating number values

## Example

```ts
import { m } from 'ggtype'

// Basic number (required by default)
const age = m.number()

// Optional number
const height = m.number()

// Number with constraints
const positiveAge = m.number()
  .minimum(0)
  .maximum(120)

const price = m.number()
  .positive()
  .minimum(0.01)

const score = m.number()
  .minimum(0)
  .maximum(100)
```
