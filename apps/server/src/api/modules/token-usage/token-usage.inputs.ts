import { z } from "zod";

export const createTokenUsageInputSchema = z.object({
  provider: z.enum(["CLAUDE", "GEMINI", "OPENAI"]),
  modelId: z.string().min(1),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
  chatId: z.string().min(1),
  messageId: z.string().min(1),
});

export const getTokenUsageStatsInputSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  provider: z.enum(["CLAUDE", "GEMINI", "OPENAI"]).optional(),
  modelId: z.string().optional(),
  chatId: z.string().optional(),
});

export const getTokenUsageByChatInputSchema = z.object({
  chatId: z.string().min(1),
});

export const getTokenUsageOverTimeInputSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  provider: z.enum(["CLAUDE", "GEMINI", "OPENAI"]).optional(),
  modelId: z.string().optional(),
});

export type CreateTokenUsageInput = z.infer<typeof createTokenUsageInputSchema>;
export type GetTokenUsageStatsInput = z.infer<
  typeof getTokenUsageStatsInputSchema
>;
export type GetTokenUsageByChatInput = z.infer<
  typeof getTokenUsageByChatInputSchema
>;
export type GetTokenUsageOverTimeInput = z.infer<
  typeof getTokenUsageOverTimeInputSchema
>;
