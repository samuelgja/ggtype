[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: StreamActionsProxyType\<R\>

> **StreamActionsProxyType**\<`R`\> = `{ readonly [ActionName in keyof R["infer"]["serverActions"]]: StreamActionProxy<R, ActionName> }` & `object`

Defined in: [src/router-client/router-client.types.ts:301](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L301)

## Type Declaration

### \_\_brand?

> `readonly` `optional` **\_\_brand**: `never`

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<[`ServerActionsBase`](ServerActionsBase.md), [`ClientActionsBase`](ClientActionsBase.md)\>
