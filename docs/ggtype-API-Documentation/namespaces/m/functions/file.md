[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: file()

> **file**(): [`FileModel`](../interfaces/FileModel.md)\<`false`\>

Defined in: [src/model/file.ts:62](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/file.ts#L62)

Creates a file model for validation and type inference.
Returns a model that validates File values, automatically converting Blob and ArrayBuffer
instances to File objects when needed. Supports optional required constraint.

## Returns

[`FileModel`](../interfaces/FileModel.md)\<`false`\>

A FileModel instance for validating File values

## Example

```ts
import { action, m } from 'ggtype'

// File upload action
const uploadFile = action(
  m.object({
    file: m.file().isRequired(),
    name: m.string().isRequired(),
  }),
  async ({ params }) => {
    // params.file is a File instance
    return { success: true, size: params.file.size }
  }
)
```
