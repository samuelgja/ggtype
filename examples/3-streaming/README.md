# Streaming Example

Demonstrates server-to-client streaming for real-time data updates.

## Run

```bash
# Terminal 1: Start server
bun run examples/3-streaming/server.ts

# Terminal 2: Run client
bun run examples/3-streaming/client.ts
```

## What it demonstrates

- Server-to-client streaming with async generators
- Real-time data updates
- Using streamActions proxy for automatic type narrowing
- Handling streaming results

