import type { ErrorHandler } from "hono";
import { AppError } from "../common/errors/base.error";
import { handleError } from "../common/errors/error-handler";
import { InternalServerError } from "../common/errors/server.errors";
import { logger } from "../common/logger";

/**
 * Centralized error handler for Hono application
 * Converts all errors to proper HTTP responses
 */
export const errorHandler: ErrorHandler = (err, c) => {
  logger.error("Error:", err);

  let appError: AppError;

  try {
    handleError(err);
    // This should not be reached as handleError always throws
    appError = new InternalServerError("An unexpected error occurred", err);
  } catch (error) {
    if (error instanceof AppError) {
      appError = error;
    } else {
      appError = new InternalServerError("An unexpected error occurred", error);
    }
  }

  return c.json(
    {
      error: appError.message,
      details: appError.cause,
    },
    appError.statusCode as any
  );
};
