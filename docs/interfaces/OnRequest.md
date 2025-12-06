[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: OnRequest

Defined in: [src/router/router.type.ts:90](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L90)

Options for handling HTTP requests.

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

### request

> `readonly` **request**: `Request`

Defined in: [src/router/router.type.ts:94](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L94)

The incoming HTTP request

***

### type?

> `readonly` `optional` **type**: `"http"` \| `"stream"` \| `"duplex"`

Defined in: [src/router/router.type.ts:99](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L99)

The type of the request

#### Default

```ts
'http'
```
