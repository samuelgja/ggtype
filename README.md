# ggtype

[![Build](https://github.com/samuelgja/ggtype/actions/workflows/build.yml/badge.svg)](https://github.com/samuelgja/ggtype/actions/workflows/build.yml) [![Code Quality Check](https://github.com/samuelgja/ggtype/actions/workflows/code-check.yml/badge.svg)](https://github.com/samuelgja/ggtype/actions/workflows/code-check.yml)
[![Build Size](https://img.shields.io/bundlephobia/minzip/ggtype?label=Bundle%20size)](https://bundlephobia.com/result?p=ggtype)

> 📚 **[Full API Documentation](./docs/README.md)** | 🚀 **High-performance** | ⚡ **Type-safe** | 🔄 **Bidirectional RPC**

**Type-safe client-server communication with automatic validation and full TypeScript inference.**

---

## Quick Start

Here's the simplest example - a type-safe HTTP JSON API:

```typescript
// 1. Define Server Router (server.ts)
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

// 2. Export Router Type for Client
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
// 3. Use in Client (client.ts)
import { createRouterClient, isSuccess } from 'ggtype'
import type { Router } from './server' // Import type only

// Create client
const client = createRouterClient<Router>({
  httpURL: 'http://localhost:3000',
})

// Call the action using proxy (recommended - automatic type narrowing)
const result = await client.fetchActions.getUser({ id: '1' })

if (isSuccess(result)) {
  console.log('User:', result.data) // Fully typed! Direct ActionResult
}
```

**That's it!** You get automatic validation, full TypeScript types, and a simple HTTP API.

### 📚 Complete Examples

For more comprehensive examples, check out the [`examples/`](./examples/) folder:

- **[1. Hello World](./examples/1-hello-world/)** - Basic type-safe client-server communication
- **[2. AI Tools](./examples/2-ai-tools/)** - Bidirectional RPC where server (AI) calls client actions (tools)
- **[3. Streaming](./examples/3-streaming/)** - Server-to-client streaming with real-time updates
- **[4. WebSocket](./examples/4-websocket/)** - Bidirectional WebSocket communication
- **[5. Duplex](./examples/5-duplex/)** - Bidirectional duplex streaming over HTTP

Each example includes runnable server and client code with detailed explanations.

### More Examples

**Using proxy methods (recommended - automatic type narrowing):**
```typescript
// Single action with direct ActionResult (not wrapped)
const result = await client.fetchActions.getUser({ id: '1' })
// result is ActionResult directly, not wrapped in { getUser: ActionResult }

if (isSuccess(result)) {
  console.log('User:', result.data) // Direct access to data
}

// Streaming with proxy
for await (const item of client.streamActions.getUser({ id: '1' })) {
  // item is ActionResult directly
  if (isSuccess(item)) {
    console.log('User:', item.data)
  }
}

// Duplex streaming with proxy
for await (const item of client.duplexActions.getUser({ id: '1' })) {
  // item is ActionResult directly
  if (isSuccess(item)) {
    console.log('User:', item.data)
  }
}
```

**Multiple actions in one request:**
```typescript
const results = await client.fetch({
  getUser: { id: '1' },
  getPosts: { userId: '1' },
})

if (isSuccess(results.getUser)) {
  console.log('User:', results.getUser.data)
}
if (isSuccess(results.getPosts)) {
  console.log('Posts:', results.getPosts.data)
}
```

---

## What is ggtype?

ggtype is a high-performance TypeScript library for building **bidirectional RPC** between client and server with full type safety and automatic validation. 

**Two Main Powers:**

1. **Type-Safe API Communication** - Build REST-like APIs with automatic validation and full TypeScript inference
2. **Bidirectional RPC with Validation** - Server can call client actions (and vice versa) with full type safety and validation on both sides

**How it works:**
- **Backend** defines `serverActions` (what clients can call) and optionally `clientActions` (what server can call on clients)
- **Client** implements `clientActions` handlers
- The server can call client actions during request processing (bidirectional RPC)
- All types are automatically inferred and shared between client and server
- **Automatic validation** ensures type safety at runtime for both server→client and client→server calls
- Validation errors are properly propagated with detailed error information

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

Everything is fully typed. Types are automatically shared between client and server. When using proxy methods (`fetchActions`, `streamActions`, `duplexActions`), the result type is automatically narrowed to only include the specific action you called. The codebase uses proper TypeScript types throughout, with minimal use of `any` only where necessary for generic utilities (properly documented).

### ✅ Automatic Validation

Parameters are validated automatically before your action runs. Invalid data throws `ValidationError` with detailed messages. Uses AJV for fast, efficient validation.

### 🔄 Bidirectional RPC with Validation

**Server can call client actions** (like notifications, UI updates) with full type safety and validation. Client can call server actions. Full bidirectional communication with automatic validation on both sides - when the server calls a client action, the client's response is validated against the schema, ensuring type safety end-to-end.

### 📡 Streaming Support

Return streams from actions for real-time data. Use async generators to yield results as they become available. Supports both server-to-client and client-to-server streaming.

### 🚀 Multiple Transports

- **`httpURL`** - Simple request/response (like REST). Best for CRUD operations.
- **`streamURL`** - HTTP streaming with bidirectional RPC. Best for real-time apps.
- **`halfDuplexUrl`** - Half-duplex streaming (bidirectional over HTTP). Best for interactive streaming.
- **`websocketURL`** - WebSocket connection. Best for chat, games, real-time collaboration.

**Transport Selection:** When multiple URLs are provided, the client uses the first available transport in priority order (stream → websocket → http). If the selected transport fails, the error is thrown (no automatic downgrade).

### 🎨 Proxy Actions (Sugar Methods)

Convenient proxy methods for calling individual actions with automatic type narrowing:

- **`fetchActions`** - Call individual actions via HTTP with narrowed result types
- **`streamActions`** - Stream individual actions with narrowed result types
- **`duplexActions`** - Half Duplex stream individual actions with narrowed result types

### 📁 File Upload Support

Built-in support for file uploads across all transports. Files are automatically handled and passed to your actions via the `files` parameter.

### 🛡️ Comprehensive Model System

Rich model system with validation:
- **Primitives**: `m.string()`, `m.number()`, `m.boolean()`, `m.date()`, `m.null()`
- **Files**: `m.file()`, `m.blob()`
- **Collections**: `m.array(model)`, `m.object(properties)`, `m.record(model)`
- **Unions**: `m.or(...models)`, `m.and(...models)`, `m.enums(...values)`
- **Constraints**: `.min()`, `.max()`, `.pattern()`, `.default()`, `.isOptional()`
- **Custom Validation**: `.validate(callback)`

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

// Client: Use streamActions proxy (automatic type narrowing)
const stream = client.streamActions.searchUsers({ query: 'john' })

for await (const result of stream) {
  // result only has .searchUsers property
  if (isSuccess(result.searchUsers)) {
    console.log('Result:', result.searchUsers.data)
  }
}
```

### Bidirectional RPC with Validation

**The second main power of ggtype:** Server can call client actions (like notifications, UI updates) with full type safety and **automatic validation**. When the server calls a client action, the client's response is validated against the schema you define, ensuring type safety end-to-end.

```typescript
// server.ts
import { defineClientActionsSchema } from 'ggtype'

// Define client actions schema with validation
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({ message: m.string() }),
    return: m.object({ acknowledged: m.boolean() }), // Client response is validated!
  },
})

// Export the type for use in actions
type ClientActions = typeof clientActions

const router = createRouter({
  serverActions: { getUser, createUser },
  clientActions, // Enable bidirectional RPC with validation
})

// Server action calling client
const updateUser = action(userParams, async ({ params, clientActions }) => {
  // Update user...
  
  // Call client action with type parameter for full type safety
  const { showNotification } = clientActions<ClientActions>()
  const result = await showNotification?.({
    message: 'User updated!',
  })
  
  // result is validated! If client returns wrong type, ValidationError is thrown
  if (result?.status === 'ok') {
    console.log('Client acknowledged:', result.data.acknowledged)
  }
  
  return { success: true }
})
```

```typescript
// client.ts
const client = createRouterClient<Router>({
  streamURL: 'http://localhost:3000', // Use stream or websocket for bidirectional RPC
  defineClientActions: {
    showNotification: async (params) => {
      // params is validated automatically (must be { message: string })
      alert(params.message) // Handle notification from server
      
      // Return value is validated against schema!
      // Must return { acknowledged: boolean }
      return { acknowledged: true }
    },
  },
})
```

**Key Benefits:**
- ✅ **Type Safety**: Full TypeScript inference on both sides
- ✅ **Validation**: Client responses are validated against the schema
- ✅ **Error Handling**: Validation errors are properly propagated
- ✅ **Works with Stream/WebSocket/Duplex**: Bidirectional RPC requires persistent connections

### Advanced Capabilities

**Graceful Shutdown:** The client and server are designed to handle graceful shutdowns. The server can continue processing ongoing requests while rejecting new ones.

**Concurrency:** The router handles multiple concurrent requests efficiently, whether they are HTTP, Stream, or WebSocket.

**Edge Cases:**
- **Optional Params:** Actions can define optional parameters using `.isOptional()`.
- **Empty Responses:** Actions can return `void` or empty objects.
- **Security:** Input parameters are strictly validated. Internal server errors are sanitized before being sent to the client to prevent information leakage.

---

## API Reference

> 📚 **[Full API Documentation](./docs/README.md)** - Complete reference with detailed examples and type definitions.

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
  - `options.halfDuplexUrl` - Server URL for half-duplex streaming (optional)
  - `options.httpURL` - Server URL for HTTP transport (optional)
  - **Transport Selection:** If multiple URLs are provided, the client uses the first available transport in priority order (stream → websocket → http). No automatic downgrade.
  - `options.defineClientActions` - Client action handlers (optional)
  - `options.onResponse` - Optional response hook for intercepting responses (optional)
  - `options.onError` - Optional error handler (optional)
  - `options.defaultHeaders` - Default headers for all requests (optional)
  - Returns: 
    - `fetch(params, options?)` - Fetch multiple actions
    - `stream(params, options?)` - Stream multiple actions
    - `duplex(params, options?)` - Duplex stream multiple actions
    - `fetchActions` - Proxy: per-action fetch methods with type narrowing
    - `streamActions` - Proxy: per-action stream methods with type narrowing
    - `duplexActions` - Proxy: per-action duplex methods with type narrowing

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

// Single action call with proxy (automatic type narrowing)
const result = await client.fetchActions.getUser({ id: '1' })

if (isSuccess(result)) {
  console.log('User:', result.data) // Direct ActionResult
}

// Streaming action with proxy
const stream = client.streamActions.searchUsers({ query: 'john' })

for await (const chunk of stream) {
  // chunk is ActionResult directly
  if (isSuccess(chunk)) {
    console.log('Result:', chunk.data)
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

// Call server action with proxy (automatic type narrowing)
const result = await client.fetchActions.getUser({ id: '1' })

if (isSuccess(result)) {
  console.log('User:', result.data) // Direct ActionResult
}

// Stream updates with proxy
const stream = client.streamActions.subscribeToUpdates({ userId: '1' })

for await (const chunk of stream) {
  // chunk is ActionResult directly
  if (isSuccess(chunk)) {
    console.log('Update:', chunk.data)
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
const result = await client.fetchActions.getUser({ id: '1' })

if (isSuccess(result)) {
  console.log('User:', result.data) // Direct ActionResult
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
  halfDuplexUrl: 'http://localhost:3000/duplex', // Used for bidirectional streaming
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

### File Uploads

File uploads are supported across all transports:

```typescript
// Client: Upload files
const result = await client.fetchActions.uploadImage({
  title: 'My Image',
}, {
  files: [imageFile], // File or File[] array
})

// Server: Receive files
const uploadImage = action(
  m.object({ title: m.string() }),
  async ({ params, files }) => {
    const imageFile = files?.get('file') // Access uploaded file
    // Process file...
    return { success: true }
  }
)
```

### File Downloads (Return File)

Actions and client actions can return `File` objects, which are automatically handled and streamed.

```typescript
// Server: Return a file
const getFile = action(
  m.object({ id: m.string() }),
  async ({ params }) => {
    // Read file from disk or generate it
    const fileContent = await readFileFromDisk(params.id)
    return new File([fileContent], 'document.pdf', {
      type: 'application/pdf',
    })
  }
)

// Client: Receive file
const result = await client.fetchActions.getFile({ id: '123' })
if (isSuccess(result)) {
  const file = result.data // File object (direct ActionResult)
  // Use the file (download, display, etc.)
  const url = URL.createObjectURL(file)
}
```

```typescript
// Client Action Returning File
// Server calls client, client returns file
const clientActions = defineClientActionsSchema({
  generateFile: {
    params: m.object({ data: m.string() }),
    return: m.file(), // Specify return type as file
  },
})
```

**Use Cases:**
- **Development:** Use all three transports for maximum compatibility
- **Production:** Use stream + websocket for real-time features with HTTP fallback
- **Progressive Enhancement:** Start with HTTP, upgrade to stream/websocket when available

---

## Resources

- 📚 **[API Documentation](./docs/README.md)** - Complete API reference
- 🐛 [Issue Tracker](https://github.com/samuelgja/ggtype/issues) - Report bugs or request features
- 💬 [Discussions](https://github.com/samuelgja/ggtype/discussions) - Ask questions and share ideas

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

