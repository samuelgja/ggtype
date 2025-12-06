[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: ActionsParams\<Actions\>

> **ActionsParams**\<`Actions`\> = `{ readonly [ActionName in keyof Actions]?: Parameters<Actions[ActionName]["run"]>[0]["params"] }`

Defined in: [src/types.ts:238](https://github.com/samuelgja/ggtype/blob/main/src/types.ts#L238)

Type representing parameters for multiple actions.

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`Action`](Action.md)\>

The actions record type
