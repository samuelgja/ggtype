[**ggtype API Documentation v0.5.1**](../README.md)

***

# Function: isError()

> **isError**\<`T`\>(`result`): `result is ActionResultError<T>`

Defined in: [src/utils/is.ts:101](https://github.com/samuelgja/ggtype/blob/6b3789cc61c56ec21e320bad94929a3a13255abb/src/utils/is.ts#L101)

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
