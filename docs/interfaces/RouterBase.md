[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: RouterBase

Defined in: [src/types.ts:560](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L560)

## Extended by

- [`Router`](Router.md)

## Properties

### infer

> `readonly` **infer**: `any`

Defined in: [src/types.ts:570](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L570)

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
