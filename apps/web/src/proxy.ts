import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Auth guard — session-cookie gate for protected routes (M8 workspace onboarding).
 * /api/auth/*, /api/jobs/*, /api/health are bypassed (monorepo-setup.md).
 *
 * Renamed from `middleware` per Next.js 16 file convention
 * (https://nextjs.org/docs/messages/middleware-to-proxy) — behavior unchanged.
 *
 * This is an optimistic cookie-presence check only (no DB call — Better
 * Auth's own recommended middleware pattern). Full session validation
 * (`auth.api.getSession`) and workspace-context resolution happen in Server
 * Components / Server Actions, which have Node.js runtime + Prisma access.
 */

const BYPASS_PREFIXES = ["/api/auth", "/api/jobs", "/api/health"];

const PUBLIC_AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

function isUnderPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const isPublicAuthPage = PUBLIC_AUTH_PATHS.some((path) =>
    isUnderPath(pathname, path),
  );
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (!hasSessionCookie && !isPublicAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSessionCookie && isPublicAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
