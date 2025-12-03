[**ggtype API Documentation v0.5.1**](../README.md)

***

# Function: NOOP\_CLIENT\_ACTIONS()

> **NOOP\_CLIENT\_ACTIONS**\<`ClientActions`\>(): `ClientCallableActions`\<`ClientActions`\>

Defined in: [src/types.ts:23](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/types.ts#L23)

NOOP callback for client actions that returns an empty object.
Used when no client actions are defined.

## Type Parameters

### ClientActions

`ClientActions` *extends* `Record`\<`string`, `ClientAction`\>

## Returns

`ClientCallableActions`\<`ClientActions`\>
