[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Interface: EnumModel\<T, R\>

Defined in: [src/model/enums.ts:11](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/enums.ts#L11)

## Extends

- [`Model`](Model.md)\<`T`, `R`\>

## Type Parameters

### T

`T` *extends* `string`

### R

`R` *extends* `boolean` = `false`

## Properties

### $internals

> **$internals**: [`ModelInternals`](ModelInternals.md)\<`R`\>

Defined in: [src/model/model.ts:181](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L181)

Internal model configuration and metadata with type-safe required flag

#### Inherited from

[`Model`](Model.md).[`$internals`](Model.md#internals)

***

### default()

> `readonly` **default**: (`value`) => `EnumModel`\<`T`, `R`\>

Defined in: [src/model/enums.ts:51](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/enums.ts#L51)

Sets a default value for the enum

#### Parameters

##### value

`T`

Default enum value

#### Returns

`EnumModel`\<`T`, `R`\>

A new EnumModel instance with the default value

***

### description()

> `readonly` **description**: (`description`) => `EnumModel`\<`T`, `R`\>

Defined in: [src/model/enums.ts:67](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/enums.ts#L67)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`EnumModel`\<`T`, `R`\>

A new EnumModel instance with the updated description

#### Overrides

[`Model`](Model.md).[`description`](Model.md#description)

***

### getSchema()

> **getSchema**: (`options?`) => `JSONSchema7`

Defined in: [src/model/model.ts:146](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L146)

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

Defined in: [src/model/model.ts:151](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L151)

Gets the JSON Schema with references (compact form)

#### Returns

`JSONSchema7`

The JSON Schema object with $defs for referenced models

#### Inherited from

[`Model`](Model.md).[`getSchemaRef`](Model.md#getschemaref)

***

### infer

> `readonly` **infer**: `T`

Defined in: [src/model/enums.ts:55](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/enums.ts#L55)

Inferred TypeScript type for the enum model (string literal union)

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isRequired()

> `readonly` **isRequired**: () => `EnumModel`\<`T`, `true`\>

Defined in: [src/model/enums.ts:45](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/enums.ts#L45)

Marks the enum model as required

#### Returns

`EnumModel`\<`T`, `true`\>

A new EnumModel instance marked as required

#### Overrides

[`Model`](Model.md).[`isRequired`](Model.md#isrequired)

***

### maxLength()

> `readonly` **maxLength**: (`length`) => `EnumModel`\<`T`, `R`\>

Defined in: [src/model/enums.ts:20](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/enums.ts#L20)

Sets the maximum length constraint for the enum string

#### Parameters

##### length

`number`

Maximum number of characters

#### Returns

`EnumModel`\<`T`, `R`\>

A new EnumModel instance with the constraint

***

### minLength()

> `readonly` **minLength**: (`length`) => `EnumModel`\<`T`, `R`\>

Defined in: [src/model/enums.ts:26](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/enums.ts#L26)

Sets the minimum length constraint for the enum string

#### Parameters

##### length

`number`

Minimum number of characters

#### Returns

`EnumModel`\<`T`, `R`\>

A new EnumModel instance with the constraint

***

### only()

> `readonly` **only**: \<`N`\>(...`values`) => `EnumModel`\<`N`\[`number`\], `R`\>

Defined in: [src/model/enums.ts:38](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/enums.ts#L38)

Restricts the enum to only the specified values

#### Type Parameters

##### N

`N` *extends* `T`[]

#### Parameters

##### values

...`N`

Allowed enum values

#### Returns

`EnumModel`\<`N`\[`number`\], `R`\>

A new EnumModel instance with restricted values

***

### onParse()

> `readonly` **onParse**: (`data`) => `T`

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L177)

Function to parse and validate data according to the model, returning typed result

#### Parameters

##### data

`unknown`

The data to parse

#### Returns

`T`

The parsed and validated data of type T

#### Inherited from

[`Model`](Model.md).[`onParse`](Model.md#onparse)

***

### onStringify()?

> `optional` **onStringify**: (`data`) => `unknown`

Defined in: [src/model/model.ts:157](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L157)

Optional function to transform data when stringifying (for serialization)

#### Parameters

##### data

`never`

#### Returns

`unknown`

#### Inherited from

[`Model`](Model.md).[`onStringify`](Model.md#onstringify)

***

### pattern()

> `readonly` **pattern**: (`pattern`) => `EnumModel`\<`T`, `R`\>

Defined in: [src/model/enums.ts:32](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/enums.ts#L32)

Sets a regular expression pattern for enum validation

#### Parameters

##### pattern

`RegExp`

Regular expression pattern

#### Returns

`EnumModel`\<`T`, `R`\>

A new EnumModel instance with the pattern constraint

***

### title()

> `readonly` **title**: (`name`) => `EnumModel`\<`T`, `R`\>

Defined in: [src/model/enums.ts:61](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/enums.ts#L61)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`EnumModel`\<`T`, `R`\>

A new EnumModel instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)
