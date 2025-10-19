"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md space-y-6 border-border p-8 text-center shadow-lg">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              aria-labelledby="success-icon-title"
              className="h-8 w-8 text-primary"
              fill="none"
              role="img"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title id="success-icon-title">
                Account created successfully
              </title>
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-bold text-3xl text-foreground">Welcome!</h1>
          <p className="text-muted-foreground">
            Your account and organization have been successfully created. You
            can now start collaborating with your team.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Link className="w-full" href="/dashboard">
            <Button className="h-10 w-full">Go to Dashboard</Button>
          </Link>
          <Button className="w-full" variant="outline">
            Invite Team Members
          </Button>
        </div>
      </Card>
    </main>
  );
}
