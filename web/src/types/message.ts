/**
 * Message type definitions.
 */

import type { User } from './user'

export interface Message {
  /** Snowflake ID */
  id: string

  /** Channel ID this message belongs to */
  channel_id: string

  /** Message author (full user object or just ID depending on context) */
  author: User

  /** Message content (plain text for Phase 1) */
  content: string

  /** Creation timestamp (ISO 8601) */
  created_at: string

  /** Edit timestamp (nullable if never edited) */
  edited_at: string | null
}
