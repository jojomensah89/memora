import { BaseService } from "../../common/base";
import { CONTEXT_LIMITS } from "../../common/constants";
import {
  ContextNotFoundError,
  PayloadTooLargeError,
  ValidationError,
} from "../../common/errors";
import {
  estimateTokens,
  validateFilename,
  validateFileSize,
  validateMimeType,
} from "../../common/utils";
import type {
  CreateContextItemInput,
  UploadFileInput,
} from "./context-item.inputs";
import type { ContextItemRepository } from "./context-item.repository";
import type {
  ContextItemWithTags,
  ContextListResult,
} from "./context-item.types";

/**
 * Context Item Service
 * Contains business logic for context management
 */
export class ContextItemService extends BaseService {
  constructor(private readonly repository: ContextItemRepository) {
    super();
  }

  /**
   * Get all context items for user
   */
  async getAll(userId: string): Promise<ContextListResult> {
    const [items, stats] = await Promise.all([
      this.repository.findAllByUser(userId),
      this.repository.getStats(userId),
    ]);

    return { items, stats };
  }

  /**
   * Get context items applicable to a chat (GLOBAL + LOCAL)
   */
  async getForChat(
    chatId: string,
    userId: string
  ): Promise<ContextItemWithTags[]> {
    this.validateRequired(chatId, "Chat ID");
    return this.repository.findForChat(chatId, userId);
  }

  /**
   * Get single context item by ID
   */
  async getById(id: string, userId: string): Promise<ContextItemWithTags> {
    this.validateRequired(id, "Context item ID");

    const item = await this.repository.findById(id, userId);

    if (!item) {
      throw new ContextNotFoundError("Context item not found");
    }

    return item;
  }

  /**
   * Upload file and create LOCAL context item
   */
  async uploadFile(
    userId: string,
    input: UploadFileInput
  ): Promise<ContextItemWithTags> {
    // Validate file
    validateFilename(input.filename);
    validateFileSize(input.size);
    validateMimeType(input.mimeType);

    // Check content size
    if (input.content.length > CONTEXT_LIMITS.MAX_CONTEXT_SIZE) {
      throw new PayloadTooLargeError("File content exceeds maximum size");
    }

    // Estimate tokens
    const tokens = estimateTokens(input.content);

    if (tokens > CONTEXT_LIMITS.MAX_TOKEN_COUNT) {
      throw new ValidationError(
        `File contains too many tokens (${tokens}). Maximum: ${CONTEXT_LIMITS.MAX_TOKEN_COUNT}`
      );
    }

    // Create context item as LOCAL
    const contextItem: CreateContextItemInput = {
      name: input.filename,
      type: "FILE",
      content: input.content,
      scope: "LOCAL", // Files uploaded in chat are always LOCAL
      metadata: {
        mimeType: input.mimeType,
        size: input.size,
        uploadedAt: new Date().toISOString(),
      },
      tags: input.tags,
      chatId: input.chatId,
    };

    return this.repository.create(userId, contextItem);
  }

  /**
   * Promote context item from LOCAL to GLOBAL
   */
  async promoteToGlobal(
    id: string,
    userId: string
  ): Promise<ContextItemWithTags> {
    // Check if exists and belongs to user
    const item = await this.getById(id, userId);

    if (item.scope === "GLOBAL") {
      throw new ValidationError("Context item is already global");
    }

    return this.repository.promoteToGlobal(id, userId);
  }

  async createFromUrl(
    userId: string,
    input: {
      name: string;
      description?: string;
      url: string;
      chatId?: string;
    }
  ) {
    // Basic validation
    this.validateRequired(input.url, "URL");
    this.validateLength(input.name, "Name", 1, 255);
    if (input.description) {
      this.validateLength(input.description, "Description", 0, 1000);
    }

    // For now, just store the URL as content
    // TODO: Implement URL content fetching
    const contextItem: CreateContextItemInput = {
      name: input.name,
      description: input.description,
      type: "URL",
      content: input.url,
      size: input.url.length,
      scope: input.chatId ? "LOCAL" : "GLOBAL",
      chatId: input.chatId,
    };

    return await this.repository.create(userId, contextItem);
  }

