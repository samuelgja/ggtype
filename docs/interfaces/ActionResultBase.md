[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: ActionResultBase\<T\>

Defined in: [src/types.ts:106](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L106)

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

Defined in: [src/types.ts:112](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L112)

Success data with unwrapped stream types (present when status is 'ok')

#### Overrides

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`data`](RouterResultNotGeneric.md#data)

***

### error?

> `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:116](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L116)

Error information (present when status is 'error')

#### Overrides

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`error`](RouterResultNotGeneric.md#error)

***

### status

> **status**: [`ResultStatus`](../type-aliases/ResultStatus.md)

Defined in: [src/types.ts:81](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L81)

Result status: 'ok' for success, 'error' for failure

#### Inherited from

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`status`](RouterResultNotGeneric.md#status)
