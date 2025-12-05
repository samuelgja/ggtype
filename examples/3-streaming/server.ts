/* eslint-disable no-console */
/* eslint-disable sonarjs/pseudo-random */
import { action, createRouter, m } from '../../src/index'

// Streaming action that yields multiple results
const streamProgress = action(
  m.object({ taskId: m.string(), steps: m.number() }),
  async function* ({ params }) {
    for (let index = 1; index <= params.steps; index++) {
      // Simulate work
      await new Promise((resolve) =>
        setTimeout(resolve, 500),
      )

      yield {
        taskId: params.taskId,
        step: index,
        totalSteps: params.steps,
        progress: Math.round((index / params.steps) * 100),
        status:
          index === params.steps
            ? 'completed'
            : 'in-progress',
        message: `Processing step ${index} of ${params.steps}...`,
      }
    }
  },
)

// Another streaming action for live updates
const subscribeToUpdates = action(
  m.object({ userId: m.string() }),
  async function* ({ params }) {
    let count = 0
    while (count < 10) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      )

      yield {
        userId: params.userId,
        update: `Update ${count + 1}`,
        timestamp: Date.now(),
        data: {
          notifications: Math.floor(Math.random() * 5),
          messages: Math.floor(Math.random() * 10),
        },
      }

      count++
    }
  },
)

// Create router
const router = createRouter({
  serverActions: { streamProgress, subscribeToUpdates },
})

export type Router = typeof router

// Start server
Bun.serve({
  port: 4002,
  async fetch(request) {
    return router.onRequest({
      request,
      ctx: {},
      type: 'stream',
    })
  },
})

console.log(
  'Streaming server running on http://localhost:4002',
)
