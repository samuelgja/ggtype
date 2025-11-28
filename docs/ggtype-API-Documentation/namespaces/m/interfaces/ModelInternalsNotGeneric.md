[**ggtype API Documentation v0.4.7**](../../../../README.md)

***

# Interface: ModelInternalsNotGeneric

Defined in: [src/model/model.ts:10](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L10)

## Extended by

- [`ModelInternals`](ModelInternals.md)

## Properties

### default?

> `optional` **default**: `JSONSchema7Type`

Defined in: [src/model/model.ts:70](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L70)

Default value for the model

***

### description

> **description**: `string`

Defined in: [src/model/model.ts:90](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L90)

Human-readable description for the model

***

### enums

> **enums**: `string`[]

Defined in: [src/model/model.ts:82](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L82)

Enum values for string validation

***

### exclusiveMaximum?

> `optional` **exclusiveMaximum**: `number`

Defined in: [src/model/model.ts:78](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L78)

Exclusive maximum value constraint for numbers

***

### exclusiveMinimum?

> `optional` **exclusiveMinimum**: `number`

Defined in: [src/model/model.ts:74](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L74)

Exclusive minimum value constraint for numbers

***

### format?

> `optional` **format**: `string`

Defined in: [src/model/model.ts:26](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L26)

Format string for validation (e.g., 'email', 'date-time')

***

### id

> **id**: `string`

Defined in: [src/model/model.ts:94](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L94)

Unique identifier for the model

***

### isArray

> **isArray**: `boolean`

Defined in: [src/model/model.ts:18](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L18)

Whether the model represents an array type

***

### isModel

> **isModel**: `true`

Defined in: [src/model/model.ts:22](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L22)

Type marker indicating this is a model (always true)

***

### isRequired

> **isRequired**: `boolean`

Defined in: [src/model/model.ts:14](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L14)

Whether the model field is required

***

### maximum?

> `optional` **maximum**: `number`

Defined in: [src/model/model.ts:66](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L66)

Maximum value constraint for numbers

***

### maxItems?

> `optional` **maxItems**: `number`

Defined in: [src/model/model.ts:50](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L50)

Maximum number of items for arrays

***

### maxLength?

> `optional` **maxLength**: `number`

Defined in: [src/model/model.ts:30](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L30)

Maximum length constraint for strings

***

### maxProperties?

> `optional` **maxProperties**: `number`

Defined in: [src/model/model.ts:42](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L42)

Maximum number of properties for objects

***

### minimum?

> `optional` **minimum**: `number`

Defined in: [src/model/model.ts:62](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L62)

Minimum value constraint for numbers

***

### minItems?

> `optional` **minItems**: `number`

Defined in: [src/model/model.ts:58](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L58)

Minimum number of items for arrays

***

### minLength?

> `optional` **minLength**: `number`

Defined in: [src/model/model.ts:34](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L34)

Minimum length constraint for strings

***

### minProperties?

> `optional` **minProperties**: `number`

Defined in: [src/model/model.ts:46](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L46)

Minimum number of properties for objects

***

### onValidate?

> `optional` **onValidate**: [`OnValidate`](../type-aliases/OnValidate.md)\<`never`\>

Defined in: [src/model/model.ts:98](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L98)

Optional custom validation function

***

### pattern?

> `optional` **pattern**: `string`

Defined in: [src/model/model.ts:38](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L38)

Regular expression pattern for string validation

***

### properties?

> `optional` **properties**: `Record`\<`string`, [`ModelNotGeneric`](ModelNotGeneric.md) \| `undefined`\>

Defined in: [src/model/model.ts:54](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L54)

Properties definition for object models

***

### title

> **title**: `string`

Defined in: [src/model/model.ts:86](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/model/model.ts#L86)

Human-readable title for the model
