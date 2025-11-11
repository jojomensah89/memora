import { Hono } from "hono";
import { z } from "zod";
import type { AuthVariables } from "../types/auth.types";
import type { AppContext } from "../types/hono.types";

const app = new Hono<{ Variables: AuthVariables }>();

// GET /api/messages/by-chat/:chatId - Get messages for chat
app.get("/by-chat/:chatId", async (c: AppContext) => {
  const _authUser = c.get("authUser");
  const { chatId } = c.req.param();
  const _query = c.req.query();

  // TODO: Implement actual message retrieval logic
  return c.json({
    data: [],
    hasMore: false,
    total: 0,
    message: `Get messages for chat ${chatId} - to be fully implemented`,
  });
});

// GET /api/messages/:id - Get specific message
app.get("/:id", async (c: AppContext) => {
  const _authUser = c.get("authUser");
  const { id } = c.req.param();

  // TODO: Implement actual message retrieval logic
  return c.json({
    message: `Get message ${id} - to be fully implemented`,
  });
});

// POST /api/messages - Create message
app.post("/", async (c: AppContext) => {
  const _authUser = c.get("authUser");
  const body = await c.req.json();

  const createMessageSchema = z.object({
    content: z.string().min(1),
    role: z.enum(["user", "assistant", "system"]).default("user"),
    chatId: z.string(),
    parentMessageId: z.string().optional(),
  });

  try {
    const input = createMessageSchema.parse(body);

    // TODO: Implement actual message creation logic
    return c.json(
      {
        message: "Create message - to be fully implemented",
        data: input,
      },
      201
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return c.json({ error: "Validation failed", details: error }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// DELETE /api/messages/:id - Delete message
app.delete("/:id", async (c: AppContext) => {
  const _authUser = c.get("authUser");
  const { id: _id } = c.req.param();

  // TODO: Implement actual message deletion logic
  return c.text("", 204);
});

export default app;
