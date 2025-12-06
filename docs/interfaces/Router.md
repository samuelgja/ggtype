[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: Router\<ServerActions, ClientActions\>

Defined in: [src/router/router.type.ts:418](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L418)

Router interface for handling requests and WebSocket messages.

## Type Parameters

### ServerActions

`ServerActions` *extends* [`ServerActionsBase`](../type-aliases/ServerActionsBase.md) = [`ServerActionsBase`](../type-aliases/ServerActionsBase.md)

The server actions type

### ClientActions

`ClientActions` *extends* [`ClientActionsBase`](../type-aliases/ClientActionsBase.md) = [`ClientActionsBase`](../type-aliases/ClientActionsBase.md)

The client actions type

## Properties

### dispose()

> `readonly` **dispose**: () => `void`

Defined in: [src/router/router.type.ts:451](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L451)

Disposes of the router and cleans up internal resources (e.g., intervals)

#### Returns

`void`

***

### infer

> `readonly` **infer**: [`InferRouter`](../type-aliases/InferRouter.md)\<`ServerActions`, `ClientActions`\>

Defined in: [src/router/router.type.ts:443](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L443)

Type inference helper for router types

***

### onRequest()

> `readonly` **onRequest**: (`options`) => `Promise`\<`Response`\>

Defined in: [src/router/router.type.ts:429](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L429)

Handles HTTP requests for the router

#### Parameters

##### options

[`OnRequest`](OnRequest.md)

Request handling options. See OnRequest interface for details.

#### Returns

`Promise`\<`Response`\>

A Response object for the HTTP request

***

### onWebsocketCleanUp()

> `readonly` **onWebsocketCleanUp**: () => `void`

Defined in: [src/router/router.type.ts:447](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L447)

Cleanup function called when WebSocket connection closes

#### Returns

`void`

***

### onWebSocketMessage()

> `readonly` **onWebSocketMessage**: (`options`) => `Promise`\<`void`\>

Defined in: [src/router/router.type.ts:437](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L437)

Handles WebSocket messages for the router

#### Parameters

##### options

[`OnWebSocketMessage`](OnWebSocketMessage.md)

WebSocket message handling options. See OnWebSocketMessage interface for details.

#### Returns

`Promise`\<`void`\>
