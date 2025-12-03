[**ggtype API Documentation v0.5.1**](../README.md)

***

# Interface: ActionCbParameters\<M\>

Defined in: [src/action/action.ts:57](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/action/action.ts#L57)

Parameters passed to action callback functions.

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md) = [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md)

The model type for parameters

## Properties

### clientActions()

> `readonly` **clientActions**: \<`ClientActions`\>() => `ClientCallableActions`\<`ClientActions`\>

Defined in: [src/action/action.ts:72](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/action/action.ts#L72)

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

Defined in: [src/action/action.ts:67](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/action/action.ts#L67)

Optional context object passed from the router

***

### files?

> `readonly` `optional` **files**: `ReadonlyMap`\<`string`, `File`\>

Defined in: [src/action/action.ts:78](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/action/action.ts#L78)

Optional map of uploaded files keyed by file ID

***

### params

> `readonly` **params**: `M`\[`"infer"`\]

Defined in: [src/action/action.ts:63](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/action/action.ts#L63)

Validated and parsed action parameters
