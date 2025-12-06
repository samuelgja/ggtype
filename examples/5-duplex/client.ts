/* eslint-disable no-console */
import {
  createRouterClient,
  isSuccess,
} from '../../src/index'
import type { Router } from './server'

// Helper to get user input from console
function getUserInputSync(_prompt: string): string {
  // For demo purposes, we'll use simulated inputs
  // In a real app, you'd use readline or a UI framework
  const simulatedInputs = [
    'Hello World',
    'TypeScript',
    'ggtype',
  ]
  // Using Math.random() is safe here for demo purposes
  // In production, use a cryptographically secure random number generator
  const index = Math.floor(
    // eslint-disable-next-line sonarjs/pseudo-random
    Math.random() * simulatedInputs.length,
  )
  return simulatedInputs[index]!
}

// Create client with duplex support
const client = createRouterClient<Router>({
  halfDuplexUrl: 'http://localhost:4004',
  defineClientActions: {
    getUserInput: async (params) => {
      console.log(`\n❓ ${params.prompt}`)
      // Simulate getting user input
      const input = getUserInputSync(params.prompt)
      console.log(`   → User entered: "${input}"`)
      return { input }
    },
    confirmAction: async (params) => {
      console.log(`\n⚠️  ${params.message}`)
      // Simulate user confirmation (always yes for demo)
      const confirmed = true
      console.log(`   → User confirmed: ${confirmed}`)
      return { confirmed }
    },
  },
})

// Example 1: Interactive process
console.log('🔄 Starting interactive process...\n')
const processStream =
  client.duplexActions.interactiveProcess({
    processName: 'Data Processing',
  })

for await (const result of processStream) {
  if (isSuccess(result)) {
    const { step, message, status } = result.data
    console.log(`[Step ${step}] ${message} (${status})`)
  } else {
    console.error('Error:', result.error?.message)
    break
  }
}

console.log('\n' + '='.repeat(50) + '\n')

// Example 2: Collaborative editing with bidirectional connection
console.log('📝 Starting collaborative editing...\n')
const connection = client.startDuplex()

// Send editing request
await connection.send({
  collaborativeEdit: { documentId: 'doc-123' },
})

// Listen for updates and respond
for await (const result of connection.stream) {
  if (result.collaborativeEdit) {
    if (isSuccess(result.collaborativeEdit)) {
      const { message, version, edit, final } =
        result.collaborativeEdit.data
      console.log(`[v${version}] ${message}`)
      if (edit) {
        console.log(`   Edit: "${edit}"`)
      }

      if (final) {
        console.log('\n✅ Document editing completed!')
        connection.close()
        break
      }
    } else {
      console.error(
        'Error:',
        result.collaborativeEdit.error?.message,
      )
      connection.close()
      break
    }
  }
}
