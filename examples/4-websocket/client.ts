/* eslint-disable unicorn/no-nested-ternary */
/* eslint-disable sonarjs/no-nested-conditional */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */
import {
  createRouterClient,
  isSuccess,
} from '../../src/index'
import type { Router } from './server'

// Create client with WebSocket
const client = createRouterClient<Router>({
  websocketURL: 'ws://localhost:4003',
  defineClientActions: {
    showNotification: async (params) => {
      const emoji =
        params.type === 'success'
          ? '✅'
          : params.type === 'error'
            ? '❌'
            : params.type === 'warning'
              ? '⚠️'
              : 'ℹ️'
      console.log(
        `${emoji} [${params.type.toUpperCase()}] ${params.message}`,
      )
      return { acknowledged: true }
    },
    updateUI: async (params) => {
      console.log(
        `🔄 UI Update: ${params.component}`,
        JSON.stringify(params.data, null, 2),
      )
      return { success: true }
    },
  },
})

// Example 1: Send notification (server calls client)
console.log('📤 Sending notification...')
const notificationResult =
  await client.fetchActions.sendNotification({
    message: 'Hello from server!',
    type: 'success',
  })

if (isSuccess(notificationResult)) {
  console.log(
    `✅ Notification sent, acknowledged: ${notificationResult.data.acknowledged}`,
  )
}

console.log('\n' + '='.repeat(50) + '\n')

// Example 2: Broadcast update (server calls client)
console.log('📡 Broadcasting update...')
const updateResult =
  await client.fetchActions.broadcastUpdate({
    component: 'dashboard',
    data: {
      users: '150',
      active: '45',
      status: 'online',
    },
  })

if (isSuccess(updateResult)) {
  console.log(
    `✅ Update broadcasted: ${updateResult.data.component}`,
  )
}

console.log('\n' + '='.repeat(50) + '\n')

// Example 3: Subscribe to chat with bidirectional connection
console.log('💬 Subscribing to chat room...\n')
const connection = client.startWebsocket()

// Send subscription request
await connection.send({
  subscribeToChat: { roomId: 'general' },
})

// Listen for messages
let messageCount = 0
for await (const result of connection.stream) {
  if (result.subscribeToChat) {
    if (isSuccess(result.subscribeToChat)) {
      const { message, author, timestamp } =
        result.subscribeToChat.data
      console.log(
        `[${new Date(timestamp).toLocaleTimeString()}] ${author}: ${message}`,
      )
      messageCount++

      if (messageCount >= 5) {
        console.log('\n👋 Closing connection...')
        connection.close()
        break
      }
    } else {
      console.error(
        'Error:',
        result.subscribeToChat.error?.message,
      )
      connection.close()
      break
    }
  }
}
