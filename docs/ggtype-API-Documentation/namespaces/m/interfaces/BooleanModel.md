[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Interface: BooleanModel\<R\>

Defined in: [src/model/boolean.ts:11](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/boolean.ts#L11)

## Extends

- [`Model`](Model.md)\<`boolean`, `R`\>

## Type Parameters

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

> `readonly` **description**: (`description`) => `BooleanModel`\<`R`\>

Defined in: [src/model/boolean.ts:34](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/boolean.ts#L34)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`BooleanModel`\<`R`\>

A new BooleanModel instance with the updated description

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

> `readonly` **infer**: `boolean`

Defined in: [src/model/boolean.ts:22](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/boolean.ts#L22)

Inferred TypeScript type for the boolean model (always boolean)

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isRequired()

> `readonly` **isRequired**: () => `BooleanModel`\<`true`\>

Defined in: [src/model/boolean.ts:18](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/boolean.ts#L18)

Marks the boolean model as required

#### Returns

`BooleanModel`\<`true`\>

A new BooleanModel instance marked as required

#### Overrides

[`Model`](Model.md).[`isRequired`](Model.md#isrequired)

***

### onParse()

> `readonly` **onParse**: (`data`) => `boolean`

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L177)

Function to parse and validate data according to the model, returning typed result

#### Parameters

##### data

`unknown`

The data to parse

#### Returns

`boolean`

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

> `readonly` **title**: (`name`) => `BooleanModel`\<`R`\>

Defined in: [src/model/boolean.ts:28](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/boolean.ts#L28)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`BooleanModel`\<`R`\>

A new BooleanModel instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)
