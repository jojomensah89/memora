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

// POST /api/chat-share - Create share link
app.post(
  "/",
  withAuth(async (c, _authUser) => {
    const body = await c.req.json();

    const createShareLinkSchema = z.object({
      chatId: z.string(),
      expiresAt: z.string().datetime().optional(),
      allowEdit: z.boolean().default(false),
      allowDelete: z.boolean().default(false),
      password: z.string().min(6).optional(),
      messageLimit: z.number().int().min(1).max(100).optional(),
      permissions: z
        .array(z.enum(["view", "comment", "edit"]))
        .default(["view"]),
    });

    try {
      const input = createShareLinkSchema.parse(body);

      const shareId = `share-${Math.random().toString(36).substring(7)}`;
      return c.json(
        {
          id: shareId,
          chatId: input.chatId,
          shareUrl: `https://memora.ai/share/${shareId}`,
          token: shareId,
          expiresAt: input.expiresAt || null,
          isActive: true,
          allowEdit: input.allowEdit,
          allowDelete: input.allowDelete,
          hasPassword: !!input.password,
          messageLimit: input.messageLimit || null,
          permissions: input.permissions,
          createdAt: new Date().toISOString(),
          accessCount: 0,
          lastAccessed: null,
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

// GET /api/chat-share - List shared chats
app.get(
  "/",
  withAuth(async (c, _authUser) => {
    const _query = c.req.query();

    // TODO: Implement actual shared chats list logic
    return c.json({
      data: [],
      hasMore: false,
      total: 0,
      message: "List shared chats - to be fully implemented",
    });
  })
);

// GET /api/chat-share/:token - Access shared chat
app.get("/:token", async (c) => {
  const { token } = c.req.param();
  const _query = c.req.query();

  // TODO: Implement actual shared chat access logic
  return c.json({
    message: `Access shared chat ${token} - to be fully implemented`,
  });
});

// DELETE /api/chat-share/:token - Delete share link
app.delete(
  "/:token",
  withAuth(async (c, _authUser) => {
    const { token } = c.req.param();

    // TODO: Implement actual share link deletion logic
    return c.text("", 204);
  })
);

export default app;
