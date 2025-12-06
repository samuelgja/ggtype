[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: ResultForWithActionResult\<R, Params\>

> **ResultForWithActionResult**\<`R`, `Params`\> = `{ [P in keyof Params & keyof R["infer"]["serverActions"]]: ActionResult<R["infer"]["serverActions"][P]["result"]> }`

Defined in: [src/router-client/router-client.types.ts:59](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L59)

Type representing the result object with action results wrapped in ActionResult format.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<[`ServerActionsBase`](ServerActionsBase.md), [`ClientActionsBase`](ClientActionsBase.md)\>

The router type

### Params

`Params` *extends* [`ParamsIt`](ParamsIt.md)\<`R`\>

The parameters type
