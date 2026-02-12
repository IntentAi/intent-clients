/**
 * WebSocket Gateway Client.
 *
 * This is the main WebSocket connection manager for the Intent gateway.
 * It handles:
 * - Connection lifecycle (connect, disconnect, reconnect)
 * - MessagePack binary encoding/decoding
 * - Authentication via Identify opcode
 * - Heartbeat mechanism to keep the connection alive
 * - Event dispatching to registered handlers
 * - Automatic reconnection with exponential backoff
 *
 * The GatewayClient is a singleton - one instance per application session.
 * Zustand stores register event handlers to receive real-time updates.
 */

import { encode, decode } from './encoding'
import { DISPATCH, HEARTBEAT, IDENTIFY, READY, HEARTBEAT_ACK } from './opcodes'
import {
  GatewayState,
  type GatewayPayload,
  type IdentifyPayload,
  type ReadyPayload,
} from './types'
import type { EventHandler, EventHandlerMap } from './events'
import { getAuthToken } from '../api/client'

/**
 * Gateway URL from environment.
 * Defaults to local development server.
 */
const GATEWAY_URL =
  import.meta.env.VITE_GATEWAY_URL || 'ws://localhost:8080/gateway'

/**
 * Maximum number of missed heartbeats before considering the connection dead.
 * If we don't receive a Heartbeat ACK within this many heartbeat intervals,
 * we close the connection and attempt to reconnect.
 */
const MAX_MISSED_HEARTBEATS = 3

/**
 * Reconnection backoff parameters.
 * We use exponential backoff with jitter to avoid thundering herd.
 */
const RECONNECT_DELAY_MIN = 1000 // 1 second
const RECONNECT_DELAY_MAX = 30000 // 30 seconds

/**
 * WebSocket Gateway Client.
 * Singleton class that manages the WebSocket connection to the Intent gateway.
 */
class GatewayClient {
  /** WebSocket connection instance */
  private ws: WebSocket | null = null

  /** Current connection state */
  private state: GatewayState = GatewayState.DISCONNECTED

  /** Heartbeat interval in milliseconds (received from Ready event) */
  private heartbeatInterval: number | null = null

  /** Heartbeat timer ID */
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null

  /** Timestamp of last heartbeat sent */
  private lastHeartbeatSent: number | null = null

  /** Timestamp of last heartbeat ACK received */
  private lastHeartbeatAck: number | null = null

  /** Number of consecutive missed heartbeats */
  private missedHeartbeats = 0

  /** Reconnection attempt count */
  private reconnectAttempts = 0

  /** Reconnection timer ID */
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  /** Event handlers registered by stores */
  private eventHandlers: EventHandlerMap = new Map()

  /** Whether this is a manual disconnect (if true, don't auto-reconnect) */
  private manualDisconnect = false

