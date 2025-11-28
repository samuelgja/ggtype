[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: ActionCbParameters\<M\>

Defined in: [src/action/action.ts:25](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/action/action.ts#L25)

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md) = [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md)

## Properties

### ctx?

> `readonly` `optional` **ctx**: `unknown`

Defined in: [src/action/action.ts:35](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/action/action.ts#L35)

Optional context object passed from the router

***

### getClientActions()?

> `readonly` `optional` **getClientActions**: \<`ClientActions`\>() => `ClientCallableActions`\<`ClientActions`\>

Defined in: [src/action/action.ts:39](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/action/action.ts#L39)

Function to get client actions for bidirectional communication

#### Type Parameters

##### ClientActions

`ClientActions` *extends* `Record`\<`string`, `ClientAction`\>

#### Returns

`ClientCallableActions`\<`ClientActions`\>

***

### params

> `readonly` **params**: `M`\[`"infer"`\]

Defined in: [src/action/action.ts:31](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/action/action.ts#L31)

Validated and parsed action parameters
