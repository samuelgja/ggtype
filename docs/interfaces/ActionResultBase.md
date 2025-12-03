[**ggtype API Documentation v0.5.1**](../README.md)

***

# Interface: ActionResultBase\<T\>

Defined in: [src/types.ts:157](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L157)

Base interface for action results.

## Extends

- [`RouterResultNotGeneric`](RouterResultNotGeneric.md)

## Extended by

- [`ActionResultOk`](ActionResultOk.md)
- [`ActionResultError`](ActionResultError.md)

## Type Parameters

### T

`T`

The result type

## Properties

### data?

> `readonly` `optional` **data**: [`UnwrapStreamType`](../type-aliases/UnwrapStreamType.md)\<`T`\>

Defined in: [src/types.ts:163](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L163)

Success data with unwrapped stream types (present when status is 'ok')

#### Overrides

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`data`](RouterResultNotGeneric.md#data)

***

### error?

> `readonly` `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:167](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L167)

Error information (present when status is 'error')

#### Overrides

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`error`](RouterResultNotGeneric.md#error)

***

### status

> `readonly` **status**: [`ResultStatus`](../type-aliases/ResultStatus.md)

Defined in: [src/types.ts:124](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L124)

Result status: 'ok' for success, 'error' for failure

#### Inherited from

[`RouterResultNotGeneric`](RouterResultNotGeneric.md).[`status`](RouterResultNotGeneric.md#status)
