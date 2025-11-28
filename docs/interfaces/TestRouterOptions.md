[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: TestRouterOptions

Defined in: [src/utils/router-test-utils.ts:18](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/utils/router-test-utils.ts#L18)

## Properties

### onError()?

> `readonly` `optional` **onError**: (`error`) => `void`

Defined in: [src/utils/router-test-utils.ts:30](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/utils/router-test-utils.ts#L30)

Optional error handler callback

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### responseTimeout?

> `readonly` `optional` **responseTimeout**: `number`

Defined in: [src/utils/router-test-utils.ts:22](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/utils/router-test-utils.ts#L22)

Timeout in milliseconds for waiting responses (default: 60000)

***

### transport?

> `readonly` `optional` **transport**: [`TransportType`](../type-aliases/TransportType.md)

Defined in: [src/utils/router-test-utils.ts:26](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/utils/router-test-utils.ts#L26)

Transport type: 'stream', 'websocket', or 'http' (default: 'stream')
