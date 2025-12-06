[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Function: blob()

> **blob**(): [`Blob`](../interfaces/Blob.md)\<`true`\>

Defined in: [src/model/blob.ts:60](https://github.com/samuelgja/ggtype/blob/main/src/model/blob.ts#L60)

Creates a blob model for validation and type inference.
Returns a model that validates Blob values, automatically converting ArrayBuffer
instances to Blob objects when needed. Supports optional required constraint.

## Returns

[`Blob`](../interfaces/Blob.md)\<`true`\>

A Blob instance for validating Blob values

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
