[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Function: enums()

> **enums**\<`T`\>(...`enumParameters`): [`Enum`](../interfaces/Enum.md)\<`T`, `true`\>

Defined in: [src/model/enums.ts:98](https://github.com/samuelgja/ggtype/blob/main/src/model/enums.ts#L98)

Creates an enum model for validation and type inference.
Returns a model that validates string values against a set of allowed enum values.
Supports additional string constraints like min/max length, regex patterns, and default values.

## Type Parameters

### T

`T` *extends* `string`

The enum string literal type

## Parameters

### enumParameters

...`T`[]

Array of allowed string values for the enum

## Returns

[`Enum`](../interfaces/Enum.md)\<`T`, `true`\>

An Enum instance for validating enum string values

## Example

```ts
import { m } from 'ggtype'

// Simple enum (required by default)
const role = m.enums('admin', 'user', 'guest')

// Optional enum
const optionalRole = m.enums('admin', 'user')

// Enum with default
const status = m.enums('pending', 'active', 'inactive')
  .default('pending')

// Use in object
const userParams = m.object({
  role: m.enums('admin', 'user'),
  status: m.enums('active', 'inactive'),
})
```
