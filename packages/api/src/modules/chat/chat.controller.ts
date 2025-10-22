import type { CreateChatInput, EnhancePromptInput } from "./chat.inputs";
import type { ChatService } from "./chat.service";

type CreateChatControllerInput = {
  userId: string;
  input: CreateChatInput;
};

type ListChatsInput = {
  userId: string;
  includeArchived: boolean;
  limit: number;
  cursor?: string;
};

type GetChatInput = {
  id: string;
  userId: string;
};

type EnhancePromptControllerInput = {
  userId: string;
  input: EnhancePromptInput;
};

export class ChatController {
  private readonly chatService: ChatService;

  constructor(chatService: ChatService) {
    this.chatService = chatService;
  }

  createChat({ userId, input }: CreateChatControllerInput) {
    return this.chatService.createChat(userId, input);
  }

  listChats({ userId, includeArchived, limit, cursor }: ListChatsInput) {
    return this.chatService.listUserChats(
      userId,
      includeArchived,
      limit,
      cursor
    );
  }

  getChat({ id, userId }: GetChatInput) {
    return this.chatService.getChatById(id, userId);
  }

  getModels() {
    return this.chatService.getAvailableModels();
  }

  enhancePrompt({ userId, input }: EnhancePromptControllerInput) {
    return this.chatService.enhancePrompt(userId, input);
  }
}
