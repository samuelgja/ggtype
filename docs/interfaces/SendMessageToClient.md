[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: SendMessageToClient

Defined in: [src/types.ts:285](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L285)

## Properties

### action

> **action**: `string`

Defined in: [src/types.ts:289](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L289)

The action name

***

### clientId?

> `optional` **clientId**: `string`

Defined in: [src/types.ts:297](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L297)

The client ID to send the message to

***

### data

> **data**: `unknown`

Defined in: [src/types.ts:293](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L293)

The data to send (can be File, Blob, or any serializable value)

***

### id?

> `optional` **id**: `string`

Defined in: [src/types.ts:301](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L301)

Optional message ID (will be generated if not provided)

***

### isLast?

> `optional` **isLast**: `boolean`

Defined in: [src/types.ts:305](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L305)

Whether this is the last message in a stream

***

### send()

> **send**: (`message`) => `void`

Defined in: [src/types.ts:309](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L309)

Function to send a raw message (not used in current implementation)

#### Parameters

##### message

[`RouterRawMessage`](../type-aliases/RouterRawMessage.md)

#### Returns

`void`
