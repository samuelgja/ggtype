**ggtype API Documentation v0.4.5**

***

# ggtype

[![Build](https://github.com/samuelgja/ggtype/actions/workflows/build.yml/badge.svg)](https://github.com/samuelgja/ggtype/actions/workflows/build.yml) [![Code Quality Check](https://github.com/samuelgja/ggtype/actions/workflows/code-check.yml/badge.svg)](https://github.com/samuelgja/ggtype/actions/workflows/code-check.yml)
[![Build Size](https://img.shields.io/bundlephobia/minzip/ggtype?label=Bundle%20size)](https://bundlephobia.com/result?p=ggtype)

🚀 **ggtype** is a high-performance TypeScript library designed to make data validation and type-safe client-server communication both simple and efficient. Inspired by popular libraries like tRPC and Zod, ggtype offers a streamlined API that is easy to use, yet powerful enough to handle complex business logic.

## Features

- ✅ **Type-Safe Data Validation** - Define models with automatic TypeScript type inference
- ✅ **Action-Based Architecture** - Create validated actions that work with your models
- ✅ **Bidirectional RPC** - Full client-server communication with server calling client actions
- ✅ **Streaming Support** - Built-in support for streaming responses with async generators
- ✅ **Multiple Transports** - Support for HTTP, HTTP Stream, and WebSocket transports
- ✅ **High Performance** - Uses AJV for fast validation, significantly faster than Zod
- ✅ **Error Handling** - Comprehensive error handling with validation and custom errors
- ✅ **Lightweight** - Minimal dependencies, focused on performance

## Installation

```bash
# Using Bun (recommended)
bun add ggtype

# Using npm
npm install ggtype

# Using yarn
yarn add ggtype
```

## How It Works

ggtype provides a type-safe, action-based architecture for building client-server applications:

1. **Models** - Define data structures with validation rules and get automatic TypeScript types
2. **Actions** - Create validated functions that automatically validate input parameters
3. **Router** - Set up type-safe communication between client and server
4. **Client** - Call server actions with full type safety and handle bidirectional communication

The library uses **AJV** for fast JSON Schema validation, **async generators** for streaming, and supports multiple transport protocols (HTTP, HTTP Stream, WebSocket) for different use cases.

## Quick Start

### 1. Define Models

Models define the structure and validation rules for your data. They automatically generate TypeScript types and validate data at runtime:

```typescript
import { m } from 'ggtype'

// User model with clear variable name
const userParams = m.object({
  id: m.string().isRequired(),
  name: m.string().isRequired(),
  email: m.string().isEmail().isRequired(),
  age: m.number().minimum(0).maximum(120),
  tags: m.array(m.string()),
})

// Post model with nested user
const postParams = m.object({
  id: m.string().isRequired(),
  title: m.string().isRequired(),
  content: m.string(),
  authorId: m.string().isRequired(),
  publishedAt: m.date(),
})

// Simple ID parameter model
const idParams = m.object({
  id: m.string().isRequired(),
})
```

### 2. Create Actions

Actions are validated functions that automatically validate input parameters before execution. They can access context (like user sessions) and call client actions for bidirectional communication:

```typescript
import { action } from 'ggtype'

// Create user action with descriptive parameter model
const createUser = action(userParams, async ({ params }) => {
  // params is fully typed and validated
  console.log(`Creating user: ${params.name} (${params.email})`)
  
  // Your business logic here
  return {
    id: params.id,
    name: params.name,
    email: params.email,
    createdAt: new Date(),
  }
})

// Get user action with simple ID parameter
const getUser = action(idParams, async ({ params }) => {
  // Fetch user logic
  return { 
    id: params.id, 
    name: 'John Doe',
    email: 'john@example.com'
  }
})

// Delete user action
const deleteUser = action(idParams, async ({ params }) => {
  // Delete logic
  return { success: true, deletedId: params.id }
})
```

### 3. Set Up Server with Router

The router manages type-safe communication between client and server. It handles:
- Validating incoming requests
- Executing actions with context
- Managing bidirectional RPC (server calling client actions)
- Streaming responses
- Error handling

Here are examples for different frameworks:

#### Bun Server Example

```typescript
import { createRouter, defineClientActionsSchema, m } from 'ggtype'

// Define all your server actions
const serverActions = {
  createUser,
  getUser,
  deleteUser,
}

// Define client actions schema (called by server)
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({
      message: m.string().isRequired(),
      type: m.string().isRequired(),
    }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

// Create router
const router = createRouter({
  serverActions: serverActions,
  clientActions,
  transport: 'http', // Options: 'http', 'stream', or 'websocket'
  responseTimeout: 60000,
})

// Use with Bun server
Bun.serve({
  port: 3000,
  async fetch(request) {
    // Extract user from request (example)
    const authHeader = request.headers.get('authorization')
    const user = authHeader ? { id: 'user-123', name: 'John' } : null
    
    return router.onRequest({ 
      request, 
      ctx: { user } // Optional context passed to actions
    })
  },
})
```

#### Elysia Server Example

```typescript
import { Elysia } from 'elysia'
import { createRouter, defineClientActionsSchema, m } from 'ggtype'

// Define all your server actions
const serverActions = {
  createUser,
  getUser,
  deleteUser,
}

// Define client actions schema (called by server)
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({ 
      message: m.string().isRequired(),
      type: m.string().isRequired(),
    }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

// Create router
const router = createRouter({
  serverActions: serverActions,
  clientActions,
  transport: 'http',
  responseTimeout: 60000,
})

// Create Elysia app
const app = new Elysia()

// Add router endpoint
app.post('/api', async ({ request, set }) => {
  // Extract user from request (example)
  const authHeader = request.headers.get('authorization')
  const user = authHeader ? { id: 'user-123', name: 'John' } : null
  
  // Convert Elysia request to standard Request
  const response = await router.onRequest({
    request: new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    }),
    ctx: { user }, // Optional context passed to actions
  })
  
  // Set status code if needed
  set.status = response.status
  
  return response
})

// Start server
app.listen(3000)
console.log('Server running on http://localhost:3000')
```

### 4. Set Up Client

```typescript
import { createRouterClient } from 'ggtype'

// Define client action handlers (called by server)
// These handlers match the client actions defined on the server
const clientActionHandlers = {
  showNotification: async (params) => {
    // Handle notification from server
    alert(params.message)
    return { acknowledged: true }
  },
}

// Create client
const client = createRouterClient({
  url: 'http://localhost:3000',
  transport: 'http', // Must match server transport
  defineClientActions: clientActionHandlers,
})

// Call server actions using stream() - returns AsyncStream for incremental results
const stream = await client.stream({
  createUser: { 
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    tags: ['developer', 'typescript']
  },
  getUser: { id: '2' },
})

// Consume results as they arrive
for await (const result of stream) {
  if (result.createUser?.status === 'ok') {
    console.log('User created:', result.createUser.data)
  }
  if (result.getUser?.status === 'ok') {
    console.log('User fetched:', result.getUser.data)
  }
}

// Alternatively, use fetch() to wait for all results at once
const results = await client.fetch({
  createUser: { 
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  getUser: { id: '2' },
})

// Results are already complete
if (results.createUser?.status === 'ok') {
  console.log('User created:', results.createUser.data)
}
if (results.getUser?.status === 'ok') {
  console.log('User fetched:', results.getUser.data)
}
```

### Client Usage Pattern

**Important**: Create the client instance **once** and reuse it. Each `stream()` or `fetch()` call creates a new request/stream connection.

**Two Methods for Calling Actions:**
- `client.stream()` - Returns an `AsyncStream` that yields results incrementally as they arrive. Use this when you want to process results as they come in (e.g., for streaming data or real-time updates).
- `client.fetch()` - Returns a `Promise` that resolves with the final result state after all actions complete. Use this when you want to wait for all results before processing (simpler API, similar to traditional fetch).

```typescript
// ✅ Create client ONCE (at app startup or module level)
const client = createRouterClient({
  url: 'http://localhost:3000',
  transport: 'stream',
  defineClientActions: {
    showNotification: async (params) => {
      alert(params.message)
      return { acknowledged: true }
    },
  },
})

// ✅ Call stream() multiple times - each creates a new request/stream
const stream1 = await client.stream({
  getUser: { id: '1' },
  createUser: { id: '2', name: 'John' },
})

// Consume first stream
for await (const result of stream1) {
  if (result.getUser?.status === 'ok') {
    console.log('User:', result.getUser.data)
  }
  if (result.createUser?.status === 'ok') {
    console.log('Created:', result.createUser.data)
  }
}

// ✅ Call stream() again - creates a new request/stream
const stream2 = await client.stream({
  getUser: { id: '3' },
})

// Consume second stream
for await (const result of stream2) {
  if (result.getUser?.status === 'ok') {
    console.log('User:', result.getUser.data)
  }
}
```

#### How Each Transport Handles Multiple Requests

- **HTTP Transport** (`'http'`): Each `stream()` or `fetch()` creates a new HTTP POST request (like REST API calls). The environment (Bun, browser) manages TCP connection pooling automatically.

- **Stream Transport** (`'stream'`): Uses a persistent HTTP stream connection per client. The connection is created lazily on the first `stream()` or `fetch()` call and kept alive for subsequent requests. The connection automatically reconnects if it closes unexpectedly (with exponential backoff, up to 5 attempts).

- **WebSocket Transport** (`'websocket'`): Uses one persistent WebSocket connection per client. The connection is created lazily on the first `stream()` or `fetch()` call and kept alive for all subsequent requests. The connection automatically reconnects if it closes unexpectedly (with exponential backoff, up to 5 attempts).

#### Complete Example: Reusing Client

```typescript
import { createRouterClient } from 'ggtype'

// Create client once (at app startup)
const client = createRouterClient({
  url: 'http://localhost:3000',
  transport: 'stream',
  defineClientActions: {
    showNotification: async (params) => {
      alert(params.message)
      return { acknowledged: true }
    },
  },
})

// Helper function using stream() - processes results as they arrive
async function fetchUserStream(userId: string) {
  const stream = await client.stream({
    getUser: { id: userId },
  })
  
  for await (const result of stream) {
    if (result.getUser?.status === 'ok') {
      return result.getUser.data
    }
    if (result.getUser?.status === 'error') {
      throw new Error(result.getUser.error.message)
    }
  }
}

// Helper function using fetch() - waits for final result
async function fetchUser(userId: string) {
  const results = await client.fetch({
    getUser: { id: userId },
  })
  
  if (results.getUser?.status === 'ok') {
    return results.getUser.data
  }
  if (results.getUser?.status === 'error') {
    throw new Error(results.getUser.error.message)
  }
}

// Use the same client instance multiple times
const user1 = await fetchUser('1')
const user2 = await fetchUser('2')
const user3 = await fetchUser('3')
```

**Summary**: Create the client instance once and reuse it throughout your application. For HTTP transport, each `stream()` or `fetch()` call creates a new POST request. For Stream and WebSocket transports, the connection is created lazily on first use and kept alive for all subsequent requests, with automatic reconnection on failure. Use `stream()` for incremental results, or `fetch()` to wait for all results at once.

## Core Concepts

### Models

Models define data structures with validation. Always use descriptive variable names:

#### Basic Types

```typescript
const stringModel = m.string()        // String with optional constraints
const numberModel = m.number()        // Number with min/max/positive/negative
const booleanModel = m.boolean()      // Boolean
const dateModel = m.date()            // Date
const fileModel = m.file()            // File
const blobModel = m.blob()            // Blob
```

#### Complex Types

```typescript
// Object model with clear name
const userParams = m.object({
  name: m.string().isRequired(),
  age: m.number(),
})

// Array model
const tagsParams = m.array(m.string())  // Array of strings
const usersParams = m.array(userParams) // Array of user objects

// Record (dictionary) model
const metadataParams = m.record(m.string())  // Record<string, string>

// Union model
const idOrNameParams = m.or(m.string(), m.number())  // string | number

// Intersection model
const userWithRoleParams = m.and(
  userParams, 
  m.object({ role: m.string() })
)

// Enum model
const roleParams = m.enums('admin', 'user', 'guest')
```

#### Model Constraints

```typescript
// String constraints
const emailParams = m.string()
  .minLength(3)
  .maxLength(100)
  .regex(/^[A-Z]/)
  .isEmail()
  .isPassword()
  .isRequired()

// Number constraints
const ageParams = m.number()
  .minimum(0)
  .maximum(100)
  .positive()
  .negative()
  .isRequired()

// Array constraints
const tagsParams = m.array(m.string())
  .minItems(1)
  .maxItems(10)
  .isRequired()
```

### Actions

Actions are validated functions that receive typed parameters. Use descriptive parameter model names:

```typescript
// Define parameter model with clear name
const createUserParams = m.object({ 
  id: m.string().isRequired(),
  name: m.string().isRequired(),
  email: m.string().isEmail().isRequired(),
})

// Create action with the parameter model
const createUser = action(createUserParams, async ({ params, ctx, getClientActions }) => {
  // params - validated and typed input
  // ctx - optional context (user, session, etc.)
  // getClientActions - call client actions from server
  
  return { 
    id: params.id,
    name: params.name,
    email: params.email,
  }
})
```

#### Action Context

Actions can receive context and call client actions:

```typescript
// Define parameter model
const updateUserParams = m.object({ 
  userId: m.string().isRequired(),
  name: m.string(),
})

// Action with context and client actions
const updateUser = action(updateUserParams, async ({ params, ctx, getClientActions }) => {
  // Access context
  const currentUser = ctx?.user
  
  // Call client actions (bidirectional RPC)
  const clientActions = getClientActions?.()
  if (clientActions) {
    const result = await clientActions.showNotification({
      message: 'User updated successfully!',
      type: 'success'
    })
  }
  
  return { success: true, userId: params.userId }
})
```

### Router

The router enables type-safe client-server communication with multiple transport options.

#### Transport Types

**HTTP Transport** (`'http'`) - Simple request/response, like REST API:
- Single JSON request and response
- No streaming support
- Client actions are ignored
- Best for simple CRUD operations

**HTTP Stream Transport** (`'stream'`) - Bidirectional streaming:
- Multiple messages over single connection
- Full bidirectional RPC support
- Streaming responses
- Best for real-time applications

**WebSocket Transport** (`'websocket'`) - WebSocket connection:
- Persistent connection
- Full bidirectional RPC support
- Streaming responses
- Best for chat, games, real-time collaboration

#### Server Setup Examples

**HTTP Transport with Bun:**

```typescript
const router = createRouter({
  serverActions: serverActions,
  clientActions,
  transport: 'http',
})

Bun.serve({
  port: 3000,
  async fetch(request) {
    // Extract context from request
    const user = extractUserFromRequest(request)
    
    return router.onRequest({ 
      request, 
      ctx: { user } 
    })
  },
})
```

**HTTP Transport with Elysia:**

```typescript
import { Elysia } from 'elysia'

const router = createRouter({
  serverActions: serverActions,
  clientActions,
  transport: 'http',
})

const app = new Elysia()

app.post('/api', async ({ request }) => {
  const user = extractUserFromRequest(request)
  
  const response = await router.onRequest({
    request: new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    }),
    ctx: { user },
  })
  
  return response
})

app.listen(3000)
```

**HTTP Stream Transport with Bun:**

```typescript
const router = createRouter({
  serverActions: serverActions,
  clientActions,
  transport: 'stream',
})

Bun.serve({
  port: 3000,
  async fetch(request) {
    const user = extractUserFromRequest(request)
    
    return router.onRequest({ 
      request, 
      ctx: { user } 
    })
  },
})
```

**HTTP Stream Transport with Elysia:**

```typescript
import { Elysia } from 'elysia'

const router = createRouter({
  serverActions: serverActions,
  clientActions,
  transport: 'stream',
})

const app = new Elysia()

app.post('/api', async ({ request }) => {
  const user = extractUserFromRequest(request)
  
  const response = await router.onRequest({
    request: new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    }),
    ctx: { user },
  })
  
  return response
})

app.listen(3000)
```

**WebSocket Transport with Bun:**

```typescript
const router = createRouter({
  serverActions: serverActions,
  clientActions,
  transport: 'websocket',
})

Bun.serve({
  port: 3000,
  fetch(request, server) {
    if (router.onWebSocketMessage && server.upgrade(request)) {
      return
    }
    return new Response('Upgrade failed', { status: 500 })
  },
  websocket: {
    open(ws) {
      // Connection opened
      console.log('WebSocket connected')
    },
    message(ws, message) {
      const user = extractUserFromWebSocket(ws)
      
      router.onWebSocketMessage?.({ 
        ws, 
        message, 
        ctx: { user } 
      })
    },
    close(ws) {
      // Connection closed
      console.log('WebSocket disconnected')
    },
  },
})
```

**WebSocket Transport with Elysia:**

```typescript
import { Elysia } from 'elysia'
import { websocket } from '@elysiajs/websocket'

const router = createRouter({
  serverActions: serverActions,
  clientActions,
  transport: 'websocket',
})

const app = new Elysia()
  .use(websocket())
  .ws('/ws', {
    open(ws) {
      console.log('WebSocket connected')
    },
    message(ws, message) {
      const user = extractUserFromWebSocket(ws)
      
      router.onWebSocketMessage?.({
        ws: ws.data as Bun.ServerWebSocket<unknown>,
        message,
        ctx: { user },
      })
    },
    close(ws) {
      console.log('WebSocket disconnected')
    },
  })
  .listen(3000)
```

#### Client Setup Examples

**HTTP Transport:**

```typescript
// Define client action handlers (matching server's client actions)
const clientActionHandlers = {
  showNotification: async (params) => {
    alert(params.message)
    return { acknowledged: true }
  },
}

const client = createRouterClient({
  url: 'http://localhost:3000',
  transport: 'http',
  defineClientActions: clientActionHandlers,
})

// Using stream() - returns AsyncStream
const stream = await client.stream({
  getUser: { id: '123' },
})

// HTTP transport returns single result
for await (const result of stream) {
  console.log(result.getUser?.data)
}

// Using fetch() - returns Promise with final results
const results = await client.fetch({
  getUser: { id: '123' },
})
console.log(results.getUser?.data)
```

**HTTP Stream / WebSocket Transport:**

```typescript
// Define client action handlers (matching server's client actions)
const clientActionHandlers = {
  showNotification: async (params) => {
    alert(params.message)
    return { acknowledged: true }
  },
}

const client = createRouterClient({
  url: 'http://localhost:3000', // or 'ws://localhost:3000' for WebSocket
  transport: 'stream', // or 'websocket'
  defineClientActions: clientActionHandlers,
})

// Using stream() - returns AsyncStream for incremental results
const stream = await client.stream({
  getUser: { id: '123' },
  createUser: { id: '456', name: 'Jane', email: 'jane@example.com' },
})

// Stream transport can return multiple results as they arrive
for await (const result of stream) {
  if (result.getUser?.status === 'ok') {
    console.log('User:', result.getUser.data)
  }
  if (result.createUser?.status === 'ok') {
    console.log('Created:', result.createUser.data)
  }
}

// Using fetch() - waits for all results
const results = await client.fetch({
  getUser: { id: '123' },
  createUser: { id: '456', name: 'Jane', email: 'jane@example.com' },
})

// All results are available at once
if (results.getUser?.status === 'ok') {
  console.log('User:', results.getUser.data)
}
if (results.createUser?.status === 'ok') {
  console.log('Created:', results.createUser.data)
}
```

### Streaming Actions

Actions can return streams for real-time data. Use async generator functions (recommended):

```typescript
// Define parameter model
const searchParams = m.object({ 
  query: m.string().isRequired() 
})

// Streaming action with async generator
const searchUsers = action(searchParams, async function* ({ params }) {
  // Yield data chunks as they become available
  yield { id: '1', name: 'John', match: true }
  yield { id: '2', name: 'Jane', match: true }
  yield { id: '3', name: 'Bob', match: false }
  // Stream ends when function completes
})

// Use stream() for streaming actions - streaming works automatically
const stream = await client.stream({
  searchUsers: { query: 'john' },
})

// Consume streaming results as they arrive
for await (const result of stream) {
  if (result.searchUsers?.status === 'ok') {
    console.log('Search result:', result.searchUsers.data)
  }
}
```

**Note:** Streaming only works with `'stream'` or `'websocket'` transports. HTTP transport (`'http'`) does not support streaming.

## Type Inference

ggtype provides excellent TypeScript support with automatic type inference:

```typescript
import type { Infer, ResultInfer, ParamsInfer } from 'ggtype'

// Infer model type
const userParams = m.object({
  id: m.string().isRequired(),
  name: m.string().isRequired(),
})
type User = Infer<typeof userParams>
// Result: { id: string; name: string }

// Infer router result type
type Router = typeof router.infer
type UserResult = ResultInfer<Router, 'createUser'>
// Result: { status: 'ok', data: {...} } | { status: 'error', error: {...} }

// Infer router params type
type UserParams = ParamsInfer<Router, 'createUser'>
// Result: { id: string; name: string }
```

## Error Handling

ggtype provides comprehensive error handling:

```typescript
import { ValidationError, ErrorWithCode } from 'ggtype'

// Validation errors (automatic)
const result = await client.send({
  createUser: { /* invalid data */ }
})

if (result.createUser?.status === 'error') {
  if (result.createUser.error.type === 'validation') {
    console.error('Validation errors:', result.createUser.error.errors)
  } else {
    console.error('Error:', result.createUser.error.message)
  }
}

// Custom errors with status codes
const deleteUserParams = m.object({ id: m.string().isRequired() })
const deleteUser = action(deleteUserParams, async ({ params, ctx }) => {
  if (!ctx?.user) {
    throw new ErrorWithCode('Unauthorized', 401)
  }
  return { success: true }
})

// Error handling in results (using fetch() for simplicity)
const results = await client.fetch({ deleteUser: { id: '123' } })
if (results.deleteUser?.status === 'error') {
  console.error('Error code:', results.deleteUser.error.code) // 401
  console.error('Error message:', results.deleteUser.error.message)
}

// Error handling with stream()
const stream = await client.stream({ deleteUser: { id: '123' } })
for await (const result of stream) {
  if (result.deleteUser?.status === 'error') {
    console.error('Error code:', result.deleteUser.error.code)
    console.error('Error message:', result.deleteUser.error.message)
  }
}
```

## Framework Integration Examples

### Complete Bun Server Example

Here's a complete example of setting up a Bun server with ggtype:

```typescript
import { action, createRouter, defineClientActionsSchema, m } from 'ggtype'

// Define parameter models
const createUserParams = m.object({
  id: m.string().isRequired(),
  name: m.string().isRequired(),
  email: m.string().isEmail().isRequired(),
})

const getUserParams = m.object({
  id: m.string().isRequired(),
})

// Define actions
const createUser = action(createUserParams, async ({ params, ctx }) => {
  console.log('Creating user:', params.name)
  // Your database logic here
  return {
    id: params.id,
    name: params.name,
    email: params.email,
    createdAt: new Date(),
  }
})

const getUser = action(getUserParams, async ({ params }) => {
  // Your database logic here
  return {
    id: params.id,
    name: 'John Doe',
    email: 'john@example.com',
  }
})

// Define server actions
const serverActions = {
  createUser,
  getUser,
}

// Define client actions schema
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({
      message: m.string().isRequired(),
      type: m.string().isRequired(),
    }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

// Create router
const router = createRouter({
  serverActions: serverActions,
  clientActions,
  transport: 'http',
})

// Helper to extract user from request
function extractUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  // Your authentication logic here
  return { id: 'user-123', name: 'John' }
}

// Start Bun server
Bun.serve({
  port: 3000,
  async fetch(request) {
    // Handle CORS if needed
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }
    
    // Extract user context
    const user = extractUserFromRequest(request)
    
    // Handle router requests
    const response = await router.onRequest({
      request,
      ctx: { user },
    })
    
    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', '*')
    
    return response
  },
})

console.log('Server running on http://localhost:3000')
```

### Complete Elysia Server Example

Here's a complete example of setting up an Elysia server with ggtype:

```typescript
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { action, createRouter, defineClientActionsSchema, m } from 'ggtype'

// Define parameter models
const createUserParams = m.object({
  id: m.string().isRequired(),
  name: m.string().isRequired(),
  email: m.string().isEmail().isRequired(),
})

const getUserParams = m.object({
  id: m.string().isRequired(),
})

// Define actions
const createUser = action(createUserParams, async ({ params, ctx }) => {
  console.log('Creating user:', params.name)
  // Your database logic here
  return {
    id: params.id,
    name: params.name,
    email: params.email,
    createdAt: new Date(),
  }
})

const getUser = action(getUserParams, async ({ params }) => {
  // Your database logic here
  return {
    id: params.id,
    name: 'John Doe',
    email: 'john@example.com',
  }
})

// Define server actions
const serverActions = {
  createUser,
  getUser,
}

// Define client actions schema
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({
      message: m.string().isRequired(),
      type: m.string().isRequired(),
    }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

// Create router
const router = createRouter({
  serverActions: serverActions,
  clientActions,
  transport: 'http',
})

// Helper to extract user from request
function extractUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  // Your authentication logic here
  return { id: 'user-123', name: 'John' }
}

// Create Elysia app
const app = new Elysia()
  .use(cors())
  .post('/api', async ({ request }) => {
    // Extract user context
    const user = extractUserFromRequest(request)
    
    // Convert Elysia request to standard Request
    const standardRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    })
    
    // Handle router request
    const response = await router.onRequest({
      request: standardRequest,
      ctx: { user },
    })
    
    return response
  })
  .listen(3000)

console.log('Server running on http://localhost:3000')
```

### WebSocket Example with Bun

```typescript
import { action, createRouter, defineClientActionsSchema, m } from 'ggtype'

// Define actions (same as above)
const serverActions = {
  createUser,
  getUser,
}

// Define client actions schema
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({
      message: m.string().isRequired(),
      type: m.string().isRequired(),
    }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

// Create router with WebSocket transport
const router = createRouter({
  serverActions: serverActions,
  clientActions,
  transport: 'websocket',
})

// Helper to extract user from WebSocket
function extractUserFromWebSocket(ws: Bun.ServerWebSocket<unknown>) {
  // Access WebSocket data or headers
  // Your authentication logic here
  return { id: 'user-123', name: 'John' }
}

Bun.serve({
  port: 3000,
  fetch(request, server) {
    // Handle WebSocket upgrade
    if (router.onWebSocketMessage && server.upgrade(request)) {
      return
    }
    return new Response('Upgrade failed', { status: 500 })
  },
  websocket: {
    open(ws) {
      console.log('WebSocket connected')
    },
    message(ws, message) {
      const user = extractUserFromWebSocket(ws)
      
      router.onWebSocketMessage?.({
        ws,
        message,
        ctx: { user },
      })
    },
    close(ws) {
      console.log('WebSocket disconnected')
    },
  },
})

console.log('WebSocket server running on ws://localhost:3000')
```

## Advanced Usage

### Custom Validation

```typescript
// Define parameter model with custom validation
const passwordParams = m.string()
  .minLength(8)
  .validate((password) => {
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain uppercase letter')
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain number')
    }
  })

const changePassword = action(
  m.object({ password: passwordParams }),
  async ({ params }) => {
    // Password is validated before reaching here
    return { success: true }
  }
)
```

### Testing

```typescript
import { createTestRouter } from 'ggtype'

// Create test router with both server and client
const testRouter = createTestRouter(
  serverActions,
  clientActions,
  clientActionHandlers,
  { transport: 'stream' }
)

// Test actions
const result = await testRouter.actions.getUser({ id: '123' })
for await (const chunk of result) {
  expect(chunk.getUser?.status).toBe('ok')
  expect(chunk.getUser?.data?.id).toBe('123')
}

// Cleanup
testRouter.cleanup()
```

## Demos & Examples

### Demo 1: Basic CRUD Operations

A complete example showing create, read, update, and delete operations:

```typescript
import { action, createRouter, createRouterClient, m } from 'ggtype'

// Define models
const userParams = m.object({
  id: m.string().isRequired(),
  name: m.string().isRequired(),
  email: m.string().isEmail().isRequired(),
})

const idParams = m.object({
  id: m.string().isRequired(),
})

// Create actions
const createUser = action(userParams, async ({ params }) => {
  // Your database logic here
  return { ...params, createdAt: new Date() }
})

const getUser = action(idParams, async ({ params }) => {
  // Fetch from database
  return { id: params.id, name: 'John Doe', email: 'john@example.com' }
})

const updateUser = action(userParams, async ({ params }) => {
  // Update in database
  return { ...params, updatedAt: new Date() }
})

const deleteUser = action(idParams, async ({ params }) => {
  // Delete from database
  return { success: true, deletedId: params.id }
})

// Server setup
const router = createRouter({
  serverActions: { createUser, getUser, updateUser, deleteUser },
  clientActions: {},
  transport: 'http',
})

Bun.serve({
  port: 3000,
  async fetch(request) {
    return router.onRequest({ request, ctx: {} })
  },
})

// Client usage
const client = createRouterClient({
  url: 'http://localhost:3000',
  transport: 'http',
  defineClientActions: {},
})

// Create user using fetch() - waits for final result
const createResults = await client.fetch({
  createUser: { id: '1', name: 'John', email: 'john@example.com' },
})
if (createResults.createUser?.status === 'ok') {
  console.log('Created:', createResults.createUser.data)
}

// Get user using stream() - processes results as they arrive
const getStream = await client.stream({
  getUser: { id: '1' },
})
for await (const result of getStream) {
  if (result.getUser?.status === 'ok') {
    console.log('User:', result.getUser.data)
  }
}
```

### Demo 2: Bidirectional RPC

Server actions calling client actions for real-time notifications:

```typescript
// Server: Define client action schema
const clientActions = defineClientActionsSchema({
  showNotification: {
    params: m.object({
      message: m.string().isRequired(),
      type: m.string().isRequired(),
    }),
    return: m.object({ acknowledged: m.boolean() }),
  },
})

// Server: Action that calls client
const updateUser = action(userParams, async ({ params, getClientActions }) => {
  // Update user in database
  const updated = { ...params, updatedAt: new Date() }
  
  // Call client action to show notification
  const clientActions = getClientActions?.()
  if (clientActions) {
    await clientActions.showNotification({
      message: 'User updated successfully!',
      type: 'success',
    })
  }
  
  return updated
})

// Client: Handle client action
const client = createRouterClient({
  url: 'http://localhost:3000',
  transport: 'stream',
  defineClientActions: {
    showNotification: async (params) => {
      // Show notification in UI
      alert(`${params.type}: ${params.message}`)
      return { acknowledged: true }
    },
  },
})

// Call server action - client will receive notification
const stream = await client.stream({
  updateUser: { id: '1', name: 'Jane', email: 'jane@example.com' },
})

// Process results
for await (const result of stream) {
  if (result.updateUser?.status === 'ok') {
    console.log('User updated:', result.updateUser.data)
  }
}
```

### Demo 3: Streaming Data

Stream large datasets or real-time updates:

```typescript
// Server: Streaming action
const searchUsers = action(
  m.object({ query: m.string().isRequired() }),
  async function* ({ params }) {
    // Simulate streaming search results
    const results = [
      { id: '1', name: 'John', match: true },
      { id: '2', name: 'Jane', match: true },
      { id: '3', name: 'Bob', match: false },
    ]
    
    for (const user of results) {
      if (user.name.toLowerCase().includes(params.query.toLowerCase())) {
        yield user
        await new Promise(resolve => setTimeout(resolve, 100)) // Simulate delay
      }
    }
  }
)

// Client: Consume stream using stream() for incremental results
const stream = await client.stream({
  searchUsers: { query: 'john' },
})

for await (const result of stream) {
  if (result.searchUsers?.status === 'ok') {
    console.log('Search result:', result.searchUsers.data)
  }
}
```

### Demo 4: Context & Authentication

Pass user context to actions for authorization:

```typescript
// Server: Action with context
const deleteUser = action(idParams, async ({ params, ctx }) => {
  const user = ctx?.user
  if (!user || user.id !== params.id) {
    throw new Error('Unauthorized')
  }
  
  // Delete user
  return { success: true }
})

// Server: Extract context from request
Bun.serve({
  port: 3000,
  async fetch(request) {
    const authHeader = request.headers.get('authorization')
    const user = authHeader ? { id: 'user-123', name: 'John' } : null
    
    return router.onRequest({
      request,
      ctx: { user }, // Pass context to actions
    })
  },
})
```

## Performance

ggtype is designed for performance:

- **Fast Validation**: Uses AJV (JSON Schema validator), which is significantly faster than Zod
- **Parallel Execution**: Multiple actions execute in parallel when called together
- **Efficient Streaming**: Optimized for large data streams with minimal memory overhead
- **Memory Management**: Automatic cleanup of completed operations and expired responses
- **Minimal Dependencies**: Only essential dependencies (AJV, fast-copy, nanoid) for validation and utilities

## API Reference

> 📚 For complete API documentation, see the [Full API Documentation](https://github.com/samuelgja/ggtype/blob/main/docs/README.md).

### Models

- `m.string()` - String model
- `m.number()` - Number model
- `m.boolean()` - Boolean model
- `m.date()` - Date model
- `m.array(model)` - Array model
- `m.object(properties)` - Object model
- `m.record(model)` - Record/dictionary model
- `m.or(...models)` - Union type
- `m.and(...models)` - Intersection type
- `m.enums(...values)` - Enum type
- `m.file()` - File model
- `m.blob()` - Blob model
- `m.nullable()` - Null model

### Actions

- `action(model, callback)` - Create an action

### Router

- `createRouter(options)` - Create router
  - `options.serverActions` - Record of server actions that can be called by clients
  - `options.clientActions` - Record of client actions that can be called by the server
  - `options.transport` - `'http'`, `'stream'`, or `'websocket'` (default: 'stream')
  - `options.responseTimeout` - Timeout in milliseconds (default: 60000)
- `createRouterClient(options)` - Create client
  - `options.url` - Server URL
  - `options.transport` - Transport type: `'http'`, `'stream'`, or `'websocket'` (must match server, default: `'stream'`)
  - `options.defineClientActions` - Client action handlers (async functions)
  - `options.responseTimeout` - Timeout in milliseconds (default: 60000)
  - `options.onError` - Optional error handler callback
  - Returns an object with:
    - `stream(params, options?)` - Returns `AsyncStream` that yields results incrementally
    - `fetch(params, options?)` - Returns `Promise` that resolves with final result state
- `defineClientActionsSchema(schema)` - Define client action schema (for server-side)
  - Used to define `params` and `return` models for client actions

### Utilities

- `createTestRouter(actions, clientActions, handlers, options?)` - Create test router
- `getCtx<T>(ctx)` - Type-safe context extraction
- `isOkResult(result)` - Type guard for success
- `isErrorResult(result)` - Type guard for error

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

`ggtype` is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

- 📚 [API Documentation](https://github.com/samuelgja/ggtype/blob/main/docs/README.md)
- 📖 [Documentation](https://github.com/samuelgja/ggtype)
- 🐛 [Issue Tracker](https://github.com/samuelgja/ggtype/issues)
- 💬 [Discussions](https://github.com/samuelgja/ggtype/discussions)

---

Made with ❤️ by the ggtype team
