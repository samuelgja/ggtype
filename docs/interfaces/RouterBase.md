[**ggtype API Documentation v0.4.7**](../README.md)

***

# Interface: RouterBase

Defined in: [src/types.ts:560](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L560)

## Extended by

- [`Router`](Router.md)

## Properties

### infer

> `readonly` **infer**: `any`

Defined in: [src/types.ts:570](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L570)

***

### onRequest()

> `readonly` **onRequest**: (`options`) => `Promise`\<`Response`\>

Defined in: [src/types.ts:566](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L566)

Handles HTTP requests for the router

#### Parameters

##### options

[`OnRequest`](OnRequest.md)

Request handling options

#### Returns

`Promise`\<`Response`\>

A Response object for the HTTP request
