[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Function: enums()

> **enums**\<`T`\>(...`enumParameters`): [`EnumModel`](../interfaces/EnumModel.md)\<`T`, `false`\>

Defined in: [src/model/enums.ts:98](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/enums.ts#L98)

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

[`EnumModel`](../interfaces/EnumModel.md)\<`T`, `false`\>

An EnumModel instance for validating enum string values

## Example

```ts
import { m } from 'ggtype'

// Simple enum
const role = m.enums('admin', 'user', 'guest').isRequired()

// Enum with default
const status = m.enums('pending', 'active', 'inactive')
  .default('pending')
  .isRequired()

// Use in object
const userParams = m.object({
  role: m.enums('admin', 'user').isRequired(),
  status: m.enums('active', 'inactive').isRequired(),
})
```
