import type { ContextItem, ContextTag, ContextType } from "@memora/db";

// Re-export Prisma types
export type { ContextItem } from "@memora/db";

/**
 * Context Engine - Types
 */

export type ContextItemWithTags = ContextItem & {
  tags: ContextTag[];
};

export type ContextItemWithRelations = ContextItem & {
  tags: ContextTag[];
  _count?: {
    chatLinks: number;
    messages: number;
  };
};

export type ContextStats = {
  total: number;
  global: number;
  local: number;
  byType: Record<ContextType, number>;
  totalTokens: number;
  totalSize: number;
};

export type ContextListResult = {
  items: ContextItemWithTags[];
  stats: ContextStats;
};
