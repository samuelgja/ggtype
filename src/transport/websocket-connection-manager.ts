import type { RouterMessage } from '../router/router-message'
import { WebSocketTransport } from './websocket-transport'
import type { Transport } from './http-stream-transport'

const WebSocketOpen = 1

interface ConnectionState {
  transport: WebSocketTransport
  ws: WebSocket
  isClosing: boolean
  pendingRequests: Set<string>
  reconnectAttempts: number
  reconnectTimer: ReturnType<typeof setTimeout> | null
}

const MAX_RECONNECT_ATTEMPTS = 5
const INITIAL_RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 30_000

type ProcessClientData = (message: RouterMessage) => void

/**
 * Manages a persistent WebSocket connection for router client communication.
 * Handles connection lifecycle, reconnection logic, and message routing.
 * Creates connections lazily on first use and keeps them alive for reuse.
 */
export class WebSocketConnectionManager {
  private connectionState: ConnectionState | null = null
  private readonly url: string
  private readonly responseTimeout: number
  private readonly onError?: (error: Error) => void
  private processClientData: ProcessClientData | null = null
  private reconnectDelay = INITIAL_RECONNECT_DELAY

  constructor(
    url: string | URL,
    responseTimeout: number,
    onError?: (error: Error) => void,
  ) {
    const urlString =
      typeof url === 'string' ? url : url.toString()
    this.url = urlString.replace(/^http/, 'ws')
    this.responseTimeout = responseTimeout
    this.onError = onError
  }

  /**
   * Sets the message processor function that routes incoming messages.
   * This should be called before using the connection.
   * @param processor - The function to process incoming messages
   */
  setMessageProcessor(processor: ProcessClientData): void {
    this.processClientData = processor
  }

  /**
   * Gets or creates a WebSocket connection.
   * Returns the transport if connection is ready, or null if connection failed.
   * @returns The transport instance or null if connection failed
   */
  async getConnection(): Promise<Transport | null> {
    // If we have an active connection, return it
    if (
      this.connectionState &&
      !this.connectionState.isClosing
    ) {
      const { ws, transport } = this.connectionState
      if (ws.readyState === WebSocketOpen) {
        return transport
      }
      // Connection is not open, clean it up
      this.cleanupConnection()
    }

    // Create new connection
    return this.createConnection()
  }

  /**
   * Marks a request as pending on the connection.
   * Used to track active requests for connection lifecycle management.
   * @param requestId - The ID of the pending request
   */
  markRequestPending(requestId: string): void {
    if (this.connectionState) {
      this.connectionState.pendingRequests.add(requestId)
    }
  }

  /**
   * Marks a request as completed.
   * Used to track active requests for connection lifecycle management.
   * @param requestId - The ID of the completed request
   */
  markRequestCompleted(requestId: string): void {
    if (this.connectionState) {
      this.connectionState.pendingRequests.delete(requestId)
    }
  }

  /**
   * Closes the connection and cleans up resources.
   */
  async close(): Promise<void> {
    if (this.connectionState) {
      this.connectionState.isClosing = true
      if (this.connectionState.reconnectTimer) {
        clearTimeout(this.connectionState.reconnectTimer)
        this.connectionState.reconnectTimer = null
      }
      await this.connectionState.transport
        .close()
        .catch(() => {
          // Ignore close errors
        })
      this.cleanupConnection()
    }
  }

  private async createConnection(): Promise<Transport | null> {
    try {
      const ws = new WebSocket(this.url)
      ws.binaryType = 'arraybuffer'

      // Wait for connection with timeout
      await new Promise<void>((resolve, reject) => {
        if (ws.readyState === WebSocketOpen) {
          resolve()
          return
        }

        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'))
        }, this.responseTimeout)

        ws.addEventListener('open', () => {
          clearTimeout(timeout)
          resolve()
        })

        ws.addEventListener('error', (error) => {
          clearTimeout(timeout)
          reject(
            new Error('WebSocket connection error', {
              cause: error,
            }),
          )
        })
      })

      const transport = new WebSocketTransport(ws)

