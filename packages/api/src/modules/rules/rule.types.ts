import type { Rule, RuleTag } from "@prisma/client";

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

export interface RuleStats {
  total: number;
  global: number;
  local: number;
  active: number;
  inactive: number;
}

export interface RuleListResult {
  rules: RuleWithTags[];
  stats: RuleStats;
}
