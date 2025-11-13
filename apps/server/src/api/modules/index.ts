import type { ChatModule, ChatModuleDependencies } from "./chat/chat.module";
import { createChatModule } from "./chat/chat.module";

export type ModuleRegistry = {
  chat: ChatModule;
};

export type ModuleConfig = {
  chat?: ChatModuleDependencies;
};

export function createModuleRegistry(
  config: ModuleConfig = {}
): ModuleRegistry {
  return {
    chat: createChatModule(config.chat),
  };
}
