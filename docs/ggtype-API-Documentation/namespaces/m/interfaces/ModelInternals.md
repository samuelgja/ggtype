[**ggtype API Documentation v0.4.8**](../../../../README.md)

***

# Interface: ModelInternals\<R\>

Defined in: [src/model/model.ts:100](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L100)

## Extends

- [`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md)

## Type Parameters

### R

`R` *extends* `boolean`

## Properties

### default?

> `optional` **default**: `JSONSchema7Type`

Defined in: [src/model/model.ts:70](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L70)

Default value for the model

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`default`](ModelInternalsNotGeneric.md#default)

***

### description

> **description**: `string`

Defined in: [src/model/model.ts:90](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L90)

Human-readable description for the model

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`description`](ModelInternalsNotGeneric.md#description)

***

### enums

> **enums**: `string`[]

Defined in: [src/model/model.ts:82](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L82)

Enum values for string validation

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`enums`](ModelInternalsNotGeneric.md#enums)

***

### exclusiveMaximum?

> `optional` **exclusiveMaximum**: `number`

Defined in: [src/model/model.ts:78](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L78)

Exclusive maximum value constraint for numbers

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`exclusiveMaximum`](ModelInternalsNotGeneric.md#exclusivemaximum)

***

### exclusiveMinimum?

> `optional` **exclusiveMinimum**: `number`

Defined in: [src/model/model.ts:74](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L74)

Exclusive minimum value constraint for numbers

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`exclusiveMinimum`](ModelInternalsNotGeneric.md#exclusiveminimum)

***

### format?

> `optional` **format**: `string`

Defined in: [src/model/model.ts:26](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L26)

Format string for validation (e.g., 'email', 'date-time')

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`format`](ModelInternalsNotGeneric.md#format)

***

### id

> **id**: `string`

Defined in: [src/model/model.ts:94](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L94)

Unique identifier for the model

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`id`](ModelInternalsNotGeneric.md#id)

***

### isArray

> **isArray**: `boolean`

Defined in: [src/model/model.ts:18](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L18)

Whether the model represents an array type

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`isArray`](ModelInternalsNotGeneric.md#isarray)

***

### isModel

> **isModel**: `true`

Defined in: [src/model/model.ts:22](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L22)

Type marker indicating this is a model (always true)

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`isModel`](ModelInternalsNotGeneric.md#ismodel)

***

### isRequired

> **isRequired**: `R`

Defined in: [src/model/model.ts:106](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L106)

Whether the model field is required (type-safe boolean)

#### Overrides

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`isRequired`](ModelInternalsNotGeneric.md#isrequired)

***

### maximum?

> `optional` **maximum**: `number`

Defined in: [src/model/model.ts:66](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L66)

Maximum value constraint for numbers

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`maximum`](ModelInternalsNotGeneric.md#maximum)

***

### maxItems?

> `optional` **maxItems**: `number`

Defined in: [src/model/model.ts:50](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L50)

Maximum number of items for arrays

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`maxItems`](ModelInternalsNotGeneric.md#maxitems)

***

### maxLength?

> `optional` **maxLength**: `number`

Defined in: [src/model/model.ts:30](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L30)

Maximum length constraint for strings

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`maxLength`](ModelInternalsNotGeneric.md#maxlength)

***

### maxProperties?

> `optional` **maxProperties**: `number`

Defined in: [src/model/model.ts:42](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L42)

Maximum number of properties for objects

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`maxProperties`](ModelInternalsNotGeneric.md#maxproperties)

***

### minimum?

> `optional` **minimum**: `number`

Defined in: [src/model/model.ts:62](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L62)

Minimum value constraint for numbers

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`minimum`](ModelInternalsNotGeneric.md#minimum)

***

### minItems?

> `optional` **minItems**: `number`

Defined in: [src/model/model.ts:58](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L58)

Minimum number of items for arrays

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`minItems`](ModelInternalsNotGeneric.md#minitems)

***

### minLength?

> `optional` **minLength**: `number`

Defined in: [src/model/model.ts:34](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L34)

Minimum length constraint for strings

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`minLength`](ModelInternalsNotGeneric.md#minlength)

***

### minProperties?

> `optional` **minProperties**: `number`

Defined in: [src/model/model.ts:46](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L46)

Minimum number of properties for objects

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`minProperties`](ModelInternalsNotGeneric.md#minproperties)

***

### onValidate?

> `optional` **onValidate**: [`OnValidate`](../type-aliases/OnValidate.md)\<`never`\>

Defined in: [src/model/model.ts:98](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L98)

Optional custom validation function

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`onValidate`](ModelInternalsNotGeneric.md#onvalidate)

***

### pattern?

> `optional` **pattern**: `string`

Defined in: [src/model/model.ts:38](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L38)

Regular expression pattern for string validation

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`pattern`](ModelInternalsNotGeneric.md#pattern)

***

### properties?

> `optional` **properties**: `Record`\<`string`, [`ModelNotGeneric`](ModelNotGeneric.md) \| `undefined`\>

Defined in: [src/model/model.ts:54](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L54)

Properties definition for object models

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`properties`](ModelInternalsNotGeneric.md#properties)

***

### title

> **title**: `string`

Defined in: [src/model/model.ts:86](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/model/model.ts#L86)

Human-readable title for the model

#### Inherited from

[`ModelInternalsNotGeneric`](ModelInternalsNotGeneric.md).[`title`](ModelInternalsNotGeneric.md#title)
