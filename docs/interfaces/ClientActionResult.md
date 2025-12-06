[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: ClientActionResult\<T\>

Defined in: [src/router-client/router-client.types.ts:395](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L395)

Result of a client action call.

## Type Parameters

### T

`T` *extends* [`ClientAction`](ClientAction.md)

The client action type

## Properties

### data?

> `readonly` `optional` **data**: `T`\[`"return"`\]\[`"infer"`\]

Defined in: [src/router-client/router-client.types.ts:405](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L405)

Success data (present when status is 'ok')

***

### error?

> `readonly` `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/router-client/router-client.types.ts:409](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L409)

Error information (present when status is 'error')

***

### status

> `readonly` **status**: [`ResultStatus`](../type-aliases/ResultStatus.md)

Defined in: [src/router-client/router-client.types.ts:401](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L401)

Status of the client action result
