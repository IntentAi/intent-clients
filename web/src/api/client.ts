/**
 * Base HTTP client for the Intent REST API.
 *
 * This module wraps the native fetch API and provides:
 * - Automatic base URL configuration from environment
 * - Automatic Authorization header attachment
 * - JSON request/response handling
 * - Typed error parsing and throwing
 * - 401 handling (redirect to login)
 *
 * All API modules (auth, servers, channels, etc.) use these functions.
 * This client does NOT manage state - it just makes requests and returns data.
 */

import { ApiError, ApiErrorResponse } from '../types/api';

/**
 * Base URL for all API requests.
 * Read from Vite environment variable, defaulting to local development server.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

/**
 * Placeholder function for retrieving the current auth token.
 * For Phase 1, this returns null. In later phases, this will read from the auth store.
 *
 * The auth store will be implemented in a future issue and will replace this placeholder.
 */
export function getAuthToken(): string | null {
  // TODO: Replace with actual auth store getter when stores are implemented
  return null;
}

/**
 * Common request options.
 * Sets Content-Type and Accept headers for JSON communication.
 */
interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Internal function to make HTTP requests.
 * Handles auth headers, JSON serialization, error parsing, and 401 redirects.
 */
async function request<T>(endpoint: string, options: RequestOptions): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Attach Authorization header if token exists
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Build fetch options
  const fetchOptions: RequestInit = {
    method: options.method,
    headers,
  };

  // Serialize body to JSON if present
  if (options.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  // Make the request
  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Network error (no response from server)
    throw new ApiError(0, 'Network error: Unable to reach the server', 'NETWORK_ERROR');
  }

  // Handle 401 Unauthorized by redirecting to login
  // This clears the invalid token and forces re-authentication
  if (response.status === 401) {
    // TODO: When auth store is implemented, call logout action here
    // For now, just redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
  }

  // Parse response body
  let responseData: unknown;
  try {
    // Empty responses (204 No Content) don't have a body
    if (response.status === 204) {
      responseData = null;
    } else {
      const text = await response.text();
      responseData = text ? JSON.parse(text) : null;
    }
  } catch (error) {
    // Failed to parse JSON response
    throw new ApiError(
      response.status,
      'Invalid JSON response from server',
      'INVALID_RESPONSE'
    );
  }

  // Handle error responses
  if (!response.ok) {
    // Server returned an error response
    // The Intent server returns {error: string, code: string}
    if (isApiErrorResponse(responseData)) {
      throw new ApiError(response.status, responseData.error, responseData.code);
    } else {
      // Unexpected error format
      throw new ApiError(
        response.status,
        `HTTP ${response.status}: ${response.statusText}`,
        'HTTP_ERROR'
      );
    }
  }

  // Return the parsed data
  return responseData as T;
}

/**
 * Type guard to check if a value is an API error response.
 */
function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    'code' in value &&
    typeof (value as ApiErrorResponse).error === 'string' &&
    typeof (value as ApiErrorResponse).code === 'string'
  );
}

/**
 * Make a GET request.
 */
export async function get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
  return request<T>(endpoint, { method: 'GET', headers });
}

/**
 * Make a POST request.
 */
export async function post<T>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body, headers });
}

/**
 * Make a PUT request.
 */
export async function put<T>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<T> {
  return request<T>(endpoint, { method: 'PUT', body, headers });
}

/**
 * Make a DELETE request.
 */
export async function del<T>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE', body, headers });
}

/**
 * Make a PATCH request.
 */
export async function patch<T>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<T> {
  return request<T>(endpoint, { method: 'PATCH', body, headers });
}
