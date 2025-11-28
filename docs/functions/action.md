[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: action()

> **action**\<`Model`, `Run`\>(`parameterModel`, `run`): [`Action`](../type-aliases/Action.md)\<`Model`, `InferActionRun`\<`Run`\>\>

Defined in: [src/action/action.ts:82](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/action/action.ts#L82)

Creates an action that validates input parameters and executes a callback function.
The action automatically validates parameters against the provided model before execution.
If validation fails, a ValidationError is thrown. The action can optionally receive
context and client actions for bidirectional communication.

## Type Parameters

### Model

`Model` *extends* [`ModelNotGeneric`](../ggtype-API-Documentation/namespaces/m/interfaces/ModelNotGeneric.md)

The model type for parameter validation

### Run

`Run` *extends* (`parameters`) => `unknown`

## Parameters

### parameterModel

`Model`

The model to validate parameters against

### run

`Run`

The callback function to execute with validated parameters

## Returns

[`Action`](../type-aliases/Action.md)\<`Model`, `InferActionRun`\<`Run`\>\>

An action object with the model and run function
