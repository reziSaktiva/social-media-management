import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { LAST_WORKSPACE_SLUG_COOKIE } from "@/lib/workspace/last-workspace-cookie";

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

// Top-level segments yang bukan workspace slug (`/[slug]/...`) — dipakai
// findWorkspaceSlugInPath di bawah untuk membedakan "/insvire" (workspace)
// dari "/account", "/onboarding", dst.
const RESERVED_TOP_LEVEL_SEGMENTS = new Set([
  "account",
  "api",
  "onboarding",
  ...PUBLIC_AUTH_PATHS.map((path) => path.slice(1)),
]);

function isUnderPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Segmen pertama path, kalau bukan route top-level yang direservasi. */
function findWorkspaceSlugInPath(pathname: string): string | null {
  const [, first] = pathname.split("/");
  if (!first || RESERVED_TOP_LEVEL_SEGMENTS.has(first)) {
    return null;
  }
  return first;
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

  const response = NextResponse.next();

  // Ingat workspace terakhir dikunjungi supaya link "Kembali ke Workspace"
  // di /account tidak selalu jatuh ke membership tertua user (code-review
  // finding, T-016 review).
  if (hasSessionCookie) {
    const workspaceSlug = findWorkspaceSlugInPath(pathname);
    if (workspaceSlug) {
      response.cookies.set(LAST_WORKSPACE_SLUG_COOKIE, workspaceSlug, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
