[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: createRouter()

> **createRouter**\<`Actions`, `ClientActions`\>(`options`): [`Router`](../interfaces/Router.md)\<`Actions`, `ClientActions`\>

Defined in: [src/router/router.ts:94](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/router/router.ts#L94)

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
