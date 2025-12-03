[**ggtype API Documentation v0.5.1**](../README.md)

***

# Interface: ActionResultOk\<T\>

Defined in: [src/types.ts:175](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L175)

Success result for an action.

## Extends

- [`ActionResultBase`](ActionResultBase.md)\<`T`\>

## Type Parameters

### T

`T`

The result type

## Properties

### data

> `readonly` **data**: [`UnwrapStreamType`](../type-aliases/UnwrapStreamType.md)\<`T`\>

Defined in: [src/types.ts:185](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L185)

Success data with unwrapped stream types

#### Overrides

[`ActionResultBase`](ActionResultBase.md).[`data`](ActionResultBase.md#data)

***

### error?

> `readonly` `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:167](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L167)

Error information (present when status is 'error')

#### Inherited from

[`ActionResultBase`](ActionResultBase.md).[`error`](ActionResultBase.md#error)

***

### status

> `readonly` **status**: `"ok"`

Defined in: [src/types.ts:181](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L181)

Result status (always 'ok' for success)

#### Overrides

[`ActionResultBase`](ActionResultBase.md).[`status`](ActionResultBase.md#status)
