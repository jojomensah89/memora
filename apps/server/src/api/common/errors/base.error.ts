/**
 * Base Error Class
 * All application errors extend from this class
 */
export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract code: string;
  abstract isOperational: boolean; // true = expected errors, false = bugs
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      ...(process.env.NODE_ENV === "development" && {
        stack: this.stack,
        cause: this.cause,
      }),
    };
  }
}
