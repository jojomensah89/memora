/**
 * Tool Types
 * Shared types for AI SDK tools
 */

export interface ContextItem {
  id: string;
  name: string;
  content: string;
  type: string;
  scope: string;
}

export interface Rule {
  id: string;
  name: string;
  content: string;
  scope: string;
}

export interface ToolContext {
  userId: string;
  chatId?: string;
  contextItems?: ContextItem[];
  rules?: Rule[];
}
