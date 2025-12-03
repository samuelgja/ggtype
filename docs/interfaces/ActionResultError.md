[**ggtype API Documentation v0.5.1**](../README.md)

***

# Interface: ActionResultError\<T\>

Defined in: [src/types.ts:193](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L193)

Error result for an action.

## Extends

- [`ActionResultBase`](ActionResultBase.md)\<`T`\>

## Type Parameters

### T

`T`

The result type

## Properties

### data?

> `readonly` `optional` **data**: [`UnwrapStreamType`](../type-aliases/UnwrapStreamType.md)\<`T`\>

Defined in: [src/types.ts:163](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L163)

Success data with unwrapped stream types (present when status is 'ok')

#### Inherited from

[`ActionResultBase`](ActionResultBase.md).[`data`](ActionResultBase.md#data)

***

### error

> `readonly` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:203](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L203)

Error information

#### Overrides

[`ActionResultBase`](ActionResultBase.md).[`error`](ActionResultBase.md#error)

***

### status

> `readonly` **status**: `"error"`

Defined in: [src/types.ts:199](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L199)

Result status (always 'error' for failure)

#### Overrides

[`ActionResultBase`](ActionResultBase.md).[`status`](ActionResultBase.md#status)
