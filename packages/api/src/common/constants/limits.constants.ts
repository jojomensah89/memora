/**
 * Application Limits and Constraints
 */

// File Upload Limits
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  MAX_FILES_PER_UPLOAD: 10,
  MAX_TOTAL_ATTACHMENT_SIZE: 25 * 1024 * 1024, // 25MB total
} as const;

// Context Limits
export const CONTEXT_LIMITS = {
  MAX_CONTEXT_ITEMS_PER_CHAT: 50,
  MAX_CONTEXT_SIZE: 100 * 1024, // 100KB per item
  MAX_TOKEN_COUNT: 100000, // Max tokens per context item
} as const;

// Rules Limits
export const RULE_LIMITS = {
  MAX_RULES_PER_CHAT: 20,
  MAX_RULE_LENGTH: 10000, // characters
  MAX_RULES_GLOBAL: 50,
} as const;

// Chat Limits
export const CHAT_LIMITS = {
  MAX_TITLE_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 50000,
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
  DEFAULT_USER_LIMIT: 1000000, // 1M tokens
  DEFAULT_ORG_LIMIT: 10000000, // 10M tokens
} as const;
