[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: RouterOptions\<Actions, ClientActions\>

Defined in: [src/router/router.type.ts:54](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L54)

Configuration options for creating a router.

## Type Parameters

### Actions

`Actions` *extends* [`ServerActionsBase`](../type-aliases/ServerActionsBase.md)

The server actions type

### ClientActions

`ClientActions` *extends* [`ClientActionsBase`](../type-aliases/ClientActionsBase.md)

The client actions type

## Properties

### clientActions?

> `readonly` `optional` **clientActions**: `ClientActions`

Defined in: [src/router/router.type.ts:65](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L65)

Record of client actions that can be called by the server

***

### responseTimeout?

> `readonly` `optional` **responseTimeout**: `number`

Defined in: [src/router/router.type.ts:69](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L69)

Timeout in milliseconds for waiting responses (default: 60000)

***

### serverActions

> `readonly` **serverActions**: `Actions`

Defined in: [src/router/router.type.ts:61](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L61)

Record of server actions that can be called by clients
