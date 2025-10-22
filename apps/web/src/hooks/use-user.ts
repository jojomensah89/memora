import type { User } from "better-auth";
import { authClient } from "@/lib/auth-client";

export function useUser() {
  const session = authClient.useSession();
  const user: User | undefined = session?.data?.user;
  return user;
}
