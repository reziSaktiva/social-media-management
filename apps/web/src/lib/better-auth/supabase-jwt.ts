import { SignJWT } from "jose";

/**
 * Supabase-compatible JWT for Realtime (AS-D03).
 * Short-lived token with sub = userId so auth.uid() works on notifications RLS.
 * Not a replacement for Better Auth session cookies.
 */

const DEFAULT_TTL_SECONDS = 60 * 60; // 1 hour

export async function createSupabaseRealtimeJwt(
  userId: string,
  options?: { expiresInSeconds?: number },
): Promise<string> {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error(
      "SUPABASE_JWT_SECRET is required to mint Realtime JWTs (AS-D03)",
    );
  }

  const expiresIn = options?.expiresInSeconds ?? DEFAULT_TTL_SECONDS;
  const key = new TextEncoder().encode(secret);

  return new SignJWT({
    role: "authenticated",
    sub: userId,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(key);
}
