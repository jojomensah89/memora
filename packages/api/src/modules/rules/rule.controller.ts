import { handleError } from "../../common/errors";
import type { RuleService } from "./rule.service";
import type {
  CreateRuleInput,
  GetRuleInput,
  GetRulesForChatInput,
} from "./rule.inputs";

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

  // TODO: Implement later
  // - update()
  // - delete()
  // - toggleActive()
}
