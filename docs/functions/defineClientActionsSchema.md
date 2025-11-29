[**ggtype API Documentation v0.4.8**](../README.md)

***

# Function: defineClientActionsSchema()

> **defineClientActionsSchema**\<`T`\>(`data`): `T`

Defined in: [src/router/handle-client-actions.ts:49](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/handle-client-actions.ts#L49)

Helper function to define client action models with proper typing.
This is a type-only function that returns the input unchanged, used for type inference.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `ClientAction`\>

The client actions record type

## Parameters

### data

`T`

The client actions record to define

## Returns

`T`

The same data with proper typing

## Example

```ts
import { defineClientActionsSchema, m } from 'ggtype'

// Define client actions schema for server-side
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({
      message: m.string(),
      type: m.string(),
    }),
    return: m.object({ acknowledged: m.boolean() }),
  },
  updateUI: {
    params: m.object({
      component: m.string(),
      data: m.record(m.string()),
    }),
    return: m.object({ success: m.boolean() }),
  },
})

// Use with createRouter
const router = createRouter({
  serverActions: { getUser: action(...), createUser: action(...) },
  clientActions,
  transport: 'stream',
})
```
