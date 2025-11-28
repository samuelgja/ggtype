[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: enums()

> **enums**\<`T`\>(...`enumParameters`): [`EnumModel`](../interfaces/EnumModel.md)\<`T`, `false`\>

Defined in: [src/model/enums.ts:80](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/model/enums.ts#L80)

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
