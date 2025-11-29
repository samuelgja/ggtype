[**ggtype API Documentation v0.4.8**](../README.md)

***

# Interface: SendMessageToClient

Defined in: [src/types.ts:354](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L354)

## Properties

### action

> **action**: `string`

Defined in: [src/types.ts:358](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L358)

The action name

***

### clientId?

> `optional` **clientId**: `string`

Defined in: [src/types.ts:366](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L366)

The client ID to send the message to

***

### data

> **data**: `unknown`

Defined in: [src/types.ts:362](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L362)

The data to send (can be File, Blob, or any serializable value)

***

### id?

> `optional` **id**: `string`

Defined in: [src/types.ts:370](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L370)

Optional message ID (will be generated if not provided)

***

### isLast?

> `optional` **isLast**: `boolean`

Defined in: [src/types.ts:374](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L374)

Whether this is the last message in a stream

***

### send()

> **send**: (`message`) => `void`

Defined in: [src/types.ts:378](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L378)

Function to send a raw message (not used in current implementation)

#### Parameters

##### message

[`RouterRawMessage`](../type-aliases/RouterRawMessage.md)

#### Returns

`void`
