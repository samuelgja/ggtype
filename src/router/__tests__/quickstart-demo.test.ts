import { describe, expect, it } from 'bun:test'
import {
  action,
  createRouter,
  createRouterClient,
  defineClientActionsSchema,
  m,
} from '../../index'

describe('Quickstart Demo', () => {
  it('should work with server actions and client actions', async () => {
    // Define models
    const userParams = m.object({
      id: m.string().isRequired(),
      name: m.string().isRequired(),
    })
    const idParams = m.object({
      id: m.string().isRequired(),
    })

    // Create server actions
    const createUser = action(
      userParams,
      async ({ params }) => {
        return { ...params, createdAt: new Date() }
      },
    )
    const getUser = action(idParams, async ({ params }) => {
      return {
        id: params.id,
        name: 'John Doe',
        email: 'john@example.com',
      }
    })

    // Define client actions schema (optional - only needed for bidirectional RPC)
    const clientActions = defineClientActionsSchema({
      showNotification: {
        params: m.object({
          message: m.string().isRequired(),
        }),
        return: m.object({ acknowledged: m.boolean() }),
      },
    })

    // Create router
    const router = createRouter({
      serverActions: { createUser, getUser },
      clientActions, // Optional - omit if you don't need server calling client
      transport: 'stream',
    })

    // Define router type for type-safe client
    type Router = typeof router

    // Start server
    const server = Bun.serve({
      port: 0,
      async fetch(request) {
        return router.onRequest({ request, ctx: {} })
      },
    })

    const url = `http://localhost:${server.port}`

    // Create client with router type for full type safety
    const client = createRouterClient<Router>({
      url,
      transport: 'stream',
      defineClientActions: {
        showNotification: async (params) => {
          // Client action handler
          return {
            acknowledged: true,
            message: params.message,
          }
        },
      },
    })

    // Test createUser
    const createResult = await client.fetch({
      createUser: { id: '1', name: 'Alice' },
    })

    expect(createResult.createUser?.status).toBe('ok')
    if (createResult.createUser?.status === 'ok') {
      expect(createResult.createUser.data.id).toBe('1')
      expect(createResult.createUser.data.name).toBe(
        'Alice',
      )
    }

    // Test getUser
    const getResult = await client.fetch({
      getUser: { id: '1' },
    })

    expect(getResult.getUser?.status).toBe('ok')
    if (getResult.getUser?.status === 'ok') {
      expect(getResult.getUser.data.id).toBe('1')
      expect(getResult.getUser.data.name).toBe('John Doe')
    }

    // Cleanup
    server.stop()
  })
})
