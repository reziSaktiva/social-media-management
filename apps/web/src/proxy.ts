import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Auth guard + workspace context injection — skeleton for M7 auth bootstrap.
 * /api/auth/* and /api/jobs/* are bypassed (monorepo-setup.md).
 *
 * Renamed from `middleware` per Next.js 16 file convention
 * (https://nextjs.org/docs/messages/middleware-to-proxy) — behavior unchanged.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/jobs") ||
    pathname.startsWith("/api/health")
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
