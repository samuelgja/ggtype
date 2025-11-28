[**ggtype API Documentation v0.4.5**](../README.md)

***

# Function: createTestRouter()

> **createTestRouter**\<`Actions`, `ClientActions`\>(`actions`, `clientActions`, `clientActionHandlers`, `options?`): [`TestRouter`](../interfaces/TestRouter.md)\<`Actions`\>

Defined in: [src/utils/router-test-utils.ts:89](https://github.com/samuelgja/ggtype/blob/b1d8fef813b0e18224a64a5ba529782a727460b8/src/utils/router-test-utils.ts#L89)

Creates a test router with both server and client for testing purposes.
Sets up a local server (HTTP stream or WebSocket) and a client connected to it,
allowing easy testing of router functionality without external dependencies.
The server runs on a random available port and is automatically cleaned up.

**Note**: For stream transport, we use Bun.serve to test the full HTTP integration.
While we could use in-memory streams to avoid the server, using Bun.serve ensures
we test the real integration path including HTTP request/response handling.
For WebSocket transport, Bun.serve is required.

## Type Parameters

### Actions

`Actions` *extends* `Record`\<`string`, [`ActionNotGeneric`](../type-aliases/ActionNotGeneric.md)\>

The server actions record type

### ClientActions

`ClientActions` *extends* `Record`\<`string`, `ClientAction`\>

The client actions record type

## Parameters

### actions

`Actions`

Record of server actions

### clientActions

`ClientActions`

Record of client action definitions

### clientActionHandlers

`ClientCallableActionsFromClient`\<`ClientActions`\>

Handlers for client actions

### options?

[`TestRouterOptions`](../interfaces/TestRouterOptions.md)

Optional test router configuration

## Returns

[`TestRouter`](../interfaces/TestRouter.md)\<`Actions`\>

A test router with actions and cleanup function
