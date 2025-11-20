import { ValidationError } from "../errors";

/**
 * Validate required fields
 */
export function validateRequired(
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
export function validateLength(
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
    throw new ValidationError(`${fieldName} must be at most ${max} characters`);
  }
}

/**
 * Validate array size
 */
export function validateArraySize(
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
export function validateOwnership(
  resourceUserId: string,
  requestUserId: string,
  resourceName = "Resource"
): void {
  if (resourceUserId !== requestUserId) {
    throw new ValidationError(`${resourceName} does not belong to user`);
  }
}
