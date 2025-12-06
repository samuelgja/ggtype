[**ggtype API Documentation v0.6.0**](../README.md)

***

# Function: action()

> **action**\<`Model`, `Run`\>(`parameterModel`, `run`): [`Action`](../type-aliases/Action.md)\<`Model`, `InferActionRun`\<`Run`\>\>

Defined in: [src/action/action.ts:177](https://github.com/samuelgja/ggtype/blob/main/src/action/action.ts#L177)

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

The callback function type

## Parameters

### parameterModel

`Model`

The model to validate parameters against

### run

`Run`

The callback function to execute with validated parameters. See ActionCbParameters interface for parameter details.

## Returns

[`Action`](../type-aliases/Action.md)\<`Model`, `InferActionRun`\<`Run`\>\>

An action object with the model and run function

## Example

```ts
import { action, m } from 'ggtype'

// Define parameter model
const userParams = m.object({
  id: m.string(),
  name: m.string(),
  email: m.string().isEmail(),
}).isOptional()

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
