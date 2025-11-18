import {
  convertToModelMessages,
  createIdGenerator,
  streamText,
  type UIMessage,
  validateUIMessages,
} from "ai";
import { Hono } from "hono";
import { z } from "zod";
import { HTTP_STATUS } from "../common/constants/limits.constants";
import { DatabaseError } from "../common/errors";
import {
  enhancePromptInputSchema,
  forkChatInputSchema,
  getChatInputSchema,
  listChatsInputSchema,
} from "../modules/chat/chat.inputs";
import type { ChatModule } from "../modules/chat/chat.module";
import type { AuthVariables } from "../types/auth.types";
import type { AppContext } from "../types/hono.types";

export type MyUiMessage = UIMessage<
  unknown,
  {
    "new-chat-created": {
      id: string;
    };
  }
>;

export function createChatRoutes(module: ChatModule) {
  const app = new Hono<{ Variables: AuthVariables }>();
  const { controller } = module;

  app.get("/models", async (c: AppContext) => {
    const models = controller.getModels();
    return c.json(models);
  });

  app.post("/", async (c: AppContext) => {
    const authUser = c.get("authUser");

    try {
      const {
        id: chatId,
        messages,
        model,
        useWebSearch,
        attachments,
      } = await c.req.json();

      // Validate UI messages
      const uiMessages = await validateUIMessages({
        messages: messages as UIMessage[],
      });

      // Check if chat exists
      let chat = await controller.getChat(authUser.id, { id: chatId });

      if (!chat) {
        // Create new chat
        chat = await controller.createChat(authUser.id, {
          chatId,
          initialMessage: messages[0].parts[0].text,
          modelId: model,
          useWebSearch,
          attachments: attachments || [],
        });
      }

      // Get model instance
      const { getModelInstance } = await import("../lib/ai/provider-factory");
      const modelInstance = getModelInstance(chat.provider, chat.model);

      // Use streamText with proper onFinish
      const result = streamText({
        model: modelInstance,
        messages: convertToModelMessages(uiMessages),
      });

      // Return proper UI message stream response
      return result.toUIMessageStreamResponse({
        originalMessages: uiMessages,
        generateMessageId: createIdGenerator({
          prefix: "msg",
          size: 16,
        }),
        onFinish: async ({ messages: updatedMessages }) => {
          // Save all messages to database
          await controller.updateChatMessages(
            authUser.id,
            chatId,
            updatedMessages
          );
        },
      });
    } catch (error) {
      // Detailed error logging for debugging
      if (error instanceof Error) {
        throw new DatabaseError("Chat creation failed", error).withContext({
          userId: authUser.id,
          operation: "chat-post-handler",
          path: c.req.path,
          method: c.req.method,
          metadata: {
            error: error.message,
            stack: error.stack,
          },
        });
      }

      return c.json(
        { error: "Internal server error" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  });

  app.get("/", async (c: AppContext) => {
    const authUser = c.get("authUser");

    try {
      const query = c.req.query();
      const input = listChatsInputSchema.parse(query);
      const result = await controller.listChats(authUser.id, input);
      return c.json({
        data: result.chats,
        cursor: result.nextCursor ?? null,
        hasMore: Boolean(result.nextCursor),
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  app.get("/:id", async (c: AppContext) => {
    const authUser = c.get("authUser");

    try {
      const { id } = getChatInputSchema.parse({ id: c.req.param("id") });
      const chat = await controller.getChat(authUser.id, { id });

      if (!chat) {
        return c.json({ error: "Chat not found" }, 404);
      }

      return c.json(chat);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  app.post("/:id/enhance", async (c: AppContext) => {
    const authUser = c.get("authUser");

    try {
      const { id: _id } = getChatInputSchema.parse({ id: c.req.param("id") });
      const body = await c.req.json();
      const input = enhancePromptInputSchema.parse(body);
      const result = await controller.enhancePrompt(authUser.id, input);
      return c.json(result);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return c.json({ error: "Validation failed", details: error }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  app.post("/:id/fork", async (c: AppContext) => {
    const authUser = c.get("authUser");

    try {
      const { id: _id } = getChatInputSchema.parse({ id: c.req.param("id") });
      const body = await c.req.json();
      const input = forkChatInputSchema.parse(body);
      const forkedChat = await controller.forkChat(authUser.id, input);
      return c.json(forkedChat, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  app.post("/:id/messages", async (c: AppContext) => {
    const authUser = c.get("authUser");

    try {
      const { id } = getChatInputSchema.parse({ id: c.req.param("id") });
      const body = await c.req.json();
      const { message } = z.object({ message: z.string() }).parse(body);
      const response = await controller.generateAIResponse(
        authUser.id,
        id,
        message
      );
      return c.json(response);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  app.delete("/:id", async (c: AppContext) => {
    const authUser = c.get("authUser");
    try {
      const { id } = getChatInputSchema.parse({ id: c.req.param("id") });
      await controller.deleteChat(authUser.id, id);
      return c.json({ success: true }, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  return app;
}

export default createChatRoutes;
