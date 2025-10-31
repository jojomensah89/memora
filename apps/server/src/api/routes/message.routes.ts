import { Hono } from "hono";
import { z } from "zod";

const app = new Hono();

// Authentication wrapper
const withAuth =
  (handler: (c: any, authUser: any) => Promise<Response>) => async (c: any) => {
    const authUser = c.get("authUser");
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return handler(c, authUser);
  };

// GET /api/messages/by-chat/:chatId - Get messages for chat
app.get(
  "/by-chat/:chatId",
  withAuth(async (c, _authUser) => {
    const { chatId } = c.req.param();
    const _query = c.req.query();

    // TODO: Implement actual message retrieval logic
    return c.json({
      data: [],
      hasMore: false,
      total: 0,
      message: `Get messages for chat ${chatId} - to be fully implemented`,
    });
  })
);

// GET /api/messages/:id - Get specific message
app.get(
  "/:id",
  withAuth(async (c, _authUser) => {
    const { id } = c.req.param();

    // TODO: Implement actual message retrieval logic
    return c.json({
      message: `Get message ${id} - to be fully implemented`,
    });
  })
);

// POST /api/messages - Create message
app.post(
  "/",
  withAuth(async (c, _authUser) => {
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
  })
);

// DELETE /api/messages/:id - Delete message
app.delete(
  "/:id",
  withAuth(async (c, _authUser) => {
    const { id: _id } = c.req.param();

    // TODO: Implement actual message deletion logic
    return c.text("", 204);
  })
);

export default app;
