/* eslint-disable no-console */
import {
  action,
  createRouter,
  defineClientActionsSchema,
  m,
} from '../../src/index'

// Define client actions schema
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({
      message: m.string(),
      type: m.enums('info', 'success', 'warning', 'error'),
    }),
    return: m.object({ acknowledged: m.boolean() }),
  },
  updateUI: {
    params: m.object({
      component: m.string(),
      data: m.record(m.string()),
    }),
    return: m.object({ success: m.boolean() }),
  },
})

type ClientActions = typeof clientActions

// Action that sends notifications to client
const sendNotification = action(
  m.object({ message: m.string(), type: m.string() }),
  async ({
    params,
    clientActions: clientActionsParameter,
  }) => {
    const { showNotification } =
      clientActionsParameter<ClientActions>()
    const result = await showNotification?.({
      message: params.message,
      type: params.type as
        | 'info'
        | 'success'
        | 'warning'
        | 'error',
    })

    if (result?.status === 'ok' && result.data) {
      return {
        success: true,
        acknowledged: result.data.acknowledged,
      }
    }

    return { success: false }
  },
)

// Action that broadcasts updates
const broadcastUpdate = action(
  m.object({
    component: m.string(),
    data: m.record(m.string()),
  }),
  async ({
    params,
    clientActions: clientActionsParameter,
  }) => {
    const { updateUI } =
      clientActionsParameter<ClientActions>()
    const result = await updateUI?.({
      component: params.component,
      data: params.data,
    })

    return {
      success:
        result?.status === 'ok' &&
        result.data !== undefined,
      component: params.component,
    }
  },
)

// Streaming action for real-time updates
const subscribeToChat = action(
  m.object({ roomId: m.string() }),
  async function* ({
    params,
    clientActions: clientActionsParameter_,
  }) {
    const clientActionsParameter =
      clientActionsParameter_<ClientActions>()
    const { showNotification } = clientActionsParameter

    // Notify client that subscription started
    await showNotification?.({
      message: `Joined chat room: ${params.roomId}`,
      type: 'info',
    })

    // Stream chat messages
    for (let index = 1; index <= 5; index++) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      )

      yield {
        roomId: params.roomId,
        message: `Message ${index} in room ${params.roomId}`,
        author: 'Server',
        timestamp: Date.now(),
      }
    }

    // Notify client that subscription ended
    await showNotification?.({
      message: `Left chat room: ${params.roomId}`,
      type: 'info',
    })
  },
)

// Create router
const router = createRouter({
  serverActions: {
    sendNotification,
    broadcastUpdate,
    subscribeToChat,
  },
  clientActions,
})

export type Router = typeof router

// Start server
Bun.serve({
  port: 4003,
  fetch(request, server) {
    // Upgrade WebSocket connections
    if (server.upgrade(request)) {
      return
    }
    return new Response('Upgrade failed', { status: 500 })
  },
  websocket: {
    message(ws, message) {
      if (router.onWebSocketMessage) {
        router
          .onWebSocketMessage({
            ws,
            message: message as Uint8Array,
            ctx: {},
          })
          .catch(() => {
            // Handle errors
          })
      }
    },
    close(ws) {
      ws.close()
    },
  },
})

console.log(
  'WebSocket server running on ws://localhost:4003',
)

