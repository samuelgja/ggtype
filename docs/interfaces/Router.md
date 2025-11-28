[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: Router\<Actions, ClientActions\>

Defined in: [src/types.ts:573](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L573)

## Extends

- [`RouterBase`](RouterBase.md)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>

### ClientActions

`ClientActions` *extends* `Record`\<`string`, `ClientAction`\>

## Properties

### infer

> `readonly` **infer**: `InferRouter`\<`Actions`, `ClientActions`\>

Defined in: [src/types.ts:587](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L587)

Type inference helper for router types

#### Overrides

[`RouterBase`](RouterBase.md).[`infer`](RouterBase.md#infer)

***

### onRequest()

> `readonly` **onRequest**: (`options`) => `Promise`\<`Response`\>

Defined in: [src/types.ts:566](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L566)

Handles HTTP requests for the router

#### Parameters

##### options

[`OnRequest`](OnRequest.md)

Request handling options

#### Returns

`Promise`\<`Response`\>

A Response object for the HTTP request

#### Inherited from

[`RouterBase`](RouterBase.md).[`onRequest`](RouterBase.md#onrequest)

***

### onWebSocketMessage()?

> `readonly` `optional` **onWebSocketMessage**: (`options`) => `Promise`\<`void`\>

Defined in: [src/types.ts:581](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L581)

Handles WebSocket messages for the router (only available for WebSocket transport)

#### Parameters

##### options

[`OnWebSocketMessage`](OnWebSocketMessage.md)

WebSocket message handling options

#### Returns

`Promise`\<`void`\>
