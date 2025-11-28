[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: HandleStream

Defined in: [src/types.ts:312](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L312)

## Properties

### action

> **action**: `string`

Defined in: [src/types.ts:320](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L320)

The action name

***

### data

> **data**: `AsyncIterable`\<`unknown`\>

Defined in: [src/types.ts:324](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L324)

The async iterable stream to process

***

### id?

> `optional` **id**: `string`

Defined in: [src/types.ts:328](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L328)

The message ID

***

### onError()

> **onError**: (`error`) => `Error`

Defined in: [src/types.ts:316](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L316)

Error handler function

#### Parameters

##### error

`Error`

#### Returns

`Error`

***

### send()

> **send**: (`message`) => `void`

Defined in: [src/types.ts:332](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L332)

Function to send a raw message (not used in current implementation)

#### Parameters

##### message

[`RouterRawMessage`](../type-aliases/RouterRawMessage.md)

#### Returns

`void`
