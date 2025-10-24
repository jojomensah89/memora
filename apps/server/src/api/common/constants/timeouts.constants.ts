/**
 * Timeout Configuration
 * Centralized timeout values for different operations
 */

export const TIMEOUTS = {
  // Request timeouts
  REQUEST_DEFAULT: 30_000, // 30 seconds
  REQUEST_LONG: 60_000, // 60 seconds (for file uploads)
  REQUEST_SHORT: 10_000, // 10 seconds (for health checks)

  // Database timeouts
  DATABASE_QUERY: 10_000, // 10 seconds
  DATABASE_TRANSACTION: 15_000, // 15 seconds
  DATABASE_CONNECTION: 5000, // 5 seconds

  // External service timeouts
  AI_PROVIDER: 25_000, // 25 seconds (AI generation can be slow)
  STORAGE_UPLOAD: 30_000, // 30 seconds
  STORAGE_DOWNLOAD: 20_000, // 20 seconds
  EXTERNAL_API: 15_000, // 15 seconds

  // File operation timeouts
  FILE_UPLOAD: 60_000, // 60 seconds
  FILE_PROCESS: 30_000, // 30 seconds

  // Retry configuration
  RETRY_BASE_DELAY: 1000, // 1 second
  RETRY_MAX_DELAY: 10_000, // 10 seconds
  RETRY_MAX_ATTEMPTS: 3,

  // Circuit breaker configuration
  CIRCUIT_BREAKER_TIMEOUT: 60_000, // 1 minute
  CIRCUIT_BREAKER_THRESHOLD: 5, // failures before opening
  CIRCUIT_BREAKER_RESET: 30_000, // 30 seconds before half-open
} as const;

/**
 * Timeout multipliers for different environments
 */
export const TIMEOUT_MULTIPLIERS = {
  development: 2, // 2x timeouts in dev
  test: 0.5, // 0.5x timeouts in test
  production: 1, // normal timeouts
} as const;

/**
 * Get timeout value adjusted for current environment
 */
export function getTimeout(
  baseTimeout: number,
  env: keyof typeof TIMEOUT_MULTIPLIERS = "production"
): number {
  return baseTimeout * TIMEOUT_MULTIPLIERS[env];
}
