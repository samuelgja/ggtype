[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Function: string()

> **string**(): [`String`](../interfaces/String.md)\<`true`\>

Defined in: [src/model/string.ts:103](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L103)

Creates a string model for validation and type inference.
Returns a model that validates string values with optional constraints like
min/max length, regex patterns, email/password formats, and custom validation.

## Returns

[`String`](../interfaces/String.md)\<`true`\>

A String instance for validating string values

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
