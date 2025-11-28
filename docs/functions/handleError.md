[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: handleError()

> **handleError**(`onError`, `rawError`): [`RouterResultNotGeneric`](../interfaces/RouterResultNotGeneric.md) \| `undefined`

Defined in: [src/utils/handle-error.ts:15](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/handle-error.ts#L15)

Handles errors by processing them through an error handler and converting them to RouterResult format.
Processes ValidationError, ErrorWithCode, and generic Error instances, converting them to
standardized error responses. Returns undefined if the error handler suppresses the error.

## Parameters

### onError

(`error`) => `Error`

Error handler function that processes raw errors

### rawError

`unknown`

The raw error that occurred

## Returns

[`RouterResultNotGeneric`](../interfaces/RouterResultNotGeneric.md) \| `undefined`

A RouterResult with error status, or undefined if the error was suppressed
