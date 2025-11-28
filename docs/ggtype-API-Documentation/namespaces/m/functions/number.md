[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Function: number()

> **number**(): [`NumberModel`](../interfaces/NumberModel.md)\<`false`\>

Defined in: [src/model/number.ts:98](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/number.ts#L98)

Creates a number model for validation and type inference.
Returns a model that validates number values with optional constraints like
minimum/maximum values, positive/negative checks, and custom validation.

## Returns

[`NumberModel`](../interfaces/NumberModel.md)\<`false`\>

A NumberModel instance for validating number values

## Example

```ts
import { m } from 'ggtype'

// Basic number
const age = m.number().isRequired()

// Number with constraints
const positiveAge = m.number()
  .minimum(0)
  .maximum(120)
  .isRequired()

const price = m.number()
  .positive()
  .minimum(0.01)
  .isRequired()

const score = m.number()
  .minimum(0)
  .maximum(100)
  .isRequired()
```
