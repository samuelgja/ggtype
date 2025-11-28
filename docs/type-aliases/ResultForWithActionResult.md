[**ggtype API Documentation v0.4.7**](../README.md)

***

# Type Alias: ResultForWithActionResult\<R, Params\>

> **ResultForWithActionResult**\<`R`, `Params`\> = `{ [P in keyof Params & keyof R["infer"]["serverActions"]]: ActionResult<R["infer"]["serverActions"][P]["result"]> }`

Defined in: [src/router/router-client.types.ts:50](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/router/router-client.types.ts#L50)

Type representing the result object with action results (includes unwrapped stream types).

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

### Params

`Params` *extends* [`ParamsIt`](ParamsIt.md)\<`R`\>

The parameters type
