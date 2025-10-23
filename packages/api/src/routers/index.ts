import { protectedProcedure, publicProcedure, router } from "../index";
import { chatRouter } from "./chat";
import { chatShareRouter } from "./chat-share";
import { contextEngineRouter } from "./context-engine.router";
import { messageRouter } from "./message";
import { rulesRouter } from "./rules.router";
import { tokenUsageRouter } from "./token-usage";

/**
 * Main App Router
 * Combines all feature routers
 */
export const appRouter = router({
  // Health check
  healthCheck: publicProcedure.query(() => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  })),

  // Private test endpoint
  privateData: protectedProcedure.query(({ ctx }) => ({
    message: "This is private",
    user: ctx.session.user,
  })),

  // Feature routers
  chat: chatRouter,
  message: messageRouter,
  chatShare: chatShareRouter,
  tokenUsage: tokenUsageRouter,
  rules: rulesRouter,
  contextEngine: contextEngineRouter,
});

export type AppRouter = typeof appRouter;
