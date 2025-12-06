[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Interface: String\<R\>

Defined in: [src/model/string.ts:12](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L12)

## Extends

- [`Model`](Model.md)\<`string`, `R`\>

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

> `readonly` **description**: (`description`) => `String`\<`R`\>

Defined in: [src/model/string.ts:71](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L71)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`String`\<`R`\>

A new String instance with the updated description

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

> `readonly` **infer**: `string`

Defined in: [src/model/string.ts:59](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L59)

Inferred TypeScript type for the string model (always string)

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isEmail()

> `readonly` **isEmail**: () => `String`\<`R`\>

Defined in: [src/model/string.ts:42](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L42)

Validates the string as an email address

#### Returns

`String`\<`R`\>

A new String instance with email format validation

***

### isOptional()

> `readonly` **isOptional**: () => `String`\<`false`\>

Defined in: [src/model/string.ts:37](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L37)

Marks the string model as optional

#### Returns

`String`\<`false`\>

A new String instance marked as optional

#### Overrides

[`Model`](Model.md).[`isOptional`](Model.md#isoptional)

***

### isPassword()

> `readonly` **isPassword**: () => `String`\<`R`\>

Defined in: [src/model/string.ts:47](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L47)

Validates the string as a password

#### Returns

`String`\<`R`\>

A new String instance with password format validation

***

### maxLength()

> `readonly` **maxLength**: (`length`) => `String`\<`R`\>

Defined in: [src/model/string.ts:20](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L20)

Sets the maximum length constraint for the string

#### Parameters

##### length

`number`

Maximum number of characters

#### Returns

`String`\<`R`\>

A new String instance with the constraint

***

### minLength()

> `readonly` **minLength**: (`length`) => `String`\<`R`\>

Defined in: [src/model/string.ts:26](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L26)

Sets the minimum length constraint for the string

#### Parameters

##### length

`number`

Minimum number of characters

#### Returns

`String`\<`R`\>

A new String instance with the constraint

***

### onParse()

> `readonly` **onParse**: (`data`) => `string`

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L177)

Function to parse and validate data according to the model, returning typed result

#### Parameters

##### data

`unknown`

The data to parse

#### Returns

`string`

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

### regex()

> `readonly` **regex**: (`pattern`) => `String`\<`R`\>

Defined in: [src/model/string.ts:32](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L32)

Sets a regular expression pattern for string validation

#### Parameters

##### pattern

`RegExp`

Regular expression pattern

#### Returns

`String`\<`R`\>

A new String instance with the pattern constraint

***

### title()

> `readonly` **title**: (`name`) => `String`\<`R`\>

Defined in: [src/model/string.ts:65](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L65)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`String`\<`R`\>

A new String instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)

***

### validate()

> `readonly` **validate**: (`onValidate`) => `String`\<`R`\>

Defined in: [src/model/string.ts:53](https://github.com/samuelgja/ggtype/blob/main/src/model/string.ts#L53)

Adds custom validation logic to the model

#### Parameters

##### onValidate

[`OnValidate`](../type-aliases/OnValidate.md)\<`string`\>

Validation function that receives the parsed string data

#### Returns

`String`\<`R`\>

A new String instance with the validation function
