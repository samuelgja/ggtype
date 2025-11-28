[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: hasStatusCode()

> **hasStatusCode**(`result`, `code`): `boolean`

Defined in: [src/router/router-client.types.ts:90](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/router/router-client.types.ts#L90)

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
