-- KI-026 follow-up — fix infinite recursion in "workspace_members" RLS policy.
--
-- Discovered once `DATABASE_URL` moved to the non-BYPASSRLS `app_runtime`
-- role (see 20260813045625_t017_add_rls_policies): the original policy
-- subqueries "workspace_members" from within its own policy on
-- "workspace_members", so Postgres re-evaluates the same policy on every
-- row of the subquery, forever (ERROR: infinite recursion detected in
-- policy for relation "workspace_members"). This was invisible under
-- BYPASSRLS because the policy was never actually executed.
--
-- Standard fix: move the self-lookup into a SECURITY DEFINER function owned
-- by a role that bypasses RLS (migrations run as `postgres`, which is
-- BYPASSRLS) — SECURITY DEFINER makes the function body execute as its
-- owner, so the internal SELECT against "workspace_members" does not
-- re-trigger the policy. Every other policy in this migration set already
-- reaches "workspace_members" via a plain JOIN/EXISTS (not a subquery of
-- "workspace_members" from within its own policy), so only this one policy
-- needs to change.

DROP POLICY IF EXISTS "workspace_members_workspace_isolation" ON "workspace_members";

CREATE OR REPLACE FUNCTION "public"."current_user_workspace_ids"()
RETURNS TABLE("workspace_id" uuid)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT wm."workspace_id"
  FROM "workspace_members" wm
  WHERE wm."user_id" = current_setting('app.current_user_id', true)
    AND wm."status" = 'active'
$$;

CREATE POLICY "workspace_members_workspace_isolation"
  ON "workspace_members"
  FOR ALL
  USING (
    "workspace_id" IN (SELECT "workspace_id" FROM "public"."current_user_workspace_ids"())
  );
