[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: enums()

> **enums**\<`T`\>(...`enumParameters`): [`EnumModel`](../interfaces/EnumModel.md)\<`T`, `true`\>

Defined in: [src/model/enums.ts:100](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/enums.ts#L100)

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

[`EnumModel`](../interfaces/EnumModel.md)\<`T`, `true`\>

An EnumModel instance for validating enum string values

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
