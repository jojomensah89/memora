import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  createDocument,
  createFromGitHub,
  createFromUrl,
  deleteItem,
  getAllContextItems,
  getContextById,
  getContextForChat,
  linkToChat,
  promoteToGlobal,
  unlinkFromChat,
  update,
  uploadFile,
} from "../modules/context-engine/context-item.controller";
import {
  createContextItemSchema,
  deleteContextItemSchema,
  getContextForChatSchema,
  getContextItemSchema,
  promoteToGlobalSchema,
  uploadFileSchema,
} from "../modules/context-engine/context-item.inputs";
import type { AuthVariables } from "../types/auth.types";

const contextRoutes = new Hono<{ Variables: AuthVariables }>();

// Get all context items
contextRoutes.get("/", async (c) => {
  const user = c.get("authUser");
  return c.json(await getAllContextItems(user.id));
});

// Get context items for chat
contextRoutes.get(
  "/chat/:chatId",
  zValidator("param", getContextForChatSchema),
  async (c) => {
    const user = c.get("authUser");
    const { chatId } = c.req.valid("param");
    return c.json(await getContextForChat(user.id, { chatId }));
  }
);

// Get single context item
contextRoutes.get(
  "/:id",
  zValidator("param", getContextItemSchema),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    return c.json(await getContextById(user.id, { id }));
  }
);

// Upload file
contextRoutes.post(
  "/upload",
  zValidator("json", uploadFileSchema),
  async (c) => {
    const user = c.get("authUser");
    const input = c.req.valid("json");
    return c.json(await uploadFile(user.id, input));
  }
);

// Create from URL
contextRoutes.post(
  "/url",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      url: z.string().url(),
      description: z.string().optional(),
      chatId: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("authUser");
    const input = c.req.valid("json");
    return c.json(await createFromUrl(user.id, input));
  }
);

// Create from GitHub
contextRoutes.post(
  "/github",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      repoUrl: z.string().url(),
      branch: z.string().optional(),
      filePaths: z.array(z.string()).optional(),
      description: z.string().optional(),
      chatId: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("authUser");
    const input = c.req.valid("json");
    return c.json(await createFromGitHub(user.id, input));
  }
);

// Create document
contextRoutes.post(
  "/document",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      content: z.string(),
      description: z.string().optional(),
      chatId: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("authUser");
    const input = c.req.valid("json");
    return c.json(await createDocument(user.id, input));
  }
);

// Promote to global
contextRoutes.post(
  "/:id/promote",
  zValidator("param", promoteToGlobalSchema),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    return c.json(await promoteToGlobal(user.id, { id }));
  }
);

// Update context item
contextRoutes.put(
  "/:id",
  zValidator("param", getContextItemSchema),
  zValidator("json", createContextItemSchema.partial()),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    return c.json(await update(user.id, id, input));
  }
);

// Delete context item
contextRoutes.delete(
  "/:id",
  zValidator("param", deleteContextItemSchema),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    return c.json(await deleteItem(user.id, id));
  }
);

// Link to chat
contextRoutes.post(
  "/:id/link",
  zValidator("param", z.object({ id: z.string() })),
  zValidator("json", z.object({ chatId: z.string() })),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    const { chatId } = c.req.valid("json");
    return c.json(await linkToChat(user.id, id, chatId));
  }
);

// Unlink from chat
contextRoutes.post(
  "/:id/unlink",
  zValidator("param", z.object({ id: z.string() })),
  zValidator("json", z.object({ chatId: z.string() })),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    const { chatId } = c.req.valid("json");
    return c.json(await unlinkFromChat(user.id, id, chatId));
  }
);

export default contextRoutes;
