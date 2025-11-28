[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Interface: NumberModel\<R\>

Defined in: [src/model/number.ts:11](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/number.ts#L11)

## Extends

- [`Model`](Model.md)\<`number`, `R`\>

## Type Parameters

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

> `readonly` **description**: (`description`) => `NumberModel`\<`R`\>

Defined in: [src/model/number.ts:64](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/number.ts#L64)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`NumberModel`\<`R`\>

A new NumberModel instance with the updated description

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

> `readonly` **infer**: `number`

Defined in: [src/model/number.ts:52](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/number.ts#L52)

Inferred TypeScript type for the number model (always number)

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isRequired()

> `readonly` **isRequired**: () => `NumberModel`\<`true`\>

Defined in: [src/model/number.ts:40](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/number.ts#L40)

Marks the number model as required

#### Returns

`NumberModel`\<`true`\>

A new NumberModel instance marked as required

#### Overrides

[`Model`](Model.md).[`isRequired`](Model.md#isrequired)

***

### maximum()

> `readonly` **maximum**: (`maximum`) => `NumberModel`\<`R`\>

Defined in: [src/model/number.ts:25](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/number.ts#L25)

Sets the maximum value constraint for the number

#### Parameters

##### maximum

`number`

Maximum allowed value

#### Returns

`NumberModel`\<`R`\>

A new NumberModel instance with the constraint

***

### minimum()

> `readonly` **minimum**: (`minimum`) => `NumberModel`\<`R`\>

Defined in: [src/model/number.ts:19](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/number.ts#L19)

Sets the minimum value constraint for the number

#### Parameters

##### minimum

`number`

Minimum allowed value

#### Returns

`NumberModel`\<`R`\>

A new NumberModel instance with the constraint

***

### negative()

> `readonly` **negative**: () => `NumberModel`\<`R`\>

Defined in: [src/model/number.ts:35](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/number.ts#L35)

Validates that the number is negative (less than 0)

#### Returns

`NumberModel`\<`R`\>

A new NumberModel instance with negative validation

***

### onParse()

> `readonly` **onParse**: (`data`) => `number`

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L177)

Function to parse and validate data according to the model, returning typed result

#### Parameters

##### data

`unknown`

The data to parse

#### Returns

`number`

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

### positive()

> `readonly` **positive**: () => `NumberModel`\<`R`\>

Defined in: [src/model/number.ts:30](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/number.ts#L30)

Validates that the number is positive (greater than 0)

#### Returns

`NumberModel`\<`R`\>

A new NumberModel instance with positive validation

***

### title()

> `readonly` **title**: (`name`) => `NumberModel`\<`R`\>

Defined in: [src/model/number.ts:58](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/number.ts#L58)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`NumberModel`\<`R`\>

A new NumberModel instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)

***

### validate()

> `readonly` **validate**: (`onValidate`) => `NumberModel`\<`R`\>

Defined in: [src/model/number.ts:46](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/number.ts#L46)

Adds custom validation logic to the model

#### Parameters

##### onValidate

(`data`) => `void`

Validation function that receives the parsed number data

#### Returns

`NumberModel`\<`R`\>

A new NumberModel instance with the validation function
