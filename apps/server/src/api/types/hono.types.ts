import type { Context } from "hono";
import type { AuthVariables } from "./auth.types";

export type AppContext = Context<{ Variables: AuthVariables }>;
