/**
 * Server (guild) type definitions.
 */

export interface Server {
  /** Snowflake ID */
  id: string

  /** Server name */
  name: string

  /** Server icon URL (nullable) */
  icon_url: string | null

  /** Owner's user ID */
  owner_id: string

  /** Total member count */
  member_count: number

  /** Creation timestamp (ISO 8601) */
  created_at: string
}
