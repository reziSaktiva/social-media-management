/**
 * Supabase helpers for Next.js middleware (Realtime JWT refresh patterns).
 * Domain auth/session remains Better Auth — see src/middleware.ts.
 */

export function isSupabasePublicPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/jobs")
  );
}
