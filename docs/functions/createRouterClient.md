[**ggtype API Documentation v0.4.8**](../README.md)

***

# Function: createRouterClient()

> **createRouterClient**\<`R`\>(`options`): `object`

Defined in: [src/router/router-client.ts:115](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/router-client.ts#L115)

Creates a router client for communicating with a router server.
The client handles sending requests to the server, waiting for responses,
and processing streaming results. Supports HTTP, HTTP stream, and WebSocket transports.
Client actions can be called from the server, enabling bidirectional RPC communication.

## Type Parameters

### R

`R` *extends* [`Router`](../interfaces/Router.md)\<`Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>, `Record`\<`string`, `ClientAction`\>\>

The router type

## Parameters

### options

[`RouterClientOptions`](../type-aliases/RouterClientOptions.md)\<`R`\>

Router client configuration options

## Returns

A router client with fetch and stream methods for executing server actions

### fetchActions

> **fetchActions**: \{ \[ActionName in string \| number \| symbol\]: (params: R\["infer"\]\["serverActions"\]\[ActionName\]\["params"\], options?: FetchOptions\<R\>) =\> Promise\<ActionResult\<R\["infer"\]\["serverActions"\]\[ActionName\]\["result"\]\>\> \}

Sugar methods for calling individual actions.
Each action name is available as a method that calls fetch() with just that action.

#### Example

```ts
const { getUser } = client.fetchActions
const result = await getUser({ id: '123' })
if (isSuccess(result)) {
  console.log(result.data)
}
```

### streamActions

> **streamActions**: \{ \[ActionName in string \| number \| symbol\]: (params: R\["infer"\]\["serverActions"\]\[ActionName\]\["params"\], options?: FetchOptions\<R\>) =\> Promise\<SingleActionStreamResult\<ActionName\>\> \}

Sugar methods for streaming individual actions.
Each action name is available as a method that calls stream() with just that action.

#### Example

```ts
const { searchUsers } = client.streamActions
const stream = await searchUsers({ query: 'john' })
for await (const result of stream) {
  if (isSuccess(result.searchUsers)) {
    console.log(result.searchUsers.data)
  }
}
```

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

```ts
import { createRouterClient } from 'ggtype'

// Create client with HTTP transport
const client = createRouterClient({
  url: 'http://localhost:3000',
  transport: 'http',
  defineClientActions: {
    showNotification: async (params) => {
      alert(params.message)
      return { acknowledged: true }
    },
  },
})

// Use fetch() to wait for all results
const results = await client.fetch({
  getUser: { id: '123' },
  createUser: { id: '456', name: 'John' },
})

if (results.getUser?.status === 'ok') {
  console.log('User:', results.getUser.data)
}

// Use stream() for incremental results
const stream = await client.stream({
  getUser: { id: '123' },
})

for await (const result of stream) {
  if (result.getUser?.status === 'ok') {
    console.log('User:', result.getUser.data)
  }
}
```
