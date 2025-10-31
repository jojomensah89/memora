import { authClient } from "@/lib/auth-client";

export async function useUser() {
  const session = await authClient.getSession();
  const user = session?.data?.user;
  return user;
}
