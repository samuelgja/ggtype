[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: ActionsResult\<Actions\>

> **ActionsResult**\<`Actions`\> = `{ readonly [ActionName in keyof Actions]: ActionResult<Awaited<ReturnType<Actions[ActionName]["run"]>>> }`

Defined in: [src/types.ts:215](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L215)

Type representing results for multiple actions.

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`Action`](Action.md)\>

The actions record type
