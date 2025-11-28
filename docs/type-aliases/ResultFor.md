[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: ResultFor\<R, Params\>

> **ResultFor**\<`R`, `Params`\> = `{ [P in keyof Params]: RouterResultNotGeneric }`

Defined in: [src/router/router-client.types.ts:34](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/router/router-client.types.ts#L34)

Type representing the result object with basic router results.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

### Params

`Params` *extends* [`ParamsIt`](ParamsIt.md)\<`R`\>

The parameters type
