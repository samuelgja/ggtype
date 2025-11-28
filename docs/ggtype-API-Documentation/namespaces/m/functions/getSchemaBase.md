[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Function: getSchemaBase()

> **getSchemaBase**(`model`): `object`

Defined in: [src/model/model.ts:231](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L231)

Extracts base schema properties (title and description) from a model.
Returns an object containing the title and description from the model's internals.

## Parameters

### model

[`ModelBase`](../interfaces/ModelBase.md)

The model to extract schema base from

## Returns

`object`

An object with title and description properties

### description

> **description**: `string` = `model.$internals.description`

### title

> **title**: `string` = `model.$internals.title`
