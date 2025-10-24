import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { AppError } from "./base.error";
import { ConflictError, NotFoundError, ValidationError } from "./client.errors";
import { InternalServerError } from "./server.errors";

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
  if (error instanceof PrismaClientKnownRequestError) {
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

  // 4. Unknown errors - sanitize for security
  throw new InternalServerError("An unexpected error occurred", error);
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: PrismaClientKnownRequestError): never {
  switch (error.code) {
    case "P2002": // Unique constraint violation
      throw new ConflictError("Resource already exists", error.meta);

    case "P2025": // Record not found
      throw new NotFoundError("Resource not found", error);

    case "P2003": // Foreign key constraint failed
      throw new ValidationError("Invalid reference to related resource", error);

    case "P2014": // Required relation violation
      throw new ValidationError("Missing required relation", error);

    default:
      throw new InternalServerError("Database error occurred", error);
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
