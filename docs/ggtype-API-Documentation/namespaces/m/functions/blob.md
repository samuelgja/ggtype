[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: blob()

> **blob**(): [`BlobModel`](../interfaces/BlobModel.md)\<`false`\>

Defined in: [src/model/blob.ts:46](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/model/blob.ts#L46)

Creates a blob model for validation and type inference.
Returns a model that validates Blob values, automatically converting ArrayBuffer
instances to Blob objects when needed. Supports optional required constraint.

## Returns

[`BlobModel`](../interfaces/BlobModel.md)\<`false`\>

A BlobModel instance for validating Blob values
