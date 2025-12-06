[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: BidirectionalConnection\<R\>

Defined in: [src/router-client/router-client.types.ts:430](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L430)

Bidirectional connection for sending and receiving messages.

## Type Parameters

### R

`R` *extends* [`Router`](Router.md)\<[`ServerActionsBase`](../type-aliases/ServerActionsBase.md), [`ClientActionsBase`](../type-aliases/ClientActionsBase.md)\>

The router type

## Properties

### close()

> `readonly` **close**: () => `void`

Defined in: [src/router-client/router-client.types.ts:451](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L451)

Closes the connection

#### Returns

`void`

***

### send()

> `readonly` **send**: \<`Params`\>(`params`) => `Promise`\<`void`\>

Defined in: [src/router-client/router-client.types.ts:445](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L445)

Sends parameters to the server

#### Type Parameters

##### Params

`Params` *extends* [`ParamsIt`](../type-aliases/ParamsIt.md)\<`R`\>

#### Parameters

##### params

`Params`

Parameters to send. See ParamsIt type for details.

#### Returns

`Promise`\<`void`\>

***

### stream

> `readonly` **stream**: `AsyncGenerator`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`R`, [`ParamsIt`](../type-aliases/ParamsIt.md)\<`R`\>\>, `void`, `unknown`\>

Defined in: [src/router-client/router-client.types.ts:436](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L436)

Async generator for receiving messages from the server
