[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: ActionFn()\<M\>

> **ActionFn**\<`M`\> = (`parameters`) => `Awaited`\<[`ReturnValue`](ReturnValue.md)\>

Defined in: [src/action/action.ts:86](https://github.com/samuelgja/ggtype/blob/main/src/action/action.ts#L86)

Function type for action callbacks.

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md) = [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md)

The model type for parameters

## Parameters

### parameters

[`ActionCbParameters`](../interfaces/ActionCbParameters.md)\<`M`\>

## Returns

`Awaited`\<[`ReturnValue`](ReturnValue.md)\>
