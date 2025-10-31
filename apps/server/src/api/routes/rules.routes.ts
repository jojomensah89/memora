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

// GET /api/rules - List all rules
app.get(
  "/",
  withAuth(async (c, _authUser) => {
    const _query = c.req.query();

    // TODO: Implement actual rules logic
    return c.json({
      data: [],
      hasMore: false,
      total: 0,
      message: "Rules endpoint - to be fully implemented",
    });
  })
);

// GET /api/rules/:id - Get specific rule
app.get(
  "/:id",
  withAuth(async (c, _authUser) => {
    const { id } = c.req.param();

    // TODO: Implement actual rule retrieval logic
    return c.json({
      message: `Get rule ${id} - to be fully implemented`,
    });
  })
);

// POST /api/rules - Create rule
app.post(
  "/",
  withAuth(async (c, _authUser) => {
    const body = await c.req.json();

    const createRuleSchema = z.object({
      name: z.string().min(1, "Name is required").max(100, "Name too long"),
      description: z.string().max(500, "Description too long").optional(),
      content: z
        .string()
        .min(1, "Content is required")
        .max(10_000, "Content too long"),
      scope: z.enum(["LOCAL", "GLOBAL"]).default("GLOBAL"),
      isActive: z.boolean().default(true),
      tags: z.array(z.string()).optional().default([]),
      chatId: z.string().optional(),
    });

    try {
      const input = createRuleSchema.parse(body);

      // TODO: Implement actual rule creation logic
      return c.json(
        {
          message: "Create rule - to be fully implemented",
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

// PUT /api/rules/:id - Update rule
app.put(
  "/:id",
  withAuth(async (c, _authUser) => {
    const { id } = c.req.param();
    const body = await c.req.json();

    try {
      // TODO: Implement actual rule update logic
      return c.json({
        message: `Update rule ${id} - to be fully implemented`,
        data: body,
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 500);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  })
);

// DELETE /api/rules/:id - Delete rule
app.delete(
  "/:id",
  withAuth(async (c, _authUser) => {
    const { id: _id } = c.req.param();

    // TODO: Implement actual rule deletion logic
    return c.text("", 204);
  })
);

export default app;
