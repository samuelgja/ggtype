[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: RouterResultNotGeneric

Defined in: [src/types.ts:77](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L77)

## Extended by

- [`ActionResultBase`](ActionResultBase.md)

## Properties

### data?

> `optional` **data**: `unknown`

Defined in: [src/types.ts:85](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L85)

Success data (present when status is 'ok')

***

### error?

> `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:89](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L89)

Error information (present when status is 'error')

***

### status

> **status**: [`ResultStatus`](../type-aliases/ResultStatus.md)

Defined in: [src/types.ts:81](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L81)

Result status: 'ok' for success, 'error' for failure
