"use client";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export default function Home() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());

  return (
    <div className="container mx-auto flex h-screen w-full flex-col items-center justify-center gap-6 px-4 py-2">
      <section className="rounded-lg border p-4">
        <h2 className="mb-2 font-medium">API Status</h2>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-muted-foreground text-sm">
            {healthCheck.isLoading && "Checking..."}
            {!healthCheck.isLoading && healthCheck.data && "Connected"}
            {!(healthCheck.isLoading || healthCheck.data) && "Disconnected"}
          </span>
        </div>
      </section>
    </div>
  );
}
