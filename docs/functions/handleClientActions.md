[**ggtype API Documentation v0.4.8**](../README.md)

***

# Function: handleClientActions()

> **handleClientActions**\<`Actions`\>(`clientActions`): (`rawMessage`) => `Promise`\<`string`\>

Defined in: [src/router/handle-client-actions.ts:64](https://github.com/samuelgja/ggtype/blob/fd360756890d582812f02b807f249b2b8ebd62d5/src/router/handle-client-actions.ts#L64)

Creates a handler function for processing client action messages.
Parses incoming messages, validates them, executes the corresponding client action,
and returns a serialized response. Handles errors and converts them to proper error messages.

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, `ClientAction`\>

The client actions record type

## Parameters

### clientActions

`ClientCallableActionsFromClient`\<`Actions`\>

Record of client action handlers

## Returns

An async function that processes raw messages and returns serialized responses

> (`rawMessage`): `Promise`\<`string`\>

### Parameters

#### rawMessage

`unknown`

### Returns

`Promise`\<`string`\>
