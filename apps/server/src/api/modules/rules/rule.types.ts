import type { Rule, RuleTag } from "@prisma/client";

// Re-export Prisma types
export type { Rule } from "@prisma/client";

/**
 * Rules Module - Types
 */

export type RuleWithTags = Rule & {
  tags: RuleTag[];
};

export type RuleWithRelations = Rule & {
  tags: RuleTag[];
  _count?: {
    chatLinks: number;
    messages: number;
  };
};

export type RuleStats = {
  total: number;
  global: number;
  local: number;
  active: number;
  inactive: number;
};

export type RuleListResult = {
  rules: RuleWithTags[];
  stats: RuleStats;
};
