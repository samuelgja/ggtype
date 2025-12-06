[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: ClientCallableActions\<T\>

> **ClientCallableActions**\<`T`\> = `{ [K in keyof T]: (params: T[K]["params"]["infer"]) => Promise<ClientActionResult<T[K]>> }`

Defined in: [src/router-client/router-client.types.ts:417](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L417)

Type representing callable client actions that return ClientActionResult.

## Type Parameters

### T

`T` *extends* [`ClientActionsBase`](ClientActionsBase.md)

The client actions base type
