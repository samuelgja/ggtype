[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Function: file()

> **file**(): [`FileModel`](../interfaces/FileModel.md)\<`false`\>

Defined in: [src/model/file.ts:62](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/file.ts#L62)

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
