[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Function: file()

> **file**(): [`File`](../interfaces/File.md)\<`true`\>

Defined in: [src/model/file.ts:60](https://github.com/samuelgja/ggtype/blob/main/src/model/file.ts#L60)

Creates a file model for validation and type inference.
Returns a model that validates File values, automatically converting Blob and ArrayBuffer
instances to File objects when needed. Supports optional required constraint.

## Returns

[`File`](../interfaces/File.md)\<`true`\>

A File instance for validating File values

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
