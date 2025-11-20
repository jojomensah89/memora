/**
 * Error Handling Test Suite
 * Tests for centralized error handling and structured error responses
 */

import { describe, expect, it } from "bun:test";
import {
  ChatNotFoundError,
  DatabaseError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "./index";

describe("Error Handling System", () => {
  describe("AppError Base Class", () => {
    it("should create error with context", () => {
      const error = new ChatNotFoundError("Chat not found");
      error.withContext({
        chatId: "test-123",
        userId: "user-456",
        operation: "get_chat",
        retryable: false,
      });

      expect(error.code).toBe("CHAT_NOT_FOUND");
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
      expect(error.context).toBeDefined();
      expect(error.context?.chatId).toBe("test-123");
    });

    it("should generate fingerprint for error grouping", () => {
      const error = new ChatNotFoundError("Chat not found");
      error.withContext({
        operation: "database_query",
        retryable: false,
      });

      const fingerprint = error.getFingerprint();
      expect(fingerprint).toBe("CHAT_NOT_FOUND:database_query");
    });

    it("should identify retryable errors", () => {
      const retryableError = new DatabaseError("Connection timeout");
      retryableError.withContext({
        operation: "database_connection",
        retryable: true,
      });

      expect(retryableError.isRetryable()).toBe(true);

      const nonRetryableError = new NotFoundError("Resource not found");
      nonRetryableError.withContext({
        operation: "database_query",
        retryable: false,
      });

      expect(nonRetryableError.isRetryable()).toBe(false);
    });

    it("should serialize to JSON with all details", () => {
      const error = new ValidationError("Invalid input");
      error.withContext({
        operation: "input_validation",
        retryable: false,
        metadata: { field: "email" },
      });

      const json = error.toJSON();

      expect(json).toHaveProperty("name");
      expect(json).toHaveProperty("code");
      expect(json).toHaveProperty("message");
      expect(json).toHaveProperty("statusCode");
      expect(json).toHaveProperty("isOperational");
      expect(json).toHaveProperty("fingerprint");
      expect(json).toHaveProperty("context");
    });
  });

  describe("Error Type Classification", () => {
    it("should correctly identify operational vs non-operational errors", () => {
      const operationalError = new ValidationError("Bad input");
      expect(operationalError.isOperational).toBe(true);

      const nonOperationalError = new InternalServerError("Unexpected bug");
      expect(nonOperationalError.isOperational).toBe(false);
    });

    it("should have correct status codes for different error types", () => {
      expect(new ValidationError().statusCode).toBe(400);
      expect(new NotFoundError().statusCode).toBe(404);
      expect(new ChatNotFoundError().statusCode).toBe(404);
      expect(new DatabaseError().statusCode).toBe(500);
      expect(new InternalServerError().statusCode).toBe(500);
    });

    it("should have descriptive error codes", () => {
      expect(new ValidationError().code).toBe("VALIDATION_ERROR");
      expect(new NotFoundError().code).toBe("NOT_FOUND");
      expect(new ChatNotFoundError().code).toBe("CHAT_NOT_FOUND");
      expect(new DatabaseError().code).toBe("DATABASE_ERROR");
      expect(new InternalServerError().code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  describe("Error Context Enhancement", () => {
    it("should preserve original error cause", () => {
      const originalError = new Error("Original database error");
      const appError = new DatabaseError("Failed to save", originalError);

      expect(appError.cause).toBe(originalError);
    });

    it("should allow chaining withContext calls", () => {
      const error = new ChatNotFoundError("Chat not found")
        .withContext({ chatId: "123", operation: "get" })
        .withContext({ userId: "user-456" });

      expect(error.context?.chatId).toBe("123");
      expect(error.context?.userId).toBe("user-456");
      expect(error.context?.operation).toBe("get");
    });

    it("should include timestamp in context", () => {
      const error = new ValidationError("Bad input");
      error.withContext({ operation: "validation", retryable: false });

      expect(error.context?.timestamp).toBeDefined();
      expect(typeof error.context?.timestamp).toBe("string");
    });
  });
});
