[**ggtype API Documentation v0.4.8**](../README.md)

***

# Interface: RouterResultNotGeneric

Defined in: [src/types.ts:119](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L119)

## Extended by

- [`ActionResultBase`](ActionResultBase.md)

## Properties

### data?

> `optional` **data**: `unknown`

Defined in: [src/types.ts:127](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L127)

Success data (present when status is 'ok')

***

### error?

> `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:131](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L131)

Error information (present when status is 'error')

***

### status

> **status**: [`ResultStatus`](../type-aliases/ResultStatus.md)

Defined in: [src/types.ts:123](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L123)

Result status: 'ok' for success, 'error' for failure
