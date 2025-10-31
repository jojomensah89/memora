import { Hono } from "hono";
import { ChatController } from "../modules/chat/chat.controller";
import {
  createChatInputSchema,
  enhancePromptInputSchema,
  forkChatInputSchema,
  getChatInputSchema,
  listChatsInputSchema,
} from "../modules/chat/chat.inputs";
import { ChatRepository } from "../modules/chat/chat.repository";
import { ChatService } from "../modules/chat/chat.service";

const app = new Hono();

// Initialize chat controller
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository, {
  async enhance(input) {
    return {
      enhancedText: input.text,
      useWebSearchApplied: input.useWebSearch,
      suggestions: [],
    };
  },
});
const chatController = new ChatController(chatService);

// GET /api/chats/models - Get available models
app.get("/models", async (c) => {
  const authUser = c.get("authUser");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const models = await chatController.getModels();
  return c.json(models);
});

// POST /api/chats - Create new chat
app.post("/", async (c) => {
  const authUser = c.get("authUser");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const input = createChatInputSchema.parse(body);
    const chat = await chatController.createChat(authUser.id, input);
    return c.json(chat, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /api/chats - List all chats for user
app.get("/", async (c) => {
  const authUser = c.get("authUser");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const query = c.req.query();
    const input = listChatsInputSchema.parse(query);
    const chats = await chatController.listChats(authUser.id, input);
    return c.json(chats);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /api/chats/:id - Get specific chat
app.get("/:id", async (c) => {
  const authUser = c.get("authUser");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { id } = getChatInputSchema.parse({ id: c.req.param("id") });
    const chat = await chatController.getChat(authUser.id, { id });

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

// POST /api/chats/:id/enhance - Enhance prompt
app.post("/:id/enhance", async (c) => {
  const authUser = c.get("authUser");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { id: _id } = getChatInputSchema.parse({ id: c.req.param("id") });
    const body = await c.req.json();
    const input = enhancePromptInputSchema.parse(body);
    const result = await chatController.enhancePrompt(authUser.id, input);
    return c.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({ error: "Validation failed", details: error }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /api/chats/:id/fork - Fork chat
app.post("/:id/fork", async (c) => {
  const authUser = c.get("authUser");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { id: _id } = getChatInputSchema.parse({ id: c.req.param("id") });
    const body = await c.req.json();
    const input = forkChatInputSchema.parse(body);
    const forkedChat = await chatController.forkChat(authUser.id, input);
    return c.json(forkedChat, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /api/chats/:id/messages - Generate AI response
app.post("/:id/messages", async (c) => {
  const authUser = c.get("authUser");
  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { id } = getChatInputSchema.parse({ id: c.req.param("id") });
    const body = await c.req.json();
    const { message } = { message: "string" }.parse(body);
    const response = await chatController.generateAIResponse(
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

export default app;
