[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: RouterResultNotGeneric

Defined in: [src/types.ts:119](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L119)

## Extended by

- [`ActionResultBase`](ActionResultBase.md)

## Properties

### data?

> `optional` **data**: `unknown`

Defined in: [src/types.ts:127](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L127)

Success data (present when status is 'ok')

***

### error?

> `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:131](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L131)

Error information (present when status is 'error')

***

### status

> **status**: [`ResultStatus`](../type-aliases/ResultStatus.md)

Defined in: [src/types.ts:123](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L123)

Result status: 'ok' for success, 'error' for failure
