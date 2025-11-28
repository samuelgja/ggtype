[**ggtype API Documentation v0.4.7**](../README.md)

***

# Function: NOOP\_CLIENT\_ACTIONS()

> **NOOP\_CLIENT\_ACTIONS**\<`ClientActions`\>(): `ClientCallableActions`\<`ClientActions`\>

Defined in: [src/types.ts:26](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L26)

NOOP callback for client actions that returns an empty object.
Used when no client actions are defined.

## Type Parameters

### ClientActions

`ClientActions` *extends* `Record`\<`string`, `ClientAction`\>

## Returns

`ClientCallableActions`\<`ClientActions`\>
