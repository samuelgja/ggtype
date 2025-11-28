[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: FetchOptions\<R\>

Defined in: [src/router/router-client.types.ts:280](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/router/router-client.types.ts#L280)

Options for fetch and stream calls.

## Type Parameters

### R

`R` *extends* [`Router`](Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

## Properties

### defineClientActions?

> `optional` **defineClientActions**: `Partial`\<`ClientCallableActionsFromClient`\<`R`\[`"infer"`\]\[`"clientActions"`\]\>\>

Defined in: [src/router/router-client.types.ts:294](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/router/router-client.types.ts#L294)

Partial client action handlers that override client-level handlers for this specific request.
If an action is defined here, it will be used instead of the client-level definition.

***

### files?

> `optional` **files**: `File`[]

Defined in: [src/router/router-client.types.ts:289](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/router/router-client.types.ts#L289)

Optional array of files to upload

***

### method?

> `optional` **method**: `"POST"` \| `"GET"` \| `"PUT"` \| `"PATCH"` \| `"DELETE"`

Defined in: [src/router/router-client.types.ts:305](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/router/router-client.types.ts#L305)

HTTP method to use for the request.
Defaults to 'GET' for HTTP transport, 'POST' for stream transport.
Note: Stream transport requires POST (or other methods that support request bodies).
For GET requests with HTTP transport, parameters are sent as query parameters.
