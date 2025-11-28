[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Interface: Model\<T, R\>

Defined in: [src/model/model.ts:168](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L168)

## Extends

- [`ModelNotGeneric`](ModelNotGeneric.md)

## Extended by

- [`ArrayModel`](ArrayModel.md)
- [`BooleanModel`](BooleanModel.md)
- [`EnumModel`](EnumModel.md)
- [`NumberModel`](NumberModel.md)
- [`ObjectModel`](ObjectModel.md)
- [`StringModel`](StringModel.md)
- [`NullModel`](NullModel.md)
- [`DateModel`](DateModel.md)
- [`OrModel`](OrModel.md)
- [`AndModel`](AndModel.md)
- [`RecordModel`](RecordModel.md)
- [`FileModel`](FileModel.md)
- [`BlobModel`](BlobModel.md)

## Type Parameters

### T

`T`

### R

`R` *extends* `boolean` = `false`

## Properties

### $internals

> **$internals**: [`ModelInternals`](ModelInternals.md)\<`R`\>

Defined in: [src/model/model.ts:181](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L181)

Internal model configuration and metadata with type-safe required flag

#### Overrides

[`ModelNotGeneric`](ModelNotGeneric.md).[`$internals`](ModelNotGeneric.md#internals)

***

### description()

> **description**: (`description`) => [`ModelNotGeneric`](ModelNotGeneric.md)

Defined in: [src/model/model.ts:140](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L140)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

[`ModelNotGeneric`](ModelNotGeneric.md)

A new model instance with the updated description

#### Inherited from

[`ModelNotGeneric`](ModelNotGeneric.md).[`description`](ModelNotGeneric.md#description)

***

### getSchema()

> **getSchema**: (`options?`) => `JSONSchema7`

Defined in: [src/model/model.ts:146](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L146)

Gets the JSON Schema representation of the model

#### Parameters

##### options?

[`GetSchemaOptions`](GetSchemaOptions.md)

Optional schema generation options

#### Returns

`JSONSchema7`

The JSON Schema object

#### Inherited from

[`ModelNotGeneric`](ModelNotGeneric.md).[`getSchema`](ModelNotGeneric.md#getschema)

***

### getSchemaRef()

> **getSchemaRef**: () => `JSONSchema7`

Defined in: [src/model/model.ts:151](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L151)

Gets the JSON Schema with references (compact form)

#### Returns

`JSONSchema7`

The JSON Schema object with $defs for referenced models

#### Inherited from

[`ModelNotGeneric`](ModelNotGeneric.md).[`getSchemaRef`](ModelNotGeneric.md#getschemaref)

***

### infer

> **infer**: `unknown`

Defined in: [src/model/model.ts:124](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L124)

Inferred TypeScript type for the model

#### Inherited from

[`ModelNotGeneric`](ModelNotGeneric.md).[`infer`](ModelNotGeneric.md#infer)

***

### isRequired()

> **isRequired**: () => [`ModelNotGeneric`](ModelNotGeneric.md)

Defined in: [src/model/model.ts:166](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L166)

Marks the model as required

#### Returns

[`ModelNotGeneric`](ModelNotGeneric.md)

A new model instance marked as required

#### Inherited from

[`ModelNotGeneric`](ModelNotGeneric.md).[`isRequired`](ModelNotGeneric.md#isrequired)

***

### onParse()

> `readonly` **onParse**: (`data`) => `T`

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L177)

Function to parse and validate data according to the model, returning typed result

#### Parameters

##### data

`unknown`

The data to parse

#### Returns

`T`

The parsed and validated data of type T

#### Overrides

[`ModelNotGeneric`](ModelNotGeneric.md).[`onParse`](ModelNotGeneric.md#onparse)

***

### onStringify()?

> `optional` **onStringify**: (`data`) => `unknown`

Defined in: [src/model/model.ts:157](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L157)

Optional function to transform data when stringifying (for serialization)

#### Parameters

##### data

`never`

#### Returns

`unknown`

#### Inherited from

[`ModelNotGeneric`](ModelNotGeneric.md).[`onStringify`](ModelNotGeneric.md#onstringify)

***

### title()

> **title**: (`name`) => [`ModelNotGeneric`](ModelNotGeneric.md)

Defined in: [src/model/model.ts:134](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L134)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

[`ModelNotGeneric`](ModelNotGeneric.md)

A new model instance with the updated title

#### Inherited from

[`ModelNotGeneric`](ModelNotGeneric.md).[`title`](ModelNotGeneric.md#title)
