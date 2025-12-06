[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Interface: Null\<R\>

Defined in: [src/model/null.ts:11](https://github.com/samuelgja/ggtype/blob/main/src/model/null.ts#L11)

## Extends

- [`Model`](Model.md)\<`null`, `R`\>

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

> `readonly` **description**: (`description`) => `Null`\<`R`\>

Defined in: [src/model/null.ts:34](https://github.com/samuelgja/ggtype/blob/main/src/model/null.ts#L34)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`Null`\<`R`\>

A new Null instance with the updated description

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

> `readonly` **infer**: `null`

Defined in: [src/model/null.ts:22](https://github.com/samuelgja/ggtype/blob/main/src/model/null.ts#L22)

Inferred TypeScript type for the null model (always null)

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isOptional()

> `readonly` **isOptional**: () => `Null`\<`false`\>

Defined in: [src/model/null.ts:18](https://github.com/samuelgja/ggtype/blob/main/src/model/null.ts#L18)

Marks the null model as optional

#### Returns

`Null`\<`false`\>

A new Null instance marked as optional

#### Overrides

[`Model`](Model.md).[`isOptional`](Model.md#isoptional)

***

### onParse()

> `readonly` **onParse**: (`data`) => `null`

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L177)

Function to parse and validate data according to the model, returning typed result

#### Parameters

##### data

`unknown`

The data to parse

#### Returns

`null`

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

> `readonly` **title**: (`name`) => `Null`\<`R`\>

Defined in: [src/model/null.ts:28](https://github.com/samuelgja/ggtype/blob/main/src/model/null.ts#L28)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`Null`\<`R`\>

A new Null instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)
