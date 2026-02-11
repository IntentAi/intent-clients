/**
 * API layer type definitions.
 *
 * These types define the contract between the client and the Intent server's REST API.
 * Error responses follow the server's JSON error format: {error: string, code: string}
 */

/**
 * Generic API response wrapper.
 * The Intent server returns JSON for all responses.
 */
export interface ApiResponse<T> {
  data: T;
}

/**
 * Server error response structure.
 * All API errors return a JSON object with an error message and error code.
 */
export interface ApiErrorResponse {
  error: string;
  code: string;
}

/**
 * Custom error class for API failures.
 * Thrown by the HTTP client when a request fails.
 * Contains the HTTP status, error message, and error code from the server.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(status: number, message: string, code: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;

    // Maintain proper stack trace for debugging (V8-specific)
    if ('captureStackTrace' in Error) {
      (Error as { captureStackTrace?: (target: object, constructor: object) => void })
        .captureStackTrace?.(this, ApiError);
    }
  }

  /**
   * Check if this error represents an authentication failure.
   * Used by the client to determine when to redirect to login.
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if this error is a validation error.
   */
  isValidationError(): boolean {
    return this.status === 400;
  }

  /**
   * Check if this error is a not found error.
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if this error is a server error.
   */
  isServerError(): boolean {
    return this.status >= 500;
  }
}
