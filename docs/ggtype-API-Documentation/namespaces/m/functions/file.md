[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: file()

> **file**(): [`FileModel`](../interfaces/FileModel.md)\<`false`\>

Defined in: [src/model/file.ts:46](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/model/file.ts#L46)

Creates a file model for validation and type inference.
Returns a model that validates File values, automatically converting Blob and ArrayBuffer
instances to File objects when needed. Supports optional required constraint.

## Returns

[`FileModel`](../interfaces/FileModel.md)\<`false`\>

A FileModel instance for validating File values
