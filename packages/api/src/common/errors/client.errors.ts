import { AppError } from "./base.error";

/**
 * Client Errors (4xx)
 * These are operational errors caused by client actions
 */

export class ValidationError extends AppError {
  statusCode = 400;
  code = "VALIDATION_ERROR";
  isOperational = true;

  constructor(message = "Validation failed", cause?: unknown) {
    super(message, cause);
  }
}

export class AuthenticationError extends AppError {
  statusCode = 401;
  code = "AUTHENTICATION_ERROR";
  isOperational = true;

  constructor(message = "Authentication required", cause?: unknown) {
    super(message, cause);
  }
}

export class AuthorizationError extends AppError {
  statusCode = 403;
  code = "AUTHORIZATION_ERROR";
  isOperational = true;

  constructor(message = "Access forbidden", cause?: unknown) {
    super(message, cause);
  }
}

export class NotFoundError extends AppError {
  statusCode = 404;
  code = "NOT_FOUND";
  isOperational = true;

  constructor(message = "Resource not found", cause?: unknown) {
    super(message, cause);
  }
}

export class ConflictError extends AppError {
  statusCode = 409;
  code = "CONFLICT";
  isOperational = true;

  constructor(message = "Resource already exists", cause?: unknown) {
    super(message, cause);
  }
}

export class PayloadTooLargeError extends AppError {
  statusCode = 413;
  code = "PAYLOAD_TOO_LARGE";
  isOperational = true;

  constructor(message = "Request payload too large", cause?: unknown) {
    super(message, cause);
  }
}

export class RateLimitError extends AppError {
  statusCode = 429;
  code = "RATE_LIMIT_EXCEEDED";
  isOperational = true;

  constructor(message = "Rate limit exceeded", cause?: unknown) {
    super(message, cause);
  }
}
