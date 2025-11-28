[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: ActionsParams\<Actions\>

> **ActionsParams**\<`Actions`\> = `{ [ActionName in keyof Actions]?: Parameters<Actions[ActionName]["run"]>[0]["params"] }`

Defined in: [src/types.ts:163](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L163)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`Action`](Action.md)\>
