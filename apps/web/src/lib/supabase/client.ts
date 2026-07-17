import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client — Realtime / public Storage only (DO-D02).
 * Not for domain CRUD (use Prisma repositories).
 */

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for browser Supabase client",
    );
  }

  return createClient(url, anonKey);
}
