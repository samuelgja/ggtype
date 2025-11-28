[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: OnRequest

Defined in: [src/types.ts:286](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L286)

## Extends

- [`RouterCallOptions`](RouterCallOptions.md)

## Properties

### ctx?

> `optional` **ctx**: `unknown`

Defined in: [src/types.ts:294](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L294)

The context object to pass to actions

#### Overrides

[`RouterCallOptions`](RouterCallOptions.md).[`ctx`](RouterCallOptions.md#ctx)

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

#### Inherited from

[`RouterCallOptions`](RouterCallOptions.md).[`onError`](RouterCallOptions.md#onerror)

***

### request

> **request**: `Request`

Defined in: [src/types.ts:290](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L290)

The incoming HTTP request

***

### server?

> `optional` **server**: `object`

Defined in: [src/types.ts:298](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L298)

Optional server instance for WebSocket upgrades

#### upgrade()

> **upgrade**: (`request`) => `boolean`

##### Parameters

###### request

`Request`

##### Returns

`boolean`
