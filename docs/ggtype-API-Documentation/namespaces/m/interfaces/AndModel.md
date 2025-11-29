[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Interface: AndModel\<M, R\>

Defined in: [src/model/and.ts:12](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/and.ts#L12)

## Extends

- [`Model`](Model.md)\<`Intersect`\<`M`\[`number`\]\>, `R`\>

## Type Parameters

### M

`M` *extends* [`ModelNotGeneric`](ModelNotGeneric.md)[]

### R

`R` *extends* `boolean` = `true`

## Properties

### $internals

> **$internals**: [`ModelInternals`](ModelInternals.md)\<`R`\>

Defined in: [src/model/model.ts:181](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L181)

Internal model configuration and metadata with type-safe required flag

#### Inherited from

[`Model`](Model.md).[`$internals`](Model.md#internals)

***

### description()

> `readonly` **description**: (`description`) => `AndModel`\<`M`, `R`\>

Defined in: [src/model/and.ts:44](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/and.ts#L44)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`AndModel`\<`M`, `R`\>

A new AndModel instance with the updated description

#### Overrides

[`Model`](Model.md).[`description`](Model.md#description)

***

### getSchema()

> **getSchema**: (`options?`) => `JSONSchema7`

Defined in: [src/model/model.ts:146](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L146)

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

Defined in: [src/model/model.ts:151](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L151)

Gets the JSON Schema with references (compact form)

#### Returns

`JSONSchema7`

The JSON Schema object with $defs for referenced models

#### Inherited from

[`Model`](Model.md).[`getSchemaRef`](Model.md#getschemaref)

***

### infer

> `readonly` **infer**: `Intersect`\<`M`\[`number`\]\[`"infer"`\]\>

Defined in: [src/model/and.ts:19](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/and.ts#L19)

Inferred TypeScript type for the intersection model (intersection of all model inferred types)

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isOptional()

> `readonly` **isOptional**: () => `AndModel`\<`M`, `false`\>

Defined in: [src/model/and.ts:24](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/and.ts#L24)

Marks the intersection model as optional

#### Returns

`AndModel`\<`M`, `false`\>

A new AndModel instance marked as optional

#### Overrides

[`Model`](Model.md).[`isOptional`](Model.md#isoptional)

***

### onParse()

> `readonly` **onParse**: (`data`) => `Intersect`

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L177)

Function to parse and validate data according to the model, returning typed result

#### Parameters

##### data

`unknown`

The data to parse

#### Returns

`Intersect`

The parsed and validated data of type T

#### Inherited from

[`Model`](Model.md).[`onParse`](Model.md#onparse)

***

### onStringify()?

> `optional` **onStringify**: (`data`) => `unknown`

Defined in: [src/model/model.ts:157](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L157)

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

> `readonly` **title**: (`name`) => `AndModel`\<`M`, `R`\>

Defined in: [src/model/and.ts:38](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/and.ts#L38)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`AndModel`\<`M`, `R`\>

A new AndModel instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)

***

### validate()

> `readonly` **validate**: (`onValidate`) => `AndModel`\<`M`, `R`\>

Defined in: [src/model/and.ts:30](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/and.ts#L30)

Adds custom validation logic to the model

#### Parameters

##### onValidate

(`data`) => `void`

Validation function that receives the parsed data

#### Returns

`AndModel`\<`M`, `R`\>

A new AndModel instance with the validation function
