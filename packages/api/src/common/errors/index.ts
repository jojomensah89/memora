/**
 * Error System Exports
 * Centralized error handling for the entire API
 */

// Base error
export { AppError } from "./base.error";

// Client errors (4xx)
export {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  NotFoundError,
  PayloadTooLargeError,
  RateLimitError,
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
// Server errors (5xx)
export {
  DatabaseError,
  ExternalServiceError,
  InternalServerError,
  ServiceUnavailableError,
} from "./server.errors";
