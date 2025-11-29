[**ggtype API Documentation v0.4.8**](../README.md)

***

# Type Alias: Infer\<T\>

> **Infer**\<`T`\> = `T`\[`"infer"`\]

Defined in: [src/index.ts:33](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/index.ts#L33)

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
  id: m.string(),
  name: m.string(),
  age: m.number(),
})

// Extract the TypeScript type
type User = Infer<typeof userModel>
// Result: { id: string; name: string; age?: number }
```
