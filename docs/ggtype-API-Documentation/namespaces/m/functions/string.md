[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Function: string()

> **string**(): [`StringModel`](../interfaces/StringModel.md)\<`false`\>

Defined in: [src/model/string.ts:105](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/string.ts#L105)

Creates a string model for validation and type inference.
Returns a model that validates string values with optional constraints like
min/max length, regex patterns, email/password formats, and custom validation.

## Returns

[`StringModel`](../interfaces/StringModel.md)\<`false`\>

A StringModel instance for validating string values

## Example

```ts
import { m } from 'ggtype'

// Basic string
const name = m.string().isRequired()

// String with constraints
const email = m.string()
  .isEmail()
  .isRequired()

const password = m.string()
  .minLength(8)
  .isPassword()
  .isRequired()

const username = m.string()
  .minLength(3)
  .maxLength(20)
  .regex(/^[a-zA-Z0-9_]+$/)
  .isRequired()
```
