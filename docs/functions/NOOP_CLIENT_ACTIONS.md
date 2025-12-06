[**ggtype API Documentation v0.6.0**](../README.md)

***

# Function: NOOP\_CLIENT\_ACTIONS()

> **NOOP\_CLIENT\_ACTIONS**\<`ClientActions`\>(): [`ClientCallableActions`](../type-aliases/ClientCallableActions.md)\<`ClientActions`\>

Defined in: [src/types.ts:23](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L23)

NOOP callback for client actions that returns an empty object.
Used when no client actions are defined.

## Type Parameters

### ClientActions

`ClientActions` *extends* `Record`\<`string`, [`ClientAction`](../interfaces/ClientAction.md)\>

## Returns

[`ClientCallableActions`](../type-aliases/ClientCallableActions.md)\<`ClientActions`\>
