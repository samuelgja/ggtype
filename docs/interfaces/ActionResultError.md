[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: ActionResultError\<T\>

Defined in: [src/types.ts:132](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L132)

## Extends

- [`ActionResultBase`](ActionResultBase.md)\<`T`\>

## Type Parameters

### T

`T`

## Properties

### data?

> `optional` **data**: [`UnwrapStreamType`](../type-aliases/UnwrapStreamType.md)\<`T`\>

Defined in: [src/types.ts:112](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L112)

Success data with unwrapped stream types (present when status is 'ok')

#### Inherited from

[`ActionResultBase`](ActionResultBase.md).[`data`](ActionResultBase.md#data)

***

### error

> **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:142](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L142)

Error information

#### Overrides

[`ActionResultBase`](ActionResultBase.md).[`error`](ActionResultBase.md#error)

***

### status

> **status**: `"error"`

Defined in: [src/types.ts:138](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L138)

Result status (always 'error' for failure)

#### Overrides

[`ActionResultBase`](ActionResultBase.md).[`status`](ActionResultBase.md#status)
