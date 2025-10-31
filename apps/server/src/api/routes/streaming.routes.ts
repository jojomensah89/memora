/**
 * Streaming Routes
 * Handles real-time AI response streaming compatible with Vercel AI SDK's useChat hook
 */

import { streamText } from "ai";
import { Hono } from "hono";
import { z } from "zod";
import { AuthenticationError, ChatNotFoundError } from "../common/errors";
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

const app = new Hono();

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
 * Vercel AI SDK message format
 */
const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  id: z.string().optional(),
});

const streamRequestSchema = z.object({
  id: z.string(), // chatId
  messages: z.array(messageSchema),
  data: z
    .object({
      model: z.string().optional(),
      webSearch: z.boolean().optional(),
    })
    .optional(),
});

/**
 * POST /api/chat
 * Streaming endpoint compatible with Vercel AI SDK's useChat hook
 */
app.post("/", async (c: any) => {
  const authUser = c.get("authUser");
  if (!authUser) {
    throw new AuthenticationError("Login required");
  }

  try {
    const body = await c.req.json();
    const { id: chatId, messages, data } = streamRequestSchema.parse(body);

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

    // 4. Inject context into messages
    const enhancedMessages = injectContext(
      messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      contextItems
    );

    // 5. Add system prompt at the beginning
    const finalMessages = [
      { role: "system" as const, content: systemPrompt },
      ...enhancedMessages,
    ];

    // 6. Get model instance
    const provider = getProviderFromModel(data?.model || chat.model);
    const modelInstance = getModelInstance(provider, data?.model || chat.model);

    // 7. Get the last user message for saving
    const lastUserMessage = messages
      .filter((m) => m.role === "user")
      .pop()?.content;

    // 8. Save user message if this is a new message
    if (lastUserMessage && messages.length === 1) {
      // This is the first message in a new chat
      await messageService.create({
        chatId,
        userId: authUser.id,
        content: lastUserMessage,
        role: "user",
      });

      // Generate title if chat doesn't have one
      if (!chat.title) {
        const title = generateChatTitle(lastUserMessage);
        await chatService.updateChat(authUser.id, {
          id: chatId,
          title,
        });
      }
    }

    // 9. Stream AI response
    const result = await streamText({
      model: modelInstance,
      messages: finalMessages,
      temperature: 0.7,
      onFinish: async (completion) => {
        try {
          // Save assistant message
          await messageService.create({
            chatId,
            userId: authUser.id,
            content: completion.text,
            role: "assistant",
          });

          // Track token usage
          const usage = completion.usage;
          if (usage) {
            await tokenUsageService.create({
              userId: authUser.id,
              provider,
              modelId: data?.model || chat.model,
              inputTokens: usage.inputTokens || 0,
              outputTokens: usage.outputTokens || 0,
              chatId,
            });
          }

          // Update chat's updatedAt timestamp
          await chatRepository.updateLastActivity(chatId);
        } catch (_error) {
          // Error caught but stream continues - no action needed
        }
      },
    });

    // 10. Return streaming response
    return result.toTextStreamResponse();
  }
});

/**
 * GET /api/chat/models
 * List available AI models
 */
app.get("/models", async (c: any) => {
  const authUser = c.get("authUser");
  if (!authUser) {
    throw new AuthenticationError("Login required");
  }

  const { getAllAvailableModels } = await import("../lib/ai/provider-factory");
  const models = getAllAvailableModels();

  return c.json({
    models,
    default: "claude-3-5-sonnet-20241022",
  });
});

/**
 * GET /api/chat/health
 * Check streaming endpoint health
 */
app.get("/health", async (c: any) => {
  const { checkAPIKeys } = await import("../lib/ai/provider-factory");
  const keys = checkAPIKeys();

  return c.json({
    status: "ok",
    streaming: true,
    providers: keys,
  });
});

export default app;
