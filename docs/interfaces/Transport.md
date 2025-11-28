[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: Transport

Defined in: [src/transport/http-stream-transport.ts:10](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-transport.ts#L10)

## Properties

### close()

> **close**: () => `Promise`\<`void`\>

Defined in: [src/transport/http-stream-transport.ts:24](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-transport.ts#L24)

Closes the transport connection

#### Returns

`Promise`\<`void`\>

***

### read()

> **read**: () => `Promise`\<`RouterMessage` \| `null`\>

Defined in: [src/transport/http-stream-transport.ts:15](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-transport.ts#L15)

Reads a router message from the transport

#### Returns

`Promise`\<`RouterMessage` \| `null`\>

The router message, or null if the stream is closed

***

### write()

> **write**: (`message`) => `Promise`\<`void`\>

Defined in: [src/transport/http-stream-transport.ts:20](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/transport/http-stream-transport.ts#L20)

Writes a router message to the transport

#### Parameters

##### message

`RouterMessage`

The router message to send

#### Returns

`Promise`\<`void`\>
