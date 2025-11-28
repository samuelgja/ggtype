[**ggtype API Documentation v0.4.7**](../README.md)

***

# Function: handleError()

> **handleError**(`onError`, `rawError`): [`RouterResultNotGeneric`](../interfaces/RouterResultNotGeneric.md) \| `undefined`

Defined in: [src/utils/handle-error.ts:16](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/utils/handle-error.ts#L16)

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
