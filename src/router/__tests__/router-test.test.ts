import { defineClientActionsSchema, m } from '../..'
import { action } from '../../action/action'
import { createTestRouter } from '../../utils/router-test-utils'

const serverActions = {
  getUser: action(
    m.object({ id: m.string().isRequired() }),
    async ({ params }) => {
      return { id: params.id }
    },
  ),
  streamUser: action(
    m.string().isRequired(),
    async function* ({ params }) {
      yield { id: params }
      yield { id: params }
      yield { id: params }
    },
  ),
}
const clientActions = defineClientActionsSchema({
  getUser: {
    params: m.object({ id: m.string().isRequired() }),
    return: m.object({ id: m.string().isRequired() }),
  },
})
const clientActionHandlers = {
  getUser: async ({ id }: { id: string }) => {
    return { id }
  },
  streamUser: async ({ id }: { id: string }) => {
    return { id }
  },
}

describe('router test', () => {
  test('router test', async () => {
    // Create test router with both server and client
    const testRouter = createTestRouter(
      serverActions,
      clientActions,
      clientActionHandlers,
      { transport: 'stream' },
    )

    // Test actions
    const result = await testRouter.actions.getUser({
      id: '123',
    })
    for await (const chunk of result) {
      expect(chunk.getUser?.status).toBe('ok')
      expect(chunk.getUser?.data?.id).toBe('123')
    }

    // Cleanup
    testRouter.cleanup()
  })

  test('router test with websocket transport', async () => {
    // Create test router with both server and client
    const testRouter = createTestRouter(
      serverActions,
      clientActions,
      clientActionHandlers,
      { transport: 'websocket' },
    )

    // Test actions
    const result = await testRouter.actions.getUser({
      id: '123',
    })
    for await (const chunk of result) {
      expect(chunk.getUser?.status).toBe('ok')
      expect(chunk.getUser?.data?.id).toBe('123')
    }

    // Cleanup
    testRouter.cleanup()
  })
})
