[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: RouterInfer\<R\>

> **RouterInfer**\<`R`\> = `{ [K in keyof R["infer"]["serverActions"]]: { params: R["infer"]["serverActions"][K]["params"]; result: ActionResult<R["infer"]["serverActions"][K]["result"]> } }` & [`RouterInferNotGeneric`](RouterInferNotGeneric.md)

Defined in: [src/router/router.type.ts:293](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L293)

Converts router's serverActions to a format compatible with Client (RouterInferNotGeneric).
This type wraps router action results in ActionResultNotGeneric format.
The params are preserved exactly as they are inferred from the router to ensure type compatibility.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<[`ServerActionsBase`](ServerActionsBase.md), [`ClientActionsBase`](ClientActionsBase.md)\>
