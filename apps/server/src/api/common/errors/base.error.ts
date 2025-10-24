/**
 * Error Context for enhanced debugging and monitoring
 */
export type ErrorContext = {
  userId?: string;
  chatId?: string;
  requestId?: string;
  timestamp: string;
  operation: string;
  metadata?: Record<string, unknown>;
  retryable: boolean;
  retryCount?: number;
  path?: string;
  method?: string;
};

/**
 * Base Error Class
 * All application errors extend from this class
 */
export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract code: string;
  abstract isOperational: boolean; // true = expected errors, false = bugs
  cause?: unknown;
  context?: ErrorContext;

  constructor(
    message: string,
    cause?: unknown,
    context?: Partial<ErrorContext>
  ) {
    super(message);
    this.cause = cause;
    this.name = this.constructor.name;
    this.context = context
      ? {
          timestamp: new Date().toISOString(),
          operation: "unknown",
          retryable: false,
          ...context,
        }
      : undefined;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Generate error fingerprint for grouping similar errors
   */
  getFingerprint(): string {
    const operation = this.context?.operation || "unknown";
    return `${this.code}:${operation}`;
  }

  /**
   * Check if this error is retryable
   */
  isRetryable(): boolean {
    return this.isOperational && (this.context?.retryable ?? false);
  }

  /**
   * Add or update context
   */
  withContext(context: Partial<ErrorContext>): this {
    this.context = {
      timestamp: new Date().toISOString(),
      operation: "unknown",
      retryable: false,
      ...this.context,
      ...context,
    };
    return this;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      fingerprint: this.getFingerprint(),
      ...(this.context && { context: this.context }),
      ...(process.env.NODE_ENV === "development" && {
        stack: this.stack,
        cause: this.cause,
      }),
    };
  }
}
