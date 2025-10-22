import { router, protectedProcedure } from "../index";
import { RuleRepository } from "../modules/rules/rule.repository";
import { RuleService } from "../modules/rules/rule.service";
import { RuleController } from "../modules/rules/rule.controller";
import {
  createRuleSchema,
  getRuleSchema,
  getRulesForChatSchema,
} from "../modules/rules/rule.inputs";

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
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ruleController.getAll(ctx.session.user.id);
  }),

  /**
   * Get rules for specific chat (GLOBAL + LOCAL)
   */
  getForChat: protectedProcedure
    .input(getRulesForChatSchema)
    .query(async ({ ctx, input }) => {
      return ruleController.getForChat(ctx.session.user.id, input);
    }),

  /**
   * Get single rule by ID
   */
  getById: protectedProcedure
    .input(getRuleSchema)
    .query(async ({ ctx, input }) => {
      return ruleController.getById(ctx.session.user.id, input);
    }),

  /**
   * Create new rule
   */
  create: protectedProcedure
    .input(createRuleSchema)
    .mutation(async ({ ctx, input }) => {
      return ruleController.create(ctx.session.user.id, input);
    }),

  // TODO: Add later
  // update: protectedProcedure.input(updateRuleSchema).mutation(...),
  // delete: protectedProcedure.input(deleteRuleSchema).mutation(...),
  // toggleActive: protectedProcedure.input(toggleRuleSchema).mutation(...),
});
