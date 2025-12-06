[**ggtype API Documentation v0.6.0**](../README.md)

***

# Type Alias: FetchActionsProxyType\<R\>

> **FetchActionsProxyType**\<`R`\> = `{ readonly [ActionName in keyof R["infer"]["serverActions"]]: ActionProxy<R, ActionName> }` & `object`

Defined in: [src/router-client/router-client.types.ts:290](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L290)

## Type Declaration

### \_\_brand?

> `readonly` `optional` **\_\_brand**: `never`

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<[`ServerActionsBase`](ServerActionsBase.md), [`ClientActionsBase`](ClientActionsBase.md)\>
