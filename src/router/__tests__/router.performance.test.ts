import { action, m, type TransportType } from '../..'
import { defineClientActionsSchema } from '../handle-client-actions'
import { createTestRouter } from '../../utils/router-test-utils'

describe('router performance', () => {
  const transports: TransportType[] = [
    'stream',
    'websocket',
  ]

  for (const transport of transports) {
    describe(`transport: ${transport}`, () => {
      const userModel = m
        .object({
          id: m.string(),
          name: m.string(),
        })
        .isOptional()

      const clientActions = defineClientActionsSchema({
        useTool: {
          params: m
            .object({
              tool: m.string(),
              user: m.string(),
            })
            .isOptional(),
          return: m.string().isOptional(),
        },
      })

      const createUser = action(userModel, ({ params }) => {
        return { id: params.id, name: params.name }
      })

      const simpleAction = action(
        m.string(),
        async ({ params }) => {
          return `Result: ${params}`
        },
      )

      const actions = {
        createUser,
        simpleAction,
      }

      const clientActionHandlers = {
        useTool: async ({
          tool,
          user,
        }: {
          tool: string
          user: string
        }) => {
          return `Tool ${tool} used by ${user}`
        },
      }

      it('should handle 100 sequential actions quickly', async () => {
        const testRouter = createTestRouter(
          actions,
          clientActions,
          clientActionHandlers,
          {
            transport,
            responseTimeout: 10_000,
          },
        )

        try {
          const startTime = performance.now()

          for (let index = 0; index < 100; index++) {
            const result =
              await testRouter.actions.simpleAction(
                `test-${index}`,
              )
            const messages = []
            for await (const message of result) {
              messages.push(message)
            }
            expect(messages.length).toBeGreaterThan(0)
          }

          const endTime = performance.now()
          const duration = endTime - startTime

          // Should complete 100 actions in under 5 seconds
          expect(duration).toBeLessThan(5000)
        } finally {
          testRouter.cleanup()
        }
      }, 10_000)

      it('should handle 50 concurrent actions efficiently', async () => {
        const testRouter = createTestRouter(
          actions,
          clientActions,
          clientActionHandlers,
          {
            transport,
            responseTimeout: 10_000,
          },
        )

        try {
          const startTime = performance.now()

          const promises = []
          for (let index = 0; index < 50; index++) {
            promises.push(
              testRouter.actions.simpleAction(
                `test-${index}`,
              ),
            )
          }

          const results = await Promise.all(promises)

          for (const result of results) {
            const messages = []
            for await (const message of result) {
              messages.push(message)
            }
            expect(messages.length).toBeGreaterThan(0)
          }

          const endTime = performance.now()
          const duration = endTime - startTime

          // Should complete 50 concurrent actions in under 3 seconds
          expect(duration).toBeLessThan(3000)
        } finally {
          testRouter.cleanup()
        }
      }, 10_000)

      it('should handle large payloads efficiently', async () => {
        const largeDataAction = action(
          m.string(),
          async ({ params }) => {
            // Return a large string
            return params.repeat(1000)
          },
        )

        const largeActions = { largeDataAction }
        const testRouter = createTestRouter(
          largeActions,
          {},
          {},
          {
            transport,
            responseTimeout: 10_000,
          },
        )

        try {
          const startTime = performance.now()

          const largePayload = 'A'.repeat(10_000) // 10KB payload
          const result =
            await testRouter.actions.largeDataAction(
              largePayload,
            )

          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          const endTime = performance.now()
          const duration = endTime - startTime

          expect(messages.length).toBeGreaterThan(0)
          // Should handle large payloads in under 2 seconds
          expect(duration).toBeLessThan(2000)
        } finally {
          testRouter.cleanup()
        }
      }, 10_000)

      it('should handle streaming with many yields efficiently', async () => {
        const streamingAction = action(
          m.string(),
          async function* ({ params }) {
            for (let index = 0; index < 100; index++) {
              yield `${params}-${index}`
            }
          },
        )

        const streamActions = { streamingAction }
        const testRouter = createTestRouter(
          streamActions,
          {},
          {},
          {
            transport,
            responseTimeout: 10_000,
          },
        )

        try {
          const startTime = performance.now()

          const result =
            await testRouter.actions.streamingAction('test')

          let messageCount = 0
          // eslint-disable-next-line no-empty-pattern
          for await (const {} of result) {
            messageCount++
            if (messageCount > 150) {
              break // Safety limit
            }
          }

          const endTime = performance.now()
          const duration = endTime - startTime

          // Should handle 100 stream messages in under 3 seconds
          expect(duration).toBeLessThan(3000)
          expect(messageCount).toBeGreaterThanOrEqual(100)
        } finally {
          testRouter.cleanup()
        }
      }, 10_000)
    })
  }
})
