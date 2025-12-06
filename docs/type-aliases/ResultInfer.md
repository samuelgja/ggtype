[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: ResultInfer\<T, K\>

> **ResultInfer**\<`T`, `K`\> = `T` *extends* `object` ? `K` *extends* keyof `SA` ? `SA`\[`K`\] *extends* `object` ? `R` : `never` : `never` : `K` *extends* keyof `T` ? `T`\[`K`\] *extends* `object` ? `R` : `never` : `never`

Defined in: [src/router/router.type.ts:379](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L379)

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
    getUser: action(m.object({ id: m.string() }).isOptional(), async ({ params }) => ({
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
