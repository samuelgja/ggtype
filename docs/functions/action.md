[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: action()

> **action**\<`Model`, `Run`\>(`parameterModel`, `run`): [`Action`](../type-aliases/Action.md)\<`Model`, `InferActionRun`\<`Run`\>\>

Defined in: [src/action/action.ts:161](https://github.com/samuelgja/ggtype/blob/a9f4113b173b6b76049692dd128b2e5015fe95c8/src/action/action.ts#L161)

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

## Example

```ts
import { action, m } from 'ggtype'

// Define parameter model
const userParams = m.object({
  id: m.string().isRequired(),
  name: m.string().isRequired(),
  email: m.string().isEmail().isRequired(),
})

// Create action with validated parameters
const createUser = action(userParams, async ({ params }) => {
  // params is fully typed and validated
  return {
    id: params.id,
    name: params.name,
    email: params.email,
    createdAt: new Date(),
  }
})

// Action with context and client actions
const updateUser = action(userParams, async ({ params, ctx, clientActions }) => {
  const user = ctx?.user
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Call client action for notification (always available - returns empty object if not defined)
  const { showNotification } = clientActions()
  await showNotification?.({
    message: 'User updated!',
    type: 'success',
  })

  return { ...params, updatedAt: new Date() }
})
```
