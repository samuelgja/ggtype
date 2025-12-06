[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: OutputErrorGeneric

Defined in: [src/types.ts:66](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L66)

Generic error output format.

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

### message

> `readonly` **message**: `string`

Defined in: [src/types.ts:74](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L74)

Human-readable error message

***

### type

> `readonly` **type**: `"generic"`

Defined in: [src/types.ts:70](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L70)

Error type identifier (always 'generic')

#### Overrides

[`ErrorBase`](ErrorBase.md).[`type`](ErrorBase.md#type)
