import { handleError } from "../../common/errors";
import type {
  CreateRuleInput,
  GetRuleInput,
  GetRulesForChatInput,
} from "./rule.inputs";
import type { RuleService } from "./rule.service";

/**
 * Rule Controller
 * Handles requests and orchestrates service calls
 * All errors are caught and handled here
 */
export class RuleController {
  constructor(private service: RuleService) {}

  /**
   * Get all rules for current user
   */
  async getAll(userId: string) {
    try {
      return await this.service.getAll(userId);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get rules for specific chat
   */
  async getForChat(userId: string, input: GetRulesForChatInput) {
    try {
      return await this.service.getForChat(input.chatId, userId);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get single rule by ID
   */
  async getById(userId: string, input: GetRuleInput) {
    try {
      return await this.service.getById(input.id, userId);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Create new rule
   */
  async create(userId: string, input: CreateRuleInput) {
    try {
      return await this.service.create(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Update existing rule
   */
  async update(userId: string, id: string, input: Partial<CreateRuleInput>) {
    try {
      return await this.service.update(userId, id, input);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Delete a rule
   */
  async delete(userId: string, id: string) {
    try {
      await this.service.delete(userId, id);
      return { success: true };
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Toggle rule active status
   */
  async toggleActive(userId: string, id: string) {
    try {
      return await this.service.toggleActive(userId, id);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Link rule to a chat (for LOCAL rules)
   */
  async linkToChat(userId: string, ruleId: string, chatId: string) {
    try {
      await this.service.linkToChat(userId, ruleId, chatId);
      return { success: true };
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Unlink rule from a chat
   */
  async unlinkFromChat(userId: string, ruleId: string, chatId: string) {
    try {
      await this.service.unlinkFromChat(userId, ruleId, chatId);
      return { success: true };
    } catch (error) {
      handleError(error);
    }
  }
}
