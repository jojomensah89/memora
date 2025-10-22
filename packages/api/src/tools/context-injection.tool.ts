import { tool } from "ai";
import { z } from "zod";

/**
 * Context Injection Tool
 * Injects selected context items into the conversation
 * Allows AI to reference uploaded files, URLs, documents, etc.
 */

export const contextInjectionTool = tool({
  description: `Access user's context items (files, documents, code) for reference.
Use this when you need to reference uploaded content, documentation, or any context the user has shared.`,

  parameters: z.object({
    query: z
      .string()
      .optional()
      .describe("Optional search query to filter context items"),
  }),

  execute: async ({ query }, { abortSignal }) => {
    // This will be populated by the chat service
    // The actual implementation fetches from database
    return {
      message: "Context injection tool - implementation in chat service",
      query,
    };
  },
});

/**
 * Helper to format context items for injection
 */
export function formatContextForPrompt(
  contextItems: Array<{ name: string; content: string; type: string }>
): string {
  if (contextItems.length === 0) {
    return "";
  }

  const formatted = contextItems
    .map(
      (item) => `
## Context: ${item.name} (${item.type})

${item.content}

---
`
    )
    .join("\n");

  return `
# Available Context

The following context items are available for reference:

${formatted}
`;
}