  /**
   * Connect to the gateway.
   * Opens a WebSocket connection and sends an Identify payload.
   * Automatically called on first connection and during reconnection.
   */
  public connect(): void {
    // Don't connect if already connected or connecting
    if (
      this.state === GatewayState.CONNECTED ||
      this.state === GatewayState.CONNECTING
    ) {
      console.warn('[Gateway] Already connected or connecting')
      return
    }

    // Get auth token
    const token = getAuthToken()
    if (!token) {
      console.error('[Gateway] Cannot connect: no auth token available')
      return
    }

    console.log('[Gateway] Connecting to', GATEWAY_URL)
    this.state = GatewayState.CONNECTING
    this.manualDisconnect = false

    try {
      // Create WebSocket connection
      this.ws = new WebSocket(GATEWAY_URL)
      this.ws.binaryType = 'arraybuffer' // Receive binary data as ArrayBuffer

      // Set up WebSocket event handlers
      this.ws.onopen = () => this.handleOpen(token)
      this.ws.onmessage = (event) => this.handleMessage(event)
      this.ws.onerror = (event) => this.handleError(event)
      this.ws.onclose = (event) => this.handleClose(event)
    } catch (error) {
      console.error('[Gateway] Failed to create WebSocket:', error)
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from the gateway.
   * Closes the WebSocket connection and stops heartbeats.
   * Does not automatically reconnect.
   */
  public disconnect(): void {
    console.log('[Gateway] Disconnecting')
    this.manualDisconnect = true
    this.stopHeartbeat()
    this.clearReconnectTimer()

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.state = GatewayState.DISCONNECTED
  }

  /**
   * Send a payload to the gateway.
   * Encodes the payload as MessagePack binary and sends it over the WebSocket.
   *
   * @param payload - The gateway payload to send
   */
  public send(payload: GatewayPayload): void {
    if (!this.ws || this.state !== GatewayState.CONNECTED) {
      console.warn('[Gateway] Cannot send: not connected')
      return
    }

    try {
      const binary = encode(payload)
      this.ws.send(binary)
    } catch (error) {
      console.error('[Gateway] Failed to encode/send payload:', error)
    }
  }

  /**
   * Register an event handler.
   * Event handlers are called when a Dispatch opcode with the matching event type is received.
   *
   * @param eventName - The event type to listen for (e.g., 'MESSAGE_CREATE')
   * @param handler - The handler function to call when the event is received
   */
  public on<T = unknown>(eventName: string, handler: EventHandler<T>): void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set())
    }
    this.eventHandlers.get(eventName)!.add(handler as EventHandler)
  }

  /**
   * Unregister an event handler.
   *
   * @param eventName - The event type to stop listening for
   * @param handler - The handler function to remove
   */
  public off<T = unknown>(eventName: string, handler: EventHandler<T>): void {
    const handlers = this.eventHandlers.get(eventName)
    if (handlers) {
      handlers.delete(handler as EventHandler)
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventName)
      }
    }
  }

  /**
   * Get the current connection state.
   */
  public getState(): GatewayState {
    return this.state
  }

  /**
   * Check if the gateway is connected and ready.
   */
  public isConnected(): boolean {
    return this.state === GatewayState.CONNECTED
  }

  /**
   * Handle WebSocket open event.
   * Sends the Identify payload to authenticate.
   */
  private handleOpen(token: string): void {
    console.log('[Gateway] WebSocket opened')

    // Send Identify opcode to authenticate
    const identifyPayload: GatewayPayload<IdentifyPayload> = {
      op: IDENTIFY,
      d: { token },
    }

    try {
      const binary = encode(identifyPayload)
      this.ws?.send(binary)
      console.log('[Gateway] Sent Identify')
    } catch (error) {
      console.error('[Gateway] Failed to send Identify:', error)
      this.ws?.close()
    }
  }

  /**
   * Handle WebSocket message event.
   * Decodes MessagePack frames and routes them based on opcode.
   */
  private handleMessage(event: MessageEvent): void {
    try {
      // Decode MessagePack binary
      const buffer = new Uint8Array(event.data as ArrayBuffer)
      const payload = decode(buffer) as GatewayPayload

      // Route based on opcode
      switch (payload.op) {
        case READY:
          this.handleReady(payload.d as ReadyPayload)
          break

        case DISPATCH:
          this.handleDispatch(payload.t!, payload.d)
          break

        case HEARTBEAT_ACK:
          this.handleHeartbeatAck()
          break

        default:
          console.warn('[Gateway] Unknown opcode:', payload.op)
      }
    } catch (error) {
      console.error('[Gateway] Failed to decode message:', error)
    }
  }

  /**
   * Handle WebSocket error event.
   */
  private handleError(event: Event): void {
    console.error('[Gateway] WebSocket error:', event)
  }

  /**
   * Handle WebSocket close event.
   * Attempts to reconnect unless this was a manual disconnect.
   */
  private handleClose(event: CloseEvent): void {
    console.log('[Gateway] WebSocket closed:', event.code, event.reason)

    this.stopHeartbeat()
    this.ws = null

    // If this was a manual disconnect, don't reconnect
    if (this.manualDisconnect) {
      this.state = GatewayState.DISCONNECTED
      return
    }

    // Otherwise, attempt to reconnect
    this.state = GatewayState.RECONNECTING
    this.scheduleReconnect()
  }

  /**
   * Handle Ready opcode.
   * Extracts heartbeat interval and starts the heartbeat loop.
   * Marks the connection as fully connected and authenticated.
   */
  private handleReady(data: ReadyPayload): void {
    console.log('[Gateway] Ready event received')
    console.log('[Gateway] User:', data.user.username)
    console.log('[Gateway] Servers:', data.servers.length)
    console.log('[Gateway] Heartbeat interval:', data.heartbeat_interval, 'ms')

    // Store heartbeat interval
    this.heartbeatInterval = data.heartbeat_interval

    // Mark connection as ready
    this.state = GatewayState.CONNECTED
    this.reconnectAttempts = 0 // Reset reconnect attempts on successful connection

    // Start heartbeat loop
    this.startHeartbeat()

    // Dispatch Ready event to any registered handlers
    // This allows stores to populate initial state from the Ready payload
    this.dispatchEvent('READY', data)
  }

  /**
   * Handle Dispatch opcode.
   * Extracts the event type and dispatches to registered handlers.
   */
  private handleDispatch(eventType: string, data: unknown): void {
    console.log('[Gateway] Dispatch event:', eventType)
    this.dispatchEvent(eventType, data)
  }

  /**
   * Handle Heartbeat ACK opcode.
   * Records the timestamp and resets the missed heartbeat counter.
   */
  private handleHeartbeatAck(): void {
    this.lastHeartbeatAck = Date.now()
    this.missedHeartbeats = 0
    console.debug('[Gateway] Heartbeat ACK received')
  }

  /**
   * Dispatch an event to all registered handlers.
   */
  private dispatchEvent(eventType: string, data: unknown): void {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data)
        } catch (error) {
          console.error(
            `[Gateway] Error in event handler for ${eventType}:`,
            error
          )
        }
      }
    }
  }

  /**
   * Start the heartbeat loop.
   * Sends a Heartbeat opcode at the interval specified by the server.
   * Tracks missed heartbeats and disconnects if too many are missed.
   */
  private startHeartbeat(): void {
    if (!this.heartbeatInterval) {
      console.warn('[Gateway] Cannot start heartbeat: no interval set')
      return
    }

    // Stop any existing heartbeat timer
    this.stopHeartbeat()

    console.log(
      '[Gateway] Starting heartbeat with interval:',
      this.heartbeatInterval,
      'ms'
    )

    // Send first heartbeat immediately
    this.sendHeartbeat()

    // Set up heartbeat interval
    this.heartbeatTimer = setInterval(() => {
      // Check if we've missed too many heartbeats
      // Compare timestamps: if we sent a heartbeat but haven't received ACK
      if (
        this.lastHeartbeatSent &&
        this.lastHeartbeatSent > (this.lastHeartbeatAck || 0)
      ) {
        this.missedHeartbeats++
        console.warn(
          '[Gateway] Missed heartbeat',
          this.missedHeartbeats,
          '/',
          MAX_MISSED_HEARTBEATS
        )

        if (this.missedHeartbeats >= MAX_MISSED_HEARTBEATS) {
          console.error(
            '[Gateway] Too many missed heartbeats, closing connection'
          )
          this.ws?.close(1000, 'Heartbeat timeout')
          return
        }
      }

      this.sendHeartbeat()
    }, this.heartbeatInterval)
  }

  /**
   * Stop the heartbeat loop.
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    this.lastHeartbeatSent = null
    this.lastHeartbeatAck = null
    this.missedHeartbeats = 0
  }

  /**
   * Send a single Heartbeat opcode.
   */
  private sendHeartbeat(): void {
    const payload: GatewayPayload = {
      op: HEARTBEAT,
      d: {},
    }

    this.send(payload)
    this.lastHeartbeatSent = Date.now()
    this.lastHeartbeatAck = null // Wait for ACK
    console.debug('[Gateway] Heartbeat sent')
  }

  /**
   * Schedule a reconnection attempt with exponential backoff.
   * Delay increases with each failed attempt: 1s, 2s, 4s, 8s, ..., max 30s.
   * Adds random jitter to avoid thundering herd.
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimer()

    // Calculate delay with exponential backoff
    const baseDelay = Math.min(
      RECONNECT_DELAY_MIN * Math.pow(2, this.reconnectAttempts),
      RECONNECT_DELAY_MAX
    )

    // Add random jitter (±25%)
    const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1)
    const delay = Math.max(baseDelay + jitter, RECONNECT_DELAY_MIN)

    console.log(
      `[Gateway] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts + 1})`
    )

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  /**
   * Clear the reconnection timer.
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

/**
 * Singleton instance of the GatewayClient.
 * Only one gateway connection should exist per application session.
 */
export const gatewayClient = new GatewayClient()

/**
 * Export the GatewayClient class for type references.
 */
export type { GatewayClient }
