"use client";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import MagicLinkForm from "@/components/auth/magic-link-form";
import { GL } from "@/components/gl";

export default function Page() {
  return (
    <div className="relative min-h-svh">
      {/* 3D Background - Fixed position behind everything */}
      <div className="fixed inset-0 z-0">
        <GL hovering={false} />
      </div>

      {/* Content - Layered above background */}
      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link
            className="flex items-center gap-2 self-center font-medium"
            href="/"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Memora 
          </Link>
          <MagicLinkForm
            description="Create your account with Google"
            footerLinkHref="/login"
            footerLinkText="Already have an account? Sign in"
            showNameField={true}
            submitText="Create Account"
            submittingText="Creating Account..."
            successMessage="Sign up successful"
            title="Create your account"
          />
        </div>
      </div>
    </div>
  );
}
