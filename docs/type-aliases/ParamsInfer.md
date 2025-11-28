[**ggtype API Documentation v0.4.7**](../README.md)

***

# Type Alias: ParamsInfer\<T, K\>

> **ParamsInfer**\<`T`, `K`\> = `T` *extends* `object` ? `K` *extends* keyof `SA` ? `SA`\[`K`\] *extends* `object` ? `P` : `never` : `never` : `K` *extends* keyof `T` ? `T`\[`K`\] *extends* `object` ? `P` : `never` : `never`

Defined in: [src/types.ts:489](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L489)

Extracts the parameter type for a specific action from a router type.

## Type Parameters

### T

`T` *extends* `RouterInferLike`

The router type (RouterInfer or RouterInferNotGeneric)

### K

`K` *extends* keyof `T` \| keyof `T` *extends* `object` ? `SA` : `never`

The action name

## Example

```ts
import { createRouter, type ParamsInfer } from 'ggtype'

const router = createRouter({
  serverActions: {
    getUser: action(m.object({ id: m.string().isRequired() }), async ({ params }) => ({})),
  },
  clientActions: {},
})

type Router = typeof router.infer
type GetUserParams = ParamsInfer<Router, 'getUser'>
// Result: { id: string }
```
