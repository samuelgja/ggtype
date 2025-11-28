[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: RouterCallOptions

Defined in: [src/types.ts:177](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L177)

## Extended by

- [`OnRequest`](OnRequest.md)
- [`OnWebSocketMessage`](OnWebSocketMessage.md)

## Properties

### ctx?

> `readonly` `optional` **ctx**: `unknown`

Defined in: [src/types.ts:181](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L181)

Optional context object to pass to actions

***

### onError()?

> `readonly` `optional` **onError**: (`error`) => [`AppError`](../type-aliases/AppError.md)

Defined in: [src/types.ts:187](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L187)

Optional error handler function that processes errors

#### Parameters

##### error

[`AppError`](../type-aliases/AppError.md)

The error that occurred

#### Returns

[`AppError`](../type-aliases/AppError.md)

The processed error, or undefined to suppress it
