import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/client";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [polarClient(), magicLinkClient()],
});