      // Set up message handler that routes to registered handlers
      const messageHandler = async () => {
        if (!this.connectionState) return

        try {
          while (
            !this.connectionState.isClosing &&
            !transport.isClosed
          ) {
            const message = await transport.read()
            if (message === null) {
              // Connection closed
              this.handleConnectionClosed()
              break
            }

            // Route message to processor
            if (this.processClientData) {
              this.processClientData(message)
            }
          }
        } catch (error) {
          if (!this.connectionState.isClosing) {
            this.onError?.(
              error instanceof Error
                ? error
                : new Error('WebSocket message error'),
            )
            this.handleConnectionClosed()
          }
        }
      }

      this.connectionState = {
        transport,
        ws,
        isClosing: false,
        pendingRequests: new Set(),
        reconnectAttempts: 0,
        reconnectTimer: null,
      }

      // Start message processing loop
      messageHandler().catch((error) => {
        if (!this.connectionState?.isClosing) {
          this.onError?.(
            error instanceof Error
              ? error
              : new Error('WebSocket processing error'),
          )
        }
      })

      // Set up close handler for reconnection
      ws.addEventListener('close', () => {
        if (
          this.connectionState &&
          !this.connectionState.isClosing
        ) {
          this.handleConnectionClosed()
        }
      })

      // Reset reconnect delay on successful connection
      this.reconnectDelay = INITIAL_RECONNECT_DELAY

      return transport
    } catch (error) {
      this.onError?.(
        error instanceof Error
          ? error
          : new Error('WebSocket connection failed'),
      )
      return null
    }
  }

  private handleConnectionClosed(): void {
    if (
      !this.connectionState ||
      this.connectionState.isClosing
    ) {
      return
    }

    const { pendingRequests, reconnectAttempts } =
      this.connectionState

    // If there are pending requests, try to reconnect
    if (
      pendingRequests.size > 0 &&
      reconnectAttempts < MAX_RECONNECT_ATTEMPTS
    ) {
      this.scheduleReconnect()
    } else {
      // No pending requests or max attempts reached - clean up
      this.cleanupConnection()
    }
  }

  private scheduleReconnect(): void {
    if (
      !this.connectionState ||
      this.connectionState.isClosing
    ) {
      return
    }

    if (this.connectionState.reconnectTimer) {
      clearTimeout(this.connectionState.reconnectTimer)
    }

    this.connectionState.reconnectAttempts++
    const exponentialDelay =
      this.reconnectDelay *
      2 ** (this.connectionState.reconnectAttempts - 1)
    const delay = Math.min(
      exponentialDelay,
      MAX_RECONNECT_DELAY,
    )

    this.connectionState.reconnectTimer = setTimeout(() => {
      if (
        !this.connectionState ||
        this.connectionState.isClosing
      ) {
        return
      }

      // Try to reconnect
      this.createConnection()
        .then((transport) => {
          if (transport && this.connectionState) {
            // Reconnection successful - reset attempts
            this.connectionState.reconnectAttempts = 0
            this.reconnectDelay = INITIAL_RECONNECT_DELAY
          } else if (this.connectionState) {
            // Reconnection failed - schedule another attempt if we haven't exceeded max
            if (
              this.connectionState.reconnectAttempts <
              MAX_RECONNECT_ATTEMPTS
            ) {
              this.scheduleReconnect()
            } else {
              // Max attempts reached - clean up
              this.cleanupConnection()
            }
          }
        })
        .catch(() => {
          // Reconnection failed - schedule another attempt if we haven't exceeded max
          if (
            this.connectionState &&
            this.connectionState.reconnectAttempts <
              MAX_RECONNECT_ATTEMPTS
          ) {
            this.scheduleReconnect()
          } else {
            this.cleanupConnection()
          }
        })
    }, delay)
  }

  private cleanupConnection(): void {
    if (this.connectionState) {
      if (this.connectionState.reconnectTimer) {
        clearTimeout(this.connectionState.reconnectTimer)
      }
      this.connectionState = null
    }
  }
}
