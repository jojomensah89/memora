/**
 * Prompt Builder
 * Handles system prompt construction and context injection
 */

import type { ModelMessage } from "ai";

type Rule = {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  scope: "LOCAL" | "GLOBAL";
};

type ContextItem = {
  id: string;
  name: string;
  content: string;
  type: "FILE" | "URL" | "GITHUB_REPO" | "DOCUMENT";
  scope: "LOCAL" | "GLOBAL";
};

/**
 * Build system prompt with rules
 */
export function buildSystemPrompt(rules: Rule[]): string {
  const activeRules = rules.filter((rule) => rule.isActive);

  if (activeRules.length === 0) {
    return "You are a helpful AI assistant. Be concise, accurate, and helpful.";
  }

  // Separate global and local rules for clarity
  const globalRules = activeRules.filter((rule) => rule.scope === "GLOBAL");
  const localRules = activeRules.filter((rule) => rule.scope === "LOCAL");

  const sections: string[] = [
    "You are a helpful AI assistant. Follow these rules carefully:",
  ];

  if (globalRules.length > 0) {
    sections.push("\n## Global Rules (apply to all conversations)");
    for (const rule of globalRules) {
      sections.push(`\n### ${rule.name}`);
      sections.push(rule.content);
    }
  }

  if (localRules.length > 0) {
    sections.push("\n## Conversation-Specific Rules");
    for (const rule of localRules) {
      sections.push(`\n### ${rule.name}`);
      sections.push(rule.content);
    }
  }

  sections.push(
    "\n---\nIf rules conflict, use your best judgment while prioritizing user safety and helpfulness."
  );

  return sections.join("\n");
}

/**
 * Inject context into conversation messages
 */
export function injectContext(
  messages: ModelMessage[],
  context: ContextItem[]
): ModelMessage[] {
  if (context.length === 0) {
    return messages;
  }

  // Build context content
  const contextSections: string[] = [
    "# Available Context",
    "\nThe following context is available for this conversation. Reference it when relevant:\n",
  ];

  for (const item of context) {
    contextSections.push(`\n## ${item.name} (${item.type})`);

    // Truncate very long content
    const maxLength = 10_000;
    const content =
      item.content.length > maxLength
        ? `${item.content.substring(0, maxLength)}\n\n[Content truncated - ${item.content.length} total characters]`
        : item.content;

    contextSections.push(content);
    contextSections.push("---");
  }

  const contextMessage: ModelMessage = {
    role: "system",
    content: contextSections.join("\n"),
  };

  // Insert context after system prompt (if exists) or at start
  const systemMessageIndex = messages.findIndex((m) => m.role === "system");

  if (systemMessageIndex >= 0) {
    // Insert after system message
    return [
      ...messages.slice(0, systemMessageIndex + 1),
      contextMessage,
      ...messages.slice(systemMessageIndex + 1),
    ];
  }

  // Insert at start
  return [contextMessage, ...messages];
}

/**
 * Format context summary for display
 */
export function formatContextSummary(context: ContextItem[]): string {
  if (context.length === 0) {
    return "No context attached";
  }

  const byType: Record<string, number> = {};
  for (const item of context) {
    byType[item.type] = (byType[item.type] || 0) + 1;
  }

  const parts: string[] = [];
  for (const [type, count] of Object.entries(byType)) {
    parts.push(`${count} ${type.toLowerCase()}${count > 1 ? "s" : ""}`);
  }

  return `Context: ${parts.join(", ")}`;
}

/**
 * Format rules summary for display
 */
export function formatRulesSummary(rules: Rule[]): string {
  const activeRules = rules.filter((r) => r.isActive);

  if (activeRules.length === 0) {
    return "No active rules";
  }

  const globalCount = activeRules.filter((r) => r.scope === "GLOBAL").length;
  const localCount = activeRules.filter((r) => r.scope === "LOCAL").length;

  const parts: string[] = [];
  if (globalCount > 0) {
    parts.push(`${globalCount} global`);
  }
  if (localCount > 0) {
    parts.push(`${localCount} local`);
  }

  return `Active rules: ${parts.join(", ")}`;
}

/**
 * Generate chat title from first message
 */
export function generateChatTitle(message: string, maxLength = 50): string {
  // Clean the message
  const cleaned = message.trim().replace(/\s+/g, " ");

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Truncate at word boundary
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.7) {
    return `${truncated.substring(0, lastSpace)}...`;
  }

  return `${truncated}...`;
}

/**
 * Sanitize user input to prevent prompt injection
 */
export function sanitizeUserInput(input: string): string {
  // Remove potential prompt injection attempts
  const dangerous = [
    /ignore\s+previous\s+instructions?/gi,
    /disregard\s+all\s+previous/gi,
    /forget\s+everything/gi,
    /you\s+are\s+now/gi,
    /new\s+instructions?:/gi,
  ];

  let sanitized = input;
  for (const pattern of dangerous) {
    sanitized = sanitized.replace(pattern, "[FILTERED]");
  }

  return sanitized;
}
