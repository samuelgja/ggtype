[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: Action\<M, F\>

> **Action**\<`M`, `F`\> = `object`

Defined in: [src/action/action.ts:86](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/action/action.ts#L86)

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md) = [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md)

### F

`F` *extends* [`ActionFn`](ActionFn.md)\<`M`\> = [`ActionFn`](ActionFn.md)

## Properties

### model

> **model**: `M`

Defined in: [src/action/action.ts:93](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/action/action.ts#L93)

The model used for parameter validation

***

### run

> **run**: `F`

Defined in: [src/action/action.ts:97](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/action/action.ts#L97)

The action execution function
