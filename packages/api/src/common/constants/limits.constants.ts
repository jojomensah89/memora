/**
 * Application Limits and Constraints
 */

// File Upload Limits
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  MAX_FILES_PER_UPLOAD: 10,
  MAX_TOTAL_ATTACHMENT_SIZE: 25 * 1024 * 1024, // 25MB total
  BYTES_PER_KB: 1024,
  BYTES_PER_MB: 1024 * 1024,
  MAX_FILENAME_LENGTH: 255,
} as const;

// Context Limits
export const CONTEXT_LIMITS = {
  MAX_CONTEXT_ITEMS_PER_CHAT: 50,
  MAX_CONTEXT_SIZE: 100 * 1024, // 100KB per item
  MAX_TOKEN_COUNT: 100_000, // Max tokens per context item
} as const;

// Rules Limits
export const RULE_LIMITS = {
  MAX_RULES_PER_CHAT: 20,
  MAX_RULE_LENGTH: 10_000, // characters
  MAX_RULES_GLOBAL: 50,
} as const;

// Chat Limits
export const CHAT_LIMITS = {
  MAX_TITLE_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 50_000,
  MAX_MESSAGES_PER_CHAT: 1000,
} as const;

// Pagination Limits
export const PAGINATION_LIMITS = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// Rate Limits (per minute)
export const RATE_LIMITS = {
  CHAT_MESSAGES: 60,
  FILE_UPLOADS: 10,
  CONTEXT_CREATION: 30,
} as const;

// Token Limits (monthly)
export const TOKEN_LIMITS = {
  DEFAULT_USER_LIMIT: 1_000_000, // 1M tokens
  DEFAULT_ORG_LIMIT: 10_000_000, // 10M tokens
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  // Client Errors (4xx)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;
