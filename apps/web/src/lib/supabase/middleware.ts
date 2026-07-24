/**
 * Supabase helpers for Next.js Proxy (Realtime JWT refresh patterns).
 * Domain auth/session remains Better Auth — see src/proxy.ts.
 */

export function isSupabasePublicPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/jobs")
  );
}
