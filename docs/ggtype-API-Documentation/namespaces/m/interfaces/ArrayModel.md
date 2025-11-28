[**ggtype API Documentation v0.4.5**](../../../../README.md)

***

# Interface: ArrayModel\<T, R\>

Defined in: [src/model/array.ts:13](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/array.ts#L13)

## Extends

- [`Model`](Model.md)\<`T`[], `R`\>

## Type Parameters

### T

`T` *extends* [`ModelNotGeneric`](ModelNotGeneric.md)

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

> `readonly` **description**: (`description`) => `ArrayModel`\<`T`, `R`\>

Defined in: [src/model/array.ts:57](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/array.ts#L57)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`ArrayModel`\<`T`, `R`\>

A new ArrayModel instance with the updated description

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

> `readonly` **infer**: `T`\[`"infer"`\][]

Defined in: [src/model/array.ts:32](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/array.ts#L32)

Inferred TypeScript type for the array model (array of the item model's inferred type)

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isRequired()

> `readonly` **isRequired**: () => `ArrayModel`\<`T`, `true`\>

Defined in: [src/model/array.ts:37](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/array.ts#L37)

Marks the array model as required

#### Returns

`ArrayModel`\<`T`, `true`\>

A new ArrayModel instance marked as required

#### Overrides

[`Model`](Model.md).[`isRequired`](Model.md#isrequired)

***

### maxItems()

> `readonly` **maxItems**: (`length`) => `ArrayModel`\<`T`, `R`\>

Defined in: [src/model/array.ts:22](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/array.ts#L22)

Sets the maximum number of items allowed in the array

#### Parameters

##### length

`number`

Maximum number of items

#### Returns

`ArrayModel`\<`T`, `R`\>

A new ArrayModel instance with the constraint

***

### minItems()

> `readonly` **minItems**: (`length`) => `ArrayModel`\<`T`, `R`\>

Defined in: [src/model/array.ts:28](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/array.ts#L28)

Sets the minimum number of items required in the array

#### Parameters

##### length

`number`

Minimum number of items

#### Returns

`ArrayModel`\<`T`, `R`\>

A new ArrayModel instance with the constraint

***

### onParse()

> `readonly` **onParse**: (`data`) => `T`[]

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/model.ts#L177)

Function to parse and validate data according to the model, returning typed result

#### Parameters

##### data

`unknown`

The data to parse

#### Returns

`T`[]

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

> `readonly` **title**: (`name`) => `ArrayModel`\<`T`, `R`\>

Defined in: [src/model/array.ts:51](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/array.ts#L51)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`ArrayModel`\<`T`, `R`\>

A new ArrayModel instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)

***

### validate()

> `readonly` **validate**: (`onValidate`) => `ArrayModel`\<`T`, `R`\>

Defined in: [src/model/array.ts:43](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/model/array.ts#L43)

Adds custom validation logic to the model

#### Parameters

##### onValidate

(`data`) => `void`

Validation function that receives the parsed array data

#### Returns

`ArrayModel`\<`T`, `R`\>

A new ArrayModel instance with the validation function
