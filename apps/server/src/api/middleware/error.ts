import type { ErrorHandler } from "hono";
import { HTTP_STATUS } from "../common/constants/limits.constants";
import { AppError } from "../common/errors/base.error";
import { handleError } from "../common/errors/error-handler";
import { InternalServerError } from "../common/errors/server.errors";
import { logger } from "../common/logger";

/**
 * Error Response Format
 */
type ErrorResponse = {
  error: {
    code: string;
    message: string;
    statusCode: number;
    requestId?: string;
    timestamp: string;
    fingerprint?: string;
    stack?: string;
    context?: unknown;
  };
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
  retryAfter?: number;
};

/**
 * Convert unknown error to AppError with context
 */
function convertToAppError(
  err: unknown,
  requestId: string,
  path: string,
  method: string
): AppError {
  try {
    handleError(err);
    const error = new InternalServerError("An unexpected error occurred", err);
    error.withContext({
      requestId,
      path,
      method,
      operation: "http_request",
      retryable: false,
    });
    return error;
  } catch (error) {
    if (error instanceof AppError) {
      if (!error.context) {
        error.withContext({
          requestId,
          path,
          method,
          operation: "http_request",
          retryable: error.isOperational,
        });
      }
      return error;
    }
    const fallbackError = new InternalServerError(
      "An unexpected error occurred",
      error
    );
    fallbackError.withContext({
      requestId,
      path,
      method,
      operation: "http_request",
      retryable: false,
    });
    return fallbackError;
  }
}

/**
 * Centralized error handler for Hono application
 * Converts all errors to proper HTTP responses with structured logging
 */
export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.req.header("x-request-id") || crypto.randomUUID();
  const path = c.req.path;
  const method = c.req.method;

  const appError = convertToAppError(err, requestId, path, method);

  const statusCode = appError.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isClientError =
    statusCode >= HTTP_STATUS.BAD_REQUEST &&
    statusCode < HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isServerError = statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR;

  let logLevel: "error" | "warn" | "log" = "log";
  if (isServerError) {
    logLevel = "error";
  } else if (isClientError) {
    logLevel = "warn";
  }

  logger[logLevel]({
    message: appError.message,
    errorCode: appError.code,
    statusCode,
    fingerprint: appError.getFingerprint(),
    isOperational: appError.isOperational,
    retryable: appError.isRetryable(),
    context: appError.context,
    path,
    method,
    requestId,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && {
      stack: appError.stack,
      cause: appError.cause,
    }),
  });

  const response: ErrorResponse = {
    error: {
      code: appError.code,
      message: appError.message,
      statusCode,
      requestId,
      timestamp: new Date().toISOString(),
      fingerprint: appError.getFingerprint(),
      ...(process.env.NODE_ENV === "development" && {
        stack: appError.stack,
        context: appError.context,
      }),
    },
  };

  if (appError.isRetryable()) {
    const retryCount = appError.context?.retryCount || 0;
    const backoffSeconds = Math.min(2 ** retryCount, 60);
    response.retryAfter = backoffSeconds;
  }

  return c.json(response, statusCode as never);
};
