import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import * as ChatController from "../modules/chat/chat.controller";
import {
  createChatSchema,
  enhancePromptSchema,
  forkChatSchema,
  listChatsSchema,
  updateChatSchema,
} from "../modules/chat/chat.inputs";
import type { AuthVariables } from "../types/auth.types";

const app = new Hono<{ Variables: AuthVariables }>();

app.post("/", zValidator("json", createChatSchema), async (c) => {
  const authUser = c.get("authUser");
  const input = c.req.valid("json");
  const result = await ChatController.createChat(authUser.id, input);
  return c.json(result);
});

app.get("/", zValidator("query", listChatsSchema), async (c) => {
  const authUser = c.get("authUser");
  const input = c.req.valid("query");
  const result = await ChatController.listChats(authUser.id, input);
  return c.json(result);
});

app.get("/models", async (c) => {
  const result = ChatController.getModels();
  return c.json(result);
});

app.post("/enhance", zValidator("json", enhancePromptSchema), async (c) => {
  const authUser = c.get("authUser");
  const input = c.req.valid("json");
  const result = await ChatController.enhancePrompt(authUser.id, input);
  return c.json(result);
});

app.post("/fork", zValidator("json", forkChatSchema), async (c) => {
  const authUser = c.get("authUser");
  const input = c.req.valid("json");
  const result = await ChatController.forkChat(authUser.id, input);
  return c.json(result);
});

app.get(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const authUser = c.get("authUser");
    const { id } = c.req.valid("param");
    const result = await ChatController.getChat(authUser.id, { id });
    return c.json(result);
  }
);

app.put(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  zValidator("json", updateChatSchema),
  async (c) => {
    const authUser = c.get("authUser");
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    const result = await ChatController.updateChat(authUser.id, {
      id,
      ...input,
    });
    return c.json(result);
  }
);

app.delete(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const authUser = c.get("authUser");
    const { id } = c.req.valid("param");
    await ChatController.deleteChat(authUser.id, id);
    return c.json({ success: true });
  }
);

export default app;
