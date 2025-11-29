[**ggtype API Documentation v0.4.8**](../README.md)

***

# Type Alias: ActionsParams\<Actions\>

> **ActionsParams**\<`Actions`\> = `{ [ActionName in keyof Actions]?: Parameters<Actions[ActionName]["run"]>[0]["params"] }`

Defined in: [src/types.ts:208](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/types.ts#L208)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`Action`](Action.md)\>
