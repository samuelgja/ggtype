[**ggtype API Documentation v0.4.8**](../README.md)

***

# Function: handleError()

> **handleError**(`onError`, `rawError`): [`RouterResultNotGeneric`](../interfaces/RouterResultNotGeneric.md) \| `undefined`

Defined in: [src/utils/handle-error.ts:16](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/utils/handle-error.ts#L16)

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
