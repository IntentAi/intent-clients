/**
 * User type definitions.
 *
 * These types represent users in the Intent platform.
 * IDs are Snowflake format (64-bit integers as strings).
 */

/**
 * Base user object.
 * Represents any user in the system (not necessarily the current user).
 */
export interface User {
  /** Snowflake ID (64-bit integer as string) */
  id: string;

  /** Unique username (lowercase, alphanumeric + underscores) */
  username: string;

  /** Display name (can contain spaces, unicode, etc.) */
  display_name: string;

  /** Avatar URL (nullable if user has no avatar) */
  avatar_url: string | null;

  /** Account creation timestamp (ISO 8601) */
  created_at: string;
}

/**
 * Current authenticated user.
 * Extends the base User interface with additional fields that are only
 * available for the currently logged-in user.
 *
 * For Phase 1, this is identical to User. Future phases may add fields like
 * email, verified status, premium tier, etc.
 */
export interface CurrentUser extends User {
  // Phase 1: No additional fields
  // Future phases might add: email, verified, premium_tier, etc.
}
