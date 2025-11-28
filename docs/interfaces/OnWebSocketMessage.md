[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: OnWebSocketMessage

Defined in: [src/types.ts:241](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L241)

## Extends

- [`RouterCallOptions`](RouterCallOptions.md)

## Properties

### ctx?

> `optional` **ctx**: `unknown`

Defined in: [src/types.ts:253](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L253)

The context object to pass to actions

#### Overrides

[`RouterCallOptions`](RouterCallOptions.md).[`ctx`](RouterCallOptions.md#ctx)

***

### message

> **message**: `unknown`

Defined in: [src/types.ts:249](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L249)

The incoming message (Uint8Array, ArrayBuffer, or Blob)

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

#### Inherited from

[`RouterCallOptions`](RouterCallOptions.md).[`onError`](RouterCallOptions.md#onerror)

***

### ws

> **ws**: `ServerWebSocket`\<`unknown`\>

Defined in: [src/types.ts:245](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L245)

The WebSocket instance
