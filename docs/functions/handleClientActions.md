[**ggtype API Documentation v0.4.7**](../README.md)

***

# Function: handleClientActions()

> **handleClientActions**\<`Actions`\>(`clientActions`): (`rawMessage`) => `Promise`\<`string`\>

Defined in: [src/router/handle-client-actions.ts:64](https://github.com/samuelgja/ggtype/blob/137128a3dcb18447111a39c3e91e9b141b47e78d/src/router/handle-client-actions.ts#L64)

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
