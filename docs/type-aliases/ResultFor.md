[**ggtype API Documentation v0.4.7**](../README.md)

***

# Type Alias: ResultFor\<R, Params\>

> **ResultFor**\<`R`, `Params`\> = `{ [P in keyof Params]: RouterResultNotGeneric }`

Defined in: [src/router/router-client.types.ts:34](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/router/router-client.types.ts#L34)

Type representing the result object with basic router results.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

### Params

`Params` *extends* [`ParamsIt`](ParamsIt.md)\<`R`\>

The parameters type
