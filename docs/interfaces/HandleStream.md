[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: HandleStream

Defined in: [src/types.ts:384](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L384)

## Properties

### action

> **action**: `string`

Defined in: [src/types.ts:392](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L392)

The action name

***

### data

> **data**: `AsyncIterable`\<`unknown`\>

Defined in: [src/types.ts:396](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L396)

The async iterable stream to process

***

### id?

> `optional` **id**: `string`

Defined in: [src/types.ts:400](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L400)

The message ID

***

### onError()

> **onError**: (`error`) => `Error`

Defined in: [src/types.ts:388](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L388)

Error handler function

#### Parameters

##### error

`Error`

#### Returns

`Error`

***

### send()

> **send**: (`message`) => `void`

Defined in: [src/types.ts:404](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L404)

Function to send a raw message (not used in current implementation)

#### Parameters

##### message

[`RouterRawMessage`](../type-aliases/RouterRawMessage.md)

#### Returns

`void`
