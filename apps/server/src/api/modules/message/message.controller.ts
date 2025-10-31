import { handleError } from "../../common/errors";
import type {
  CreateMessageInput,
  DeleteMessageInput,
  GetMessageInput,
  GetMessagesByChatInput,
  UpdateMessageInput,
} from "./message.inputs";
import type { MessageService } from "./message.service";

export class MessageController {
  private readonly service: MessageService;

  constructor(service: MessageService) {
    this.service = service;
  }

  async createMessage(userId: string, input: CreateMessageInput) {
    try {
      return await this.service.createMessage(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  async getMessagesByChat(userId: string, input: GetMessagesByChatInput) {
    try {
      return await this.service.getMessagesByChat(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  async getMessage(userId: string, input: GetMessageInput) {
    try {
      return await this.service.getMessageById(userId, input.id);
    } catch (error) {
      handleError(error);
    }
  }

  async updateMessage(
    userId: string,
    messageId: string,
    input: UpdateMessageInput
  ) {
    try {
      await this.service.updateMessage(userId, messageId, input);
      return { success: true };
    } catch (error) {
      handleError(error);
    }
  }

  async deleteMessage(userId: string, input: DeleteMessageInput) {
    try {
      await this.service.deleteMessage(userId, input.id);
      return { success: true };
    } catch (error) {
      handleError(error);
    }
  }

  async getMessageStatistics(userId: string, chatId: string) {
    try {
      return await this.service.getMessageStatistics(userId, chatId);
    } catch (error) {
      handleError(error);
    }
  }
}
