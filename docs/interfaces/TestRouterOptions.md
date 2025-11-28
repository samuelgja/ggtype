[**ggtype API Documentation v0.4.7**](../README.md)

***

# Interface: TestRouterOptions

Defined in: [src/utils/router-test-utils.ts:18](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/utils/router-test-utils.ts#L18)

## Properties

### onError()?

> `readonly` `optional` **onError**: (`error`) => `void`

Defined in: [src/utils/router-test-utils.ts:30](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/utils/router-test-utils.ts#L30)

Optional error handler callback

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### responseTimeout?

> `readonly` `optional` **responseTimeout**: `number`

Defined in: [src/utils/router-test-utils.ts:22](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/utils/router-test-utils.ts#L22)

Timeout in milliseconds for waiting responses (default: 60000)

***

### transport?

> `readonly` `optional` **transport**: [`TransportType`](../type-aliases/TransportType.md)

Defined in: [src/utils/router-test-utils.ts:26](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/utils/router-test-utils.ts#L26)

Transport type: 'stream', 'websocket', or 'http' (default: 'stream')
