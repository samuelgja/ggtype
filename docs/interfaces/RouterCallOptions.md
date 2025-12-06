[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: RouterCallOptions

Defined in: [src/router/router.type.ts:35](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L35)

Options for router calls.

## Extended by

- [`OnRequest`](OnRequest.md)
- [`OnWebSocketMessage`](OnWebSocketMessage.md)

## Properties

### ctx?

> `readonly` `optional` **ctx**: `unknown`

Defined in: [src/router/router.type.ts:39](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L39)

Optional context object to pass to actions

***

### onError()?

> `readonly` `optional` **onError**: (`error`) => [`AppError`](../type-aliases/AppError.md)

Defined in: [src/router/router.type.ts:45](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L45)

Optional error handler function that processes errors

#### Parameters

##### error

[`AppError`](../type-aliases/AppError.md)

The error that occurred

#### Returns

[`AppError`](../type-aliases/AppError.md)

The processed error, or undefined to suppress it
