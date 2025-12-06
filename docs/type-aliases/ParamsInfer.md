[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: ParamsInfer\<T, K\>

> **ParamsInfer**\<`T`, `K`\> = `T` *extends* `object` ? `K` *extends* keyof `SA` ? `SA`\[`K`\] *extends* `object` ? `P` : `never` : `never` : `K` *extends* keyof `T` ? `T`\[`K`\] *extends* `object` ? `P` : `never` : `never`

Defined in: [src/router/router.type.ts:333](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L333)

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
    getUser: action(m.object({ id: m.string() }).isOptional(), async ({ params }) => ({})),
  },
  clientActions: {},
})

type Router = typeof router.infer
type GetUserParams = ParamsInfer<Router, 'getUser'>
// Result: { id: string }
```
