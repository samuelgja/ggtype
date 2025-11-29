[**ggtype API Documentation v0.4.8**](../README.md)

***

# Type Alias: ActionsResult\<Actions\>

> **ActionsResult**\<`Actions`\> = `{ [ActionName in keyof Actions]: ActionResult<Awaited<ReturnType<Actions[ActionName]["run"]>>> }`

Defined in: [src/types.ts:194](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L194)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`Action`](Action.md)\>
