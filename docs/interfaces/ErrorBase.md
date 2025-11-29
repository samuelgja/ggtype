[**ggtype API Documentation v0.4.8**](../README.md)

***

# Interface: ErrorBase

Defined in: [src/types.ts:49](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L49)

## Extended by

- [`OutputErrorGeneric`](OutputErrorGeneric.md)
- [`OutputValidationError`](OutputValidationError.md)

## Properties

### cause?

> `readonly` `optional` **cause**: `unknown`

Defined in: [src/types.ts:57](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L57)

Optional cause of the error

***

### code

> `readonly` **code**: `number`

Defined in: [src/types.ts:61](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L61)

HTTP status code

***

### type

> `readonly` **type**: `string`

Defined in: [src/types.ts:53](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L53)

Error type identifier
