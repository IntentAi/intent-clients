/**
 * Authentication API endpoints.
 *
 * This module provides functions for user registration and login.
 * These are the only API endpoints that don't require authentication.
 *
 * Both functions return a JWT token and the authenticated user object.
 * The calling code (auth store, when implemented) is responsible for:
 * - Storing the token
 * - Initializing the gateway connection
 * - Redirecting to the main app
 */

import { post, patch } from './client'
import { User } from '../types/user'

/**
 * Request body for user registration.
 */
interface RegisterRequest {
  username: string
  email: string
  password: string
}

/**
 * Request body for user login.
 */
interface LoginRequest {
  username_or_email: string
  password: string
}

/**
 * Response from both register and login endpoints.
 * Contains the JWT token and the authenticated user object.
 */
export interface AuthResponse {
  token: string
  user: User
}

/**
 * Register a new user account.
 *
 * Creates a new user with the provided username, email, and password.
 * The server hashes the password with Argon2 before storing.
 *
 * @param username - Unique username (lowercase, alphanumeric + underscores)
 * @param email - Valid email address
 * @param password - Password (server enforces minimum length)
 * @returns JWT token and user object
 * @throws ApiError if registration fails (duplicate username/email, invalid input, etc.)
 *
 * @example
 * ```ts
 * try {
 *   const { token, user } = await register('alice', 'alice@example.com', 'securepass123');
 *   // Store token and user in auth store
 *   // Connect to gateway
 *   // Redirect to main app
 * } catch (error) {
 *   if (error instanceof ApiError && error.isValidationError()) {
 *     // Show validation error to user
 *   }
 * }
 * ```
 */
export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const body: RegisterRequest = {
    username,
    email,
    password,
  }

  return post<AuthResponse>('/auth/register', body)
}

/**
 * Log in with existing credentials.
 *
 * Authenticates a user with their username or email and password.
 * The server validates credentials and returns a JWT token.
 *
 * @param usernameOrEmail - Username or email address
 * @param password - User's password
 * @returns JWT token and user object
 * @throws ApiError if login fails (invalid credentials, account locked, etc.)
 *
 * @example
 * ```ts
 * try {
 *   const { token, user } = await login('alice', 'securepass123');
 *   // Store token and user in auth store
 *   // Connect to gateway
 *   // Redirect to main app
 * } catch (error) {
 *   if (error instanceof ApiError && error.status === 401) {
 *     // Show "invalid credentials" error
 *   }
 * }
 * ```
 */
export async function login(
  usernameOrEmail: string,
  password: string
): Promise<AuthResponse> {
  const body: LoginRequest = {
    username_or_email: usernameOrEmail,
    password,
  }

  return post<AuthResponse>('/auth/login', body)
}

export async function logout(): Promise<void> {
  return post('/auth/logout')
}

export async function updateProfile(data: { display_name?: string }): Promise<User> {
  return patch<User>('/users/@me', data)
}
