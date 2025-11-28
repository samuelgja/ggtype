[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: TestRouterOptions

Defined in: [src/utils/router-test-utils.ts:15](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/router-test-utils.ts#L15)

## Properties

### onError()?

> `readonly` `optional` **onError**: (`error`) => `void`

Defined in: [src/utils/router-test-utils.ts:27](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/router-test-utils.ts#L27)

Optional error handler callback

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### responseTimeout?

> `readonly` `optional` **responseTimeout**: `number`

Defined in: [src/utils/router-test-utils.ts:19](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/router-test-utils.ts#L19)

Timeout in milliseconds for waiting responses (default: 60000)

***

### transport?

> `readonly` `optional` **transport**: [`TransportType`](../type-aliases/TransportType.md)

Defined in: [src/utils/router-test-utils.ts:23](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/router-test-utils.ts#L23)

Transport type: 'stream', 'websocket', or 'http' (default: 'stream')
