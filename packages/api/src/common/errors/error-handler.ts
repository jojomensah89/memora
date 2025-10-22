import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { AppError } from "./base.error";

/**
 * Central Error Handler
 * Converts all errors to tRPC-compatible format
 * Ensures no unhandled errors reach the client
 */

export function handleError(error: unknown): never {
  // 1. Already an AppError - convert to tRPC
  if (error instanceof AppError) {
    throw new TRPCError({
      code: mapStatusToTRPCCode(error.statusCode),
      message: error.message,
      cause: error.toJSON(),
    });
  }

  // 2. Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid database query",
      cause: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }

  // 3. Zod validation errors (usually auto-handled by tRPC, but just in case)
  if (error instanceof ZodError) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Validation failed",
      cause: error.errors,
    });
  }

  // 4. tRPC errors (pass through)
  if (error instanceof TRPCError) {
    throw error;
  }

  // 5. Unknown errors - log and sanitize
  console.error("❌ Unexpected error:", error);

  // Don't expose internal errors to client
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    cause: process.env.NODE_ENV === "development" ? error : undefined,
  });
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): never {
  switch (error.code) {
    case "P2002": // Unique constraint violation
      throw new TRPCError({
        code: "CONFLICT",
        message: "Resource already exists",
        cause: error.meta,
      });

    case "P2025": // Record not found
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Resource not found",
      });

    case "P2003": // Foreign key constraint failed
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid reference to related resource",
      });

    case "P2014": // Required relation violation
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing required relation",
      });

    default:
      console.error("Unhandled Prisma error:", error.code, error.message);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database error occurred",
        cause: process.env.NODE_ENV === "development" ? error : undefined,
      });
  }
}

/**
 * Map HTTP status codes to tRPC error codes
 */
function mapStatusToTRPCCode(status: number): TRPCError["code"] {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 410:
      return "GONE";
    case 413:
      return "PAYLOAD_TOO_LARGE";
    case 422:
      return "UNPROCESSABLE_CONTENT";
    case 429:
      return "TOO_MANY_REQUESTS";
    case 500:
      return "INTERNAL_SERVER_ERROR";
    case 502:
      return "BAD_GATEWAY";
    case 503:
      return "SERVICE_UNAVAILABLE";
    default:
      return "INTERNAL_SERVER_ERROR";
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
