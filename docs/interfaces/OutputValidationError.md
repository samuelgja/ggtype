[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: OutputValidationError

Defined in: [src/types.ts:48](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L48)

## Extends

- [`ErrorBase`](ErrorBase.md)

## Properties

### cause?

> `readonly` `optional` **cause**: `unknown`

Defined in: [src/types.ts:30](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L30)

Optional cause of the error

#### Inherited from

[`ErrorBase`](ErrorBase.md).[`cause`](ErrorBase.md#cause)

***

### code

> `readonly` **code**: `number`

Defined in: [src/types.ts:34](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L34)

HTTP status code

#### Inherited from

[`ErrorBase`](ErrorBase.md).[`code`](ErrorBase.md#code)

***

### errors?

> `readonly` `optional` **errors**: `ErrorObject`\<`string`, `Record`\<`string`, `unknown`\>, `unknown`\>[]

Defined in: [src/types.ts:60](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L60)

Detailed validation errors from AJV

***

### message

> `readonly` **message**: `string`

Defined in: [src/types.ts:56](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L56)

Human-readable error message

***

### type

> `readonly` **type**: `"validation"`

Defined in: [src/types.ts:52](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L52)

Error type identifier (always 'validation')

#### Overrides

[`ErrorBase`](ErrorBase.md).[`type`](ErrorBase.md#type)
