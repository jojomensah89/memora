import { handleError } from "../../common/errors";
import type {
  GetContextForChatInput,
  GetContextItemInput,
  PromoteToGlobalInput,
  UploadFileInput,
} from "./context-item.inputs";
import type { ContextItemService } from "./context-item.service";

/**
 * Context Item Controller
 * Handles requests and orchestrates service calls
 * All errors are caught and handled here
 */
export class ContextItemController {
  constructor(private service: ContextItemService) {}

  /**
   * Get all context items for current user
   */
  async getAll(userId: string) {
    try {
      return await this.service.getAll(userId);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get context items for specific chat
   */
  async getForChat(userId: string, input: GetContextForChatInput) {
    try {
      return await this.service.getForChat(input.chatId, userId);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Get single context item by ID
   */
  async getById(userId: string, input: GetContextItemInput) {
    try {
      return await this.service.getById(input.id, userId);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Upload file and create LOCAL context
   */
  async uploadFile(userId: string, input: UploadFileInput) {
    try {
      return await this.service.uploadFile(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Promote LOCAL context to GLOBAL
   */
  async promoteToGlobal(userId: string, input: PromoteToGlobalInput) {
    try {
      return await this.service.promoteToGlobal(input.id, userId);
    } catch (error) {
      handleError(error);
    }
  }

  // TODO: Implement later
  // - create() - for URL, GitHub, Document
  // - update()
  // - delete()
}
