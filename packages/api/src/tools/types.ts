/**
 * Tool Types
 * Shared types for AI SDK tools
 */

export type ContextItem = {
  id: string;
  name: string;
  content: string;
  type: string;
  scope: string;
};

export type Rule = {
  id: string;
  name: string;
  content: string;
  scope: string;
};

export type ToolContext = {
  userId: string;
  chatId?: string;
  contextItems?: ContextItem[];
  rules?: Rule[];
};
