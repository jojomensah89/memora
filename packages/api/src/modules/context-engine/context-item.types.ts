import type { ContextItem, ContextScope, ContextType, ContextTag } from "@prisma/client";

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

export interface ContextStats {
  total: number;
  global: number;
  local: number;
  byType: Record<ContextType, number>;
  totalTokens: number;
  totalSize: number;
}

export interface ContextListResult {
  items: ContextItemWithTags[];
  stats: ContextStats;
}
