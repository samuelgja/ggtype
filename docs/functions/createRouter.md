[**ggtype API Documentation v0.4.8**](../README.md)

***

# Function: createRouter()

> **createRouter**\<`Actions`, `ClientActions`\>(`options`): [`Router`](../interfaces/Router.md)\<`Actions`, `ClientActions`\>

Defined in: [src/router/router.ts:140](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/router.ts#L140)

Creates a new router instance for handling server actions and client actions.
The router manages bidirectional communication between server and client, supporting
HTTP, HTTP stream, and WebSocket transports simultaneously. It handles action execution, error handling,
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

A router instance with `onRequest` (HTTP), `onStream` (HTTP stream), and `onWebSocketMessage` (WebSocket) handlers

## Example

```ts
import { action, createRouter, defineClientActionsSchema, m } from 'ggtype'

// Define actions
const createUser = action(
  m.object({ id: m.string(), name: m.string() }),
  async ({ params }) => ({ ...params, createdAt: new Date() })
)

const getUser = action(
  m.object({ id: m.string() }),
  async ({ params }) => ({ id: params.id, name: 'John' })
)

// Define client actions schema
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({
      message: m.string(),
      type: m.string(),
    }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

// Create router
const router = createRouter({
  serverActions: { createUser, getUser },
  clientActions,
  responseTimeout: 60000,
})

// Use with Bun server - supports all transports simultaneously
Bun.serve({
  port: 3000,
  async fetch(request) {
    const user = extractUserFromRequest(request)
    // Use onRequest for HTTP transport
    return router.onRequest({ request, ctx: { user } })
  },
  // For WebSocket, handle upgrade manually
  websocket: {
    message(ws, message) {
      router.onWebSocketMessage({ ws, message, ctx: {} })
    },
  },
})

// For stream transport, use onStream
// router.onStream({ request, ctx: { user } })
```
