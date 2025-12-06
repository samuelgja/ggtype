[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: ActionCbParameters\<M\>

Defined in: [src/action/action.ts:57](https://github.com/samuelgja/ggtype/blob/main/src/action/action.ts#L57)

Parameters passed to action callback functions.

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md) = [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md)

The model type for parameters

## Properties

### clientActions()

> `readonly` **clientActions**: \<`ClientActions`\>() => [`ClientCallableActions`](../type-aliases/ClientCallableActions.md)\<`ClientActions`\>

Defined in: [src/action/action.ts:72](https://github.com/samuelgja/ggtype/blob/main/src/action/action.ts#L72)

Function to get client actions for bidirectional communication.
Always available - returns empty object if no client actions are defined.

#### Type Parameters

##### ClientActions

`ClientActions` *extends* `Record`\<`string`, [`ClientAction`](ClientAction.md)\>

#### Returns

[`ClientCallableActions`](../type-aliases/ClientCallableActions.md)\<`ClientActions`\>

***

### ctx?

> `readonly` `optional` **ctx**: `unknown`

Defined in: [src/action/action.ts:67](https://github.com/samuelgja/ggtype/blob/main/src/action/action.ts#L67)

Optional context object passed from the router

***

### files?

> `readonly` `optional` **files**: `ReadonlyMap`\<`string`, `File`\>

Defined in: [src/action/action.ts:78](https://github.com/samuelgja/ggtype/blob/main/src/action/action.ts#L78)

Optional map of uploaded files keyed by file ID

***

### params

> `readonly` **params**: `M`\[`"infer"`\]

Defined in: [src/action/action.ts:63](https://github.com/samuelgja/ggtype/blob/main/src/action/action.ts#L63)

Validated and parsed action parameters
