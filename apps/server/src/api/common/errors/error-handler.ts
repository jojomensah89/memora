import { Prisma } from "@memora/db";
import { ZodError } from "zod";
import {
  CONFLICT_ERROR_CODES,
  CONNECTION_ERROR_CODES,
  DATABASE_ERROR_CODES,
  getErrorDescription,
  isRetryableErrorCode,
  NOT_FOUND_ERROR_CODES,
  VALIDATION_ERROR_CODES,
} from "../constants/error-codes.constants";
import { AppError } from "./base.error";
import {
  AuthorizationError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
  ValidationError,
} from "./client.errors";
import {
  DatabaseError,
  InternalServerError,
  ServiceUnavailableError,
} from "./server.errors";

/**
 * Central Error Handler
 * Converts all errors to proper HTTP responses
 * Ensures no unhandled errors reach the client
 */

export function handleError(error: unknown): never {
  // 1. Already an AppError - re-throw
  if (error instanceof AppError) {
    throw error;
  }

  // 2. Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw handlePrismaError(error);
  }

  if (
    error instanceof Error &&
    error.message.includes("PrismaClientValidationError")
  ) {
    throw new ValidationError("Invalid database query", error);
  }

  // 3. Zod validation errors
  if (error instanceof ZodError) {
    throw new ValidationError("Validation failed", error.issues);
  }

  // 4. Timeout errors
  if (error instanceof Error && error.message.includes("timeout")) {
    throw new ServiceUnavailableError("Operation timed out", error);
  }

  // 5. Network errors
  if (
    error instanceof Error &&
    (error.message.includes("ECONNREFUSED") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("ETIMEDOUT"))
  ) {
    throw new ServiceUnavailableError("Network error occurred", error);
  }

  // 6. Unknown errors - sanitize for security
  throw new InternalServerError("An unexpected error occurred", error);
}

/**
 * Handle Prisma-specific errors with comprehensive mapping
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): never {
  const code = error.code;
  const description = getErrorDescription(code) || "Database error occurred";
  const isRetryable = isRetryableErrorCode(code);

  // Categorize by error code groups
  if ((NOT_FOUND_ERROR_CODES as readonly string[]).includes(code)) {
    throw new NotFoundError(description, error).withContext({
      operation: "database_query",
      retryable: false,
      metadata: error.meta,
    });
  }

  if ((CONFLICT_ERROR_CODES as readonly string[]).includes(code)) {
    const appError = new ConflictError(description, error).withContext({
      operation: "database_constraint",
      retryable: code === "P2034", // Transaction conflicts are retryable
      metadata: error.meta,
    });
    throw appError;
  }

  if ((VALIDATION_ERROR_CODES as readonly string[]).includes(code)) {
    throw new ValidationError(description, error).withContext({
      operation: "database_validation",
      retryable: false,
      metadata: error.meta,
    });
  }

  if ((CONNECTION_ERROR_CODES as readonly string[]).includes(code)) {
    // Handle authentication separately
    if (code === "P1010") {
      throw new AuthorizationError(description, error).withContext({
        operation: "database_auth",
        retryable: false,
      });
    }

    throw new ServiceUnavailableError(description, error).withContext({
      operation: "database_connection",
      retryable: isRetryable,
      metadata: error.meta,
    });
  }

  if ((DATABASE_ERROR_CODES as readonly string[]).includes(code)) {
    throw new DatabaseError(description, error).withContext({
      operation: "database_operation",
      retryable: false,
      metadata: error.meta,
    });
  }

  // Handle specific important cases
  switch (code) {
    case "P2000":
      throw new BadRequestError(
        "Value too long for database field",
        error
      ).withContext({
        operation: "database_insert",
        retryable: false,
        metadata: error.meta,
      });

    case "P2020":
      throw new BadRequestError("Value out of range", error).withContext({
        operation: "database_insert",
        retryable: false,
        metadata: error.meta,
      });

    case "P2024": // Connection pool timeout
      throw new ServiceUnavailableError(
        "Database connection pool exhausted",
        error
      ).withContext({
        operation: "database_connection",
        retryable: true,
      });

    case "P2027": // Multiple database errors
      throw new DatabaseError(
        "Multiple database errors occurred",
        error
      ).withContext({
        operation: "database_batch",
        retryable: false,
        metadata: error.meta,
      });

    case "P2026": // Unsupported feature
      throw new UnprocessableEntityError(
        "Database operation not supported",
        error
      ).withContext({
        operation: "database_feature",
        retryable: false,
      });

    default:
      throw new InternalServerError(description, error).withContext({
        operation: "database_unknown",
        retryable: isRetryable,
        metadata: error.meta,
      });
  }
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard for operational errors (safe to retry)
 */
export function isOperationalError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
}
