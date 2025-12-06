[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Function: getBaseModel()

> **getBaseModel**\<`M`\>(): `M`

Defined in: [src/model/model.ts:191](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L191)

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
