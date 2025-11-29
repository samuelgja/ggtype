[**ggtype API Documentation v0.4.8**](../README.md)

***

# Type Alias: ResultForWithActionResult\<R, Params\>

> **ResultForWithActionResult**\<`R`, `Params`\> = `{ [P in keyof Params & keyof R["infer"]["serverActions"]]: ActionResult<R["infer"]["serverActions"][P]["result"]> }`

Defined in: [src/router/router-client.types.ts:50](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/router-client.types.ts#L50)

Type representing the result object with action results (includes unwrapped stream types).

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

### Params

`Params` *extends* [`ParamsIt`](ParamsIt.md)\<`R`\>

The parameters type
