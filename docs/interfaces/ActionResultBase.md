[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: ActionResultBase\<T\>

Defined in: [src/types.ts:151](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L151)

## Extends

- [`RouterResultNotGeneric`](RouterResultNotGeneric.md)

## Extended by

- [`ActionResultOk`](ActionResultOk.md)
- [`ActionResultError`](ActionResultError.md)

## Type Parameters

### T

`T`

## Properties

### data?

> `optional` **data**: [`UnwrapStreamType`](../type-aliases/UnwrapStreamType.md)\<`T`\>

Defined in: [src/types.ts:157](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L157)

Success data with unwrapped stream types (present when status is 'ok')

#### Overrides

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`data`](RouterResultNotGeneric.md#data)

***

### error?

> `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:161](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L161)

Error information (present when status is 'error')

#### Overrides

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`error`](RouterResultNotGeneric.md#error)

***

### status

> **status**: [`ResultStatus`](../type-aliases/ResultStatus.md)

Defined in: [src/types.ts:123](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L123)

Result status: 'ok' for success, 'error' for failure

#### Inherited from

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`status`](RouterResultNotGeneric.md#status)
