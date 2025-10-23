import { ValidationError } from "../errors";
import { errorLogger, type LogContext, perfLogger } from "../logger";

/**
 * Base Service
 * Provides common business logic utilities
 */
export abstract class BaseService {
  /**
   * Get logger with service context
   */
  protected getLogger(context?: Partial<LogContext>) {
    return contextLogger({
      module: this.constructor.name,
      ...context,
    });
  }

  /**
   * Get error logger with context
   */
  protected getErrorLogger(context?: Partial<LogContext>) {
    return (message: string, error: unknown) =>
      errorLogger(message, error, {
        module: this.constructor.name,
        ...context,
      });
  }

  /**
   * Get performance logger
   */
  protected getPerfLogger(operation: string, context?: Partial<LogContext>) {
    return perfLogger(operation, {
      module: this.constructor.name,
      ...context,
    });
  }
  /**
   * Validate required fields
   */
  protected validateRequired(
    value: unknown,
    fieldName: string
  ): asserts value is NonNullable<unknown> {
    if (value === null || value === undefined || value === "") {
      throw new ValidationError(`${fieldName} is required`);
    }
  }

  /**
   * Validate string length
   */
  protected validateLength(
    value: string,
    fieldName: string,
    min?: number,
    max?: number
  ): void {
    if (min !== undefined && value.length < min) {
      throw new ValidationError(
        `${fieldName} must be at least ${min} characters`
      );
    }
    if (max !== undefined && value.length > max) {
      throw new ValidationError(
        `${fieldName} must be at most ${max} characters`
      );
    }
  }

  /**
   * Validate array size
   */
  protected validateArraySize(
    array: unknown[],
    fieldName: string,
    min?: number,
    max?: number
  ): void {
    if (min !== undefined && array.length < min) {
      throw new ValidationError(`${fieldName} must have at least ${min} items`);
    }
    if (max !== undefined && array.length > max) {
      throw new ValidationError(`${fieldName} must have at most ${max} items`);
    }
  }

  /**
   * Validate ownership
   */
  protected validateOwnership(
    resourceUserId: string,
    requestUserId: string,
    resourceName = "Resource"
  ): void {
    if (resourceUserId !== requestUserId) {
      throw new ValidationError(`${resourceName} does not belong to user`);
    }
  }
}
