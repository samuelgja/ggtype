[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: ParamsIt\<R\>

> **ParamsIt**\<`R`\> = `{ [P in keyof R["infer"]["serverActions"]]?: R["infer"]["serverActions"][P]["params"] }`

Defined in: [src/router/router-client.types.ts:18](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/router/router-client.types.ts#L18)

Type representing the parameters object for router client fetch/stream calls.
Maps action names to their parameter types.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type
