/**
 * Gateway payload type definitions.
 *
 * These types define the structure of messages sent over the WebSocket connection.
 * All gateway frames follow the same base structure with an opcode and data payload.
 */

import type { Opcode } from './opcodes'
import type { User } from '../types/user'

/**
 * Base gateway payload structure.
 * Every message sent or received over the gateway follows this format.
 *
 * @property op - The opcode indicating message type
 * @property d - The data payload (content varies by opcode)
 * @property t - Event type name (only present for Dispatch opcodes)
 * @property s - Sequence number (only present for Dispatch opcodes, used for resume)
 */
export interface GatewayPayload<T = unknown> {
  /** Opcode (message type identifier) */
  op: Opcode

  /** Data payload (structure depends on the opcode) */
  d?: T

  /** Event type name (only for Dispatch opcodes) */
  t?: string

  /** Sequence number (only for Dispatch opcodes) */
  s?: number
}

/**
 * Identify payload.
 * Sent by the client immediately after connecting to authenticate.
 *
 * Opcode: 2 (IDENTIFY)
 * Direction: Client -> Server
 */
export interface IdentifyPayload {
  /** JWT authentication token */
  token: string
}

/**
 * Server object (simplified for Phase 1).
 * Full server type will be defined in types/server.ts in a future issue.
 * For now, we only include the fields needed for the Ready event.
 */
export interface Server {
  /** Snowflake ID */
  id: string

  /** Server name */
  name: string

  /** Server icon URL (nullable) */
  icon_url: string | null

  /** Owner user ID */
  owner_id: string

  /** Member count */
  member_count: number
}

/**
 * Ready payload.
 * Sent by the server after successful authentication.
 * Contains initial state data and connection parameters.
 *
 * Opcode: 3 (READY)
 * Direction: Server -> Client
 */
export interface ReadyPayload {
  /** The authenticated user object */
  user: User

  /** List of servers the user belongs to */
  servers: Server[]

  /** Heartbeat interval in milliseconds */
  heartbeat_interval: number
}

/**
 * Gateway connection state.
 * Tracks the current state of the WebSocket connection.
 */
export enum GatewayState {
  /** Not connected, no connection attempt in progress */
  DISCONNECTED = 'DISCONNECTED',

  /** Connection attempt in progress */
  CONNECTING = 'CONNECTING',

  /** Connected and authenticated, ready to send/receive */
  CONNECTED = 'CONNECTED',

  /** Connection lost, attempting to reconnect */
  RECONNECTING = 'RECONNECTING',
}
