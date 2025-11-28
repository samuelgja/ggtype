[**ggtype API Documentation v0.4.5**](../README.md)

***

# Interface: RouterOptions\<Actions, ClientActions\>

Defined in: [src/types.ts:190](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L190)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\> = `Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>

### ClientActions

`ClientActions` *extends* `Record`\<`string`, `ClientAction`\> = `Record`\<`string`, `ClientAction`\>

## Properties

### clientActions?

> `readonly` `optional` **clientActions**: `ClientActions`

Defined in: [src/types.ts:205](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L205)

Record of client actions that can be called by the server

***

### responseTimeout?

> `readonly` `optional` **responseTimeout**: `number`

Defined in: [src/types.ts:209](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L209)

Timeout in milliseconds for waiting responses (default: 60000)

***

### serverActions

> `readonly` **serverActions**: `Actions`

Defined in: [src/types.ts:201](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L201)

Record of server actions that can be called by clients

***

### transport?

> `readonly` `optional` **transport**: [`TransportType`](../type-aliases/TransportType.md)

Defined in: [src/types.ts:213](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L213)

Transport type: 'stream', 'websocket', or 'http' (default: 'stream')
