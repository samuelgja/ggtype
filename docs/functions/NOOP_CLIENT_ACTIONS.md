[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: NOOP\_CLIENT\_ACTIONS()

> **NOOP\_CLIENT\_ACTIONS**\<`ClientActions`\>(): `ClientCallableActions`\<`ClientActions`\>

Defined in: [src/types.ts:26](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L26)

NOOP callback for client actions that returns an empty object.
Used when no client actions are defined.

## Type Parameters

### ClientActions

`ClientActions` *extends* `Record`\<`string`, `ClientAction`\>

## Returns

`ClientCallableActions`\<`ClientActions`\>
