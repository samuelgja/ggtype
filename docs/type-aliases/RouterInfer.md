[**ggtype API Documentation v0.4.7**](../README.md)

***

# Type Alias: RouterInfer\<R\>

> **RouterInfer**\<`R`\> = `{ [K in keyof R["infer"]["serverActions"]]: { params: R["infer"]["serverActions"][K]["params"]; result: ActionResult<R["infer"]["serverActions"][K]["result"]> } }` & [`RouterInferNotGeneric`](RouterInferNotGeneric.md)

Defined in: [src/types.ts:443](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L443)

Converts router's serverActions to a format compatible with Client (RouterInferNotGeneric).
This type wraps router action results in ActionResultNotGeneric format.
The params are preserved exactly as they are inferred from the router to ensure type compatibility.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>
