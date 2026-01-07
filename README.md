# ggtype

[![Build](https://github.com/samuelgja/ggtype/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/samuelgja/ggtype/actions/workflows/build.yml) [![Code Quality Check](https://github.com/samuelgja/ggtype/actions/workflows/code-check.yml/badge.svg?branch=main)](https://github.com/samuelgja/ggtype/actions/workflows/code-check.yml)
[![Build Size](https://img.shields.io/bundlephobia/minzip/ggtype?label=Bundle%20size)](https://bundlephobia.com/result?p=ggtype)

> **Type-safe bidirectional RPC with automatic validation and full TypeScript inference.**

ggtype is a high-performance TypeScript library for building type-safe communication between client and server. Define your API once, get automatic runtime validation, full type inference, and bidirectional RPC—all with zero code generation.

---

## What problem does this solve?

- **Type safety without duplication** — No need to maintain separate types for client and server. Define once, use everywhere with full inference.
- **Runtime validation that matches your types** — Automatic validation using AJV ensures your runtime data matches your TypeScript types.
- **Bidirectional RPC with validation** — Server can call client actions (and vice versa) with full type safety and validation on both sides.

---

## When should I use ggtype?

✅ **Use ggtype when:**
- You're building a full-stack TypeScript application
- You want type-safe API calls without code generation
- You need bidirectional communication (server calling client)
- You want automatic runtime validation

---

## Features

- 🎯 **Full TypeScript inference** — Types flow automatically from server to client, no manual type definitions
- ✅ **Automatic validation** — Runtime validation using AJV ensures data matches your types
- 🔄 **Bidirectional RPC** — Server can call client actions with full type safety and validation
- 📡 **Multiple transports** — HTTP, streaming, WebSocket, and half-duplex—use what fits your needs
- 🚀 **High performance** — Fast validation, parallel execution, efficient streaming
- 🎨 **Zero boilerplate** — Simple API, works with any server framework
- 📁 **File support** — Built-in file upload/download across all transports
- 🛡️ **Type-safe errors** — Validation errors with detailed messages and type guards

---

## Quick Start

### 1. Install

```bash
bun add ggtype
# or
npm install ggtype
# or
yarn add ggtype
```

### 2. Define your server

```typescript
// server.ts
import { action, createRouter, m } from 'ggtype'

// Define an action with validation
const getUser = action(
  m.object({ id: m.string() }),
  async ({ params }) => {
    return { 
      id: params.id, 
      name: 'John Doe', 
      email: 'john@example.com' 
    }
  }
)

// Create router
const router = createRouter({
  serverActions: { getUser },
})

export type Router = typeof router

// Use with any server
Bun.serve({
  port: 3000,
  async fetch(request) {
    return router.onRequest({ request, ctx: {} })
  },
})
```

### 3. Use in your client

```typescript
// client.ts
import { createRouterClient, isSuccess } from 'ggtype'
import type { Router } from './server' // Type-only import

const client = createRouterClient<Router>({
  httpURL: 'http://localhost:3000',
})

// Call with full type safety
const result = await client.fetchActions.getUser({ id: '1' })

if (isSuccess(result)) {
  console.log('User:', result.data) // Fully typed!
} else {
  console.error('Error:', result.error?.message)
}
```

**That's it!** You get automatic validation, full TypeScript types, and a simple API.

---

## Examples

For complete, runnable examples, see the [`examples/`](./examples/) folder:

- **[Hello World](./examples/1-hello-world/)** — Basic type-safe communication
- **[AI Tools](./examples/2-ai-tools/)** — Bidirectional RPC (server calls client)
- **[Streaming](./examples/3-streaming/)** — Real-time streaming updates
- **[WebSocket](./examples/4-websocket/)** — Persistent bidirectional connections
- **[Duplex](./examples/5-duplex/)** — Interactive bidirectional streaming

---

## Core Concepts

### Actions

Actions are type-safe functions with automatic validation:

```typescript
const createUser = action(
  m.object({
    name: m.string(),
    email: m.string().isEmail(),
    age: m.number().min(18),
  }),
  async ({ params }) => {
    // params is fully typed and validated
    return { id: '123', ...params }
  }
)
```

### Routers

Routers organize your actions and enable bidirectional RPC:

```typescript
const router = createRouter({
  serverActions: { getUser, createUser },
  clientActions: { /* optional */ },
})
```

### Clients

Clients provide type-safe access to your server actions:

```typescript
const client = createRouterClient<Router>({
  httpURL: 'http://localhost:3000',
})

// Use proxy methods for automatic type narrowing
const result = await client.fetchActions.getUser({ id: '1' })
```

---

## Streaming

Return streams from actions for real-time data:

```typescript
// server.ts
const searchUsers = action(
  m.object({ query: m.string() }),
  async function* ({ params }) {
    // Yield results as they become available
    yield { id: '1', name: 'John', query: params.query }
    yield { id: '2', name: 'Jane', query: params.query }
  }
)

// client.ts
const stream = client.streamActions.searchUsers({ query: 'john' })

for await (const result of stream) {
  if (isSuccess(result)) {
    console.log('User:', result.data)
  }
}
```

---

## Bidirectional RPC

**The killer feature:** Server can call client actions with full type safety and validation.

```typescript
// server.ts
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({ message: m.string() }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

type ClientActions = typeof clientActions

const updateUser = action(
  m.object({ id: m.string(), name: m.string() }),
  async ({ params, clientActions }) => {
    // Call client action with type safety
    const { showNotification } = clientActions<ClientActions>()
    const result = await showNotification?.({
      message: `User ${params.id} updated!`,
    })
    
    // Client response is validated automatically!
    if (result?.status === 'ok') {
      console.log('Acknowledged:', result.data.acknowledged)
    }
    
    return { success: true }
  }
)

const router = createRouter({
  serverActions: { updateUser },
  clientActions, // Enable bidirectional RPC
})
```

```typescript
// client.ts
const client = createRouterClient<Router>({
  streamURL: 'http://localhost:3000', // Use stream/websocket for bidirectional
  defineClientActions: {
    showNotification: async (params) => {
      // params is validated automatically
      alert(params.message)
      // Return value is validated against schema
      return { acknowledged: true }
    },
  },
})
```

**Key benefits:**
- ✅ Full type safety on both sides
- ✅ Client responses are validated automatically
- ✅ Works with streaming, WebSocket, and duplex transports
- ✅ No manual type definitions needed

---

## Transports

ggtype supports multiple transports. Choose what fits your needs:

| Transport | Use Case | Bidirectional RPC |
|-----------|----------|-------------------|
| `httpURL` | Simple request/response (REST-like) | ❌ |
| `streamURL` | HTTP streaming, real-time updates | ✅ |
| `websocketURL` | Persistent connections, chat, games | ✅ |
| `halfDuplexUrl` | Interactive bidirectional streaming | ✅ |

**Transport selection:** When multiple URLs are provided, the client uses the first available in priority order (stream → websocket → http). No automatic downgrade.

```typescript
const client = createRouterClient<Router>({
  streamURL: 'http://localhost:3000/stream',    // Tried first
  websocketURL: 'ws://localhost:3000/ws',       // Fallback
  httpURL: 'http://localhost:3000/http',        // Last resort
})
```

### Server Integration

Works with any server framework. Just plug in `onRequest` or `onMessage`:

```typescript
// Bun
Bun.serve({
  async fetch(request) {
    return router.onRequest({ request, ctx: {} })
  },
})

// WebSocket
Bun.serve({
  websocket: {
    message(ws, message) {
      router.onWebSocketMessage({
        ws,
        message: message as Uint8Array,
        ctx: {},
      })
    },
  },
})

// Elysia, Express, etc.
app.post('/api', async (req, res) => {
  const response = await router.onRequest({
    request: req,
    ctx: {},
  })
  return response
})
```

---

## Error Handling

ggtype provides type-safe error handling:

```typescript
import { isSuccess, isValidationError } from 'ggtype'

const result = await client.fetchActions.getUser({ id: '123' })

if (isSuccess(result)) {
  // TypeScript knows result.data exists
  console.log('User:', result.data)
} else {
  // TypeScript knows result.error exists
  if (isValidationError(result.error)) {
    console.error('Validation errors:', result.error.errors)
  } else {
    console.error('Error:', result.error.message)
  }
}
```

---

## File Upload/Download

Built-in file support across all transports:

```typescript
// Server: Receive files
const uploadImage = action(
  m.object({ title: m.string() }),
  async ({ params, files }) => {
    const imageFile = files?.get('file')
    // Process file...
    return { success: true }
  }
)

// Client: Upload files
const result = await client.fetchActions.uploadImage(
  { title: 'My Image' },
  { files: [imageFile] }
)

// Server: Return files
const getFile = action(
  m.object({ id: m.string() }),
  async ({ params }) => {
    return new File([content], 'document.pdf', {
      type: 'application/pdf',
    })
  }
)

// Client: Receive files
const result = await client.fetchActions.getFile({ id: '123' })
if (isSuccess(result)) {
  const file = result.data // File object
  const url = URL.createObjectURL(file)
}
```

---

## Why ggtype vs alternatives?

### vs REST/GraphQL
- ✅ **Full type safety** — End-to-end TypeScript inference
- ✅ **Automatic validation** — Runtime validation matches your types
- ✅ **Bidirectional** — Server can call client, not just client→server
- ✅ **Less boilerplate** — No manual API definitions or code generation

### vs WebSocket libraries
- ✅ **Type-safe** — Full TypeScript inference for all messages
- ✅ **Validation** — Automatic validation on both sides
- ✅ **Multiple transports** — Not just WebSocket, choose what fits
- ✅ **Simple API** — Clean, consistent API across all transports

---

## Model System

Rich validation system with TypeScript inference:

```typescript
// Primitives
m.string(), m.number(), m.boolean(), m.date(), m.null()

// Files
m.file(), m.blob()

// Collections
m.array(model), m.object({ ... }), m.record(model)

// Unions
m.or(model1, model2), m.and(model1, model2), m.enums('a', 'b', 'c')

// Constraints
m.string().min(5).max(100).pattern(/^[A-Z]/)
m.number().min(0).max(100)
m.string().isEmail().isOptional()

// Custom validation
m.string().validate((value) => {
  if (value.length < 5) {
    return 'Must be at least 5 characters'
  }
})
```

All models are required by default. Use `.isOptional()` to make them optional.

---

## API Overview

### Router

```typescript
createRouter(options)
  - serverActions: Record<string, Action>
  - clientActions?: ClientActionsSchema
  - responseTimeout?: number

router.onRequest(options)      // HTTP requests
router.onStream(options)       // HTTP streaming
router.onWebSocketMessage(options) // WebSocket messages
```

### Client

```typescript
createRouterClient<Router>(options)
  - httpURL?: string
  - streamURL?: string
  - websocketURL?: string
  - halfDuplexUrl?: string
  - defineClientActions?: Record<string, Function>
  - defaultHeaders?: Headers

client.fetch(params, options?)        // Multiple actions
client.stream(params, options?)       // Stream multiple actions
client.fetchActions.actionName(...)   // Single action (proxy)
client.streamActions.actionName(...)  // Stream single action (proxy)
client.startWebsocket()               // WebSocket connection
client.startDuplex()                  // Duplex connection
```

### Actions

```typescript
action(model, callback)
  - callback receives: { params, ctx, clientActions, files }
  - action.run(params) - Test actions directly (clientActions is optional)

defineClientActionsSchema(schema)
```

### Utilities

```typescript
isSuccess(result)           // Type guard for success
isError(result)             // Type guard for error
isValidationError(error)    // Type guard for validation errors
ValidationError             // Error class
```

> 📚 **[Full API Documentation](./docs/README.md)** — Complete reference with detailed examples and type definitions.

---

## Advanced

### Optional Parameters

```typescript
const getUser = action(
  m.object({
    id: m.string(),
    includeEmail: m.boolean().isOptional(),
  }),
  async ({ params }) => {
    // params.includeEmail is optional
  }
)
```

### Context

Pass context to actions:

```typescript
const router = createRouter({
  serverActions: { getUser },
})

router.onRequest({
  request,
  ctx: { user: currentUser }, // Pass context
})

// In action
const getUser = action(
  m.object({ id: m.string() }),
  async ({ params, ctx }) => {
    const user = ctx?.user
    // Use context
  }
)
```

### Response Timeout

```typescript
const router = createRouter({
  serverActions: { getUser },
  responseTimeout: 30000, // 30 seconds
})
```

### Testing Actions

You can test actions directly using `action.run()`. The `clientActions` parameter is optional—if not provided, it defaults to an empty object:

```typescript
import { action, m } from 'ggtype'

const getUser = action(
  m.object({ id: m.string() }),
  async ({ params, ctx, clientActions }) => {
    // clientActions() is always available, even when not provided in tests
    const actions = clientActions()
    return { id: params.id, name: 'John' }
  }
)

// Test without clientActions (optional)
const result = await getUser.run({
  params: { id: '123' },
  ctx: { userId: 'user-1' },
  // clientActions is optional - defaults to empty object
})

// Test with custom clientActions
const resultWithClientActions = await getUser.run({
  params: { id: '123' },
  ctx: { userId: 'user-1' },
  clientActions: () => ({
    showNotification: async () => ({ status: 'ok', data: { acknowledged: true } }),
  }),
})
```

---

## Performance

- ⚡ **Fast validation** — Uses AJV (faster than Zod)
- 🚀 **Parallel execution** — Multiple actions run in parallel
- 💾 **Efficient streaming** — Minimal memory overhead
- 📦 **Lightweight** — Minimal dependencies

---

## Resources

- 📚 **[API Documentation](./docs/README.md)** — Complete API reference
- 📖 **[Examples](./examples/)** — Runnable examples for all features
- 🐛 [Issue Tracker](https://github.com/samuelgja/ggtype/issues) — Report bugs or request features
- 💬 [Discussions](https://github.com/samuelgja/ggtype/discussions) — Ask questions and share ideas

---

## License

MIT License — see [LICENSE](LICENSE) file for details.
