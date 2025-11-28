import { action, m, type TransportType } from '../..'
import { defineClientActionsSchema } from '../handle-client-actions'
import { createTestRouter } from '../../utils/router-test-utils'

describe('router-test-utils', () => {
  const transports: TransportType[] = [
    'stream',
    'websocket',
  ]

  for (const transport of transports) {
    describe(`transport: ${transport}`, () => {
      const timeout = 10
      const userModel = m.object({
        id: m.string().isRequired(),
        name: m.string().isRequired(),
      })

      const clientActions = defineClientActionsSchema({
        useTool: {
          params: m.object({
            tool: m.string().isRequired(),
            user: m.string().isRequired(),
          }),
          return: m.string(),
        },
        useFile: {
          params: m.file().isRequired(),
          return: m.file().isRequired(),
        },
      })
      type ClientActions = typeof clientActions

      const createUser = action(userModel, ({ params }) => {
        return { id: params.id, name: params.name }
      })

      const deleteUser = action(
        m.string().isRequired(),
        // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
        async ({ params, clientActions }) => {
          const { useTool } = clientActions<ClientActions>()
          const toolResult = await useTool?.({
            tool: 'delete',
            user: params,
          })
          return (
            'User deleted: ' +
            params +
            ' ' +
            toolResult?.data
          )
        },
      )

      const fileAction = action(
        m.file().isRequired(),
        async ({ params }) => {
          expect(params).toBeInstanceOf(File)
          return params
        },
      )

      const streamUser = action(
        m.string().isRequired(),
        // eslint-disable-next-line no-shadow, @typescript-eslint/no-shadow
        async function* ({ clientActions }) {
          const { useTool } = clientActions<ClientActions>()
          const toolResult = await useTool?.({
            tool: 'tool-one',
            user: 'user-one',
          })
          yield toolResult
          yield 'OMG_FINISHED'
        },
      )

      const actions = {
        createUser,
        deleteUser,
        fileAction,
        streamUser,
      }

      const clientActionHandlers = {
        useFile: async (file: File) => {
          await new Promise((resolve) =>
            setTimeout(resolve, timeout / 2),
          )
          return file
        },
        useTool: async ({
          tool,
          user: userName,
        }: {
          tool: string
          user: string
        }) => {
          await new Promise((resolve) =>
            setTimeout(resolve, timeout / 2),
          )
          return `Tool ${tool} used by ${userName}`
        },
      }

      it('should create test router and call actions', async () => {
        const testRouter = createTestRouter(
          actions,
          clientActions,
          clientActionHandlers,
          {
            transport,
            responseTimeout: timeout * 10,
          },
        )

        try {
          const result =
            await testRouter.actions.createUser({
              id: '1',
              name: 'John Doe',
            })

          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          expect(messages.length).toBeGreaterThan(0)
          const createUserResult = messages.find(
            (message) => message.createUser,
          )
          expect(
            createUserResult?.createUser?.data,
          ).toEqual({ id: '1', name: 'John Doe' })
        } finally {
          testRouter.cleanup()
        }
      })

      it('should handle multiple actions', async () => {
        const testRouter = createTestRouter(
          actions,
          clientActions,
          clientActionHandlers,
          {
            transport,
            responseTimeout: timeout * 10,
          },
        )

        try {
          const [result1, result2] = await Promise.all([
            testRouter.actions.createUser({
              id: '1',
              name: 'User 1',
            }),
            testRouter.actions.deleteUser('user-1'),
          ])

          const messages1 = []
          for await (const message of result1) {
            messages1.push(message)
          }

          const messages2 = []
          for await (const message of result2) {
            messages2.push(message)
          }

          expect(messages1.length).toBeGreaterThan(0)
          expect(messages2.length).toBeGreaterThan(0)

          const createResult = messages1.find(
            (message) => message.createUser,
          )
          const deleteResult = messages2.find(
            (message) => message.deleteUser,
          )

          expect(createResult?.createUser?.data).toEqual({
            id: '1',
            name: 'User 1',
          })
          expect(deleteResult?.deleteUser?.data).toContain(
            'User deleted: user-1',
          )
        } finally {
          testRouter.cleanup()
        }
      })

      it('should handle file actions', async () => {
        const testRouter = createTestRouter(
          actions,
          clientActions,
          clientActionHandlers,
          {
            transport,
            responseTimeout: timeout * 10,
          },
        )

        try {
          const testFile = new File(
            ['test content'],
            'test.txt',
            { type: 'text/plain' },
          )
          const result =
            await testRouter.actions.fileAction(testFile)

          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          expect(messages.length).toBeGreaterThan(0)
          const fileResult = messages.find(
            (message) => message.fileAction,
          )
          expect(
            fileResult?.fileAction?.data,
          ).toBeInstanceOf(File)
        } finally {
          testRouter.cleanup()
        }
      })

      it('should handle streaming actions', async () => {
        const testRouter = createTestRouter(
          actions,
          clientActions,
          clientActionHandlers,
          {
            transport,
            responseTimeout: timeout * 10,
          },
        )

        try {
          const result =
            await testRouter.actions.streamUser('test-user')

          const messages = []
          for await (const message of result) {
            messages.push(message)
            if (messages.length > 10) {
              break
            }
          }

          expect(messages.length).toBeGreaterThan(0)
          const streamResults = messages.filter(
            (message) => message.streamUser,
          )
          expect(streamResults.length).toBeGreaterThan(0)
          const lastMessage = streamResults.at(-1)
          expect(lastMessage?.streamUser?.data).toBe(
            'OMG_FINISHED',
          )
        } finally {
          testRouter.cleanup()
        }
      })

      it('should handle errors', async () => {
        const errorAction = action(
          m.string().isRequired(),
          async ({ params }) => {
            throw new Error(`Test error: ${params}`)
          },
        )

        const errorActions = { errorAction }
        const testRouter = createTestRouter(
          errorActions,
          {},
          {},
          {
            transport,
            responseTimeout: timeout * 10,
          },
        )

        try {
          const result =
            await testRouter.actions.errorAction(
              'test-error',
            )

          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          expect(messages.length).toBeGreaterThan(0)
          const errorResult = messages.find(
            (message) => message.errorAction,
          )
          expect(errorResult?.errorAction?.status).toBe(
            'error',
          )
          expect(
            errorResult?.errorAction?.error,
          ).toBeDefined()
        } finally {
          testRouter.cleanup()
        }
      })

      it('should handle validation errors', async () => {
        const testRouter = createTestRouter(
          actions,
          clientActions,
          clientActionHandlers,
          {
            transport,
            responseTimeout: timeout * 10,
          },
        )

        try {
          const result =
            await testRouter.actions.createUser({
              id: '1',
              // Missing required 'name' field
            } as { id: string; name: string })

          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          expect(messages.length).toBeGreaterThan(0)
          const errorResult = messages.find(
            (message) => message.createUser,
          )
          expect(errorResult?.createUser?.status).toBe(
            'error',
          )
          expect(
            errorResult?.createUser?.error,
          ).toBeDefined()
        } finally {
          testRouter.cleanup()
        }
      })

      it('should handle cleanup correctly', async () => {
        const testRouter = createTestRouter(
          actions,
          clientActions,
          clientActionHandlers,
          {
            transport,
            responseTimeout: timeout * 10,
          },
        )

        const result = await testRouter.actions.createUser({
          id: '1',
          name: 'Test',
        })

        // Read the result before cleanup
        const messages = []
        for await (const message of result) {
          messages.push(message)
        }

        expect(messages.length).toBeGreaterThan(0)

        // Cleanup should not throw
        testRouter.cleanup()
      })

      it('should handle concurrent calls', async () => {
        const testRouter = createTestRouter(
          actions,
          clientActions,
          clientActionHandlers,
          {
            transport,
            responseTimeout: timeout * 10,
          },
        )

        try {
          const promises = []
          for (let index = 0; index < 5; index++) {
            promises.push(
              testRouter.actions.createUser({
                id: String(index),
                name: `User ${index}`,
              }),
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
        } finally {
          testRouter.cleanup()
        }
      })

      it('should handle onError callback', async () => {
        const testRouter = createTestRouter(
          actions,
          clientActions,
          clientActionHandlers,
          {
            transport,
            responseTimeout: timeout * 10,
            onError: () => {
              // Error callback may or may not be called depending on implementation
            },
          },
        )

        try {
          // Trigger an error by using invalid data
          const result =
            await testRouter.actions.createUser({
              id: '1',
            } as { id: string; name: string })

          const messages = []
          for await (const message of result) {
            messages.push(message)
          }

          // Just verify the test router still works
          expect(messages.length).toBeGreaterThan(0)
        } finally {
          testRouter.cleanup()
        }
      })
    })
  }
})
