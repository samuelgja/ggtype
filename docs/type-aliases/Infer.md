[**ggtype API Documentation v0.5.1**](../README.md)

***

# Type Alias: Infer\<T\>

> **Infer**\<`T`\> = `T`\[`"infer"`\]

Defined in: [src/index.ts:28](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/index.ts#L28)

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
  age: m.number().isOptional(),
}).isOptional()

// Extract the TypeScript type
type User = Infer<typeof userModel>
// Result: { id: string; name: string; age?: number }
```
