/* eslint-disable no-console */
import {
  createRouterClient,
  isSuccess,
} from '../../src/index'
import type { Router } from './server'

// Create client
const client = createRouterClient<Router>({
  streamURL: 'http://localhost:4002',
})

// Example 1: Stream progress updates
console.log('📊 Streaming progress updates...\n')
const progressStream = client.streamActions.streamProgress({
  taskId: 'task-123',
  steps: 5,
})

for await (const result of progressStream) {
  if (isSuccess(result)) {
    const { step, totalSteps, progress, status, message } =
      result.data
    console.log(
      `[${progress}%] ${message} (${step}/${totalSteps}) - ${status}`,
    )
  } else {
    console.error('Error:', result.error?.message)
    break
  }
}

console.log('\n' + '='.repeat(50) + '\n')

// Example 2: Subscribe to live updates
console.log('🔔 Subscribing to live updates...\n')
const updatesStream =
  client.streamActions.subscribeToUpdates({
    userId: 'user-456',
  })

let updateCount = 0
for await (const result of updatesStream) {
  if (isSuccess(result)) {
    const { update, timestamp, data } = result.data
    console.log(
      `[${new Date(timestamp).toLocaleTimeString()}] ${update}`,
    )
    console.log(
      `   Notifications: ${data.notifications}, Messages: ${data.messages}`,
    )

    updateCount++
    // Stop after 5 updates for demo
    if (updateCount >= 5) {
      console.log('\n⏹️  Stopping subscription...')
      break
    }
  } else {
    console.error('Error:', result.error?.message)
    break
  }
}

