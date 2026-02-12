/**
 * Gateway opcode constants.
 *
 * Opcodes are numeric identifiers that indicate the type of message being sent
 * over the WebSocket connection. The client and server use these to parse and
 * route messages.
 *
 * These values MUST match the server's opcode definitions.
 */

/**
 * Opcode 0: Dispatch
 * Server -> Client
 * The server is dispatching an event to the client.
 * Contains a `t` field with the event name and `d` field with the event payload.
 */
export const DISPATCH = 0

/**
 * Opcode 1: Heartbeat
 * Client -> Server
 * The client sends this periodically to keep the connection alive.
 * The server responds with Heartbeat ACK (opcode 11).
 */
export const HEARTBEAT = 1

/**
 * Opcode 2: Identify
 * Client -> Server
 * The client sends this immediately after connecting to authenticate.
 * Contains the JWT token in the payload.
 */
export const IDENTIFY = 2

/**
 * Opcode 3: Ready
 * Server -> Client
 * The server sends this after successful authentication.
 * Contains the user object, server list, and heartbeat interval.
 */
export const READY = 3

/**
 * Opcode 11: Heartbeat ACK
 * Server -> Client
 * The server acknowledges receipt of a heartbeat.
 */
export const HEARTBEAT_ACK = 11

/**
 * Type-safe opcode type.
 * Use this instead of plain numbers to ensure type safety.
 */
export type Opcode =
  | typeof DISPATCH
  | typeof HEARTBEAT
  | typeof IDENTIFY
  | typeof READY
  | typeof HEARTBEAT_ACK
