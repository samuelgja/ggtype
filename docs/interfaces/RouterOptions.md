[**ggtype API Documentation v0.4.7**](../README.md)

***

# Interface: RouterOptions\<Actions, ClientActions\>

Defined in: [src/types.ts:244](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L244)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\> = `Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>

### ClientActions

`ClientActions` *extends* `Record`\<`string`, `ClientAction`\> = `Record`\<`string`, `ClientAction`\>

## Properties

### clientActions?

> `readonly` `optional` **clientActions**: `ClientActions`

Defined in: [src/types.ts:259](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L259)

Record of client actions that can be called by the server

***

### responseTimeout?

> `readonly` `optional` **responseTimeout**: `number`

Defined in: [src/types.ts:263](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L263)

Timeout in milliseconds for waiting responses (default: 60000)

***

### serverActions

> `readonly` **serverActions**: `Actions`

Defined in: [src/types.ts:255](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L255)

Record of server actions that can be called by clients

***

### transport?

> `readonly` `optional` **transport**: [`TransportType`](../type-aliases/TransportType.md)

Defined in: [src/types.ts:267](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L267)

Transport type: 'stream', 'websocket', or 'http' (default: 'stream')
