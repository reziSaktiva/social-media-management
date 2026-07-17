import { createClient } from "@supabase/supabase-js";

/**
 * Server Supabase client — Storage (and platform ops), not domain CRUD (DO-D02).
 * Uses service role; never expose to the browser.
 */

export function createServerSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for server Supabase client",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
