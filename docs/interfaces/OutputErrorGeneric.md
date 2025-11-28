[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: OutputErrorGeneric

Defined in: [src/types.ts:67](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L67)

## Extends

- [`ErrorBase`](ErrorBase.md)

## Properties

### cause?

> `readonly` `optional` **cause**: `unknown`

Defined in: [src/types.ts:57](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L57)

Optional cause of the error

#### Inherited from

[`ErrorBase`](ErrorBase.md).[`cause`](ErrorBase.md#cause)

***

### code

> `readonly` **code**: `number`

Defined in: [src/types.ts:61](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L61)

HTTP status code

#### Inherited from

[`ErrorBase`](ErrorBase.md).[`code`](ErrorBase.md#code)

***

### message

> `readonly` **message**: `string`

Defined in: [src/types.ts:75](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L75)

Human-readable error message

***

### type

> `readonly` **type**: `"generic"`

Defined in: [src/types.ts:71](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L71)

Error type identifier (always 'generic')

#### Overrides

[`ErrorBase`](ErrorBase.md).[`type`](ErrorBase.md#type)
