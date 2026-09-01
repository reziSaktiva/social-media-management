import { NextResponse } from "next/server";

import { auth } from "@/lib/better-auth/auth";
import { createSupabaseRealtimeJwt } from "@/lib/better-auth/supabase-jwt";

/**
 * JWT bridge (T-036.3, AS-D03 "Mekanisme Konteks 2") — menerbitkan Supabase
 * Realtime JWT (HS256, `sub = userId`) dari session Better Auth aktif, agar
 * `auth.uid()` valid untuk RLS `notifications_realtime_own_rows` saat
 * browser client subscribe lewat `postgres_changes` (T-036.2).
 *
 * Sengaja di luar `/api/v1` — surface itu khusus Bearer-token mobile
 * (ADR-043); token Realtime ini murni untuk browser client, konteks beda.
 * Pola cek session sama seperti `apps/web/src/app/api/v1/health/route.ts`.
 */
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = await createSupabaseRealtimeJwt(session.user.id);

  return NextResponse.json({ token });
}
