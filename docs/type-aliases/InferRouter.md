[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: InferRouter\<ServerActions, ClientActions\>

> **InferRouter**\<`ServerActions`, `ClientActions`\> = `object`

Defined in: [src/router/router.type.ts:272](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L272)

Type inference helper for router types.

## Type Parameters

### ServerActions

`ServerActions` *extends* [`ServerActionsBase`](ServerActionsBase.md)

The server actions type

### ClientActions

`ClientActions` *extends* [`ClientActionsBase`](ClientActionsBase.md)

The client actions type

## Properties

### clientActions

> `readonly` **clientActions**: `ClientActions`

Defined in: [src/router/router.type.ts:284](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L284)

***

### serverActions

> `readonly` **serverActions**: `{ readonly [ActionName in keyof ServerActions]: { params: ServerActions[ActionName]["model"]["infer"]; result: Awaited<ReturnType<ServerActions[ActionName]["run"]>> } }`

Defined in: [src/router/router.type.ts:276](https://github.com/samuelgja/ggtype/blob/main/src/router/router.type.ts#L276)
