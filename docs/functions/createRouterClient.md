[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: createRouterClient()

> **createRouterClient**\<`R`\>(`options`): `object`

Defined in: [src/router/router-client.ts:93](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/router/router-client.ts#L93)

Creates a router client for communicating with a router server.
The client handles sending requests to the server, waiting for responses,
and processing streaming results. Supports HTTP, HTTP stream, and WebSocket transports.
Client actions can be called from the server, enabling bidirectional RPC communication.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

## Parameters

### options

[`RouterClientOptions`](../type-aliases/RouterClientOptions.md)\<`R`\>

## Returns

### fetch()

> **fetch**\<`Params`\>(`params`, `fetchOptions?`): `Promise`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`R`, `Params`\>\>

Fetches results for multiple actions, waiting for all to complete.
Returns a Promise that resolves with the final result state.

#### Type Parameters

##### Params

`Params` *extends* [`ParamsIt`](../type-aliases/ParamsIt.md)\<`R`\>

The parameters type

#### Parameters

##### params

`Params`

Object with action names as keys and their parameters as values

##### fetchOptions?

[`FetchOptions`](../interfaces/FetchOptions.md)\<`R`\>

Optional fetch options including files and client actions

#### Returns

`Promise`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`R`, `Params`\>\>

A Promise that resolves to the final result state

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

### stream()

> **stream**\<`Params`\>(`params`, `streamOptions?`): `Promise`\<`AsyncStream`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`R`, `Params`\>\>\>

Streams results for multiple actions as they arrive.
Returns an AsyncStream that yields results incrementally.

#### Type Parameters

##### Params

`Params` *extends* [`ParamsIt`](../type-aliases/ParamsIt.md)\<`R`\>

The parameters type

#### Parameters

##### params

`Params`

Object with action names as keys and their parameters as values

##### streamOptions?

[`FetchOptions`](../interfaces/FetchOptions.md)\<`R`\>

Optional stream options including files and client actions

#### Returns

`Promise`\<`AsyncStream`\<[`ResultForWithActionResult`](../type-aliases/ResultForWithActionResult.md)\<`R`, `Params`\>\>\>

An AsyncStream that yields results as they arrive

## Example

const client = createRouterClient<AppRouter>({
  url: 'http://localhost:3000',
  transport: 'http',
  onResponse: ({ json, runAgain }) => {
    if (hasStatusCode(json, 401)) {
      // Handle auth error and retry
      return runAgain()
    }
    return json
  }
})

const result = await client.fetch({
  getUser: { id: '123' }
})
```
@template R - The router type
@param options - Router client configuration options
@returns A router client with fetch and stream methods for executing server actions
