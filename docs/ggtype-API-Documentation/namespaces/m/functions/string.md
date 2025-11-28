[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: string()

> **string**(): [`StringModel`](../interfaces/StringModel.md)\<`false`\>

Defined in: [src/model/string.ts:82](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/model/string.ts#L82)

Creates a string model for validation and type inference.
Returns a model that validates string values with optional constraints like
min/max length, regex patterns, email/password formats, and custom validation.

## Returns

[`StringModel`](../interfaces/StringModel.md)\<`false`\>

A StringModel instance for validating string values
