[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: ResultForWithActionResult\<R, Params\>

> **ResultForWithActionResult**\<`R`, `Params`\> = `{ [P in keyof Params & keyof R["infer"]["serverActions"]]: ActionResult<R["infer"]["serverActions"][P]["result"]> }`

Defined in: [src/router/router-client.types.ts:47](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/router/router-client.types.ts#L47)

Type representing the result object with action results (includes unwrapped stream types).

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

### Params

`Params` *extends* [`ParamsIt`](ParamsIt.md)\<`R`\>

The parameters type
