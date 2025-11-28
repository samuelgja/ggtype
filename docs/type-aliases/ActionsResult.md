[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: ActionsResult\<Actions\>

> **ActionsResult**\<`Actions`\> = `{ [ActionName in keyof Actions]: ActionResult<Awaited<ReturnType<Actions[ActionName]["run"]>>> }`

Defined in: [src/types.ts:194](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L194)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`Action`](Action.md)\>