  async createFromGitHub(
    userId: string,
    input: {
      name: string;
      description?: string;
      repoUrl: string;
      branch?: string;
      filePaths?: string[];
      chatId?: string;
    }
  ) {
    // Basic validation
    this.validateRequired(input.repoUrl, "Repository URL");
    this.validateLength(input.name, "Name", 1, 255);
    if (input.description) {
      this.validateLength(input.description, "Description", 0, 1000);
    }

    // For now, just store the repo info as content
    // TODO: Implement GitHub cloning and file processing
    const contextItem: CreateContextItemInput = {
      name: input.name,
      description: input.description,
      type: "GITHUB_REPO",
      content: JSON.stringify({
        repoUrl: input.repoUrl,
        branch: input.branch || "main",
        filePaths: input.filePaths || [],
      }),
      size: input.repoUrl.length,
      scope: input.chatId ? "LOCAL" : "GLOBAL",
      chatId: input.chatId,
    };

    return await this.repository.create(userId, contextItem);
  }

  async createDocument(
    userId: string,
    input: {
      name: string;
      description?: string;
      content: string;
      chatId?: string;
    }
  ) {
    // Validation
    this.validateRequired(input.content, "Content");
    this.validateLength(input.name, "Name", 1, 255);
    this.validateLength(
      input.content,
      "Content",
      1,
      CONTEXT_LIMITS.MAX_CONTEXT_SIZE
    );
    if (input.description) {
      this.validateLength(input.description, "Description", 0, 1000);
    }

    const tokens = this.countTokens(input.content);
    const size = input.content.length;

    // Check limits
    if (size > CONTEXT_LIMITS.MAX_CONTEXT_SIZE) {
      throw new ValidationError(
        `Document exceeds maximum size. Maximum: ${CONTEXT_LIMITS.MAX_CONTEXT_SIZE}`
      );
    }

    if (tokens > CONTEXT_LIMITS.MAX_TOKEN_COUNT) {
      throw new ValidationError(
        `Document contains too many tokens (${tokens}). Maximum: ${CONTEXT_LIMITS.MAX_TOKEN_COUNT}`
      );
    }

    const contextItem: CreateContextItemInput = {
      name: input.name,
      description: input.description,
      type: "DOCUMENT",
      content: input.content,
      size,
      scope: input.chatId ? "LOCAL" : "GLOBAL",
      chatId: input.chatId,
    };

    return await this.repository.create(userId, contextItem);
  }

  async update(
    userId: string,
    id: string,
    input: Partial<CreateContextItemInput>
  ) {
    const item = await this.repository.findById(id, userId);
    if (!item) {
      throw new ContextNotFoundError("Context item not found");
    }

    // Validate content if provided
    if (input.content) {
      this.validateLength(
        input.content,
        "Content",
        1,
        CONTEXT_LIMITS.MAX_CONTEXT_SIZE
      );

      const tokens = this.countTokens(input.content);
      if (tokens > CONTEXT_LIMITS.MAX_TOKEN_COUNT) {
        throw new ValidationError(
          `Content contains too many tokens (${tokens}). Maximum: ${CONTEXT_LIMITS.MAX_TOKEN_COUNT}`
        );
      }
    }

    return await this.repository.update(id, userId, input);
  }

  async delete(userId: string, id: string) {
    const item = await this.repository.findById(id, userId);
    if (!item) {
      throw new ContextNotFoundError("Context item not found");
    }

    await this.repository.delete(id, userId);
  }

  async linkToChat(userId: string, contextId: string, chatId: string) {
    const item = await this.repository.findById(contextId, userId);
    if (!item) {
      throw new ContextNotFoundError("Context item not found");
    }

    // Verify chat ownership
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new ValidationError("Chat not found or access denied");
    }

    await this.repository.linkToChat(contextId, chatId, userId);
  }

  async unlinkFromChat(userId: string, contextId: string, chatId: string) {
    const item = await this.repository.findById(contextId, userId);
    if (!item) {
      throw new ContextNotFoundError("Context item not found");
    }

    await this.repository.unlinkFromChat(contextId, chatId, userId);
  }

  private countTokens(text: string): number {
    // Simple token counting - in a real implementation, use a proper tokenizer
    return Math.ceil(text.length / 4);
  }
}
