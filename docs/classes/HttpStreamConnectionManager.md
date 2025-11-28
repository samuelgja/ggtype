[**ggtype API Documentation v0.4.5**](../README.md)

***

# Class: HttpStreamConnectionManager

Defined in: [src/transport/http-stream-connection-manager.ts:30](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-connection-manager.ts#L30)

Manages a persistent HTTP stream connection for router client communication.
Handles connection lifecycle, reconnection logic, and message routing.
Creates connections lazily on first use and keeps them alive for reuse.

## Constructors

### Constructor

> **new HttpStreamConnectionManager**(`url`, `responseTimeout`, `onError?`): `HttpStreamConnectionManager`

Defined in: [src/transport/http-stream-connection-manager.ts:38](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-connection-manager.ts#L38)

#### Parameters

##### url

`string` | `URL`

##### responseTimeout

`number`

##### onError?

(`error`) => `void`

#### Returns

`HttpStreamConnectionManager`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/transport/http-stream-connection-manager.ts:100](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-connection-manager.ts#L100)

Closes the connection and cleans up resources.

#### Returns

`Promise`\<`void`\>

***

### getConnection()

> **getConnection**(): `Promise`\<[`Transport`](../interfaces/Transport.md) \| `null`\>

Defined in: [src/transport/http-stream-connection-manager.ts:62](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-connection-manager.ts#L62)

Gets or creates an HTTP stream connection.
Returns the write transport if connection is ready, or null if connection failed.

#### Returns

`Promise`\<[`Transport`](../interfaces/Transport.md) \| `null`\>

The write transport instance or null if connection failed

***

### markRequestCompleted()

> **markRequestCompleted**(`requestId`): `void`

Defined in: [src/transport/http-stream-connection-manager.ts:91](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-connection-manager.ts#L91)

Marks a request as completed.
Used to track active requests for connection lifecycle management.

#### Parameters

##### requestId

`string`

The ID of the completed request

#### Returns

`void`

***

### markRequestPending()

> **markRequestPending**(`requestId`): `void`

Defined in: [src/transport/http-stream-connection-manager.ts:80](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-connection-manager.ts#L80)

Marks a request as pending on the connection.
Used to track active requests for connection lifecycle management.

#### Parameters

##### requestId

`string`

The ID of the pending request

#### Returns

`void`

***

### setMessageProcessor()

> **setMessageProcessor**(`processor`): `void`

Defined in: [src/transport/http-stream-connection-manager.ts:53](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-connection-manager.ts#L53)

Sets the message processor function that routes incoming messages.
This should be called before using the connection.

#### Parameters

##### processor

`ProcessClientData`

The function to process incoming messages

#### Returns

`void`
