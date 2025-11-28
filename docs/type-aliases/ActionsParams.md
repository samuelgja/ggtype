[**ggtype API Documentation v0.4.7**](../README.md)

***

# Type Alias: ActionsParams\<Actions\>

> **ActionsParams**\<`Actions`\> = `{ [ActionName in keyof Actions]?: Parameters<Actions[ActionName]["run"]>[0]["params"] }`

Defined in: [src/types.ts:208](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/types.ts#L208)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`Action`](Action.md)\>
