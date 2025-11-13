import { ChatController } from "./chat.controller";
import type { EnhancePromptInput } from "./chat.inputs";
import { ChatRepository } from "./chat.repository";
import { ChatService } from "./chat.service";

type PromptEnhancer = {
  enhance: (
    input: EnhancePromptInput & {
      context?: unknown;
    }
  ) => Promise<{
    enhancedText: string;
    useWebSearchApplied: boolean;
    suggestions?: string[];
  }>;
};

export type ChatModuleDependencies = {
  enhancer?: PromptEnhancer;
};

export type ChatModule = {
  repository: ChatRepository;
  service: ChatService;
  controller: ChatController;
};

export function createChatModule(
  deps: ChatModuleDependencies = {}
): ChatModule {
  const repository = new ChatRepository();
  const enhancer = deps.enhancer ?? createPassThroughEnhancer();
  const service = new ChatService(repository, enhancer);
  const controller = new ChatController(service);

  return {
    repository,
    service,
    controller,
  };
}

function createPassThroughEnhancer(): PromptEnhancer {
  return {
    async enhance(input) {
      return {
        enhancedText: input.text,
        useWebSearchApplied: Boolean(input.useWebSearch),
        suggestions: [],
      };
    },
  };
}
