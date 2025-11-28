[**ggtype API Documentation v0.4.7**](../README.md)

***

# Type Alias: Infer\<T\>

> **Infer**\<`T`\> = `T`\[`"infer"`\]

Defined in: [src/index.ts:33](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/index.ts#L33)

Extracts the inferred TypeScript type from a model.
This utility type extracts the runtime type that a model validates.

## Type Parameters

### T

`T` *extends* `object`

The model type with an `infer` property

## Example

```ts
import { m, type Infer } from 'ggtype'

const userModel = m.object({
  id: m.string().isRequired(),
  name: m.string().isRequired(),
  age: m.number(),
})

// Extract the TypeScript type
type User = Infer<typeof userModel>
// Result: { id: string; name: string; age?: number }
```
