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

const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5
const DEFAULT_INITIAL_RECONNECT_DELAY = 1000
const DEFAULT_MAX_RECONNECT_DELAY = 30_000

type ProcessClientData = (message: RouterMessage) => void

/**
 * Manages a persistent WebSocket connection for router client communication.
 * Handles connection lifecycle, reconnection logic, and message routing.
 * Creates connections lazily on first use and keeps them alive for reuse.
 * @group Utils
 * @internal
 */
export class WebSocketConnectionManager {
  private connectionState: ConnectionState | null = null
  private readonly url: string
  private readonly connectionTimeout: number
  private readonly onError?: (error: Error) => void
  private processClientData: ProcessClientData | null = null
  private readonly maxReconnectAttempts: number
  private readonly initialReconnectDelay: number
  private readonly maxReconnectDelay: number
  private reconnectDelay: number
  // Track in-flight connection attempts to prevent concurrent creation
  private pendingConnectionPromise: Promise<Transport | null> | null =
    null

  constructor(
    url: string | URL,
    responseTimeout: number,
    onError?: (error: Error) => void,
    maxReconnectAttempts: number = DEFAULT_MAX_RECONNECT_ATTEMPTS,
    initialReconnectDelay: number = DEFAULT_INITIAL_RECONNECT_DELAY,
    maxReconnectDelay: number = DEFAULT_MAX_RECONNECT_DELAY,
    connectionTimeout?: number,
  ) {
    const urlString =
      typeof url === 'string' ? url : url.toString()
    this.url = urlString.replace(/^http/, 'ws')
    this.connectionTimeout =
      connectionTimeout ?? responseTimeout
    this.onError = onError
    this.maxReconnectAttempts = maxReconnectAttempts
    this.initialReconnectDelay = initialReconnectDelay
    this.maxReconnectDelay = maxReconnectDelay
    this.reconnectDelay = initialReconnectDelay
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
   * Prevents concurrent connection attempts by reusing in-flight connection promises.
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

    // If there's already a connection attempt in progress, wait for it
    if (this.pendingConnectionPromise) {
      return this.pendingConnectionPromise
    }

    // Create new connection and track the promise
    this.pendingConnectionPromise = this.createConnection()
    try {
      const result = await this.pendingConnectionPromise
      return result
    } finally {
      // Clear the pending promise after completion
      this.pendingConnectionPromise = null
    }
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
    // Clear pending connection promise to prevent new connections
    this.pendingConnectionPromise = null
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
        }, this.connectionTimeout)

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
      this.reconnectDelay = this.initialReconnectDelay

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
      reconnectAttempts < this.maxReconnectAttempts
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
      this.maxReconnectDelay,
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
            this.reconnectDelay = this.initialReconnectDelay
          } else if (this.connectionState) {
            // Reconnection failed - schedule another attempt if we haven't exceeded max
            if (
              this.connectionState.reconnectAttempts <
              this.maxReconnectAttempts
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
              this.maxReconnectAttempts
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
    // Clear any pending connection promise to allow new connection attempts
    this.pendingConnectionPromise = null
  }
}
