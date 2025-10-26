"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const errorMessages = {
  INVALID_TOKEN:
    "This magic link has expired or is invalid. Please request a new one.",
  EXPIRED_TOKEN: "This magic link has expired. Please request a new one.",
  TOKEN_USED:
    "This magic link has already been used. Please request a new one.",
  USER_NOT_FOUND:
    "We couldn't find an account with this email. Please sign up first.",
  VERIFY_YOUR_EMAIL:
    "Please check your email and verify your address before continuing.",
  default: "An error occurred during authentication. Please try again.",
};

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage =
    error && errorMessages[error as keyof typeof errorMessages]
      ? errorMessages[error as keyof typeof errorMessages]
      : errorMessages.default;

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl tracking-tight">
            Authentication Error
          </h1>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">Try Again</Link>
          </Button>

          <div className="text-muted-foreground text-sm">
            <p>
              If you keep seeing this error,{" "}
              <Link className="underline hover:text-foreground" href="/login">
                request a new magic link
              </Link>{" "}
              or contact support.
            </p>
          </div>
        </div>

        <div className="border-t pt-4 text-muted-foreground text-xs">
          <p>Error Code: {error || "UNKNOWN"}</p>
        </div>
      </div>
    </main>
  );
}
