# WebSocket Example

Demonstrates bidirectional WebSocket communication with real-time updates and client action calls.

## Run

```bash
# Terminal 1: Start server
bun run examples/4-websocket/server.ts

# Terminal 2: Run client
bun run examples/4-websocket/client.ts
```

## What it demonstrates

- WebSocket transport for persistent connections
- Bidirectional RPC over WebSocket
- Server calling client actions with validation
- Real-time chat-like communication
- Using startWebsocket for bidirectional connections

