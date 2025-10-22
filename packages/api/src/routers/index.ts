import { protectedProcedure, publicProcedure, router } from "../index";
import { chatRouter } from "./chat";
import { contextEngineRouter } from "./context-engine.router";
import { rulesRouter } from "./rules.router";

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
  rules: rulesRouter,
  contextEngine: contextEngineRouter,

  // TODO: Add more routers
  // message: messageRouter,
  // chatShare: chatShareRouter,
  // tokenUsage: tokenUsageRouter,
});

export type AppRouter = typeof appRouter;
