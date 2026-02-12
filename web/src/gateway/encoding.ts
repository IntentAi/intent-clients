/**
 * MessagePack encoding/decoding utilities.
 *
 * The Intent gateway uses MessagePack binary encoding instead of JSON.
 * This provides smaller payloads and faster parsing compared to JSON text.
 *
 * This module wraps the @msgpack/msgpack library with a simpler API.
 */

import {
  encode as msgpackEncode,
  decode as msgpackDecode,
} from '@msgpack/msgpack'

/**
 * Encode data to MessagePack binary format.
 *
 * @param data - The data to encode (any JSON-serializable value)
 * @returns A Uint8Array containing the MessagePack-encoded data
 *
 * @example
 * const payload = {op: 1, d: {}}; // Heartbeat opcode
 * const binary = encode(payload);
 * // binary is now a Uint8Array that can be sent over WebSocket
 */
export function encode(data: unknown): Uint8Array {
  return msgpackEncode(data)
}

/**
 * Decode MessagePack binary data to a JavaScript value.
 *
 * @param buffer - The MessagePack-encoded binary data
 * @returns The decoded JavaScript value
 * @throws Error if the data cannot be decoded
 *
 * @example
 * const binary = new Uint8Array([...]);
 * const payload = decode(binary);
 * // payload is now a JavaScript object
 */
export function decode(buffer: Uint8Array): unknown {
  return msgpackDecode(buffer)
}
