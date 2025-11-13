import { Hono } from "hono";
import {
  createChatInputSchema,
  enhancePromptInputSchema,
  forkChatInputSchema,
  getChatInputSchema,
  listChatsInputSchema,
} from "../modules/chat/chat.inputs";
import type { ChatModule } from "../modules/chat/chat.module";
import type { AuthVariables } from "../types/auth.types";
import type { AppContext } from "../types/hono.types";

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
      const body = await c.req.json();
      const input = createChatInputSchema.parse(body);
      const chat = await controller.createChat(authUser.id, input);
      return c.json(chat, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
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
      const { message } = { message: "string" }.parse(body);
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

  return app;
}

export default createChatRoutes;
