[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Function: getBaseModel()

> **getBaseModel**\<`M`\>(): `M`

Defined in: [src/model/model.ts:191](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/model/model.ts#L191)

Creates a base model instance with default internals and common methods.
Returns a model object with title, description, and getSchemaRef methods.
Used as a foundation for creating specific model types.

## Type Parameters

### M

`M` *extends* [`ModelBase`](../interfaces/ModelBase.md)

The model base type to create

## Returns

`M`

A base model instance with default configuration
