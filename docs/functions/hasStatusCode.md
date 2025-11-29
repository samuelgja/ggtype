[**ggtype API Documentation v0.4.8**](../README.md)

***

# Function: hasStatusCode()

> **hasStatusCode**(`result`, `code`): `boolean`

Defined in: [src/router/router-client.types.ts:96](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/router-client.types.ts#L96)

Checks if any result in the response has a specific status code.
Useful for checking authorization errors (e.g., 401) in onResponse hooks.

## Parameters

### result

`HasStatusCodeResult`

The result object from a router client fetch

### code

`number`

The HTTP status code to check for

## Returns

`boolean`

True if any result has an error with the specified status code

## Example

Check for unauthorized errors in onResponse hook
```typescript
onResponse: ({ json, runAgain }) => {
  if (hasStatusCode(json, 401)) {
    // Handle unauthorized error
    return runAgain()
  }
  return json
}
```
