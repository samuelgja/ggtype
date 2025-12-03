[**ggtype API Documentation v0.5.1**](../README.md)

***

# Interface: ErrorBase

Defined in: [src/types.ts:47](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L47)

Base interface for error types.

## Extended by

- [`OutputErrorGeneric`](OutputErrorGeneric.md)
- [`OutputValidationError`](OutputValidationError.md)

## Properties

### cause?

> `readonly` `optional` **cause**: `unknown`

Defined in: [src/types.ts:55](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L55)

Optional cause of the error

***

### code

> `readonly` **code**: `number`

Defined in: [src/types.ts:59](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L59)

HTTP status code

***

### type

> `readonly` **type**: `string`

Defined in: [src/types.ts:51](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L51)

Error type identifier
