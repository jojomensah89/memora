import { protectedProcedure, router } from "../index";
import { TokenUsageController } from "../modules/token-usage/token-usage.controller";
import {
  createTokenUsageInputSchema,
  getTokenUsageByChatInputSchema,
  getTokenUsageOverTimeInputSchema,
  getTokenUsageStatsInputSchema,
} from "../modules/token-usage/token-usage.inputs";
import { TokenUsageRepository } from "../modules/token-usage/token-usage.repository";
import { TokenUsageService } from "../modules/token-usage/token-usage.service";

const tokenUsageRepository = new TokenUsageRepository();
const tokenUsageService = new TokenUsageService(tokenUsageRepository);
const tokenUsageController = new TokenUsageController(tokenUsageService);

export const tokenUsageRouter = router({
  // Track token usage for a message
  track: protectedProcedure
    .input(createTokenUsageInputSchema)
    .mutation(async ({ ctx, input }) =>
      tokenUsageController.trackUsage(ctx.session.user.id, input)
    ),

  // Get usage statistics for user
  getStatistics: protectedProcedure
    .input(getTokenUsageStatsInputSchema.optional())
    .query(async ({ ctx, input }) =>
      tokenUsageController.getStatistics(ctx.session.user.id, input || {})
    ),

  // Get usage over time (for charts)
  getOverTime: protectedProcedure
    .input(getTokenUsageOverTimeInputSchema.optional())
    .query(async ({ ctx, input }) =>
      tokenUsageController.getUsageOverTime(ctx.session.user.id, input || {})
    ),

  // Get usage for a specific chat
  getByChat: protectedProcedure
    .input(getTokenUsageByChatInputSchema)
    .query(async ({ ctx, input }) =>
      tokenUsageController.getUsageByChat(ctx.session.user.id, input)
    ),
});
