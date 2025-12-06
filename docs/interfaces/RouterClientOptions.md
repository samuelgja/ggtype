[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: RouterClientOptions\<R\>

Defined in: [src/router-client/router-client.types.ts:187](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L187)

Configuration options for creating a router client.

## Type Parameters

### R

`R` *extends* [`Router`](Router.md)\<[`ServerActionsBase`](../type-aliases/ServerActionsBase.md), [`ClientActionsBase`](../type-aliases/ClientActionsBase.md)\>

The router type

## Properties

### defineClientActions?

> `readonly` `optional` **defineClientActions**: [`ClientCallableActionsFromClient`](../type-aliases/ClientCallableActionsFromClient.md)\<`R`\[`"infer"`\]\[`"clientActions"`\]\>

Defined in: [src/router-client/router-client.types.ts:209](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L209)

Handlers for client actions (called by server)

***

### halfDuplexUrl?

> `readonly` `optional` **halfDuplexUrl**: `string` \| `URL`

Defined in: [src/router-client/router-client.types.ts:197](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L197)

URL for half-duplex (bidirectional) stream transport

***

### httpURL?

> `readonly` `optional` **httpURL**: `string` \| `URL`

Defined in: [src/router-client/router-client.types.ts:205](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L205)

URL for HTTP transport. If provided and neither streamURL nor websocketURL are provided, will be used.

***

### onError()?

> `readonly` `optional` **onError**: (`error`) => `Error`

Defined in: [src/router-client/router-client.types.ts:251](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L251)

Optional error handler invoked whenever the client encounters a transport
error or client action failure before propagation. Should return the error
that will be thrown to the caller.

#### Parameters

##### error

`Error`

#### Returns

`Error`

***

### onResponse()?

> `optional` **onResponse**: \<`Params`\>(`options`) => `unknown`

Defined in: [src/router-client/router-client.types.ts:226](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L226)

Optional callback invoked after receiving a response.
Can modify the response or throw an error to retry.

#### Type Parameters

##### Params

`Params` *extends* [`ParamsIt`](../type-aliases/ParamsIt.md)\<`R`\>

#### Parameters

##### options

Response options with json (result), statusCode, and runAgain method. See the inline type definition for property details.

###### json

[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`R`, `Params`\>

###### runAgain

\<`NewParams`\>(`newParams?`, `newOptions?`) => `unknown`

###### statusCode

`number`

#### Returns

`unknown`

The modified response JSON, or undefined to use the original

Note: For HTTP transport, runAgain returns a Promise.
For stream, websocket, and duplex transports, runAgain returns an AsyncGenerator.
When returning the result of runAgain(), you may need to await it for HTTP transport.

***

### responseTimeout?

> `readonly` `optional` **responseTimeout**: `number`

Defined in: [src/router-client/router-client.types.ts:215](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L215)

Timeout in milliseconds for waiting responses (default: 60000)

***

### streamURL?

> `readonly` `optional` **streamURL**: `string` \| `URL`

Defined in: [src/router-client/router-client.types.ts:193](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L193)

URL for stream transport

***

### websocketURL?

> `readonly` `optional` **websocketURL**: `string` \| `URL`

Defined in: [src/router-client/router-client.types.ts:201](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L201)

URL for WebSocket transport. If provided and streamURL is not provided, will be used.
