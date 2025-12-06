[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: WebsocketOptions\<R\>

Defined in: [src/router-client/router-client.types.ts:157](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L157)

Options for WebSocket calls.

## Type Parameters

### R

`R` *extends* [`Router`](Router.md)\<[`ServerActionsBase`](../type-aliases/ServerActionsBase.md), [`ClientActionsBase`](../type-aliases/ClientActionsBase.md)\>

The router type

## Properties

### defineClientActions?

> `readonly` `optional` **defineClientActions**: `Partial`\<[`ClientCallableActionsFromClient`](../type-aliases/ClientCallableActionsFromClient.md)\<`R`\[`"infer"`\]\[`"clientActions"`\]\>\>

Defined in: [src/router-client/router-client.types.ts:164](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L164)

Partial client action handlers that override client-level handlers for this specific request.
If an action is defined here, it will be used instead of the client-level definition.

***

### files?

> `readonly` `optional` **files**: readonly `File`[]

Defined in: [src/router-client/router-client.types.ts:179](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L179)

Optional array of files to upload

***

### method?

> `readonly` `optional` **method**: `"POST"` \| `"PUT"` \| `"PATCH"` \| `"DELETE"`

Defined in: [src/router-client/router-client.types.ts:175](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L175)

HTTP method to use for the request.
Defaults to 'GET' for HTTP transport, 'POST' for stream transport.
Note: Stream transport requires POST (or other methods that support request bodies).
For GET requests with HTTP transport, parameters are sent as query parameters.
