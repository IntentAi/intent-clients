/**
 * Gateway event name constants.
 *
 * Event names are string identifiers sent in the `t` field of Dispatch opcodes.
 * These indicate what type of event occurred (e.g., new message, channel created).
 *
 * Phase 1 implements only the core events needed for text chat.
 * Future phases will add more events (typing, presence, voice, etc.).
 */

/**
 * MESSAGE_CREATE event.
 * Dispatched when a new message is sent in a channel.
 * Payload: Message object
 */
export const MESSAGE_CREATE = 'MESSAGE_CREATE'

/**
 * MESSAGE_UPDATE event.
 * Dispatched when a message is edited.
 * Payload: Message object (with edited_at field)
 */
export const MESSAGE_UPDATE = 'MESSAGE_UPDATE'

/**
 * MESSAGE_DELETE event.
 * Dispatched when a message is deleted.
 * Payload: {id: string, channel_id: string}
 */
export const MESSAGE_DELETE = 'MESSAGE_DELETE'

/**
 * SERVER_CREATE event.
 * Dispatched when the user joins or creates a new server.
 * Payload: Server object
 */
export const SERVER_CREATE = 'SERVER_CREATE'

/**
 * CHANNEL_CREATE event.
 * Dispatched when a new channel is created in a server.
 * Payload: Channel object
 */
export const CHANNEL_CREATE = 'CHANNEL_CREATE'

/**
 * Type-safe event name type.
 * Use this to ensure type safety when registering event handlers.
 */
export type GatewayEventName =
  | typeof MESSAGE_CREATE
  | typeof MESSAGE_UPDATE
  | typeof MESSAGE_DELETE
  | typeof SERVER_CREATE
  | typeof CHANNEL_CREATE

/**
 * Event handler function type.
 * Event handlers receive the event payload and process it.
 * Typically, handlers are registered by Zustand stores to update state.
 */
export type EventHandler<T = unknown> = (payload: T) => void

/**
 * Map of event names to their handler functions.
 * Used internally by the GatewayClient to dispatch events.
 */
export type EventHandlerMap = Map<string, Set<EventHandler>>
