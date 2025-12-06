# Examples

This directory contains runnable examples demonstrating different use cases of ggtype.

## Examples

### 1. Hello World
**Location:** `1-hello-world/`

Simple example showing basic type-safe client-server communication with validation.

**Key Features:**
- Basic action definition
- Type-safe client calls
- Validation error handling
- Proxy actions for automatic type narrowing

### 2. AI Tools
**Location:** `2-ai-tools/`

Demonstrates bidirectional RPC where the server (AI) can call client actions (tools) with full validation.

**Key Features:**
- Server calling client actions
- Client action validation
- Real-world AI agent pattern
- Multiple tool definitions

### 3. Streaming
**Location:** `3-streaming/`

Shows server-to-client streaming for real-time data updates.

**Key Features:**
- Async generator streaming
- Real-time progress updates
- Live data subscriptions
- StreamActions proxy

### 4. WebSocket
**Location:** `4-websocket/`

Demonstrates bidirectional WebSocket communication with persistent connections.

**Key Features:**
- WebSocket transport
- Persistent bidirectional connections
- Server calling client actions
- Real-time chat-like communication
- startWebsocket API

### 5. Duplex
**Location:** `5-duplex/`

Shows bidirectional duplex streaming over HTTP for interactive applications.

**Key Features:**
- Duplex streaming over HTTP
- Interactive server-client communication
- Collaborative editing pattern
- startDuplex API

## Running Examples

Each example has its own README with specific instructions. Generally:

```bash
# Terminal 1: Start server
bun run examples/<example-name>/server.ts

# Terminal 2: Run client
bun run examples/<example-name>/client.ts
```

## Prerequisites

- Bun runtime
- All examples use ports 4000-4004, make sure they're available






