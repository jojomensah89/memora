import { z } from "zod";

/**
 * Rules Module - Input Schemas
 * Zod validation schemas for rules operations
 */

export const createRuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(10_000, "Content too long"),
  scope: z.enum(["LOCAL", "GLOBAL"]).default("GLOBAL"),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).optional().default([]),
  chatId: z.string().optional(), // Required if scope is LOCAL
});

export const updateRuleSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  content: z.string().min(1).max(10_000).optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const getRuleSchema = z.object({
  id: z.string(),
});

export const getRulesForChatSchema = z.object({
  chatId: z.string(),
});

export const toggleRuleSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
});

export const deleteRuleSchema = z.object({
  id: z.string(),
});

// Type exports
export type CreateRuleInput = z.infer<typeof createRuleSchema>;
export type UpdateRuleInput = z.infer<typeof updateRuleSchema>;
export type GetRuleInput = z.infer<typeof getRuleSchema>;
export type GetRulesForChatInput = z.infer<typeof getRulesForChatSchema>;
export type ToggleRuleInput = z.infer<typeof toggleRuleSchema>;
export type DeleteRuleInput = z.infer<typeof deleteRuleSchema>;
