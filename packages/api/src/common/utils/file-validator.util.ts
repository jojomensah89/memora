import { FILE_LIMITS } from "../constants";
import { ValidationError } from "../errors";

/**
 * File Validation Utilities
 */

const ALLOWED_MIME_TYPES = {
  images: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  documents: [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/json",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  code: [
    "text/javascript",
    "text/typescript",
    "text/html",
    "text/css",
    "application/javascript",
    "application/typescript",
  ],
} as const;

/**
 * Validate file size
 */
export function validateFileSize(size: number): void {
  if (size > FILE_LIMITS.MAX_FILE_SIZE) {
    throw new ValidationError(
      `File size exceeds maximum allowed size of ${FILE_LIMITS.MAX_FILE_SIZE / FILE_LIMITS.BYTES_PER_MB}MB`
    );
  }

  if (size <= 0) {
    throw new ValidationError("File size must be greater than 0");
  }
}

/**
 * Validate MIME type
 */
export function validateMimeType(mimeType: string): void {
  const allAllowedTypes = [
    ...ALLOWED_MIME_TYPES.images,
    ...ALLOWED_MIME_TYPES.documents,
    ...ALLOWED_MIME_TYPES.code,
  ];

  if (!allAllowedTypes.includes(mimeType as string)) {
    throw new ValidationError(`File type ${mimeType} is not supported`);
  }
}

/**
 * Validate filename
 */
export function validateFilename(filename: string): void {
  if (!filename || filename.trim().length === 0) {
    throw new ValidationError("Filename cannot be empty");
  }

  // Check for path traversal attempts
  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    throw new ValidationError("Invalid filename");
  }

  // Check length
  if (filename.length > FILE_LIMITS.MAX_FILENAME_LENGTH) {
    throw new ValidationError(
      `Filename too long (max ${FILE_LIMITS.MAX_FILENAME_LENGTH} characters)`
    );
  }
}

/**
 * Validate array of files
 */
export function validateFileArray(files: Array<{ size: number }>): void {
  if (files.length > FILE_LIMITS.MAX_FILES_PER_UPLOAD) {
    throw new ValidationError(
      `Cannot upload more than ${FILE_LIMITS.MAX_FILES_PER_UPLOAD} files at once`
    );
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > FILE_LIMITS.MAX_TOTAL_ATTACHMENT_SIZE) {
    throw new ValidationError(
      `Total file size exceeds maximum of ${FILE_LIMITS.MAX_TOTAL_ATTACHMENT_SIZE / FILE_LIMITS.BYTES_PER_MB}MB`
    );
  }
}

/**
 * Get file category from MIME type
 */
export function getFileCategory(
  mimeType: string
): "image" | "document" | "code" | "unknown" {
  if (ALLOWED_MIME_TYPES.images.includes(mimeType as string)) return "image";
  if (ALLOWED_MIME_TYPES.documents.includes(mimeType as string))
    return "document";
  if (ALLOWED_MIME_TYPES.code.includes(mimeType as string)) return "code";
  return "unknown";
}
