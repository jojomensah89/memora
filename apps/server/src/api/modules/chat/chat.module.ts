import { ChatController } from "./chat.controller";
import type { EnhancePromptInput } from "./chat.inputs";
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
  service: ChatService;
  controller: ChatController;
};

export function createChatModule(
  deps: ChatModuleDependencies = {}
): ChatModule {
  const enhancer = deps.enhancer ?? createPassThroughEnhancer();
  const service = new ChatService(enhancer);
  const controller = new ChatController(service);

  return {
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
