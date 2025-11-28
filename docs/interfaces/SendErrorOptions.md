[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: SendErrorOptions

Defined in: [src/types.ts:322](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L322)

## Properties

### action

> **action**: `string`

Defined in: [src/types.ts:332](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L332)

The action name associated with the error

***

### clientId?

> `optional` **clientId**: `string`

Defined in: [src/types.ts:340](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L340)

The client ID to send the error to

***

### id?

> `optional` **id**: `string`

Defined in: [src/types.ts:344](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L344)

Optional message ID (will be generated if not provided)

***

### onError()

> **onError**: (`error`) => `Error`

Defined in: [src/types.ts:328](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L328)

Error handler function that processes raw errors

#### Parameters

##### error

`Error`

The raw error that occurred

#### Returns

`Error`

The processed error result, or undefined if the error was suppressed

***

### rawError

> **rawError**: `unknown`

Defined in: [src/types.ts:336](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L336)

The raw error that occurred

***

### send()

> **send**: (`message`) => `void`

Defined in: [src/types.ts:348](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L348)

Function to send a raw message (not used in current implementation)

#### Parameters

##### message

[`RouterRawMessage`](../type-aliases/RouterRawMessage.md)

#### Returns

`void`
