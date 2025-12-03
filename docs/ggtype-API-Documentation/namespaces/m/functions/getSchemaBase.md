[**ggtype API Documentation v0.5.1**](../../../../README.md)

***

# Function: getSchemaBase()

> **getSchemaBase**(`model`): `object`

Defined in: [src/model/model.ts:231](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L231)

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
