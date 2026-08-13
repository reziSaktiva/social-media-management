-- KI-026 code-review follow-up (PR #71) — three narrow corrections to the
-- `workspace_members` RLS policies added in this task, found once RLS was
-- actually enforced (see 20260813073556/073842/074306 for the history this
-- builds on).

-- ─────────────────────────────────────────────
-- 1. INSERT policy was `WITH CHECK (true)` — unconditionally permissive,
--    not scoped to the one legitimate case it exists for (creating the
--    owner row for a brand-new workspace, `WorkspaceRepository.createWithOwner`
--    — currently the ONLY code path that inserts into `workspace_members`).
--    Narrow it to exactly that: allow an insert only when the target
--    workspace has no members yet. A SECURITY DEFINER function is required
--    (not an inline subquery) for the same reason as `current_user_workspace_ids()`
--    — a subquery on `workspace_members` from within its own policy
--    recurses infinitely once RLS is enforced.
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION "public"."is_first_member_of_workspace"(p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM "workspace_members" WHERE "workspace_id" = p_workspace_id
  )
$$;

DROP POLICY IF EXISTS "workspace_members_insert" ON "workspace_members";

CREATE POLICY "workspace_members_insert"
  ON "workspace_members"
  FOR INSERT
  WITH CHECK ("public"."is_first_member_of_workspace"("workspace_id"));

-- ─────────────────────────────────────────────
-- 2. SELECT self-visibility clause (from 20260813074306) let a session see
--    ITS OWN row unconditionally — including a removed/banned member
--    (status <> 'active') re-reading their own stale membership forever.
--    Add the same `status = 'active'` gate the function-based branch
--    already applies. Safe for the bootstrap case this clause exists for:
--    `createWithOwner` always inserts the owner row with status already
--    'active' before the RETURNING check runs.
-- ─────────────────────────────────────────────

DROP POLICY IF EXISTS "workspace_members_workspace_isolation" ON "workspace_members";

CREATE POLICY "workspace_members_workspace_isolation"
  ON "workspace_members"
  FOR SELECT
  USING (
    ("user_id" = current_setting('app.current_user_id', true) AND "status" = 'active')
    OR "workspace_id" IN (SELECT "workspace_id" FROM "public"."current_user_workspace_ids"())
  );

-- ─────────────────────────────────────────────
-- 3. `current_user_workspace_ids()` filters `WHERE user_id = ... AND
--    status = 'active'`, and is now called by the RLS USING clause on
--    every workspace-scoped table (12+ tables) — but no index on
--    `workspace_members` has `user_id` as a leading column
--    (`@@index([workspaceId])` doesn't help this query direction).
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "workspace_members_user_id_status_idx"
  ON "workspace_members" ("user_id", "status");
