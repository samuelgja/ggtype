[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: OnWebSocketMessage

Defined in: [src/router/router.type.ts:130](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L130)

Options for handling WebSocket messages.

## Extends

- [`RouterCallOptions`](RouterCallOptions.md)

## Properties

### ctx?

> `readonly` `optional` **ctx**: `unknown`

Defined in: [src/router/router.type.ts:39](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L39)

Optional context object to pass to actions

#### Inherited from

[`RouterCallOptions`](RouterCallOptions.md).[`ctx`](RouterCallOptions.md#ctx)

***

### message

> `readonly` **message**: `unknown`

Defined in: [src/router/router.type.ts:138](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L138)

The incoming message (Uint8Array, ArrayBuffer, or Blob)

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

#### Inherited from

[`RouterCallOptions`](RouterCallOptions.md).[`onError`](RouterCallOptions.md#onerror)

***

### ws

> `readonly` **ws**: `ServerWebSocket`\<`unknown`\>

Defined in: [src/router/router.type.ts:134](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L134)

The WebSocket instance
