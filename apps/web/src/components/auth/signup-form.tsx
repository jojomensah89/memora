"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
      organizationName: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: "/dashboard",
        },
        {
          onSuccess: () => {
            // Use provided organization name or default to "Name's Organization"
            const orgName = value.organizationName?.trim()
              ? value.organizationName.trim()
              : `${value.name}'s Organization`;

            const slug = orgName
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-+|-+$/g, "")
              .trim();

            if (!slug) {
              toast.error(
                "Invalid organization name. Please use alphanumeric characters."
              );
              return;
            }

            router.push("/success");
          },
          onError: (error) => {
            toast.error(
              error.error.message ||
                error.error.statusText ||
                "Failed to create account"
            );
          },
        }
      );
    },
    validators: {
      onChange: z
        .object({
          name: z
            .string()
            .min(
              MIN_NAME_LENGTH,
              `Name must be at least ${MIN_NAME_LENGTH} characters`
            ),
          email: z.email("Invalid email address"),
          password: z
            .string()
            .min(
              MIN_PASSWORD_LENGTH,
              `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
            ),
          confirmPassword: z.string(),
          organizationName: z.string(),
        })
        .superRefine(({ password, confirmPassword }, ctx) => {
          if (password !== confirmPassword && confirmPassword !== "") {
            ctx.addIssue({
              code: "custom",
              message: "Passwords do not match",
              path: ["confirmPassword"],
            });
          }
        }),
      onSubmit: z
        .object({
          name: z
            .string()
            .min(
              MIN_NAME_LENGTH,
              `Name must be at least ${MIN_NAME_LENGTH} characters`
            ),
          email: z.email("Invalid email address"),
          password: z
            .string()
            .min(
              MIN_PASSWORD_LENGTH,
              `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
            ),
          confirmPassword: z.string(),
          organizationName: z.string(),
        })
        .superRefine(({ password, confirmPassword }, ctx) => {
          if (password !== confirmPassword) {
            ctx.addIssue({
              code: "custom",
              message: "Passwords do not match",
              path: ["confirmPassword"],
            });
          }
        }),
    },
  });

  const { isSubmitting } = form.state;
  if (isSubmitting) {
    return <Loader />;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Create your account & organization
          </CardTitle>
          <CardDescription>
            Enter your details below to create your account and start
            collaborating
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}> Full Name</Label>
                    <Input
                      disabled={isSubmitting}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="John Doe"
                      required
                      type="text"
                      value={field.state.value}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-xs">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
              <form.Field name="organizationName">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      Organization Name (Optional)
                    </Label>
                    <Input
                      disabled={isSubmitting}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Acme Inc"
                      type="text"
                      value={field.state.value}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-xs">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                    <FieldDescription className="text-xs">
                      Leave blank to use a default organization name
                    </FieldDescription>
                  </div>
                )}
              </form.Field>
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      disabled={isSubmitting}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="m@example.com"
                      type="email"
                      value={field.state.value}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-xs">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <form.Field name="password">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Password</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="password"
                          value={field.state.value}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-red-500 text-xs">
                            {field.state.meta.errors[0]?.message}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                  <form.Field name="confirmPassword">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Confirm Password</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          type="password"
                          value={field.state.value}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-red-500 text-xs">
                            {field.state.meta.errors[0]?.message}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <form.Subscribe>
                  {(state) => (
                    <Button
                      className="w-full"
                      disabled={!state.canSubmit || state.isSubmitting}
                      type="submit"
                    >
                      {state.isSubmitting
                        ? "Creating Account..."
                        : "Create Account"}
                    </Button>
                  )}
                </form.Subscribe>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-gray-200 border-t" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={async () => {
                    await authClient.signIn.social(
                      {
                        provider: "github",
                        callbackURL: "/dashboard",
                      },
                      {
                        onError: (error) => {
                          toast.error(
                            error.error.message ||
                              "Failed to sign up with GitHub"
                          );
                        },
                      }
                    );
                  }}
                  type="button"
                  variant="outline"
                >
                  <svg
                    aria-label="GitHub"
                    className="mr-2 h-4 w-4"
                    fill="currentColor"
                    role="img"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link href="#">Terms of Service</Link> and{" "}
        <Link href="#">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}
