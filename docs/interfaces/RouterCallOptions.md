[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: RouterCallOptions

Defined in: [src/types.ts:228](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L228)

## Extended by

- [`OnRequest`](OnRequest.md)
- [`OnWebSocketMessage`](OnWebSocketMessage.md)

## Properties

### ctx?

> `readonly` `optional` **ctx**: `unknown`

Defined in: [src/types.ts:232](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L232)

Optional context object to pass to actions

***

### onError()?

> `readonly` `optional` **onError**: (`error`) => [`AppError`](../type-aliases/AppError.md)

Defined in: [src/types.ts:238](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L238)

Optional error handler function that processes errors

#### Parameters

##### error

[`AppError`](../type-aliases/AppError.md)

The error that occurred

#### Returns

[`AppError`](../type-aliases/AppError.md)

The processed error, or undefined to suppress it
