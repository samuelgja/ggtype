[**ggtype API Documentation v0.6.0**](../../../../README.md)

***

# Interface: Date\<R\>

Defined in: [src/model/date.ts:15](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L15)

## Extends

- [`Model`](Model.md)\<`globalThis.Date`, `R`\>

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

> `readonly` **description**: (`description`) => `Date`\<`R`\>

Defined in: [src/model/date.ts:91](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L91)

Sets a human-readable description for the model

#### Parameters

##### description

`string`

The description to set

#### Returns

`Date`\<`R`\>

A new Date instance with the updated description

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

> `readonly` **infer**: `Date`

Defined in: [src/model/date.ts:26](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L26)

Inferred TypeScript type for the date model (always Date)

#### Overrides

[`Model`](Model.md).[`infer`](Model.md#infer)

***

### isDate()

> `readonly` **isDate**: () => `Date`\<`R`\>

Defined in: [src/model/date.ts:42](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L42)

Validates the date as a date value (YYYY-MM-DD format)

#### Returns

`Date`\<`R`\>

A new Date instance with date format validation

***

### isDateTime()

> `readonly` **isDateTime**: () => `Date`\<`R`\>

Defined in: [src/model/date.ts:47](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L47)

Validates the date as a date-time value (ISO 8601 format)

#### Returns

`Date`\<`R`\>

A new Date instance with date-time format validation

***

### isOptional()

> `readonly` **isOptional**: () => `Date`\<`false`\>

Defined in: [src/model/date.ts:22](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L22)

Marks the date model as optional

#### Returns

`Date`\<`false`\>

A new Date instance marked as optional

#### Overrides

[`Model`](Model.md).[`isOptional`](Model.md#isoptional)

***

### isTime()

> `readonly` **isTime**: () => `Date`\<`R`\>

Defined in: [src/model/date.ts:37](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L37)

Validates the date as a time value (HH:mm:ss format)

#### Returns

`Date`\<`R`\>

A new Date instance with time format validation

***

### maximum()

> `readonly` **maximum**: (`value`) => `Date`\<`R`\>

Defined in: [src/model/date.ts:59](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L59)

Sets the maximum date constraint

#### Parameters

##### value

`Date`

Maximum allowed date

#### Returns

`Date`\<`R`\>

A new Date instance with the constraint

***

### maximumTimestamp()

> `readonly` **maximumTimestamp**: (`value`) => `Date`\<`R`\>

Defined in: [src/model/date.ts:71](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L71)

Sets the maximum date constraint using a Unix timestamp

#### Parameters

##### value

`number`

Maximum allowed timestamp in milliseconds

#### Returns

`Date`\<`R`\>

A new Date instance with the constraint

***

### minimum()

> `readonly` **minimum**: (`value`) => `Date`\<`R`\>

Defined in: [src/model/date.ts:53](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L53)

Sets the minimum date constraint

#### Parameters

##### value

`Date`

Minimum allowed date

#### Returns

`Date`\<`R`\>

A new Date instance with the constraint

***

### minimumTimestamp()

> `readonly` **minimumTimestamp**: (`value`) => `Date`\<`R`\>

Defined in: [src/model/date.ts:65](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L65)

Sets the minimum date constraint using a Unix timestamp

#### Parameters

##### value

`number`

Minimum allowed timestamp in milliseconds

#### Returns

`Date`\<`R`\>

A new Date instance with the constraint

***

### onParse()

> `readonly` **onParse**: (`data`) => `Date`

Defined in: [src/model/model.ts:177](https://github.com/samuelgja/ggtype/blob/main/src/model/model.ts#L177)

Function to parse and validate data according to the model, returning typed result

#### Parameters

##### data

`unknown`

The data to parse

#### Returns

`Date`

The parsed and validated data of type T

#### Inherited from

[`Model`](Model.md).[`onParse`](Model.md#onparse)

***

### onStringify()

> `readonly` **onStringify**: (`data`) => `string`

Defined in: [src/model/date.ts:32](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L32)

Converts a Date to a string representation based on the format (time, date, or date-time)

#### Parameters

##### data

`Date`

The Date to stringify

#### Returns

`string`

String representation of the date

#### Overrides

[`Model`](Model.md).[`onStringify`](Model.md#onstringify)

***

### title()

> `readonly` **title**: (`name`) => `Date`\<`R`\>

Defined in: [src/model/date.ts:85](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L85)

Sets a human-readable title for the model

#### Parameters

##### name

`string`

The title to set

#### Returns

`Date`\<`R`\>

A new Date instance with the updated title

#### Overrides

[`Model`](Model.md).[`title`](Model.md#title)

***

### validate()

> `readonly` **validate**: (`onValidate`) => `Date`\<`R`\>

Defined in: [src/model/date.ts:77](https://github.com/samuelgja/ggtype/blob/main/src/model/date.ts#L77)

Adds custom validation logic to the model

#### Parameters

##### onValidate

[`OnValidate`](../type-aliases/OnValidate.md)\<`Date`\>

Validation function that receives the parsed date data

#### Returns

`Date`\<`R`\>

A new Date instance with the validation function
