import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default async function RulesPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session?.data?.user) {
    redirect("/login");
  }

  return <div>rules</div>;
}
