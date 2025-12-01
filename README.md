# ggtype

[![Build](https://github.com/samuelgja/ggtype/actions/workflows/build.yml/badge.svg)](https://github.com/samuelgja/ggtype/actions/workflows/build.yml) [![Code Quality Check](https://github.com/samuelgja/ggtype/actions/workflows/code-check.yml/badge.svg)](https://github.com/samuelgja/ggtype/actions/workflows/code-check.yml)
[![Build Size](https://img.shields.io/bundlephobia/minzip/ggtype?label=Bundle%20size)](https://bundlephobia.com/result?p=ggtype)

> 📚 **[Full API Documentation](./docs/readme.md)** | 🚀 **High-performance** | ⚡ **Type-safe** | 🔄 **Bidirectional RPC**

**Type-safe client-server communication with automatic validation and full TypeScript inference.**

---

## Quick Start

Here's the simplest example - a type-safe HTTP JSON API:

```typescript
// server.ts
import { action, createRouter, m } from 'ggtype'

// Define an action
const getUser = action(
  m.object({ id: m.string() }),
  async ({ params }) => {
    return { id: params.id, name: 'John Doe', email: 'john@example.com' }
  }
)

// Create router
const router = createRouter({
  serverActions: { getUser },
})

// Export router type for client
export type Router = typeof router

// Start server
Bun.serve({
  port: 3000,
  async fetch(request) {
    return router.onRequest({ request, ctx: {} })
  },
})
```

```typescript
// client.ts
import { createRouterClient, isSuccess } from 'ggtype'
import type { Router } from './server'

// Create client
const client = createRouterClient<Router>({
  httpURL: 'http://localhost:3000',
})

// Call the action
const { getUser } = client.fetchActions
const result = await getUser({ id: '1' })

if (isSuccess(result)) {
  console.log('User:', result.data) // Fully typed!
}
```

**That's it!** You get automatic validation, full TypeScript types, and a simple HTTP API.

### More Examples

**Multiple actions in one request:**
```typescript
const results = await client.fetch({
  getUser: { id: '1' },
  getPosts: { userId: '1' },
})

if (isSuccess(results.getUser)) {
  console.log('User:', results.getUser.data)
}
```

**Multiple actions:**
```typescript
const router = createRouter({
  serverActions: { getUser, createUser, updateUser },
})
```

---

## What is ggtype?

ggtype is a library for building bidirectional communication between client and server with full type safety. All types are automatically shared between client and server, making it easy to build typed APIs where the server can call client actions and vice versa.

**How it works:**
- **Backend** defines `serverActions` and optionally `clientActions`
- The server can call client actions on its own behalf (bidirectional RPC)
- All types are automatically inferred and shared between client and server
- Automatic validation ensures type safety at runtime

---

## Installation

```bash
bun add ggtype
# or
npm install ggtype
# or
yarn add ggtype
```

---

## Key Features

### 🎯 Type Safety

Everything is fully typed. No `any`, no manual type definitions. Types are automatically shared between client and server.

### ✅ Automatic Validation

Parameters are validated automatically before your action runs. Invalid data throws `ValidationError` with detailed messages.

### 🔄 Bidirectional RPC

Server can call client actions (like notifications, UI updates). Client can call server actions. Full bidirectional communication.

### 📡 Streaming Support

Return streams from actions for real-time data. Use async generators to yield results as they become available.

### 🚀 Multiple Transports

- **`httpURL`** - Simple request/response (like REST). Best for CRUD operations.
- **`streamURL`** - HTTP streaming with bidirectional RPC. Best for real-time apps.
- **`websocketURL`** - WebSocket connection. Best for chat, games, real-time collaboration.

**Transport Selection:** When multiple URLs are provided, the client uses the first available transport in priority order (stream → websocket → http). If the selected transport fails, the error is thrown (no automatic downgrade).

---

## Usage Examples

### Error Handling

```typescript
import { isSuccess, isValidationError } from 'ggtype'

const { getUser } = client.fetchActions
const result = await getUser({ id: '123' })

if (isSuccess(result)) {
  // TypeScript knows result.data exists
  console.log('User:', result.data)
} else {
  // TypeScript knows result.error exists (since isSuccess was false)
  if (isValidationError(result.error)) {
    console.error('Validation errors:', result.error.errors)
  } else {
    console.error('Error:', result.error.message)
  }
}
```

---

## Advanced Features

### Streaming

Return streams from actions for real-time data:

```typescript
// Server: Streaming action
const searchUsers = action(
  m.object({ query: m.string() }),
  async function* ({ params }) {
    yield { id: '1', name: 'John' }
    yield { id: '2', name: 'Jane' }
  }
)

// Client: Use streamActions sugar
const { searchUsers } = client.streamActions
const stream = await searchUsers({ query: 'john' })

for await (const result of stream) {
  if (isSuccess(result.searchUsers)) {
    console.log('Result:', result.searchUsers.data)
  }
}
```

### Bidirectional RPC

Server can call client actions (like notifications, UI updates):

```typescript
// server.ts
import { defineClientActionsSchema } from 'ggtype'

// Define client actions schema
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({ message: m.string() }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

// Export the type for use in actions
type ClientActions = typeof clientActions

const router = createRouter({
  serverActions: { getUser, createUser },
  clientActions, // Enable bidirectional RPC
})

// Server action calling client
const updateUser = action(userParams, async ({ params, clientActions }) => {
  // Update user...
  
  // Call client action with type parameter for full type safety
  const { showNotification } = clientActions<ClientActions>()
  await showNotification?.({
    message: 'User updated!',
  })
  
  return { success: true }
})
```

```typescript
// client.ts
const client = createRouterClient<Router>({
  streamURL: 'http://localhost:3000',
  defineClientActions: {
    showNotification: async (params) => {
      alert(params.message) // Handle notification from server
      return { acknowledged: true }
    },
  },
})
```

---

## API Reference

> 📚 **[Full API Documentation](./docs/readme.md)** - Complete reference with detailed examples and type definitions.

### Quick Reference

**Models** (`m.*`)
- `m.string()`, `m.number()`, `m.boolean()`, `m.date()`, `m.file()`, `m.blob()`
- `m.array(model)`, `m.object(properties)`, `m.record(model)`
- `m.or(...models)`, `m.and(...models)`, `m.enums(...values)`, `m.nullable()`

All models are required by default. Use `` to make them optional.

**Router**
- `createRouter(options)` - Create server router (supports all transports simultaneously)
  - `options.serverActions` - Server actions record
  - `options.clientActions` - Client actions schema (optional)
  - `options.responseTimeout` - Timeout in milliseconds (optional, default: 60000)
  - Returns router with:
    - `onRequest(options)` - Handle HTTP requests
    - `onStream(options)` - Handle HTTP stream requests
    - `onWebSocketMessage(options)` - Handle WebSocket messages

**Client**
- `createRouterClient<Router>(options)` - Create client
  - `options.streamURL` - Server URL for HTTP stream transport (optional)
  - `options.websocketURL` - Server URL for WebSocket transport (optional)
  - `options.httpURL` - Server URL for HTTP transport (optional)
  - **Transport Selection:** If multiple URLs are provided, the client uses the first available transport in priority order (stream → websocket → http). No automatic downgrade.
  - `options.defineClientActions` - Client action handlers (optional)
  - Returns: 
    - `fetch(params, options?)` - Fetch multiple actions
    - `stream(params, options?)` - Stream multiple actions
    - `fetchActions` - Sugar: per-action fetch methods
    - `streamActions` - Sugar: per-action stream methods

**Actions**
- `action(model, callback)` - Create validated action
- `defineClientActionsSchema(schema)` - Define client action schema

**Utilities**
- `createTestRouter(...)` - Create test router
- `getCtx<T>(ctx)` - Type-safe context extraction
- `isSuccess(result)`, `isError(result)` - Type guards
- `ValidationError`, `ErrorWithCode` - Error classes

---

## Performance

- ⚡ **Fast Validation** - Uses AJV (faster than Zod)
- 🚀 **Parallel Execution** - Multiple actions run in parallel
- 💾 **Efficient Streaming** - Minimal memory overhead
- 📦 **Lightweight** - Minimal dependencies

---

## Transport Examples

### HTTP Stream Transport

HTTP stream transport provides bidirectional RPC over a long-lived HTTP connection. Best for real-time applications that need persistent connections.

**Server (Bun):**

```typescript
// server.ts
import { action, createRouter, m } from 'ggtype'

const getUser = action(
  m.object({ id: m.string() }),
  async ({ params }) => {
    return { id: params.id, name: 'John Doe', email: 'john@example.com' }
  }
)

const searchUsers = action(
  m.object({ query: m.string() }),
  async function* ({ params }) {
    // Streaming results
    yield { id: '1', name: 'John', query: params.query }
    yield { id: '2', name: 'Jane', query: params.query }
  }
)

const router = createRouter({
  serverActions: { getUser, searchUsers },
})

export type Router = typeof router

Bun.serve({
  port: 3000,
  async fetch(request) {
    return router.onStream({
      request,
      ctx: {},
    })
  },
})
```

**Client:**

```typescript
// client.ts
import { createRouterClient, isSuccess } from 'ggtype'
import type { Router } from './server'

const client = createRouterClient<Router>({
  streamURL: 'http://localhost:3000',
})

// Single action call
const { getUser } = client.fetchActions
const result = await getUser({ id: '1' })

if (isSuccess(result)) {
  console.log('User:', result.data)
}

// Streaming action
const { searchUsers } = client.streamActions
const stream = await searchUsers({ query: 'john' })

for await (const chunk of stream) {
  if (isSuccess(chunk.searchUsers)) {
    console.log('Result:', chunk.searchUsers.data)
  }
}
```

### WebSocket Transport

WebSocket transport provides persistent bidirectional communication. Best for chat applications, real-time games, and collaborative features.

**Server (Bun):**

```typescript
// server.ts
import { action, createRouter, defineClientActionsSchema, m } from 'ggtype'

// Define client actions schema for bidirectional RPC
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({ message: m.string() }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

type ClientActions = typeof clientActions

const getUser = action(
  m.object({ id: m.string() }),
  async ({ params, clientActions: client }) => {
    // Server can call client actions
    const { showNotification } = client<ClientActions>()
    await showNotification?.({ message: `Fetching user ${params.id}` })
    
    return { id: params.id, name: 'John Doe', email: 'john@example.com' }
  }
)

const subscribeToUpdates = action(
  m.object({ userId: m.string() }),
  async function* ({ params }) {
    // Stream updates to client
    for (let i = 0; i < 5; i++) {
      yield { userId: params.userId, update: `Update ${i + 1}`, timestamp: Date.now() }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
)

const router = createRouter({
  serverActions: { getUser, subscribeToUpdates },
  clientActions,
})

export type Router = typeof router

Bun.serve({
  port: 3000,
  fetch(request, server) {
    // Upgrade WebSocket connections
    if (router.onWebSocketMessage && server.upgrade(request, { data: undefined })) {
      return
    }
    return new Response('Upgrade failed', { status: 500 })
  },
  websocket: {
    message(ws, message) {
      if (router.onWebSocketMessage) {
        router.onWebSocketMessage({
          ws,
          message,
          ctx: {},
        }).catch(() => {
          // Handle errors
        })
      }
    },
    close(ws) {
      ws.close()
    },
  },
})
```

**Client:**

```typescript
// client.ts
import { createRouterClient, isSuccess } from 'ggtype'
import type { Router } from './server'

const client = createRouterClient<Router>({
  websocketURL: 'ws://localhost:3000',
  defineClientActions: {
    showNotification: async (params) => {
      // Handle notification from server
      console.log('Notification:', params.message)
      return { acknowledged: true }
    },
  },
})

// Call server action
const { getUser } = client.fetchActions
const result = await getUser({ id: '1' })

if (isSuccess(result)) {
  console.log('User:', result.data)
}

// Stream updates
const { subscribeToUpdates } = client.streamActions
const stream = await subscribeToUpdates({ userId: '1' })

for await (const chunk of stream) {
  if (isSuccess(chunk.subscribeToUpdates)) {
    console.log('Update:', chunk.subscribeToUpdates.data)
  }
}
```

### WebSocket Transport with Elysia

**Server (Elysia + Bun):**

You can integrate ggtype with Elysia by using Bun's native WebSocket support alongside Elysia for HTTP routes:

```typescript
// server.ts
import { Elysia } from 'elysia'
import { action, createRouter, defineClientActionsSchema, m } from 'ggtype'

// Define client actions schema
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({ message: m.string() }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

type ClientActions = typeof clientActions

const getUser = action(
  m.object({ id: m.string() }),
  async ({ params, clientActions: client }) => {
    const { showNotification } = client<ClientActions>()
    await showNotification?.({ message: `Fetching user ${params.id}` })
    
    return { id: params.id, name: 'John Doe', email: 'john@example.com' }
  }
)

const subscribeToUpdates = action(
  m.object({ userId: m.string() }),
  async function* ({ params }) {
    for (let i = 0; i < 5; i++) {
      yield { userId: params.userId, update: `Update ${i + 1}`, timestamp: Date.now() }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
)

const router = createRouter({
  serverActions: { getUser, subscribeToUpdates },
  clientActions,
})

export type Router = typeof router

// Create Elysia app for HTTP routes
const app = new Elysia()
  .get('/', () => 'Hello from Elysia!')
  .get('/health', () => ({ status: 'ok' }))

// Use Bun.serve for WebSocket support
Bun.serve({
  port: 3000,
  fetch(request, server) {
    // Handle WebSocket upgrade
    if (router.onWebSocketMessage && server.upgrade(request, { data: undefined })) {
      return
    }
    
    // Delegate HTTP requests to Elysia
    return app.handle(request)
  },
  websocket: {
    message(ws, message) {
      if (router.onWebSocketMessage) {
        router.onWebSocketMessage({
          ws,
          message,
          ctx: {},
        }).catch(() => {
          // Handle errors
        })
      }
    },
    close(ws) {
      ws.close()
    },
  },
})

console.log(`Server is running on http://localhost:3000`)
```

**Client:**

```typescript
// client.ts
import { createRouterClient, isSuccess } from 'ggtype'
import type { Router } from './server'

const client = createRouterClient<Router>({
  url: 'ws://localhost:3000',
  transport: 'websocket',
  defineClientActions: {
    showNotification: async (params) => {
      console.log('Notification:', params.message)
      return { acknowledged: true }
    },
  },
})

// Use the client the same way as the Bun example above
const { getUser } = client.fetchActions
const result = await getUser({ id: '1' })

if (isSuccess(result)) {
  console.log('User:', result.data)
}
```

---

## Transport Configuration

The client supports flexible transport configuration:

### Single Transport

Use a single URL for a specific transport:

```typescript
// HTTP only
const client = createRouterClient<Router>({
  httpURL: 'http://localhost:3000',
})

// Stream only
const client = createRouterClient<Router>({
  streamURL: 'http://localhost:3000',
})

// WebSocket only
const client = createRouterClient<Router>({
  websocketURL: 'ws://localhost:3000',
})
```

### Multiple Transports

Provide multiple URLs to specify transport priority. The client will use the first available transport in priority order (stream → websocket → http):

```typescript
const client = createRouterClient<Router>({
  streamURL: 'http://localhost:3000/stream',    // Used first if available
  websocketURL: 'ws://localhost:3000/ws',       // Used if streamURL not provided
  httpURL: 'http://localhost:3000/http',        // Used if neither streamURL nor websocketURL provided
  defineClientActions: {
    showNotification: async (params) => {
      console.log('Notification:', params.message)
      return { acknowledged: true }
    },
  },
})

// The client will use stream transport (first in priority order).
// If streamURL is not provided, it will use websocketURL.
// If neither streamURL nor websocketURL are provided, it will use httpURL.
// If the selected transport fails, an error is thrown (no automatic downgrade).
```

**Use Cases:**
- **Development:** Use all three transports for maximum compatibility
- **Production:** Use stream + websocket for real-time features with HTTP fallback
- **Progressive Enhancement:** Start with HTTP, upgrade to stream/websocket when available

---

## Resources

- 📚 **[API Documentation](./docs/readme.md)** - Complete API reference
- 🐛 [Issue Tracker](https://github.com/samuelgja/ggtype/issues) - Report bugs or request features
- 💬 [Discussions](https://github.com/samuelgja/ggtype/discussions) - Ask questions and share ideas

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Made with ❤️ by the ggtype team
