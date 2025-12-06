[**ggtype API Documentation v0.6.0**](../README.md)

***

# Interface: RouterClient\<R\>

Defined in: [src/router-client/router-client.types.ts:328](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L328)

Router client for making requests to a router server.

## Type Parameters

### R

`R` *extends* [`Router`](Router.md)\<[`ServerActionsBase`](../type-aliases/ServerActionsBase.md), [`ClientActionsBase`](../type-aliases/ClientActionsBase.md)\>

The router type

## Properties

### duplexActions

> `readonly` **duplexActions**: [`DuplexActionsProxyType`](../type-aliases/DuplexActionsProxyType.md)\<`R`\>

Defined in: [src/router-client/router-client.types.ts:362](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L362)

Object with methods for duplex (bidirectional) streaming individual actions by name

***

### fetch()

> `readonly` **fetch**: \<`Params`\>(`params`, `fetchOptions?`) => `Promise`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`R`, `Params`\>\>

Defined in: [src/router-client/router-client.types.ts:337](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L337)

Fetches results for the given parameters using HTTP transport.

#### Type Parameters

##### Params

`Params` *extends* [`ParamsIt`](../type-aliases/ParamsIt.md)\<`R`\>

#### Parameters

##### params

`Params`

Parameters to send. See ParamsIt type for details.

##### fetchOptions?

[`FetchOptions`](FetchOptions.md)\<`R`\>

Optional fetch options. See FetchOptions interface for details.

#### Returns

`Promise`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`R`, `Params`\>\>

Promise resolving to action results

***

### fetchActions

> `readonly` **fetchActions**: [`FetchActionsProxyType`](../type-aliases/FetchActionsProxyType.md)\<`R`\>

Defined in: [src/router-client/router-client.types.ts:354](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L354)

Object with methods for fetching individual actions by name

***

### stream()

> `readonly` **stream**: \<`Params`\>(`params`, `streamOptions?`) => `AsyncGenerator`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`R`, `Params`\>\>

Defined in: [src/router-client/router-client.types.ts:347](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L347)

Streams results for the given parameters using stream transport.

#### Type Parameters

##### Params

`Params` *extends* [`ParamsIt`](../type-aliases/ParamsIt.md)\<`R`\>

#### Parameters

##### params

`Params`

Parameters to send. See ParamsIt type for details.

##### streamOptions?

[`FetchOptions`](FetchOptions.md)\<`R`\>

Optional stream options. See FetchOptions interface for details.

#### Returns

`AsyncGenerator`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`R`, `Params`\>\>

Async generator yielding action results

***

### streamActions

> `readonly` **streamActions**: [`StreamActionsProxyType`](../type-aliases/StreamActionsProxyType.md)\<`R`\>

Defined in: [src/router-client/router-client.types.ts:358](https://github.com/samuelgja/ggtype/blob/main/src/router-client/router-client.types.ts#L358)

Object with methods for streaming individual actions by name
