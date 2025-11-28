[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: hasStatusCode()

> **hasStatusCode**(`result`, `code`): `boolean`

Defined in: [src/router/router-client.types.ts:94](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/router/router-client.types.ts#L94)

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
