-- T-092.7 (code review PR 118/119, altitude finding) — factor the Realtime
-- JWT `sub`-claim-as-text expression out of individual RLS policies into a
-- reusable function, mirroring `current_user_workspace_ids()`
-- (20260813073556_t017_fix_workspace_members_rls_recursion) for the
-- GUC-based (`app.current_user_id`) equivalent.
--
-- Before this migration, the coalesce/nullif/jsonb expression that reads
-- the Realtime JWT `sub` claim as text (avoiding `auth.uid()`'s fatal
-- `::uuid` cast for cuid user ids) was hand-duplicated verbatim across
-- `publishing_posts_realtime_workspace_members`
-- (20260911090000_t092_1_publishing_posts_realtime_rls) and
-- `workspace_members_realtime_own_row`
-- (20260911110000_t092_5_workspace_members_realtime_own_row_active_filter)
-- — every future Realtime-enabled table's RLS policy would have had to
-- repeat it by hand again, with 3 independent chances to typo or drop a
-- filter (exactly what happened: 20260911100000_t092_4 forgot the
-- `status = 'active'` filter, 20260911110000_t092_5 had to patch it back
-- in).
--
-- Not SECURITY DEFINER (unlike `current_user_workspace_ids()`) — this
-- function only reads a GUC/session setting, it never queries a
-- RLS-protected table, so there is no recursion to bypass.

CREATE OR REPLACE FUNCTION "public"."current_realtime_user_id"()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )
$$;

DROP POLICY IF EXISTS "publishing_posts_realtime_workspace_members" ON "publishing_posts";

CREATE POLICY "publishing_posts_realtime_workspace_members"
  ON "publishing_posts"
  FOR SELECT
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = "public"."current_realtime_user_id"()
        AND wm."status" = 'active'
    )
  );

DROP POLICY IF EXISTS "workspace_members_realtime_own_row" ON "workspace_members";

CREATE POLICY "workspace_members_realtime_own_row"
  ON "workspace_members"
  FOR SELECT
  USING (
    "user_id" = "public"."current_realtime_user_id"()
    AND "status" = 'active'
  );
