import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { PAGINATION_LIMITS } from "../common/constants/limits.constants";
import {
  createMessage,
  deleteMessage,
  getMessage,
  getMessageStatistics,
  getMessagesByChat,
  updateMessage,
} from "../modules/message/message.controller";
import {
  createMessageInputSchema,
  updateMessageInputSchema,
} from "../modules/message/message.inputs";
import type { AuthVariables } from "../types/auth.types";

const app = new Hono<{ Variables: AuthVariables }>();

app.post("/", zValidator("json", createMessageInputSchema), async (c) => {
  const user = c.get("authUser");
  const input = c.req.valid("json");
  const result = await createMessage(user.id, input);
  return c.json(result);
});

app.get(
  "/chat/:chatId",
  zValidator(
    "param",
    z.object({
      chatId: z.string(),
    })
  ),
  zValidator(
    "query",
    z.object({
      limit: z
        .string()
        .optional()
        .transform((val) =>
          val ? Number.parseInt(val, 10) : PAGINATION_LIMITS.DEFAULT_LIMIT
        ),
      cursor: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("authUser");
    const { chatId } = c.req.valid("param");
    const { limit, cursor } = c.req.valid("query");
    const result = await getMessagesByChat(user.id, {
      chatId,
      limit,
      cursor,
    });
    return c.json(result);
  }
);

app.get(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string(),
    })
  ),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    const result = await getMessage(user.id, { id });
    return c.json(result);
  }
);

app.put(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string(),
    })
  ),
  zValidator("json", updateMessageInputSchema),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    await updateMessage(user.id, id, input);
    return c.json({ success: true });
  }
);

app.delete(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string(),
    })
  ),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    await deleteMessage(user.id, { id });
    return c.json({ success: true });
  }
);

app.get(
  "/stats/:chatId",
  zValidator(
    "param",
    z.object({
      chatId: z.string(),
    })
  ),
  async (c) => {
    const user = c.get("authUser");
    const { chatId } = c.req.valid("param");
    const result = await getMessageStatistics(user.id, chatId);
    return c.json(result);
  }
);

export default app;
