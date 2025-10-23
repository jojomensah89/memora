import { protectedProcedure, router } from "../index";
import { RuleController } from "../modules/rules/rule.controller";
import {
  createRuleSchema,
  getRuleSchema,
  getRulesForChatSchema,
} from "../modules/rules/rule.inputs";
import { RuleRepository } from "../modules/rules/rule.repository";
import { RuleService } from "../modules/rules/rule.service";

/**
 * Rules Router
 * tRPC endpoints for rules management
 */

// Initialize dependencies
const ruleRepository = new RuleRepository();
const ruleService = new RuleService(ruleRepository);
const ruleController = new RuleController(ruleService);

export const rulesRouter = router({
  /**
   * Get all rules for current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) =>
    ruleController.getAll(ctx.session.user.id)
  ),

  /**
   * Get rules for specific chat (GLOBAL + LOCAL)
   */
  getForChat: protectedProcedure
    .input(getRulesForChatSchema)
    .query(async ({ ctx, input }) =>
      ruleController.getForChat(ctx.session.user.id, input)
    ),

  /**
   * Get single rule by ID
   */
  getById: protectedProcedure
    .input(getRuleSchema)
    .query(async ({ ctx, input }) =>
      ruleController.getById(ctx.session.user.id, input)
    ),

  /**
   * Create new rule
   */
  create: protectedProcedure
    .input(createRuleSchema)
    .mutation(async ({ ctx, input }) =>
      ruleController.create(ctx.session.user.id, input)
    ),

  /**
   * Update existing rule
   */
  update: protectedProcedure
    .input(getRuleSchema.extend({ data: createRuleSchema.partial() }))
    .mutation(async ({ ctx, input }) =>
      ruleController.update(ctx.session.user.id, input.id, input.data)
    ),

  /**
   * Delete a rule
   */
  delete: protectedProcedure
    .input(getRuleSchema)
    .mutation(async ({ ctx, input }) =>
      ruleController.delete(ctx.session.user.id, input.id)
    ),

  /**
   * Toggle rule active status
   */
  toggleActive: protectedProcedure
    .input(getRuleSchema)
    .mutation(async ({ ctx, input }) =>
      ruleController.toggleActive(ctx.session.user.id, input.id)
    ),

  /**
   * Link rule to a chat (for LOCAL rules)
   */
  linkToChat: protectedProcedure
    .input(
      z.object({
        ruleId: z.string().min(1),
        chatId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) =>
      ruleController.linkToChat(ctx.session.user.id, input.ruleId, input.chatId)
    ),

  /**
   * Unlink rule from a chat
   */
  unlinkFromChat: protectedProcedure
    .input(
      z.object({
        ruleId: z.string().min(1),
        chatId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) =>
      ruleController.unlinkFromChat(ctx.session.user.id, input.ruleId, input.chatId)
    ),
});
