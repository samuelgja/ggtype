[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Interface: Blob\<R\>

Defined in: [src/model/blob.ts:12](https://github.com/samuelgja/ggtype/blob/main/src/model/blob.ts#L12)

## Extends

- [`Model`](Model.md)\<`globalThis.Blob`, `R`\>

## Type Parameters

### R

`R` *extends* `boolean` = `true`

## Properties

### $internals

> **$internals**: [`ModelInternals`](ModelInternals.md)\<`R`\>

Defined in: [src/model/model.ts:181](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L181)

Internal model configuration and metadata with type-safe required flag

#### Inherited from

[`Model`](Model.md).[`$internals`](Model.md#internals)

***

### description()

> `readonly` **description**: (`description`) => `Blob`\<`R`\>

Defined in: [src/model/blob.ts:35](https://github.com/samuelgja/ggtype/blob/main/src/model/blob.ts#L35)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`Blob`\<`R`\>

A new Blob instance with the updated description

#### Overrides

[`Model`](Model.md).[`description`](Model.md#description)

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

[`Model`](Model.md).[`getSchema`](Model.md#getschema)

***

### getSchemaRef()

> **getSchemaRef**: () => `JSONSchema7`

Defined in: [src/model/model.ts:151](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L151)

Gets the JSON Schema with references (compact form)

#### Returns

`JSONSchema7`

The JSON Schema object with $defs for referenced models

#### Inherited from

[`Model`](Model.md).[`getSchemaRef`](Model.md#getschemaref)

***

### infer

> `readonly` **infer**: `Blob`

Defined in: [src/model/blob.ts:23](https://github.com/samuelgja/ggtype/blob/main/src/model/blob.ts#L23)

Inferred TypeScript type for the blob model (always Blob)

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isOptional()

> `readonly` **isOptional**: () => `Blob`\<`false`\>

Defined in: [src/model/blob.ts:19](https://github.com/samuelgja/ggtype/blob/main/src/model/blob.ts#L19)

Marks the blob model as optional

#### Returns

`Blob`\<`false`\>

A new Blob instance marked as optional

#### Overrides

[`Model`](Model.md).[`isOptional`](Model.md#isoptional)

***

### onParse()

> `readonly` **onParse**: (`data`) => `Blob`

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L177)

Function to parse and validate data according to the model, returning typed result

#### Parameters

##### data

`unknown`

The data to parse

#### Returns

`Blob`

The parsed and validated data of type T

#### Inherited from

[`Model`](Model.md).[`onParse`](Model.md#onparse)

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

#### Inherited from

[`Model`](Model.md).[`onStringify`](Model.md#onstringify)

***

### title()

> `readonly` **title**: (`name`) => `Blob`\<`R`\>

Defined in: [src/model/blob.ts:29](https://github.com/samuelgja/ggtype/blob/main/src/model/blob.ts#L29)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`Blob`\<`R`\>

A new Blob instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)
