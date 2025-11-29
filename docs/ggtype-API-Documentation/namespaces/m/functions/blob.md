[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: blob()

> **blob**(): [`BlobModel`](../interfaces/BlobModel.md)\<`true`\>

Defined in: [src/model/blob.ts:62](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/blob.ts#L62)

Creates a blob model for validation and type inference.
Returns a model that validates Blob values, automatically converting ArrayBuffer
instances to Blob objects when needed. Supports optional required constraint.

## Returns

[`BlobModel`](../interfaces/BlobModel.md)\<`true`\>

A BlobModel instance for validating Blob values

## Example

```ts
import { action, m } from 'ggtype'

// Blob upload action
const uploadBlob = action(
  m.object({
    data: m.blob(), // Required by default
    type: m.string(),
  }),
  async ({ params }) => {
    // params.data is a Blob instance
    return { success: true, size: params.data.size }
  }
)
```
