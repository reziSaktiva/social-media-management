-- T-092.5 architecture-review follow-up (non-blocking finding from Ridwan
-- Architecture Reviewer, 2026-09-11) on the policy added in
-- 20260911100000_t092_4_fix_workspace_members_realtime_visibility.
--
-- `workspace_members_realtime_own_row` let a Realtime/JWT-only connection see
-- its OWN `workspace_members` row unconditionally, with no `status = 'active'`
-- gate — unlike `workspace_members_workspace_isolation`
-- (20260813081715_t017_scope_workspace_members_insert_and_visibility), which
-- already added that exact gate to fix the same class of bug (a removed/
-- banned member re-reading their own stale membership row forever).
--
-- Not currently exploitable: the only consumer,
-- `publishing_posts_realtime_workspace_members`
-- (20260911090000_t092_1_publishing_posts_realtime_rls), already ANDs
-- `wm.status = 'active'` itself in its own subquery, so a stale/removed
-- membership row surfaced by this policy never actually widens what
-- `publishing_posts` rows are visible today. But it is a latent
-- defense-in-depth gap: any future Realtime-enabled table that subqueries
-- into `workspace_members` without repeating that filter itself would
-- silently inherit visibility into removed members' stale rows. Add the same
-- `status = 'active'` gate here now, for consistency with
-- `workspace_members_workspace_isolation` and to close that gap before it
-- can be inherited elsewhere.
--
-- Same DROP POLICY + CREATE POLICY replace pattern as T-017/T-093.

DROP POLICY IF EXISTS "workspace_members_realtime_own_row" ON "workspace_members";

CREATE POLICY "workspace_members_realtime_own_row"
  ON "workspace_members"
  FOR SELECT
  USING (
    "user_id" = coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )
    AND "status" = 'active'
  );
