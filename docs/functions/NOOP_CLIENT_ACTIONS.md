[**ggtype API Documentation v0.4.8**](../README.md)

***

# Function: NOOP\_CLIENT\_ACTIONS()

> **NOOP\_CLIENT\_ACTIONS**\<`ClientActions`\>(): `ClientCallableActions`\<`ClientActions`\>

Defined in: [src/types.ts:26](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L26)

NOOP callback for client actions that returns an empty object.
Used when no client actions are defined.

## Type Parameters

### ClientActions

`ClientActions` *extends* `Record`\<`string`, `ClientAction`\>

## Returns

`ClientCallableActions`\<`ClientActions`\>
