import { Hono } from "hono";
import type { AuthVariables } from "../types/auth.types";
import type { AppContext } from "../types/hono.types";

const app = new Hono<{ Variables: AuthVariables }>();

// GET /api/token-usage/summary - Get usage summary
app.get("/summary", async (c: AppContext) => {
  const _authUser = c.get("authUser");
  // TODO: Implement actual token usage summary logic
  return c.json({
    message: "Get token usage summary - to be fully implemented",
  });
});

// GET /api/token-usage/daily - Get daily usage
app.get("/daily", async (c: AppContext) => {
  const _authUser = c.get("authUser");
  const _query = c.req.query();

  // TODO: Implement actual daily usage logic
  return c.json({
    data: [],
    total: { tokens: 0, cost: 0, messageCount: 0 },
    message: "Get daily token usage - to be fully implemented",
  });
});

// GET /api/token-usage/chat/:chatId - Get usage by chat
app.get("/chat/:chatId", async (c: AppContext) => {
  const _authUser = c.get("authUser");
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
});

export default app;
