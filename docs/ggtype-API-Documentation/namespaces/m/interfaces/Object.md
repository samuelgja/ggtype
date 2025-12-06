[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Interface: Object\<T, R\>

Defined in: [src/model/object.ts:24](https://github.com/samuelgja/ggtype/blob/main/src/model/object.ts#L24)

## Extends

- [`Model`](Model.md)\<`T`, `R`\>

## Type Parameters

### T

`T` *extends* `Properties`

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

> `readonly` **description**: (`description`) => `Object`\<`T`, `R`\>

Defined in: [src/model/object.ts:109](https://github.com/samuelgja/ggtype/blob/main/src/model/object.ts#L109)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`Object`\<`T`, `R`\>

A new Object instance with the updated description

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

> `readonly` **infer**: \{ \[K in string \| number \| symbol as T\[K\] extends ModelNotGeneric ? any\[any\]\["$internals"\]\["isRequired"\] extends true ? K : never : never\]: T\[K\] extends ModelNotGeneric ? any\[any\]\["infer"\] : never \} & \{ \[K in string \| number \| symbol as T\[K\] extends ModelNotGeneric ? any\[any\]\["$internals"\]\["isRequired"\] extends false ? K : never : never\]?: T\[K\] extends ModelNotGeneric ? any\[any\]\["infer"\] : never \}

Defined in: [src/model/object.ts:32](https://github.com/samuelgja/ggtype/blob/main/src/model/object.ts#L32)

Inferred TypeScript type for the object model
Required properties are non-optional, optional properties are marked with ?

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isOptional()

> `readonly` **isOptional**: () => `Object`\<`T`, `false`\>

Defined in: [src/model/object.ts:65](https://github.com/samuelgja/ggtype/blob/main/src/model/object.ts#L65)

Marks the object model as optional

#### Returns

`Object`\<`T`, `false`\>

A new Object instance marked as optional

#### Overrides

[`Model`](Model.md).[`isOptional`](Model.md#isoptional)

***

### maxKeys()

> `readonly` **maxKeys**: (`maxKeys`) => `Object`\<`T`, `R`\>

Defined in: [src/model/object.ts:54](https://github.com/samuelgja/ggtype/blob/main/src/model/object.ts#L54)

Sets the maximum number of keys allowed in the object

#### Parameters

##### maxKeys

`number`

Maximum number of keys

#### Returns

`Object`\<`T`, `R`\>

A new Object instance with the constraint

***

### minKeys()

> `readonly` **minKeys**: (`minKeys`) => `Object`\<`T`, `R`\>

Defined in: [src/model/object.ts:60](https://github.com/samuelgja/ggtype/blob/main/src/model/object.ts#L60)

Sets the minimum number of keys required in the object

#### Parameters

##### minKeys

`number`

Minimum number of keys

#### Returns

`Object`\<`T`, `R`\>

A new Object instance with the constraint

***

### onParse()

> `readonly` **onParse**: (`data`) => `T`

Defined in: [src/model/object.ts:71](https://github.com/samuelgja/ggtype/blob/main/src/model/object.ts#L71)

Parses and validates an object according to the model

#### Parameters

##### data

\{ \[K in string \| number \| symbol as T\[K\] extends ModelNotGeneric ? any\[any\]\["$internals"\]\["isRequired"\] extends true ? K : never : never\]: T\[K\] extends ModelNotGeneric ? any\[any\]\["infer"\] : never \} & \{ \[K in string \| number \| symbol as T\[K\] extends ModelNotGeneric ? any\[any\]\["$internals"\]\["isRequired"\] extends false ? K : never : never\]?: T\[K\] extends ModelNotGeneric ? any\[any\]\["infer"\] : never \}

The object data to parse

#### Returns

`T`

The parsed and validated object of type T

#### Overrides

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

> `readonly` **title**: (`name`) => `Object`\<`T`, `R`\>

Defined in: [src/model/object.ts:103](https://github.com/samuelgja/ggtype/blob/main/src/model/object.ts#L103)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`Object`\<`T`, `R`\>

A new Object instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)

***

### validate()

> `readonly` **validate**: (`onValidate`) => `Object`\<`T`, `R`\>

Defined in: [src/model/object.ts:95](https://github.com/samuelgja/ggtype/blob/main/src/model/object.ts#L95)

Adds custom validation logic to the model

#### Parameters

##### onValidate

[`OnValidate`](../type-aliases/OnValidate.md)\<`T`\>

Validation function that receives the parsed data

#### Returns

`Object`\<`T`, `R`\>

A new Object instance with the validation function
