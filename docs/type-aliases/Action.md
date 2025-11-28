[**ggtype API Documentation v0.4.7**](../README.md)

***

# Type Alias: Action\<M, F\>

> **Action**\<`M`, `F`\> = `object`

Defined in: [src/action/action.ts:86](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/action/action.ts#L86)

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md) = [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md)

### F

`F` *extends* [`ActionFn`](ActionFn.md)\<`M`\> = [`ActionFn`](ActionFn.md)

## Properties

### model

> **model**: `M`

Defined in: [src/action/action.ts:93](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/action/action.ts#L93)

The model used for parameter validation

***

### run

> **run**: `F`

Defined in: [src/action/action.ts:97](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/action/action.ts#L97)

The action execution function
