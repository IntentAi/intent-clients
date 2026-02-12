/**
 * Channel type definitions.
 */

export enum ChannelType {
  TEXT = 0,
  VOICE = 1,
  CATEGORY = 2,
}

export interface Channel {
  /** Snowflake ID */
  id: string

  /** Parent server ID */
  server_id: string

  /** Channel name */
  name: string

  /** Channel type (text, voice, category) */
  type: ChannelType

  /** Channel topic (nullable) */
  topic: string | null

  /** Display position in channel list */
  position: number

  /** Parent category ID (nullable) */
  parent_id: string | null

  /** Creation timestamp (ISO 8601) */
  created_at: string
}
