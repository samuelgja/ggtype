[**ggtype API Documentation v0.4.5**](../README.md)

***

# Class: WebSocketTransport

Defined in: [src/transport/websocket-transport.ts:36](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-transport.ts#L36)

## Implements

- [`Transport`](../interfaces/Transport.md)

## Accessors

### isClosed

#### Get Signature

> **get** **isClosed**(): `boolean`

Defined in: [src/transport/websocket-transport.ts:45](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-transport.ts#L45)

##### Returns

`boolean`

## Constructors

### Constructor

> **new WebSocketTransport**(`ws`): `WebSocketTransport`

Defined in: [src/transport/websocket-transport.ts:49](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-transport.ts#L49)

#### Parameters

##### ws

`WebSocketLike`

#### Returns

`WebSocketTransport`

## Methods

### feedMessage()

> **feedMessage**(`data`): `void`

Defined in: [src/transport/websocket-transport.ts:119](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-transport.ts#L119)

#### Parameters

##### data

`Uint8Array`

#### Returns

`void`

## Properties

### close()

> **close**: () => `Promise`\<`void`\>

Defined in: [src/transport/websocket-transport.ts:338](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-transport.ts#L338)

Closes the transport connection

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transport`](../interfaces/Transport.md).[`close`](../interfaces/Transport.md#close)

***

### read()

> **read**: () => `Promise`\<`RouterMessage` \| `null`\>

Defined in: [src/transport/websocket-transport.ts:252](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-transport.ts#L252)

Reads a router message from the transport

#### Returns

`Promise`\<`RouterMessage` \| `null`\>

The router message, or null if the stream is closed

#### Implementation of

[`Transport`](../interfaces/Transport.md).[`read`](../interfaces/Transport.md#read)

***

### write()

> **write**: (`message`) => `Promise`\<`void`\>

Defined in: [src/transport/websocket-transport.ts:262](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/websocket-transport.ts#L262)

Writes a router message to the transport

#### Parameters

##### message

`RouterMessage`

The router message to send

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transport`](../interfaces/Transport.md).[`write`](../interfaces/Transport.md#write)
