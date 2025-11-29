[**ggtype API Documentation v0.4.8**](../README.md)

***

# Type Alias: ResultFor\<R, Params\>

> **ResultFor**\<`R`, `Params`\> = `{ [P in keyof Params]: RouterResultNotGeneric }`

Defined in: [src/router/router-client.types.ts:34](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/router-client.types.ts#L34)

Type representing the result object with basic router results.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

### Params

`Params` *extends* [`ParamsIt`](ParamsIt.md)\<`R`\>

The parameters type
