[**ggtype API Documentation v0.4.5**](../README.md)

***

# Type Alias: ActionsResult\<Actions\>

> **ActionsResult**\<`Actions`\> = `{ [ActionName in keyof Actions]: ActionResult<Awaited<ReturnType<Actions[ActionName]["run"]>>> }`

Defined in: [src/types.ts:149](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/types.ts#L149)

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`Action`](Action.md)\>
