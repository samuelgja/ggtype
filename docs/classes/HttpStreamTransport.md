[**ggtype API Documentation v0.4.5**](../README.md)

***

# Class: HttpStreamTransport

Defined in: [src/transport/http-stream-transport.ts:27](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-transport.ts#L27)

## Implements

- [`Transport`](../interfaces/Transport.md)

## Constructors

### Constructor

> **new HttpStreamTransport**(`readable`, `writable`): `HttpStreamTransport`

Defined in: [src/transport/http-stream-transport.ts:33](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-transport.ts#L33)

#### Parameters

##### readable

`ReadableStream`\<`Uint8Array`\<`ArrayBufferLike`\>\> | `null`

##### writable

`WritableStream`\<`Uint8Array`\<`ArrayBufferLike`\>\> | `null`

#### Returns

`HttpStreamTransport`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/transport/http-stream-transport.ts:217](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-transport.ts#L217)

Closes the transport connection

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transport`](../interfaces/Transport.md).[`close`](../interfaces/Transport.md#close)

***

### read()

> **read**(): `Promise`\<`RouterMessage` \| `null`\>

Defined in: [src/transport/http-stream-transport.ts:43](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-transport.ts#L43)

#### Returns

`Promise`\<`RouterMessage` \| `null`\>

The router message, or null if the stream is closed

#### Implementation of

[`Transport`](../interfaces/Transport.md).[`read`](../interfaces/Transport.md#read)

***

### write()

> **write**(`message`): `Promise`\<`void`\>

Defined in: [src/transport/http-stream-transport.ts:191](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-transport.ts#L191)

Writes a router message to the transport

#### Parameters

##### message

`RouterMessage`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transport`](../interfaces/Transport.md).[`write`](../interfaces/Transport.md#write)
