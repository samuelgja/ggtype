[**ggtype API Documentation v0.4.7**](../README.md)

***

# Function: createRouter()

> **createRouter**\<`Actions`, `ClientActions`\>(`options`): [`Router`](../interfaces/Router.md)\<`Actions`, `ClientActions`\>

Defined in: [src/router/router.ts:140](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/router/router.ts#L140)

Creates a new router instance for handling server actions and client actions.
The router manages bidirectional communication between server and client, supporting
both HTTP stream and WebSocket transports. It handles action execution, error handling,
and response management with timeout support. Server actions can call client actions
and wait for their responses, enabling full bidirectional RPC communication.

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>

The type of server actions record

### ClientActions

`ClientActions` *extends* `Record`\<`string`, `ClientAction`\>

The type of client actions record

## Parameters

### options

[`RouterOptions`](../interfaces/RouterOptions.md)\<`Actions`, `ClientActions`\>

Router configuration options

## Returns

[`Router`](../interfaces/Router.md)\<`Actions`, `ClientActions`\>

A router instance with `onRequest` and optional `onWebSocketMessage` handlers

## Example

```ts
import { action, createRouter, defineClientActionsSchema, m } from 'ggtype'

// Define actions
const createUser = action(
  m.object({ id: m.string().isRequired(), name: m.string().isRequired() }),
  async ({ params }) => ({ ...params, createdAt: new Date() })
)

const getUser = action(
  m.object({ id: m.string().isRequired() }),
  async ({ params }) => ({ id: params.id, name: 'John' })
)

// Define client actions schema
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({
      message: m.string().isRequired(),
      type: m.string().isRequired(),
    }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

// Create router
const router = createRouter({
  serverActions: { createUser, getUser },
  clientActions,
  transport: 'http', // or 'stream' or 'websocket'
  responseTimeout: 60000,
})

// Use with Bun server
Bun.serve({
  port: 3000,
  async fetch(request) {
    const user = extractUserFromRequest(request)
    return router.onRequest({ request, ctx: { user } })
  },
})
```
