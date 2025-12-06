[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: ResultFor\<R, Params\>

> **ResultFor**\<`R`, `Params`\> = `{ [P in keyof Params]: RouterResultNotGeneric }`

Defined in: [src/router-client/router-client.types.ts:32](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L32)

Type representing the result object with basic router results.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<[`ServerActionsBase`](ServerActionsBase.md), [`ClientActionsBase`](ClientActionsBase.md)\>

The router type

### Params

`Params` *extends* [`ParamsIt`](ParamsIt.md)\<`R`\>

The parameters type
