[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: ActionsParams\<Actions\>

> **ActionsParams**\<`Actions`\> = `{ [ActionName in keyof Actions]?: Parameters<Actions[ActionName]["run"]>[0]["params"] }`

Defined in: [src/types.ts:208](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/types.ts#L208)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`Action`](Action.md)\>
