[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Function: blob()

> **blob**(): [`BlobModel`](../interfaces/BlobModel.md)\<`false`\>

Defined in: [src/model/blob.ts:62](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/blob.ts#L62)

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
