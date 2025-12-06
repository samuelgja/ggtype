[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Interface: ModelNotGeneric

Defined in: [src/model/model.ts:153](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L153)

## Extends

- [`ModelBase`](ModelBase.md)

## Extended by

- [`Model`](Model.md)

## Properties

### $internals

> **$internals**: [`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md)

Defined in: [src/model/model.ts:128](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L128)

Internal model configuration and metadata

#### Inherited from

[`ModelBase`](ModelBase.md).[`$internals`](ModelBase.md#internals)

***

### description()

> **description**: (`description`) => `ModelNotGeneric`

Defined in: [src/model/model.ts:140](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L140)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`ModelNotGeneric`

A new model instance with the updated description

#### Inherited from

[`ModelBase`](ModelBase.md).[`description`](ModelBase.md#description)

***

### getSchema()

> **getSchema**: (`options?`) => `JSONSchema7`

Defined in: [src/model/model.ts:146](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L146)

Gets the JSON Schema representation of the model

#### Parameters

##### options?

[`GetSchemaOptions`](GetSchemaOptions.md)

Optional schema generation options

#### Returns

`JSONSchema7`

The JSON Schema object

#### Inherited from

[`ModelBase`](ModelBase.md).[`getSchema`](ModelBase.md#getschema)

***

### getSchemaRef()

> **getSchemaRef**: () => `JSONSchema7`

Defined in: [src/model/model.ts:151](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L151)

Gets the JSON Schema with references (compact form)

#### Returns

`JSONSchema7`

The JSON Schema object with $defs for referenced models

#### Inherited from

[`ModelBase`](ModelBase.md).[`getSchemaRef`](ModelBase.md#getschemaref)

***

### infer

> **infer**: `unknown`

Defined in: [src/model/model.ts:124](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L124)

Inferred TypeScript type for the model

#### Inherited from

[`ModelBase`](ModelBase.md).[`infer`](ModelBase.md#infer)

***

### isOptional()

> **isOptional**: () => `ModelNotGeneric`

Defined in: [src/model/model.ts:166](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L166)

Marks the model as optional

#### Returns

`ModelNotGeneric`

A new model instance marked as optional

***

### onParse()

> **onParse**: (`data`) => `unknown`

Defined in: [src/model/model.ts:161](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L161)

Function to parse and validate data according to the model

#### Parameters

##### data

`never`

#### Returns

`unknown`

***

### onStringify()?

> `optional` **onStringify**: (`data`) => `unknown`

Defined in: [src/model/model.ts:157](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L157)

Optional function to transform data when stringifying (for serialization)

#### Parameters

##### data

`never`

#### Returns

`unknown`

***

### title()

> **title**: (`name`) => `ModelNotGeneric`

Defined in: [src/model/model.ts:134](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L134)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`ModelNotGeneric`

A new model instance with the updated title

#### Inherited from

[`ModelBase`](ModelBase.md).[`title`](ModelBase.md#title)
