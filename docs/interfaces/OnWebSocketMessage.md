[**ggtype API Documentation v0.4.7**](../README.md)

***

# Interface: OnWebSocketMessage

Defined in: [src/types.ts:304](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L304)

## Extends

- [`RouterCallOptions`](RouterCallOptions.md)

## Properties

### ctx?

> `optional` **ctx**: `unknown`

Defined in: [src/types.ts:316](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L316)

The context object to pass to actions

#### Overrides

[`RouterCallOptions`](RouterCallOptions.md).[`ctx`](RouterCallOptions.md#ctx)

***

### message

> **message**: `unknown`

Defined in: [src/types.ts:312](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L312)

The incoming message (Uint8Array, ArrayBuffer, or Blob)

***

### onError()?

> `readonly` `optional` **onError**: (`error`) => [`AppError`](../type-aliases/AppError.md)

Defined in: [src/types.ts:238](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L238)

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

Defined in: [src/types.ts:308](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L308)

The WebSocket instance
