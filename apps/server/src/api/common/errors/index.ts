/**
 * Error System Exports
 * Centralized error handling for the entire API
 */

// Base error and types
export { AppError, type ErrorContext } from "./base.error";
// Circuit breaker
export {
  CircuitBreaker,
  type CircuitBreakerConfig,
  CircuitBreakerRegistry,
  type CircuitState,
  circuitBreakerRegistry,
} from "./circuit-breaker";
// Client errors (4xx)
export {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  PayloadTooLargeError,
  RateLimitError,
  RequestTimeoutError,
  UnprocessableEntityError,
  ValidationError,
} from "./client.errors";

// Domain-specific errors
export {
  AIProviderError,
  ChatNotFoundError,
  ContextNotFoundError,
  ContextProcessingError,
  InvalidModelError,
  RuleNotFoundError,
  ShareTokenExpiredError,
  ShareTokenInvalidError,
  StorageError,
  TokenLimitExceededError,
} from "./domain.errors";

// Error handler
export { handleError, isAppError, isOperationalError } from "./error-handler";

// Error recovery
export {
  AI_PROVIDER_RETRY_CONFIG,
  DATABASE_RETRY_CONFIG,
  EXTERNAL_API_RETRY_CONFIG,
  type RetryConfig,
  STORAGE_RETRY_CONFIG,
  withRetry,
} from "./error-recovery";
// Server errors (5xx)
export {
  DatabaseError,
  ExternalServiceError,
  GatewayTimeoutError,
  InternalServerError,
  NetworkError,
  ServiceUnavailableError,
} from "./server.errors";
