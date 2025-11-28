[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: ActionResultError\<T\>

Defined in: [src/types.ts:177](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L177)

## Extends

- [`ActionResultBase`](ActionResultBase.md)\<`T`\>

## Type Parameters

### T

`T`

## Properties

### data?

> `optional` **data**: [`UnwrapStreamType`](../type-aliases/UnwrapStreamType.md)\<`T`\>

Defined in: [src/types.ts:157](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L157)

Success data with unwrapped stream types (present when status is 'ok')

#### Inherited from

[`ActionResultBase`](ActionResultBase.md).[`data`](ActionResultBase.md#data)

***

### error

> **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:187](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L187)

Error information

#### Overrides

[`ActionResultBase`](ActionResultBase.md).[`error`](ActionResultBase.md#error)

***

### status

> **status**: `"error"`

Defined in: [src/types.ts:183](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L183)

Result status (always 'error' for failure)

#### Overrides

[`ActionResultBase`](ActionResultBase.md).[`status`](ActionResultBase.md#status)
