[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: FetchOptions\<R\>

Defined in: [src/router/router-client.types.ts:270](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/router/router-client.types.ts#L270)

Options for fetch and stream calls.

## Type Parameters

### R

`R` *extends* [`Router`](Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

## Properties

### defineClientActions?

> `optional` **defineClientActions**: `Partial`\<`ClientCallableActionsFromClient`\<`R`\[`"infer"`\]\[`"clientActions"`\]\>\>

Defined in: [src/router/router-client.types.ts:284](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/router/router-client.types.ts#L284)

Partial client action handlers that override client-level handlers for this specific request.
If an action is defined here, it will be used instead of the client-level definition.

***

### files?

> `optional` **files**: `File`[]

Defined in: [src/router/router-client.types.ts:279](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/router/router-client.types.ts#L279)

Optional array of files to upload

***

### method?

> `optional` **method**: `"POST"` \| `"GET"` \| `"PUT"` \| `"PATCH"` \| `"DELETE"`

Defined in: [src/router/router-client.types.ts:295](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/router/router-client.types.ts#L295)

HTTP method to use for the request.
Defaults to 'GET' for HTTP transport, 'POST' for stream transport.
Note: Stream transport requires POST (or other methods that support request bodies).
For GET requests with HTTP transport, parameters are sent as query parameters.
