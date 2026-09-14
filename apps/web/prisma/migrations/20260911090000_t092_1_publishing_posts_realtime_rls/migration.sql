-- T-092.1 (ADR-094 poin 3, realtime-strategy.md § "Perluasan ke
-- `publishing_posts`") — adds the two pieces of Realtime setup that
-- `publishing_posts` was still missing, mirroring T-036's setup for
-- `notifications` (20260831150000_t036_notifications_realtime_setup /
-- 20260901120000_t036_fix_realtime_rls_cuid_cast):
--
--   1. `publishing_posts` was not a member of the `supabase_realtime`
--      publication — without this, Realtime never broadcasts change
--      events for this table regardless of RLS.
--
--   2. The only RLS policy on `publishing_posts`
--      (`publishing_posts_workspace_isolation`, added in
--      20260813045625_t017_add_rls_policies) is scoped to the SERVER-SIDE
--      session pattern — `current_setting('app.current_user_id')`, set by
--      `withCurrentUser` inside a Prisma transaction. A Realtime
--      connection never runs through that wrapper; it only carries a
--      Supabase JWT (`sub` = userId, minted by
--      `createSupabaseRealtimeJwt`), so Postgres only ever sees the JWT
--      claims. Without a policy that checks those claims, RLS is
--      default-deny for every Realtime read.
--
-- This policy is additive (PERMISSIVE, the Postgres default) alongside the
-- existing workspace-isolation one — it only widens access to rows whose
-- workspace the requesting user is an ACTIVE member of (via
-- `workspace_members`), never beyond that, and only for SELECT (Realtime
-- never needs INSERT/UPDATE/DELETE here; soft-delete already surfaces as
-- an UPDATE per ADR-094 point 2).
--
-- Applies the T-036 cuid-cast fix from the start, instead of repeating the
-- bug and fixing it later: `workspace_members.user_id` is a Better Auth
-- `cuid()` string (`text`), not a Postgres `uuid` (same correction as
-- `database-strategy.md` § RLS Policy Pattern and DO-D06 in
-- `database-orm.md`). Supabase's built-in `auth.uid()` unconditionally
-- casts the JWT `sub` claim to `::uuid`
-- (`select ... ::uuid` — see Supabase's `auth` schema), which throws
-- `invalid input syntax for type uuid` for a real cuid `sub`, silently
-- breaking Realtime delivery for every subscriber (channel still reaches
-- SUBSCRIBED, zero events ever delivered — exactly the symptom found and
-- fixed for `notifications` in
-- 20260901120000_t036_fix_realtime_rls_cuid_cast). So this policy reads
-- the `sub` claim directly as text (same GUC lookup `auth.uid()` uses
-- internally, minus the fatal `::uuid` cast) instead of calling
-- `auth.uid()`.

ALTER PUBLICATION supabase_realtime ADD TABLE "publishing_posts";

CREATE POLICY "publishing_posts_realtime_workspace_members"
  ON "publishing_posts"
  FOR SELECT
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = coalesce(
              nullif(current_setting('request.jwt.claim.sub', true), ''),
              (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
            )
        AND wm."status" = 'active'
    )
  );
