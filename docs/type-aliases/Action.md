[**ggtype API Documentation v0.5.1**](../README.md)

***

# Type Alias: Action\<M, F\>

> **Action**\<`M`, `F`\> = `object`

Defined in: [src/action/action.ts:98](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/action/action.ts#L98)

Action definition with model and execution function.

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md) = [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md)

The model type for parameters

### F

`F` *extends* [`ActionFn`](ActionFn.md)\<`M`\> = [`ActionFn`](ActionFn.md)

The action function type

## Properties

### model

> `readonly` **model**: `M`

Defined in: [src/action/action.ts:105](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/action/action.ts#L105)

The model used for parameter validation

***

### run

> `readonly` **run**: `F`

Defined in: [src/action/action.ts:109](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/action/action.ts#L109)

The action execution function
