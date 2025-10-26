import { TIMEOUTS } from "../constants/timeouts.constants";
import { logger } from "../logger";
import { AppError } from "./base.error";

/**
 * Retry Configuration
 */
export type RetryConfig = {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  onRetry?: (error: Error, attempt: number) => void;
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: TIMEOUTS.RETRY_MAX_ATTEMPTS,
  baseDelay: TIMEOUTS.RETRY_BASE_DELAY,
  maxDelay: TIMEOUTS.RETRY_MAX_DELAY,
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  const exponentialDelay = baseDelay * 2 ** attempt;
  const jitter = Math.random() * baseDelay * 0.1;
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error should be retried
 */
function shouldRetryError(
  error: unknown,
  attempt: number,
  maxRetries: number
): boolean {
  if (attempt >= maxRetries) {
    return false;
  }
  return error instanceof AppError && error.isRetryable();
}

/**
 * Log retry attempt
 */
function logRetryAttempt(
  error: Error,
  attempt: number,
  maxRetries: number,
  delay: number
): void {
  logger.warn("Operation failed, retrying...", {
    attempt: attempt + 1,
    maxRetries,
    delay,
    error: error.message,
    errorCode: error instanceof AppError ? error.code : "UNKNOWN",
  });
}

/**
 * Update error context with retry count
 */
function updateErrorContext(error: unknown, retryCount: number): void {
  if (error instanceof AppError && error.context) {
    error.context.retryCount = retryCount;
  }
}

/**
 * Retry an operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error = new Error("Operation failed after all retries");

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!shouldRetryError(error, attempt, finalConfig.maxRetries)) {
        throw error;
      }

      const delay = calculateDelay(
        attempt,
        finalConfig.baseDelay,
        finalConfig.maxDelay
      );

      logRetryAttempt(lastError, attempt, finalConfig.maxRetries, delay);

      if (finalConfig.onRetry) {
        finalConfig.onRetry(lastError, attempt + 1);
      }

      updateErrorContext(error, attempt + 1);

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Retry configuration for database operations
 */
export const DATABASE_RETRY_CONFIG: Partial<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 500,
  maxDelay: 5000,
};

/**
 * Retry configuration for external API calls
 */
export const EXTERNAL_API_RETRY_CONFIG: Partial<RetryConfig> = {
  maxRetries: 2,
  baseDelay: 1000,
  maxDelay: 5000,
};

/**
 * Retry configuration for AI provider calls
 */
export const AI_PROVIDER_RETRY_CONFIG: Partial<RetryConfig> = {
  maxRetries: 2,
  baseDelay: 2000,
  maxDelay: 10_000,
};

/**
 * Retry configuration for storage operations
 */
export const STORAGE_RETRY_CONFIG: Partial<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 8000,
};
