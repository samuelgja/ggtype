[**ggtype API Documentation v0.4.7**](../README.md)

***

# Type Alias: ParamsIt\<R\>

> **ParamsIt**\<`R`\> = `{ [P in keyof R["infer"]["serverActions"]]?: R["infer"]["serverActions"][P]["params"] }`

Defined in: [src/router/router-client.types.ts:19](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/router/router-client.types.ts#L19)

Type representing the parameters object for router client fetch/stream calls.
Maps action names to their parameter types.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type
