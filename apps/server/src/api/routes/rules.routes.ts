import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  createRule,
  deleteRule,
  getChatRules,
  getRule,
  linkRule,
  toggleRule,
  unlinkRule,
  updateRule,
} from "../modules/rules/rule.controller";
import {
  createRuleSchema,
  deleteRuleSchema,
  getRuleSchema,
  getRulesForChatSchema,
  listRulesSchema,
  toggleRuleSchema,
  updateRuleSchema,
} from "../modules/rules/rule.inputs";
import * as RuleService from "../modules/rules/rule.service";
import type { AuthVariables } from "../types/auth.types";

const app = new Hono<{ Variables: AuthVariables }>();

// GET /api/rules - List rules
app.get("/", zValidator("query", listRulesSchema), async (c) => {
  const user = c.get("authUser");
  const filters = c.req.valid("query");
  const result = await RuleService.getRules(user.id, filters);
  return c.json(result);
});

// GET /api/rules/chat/:chatId - List rules for chat
app.get(
  "/chat/:chatId",
  zValidator("param", getRulesForChatSchema),
  async (c) => {
    const user = c.get("authUser");
    const { chatId } = c.req.valid("param");
    const result = await getChatRules(user.id, { chatId });
    return c.json(result);
  }
);

// GET /api/rules/:id - Get specific rule
app.get(
  "/:id",
  zValidator("param", getRuleSchema),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    const result = await getRule(user.id, { id });
    return c.json(result);
  }
);

// POST /api/rules - Create rule
app.post(
  "/",
  zValidator("json", createRuleSchema),
  async (c) => {
    const user = c.get("authUser");
    const input = c.req.valid("json");
    const result = await createRule(user.id, input);
    return c.json(result);
  }
);

// PUT /api/rules/:id - Update rule
app.put(
  "/:id",
  zValidator("param", getRuleSchema),
  zValidator("json", updateRuleSchema),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    await updateRule(user.id, id, input);
    return c.json({ success: true });
  }
);

// DELETE /api/rules/:id - Delete rule
app.delete(
  "/:id",
  zValidator("param", deleteRuleSchema),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    await deleteRule(user.id, id);
    return c.json({ success: true });
  }
);

// POST /api/rules/:id/toggle - Toggle rule active status
app.post(
  "/:id/toggle",
  zValidator("param", toggleRuleSchema),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    await toggleRule(user.id, id);
    return c.json({ success: true });
  }
);

// POST /api/rules/:id/link - Link rule to chat
app.post(
  "/:id/link",
  zValidator("param", getRuleSchema),
  zValidator(
    "json",
    z.object({
      chatId: z.string(),
    })
  ),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    const { chatId } = c.req.valid("json");
    await linkRule(user.id, id, chatId);
    return c.json({ success: true });
  }
);

// POST /api/rules/:id/unlink - Unlink rule from chat
app.post(
  "/:id/unlink",
  zValidator("param", getRuleSchema),
  zValidator(
    "json",
    z.object({
      chatId: z.string(),
    })
  ),
  async (c) => {
    const user = c.get("authUser");
    const { id } = c.req.valid("param");
    const { chatId } = c.req.valid("json");
    await unlinkRule(user.id, id, chatId);
    return c.json({ success: true });
  }
);

export default app;
