[**ggtype API Documentation v0.4.7**](../README.md)

***

# Interface: RouterResultNotGeneric

Defined in: [src/types.ts:119](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L119)

## Extended by

- [`ActionResultBase`](ActionResultBase.md)

## Properties

### data?

> `optional` **data**: `unknown`

Defined in: [src/types.ts:127](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L127)

Success data (present when status is 'ok')

***

### error?

> `optional` **error**: [`OutputError`](../type-aliases/OutputError.md)

Defined in: [src/types.ts:131](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L131)

Error information (present when status is 'error')

***

### status

> **status**: [`ResultStatus`](../type-aliases/ResultStatus.md)

Defined in: [src/types.ts:123](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L123)

Result status: 'ok' for success, 'error' for failure
