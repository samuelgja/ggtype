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
  transport: 'http',
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
  url: 'http://localhost:3000',
  transport: 'http',
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
  transport: 'http',
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

- **`'http'`** - Simple request/response (like REST). Best for CRUD operations.
- **`'stream'`** - HTTP streaming with bidirectional RPC. Best for real-time apps.
- **`'websocket'`** - WebSocket connection. Best for chat, games, real-time collaboration.

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
  transport: 'stream', // or 'websocket'
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
  url: 'http://localhost:3000',
  transport: 'stream',
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
- `createRouter(options)` - Create server router
  - `options.serverActions` - Server actions record
  - `options.clientActions` - Client actions schema (optional)
  - `options.transport` - `'http'` | `'stream'` | `'websocket'` (default: `'stream'`)

**Client**
- `createRouterClient<Router>(options)` - Create client
  - `options.url` - Server URL
  - `options.transport` - Transport type (must match server)
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

## Resources

- 📚 **[API Documentation](./docs/readme.md)** - Complete API reference
- 🐛 [Issue Tracker](https://github.com/samuelgja/ggtype/issues) - Report bugs or request features
- 💬 [Discussions](https://github.com/samuelgja/ggtype/discussions) - Ask questions and share ideas

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Made with ❤️ by the ggtype team
