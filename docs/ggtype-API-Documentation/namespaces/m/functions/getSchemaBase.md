[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Function: getSchemaBase()

> **getSchemaBase**(`model`): `object`

Defined in: [src/model/model.ts:231](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L231)

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
