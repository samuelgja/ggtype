[**ggtype API Documentation v0.4.7**](../README.md)

***

# Interface: HandleStream

Defined in: [src/types.ts:384](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L384)

## Properties

### action

> **action**: `string`

Defined in: [src/types.ts:392](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L392)

The action name

***

### data

> **data**: `AsyncIterable`\<`unknown`\>

Defined in: [src/types.ts:396](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L396)

The async iterable stream to process

***

### id?

> `optional` **id**: `string`

Defined in: [src/types.ts:400](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L400)

The message ID

***

### onError()

> **onError**: (`error`) => `Error`

Defined in: [src/types.ts:388](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L388)

Error handler function

#### Parameters

##### error

`Error`

#### Returns

`Error`

***

### send()

> **send**: (`message`) => `void`

Defined in: [src/types.ts:404](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L404)

Function to send a raw message (not used in current implementation)

#### Parameters

##### message

[`RouterRawMessage`](../type-aliases/RouterRawMessage.md)

#### Returns

`void`
