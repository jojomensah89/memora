// Export the new Hono app
export { default as createApp } from "./app";

// Re-export types and utilities for frontend use
export * from "./modules/attachment/attachment.inputs";
export type {
  CreateChatInput,
  EnhancePromptInput,
  ForkChatInput,
  GetChatInput,
  ListChatsInput,
} from "./modules/chat/chat.inputs";
export * from "./modules/context-engine/context-item.inputs";
export type {
  CreateMessageInput,
  DeleteMessageInput,
  GetMessageInput,
  GetMessagesByChatInput,
  UpdateMessageInput,
} from "./modules/message/message.inputs";
export * from "./modules/rules/rule.inputs";
