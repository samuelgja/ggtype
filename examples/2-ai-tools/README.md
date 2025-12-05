# AI Tools Example

Demonstrates bidirectional RPC where the server (AI) can call client actions (tools) with full type safety and validation.

## Run

```bash
# Terminal 1: Start server
bun run examples/2-ai-tools/server.ts

# Terminal 2: Run client
bun run examples/2-ai-tools/client.ts
```

## What it demonstrates

- Bidirectional RPC: Server calling client actions
- Client action validation: Client responses are validated
- Type safety on both sides
- Real-world AI agent pattern where server requests tools from client
