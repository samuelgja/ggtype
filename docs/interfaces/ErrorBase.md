[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: ErrorBase

Defined in: [src/types.ts:22](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L22)

## Extended by

- [`OutputErrorGeneric`](OutputErrorGeneric.md)
- [`OutputValidationError`](OutputValidationError.md)

## Properties

### cause?

> `readonly` `optional` **cause**: `unknown`

Defined in: [src/types.ts:30](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L30)

Optional cause of the error

***

### code

> `readonly` **code**: `number`

Defined in: [src/types.ts:34](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L34)

HTTP status code

***

### type

> `readonly` **type**: `string`

Defined in: [src/types.ts:26](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L26)

Error type identifier
