[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: ResultForWithActionResult\<R, Params\>

> **ResultForWithActionResult**\<`R`, `Params`\> = `{ [P in keyof Params & keyof R["infer"]["serverActions"]]: ActionResult<R["infer"]["serverActions"][P]["result"]> }`

Defined in: [src/router/router-client.types.ts:50](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/router/router-client.types.ts#L50)

Type representing the result object with action results (includes unwrapped stream types).

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

### Params

`Params` *extends* [`ParamsIt`](ParamsIt.md)\<`R`\>

The parameters type
