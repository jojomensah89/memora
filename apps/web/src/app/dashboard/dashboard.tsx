"use client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { apiClient } from "@/utils/api-client";

export default function Dashboard({
  customerState,
}: Readonly<{
  customerState: ReturnType<typeof authClient.customer.state>;
}>) {
  const privateData = useQuery({
    queryKey: ["private-data"],
    queryFn: () =>
      apiClient.get<{ message: string; user: unknown }>("/api/private-data"),
  });

  const hasProSubscription =
    (customerState?.activeSubscriptions?.length ?? 0) > 0;

  return (
    <>
      <p>API: {privateData.data?.message}</p>
      <p>Plan: {hasProSubscription ? "Pro" : "Free"}</p>
      {hasProSubscription ? (
        <Button onClick={async () => await authClient.customer.portal()}>
          Manage Subscription
        </Button>
      ) : (
        <Button
          onClick={async () => await authClient.checkout({ slug: "pro" })}
        >
          Upgrade to Pro
        </Button>
      )}
    </>
  );
}
