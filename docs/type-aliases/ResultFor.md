[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: ResultFor\<R, Params\>

> **ResultFor**\<`R`, `Params`\> = `{ [P in keyof Params]: RouterResultNotGeneric }`

Defined in: [src/router/router-client.types.ts:32](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/router/router-client.types.ts#L32)

Type representing the result object with basic router results.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

### Params

`Params` *extends* [`ParamsIt`](ParamsIt.md)\<`R`\>

The parameters type
