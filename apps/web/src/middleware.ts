import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

// Routes that don't require authentication
const PUBLIC_ROUTES = new Set(["/login", "/signup", "/error", "/check-email"]);

// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = new Set(["/login", "/signup"]);

// Static file extensions to skip
const STATIC_EXTENSIONS = new Set([
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".gif",
  ".webp",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for:
  // - Next.js internals (_next/)
  // - API routes (/api/)
  // - Auth callback routes (/auth/)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/")
  ) {
    return NextResponse.next();
  }

  // Check if pathname ends with any static extension
  const hasStaticExtension = Array.from(STATIC_EXTENSIONS).some((ext) =>
    pathname.endsWith(ext)
  );

  if (hasStaticExtension) {
    return NextResponse.next();
  }

  // Get session
  const session = await authClient.getSession({
    fetchOptions: {
      headers: request.headers,
    },
  });

  const isAuthenticated = !!session?.data?.user;
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  // Redirect unauthenticated users to login (except for public routes)
  if (!(isAuthenticated || isPublicRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname); // Save original destination
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect authenticated users from home to dashboard
  if (isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
