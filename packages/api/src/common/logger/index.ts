/**
 * Custom Logger Setup
 * Provides structured logging for the API
 */

export interface LogContext {
  userId?: string;
  chatId?: string;
  sessionId?: string;
  requestId?: string;
  module?: string;
  action?: string;
}

/**
 * Basic logger with structured context
 */
export const apiLogger = (message: string, ...rest: string[]) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] API: ${message}`, ...rest);
};

/**
 * Enhanced logger with context information
 */
export const contextLogger =
  (context: LogContext) =>
  (message: string, ...rest: string[]) => {
    const timestamp = new Date().toISOString();
    const contextInfo = Object.entries(context)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join(" ");

    const prefix = contextInfo
      ? `[${timestamp}] API [${contextInfo}]`
      : `[${timestamp}] API`;
    console.log(`${prefix} ${message}`, ...rest);
  };

/**
 * Error logger with structured format
 */
export const errorLogger = (
  message: string,
  error: unknown,
  context?: LogContext
) => {
  const timestamp = new Date().toISOString();
  const errorInfo =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  const contextInfo = context
    ? Object.entries(context)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join(" ")
    : "";

  const prefix = contextInfo
    ? `[${timestamp}] API ERROR [${contextInfo}]`
    : `[${timestamp}] API ERROR`;

  console.error(`${prefix} ${message} | ${errorInfo}`);

  if (error instanceof Error && error.stack) {
    console.error(`${prefix} Stack: ${error.stack}`);
  }
};

/**
 * Performance logger for tracking operation timing
 */
export const perfLogger = (operation: string, context?: LogContext) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const contextInfo = context
    ? Object.entries(context)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join(" ")
    : "";

  const prefix = contextInfo
    ? `[${timestamp}] API PERF [${contextInfo}]`
    : `[${timestamp}] API PERF`;

  console.log(`${prefix} Starting: ${operation}`);

  return {
    end: () => {
      const duration = Date.now() - startTime;
      console.log(`${prefix} Completed: ${operation} (${duration}ms)`);
      return duration;
    },
  };
};
