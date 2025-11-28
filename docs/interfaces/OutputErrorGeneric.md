[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: OutputErrorGeneric

Defined in: [src/types.ts:37](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L37)

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

### message

> `readonly` **message**: `string`

Defined in: [src/types.ts:45](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L45)

Human-readable error message

***

### type

> `readonly` **type**: `"generic"`

Defined in: [src/types.ts:41](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L41)

Error type identifier (always 'generic')

#### Overrides

[`ErrorBase`](ErrorBase.md).[`type`](ErrorBase.md#type)
