[**ggtype API Documentation v0.4.7**](../README.md)

***

# Type Alias: ResultInfer\<T, K\>

> **ResultInfer**\<`T`, `K`\> = `T` *extends* `object` ? `K` *extends* keyof `SA` ? `SA`\[`K`\] *extends* `object` ? `R` : `never` : `never` : `K` *extends* keyof `T` ? `T`\[`K`\] *extends* `object` ? `R` : `never` : `never`

Defined in: [src/types.ts:535](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L535)

Extracts the result type for a specific action from a router type.
Returns the ActionResult type (ok/error union) for the action.

## Type Parameters

### T

`T` *extends* `RouterInferLike`

The router type (RouterInfer or RouterInferNotGeneric)

### K

`K` *extends* keyof `T` \| keyof `T` *extends* `object` ? `SA` : `never`

The action name

## Example

```ts
import { createRouter, type ResultInfer } from 'ggtype'

const router = createRouter({
  serverActions: {
    getUser: action(m.object({ id: m.string().isRequired() }), async ({ params }) => ({
      id: params.id,
      name: 'John',
    })),
  },
  clientActions: {},
})

type Router = typeof router.infer
type GetUserResult = ResultInfer<Router, 'getUser'>
// Result: { status: 'ok', data: { id: string; name: string } } | { status: 'error', error: {...} }
```
