[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: SendErrorOptions

Defined in: [src/types.ts:256](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L256)

## Properties

### action

> **action**: `string`

Defined in: [src/types.ts:266](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L266)

The action name associated with the error

***

### clientId?

> `optional` **clientId**: `string`

Defined in: [src/types.ts:274](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L274)

The client ID to send the error to

***

### id?

> `optional` **id**: `string`

Defined in: [src/types.ts:278](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L278)

Optional message ID (will be generated if not provided)

***

### onError()

> **onError**: (`error`) => `Error`

Defined in: [src/types.ts:262](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L262)

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

Defined in: [src/types.ts:270](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L270)

The raw error that occurred

***

### send()

> **send**: (`message`) => `void`

Defined in: [src/types.ts:282](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L282)

Function to send a raw message (not used in current implementation)

#### Parameters

##### message

[`RouterRawMessage`](../type-aliases/RouterRawMessage.md)

#### Returns

`void`
