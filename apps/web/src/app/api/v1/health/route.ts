import { NextResponse } from "next/server";

import { auth } from "@/lib/better-auth/auth";

/**
 * Skema route `/api/v1` (ADR-043, T-019) — bukan endpoint mobile aktual
 * (itu Post-MVP). Membuktikan Bearer plugin bisa mengonversi
 * `Authorization: Bearer <token>` jadi session yang sama dipakai web,
 * tanpa auth guard `proxy.ts` (bypass, lihat BYPASS_PREFIXES) me-redirect
 * ke /login karena Bearer tidak pernah punya session cookie.
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  return NextResponse.json({ ok: true, userId: session.user.id });
}
