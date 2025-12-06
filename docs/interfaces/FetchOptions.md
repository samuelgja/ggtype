[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: FetchOptions\<R\>

Defined in: [src/router-client/router-client.types.ts:79](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L79)

Options for fetch and stream calls.

## Type Parameters

### R

`R` *extends* [`Router`](Router.md)\<[`ServerActionsBase`](../type-aliases/ServerActionsBase.md), [`ClientActionsBase`](../type-aliases/ClientActionsBase.md)\>

The router type

## Properties

### defineClientActions?

> `readonly` `optional` **defineClientActions**: `Partial`\<[`ClientCallableActionsFromClient`](../type-aliases/ClientCallableActionsFromClient.md)\<`R`\[`"infer"`\]\[`"clientActions"`\]\>\>

Defined in: [src/router-client/router-client.types.ts:90](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L90)

Partial client action handlers that override client-level handlers for this specific request.
If an action is defined here, it will be used instead of the client-level definition.

***

### files?

> `readonly` `optional` **files**: readonly `File`[]

Defined in: [src/router-client/router-client.types.ts:85](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L85)

Optional array of files to upload

***

### method?

> `readonly` `optional` **method**: `"GET"` \| `"POST"` \| `"PUT"` \| `"PATCH"` \| `"DELETE"`

Defined in: [src/router-client/router-client.types.ts:101](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L101)

HTTP method to use for the request.
Defaults to 'GET' for HTTP transport, 'POST' for stream transport.
Note: Stream transport requires POST (or other methods that support request bodies).
For GET requests with HTTP transport, parameters are sent as query parameters.
