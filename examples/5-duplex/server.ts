/* eslint-disable no-console */
import {
  action,
  createRouter,
  defineClientActionsSchema,
  m,
} from '../../src/index'

// Define client actions schema
const clientActions = defineClientActionsSchema({
  getUserInput: {
    params: m.object({ prompt: m.string() }),
    return: m.object({ input: m.string() }),
  },
  confirmAction: {
    params: m.object({
      message: m.string(),
      action: m.string(),
    }),
    return: m.object({ confirmed: m.boolean() }),
  },
})

type ClientActions = typeof clientActions

// Interactive action that asks for user input
const interactiveProcess = action(
  m.object({ processName: m.string() }),
  async function* ({
    params,
    clientActions: clientActionsParameter,
  }) {
    const { getUserInput, confirmAction } =
      clientActionsParameter<ClientActions>()

    yield {
      step: 1,
      message: `Starting process: ${params.processName}`,
      status: 'started',
    }

    // Ask for user input
    const inputResult = await getUserInput?.({
      prompt: 'Enter a value to process:',
    })

    if (inputResult?.status === 'ok' && inputResult.data) {
      const userInput = inputResult.data.input
      yield {
        step: 2,
        message: `Received input: ${userInput}`,
        status: 'processing',
        userInput,
      }

      // Process the input
      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      )

      // Ask for confirmation
      const confirmResult = await confirmAction?.({
        message: `Process "${userInput}"?`,
        action: 'process',
      })

      if (
        confirmResult?.status === 'ok' &&
        confirmResult.data &&
        confirmResult.data.confirmed
      ) {
        yield {
          step: 3,
          message: `Processing "${userInput}"...`,
          status: 'processing',
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 1000),
        )

        yield {
          step: 4,
          message: `Processed successfully: ${userInput.toUpperCase()}`,
          status: 'completed',
          result: userInput.toUpperCase(),
        }
      } else {
        yield {
          step: 3,
          message: 'Process cancelled by user',
          status: 'cancelled',
        }
      }
    }
  },
)

// Collaborative editing action
const collaborativeEdit = action(
  m.object({ documentId: m.string() }),
  async function* ({
    params,
    clientActions: clientActionsParameter,
  }) {
    const { getUserInput } =
      clientActionsParameter<ClientActions>()

    yield {
      documentId: params.documentId,
      message: 'Document opened for editing',
      version: 1,
    }

    // Simulate collaborative editing with multiple user inputs
    for (let index = 0; index < 3; index++) {
      const editResult = await getUserInput?.({
        prompt: `Enter edit ${index + 1} for document:`,
      })

      if (editResult?.status === 'ok' && editResult.data) {
        const editInput = editResult.data.input
        yield {
          documentId: params.documentId,
          message: `Edit ${index + 1} applied: ${editInput}`,
          version: index + 2,
          edit: editInput,
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 500),
        )
      }
    }

    yield {
      documentId: params.documentId,
      message: 'Document editing completed',
      version: 4,
      final: true,
    }
  },
)

// Create router
const router = createRouter({
  serverActions: {
    interactiveProcess,
    collaborativeEdit,
  },
  clientActions,
})

export type Router = typeof router

// Start server
Bun.serve({
  port: 4004,
  async fetch(request) {
    return router.onRequest({
      request,
      ctx: {},
      type: 'duplex',
    })
  },
})

console.log(
  'Duplex server running on http://localhost:4004',
)

