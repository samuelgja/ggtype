[**ggtype API Documentation v0.4.8**](../README.md)

***

# Interface: FetchOptions\<R\>

Defined in: [src/router/router-client.types.ts:280](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/router-client.types.ts#L280)

Options for fetch and stream calls.

## Type Parameters

### R

`R` *extends* [`Router`](Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

## Properties

### defineClientActions?

> `optional` **defineClientActions**: `Partial`\<`ClientCallableActionsFromClient`\<`R`\[`"infer"`\]\[`"clientActions"`\]\>\>

Defined in: [src/router/router-client.types.ts:294](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/router-client.types.ts#L294)

Partial client action handlers that override client-level handlers for this specific request.
If an action is defined here, it will be used instead of the client-level definition.

***

### files?

> `optional` **files**: `File`[]

Defined in: [src/router/router-client.types.ts:289](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/router-client.types.ts#L289)

Optional array of files to upload

***

### method?

> `optional` **method**: `"POST"` \| `"GET"` \| `"PUT"` \| `"PATCH"` \| `"DELETE"`

Defined in: [src/router/router-client.types.ts:305](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/router-client.types.ts#L305)

HTTP method to use for the request.
Defaults to 'GET' for HTTP transport, 'POST' for stream transport.
Note: Stream transport requires POST (or other methods that support request bodies).
For GET requests with HTTP transport, parameters are sent as query parameters.
