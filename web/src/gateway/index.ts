/**
 * Gateway module exports.
 *
 * This file provides a single entry point for importing gateway-related
 * functionality. External code should import from this file, not from
 * individual modules.
 *
 * @example
 * import { gatewayClient, DISPATCH, MESSAGE_CREATE } from './gateway';
 */

// Export the singleton gateway client instance
export { gatewayClient } from './GatewayClient'
export type { GatewayClient } from './GatewayClient'

// Export opcodes
export {
  DISPATCH,
  HEARTBEAT,
  IDENTIFY,
  READY,
  HEARTBEAT_ACK,
  type Opcode,
} from './opcodes'

// Export event names and types
export {
  MESSAGE_CREATE,
  MESSAGE_UPDATE,
  MESSAGE_DELETE,
  SERVER_CREATE,
  CHANNEL_CREATE,
  type GatewayEventName,
  type EventHandler,
  type EventHandlerMap,
} from './events'

// Export encoding utilities (typically not needed outside gateway internals)
export { encode, decode } from './encoding'

// Export gateway types
export {
  type GatewayPayload,
  type IdentifyPayload,
  type ReadyPayload,
  type Server,
  GatewayState,
} from './types'
