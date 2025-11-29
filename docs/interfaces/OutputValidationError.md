[**ggtype API Documentation v0.4.8**](../README.md)

***

# Interface: OutputValidationError

Defined in: [src/types.ts:81](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L81)

## Extends

- [`ErrorBase`](ErrorBase.md)

## Properties

### cause?

> `readonly` `optional` **cause**: `unknown`

Defined in: [src/types.ts:57](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L57)

Optional cause of the error

#### Inherited from

[`ErrorBase`](ErrorBase.md).[`cause`](ErrorBase.md#cause)

***

### code

> `readonly` **code**: `number`

Defined in: [src/types.ts:61](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L61)

HTTP status code

#### Inherited from

[`ErrorBase`](ErrorBase.md).[`code`](ErrorBase.md#code)

***

### errors?

> `readonly` `optional` **errors**: `ErrorObject`\<`string`, `Record`\<`string`, `unknown`\>, `unknown`\>[]

Defined in: [src/types.ts:93](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L93)

Detailed validation errors from AJV

***

### message

> `readonly` **message**: `string`

Defined in: [src/types.ts:89](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L89)

Human-readable error message

***

### type

> `readonly` **type**: `"validation"`

Defined in: [src/types.ts:85](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L85)

Error type identifier (always 'validation')

#### Overrides

[`ErrorBase`](ErrorBase.md).[`type`](ErrorBase.md#type)
