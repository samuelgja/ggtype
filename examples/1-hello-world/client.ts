/* eslint-disable no-console */
import {
  createRouterClient,
  isSuccess,
} from '../../src/index'
import type { Router } from './server'

// Create client
const client = createRouterClient<Router>({
  httpURL: 'http://localhost:4000',
})

// Call the action using proxy (automatic type narrowing)
const result = await client.fetchActions.greet({
  name: 'World',
})

if (isSuccess(result)) {
  console.log('Success:', result.data.message)
  console.log(
    'Timestamp:',
    new Date(result.data.timestamp).toISOString(),
  )
} else {
  console.error('Error:', result.error?.message)
}

// Example with validation error
const invalidResult = await client.fetchActions.greet({
  name: 123 as never, // Invalid: should be string
})

if (!isSuccess(invalidResult)) {
  console.log('\nValidation error example:')
  console.log('Error type:', invalidResult.error?.type)
  console.log(
    'Error message:',
    invalidResult.error?.message,
  )
  if (
    invalidResult.error &&
    'type' in invalidResult.error &&
    invalidResult.error.type === 'validation'
  ) {
    console.log(
      'Validation errors:',
      invalidResult.error.errors,
    )
  }
}
