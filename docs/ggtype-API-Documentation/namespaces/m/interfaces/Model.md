[**ggtype API Documentation v0.5.1**](../../../../README.md)

***

# Interface: Model\<T, R\>

Defined in: [src/model/model.ts:168](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L168)

## Extends

- [`ModelNotGeneric`](ModelNotGeneric.md)

## Extended by

- [`Array`](Array.md)
- [`Boolean`](Boolean.md)
- [`Enum`](Enum.md)
- [`Number`](Number.md)
- [`Object`](Object.md)
- [`String`](String.md)
- [`Null`](Null.md)
- [`Date`](Date.md)
- [`Or`](Or.md)
- [`And`](And.md)
- [`Record`](Record.md)
- [`File`](File.md)
- [`Blob`](Blob.md)

## Type Parameters

### T

`T`

### R

`R` *extends* `boolean` = `true`

## Properties

### $internals

> **$internals**: [`ModelInternals`](ModelInternals.md)\<`R`\>

Defined in: [src/model/model.ts:181](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L181)

Internal model configuration and metadata with type-safe required flag

#### Overrides

[`ModelNotGeneric`](ModelNotGeneric.md).[`$internals`](ModelNotGeneric.md#internals)

***

### description()

> **description**: (`description`) => [`ModelNotGeneric`](ModelNotGeneric.md)

Defined in: [src/model/model.ts:140](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L140)

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

Defined in: [src/model/model.ts:146](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L146)

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

Defined in: [src/model/model.ts:151](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L151)

Gets the JSON Schema with references (compact form)

#### Returns

`JSONSchema7`

The JSON Schema object with $defs for referenced models

#### Inherited from

[`ModelNotGeneric`](ModelNotGeneric.md).[`getSchemaRef`](ModelNotGeneric.md#getschemaref)

***

### infer

> **infer**: `unknown`

Defined in: [src/model/model.ts:124](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L124)

Inferred TypeScript type for the model

#### Inherited from

[`ModelNotGeneric`](ModelNotGeneric.md).[`infer`](ModelNotGeneric.md#infer)

***

### isOptional()

> **isOptional**: () => [`ModelNotGeneric`](ModelNotGeneric.md)

Defined in: [src/model/model.ts:166](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L166)

Marks the model as optional

#### Returns

[`ModelNotGeneric`](ModelNotGeneric.md)

A new model instance marked as optional

#### Inherited from

[`ModelNotGeneric`](ModelNotGeneric.md).[`isOptional`](ModelNotGeneric.md#isoptional)

***

### onParse()

> `readonly` **onParse**: (`data`) => `T`

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L177)

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

Defined in: [src/model/model.ts:157](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L157)

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

Defined in: [src/model/model.ts:134](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/model/model.ts#L134)

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
