import { tool } from "ai";
import { z } from "zod";

/**
 * Rules Application Tool
 * Applies user-defined rules to guide AI behavior
 * Rules define tone, style, coding standards, preferences, etc.
 */

export const rulesApplicationTool = tool({
  description: `Apply user-defined rules and preferences to guide your behavior.
These rules define how you should respond, code style, tone, formatting, etc.
Always check and apply relevant rules before responding.`,

  parameters: z.object({
    category: z
      .enum(["coding", "writing", "general", "all"])
      .optional()
      .describe("Category of rules to apply"),
  }),

  execute: async ({ category }, { abortSignal }) => {
    // This will be populated by the chat service
    // The actual implementation fetches from database
    return {
      message: "Rules application tool - implementation in chat service",
      category,
    };
  },
});

/**
 * Helper to format rules for system prompt
 */
export function formatRulesForPrompt(
  rules: Array<{ name: string; content: string; scope: string }>
): string {
  if (rules.length === 0) {
    return "";
  }

  const globalRules = rules.filter((r) => r.scope === "GLOBAL");
  const localRules = rules.filter((r) => r.scope === "LOCAL");

  let formatted = "# Active Rules\n\n";
  formatted += "You must follow these rules when generating responses:\n\n";

  if (globalRules.length > 0) {
    formatted += "## Global Rules (Always Apply)\n\n";
    globalRules.forEach((rule) => {
      formatted += `### ${rule.name}\n\n${rule.content}\n\n---\n\n`;
    });
  }

  if (localRules.length > 0) {
    formatted += "## Chat-Specific Rules\n\n";
    localRules.forEach((rule) => {
      formatted += `### ${rule.name}\n\n${rule.content}\n\n---\n\n`;
    });
  }

  return formatted;
}
