-- KI-026 follow-up — fix INSERT bootstrap gap in "workspace_members" RLS.
--
-- With RLS actually enforced (non-BYPASSRLS `app_runtime` role), the `FOR
-- ALL` policy from 20260813045625_t017_add_rls_policies uses its USING
-- clause as the implicit WITH CHECK for INSERT too. That requires the
-- inserting session to already be an active member of the target
-- workspace — impossible for the very first membership row (the workspace
-- owner) created alongside `workspace.create()` in
-- WorkspaceRepository.create() (src/lib/repositories/workspace/workspace.repository.ts),
-- which intentionally does not go through `withCurrentUser` at that point
-- (there is no prior membership to set the session variable from).
--
-- Per DB-D05 (database-strategy.md), Application Service / RBAC is the
-- primary authorization layer; RLS is defense-in-depth on top of it, not a
-- replacement. INSERT into workspace_members only ever happens from
-- WorkspaceService (create-workspace, accept-invitation), which already
-- validates the caller — so relaxing the INSERT check to WITH CHECK (true)
-- does not remove any real authorization, it just stops RLS from blocking
-- a write path Application Service already guards. SELECT/UPDATE/DELETE
-- keep the strict workspace-isolation check unchanged.

DROP POLICY IF EXISTS "workspace_members_workspace_isolation" ON "workspace_members";

CREATE POLICY "workspace_members_workspace_isolation"
  ON "workspace_members"
  FOR SELECT
  USING (
    "workspace_id" IN (SELECT "workspace_id" FROM "public"."current_user_workspace_ids"())
  );

CREATE POLICY "workspace_members_workspace_isolation_update"
  ON "workspace_members"
  FOR UPDATE
  USING (
    "workspace_id" IN (SELECT "workspace_id" FROM "public"."current_user_workspace_ids"())
  );

CREATE POLICY "workspace_members_workspace_isolation_delete"
  ON "workspace_members"
  FOR DELETE
  USING (
    "workspace_id" IN (SELECT "workspace_id" FROM "public"."current_user_workspace_ids"())
  );

CREATE POLICY "workspace_members_insert"
  ON "workspace_members"
  FOR INSERT
  WITH CHECK (true);
