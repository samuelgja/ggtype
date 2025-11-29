[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: number()

> **number**(): [`NumberModel`](../interfaces/NumberModel.md)\<`true`\>

Defined in: [src/model/number.ts:98](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/number.ts#L98)

Creates a number model for validation and type inference.
Returns a model that validates number values with optional constraints like
minimum/maximum values, positive/negative checks, and custom validation.

## Returns

[`NumberModel`](../interfaces/NumberModel.md)\<`true`\>

A NumberModel instance for validating number values

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
