[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: string()

> **string**(): [`StringModel`](../interfaces/StringModel.md)\<`true`\>

Defined in: [src/model/string.ts:105](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/string.ts#L105)

Creates a string model for validation and type inference.
Returns a model that validates string values with optional constraints like
min/max length, regex patterns, email/password formats, and custom validation.

## Returns

[`StringModel`](../interfaces/StringModel.md)\<`true`\>

A StringModel instance for validating string values

## Example

```ts
import { m } from 'ggtype'

// Basic string (required by default)
const name = m.string()

// Optional string
const nickname = m.string()

// String with constraints
const email = m.string()
  .isEmail()

const password = m.string()
  .minLength(8)
  .isPassword()

const username = m.string()
  .minLength(3)
  .maxLength(20)
  .regex(/^[a-zA-Z0-9_]+$/)
```
