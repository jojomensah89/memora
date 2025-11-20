import { handleError } from "../../common/errors";
import type {
  CreateRuleInput,
  GetRuleInput,
  GetRulesForChatInput,
} from "./rule.inputs";
import * as RuleService from "./rule.service";

/**
 * Get all rules for current user
 */
export async function getRules(userId: string) {
  try {
    return await RuleService.getRules(userId);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get rules for specific chat
 */
export async function getChatRules(
  userId: string,
  input: GetRulesForChatInput
) {
  try {
    return await RuleService.getChatRules(input.chatId, userId);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get single rule by ID
 */
export async function getRule(userId: string, input: GetRuleInput) {
  try {
    return await RuleService.getRule(input.id, userId);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Create new rule
 */
export async function createRule(userId: string, input: CreateRuleInput) {
  try {
    return await RuleService.createRule(userId, input);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Update existing rule
 */
export async function updateRule(
  userId: string,
  id: string,
  input: Partial<CreateRuleInput>
) {
  try {
    return await RuleService.updateRule(userId, id, input);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Delete a rule
 */
export async function deleteRule(userId: string, id: string) {
  try {
    await RuleService.deleteRule(userId, id);
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}

/**
 * Toggle rule active status
 */
export async function toggleRule(userId: string, id: string) {
  try {
    return await RuleService.toggleRule(userId, id);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Link rule to a chat (for LOCAL rules)
 */
export async function linkRule(userId: string, ruleId: string, chatId: string) {
  try {
    await RuleService.linkRule(userId, ruleId, chatId);
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}

/**
 * Unlink rule from a chat
 */
export async function unlinkRule(
  userId: string,
  ruleId: string,
  chatId: string
) {
  try {
    await RuleService.unlinkRule(userId, ruleId, chatId);
    return { success: true };
  } catch (error) {
    handleError(error);
  }
}
