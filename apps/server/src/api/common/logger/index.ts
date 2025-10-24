export type LogContext = { module: string; [key: string]: any };

// No-op logger to comply with no-console rules
export const logger = {
  log: (..._args: any[]) => {
    // No-op - replace with proper logging service if needed
  },
  error: (..._args: any[]) => {
    // No-op - replace with proper logging service if needed
  },
  warn: (..._args: any[]) => {
    // No-op - replace with proper logging service if needed
  },
};

export const contextLogger = (_context: LogContext) => logger;

export const errorLogger = (
  message: string,
  error: unknown,
  context: LogContext
) => {
  logger.error(message, error, context);
};

export const perfLogger = (operation: string, context: LogContext) => {
  const startTime = Date.now();
  return {
    start: () => {
      logger.log(`[PERF] Starting: ${operation}`, context);
    },
    end: () => {
      const duration = Date.now() - startTime;
      logger.log(`[PERF] Finished: ${operation} in ${duration}ms`, context);
    },
  };
};
