import { handleError } from "../../common/errors";
import type {
  CreateChatInput,
  EnhancePromptInput,
  ForkChatInput,
  GetChatInput,
  ListChatsInput,
} from "./chat.inputs";
import type { ChatService } from "./chat.service";

export class ChatController {
  private readonly service: ChatService;

  constructor(service: ChatService) {
    this.service = service;
  }

  async createChat(userId: string, input: CreateChatInput) {
    try {
      return await this.service.createChat(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  async listChats(userId: string, input: ListChatsInput) {
    try {
      return await this.service.listUserChats(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  async getChat(userId: string, input: GetChatInput) {
    try {
      return await this.service.getChatById(input.id, userId);
    } catch (error) {
      handleError(error);
    }
  }

  getModels() {
    try {
      return this.service.getAvailableModels();
    } catch (error) {
      handleError(error);
    }
  }

  async enhancePrompt(userId: string, input: EnhancePromptInput) {
    try {
      return await this.service.enhancePrompt(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  async forkChat(userId: string, input: ForkChatInput) {
    try {
      return await this.service.forkChat(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  async generateAIResponse(userId: string, chatId: string, message: string) {
    try {
      return await this.service.generateAIResponse(userId, chatId, message);
    } catch (error) {
      handleError(error);
    }
  }
}
