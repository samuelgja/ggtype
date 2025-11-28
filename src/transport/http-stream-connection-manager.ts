import type { RouterMessage } from '../router/router-message'
import {
  HttpStreamTransport,
  type Transport,
} from './http-stream-transport'

interface ConnectionState {
  readTransport: HttpStreamTransport
  writeTransport: HttpStreamTransport
  readable: ReadableStream<Uint8Array>
  writable: WritableStream<Uint8Array>
  isClosing: boolean
  pendingRequests: Set<string>
  reconnectAttempts: number
  reconnectTimer: ReturnType<typeof setTimeout> | null
  messageProcessingPromise: Promise<void> | null
}

const MAX_RECONNECT_ATTEMPTS = 5
const INITIAL_RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 30_000

type ProcessClientData = (message: RouterMessage) => void

/**
 * Manages a persistent HTTP stream connection for router client communication.
 * Handles connection lifecycle, reconnection logic, and message routing.
 * Creates connections lazily on first use and keeps them alive for reuse.
 * @group Utils
 * @internal
 */
export class HttpStreamConnectionManager {
  private connectionState: ConnectionState | null = null
  private readonly url: string | URL
  private readonly responseTimeout: number
  private readonly onError?: (error: Error) => void
  private processClientData: ProcessClientData | null = null
  private reconnectDelay = INITIAL_RECONNECT_DELAY

  constructor(
    url: string | URL,
    responseTimeout: number,
    onError?: (error: Error) => void,
  ) {
    this.url = url
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
   * Gets or creates an HTTP stream connection.
   * Returns the write transport if connection is ready, or null if connection failed.
   * @returns The write transport instance or null if connection failed
   */
  async getConnection(): Promise<Transport | null> {
    // If we have an active connection, return it
    if (
      this.connectionState &&
      !this.connectionState.isClosing
    ) {
      return this.connectionState.writeTransport
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
      await Promise.all([
        this.connectionState.readTransport
          .close()
          .catch(() => {
            // Ignore close errors
          }),
        this.connectionState.writeTransport
          .close()
          .catch(() => {
            // Ignore close errors
          }),
      ])
      this.cleanupConnection()
    }
  }

  private async createConnection(): Promise<Transport | null> {
    try {
      const { readable, writable } = new TransformStream<
        Uint8Array,
        Uint8Array
      >()
      const writeTransport = new HttpStreamTransport(
        null,
        writable,
      )

      const responsePromise = fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: readable,
        duplex: 'half',
      } as RequestInit)

      // Wait for response with timeout
      const timeoutPromise = new Promise<never>(
        (_, reject) => {
          setTimeout(() => {
            reject(
              new Error('HTTP stream connection timeout'),
            )
          }, this.responseTimeout)
        },
      )

      const response = await Promise.race([
        responsePromise,
        timeoutPromise,
      ])

      if (!response.ok || !response.body) {
        throw new Error(
          `HTTP request failed: ${response.status} ${response.statusText}`,
        )
      }

      const readTransport = new HttpStreamTransport(
        response.body,
        null,
      )

      this.connectionState = {
        readTransport,
        writeTransport,
        readable,
        writable,
        isClosing: false,
        pendingRequests: new Set(),
        reconnectAttempts: 0,
        reconnectTimer: null,
        messageProcessingPromise: null,
      }

      // Start message processing loop
      this.connectionState.messageProcessingPromise =
        this.processMessages()

      // Reset reconnect delay on successful connection
      this.reconnectDelay = INITIAL_RECONNECT_DELAY

      return writeTransport
    } catch (error) {
      this.onError?.(
        error instanceof Error
          ? error
          : new Error('HTTP stream connection failed'),
      )
      return null
    }
  }

  private async processMessages(): Promise<void> {
    if (!this.connectionState) return

    try {
      while (!this.connectionState.isClosing) {
        const message =
          await this.connectionState.readTransport.read()
        if (message === null) {
          // Stream closed
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
            : new Error('HTTP stream message error'),
        )
        this.handleConnectionClosed()
      }
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
