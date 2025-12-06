[**ggtype API Documentation v0.6.0**](../README.md)

***

# Function: isSuccess()

> **isSuccess**\<`T`\>(`result`): `result is ActionResultOk<T>`

Defined in: [src/utils/is.ts:135](https://github.com/samuelgja/ggtype/blob/main/src/utils/is.ts#L135)

Type guard to check if a router result is a success result.

## Type Parameters

### T

`T`

The data type

## Parameters

### result

[`RouterResultNotGeneric`](../interfaces/RouterResultNotGeneric.md)

The router result to check

## Returns

`result is ActionResultOk<T>`

True if the result has ok status

## Example

```ts
import { createRouterClient, isSuccess } from 'ggtype'

const client = createRouterClient({
  url: 'http://localhost:3000',
  transport: 'http',
})

const results = await client.fetch({
  getUser: { id: '123' },
})

if (isSuccess(results.getUser)) {
  // TypeScript knows results.getUser.data exists
  console.log('User:', results.getUser.data)
}
```
