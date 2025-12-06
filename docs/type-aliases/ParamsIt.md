[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: ParamsIt\<R\>

> **ParamsIt**\<`R`\> = `{ [P in keyof R["infer"]["serverActions"]]?: R["infer"]["serverActions"][P]["params"] }`

Defined in: [src/router-client/router-client.types.ts:20](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L20)

Type representing the parameters object for router client fetch/stream calls.
Maps action names to their parameter types.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<[`ServerActionsBase`](ServerActionsBase.md), [`ClientActionsBase`](ClientActionsBase.md)\>

The router type
