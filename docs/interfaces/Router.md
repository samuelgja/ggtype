[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: Router\<Actions, ClientActions\>

Defined in: [src/types.ts:451](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L451)

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

Defined in: [src/types.ts:465](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L465)

Type inference helper for router types

#### Overrides

[`RouterBase`](RouterBase.md).[`infer`](RouterBase.md#infer)

***

### onRequest()

> `readonly` **onRequest**: (`options`) => `Promise`\<`Response`\>

Defined in: [src/types.ts:444](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L444)

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

Defined in: [src/types.ts:459](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L459)

Handles WebSocket messages for the router (only available for WebSocket transport)

#### Parameters

##### options

[`OnWebSocketMessage`](OnWebSocketMessage.md)

WebSocket message handling options

#### Returns

`Promise`\<`void`\>
