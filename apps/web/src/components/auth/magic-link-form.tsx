"use client";
import { useForm } from "@tanstack/react-form";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;

interface MagicLinkFormProps extends React.ComponentProps<"div"> {
  showNameField?: boolean;
  title?: string;
  description?: string;
  submitText?: string;
  submittingText?: string;
  successMessage?: string;
  footerLinkText?: string;
  footerLinkHref?: Route;
}

export default function MagicLinkForm({
  className,
  showNameField = true,
  title = "Welcome back",
  description = "Login with your Google account",
  submitText = "Create Account",
  submittingText = "Creating Account...",
  successMessage = "Sign up successful",
  footerLinkText = "Already have an account? Sign in",
  footerLinkHref = "/login",
  ...props
}: Readonly<MagicLinkFormProps>) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.magicLink(
        {
          email: value.email,
          name: showNameField ? value.name : undefined,
          callbackURL: "http://localhost:3001/dashboard",
          // newUserCallbackURL: "/dashboard",
          // errorCallbackURL: "/login",
        },
        {
          onSuccess: () => {
            toast.success("Magic link sent! Check your email.");
            router.push(
              `/check-email?email=${encodeURIComponent(value.email)}`
            );
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: showNameField
        ? z.object({
            email: z.email("Invalid email address"),
            name: z
              .string()
              .min(MIN_NAME_LENGTH)
              .max(MAX_NAME_LENGTH)
              .nonempty("Name is required"),
          })
        : z.object({
            email: z.email("Invalid email address"),
            name: z.string(),
          }),
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <Field>
                <div className="relative">
                  <Button
                    className="w-full cursor-pointer justify-center gap-2 py-2.5"
                    onClick={async () => {
                      await authClient.signIn.social(
                        {
                          provider: "github",
                          callbackURL: "http://localhost:3001/dashboard",
                        },
                        {
                          onError: (error) => {
                            toast.error(
                              error.error.message ||
                                "Failed to login with GitHub"
                            );
                          },
                        }
                      );
                    }}
                    type="button"
                    variant="outline"
                  >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <title>Login with GitHub</title>
                      <path
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                        fill="currentColor"
                      />
                    </svg>
                    Login with GitHub
                  </Button>
                </div>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              {showNameField && (
                <div>
                  <form.Field name="name">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Name</Label>
                        <Input
                          disabled={form.state.isSubmitting}
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="John Doe"
                          type="text"
                          value={field.state.value}
                        />
                        {field.state.meta.errors.map((error) => (
                          <p className="text-red-500" key={error?.message}>
                            {error?.message}
                          </p>
                        ))}
                      </div>
                    )}
                  </form.Field>
                </div>
              )}
              <div>
                <form.Field name="email">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        disabled={form.state.isSubmitting}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="m@example.com"
                        type="email"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.map((error) => (
                        <p className="text-red-500" key={error?.message}>
                          {error?.message}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Subscribe>
                {(state) => (
                  <Button
                    className="w-full"
                    disabled={!state.canSubmit || state.isSubmitting}
                    type="submit"
                  >
                    {state.isSubmitting ? submittingText : submitText}
                  </Button>
                )}
              </form.Subscribe>
              <FieldDescription className="text-center">
                <Link href={footerLinkHref}>{footerLinkText}</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="/terms">Terms of Service</a> and{" "}
        <a href="/privacy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
