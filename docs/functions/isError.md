[**ggtype API Documentation v0.4.7**](../README.md)

***

# Function: isError()

> **isError**\<`T`\>(`result`): `result is ActionResultError<T>`

Defined in: [src/utils/is.ts:101](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/utils/is.ts#L101)

Type guard to check if a router result is an error result.

## Type Parameters

### T

`T`

The error type

## Parameters

### result

[`RouterResultNotGeneric`](../interfaces/RouterResultNotGeneric.md)

The router result to check

## Returns

`result is ActionResultError<T>`

True if the result has error status

## Example

```ts
import { createRouterClient, isError } from 'ggtype'

const client = createRouterClient({
  url: 'http://localhost:3000',
  transport: 'http',
})

const results = await client.fetch({
  getUser: { id: '123' },
})

if (isError(results.getUser)) {
  // TypeScript knows results.getUser.error exists
  console.error('Error:', results.getUser.error.message)
}
```
