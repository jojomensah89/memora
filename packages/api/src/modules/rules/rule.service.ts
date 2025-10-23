import { BaseService } from "../../common/base";
import { RULE_LIMITS } from "../../common/constants";
import { RuleNotFoundError, ValidationError } from "../../common/errors";
import type { CreateRuleInput } from "./rule.inputs";
import type { RuleRepository } from "./rule.repository";
import type { RuleListResult, RuleWithTags } from "./rule.types";

/**
 * Rule Service
 * Contains business logic for rules management
 */
export class RuleService extends BaseService {
  constructor(private repository: RuleRepository) {
    super();
  }

  /**
   * Get all rules for user
   */
  async getAll(userId: string): Promise<RuleListResult> {
    const logger = this.getLogger({ userId, action: 'getAll' });
    const perf = this.getPerfLogger('rules.getAll', { userId });
    
    logger('Fetching all rules for user');
    const [rules, stats] = await Promise.all([
      this.repository.findAllByUser(userId),
      this.repository.getStats(userId),
    ]);

    perf.end();
    logger(`Found ${rules.length} rules for user`);
    
    return { rules, stats };
  }

  /**
   * Get rules applicable to a chat (GLOBAL + LOCAL)
   */
  async getForChat(chatId: string, userId: string): Promise<RuleWithTags[]> {
    this.validateRequired(chatId, "Chat ID");
    return this.repository.findForChat(chatId, userId);
  }

  /**
   * Get single rule by ID
   */
  async getById(id: string, userId: string): Promise<RuleWithTags> {
    this.validateRequired(id, "Rule ID");

    const rule = await this.repository.findById(id, userId);

    if (!rule) {
      throw new RuleNotFoundError("Rule not found");
    }

    return rule;
  }

  /**
   * Create a new rule
   */
  async create(userId: string, input: CreateRuleInput): Promise<RuleWithTags> {
    // Validation
    this.validateRequired(input.name, "Rule name");
    this.validateRequired(input.content, "Rule content");
    this.validateLength(input.name, "Name", 1, 100);
    this.validateLength(
      input.content,
      "Content",
      1,
      RULE_LIMITS.MAX_RULE_LENGTH
    );

    if (input.description) {
      this.validateLength(input.description, "Description", 0, 500);
    }

    // Check limits
    const stats = await this.repository.getStats(userId);

    if (
      input.scope === "GLOBAL" &&
      stats.global >= RULE_LIMITS.MAX_RULES_GLOBAL
    ) {
      throw new ValidationError(
        `Maximum ${RULE_LIMITS.MAX_RULES_GLOBAL} global rules allowed`
      );
    }

    // Validate LOCAL scope has chatId
    if (input.scope === "LOCAL" && !input.chatId) {
      throw new ValidationError("Chat ID required for LOCAL scope rules");
    }

    // Create rule
    return this.repository.create(userId, input);
  }

  async update(userId: string, id: string, input: Partial<CreateRuleInput>) {
    const rule = await this.repository.findById(id, userId);
    if (!rule) {
      throw new RuleNotFoundError("Rule not found");
    }

    // Validate content if provided
    if (input.content) {
      this.validateLength(
        input.content,
        "Content",
        1,
        RULE_LIMITS.MAX_RULE_LENGTH
      );
    }

    // Validate description if provided
    if (input.description) {
      this.validateLength(input.description, "Description", 0, 500);
    }

    return await this.repository.update(id, userId, input);
  }

  async delete(userId: string, id: string) {
    const rule = await this.repository.findById(id, userId);
    if (!rule) {
      throw new RuleNotFoundError("Rule not found");
    }

    await this.repository.delete(id, userId);
  }

  async toggleActive(userId: string, id: string) {
    const logger = this.getLogger({ userId, action: 'toggleActive' });
    const perf = this.getPerfLogger('rules.toggleActive', { userId, ruleId: id });
    
    try {
      logger('Toggling rule active status', `ruleId=${id}`);
      
      const rule = await this.repository.findById(id, userId);
      if (!rule) {
        throw new RuleNotFoundError("Rule not found");
      }

      const result = await this.repository.toggleActive(id, userId);
      perf.end();
      logger('Rule active status toggled', `ruleId=${id}, isActive=${result.isActive}`);
      
      return result;
    } catch (error) {
      this.getErrorLogger({ userId, action: 'toggleActive', ruleId: id })(
        'Failed to toggle rule active status', error
      );
      throw error;
    }
  }

  async linkToChat(userId: string, ruleId: string, chatId: string) {
    const rule = await this.repository.findById(ruleId, userId);
    if (!rule) {
      throw new RuleNotFoundError("Rule not found");
    }

    // Verify chat ownership
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new ValidationError("Chat not found or access denied");
    }

    await this.repository.linkToChat(ruleId, chatId, userId);
  }

  async unlinkFromChat(userId: string, ruleId: string, chatId: string) {
    const rule = await this.repository.findById(ruleId, userId);
    if (!rule) {
      throw new RuleNotFoundError("Rule not found");
    }

    await this.repository.unlinkFromChat(ruleId, chatId, userId);
  }
}
