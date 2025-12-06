[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: OutputValidationError

Defined in: [src/types.ts:81](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L81)

Validation error output format.

## Extends

- [`ErrorBase`](ErrorBase.md)

## Properties

### cause?

> `readonly` `optional` **cause**: `unknown`

Defined in: [src/types.ts:55](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L55)

Optional cause of the error

#### Inherited from

[`ErrorBase`](ErrorBase.md).[`cause`](ErrorBase.md#cause)

***

### code

> `readonly` **code**: `number`

Defined in: [src/types.ts:59](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L59)

HTTP status code

#### Inherited from

[`ErrorBase`](ErrorBase.md).[`code`](ErrorBase.md#code)

***

### errors?

> `readonly` `optional` **errors**: readonly `ErrorObject`\<`string`, `Record`\<`string`, `unknown`\>, `unknown`\>[]

Defined in: [src/types.ts:93](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L93)

Detailed validation errors from AJV

***

### message

> `readonly` **message**: `string`

Defined in: [src/types.ts:89](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L89)

Human-readable error message

***

### type

> `readonly` **type**: `"validation"`

Defined in: [src/types.ts:85](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L85)

Error type identifier (always 'validation')

#### Overrides

[`ErrorBase`](ErrorBase.md).[`type`](ErrorBase.md#type)
