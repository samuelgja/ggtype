[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: RouterBase

Defined in: [src/types.ts:438](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L438)

## Extended by

- [`Router`](Router.md)

## Properties

### infer

> `readonly` **infer**: `any`

Defined in: [src/types.ts:448](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L448)

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
