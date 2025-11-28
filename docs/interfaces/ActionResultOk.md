[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: ActionResultOk\<T\>

Defined in: [src/types.ts:119](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L119)

## Extends

- [`ActionResultBase`](ActionResultBase.md)\<`T`\>

## Type Parameters

### T

`T`

## Properties

### data

> **data**: [`UnwrapStreamType`](../type-aliases/UnwrapStreamType.md)\<`T`\>

Defined in: [src/types.ts:129](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L129)

Success data with unwrapped stream types

#### Overrides

[`ActionResultBase`](ActionResultBase.md).[`data`](ActionResultBase.md#data)

***

### error?

> `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:116](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L116)

Error information (present when status is 'error')

#### Inherited from

[`ActionResultBase`](ActionResultBase.md).[`error`](ActionResultBase.md#error)

***

### status

> **status**: `"ok"`

Defined in: [src/types.ts:125](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L125)

Result status (always 'ok' for success)

#### Overrides

[`ActionResultBase`](ActionResultBase.md).[`status`](ActionResultBase.md#status)
