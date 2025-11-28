[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: Action\<M, F\>

> **Action**\<`M`, `F`\> = `object`

Defined in: [src/action/action.ts:50](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/action/action.ts#L50)

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md) = [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md)

### F

`F` *extends* [`ActionFn`](ActionFn.md)\<`M`\> = [`ActionFn`](ActionFn.md)

## Properties

### model

> **model**: `M`

Defined in: [src/action/action.ts:57](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/action/action.ts#L57)

The model used for parameter validation

***

### run

> **run**: `F`

Defined in: [src/action/action.ts:61](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/action/action.ts#L61)

The action execution function
