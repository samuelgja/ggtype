[**ggtype API Documentation v0.4.7**](../README.md)

***

# Interface: ActionCbParameters\<M\>

Defined in: [src/action/action.ts:54](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/action/action.ts#L54)

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md) = [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md)

## Properties

### clientActions()

> `readonly` **clientActions**: \<`ClientActions`\>() => `ClientCallableActions`\<`ClientActions`\>

Defined in: [src/action/action.ts:69](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/action/action.ts#L69)

Function to get client actions for bidirectional communication.
Always available - returns empty object if no client actions are defined.

#### Type Parameters

##### ClientActions

`ClientActions` *extends* `Record`\<`string`, `ClientAction`\>

#### Returns

`ClientCallableActions`\<`ClientActions`\>

***

### ctx?

> `readonly` `optional` **ctx**: `unknown`

Defined in: [src/action/action.ts:64](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/action/action.ts#L64)

Optional context object passed from the router

***

### params

> `readonly` **params**: `M`\[`"infer"`\]

Defined in: [src/action/action.ts:60](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/action/action.ts#L60)

Validated and parsed action parameters
