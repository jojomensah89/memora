import { RULE_LIMITS } from "../../common/constants";
import { RuleNotFoundError, ValidationError } from "../../common/errors";
import { errorLogger, perfLogger } from "../../common/logger";
import { validateLength, validateRequired } from "../../common/utils/validation.util";
import type { CreateRuleInput } from "./rule.inputs";
import * as RuleRepository from "./rule.repository";
import type { RuleListResult, RuleWithTags } from "./rule.types";

const MODULE = "RuleService";

/**
 * Get all rules for user
 */
export async function getRules(userId: string): Promise<RuleListResult> {
  const perf = perfLogger("rules.getAll", { module: MODULE, userId });

  const [rules, stats] = await Promise.all([
    RuleRepository.findRulesByUser(userId),
    RuleRepository.getRuleStats(userId),
  ]);

  perf.end();

  return { rules, stats };
}

/**
 * Get rules applicable to a chat (GLOBAL + LOCAL)
 */
export async function getChatRules(
  chatId: string,
  userId: string
): Promise<RuleWithTags[]> {
  validateRequired(chatId, "Chat ID");
  return RuleRepository.findRulesForChat(chatId, userId);
}

/**
 * Get single rule by ID
 */
export async function getRule(id: string, userId: string): Promise<RuleWithTags> {
  validateRequired(id, "Rule ID");

  const rule = await RuleRepository.findRuleById(id, userId);

  if (!rule) {
    throw new RuleNotFoundError("Rule not found");
  }

  return rule;
}

/**
 * Create a new rule
 */
export async function createRule(
  userId: string,
  input: CreateRuleInput
): Promise<RuleWithTags> {
  // Validation
  validateRequired(input.name, "Rule name");
  validateRequired(input.content, "Rule content");
  validateLength(input.name, "Name", 1, 100);
  validateLength(
    input.content,
    "Content",
    1,
    RULE_LIMITS.MAX_RULE_LENGTH
  );

  if (input.description) {
    validateLength(input.description, "Description", 0, 500);
  }

  // Check limits
  const stats = await RuleRepository.getRuleStats(userId);

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
  return RuleRepository.createRule(userId, input);
}

export async function updateRule(
  userId: string,
  id: string,
  input: Partial<CreateRuleInput>
) {
  const rule = await RuleRepository.findRuleById(id, userId);
  if (!rule) {
    throw new RuleNotFoundError("Rule not found");
  }

  // Validate content if provided
  if (input.content) {
    validateLength(
      input.content,
      "Content",
      1,
      RULE_LIMITS.MAX_RULE_LENGTH
    );
  }

  // Validate description if provided
  if (input.description) {
    validateLength(input.description, "Description", 0, 500);
  }

  return await RuleRepository.updateRule(id, userId, input);
}

export async function deleteRule(userId: string, id: string) {
  const rule = await RuleRepository.findRuleById(id, userId);
  if (!rule) {
    throw new RuleNotFoundError("Rule not found");
  }

  await RuleRepository.deleteRule(id, userId);
}

export async function toggleRule(userId: string, id: string) {
  const perf = perfLogger("rules.toggleActive", {
    module: MODULE,
    userId,
    ruleId: id,
  });

  try {
    const rule = await RuleRepository.findRuleById(id, userId);
    if (!rule) {
      throw new RuleNotFoundError("Rule not found");
    }

    const result = await RuleRepository.toggleRuleActive(id, userId);
    perf.end();
    return result;
  } catch (error) {
    errorLogger("Failed to toggle rule active status", error, {
      module: MODULE,
      userId,
      action: "toggleActive",
      ruleId: id,
    });
    throw error;
  }
}

export async function linkRule(userId: string, ruleId: string, chatId: string) {
  const rule = await RuleRepository.findRuleById(ruleId, userId);
  if (!rule) {
    throw new RuleNotFoundError("Rule not found");
  }

  // Verify chat ownership
  const hasOwnership = await RuleRepository.validateChatOwnership(
    chatId,
    userId
  );

  if (!hasOwnership) {
    throw new ValidationError("Chat not found or access denied");
  }

  await RuleRepository.linkRuleToChat(ruleId, chatId, userId);
}

export async function unlinkRule(userId: string, ruleId: string, chatId: string) {
  const rule = await RuleRepository.findRuleById(ruleId, userId);
  if (!rule) {
    throw new RuleNotFoundError("Rule not found");
  }

  await RuleRepository.unlinkRuleFromChat(ruleId, chatId, userId);
}
