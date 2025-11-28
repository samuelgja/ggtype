[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: OnRequest

Defined in: [src/types.ts:226](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L226)

## Extends

- [`RouterCallOptions`](RouterCallOptions.md)

## Properties

### ctx?

> `optional` **ctx**: `unknown`

Defined in: [src/types.ts:234](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L234)

The context object to pass to actions

#### Overrides

[`RouterCallOptions`](RouterCallOptions.md).[`ctx`](RouterCallOptions.md#ctx)

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

### request

> **request**: `Request`

Defined in: [src/types.ts:230](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L230)

The incoming HTTP request

***

### server?

> `optional` **server**: `object`

Defined in: [src/types.ts:238](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L238)

Optional server instance for WebSocket upgrades

#### upgrade()

> **upgrade**: (`request`) => `boolean`

##### Parameters

###### request

`Request`

##### Returns

`boolean`
