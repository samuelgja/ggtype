[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: ClientCallableActionsFromClient\<T\>

> **ClientCallableActionsFromClient**\<`T`\> = `{ [K in keyof T]: (params: T[K]["params"]["infer"]) => Promise<T[K]["return"]["infer"]> }`

Defined in: [src/router-client/router-client.types.ts:45](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L45)

Type representing callable client actions from the client perspective.
Maps action names to async functions that accept parameters and return results.

## Type Parameters

### T

`T` *extends* [`ClientActionsBase`](ClientActionsBase.md)

The client actions base type
