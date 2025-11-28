[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: ParamsIt\<R\>

> **ParamsIt**\<`R`\> = `{ [P in keyof R["infer"]["serverActions"]]?: R["infer"]["serverActions"][P]["params"] }`

Defined in: [src/router/router-client.types.ts:19](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/router/router-client.types.ts#L19)

Type representing the parameters object for router client fetch/stream calls.
Maps action names to their parameter types.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type
