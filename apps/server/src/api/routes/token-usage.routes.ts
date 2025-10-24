import { Hono } from "hono";

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

// GET /api/token-usage/summary - Get usage summary
app.get(
  "/summary",
  withAuth(async (c, _authUser) => {
    // TODO: Implement actual token usage summary logic
    return c.json({
      message: "Get token usage summary - to be fully implemented",
    });
  })
);

// GET /api/token-usage/daily - Get daily usage
app.get(
  "/daily",
  withAuth(async (c, _authUser) => {
    const _query = c.req.query();

    // TODO: Implement actual daily usage logic
    return c.json({
      data: [],
      total: { tokens: 0, cost: 0, messageCount: 0 },
      message: "Get daily token usage - to be fully implemented",
    });
  })
);

// GET /api/token-usage/chat/:chatId - Get usage by chat
app.get(
  "/chat/:chatId",
  withAuth(async (c, _authUser) => {
    const { chatId } = c.req.param();

    // TODO: Implement actual chat usage logic
    return c.json({
      chatId,
      totalTokens: 0,
      totalCost: 0,
      messageCount: 0,
      averageTokensPerMessage: 0,
      breakdown: { byModel: [], byDate: [] },
      message: `Get token usage for chat ${chatId} - to be fully implemented`,
    });
  })
);

export default app;
