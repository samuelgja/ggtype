[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Interface: RecordModel\<M, R\>

Defined in: [src/model/record.ts:13](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/record.ts#L13)

## Extends

- [`Model`](Model.md)\<`M`, `R`\>

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](ModelNotGeneric.md)

### R

`R` *extends* `boolean` = `false`

## Properties

### $internals

> **$internals**: [`ModelInternals`](ModelInternals.md)\<`R`\>

Defined in: [src/model/model.ts:181](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L181)

Internal model configuration and metadata with type-safe required flag

#### Inherited from

[`Model`](Model.md).[`$internals`](Model.md#internals)

***

### description()

> `readonly` **description**: (`description`) => `RecordModel`\<`M`, `R`\>

Defined in: [src/model/record.ts:45](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/record.ts#L45)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`RecordModel`\<`M`, `R`\>

A new RecordModel instance with the updated description

#### Overrides

[`Model`](Model.md).[`description`](Model.md#description)

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

[`Model`](Model.md).[`getSchema`](Model.md#getschema)

***

### getSchemaRef()

> **getSchemaRef**: () => `JSONSchema7`

Defined in: [src/model/model.ts:151](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L151)

Gets the JSON Schema with references (compact form)

#### Returns

`JSONSchema7`

The JSON Schema object with $defs for referenced models

#### Inherited from

[`Model`](Model.md).[`getSchemaRef`](Model.md#getschemaref)

***

### infer

> `readonly` **infer**: `Record`\<`string`, `M`\[`"infer"`\]\>

Defined in: [src/model/record.ts:20](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/record.ts#L20)

Inferred TypeScript type for the record model (object with string keys and values matching the item model)

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isRequired()

> `readonly` **isRequired**: () => `RecordModel`\<`M`, `true`\>

Defined in: [src/model/record.ts:25](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/record.ts#L25)

Marks the record model as required

#### Returns

`RecordModel`\<`M`, `true`\>

A new RecordModel instance marked as required

#### Overrides

[`Model`](Model.md).[`isRequired`](Model.md#isrequired)

***

### onParse()

> `readonly` **onParse**: (`data`) => `M`

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L177)

Function to parse and validate data according to the model, returning typed result

#### Parameters

##### data

`unknown`

The data to parse

#### Returns

`M`

The parsed and validated data of type T

#### Inherited from

[`Model`](Model.md).[`onParse`](Model.md#onparse)

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

[`Model`](Model.md).[`onStringify`](Model.md#onstringify)

***

### title()

> `readonly` **title**: (`name`) => `RecordModel`\<`M`, `R`\>

Defined in: [src/model/record.ts:39](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/record.ts#L39)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`RecordModel`\<`M`, `R`\>

A new RecordModel instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)

***

### validate()

> `readonly` **validate**: (`onValidate`) => `RecordModel`\<`M`, `R`\>

Defined in: [src/model/record.ts:31](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/record.ts#L31)

Adds custom validation logic to the model

#### Parameters

##### onValidate

(`data`) => `void`

Validation function that receives the parsed record data

#### Returns

`RecordModel`\<`M`, `R`\>

A new RecordModel instance with the validation function
