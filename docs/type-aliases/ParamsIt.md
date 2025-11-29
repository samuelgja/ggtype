[**ggtype API Documentation v0.4.8**](../README.md)

***

# Type Alias: ParamsIt\<R\>

> **ParamsIt**\<`R`\> = `{ [P in keyof R["infer"]["serverActions"]]?: R["infer"]["serverActions"][P]["params"] }`

Defined in: [src/router/router-client.types.ts:19](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/router-client.types.ts#L19)

Type representing the parameters object for router client fetch/stream calls.
Maps action names to their parameter types.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type
