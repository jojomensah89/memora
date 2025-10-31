import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import Dashboard from "./dashboard";

export default async function DashboardPage() {
  // Middleware already ensures user is authenticated
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  const { data: customerState } = await authClient.customer.state({
    fetchOptions: {
      headers: await headers(),
    },
  });

  return (
    <div className="bg-background">
      <h1>Dashboard</h1>
      <p>Welcome {session?.user?.name}</p>
      <Dashboard customerState={customerState} />
    </div>
  );
}
