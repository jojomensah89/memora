import { AppError } from "./base.error";

/**
 * Domain-Specific Errors
 * Business logic and domain-related errors
 */

export class ContextProcessingError extends AppError {
  statusCode = 422;
  code = "CONTEXT_PROCESSING_ERROR";
  isOperational = true;

  constructor(message = "Failed to process context", cause?: unknown) {
    super(message, cause);
  }
}

export class AIProviderError extends AppError {
  statusCode = 502;
  code = "AI_PROVIDER_ERROR";
  isOperational = true;

  constructor(message = "AI provider error", cause?: unknown) {
    super(message, cause);
  }
}

export class StorageError extends AppError {
  statusCode = 500;
  code = "STORAGE_ERROR";
  isOperational = true;

  constructor(message = "Storage operation failed", cause?: unknown) {
    super(message, cause);
  }
}

export class TokenLimitExceededError extends AppError {
  statusCode = 429;
  code = "TOKEN_LIMIT_EXCEEDED";
  isOperational = true;

  constructor(message = "Token limit exceeded", cause?: unknown) {
    super(message, cause);
  }
}

export class InvalidModelError extends AppError {
  statusCode = 400;
  code = "INVALID_MODEL";
  isOperational = true;

  constructor(message = "Invalid AI model specified", cause?: unknown) {
    super(message, cause);
  }
}

export class ChatNotFoundError extends AppError {
  statusCode = 404;
  code = "CHAT_NOT_FOUND";
  isOperational = true;

  constructor(message = "Chat not found", cause?: unknown) {
    super(message, cause);
  }
}

export class ContextNotFoundError extends AppError {
  statusCode = 404;
  code = "CONTEXT_NOT_FOUND";
  isOperational = true;

  constructor(message = "Context item not found", cause?: unknown) {
    super(message, cause);
  }
}

export class RuleNotFoundError extends AppError {
  statusCode = 404;
  code = "RULE_NOT_FOUND";
  isOperational = true;

  constructor(message = "Rule not found", cause?: unknown) {
    super(message, cause);
  }
}

export class ShareTokenExpiredError extends AppError {
  statusCode = 410;
  code = "SHARE_TOKEN_EXPIRED";
  isOperational = true;

  constructor(message = "Share link has expired", cause?: unknown) {
    super(message, cause);
  }
}

export class ShareTokenInvalidError extends AppError {
  statusCode = 404;
  code = "SHARE_TOKEN_INVALID";
  isOperational = true;

  constructor(message = "Invalid share link", cause?: unknown) {
    super(message, cause);
  }
}
