-- T-036 bugfix (found during Najwa QA's realtime live-update investigation,
-- 2026-09-01) — root cause was NOT a SUPABASE_JWT_SECRET mismatch as first
-- suspected. Diagnostic: minting a Realtime JWT with `createSupabaseRealtimeJwt`
-- and hitting PostgREST directly with it got PAST signature verification
-- (would 401 immediately on a bad secret) and instead failed deep inside RLS
-- evaluation with:
--
--   invalid input syntax for type uuid: "<cuid value>"
--
-- Supabase's built-in `auth.uid()` is defined as:
--
--   select coalesce(
--     nullif(current_setting('request.jwt.claim.sub', true), ''),
--     (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
--   )::uuid
--
-- It casts the JWT `sub` claim to `::uuid` UNCONDITIONALLY. Better Auth's
-- `userId` (`identity_user.id`) is a `cuid()` string, NOT a UUID — the exact
-- same mismatch already called out for the server-side `app.current_user_id`
-- GUC in `with-current-user.ts` (DO-D06), but missed when
-- `notifications_realtime_own_rows` was added in
-- `20260831150000_t036_notifications_realtime_setup` because it relied on
-- `auth.uid()` directly. Every real user's JWT (`sub` = cuid) makes
-- `auth.uid()` throw, so RLS evaluation errors out for every row/subscriber
-- on every request — Realtime swallows this per-subscriber failure silently
-- (channel still reaches `SUBSCRIBED`, zero events ever delivered, no
-- client-visible error), which matches Najwa's reported symptom exactly.
--
-- Fix: stop going through `auth.uid()` (owned by the `auth` schema, not
-- ours to redefine) and read the `sub` claim directly as text — same GUC
-- lookup `auth.uid()` uses internally, minus the fatal `::uuid` cast. This
-- keeps the "own rows only" semantics (`user_id = <jwt sub>`) without
-- assuming UUID shape.

DROP POLICY IF EXISTS "notifications_realtime_own_rows" ON "notifications";

CREATE POLICY "notifications_realtime_own_rows"
  ON "notifications"
  FOR SELECT
  USING (
    "user_id" = coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )
  );
