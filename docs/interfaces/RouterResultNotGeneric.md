[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: RouterResultNotGeneric

Defined in: [src/types.ts:120](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L120)

Non-generic router result format.

## Extended by

- [`ActionResultBase`](ActionResultBase.md)
- [`StreamMessage`](StreamMessage.md)

## Properties

### data?

> `readonly` `optional` **data**: `unknown`

Defined in: [src/types.ts:128](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L128)

Success data (present when status is 'ok')

***

### error?

> `readonly` `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:132](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L132)

Error information (present when status is 'error')

***

### status

> `readonly` **status**: [`ResultStatus`](../type-aliases/ResultStatus.md)

Defined in: [src/types.ts:124](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L124)

Result status: 'ok' for success, 'error' for failure
