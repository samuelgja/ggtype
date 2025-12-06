[**ggtype API Documentation v0.6.0**](../README.md)

***

# Function: createRouterClient()

> **createRouterClient**\<`RouterType`\>(`options`): `object`

Defined in: [src/router-client/router-client.ts:26](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.ts#L26)

## Type Parameters

### RouterType

`RouterType` *extends* [`Router`](../interfaces/Router.md)\<[`ServerActionsBase`](../type-aliases/ServerActionsBase.md), [`ClientActionsBase`](../type-aliases/ClientActionsBase.md)\>

## Parameters

### options

[`RouterClientOptions`](../interfaces/RouterClientOptions.md)\<`RouterType`\>

## Returns

### duplexActions

> **duplexActions**: [`DuplexActionsProxyType`](../type-aliases/DuplexActionsProxyType.md)\<`RouterType`\>

### fetchActions

> **fetchActions**: [`FetchActionsProxyType`](../type-aliases/FetchActionsProxyType.md)\<`RouterType`\>

### streamActions

> **streamActions**: [`StreamActionsProxyType`](../type-aliases/StreamActionsProxyType.md)\<`RouterType`\>

### duplex()

> **duplex**\<`Params`\>(`params`, `fetchOptions?`): `AsyncGenerator`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`RouterType`, `Params`\>\>

#### Type Parameters

##### Params

`Params` *extends* [`ParamsIt`](../type-aliases/ParamsIt.md)\<`RouterType`\>

#### Parameters

##### params

`Params`

##### fetchOptions?

[`DuplexOptions`](../interfaces/DuplexOptions.md)\<`RouterType`\>

#### Returns

`AsyncGenerator`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`RouterType`, `Params`\>\>

### fetch()

> **fetch**\<`Params`\>(`params`, `fetchOptions?`): `Promise`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`RouterType`, `Params`\>\>

#### Type Parameters

##### Params

`Params` *extends* [`ParamsIt`](../type-aliases/ParamsIt.md)\<`RouterType`\>

#### Parameters

##### params

`Params`

##### fetchOptions?

[`FetchOptions`](../interfaces/FetchOptions.md)\<`RouterType`\>

#### Returns

`Promise`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`RouterType`, `Params`\>\>

### setHeaders()

> **setHeaders**(`newHeaders?`): `void`

Sets headers to be included in all requests.
Call with an object to set headers, or with no arguments to reset headers.

#### Parameters

##### newHeaders?

`Record`\<`string`, `string`\>

Optional headers object. If not provided, headers are reset.

#### Returns

`void`

### startDuplex()

> **startDuplex**(`duplexOptions?`): [`BidirectionalConnection`](../interfaces/BidirectionalConnection.md)\<`RouterType`\>

#### Parameters

##### duplexOptions?

[`DuplexOptions`](../interfaces/DuplexOptions.md)\<`RouterType`\>

#### Returns

[`BidirectionalConnection`](../interfaces/BidirectionalConnection.md)\<`RouterType`\>

### startWebsocket()

> **startWebsocket**(`websocketOptions?`): [`BidirectionalConnection`](../interfaces/BidirectionalConnection.md)\<`RouterType`\>

#### Parameters

##### websocketOptions?

[`WebsocketOptions`](../interfaces/WebsocketOptions.md)\<`RouterType`\>

#### Returns

[`BidirectionalConnection`](../interfaces/BidirectionalConnection.md)\<`RouterType`\>

### stream()

> **stream**\<`Params`\>(`params`, `fetchOptions?`): `AsyncGenerator`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`RouterType`, `Params`\>\>

#### Type Parameters

##### Params

`Params` *extends* [`ParamsIt`](../type-aliases/ParamsIt.md)\<`RouterType`\>

#### Parameters

##### params

`Params`

##### fetchOptions?

[`FetchOptions`](../interfaces/FetchOptions.md)\<`RouterType`\>

#### Returns

`AsyncGenerator`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`RouterType`, `Params`\>\>

### websocket()

> **websocket**\<`Params`\>(`params`, `websocketOptions?`): `AsyncGenerator`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`RouterType`, `Params`\>\>

#### Type Parameters

##### Params

`Params` *extends* [`ParamsIt`](../type-aliases/ParamsIt.md)\<`RouterType`\>

#### Parameters

##### params

`Params`

##### websocketOptions?

[`WebsocketOptions`](../interfaces/WebsocketOptions.md)\<`RouterType`\>

#### Returns

`AsyncGenerator`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`RouterType`, `Params`\>\>
