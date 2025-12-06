/* eslint-disable no-console */
import { action, createRouter, m } from '../../src/index'

// Define a simple action
const greet = action(
  m.object({ name: m.string() }),
  async ({ params }) => {
    return {
      message: `Hello, ${params.name}!`,
      timestamp: Date.now(),
    }
  },
)

// Create router
const router = createRouter({
  serverActions: { greet },
})

// Export router type for client
export type Router = typeof router

// Start server
Bun.serve({
  port: 4000,
  async fetch(request) {
    return router.onRequest({
      request,
      ctx: {},
      type: 'http',
    })
  },
})

console.log('Server running on http://localhost:4000')
