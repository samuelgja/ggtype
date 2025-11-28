[**ggtype API Documentation v0.4.7**](../README.md)

***

# Type Alias: ActionsResult\<Actions\>

> **ActionsResult**\<`Actions`\> = `{ [ActionName in keyof Actions]: ActionResult<Awaited<ReturnType<Actions[ActionName]["run"]>>> }`

Defined in: [src/types.ts:194](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L194)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`Action`](Action.md)\>
