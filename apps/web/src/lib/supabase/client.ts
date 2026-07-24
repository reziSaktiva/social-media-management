import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client — Realtime / public Storage only (DO-D02).
 * Not for domain CRUD (use Prisma repositories).
 */

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required for browser Supabase client",
    );
  }

  return createClient(url, publishableKey);
}
