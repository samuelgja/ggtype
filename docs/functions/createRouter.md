[**ggtype API Documentation v0.6.0**](../README.md)

***

# Function: createRouter()

> **createRouter**\<`ServerActions`, `ClientActions`\>(`options`): [`Router`](../interfaces/Router.md)\<`ServerActions`, `ClientActions`\>

Defined in: [src/router/router.ts:25](https://github.com/samuelgja/ggtype/blob/main/src/router/router.ts#L25)

Creates a router instance for handling HTTP requests and WebSocket messages.

## Type Parameters

### ServerActions

`ServerActions` *extends* [`ServerActionsBase`](../type-aliases/ServerActionsBase.md)

The server actions type

### ClientActions

`ClientActions` *extends* [`ClientActionsBase`](../type-aliases/ClientActionsBase.md)

The client actions type

## Parameters

### options

[`RouterOptions`](../interfaces/RouterOptions.md)\<`ServerActions`, `ClientActions`\>

Router configuration options. See RouterOptions interface for details.

## Returns

[`Router`](../interfaces/Router.md)\<`ServerActions`, `ClientActions`\>

A router instance with onRequest and onWebSocketMessage handlers
