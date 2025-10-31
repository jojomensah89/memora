"use client";

import { authClient } from "@/lib/auth-client";

export function useUser() {
  // Destructure useSession from authClient first
  const { useSession } = authClient;
  
  // Then call it as a hook
  const { data: session, isPending, error } = useSession();
  
  const user = session?.user;
  
  return {
    user,
    isPending,
    error,
  };
}
