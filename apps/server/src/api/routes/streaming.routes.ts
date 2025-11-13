/**
 * Streaming Routes
 * Handles real-time AI response streaming compatible with Vercel AI SDK's useChat hook
 */

import {
  convertToModelMessages,
  createIdGenerator,
  streamText,
  type UIMessage,
  validateUIMessages,
} from "ai";

import { Hono } from "hono";
import { z } from "zod";
import { ChatNotFoundError } from "../common/errors";
import {
  getModelInstance,
  getProviderFromModel,
} from "../lib/ai/provider-factory";
import {
  buildSystemPrompt,
  generateChatTitle,
  injectContext,
} from "../lib/prompt-builder";
import { ChatRepository } from "../modules/chat/chat.repository";
import { ChatService } from "../modules/chat/chat.service";
import { ContextItemRepository } from "../modules/context-engine/context-item.repository";
import { ContextItemService } from "../modules/context-engine/context-item.service";
import { MessageRepository } from "../modules/message/message.repository";
import { MessageService } from "../modules/message/message.service";
import { RuleRepository } from "../modules/rules/rule.repository";
import { RuleService } from "../modules/rules/rule.service";
import { TokenUsageRepository } from "../modules/token-usage/token-usage.repository";
import { TokenUsageService } from "../modules/token-usage/token-usage.service";
import type { AuthVariables } from "../types/auth.types";
import type { AppContext } from "../types/hono.types";

const app = new Hono<{ Variables: AuthVariables }>();

// Initialize services
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);

const contextRepository = new ContextItemRepository();
const contextService = new ContextItemService(contextRepository);

const ruleRepository = new RuleRepository();
const ruleService = new RuleService(ruleRepository);

const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository);

const tokenUsageRepository = new TokenUsageRepository();
const tokenUsageService = new TokenUsageService(tokenUsageRepository);

/**
 * Save messages atomically with proper error handling
 */
type SaveMessagesInput = {
  chatId: string;
  userId: string;
  messages: UIMessage[];
  model: string;
  provider: string;
};

async function saveMessages(input: SaveMessagesInput): Promise<void> {
  // Get existing messages to avoid duplicates
  const existingMessagesResult = await messageService.getMessagesByChat(
    input.userId,
    { chatId: input.chatId, limit: 1000 }
  );
  const existingMessageIds = new Set(
    existingMessagesResult.messages.map((msg) => msg.id)
  );

  // Save each new message
  for (const message of input.messages) {
    // Skip if message already exists
    if (existingMessageIds.has(message.id)) {
      continue;
    }

    const content = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");

    const createdAt = message.createdAt
      ? new Date(message.createdAt)
      : new Date();

    await messageService.create({
      id: message.id,
      chatId: input.chatId,
      userId: input.userId,
      content,
      role: message.role,
      metadata: {
        parts: message.parts,
        model: input.model,
        provider: input.provider,
        createdAt: createdAt.toISOString(),
      },
      createdAt,
      attachments: [],
    });

    existingMessageIds.add(message.id);
  }

  // Update chat's last activity
  await chatRepository.updateLastActivity(input.chatId);

  // Generate title for new chats if needed
  const chat = await chatService.getChatById(input.chatId, input.userId);
  if (!chat?.title && input.messages.length > 0) {
    const lastUserMessage = input.messages
      .filter((m) => m.role === "user")
      .pop()
      ?.parts.find((p) => p.type === "text")?.text;

    if (lastUserMessage) {
      const title = generateChatTitle(lastUserMessage);
      await chatService.updateChat(input.userId, {
        id: input.chatId,
        title,
      });
    }
  }
}

/**
 * AI SDK v5 message format - accept UIMessage format
 */
const streamRequestSchema = z.object({
  id: z.string(), // chatId
  messages: z.array(z.any()), // AI SDK v5 UIMessage format
  model: z.string().optional(), // Move to top level
  webSearch: z.boolean().optional(), // Move to top level
});

app.post("/", async (c: AppContext) => {
  const authUser = c.get("authUser");

  const body = await c.req.json();
  const { id: chatId, messages, model } = streamRequestSchema.parse(body);

  // Validate UI messages to ensure schema compatibility
  const uiMessages = await validateUIMessages({
    messages: messages as UIMessage[],
  });

  // 1. Fetch chat and verify ownership
  const chat = await chatService.getChatById(chatId, authUser.id);
  if (!chat) {
    throw new ChatNotFoundError("Chat not found");
  }

  // 2. Get context and rules for this chat
  const [contextItems, rules] = await Promise.all([
    contextService.getForChat(chatId, authUser.id),
    ruleService.getForChat(chatId, authUser.id),
  ]);

  // 3. Build system prompt with rules
  const systemPrompt = buildSystemPrompt(rules);

  // 4. Convert UI messages to model messages for internal processing
  const modelMessages = convertToModelMessages(uiMessages);

  // 5. Inject context into model messages
  const messagesWithContext = injectContext(modelMessages, contextItems);

  // 6. Add system prompt at the beginning
  const finalMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messagesWithContext,
  ];

  // 7. Get model instance
  const provider = getProviderFromModel(model || chat.model);
  const modelInstance = getModelInstance(provider, model || chat.model);

  // 8. Stream AI response
  const result = streamText({
    model: modelInstance,
    messages: finalMessages,
    temperature: 0.7,
    onFinish: async (completion) => {
      try {
        // Track token usage
        const usage = completion.usage;
        if (usage) {
          await tokenUsageService.create({
            userId: authUser.id,
            provider,
            modelId: model || chat.model,
            inputTokens: usage.inputTokens || 0,
            outputTokens: usage.outputTokens || 0,
            chatId,
          });
        }
      } catch (_error) {
        // Error caught but stream continues - no action needed
      }
    },
  });

  // 9. Return UI message streaming response with proper parameters
  return result.toUIMessageStreamResponse({
    originalMessages: uiMessages,
    generateMessageId: createIdGenerator({
      prefix: "msg",
      size: 16,
    }),
    onFinish: async ({ messages }) => {
      // Save all messages including AI response atomically
      await saveMessages({
        chatId,
        userId: authUser.id,
        messages,
        model: model || chat.model,
        provider,
      });
    },
  });
});

app.get("/models", async (c: AppContext) => {
  const { getAllAvailableModels } = await import("../lib/ai/provider-factory");
  const models = getAllAvailableModels();

  return c.json({
    models,
    default: "gemini-2.0-flash-exp",
  });
});

app.get("/health", async (c: AppContext) => {
  const { checkAPIKeys } = await import("../lib/ai/provider-factory");
  const keys = checkAPIKeys();

  return c.json({
    status: "ok",
    streaming: true,
    providers: keys,
  });
});

export default app;
