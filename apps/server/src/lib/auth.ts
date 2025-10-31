import prisma from "@memora/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";

// Initialize Resend client for email sending
const resend = new Resend(Bun.env.RESEND_API_KEY);

const HTTP_STATUS = {
  TOO_MANY_REQUESTS: 429,
} as const;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  basePath: "/api/auth",
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/sign-in/magic-link": { window: 300, max: 10 },
      "/reset-password": { window: 900, max: 3 },
      "/change-password": { window: 60, max: 5 },
    },
  },

  trustedOrigins: [process.env.CORS_ORIGIN || ""],

  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const { error } = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: email,
          subject: "Sign in to Memora",
          html: `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="color: #333; margin-bottom: 20px;">Welcome to Memora</h2>
                <p style="color: #666; margin-bottom: 20px;">Click the button below to sign in to your account:</p>
                <a href="${url}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-bottom: 20px;">${url}</a>
                <p style="color: #999; font-size: 14px; margin-bottom: 10px;">This link will expire in 5 minutes.</p>
                <p style="color: #999; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
              </div>
            `,
        });

        if (error) {
          throw new Error(`Failed to send magic link email: ${error.message}`);
        }
      },
      expiresIn: 300, // 5 minutes
      disableSignUp: false, // Allow new users to sign up via magic link
    }),
    // polar({
    //   client: polarClient,
    //   createCustomerOnSignUp: true,
    //   enableCustomerPortal: true,
    //   use: [
    //     checkout({
    //       products: [
    //         {
    //           productId: "your-product-id",
    //           slug: "pro",
    //         },
    //       ],
    //       successUrl: process.env.POLAR_SUCCESS_URL,
    //       authenticatedUsersOnly: true,
    //     }),
    //     portal(),
    //   ],
    // }),
  ],
});
