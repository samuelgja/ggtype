[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: file()

> **file**(): [`FileModel`](../interfaces/FileModel.md)\<`true`\>

Defined in: [src/model/file.ts:62](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/file.ts#L62)

Creates a file model for validation and type inference.
Returns a model that validates File values, automatically converting Blob and ArrayBuffer
instances to File objects when needed. Supports optional required constraint.

## Returns

[`FileModel`](../interfaces/FileModel.md)\<`true`\>

A FileModel instance for validating File values

## Example

```ts
import { action, m } from 'ggtype'

// File upload action
const uploadFile = action(
  m.object({
    file: m.file(), // Required by default
    name: m.string(),
  }),
  async ({ params }) => {
    // params.file is a File instance
    return { success: true, size: params.file.size }
  }
)
```
