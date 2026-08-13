-- KI-026 follow-up — allow a user to always see their OWN "workspace_members"
-- row directly (no subquery), fixing the remaining INSERT bootstrap gap.
--
-- Prisma's `create()` always issues `INSERT ... RETURNING`, and Postgres
-- evaluates the table's SELECT policy against the row being returned — even
-- though the previous migration's `WITH CHECK (true)` lets the INSERT
-- itself through. The SELECT policy only allowed rows found via
-- `current_user_workspace_ids()` (a fresh query against the table), which
-- cannot see the row from the very same INSERT statement that hasn't
-- committed yet — so the very first (owner) membership row for a new
-- workspace still failed with "new row violates row-level security policy",
-- even with the INSERT policy relaxed.
--
-- Fix: OR in a direct, non-subquery check — "this row's own user_id equals
-- the current session's user" — which Postgres can evaluate against the
-- row itself without requerying the table, so it works for a row that was
-- just inserted in the same statement. This does not weaken isolation: a
-- user could already always see their own membership rows by definition
-- (needed by `current_user_workspace_ids()` itself); this just lets that
-- same fact be checked without a table lookup.
--
-- Application-side counterpart: WorkspaceRepository.create() must call
-- `withCurrentUser(ownerId, ...)` around the owner-membership insert so
-- `app.current_user_id` is actually set to the new member's own userId at
-- insert time (see with-current-user.ts) — otherwise this OR clause has
-- nothing to match against.

DROP POLICY IF EXISTS "workspace_members_workspace_isolation" ON "workspace_members";

CREATE POLICY "workspace_members_workspace_isolation"
  ON "workspace_members"
  FOR SELECT
  USING (
    "user_id" = current_setting('app.current_user_id', true)
    OR "workspace_id" IN (SELECT "workspace_id" FROM "public"."current_user_workspace_ids"())
  );
