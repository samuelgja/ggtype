[**ggtype API Documentation v0.4.5**](../README.md)

***

# Class: WebSocketConnectionManager

Defined in: [src/transport/websocket-connection-manager.ts:27](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-connection-manager.ts#L27)

Manages a persistent WebSocket connection for router client communication.
Handles connection lifecycle, reconnection logic, and message routing.
Creates connections lazily on first use and keeps them alive for reuse.

## Constructors

### Constructor

> **new WebSocketConnectionManager**(`url`, `responseTimeout`, `onError?`, `maxReconnectAttempts?`, `initialReconnectDelay?`, `maxReconnectDelay?`, `connectionTimeout?`): `WebSocketConnectionManager`

Defined in: [src/transport/websocket-connection-manager.ts:38](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-connection-manager.ts#L38)

#### Parameters

##### url

`string` | `URL`

##### responseTimeout

`number`

##### onError?

(`error`) => `void`

##### maxReconnectAttempts?

`number` = `DEFAULT_MAX_RECONNECT_ATTEMPTS`

##### initialReconnectDelay?

`number` = `DEFAULT_INITIAL_RECONNECT_DELAY`

##### maxReconnectDelay?

`number` = `DEFAULT_MAX_RECONNECT_DELAY`

##### connectionTimeout?

`number`

#### Returns

`WebSocketConnectionManager`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/transport/websocket-connection-manager.ts:116](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-connection-manager.ts#L116)

Closes the connection and cleans up resources.

#### Returns

`Promise`\<`void`\>

***

### getConnection()

> **getConnection**(): `Promise`\<[`Transport`](../interfaces/Transport.md) \| `null`\>

Defined in: [src/transport/websocket-connection-manager.ts:73](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-connection-manager.ts#L73)

Gets or creates a WebSocket connection.
Returns the transport if connection is ready, or null if connection failed.

#### Returns

`Promise`\<[`Transport`](../interfaces/Transport.md) \| `null`\>

The transport instance or null if connection failed

***

### markRequestCompleted()

> **markRequestCompleted**(`requestId`): `void`

Defined in: [src/transport/websocket-connection-manager.ts:107](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-connection-manager.ts#L107)

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

Defined in: [src/transport/websocket-connection-manager.ts:96](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-connection-manager.ts#L96)

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

Defined in: [src/transport/websocket-connection-manager.ts:64](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-connection-manager.ts#L64)

Sets the message processor function that routes incoming messages.
This should be called before using the connection.

#### Parameters

##### processor

`ProcessClientData`

The function to process incoming messages

#### Returns

`void`
