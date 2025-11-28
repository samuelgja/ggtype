[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Interface: ObjectModel\<T, R\>

Defined in: [src/model/object.ts:47](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/object.ts#L47)

## Extends

- [`Model`](Model.md)\<`T`, `R`\>

## Type Parameters

### T

`T` *extends* `Properties`

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

### description()

> `readonly` **description**: (`description`) => `ObjectModel`\<`T`, `R`\>

Defined in: [src/model/object.ts:108](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/object.ts#L108)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`ObjectModel`\<`T`, `R`\>

A new ObjectModel instance with the updated description

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

> `readonly` **infer**: \{ \[K in string \| number \| symbol\]: ExtractProperties\<T\>\[K\] \} & \{ \[K in string \| number \| symbol\]?: ExtractProperties\<T\>\[K\] \}

Defined in: [src/model/object.ts:55](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/object.ts#L55)

Inferred TypeScript type for the object model
Required properties are non-optional, optional properties are marked with ?

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isRequired()

> `readonly` **isRequired**: () => `ObjectModel`\<`T`, `true`\>

Defined in: [src/model/object.ts:76](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/object.ts#L76)

Marks the object model as required

#### Returns

`ObjectModel`\<`T`, `true`\>

A new ObjectModel instance marked as required

#### Overrides

[`Model`](Model.md).[`isRequired`](Model.md#isrequired)

***

### maxKeys()

> `readonly` **maxKeys**: (`maxKeys`) => `ObjectModel`\<`T`, `R`\>

Defined in: [src/model/object.ts:65](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/object.ts#L65)

Sets the maximum number of keys allowed in the object

#### Parameters

##### maxKeys

`number`

Maximum number of keys

#### Returns

`ObjectModel`\<`T`, `R`\>

A new ObjectModel instance with the constraint

***

### minKeys()

> `readonly` **minKeys**: (`minKeys`) => `ObjectModel`\<`T`, `R`\>

Defined in: [src/model/object.ts:71](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/object.ts#L71)

Sets the minimum number of keys required in the object

#### Parameters

##### minKeys

`number`

Minimum number of keys

#### Returns

`ObjectModel`\<`T`, `R`\>

A new ObjectModel instance with the constraint

***

### onParse()

> `readonly` **onParse**: (`data`) => `T`

Defined in: [src/model/object.ts:82](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/object.ts#L82)

Parses and validates an object according to the model

#### Parameters

##### data

\{ \[K in string \| number \| symbol\]: ExtractProperties\<T\>\[K\] \} & \{ \[K in string \| number \| symbol\]?: ExtractProperties\<T\>\[K\] \}

The object data to parse

#### Returns

`T`

The parsed and validated object of type T

#### Overrides

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

### title()

> `readonly` **title**: (`name`) => `ObjectModel`\<`T`, `R`\>

Defined in: [src/model/object.ts:102](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/object.ts#L102)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`ObjectModel`\<`T`, `R`\>

A new ObjectModel instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)

***

### validate()

> `readonly` **validate**: (`onValidate`) => `ObjectModel`\<`T`, `R`\>

Defined in: [src/model/object.ts:94](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/object.ts#L94)

Adds custom validation logic to the model

#### Parameters

##### onValidate

[`OnValidate`](../type-aliases/OnValidate.md)\<`T`\>

Validation function that receives the parsed data

#### Returns

`ObjectModel`\<`T`, `R`\>

A new ObjectModel instance with the validation function
