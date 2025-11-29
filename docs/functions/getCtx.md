[**ggtype API Documentation v0.4.8**](../README.md)

***

# Function: getCtx()

> **getCtx**\<`T`\>(`ctx`): `T`

Defined in: [src/action/action.ts:39](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/action/action.ts#L39)

Extracts and types the context object from an unknown value.
This is a type-safe way to access the context passed to actions.

## Type Parameters

### T

`T`

The expected type of the context

## Parameters

### ctx

`unknown`

The context value (typically unknown)

## Returns

`T`

The context cast to type T

## Example

```ts
import { action, getCtx, m } from 'ggtype'

interface UserContext {
  user: { id: string; name: string }
}

const deleteUser = action(
  m.object({ id: m.string() }),
  async ({ params, ctx }) => {
    // Type-safe context extraction
    const { user } = getCtx<UserContext>(ctx)

    if (user.id !== params.id) {
      throw new Error('Unauthorized')
    }

    return { success: true }
  }
)
```
