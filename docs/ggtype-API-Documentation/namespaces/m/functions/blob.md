[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: blob()

> **blob**(): [`BlobModel`](../interfaces/BlobModel.md)\<`false`\>

Defined in: [src/model/blob.ts:62](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/blob.ts#L62)

Creates a blob model for validation and type inference.
Returns a model that validates Blob values, automatically converting ArrayBuffer
instances to Blob objects when needed. Supports optional required constraint.

## Returns

[`BlobModel`](../interfaces/BlobModel.md)\<`false`\>

A BlobModel instance for validating Blob values

## Example

```ts
import { action, m } from 'ggtype'

// Blob upload action
const uploadBlob = action(
  m.object({
    data: m.blob().isRequired(),
    type: m.string().isRequired(),
  }),
  async ({ params }) => {
    // params.data is a Blob instance
    return { success: true, size: params.data.size }
  }
)
```
