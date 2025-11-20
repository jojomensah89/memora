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
import {
  validateLength,
  validateRequired,
} from "../../common/utils/validation.util";
import type {
  CreateContextItemInput,
  UploadFileInput,
} from "./context-item.inputs";
import {
  createContextItem,
  deleteContextItem,
  findContextItemById,
  findContextItemsByUser,
  findContextItemsForChat,
  getContextStats,
  linkContextToChat,
  promoteContextItemToGlobal,
  unlinkContextFromChat,
  updateContextItem,
  validateChatOwnership,
} from "./context-item.repository";
import type {
  ContextItemWithTags,
  ContextListResult,
} from "./context-item.types";

/**
 * Get all context items for user
 */
export async function getContextItems(userId: string): Promise<ContextListResult> {
  const [items, stats] = await Promise.all([
    findContextItemsByUser(userId),
    getContextStats(userId),
  ]);

  return { items, stats };
}

/**
 * Get context items applicable to a chat (GLOBAL + LOCAL)
 */
export async function getChatContextItems(
  chatId: string,
  userId: string
): Promise<ContextItemWithTags[]> {
  validateRequired(chatId, "Chat ID");
  return findContextItemsForChat(chatId, userId);
}

/**
 * Get single context item by ID
 */
export async function getContextItem(
  id: string,
  userId: string
): Promise<ContextItemWithTags> {
  validateRequired(id, "Context item ID");

  const item = await findContextItemById(id, userId);

  if (!item) {
    throw new ContextNotFoundError("Context item not found");
  }

  return item;
}

/**
 * Upload file and create LOCAL context item
 */
export async function uploadFileContext(
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
    mimeType: input.mimeType,
    size: input.size,
    tags: input.tags,
    chatId: input.chatId,
  };

  return createContextItem(userId, contextItem);
}

/**
 * Promote context item from LOCAL to GLOBAL
 */
export async function promoteContextToGlobal(
  id: string,
  userId: string
): Promise<ContextItemWithTags> {
  // Check if exists and belongs to user
  const item = await getContextItem(id, userId);

  if (item.scope === "GLOBAL") {
    throw new ValidationError("Context item is already global");
  }

  return promoteContextItemToGlobal(id, userId);
}

export async function createContextFromUrl(
  userId: string,
  input: {
    name: string;
    description?: string;
    url: string;
    chatId?: string;
  }
) {
  // Basic validation
  validateRequired(input.url, "URL");
  validateLength(input.name, "Name", 1, 255);
  if (input.description) {
    validateLength(input.description, "Description", 0, 1000);
  }

  // For now, just store the URL as content
  // TODO: Implement URL content fetching
  const contextItem: CreateContextItemInput = {
    name: input.name,
    description: input.description,
    type: "URL",
    content: input.url,
    url: input.url,
    size: input.url.length,
    scope: input.chatId ? "LOCAL" : "GLOBAL",
    chatId: input.chatId,
    tags: [],
  };

  return await createContextItem(userId, contextItem);
}

export async function createContextFromGitHub(
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
  validateRequired(input.repoUrl, "Repository URL");
  validateLength(input.name, "Name", 1, 255);
  if (input.description) {
    validateLength(input.description, "Description", 0, 1000);
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
    url: input.repoUrl,
    size: input.repoUrl.length,
    scope: input.chatId ? "LOCAL" : "GLOBAL",
    chatId: input.chatId,
    tags: [],
  };

  return await createContextItem(userId, contextItem);
}

export async function createDocumentContext(
  userId: string,
  input: {
    name: string;
    description?: string;
    content: string;
    chatId?: string;
  }
) {
  // Validation
  validateRequired(input.content, "Content");
  validateLength(input.name, "Name", 1, 255);
  validateLength(
    input.content,
    "Content",
    1,
    CONTEXT_LIMITS.MAX_CONTEXT_SIZE
  );
  if (input.description) {
    validateLength(input.description, "Description", 0, 1000);
  }

  const tokens = countTokens(input.content);
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
    tags: [],
  };

  return await createContextItem(userId, contextItem);
}

export async function updateContext(
  userId: string,
  id: string,
  input: Partial<CreateContextItemInput>
) {
  const item = await findContextItemById(id, userId);
  if (!item) {
    throw new ContextNotFoundError("Context item not found");
  }

  // Validate content if provided
  if (input.content) {
    validateLength(
      input.content,
      "Content",
      1,
      CONTEXT_LIMITS.MAX_CONTEXT_SIZE
    );

    const tokens = countTokens(input.content);
    if (tokens > CONTEXT_LIMITS.MAX_TOKEN_COUNT) {
      throw new ValidationError(
        `Content contains too many tokens (${tokens}). Maximum: ${CONTEXT_LIMITS.MAX_TOKEN_COUNT}`
      );
    }
  }

  return await updateContextItem(id, userId, input);
}

export async function deleteContext(userId: string, id: string) {
  const item = await findContextItemById(id, userId);
  if (!item) {
    throw new ContextNotFoundError("Context item not found");
  }

  await deleteContextItem(id, userId);
}

export async function linkContext(userId: string, contextId: string, chatId: string) {
  const item = await findContextItemById(contextId, userId);
  if (!item) {
    throw new ContextNotFoundError("Context item not found");
  }

  // Verify chat ownership
  const hasOwnership = await validateChatOwnership(
    chatId,
    userId
  );

  if (!hasOwnership) {
    throw new ValidationError("Chat not found or access denied");
  }

  await linkContextToChat(contextId, chatId, userId);
}

export async function unlinkContext(userId: string, contextId: string, chatId: string) {
  const item = await findContextItemById(contextId, userId);
  if (!item) {
    throw new ContextNotFoundError("Context item not found");
  }

  await unlinkContextFromChat(contextId, chatId, userId);
}

function countTokens(text: string): number {
  // Simple token counting - in a real implementation, use a proper tokenizer
  return Math.ceil(text.length / 4);
}
