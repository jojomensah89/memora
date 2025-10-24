import { AppError } from "./base.error";

/**
 * Server Errors (5xx)
 * These are operational errors on the server side
 */

export class DatabaseError extends AppError {
  statusCode = 500;
  code = "DATABASE_ERROR";
  isOperational = true; // Can usually retry

  constructor(message = "Database operation failed", cause?: unknown) {
    super(message, cause);
  }
}

export class ExternalServiceError extends AppError {
  statusCode = 502;
  code = "EXTERNAL_SERVICE_ERROR";
  isOperational = true;

  constructor(message = "External service unavailable", cause?: unknown) {
    super(message, cause);
  }
}

export class InternalServerError extends AppError {
  statusCode = 500;
  code = "INTERNAL_SERVER_ERROR";
  isOperational = false; // Unexpected bug

  constructor(message = "Internal server error", cause?: unknown) {
    super(message, cause);
  }
}

export class ServiceUnavailableError extends AppError {
  statusCode = 503;
  code = "SERVICE_UNAVAILABLE";
  isOperational = true;

  constructor(message = "Service temporarily unavailable", cause?: unknown) {
    super(message, cause);
  }
}
