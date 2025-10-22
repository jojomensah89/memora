/**
 * Error System Exports
 * Centralized error handling for the entire API
 */

// Base error
export { AppError } from "./base.error";

// Client errors (4xx)
export {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  PayloadTooLargeError,
  RateLimitError,
} from "./client.errors";

// Server errors (5xx)
export {
  DatabaseError,
  ExternalServiceError,
  InternalServerError,
  ServiceUnavailableError,
} from "./server.errors";

// Domain-specific errors
export {
  ContextProcessingError,
  AIProviderError,
  StorageError,
  TokenLimitExceededError,
  InvalidModelError,
  ChatNotFoundError,
  ContextNotFoundError,
  RuleNotFoundError,
  ShareTokenExpiredError,
  ShareTokenInvalidError,
} from "./domain.errors";

// Error handler
export { handleError, isAppError, isOperationalError } from "./error-handler";
