-- T-093 code review follow-up (Ridwan Architecture Reviewer) — 2 security
-- findings on the accept-invite RLS policies added in
-- 20260831035427_t093_accept_invite_rls. Does NOT edit that already-applied
-- migration (per review guidance) — both fixes land as new DDL here.

-- ─────────────────────────────────────────────
-- Finding 1 — `workspace_invitations_public_pending_lookup` (SELECT) let
-- ANY caller read EVERY `pending` invitation across every workspace, not
-- just the one matching a token the caller actually possesses. It only
-- "worked safely" because the sole application caller
-- (`WorkspaceRepository.findInvitationByToken`) happened to always filter
-- `WHERE token = $1` in the query itself — RLS did not enforce that
-- narrowing on its own, so raw SQL, a different tool, or a future bug could
-- enumerate every pending invitee's email across the whole database.
--
-- Precedent check: Better Auth's own token-based lookups (email
-- verification / password reset, `identity_verification`) don't offer a
-- reusable pattern here — those tables have NO RLS at all (identity_* is
-- excluded per the note at the top of 20260813045625; DB-D04, separate
-- bounded context), so there was nothing for RLS to over-permit there in
-- the first place. `workspace_invitations` DOES have RLS (it's
-- workspace-scoped), so the fix has to actually happen at the RLS layer.
--
-- Fix: make RLS itself compare against the SPECIFIC token being looked up,
-- the same `SET LOCAL` + `current_setting()` session-variable pattern this
-- migration set already uses for `app.current_user_id` (with-current-user.ts)
-- — just for a second, narrower-purpose GUC. `WorkspaceRepository.findInvitationByToken`
-- (application code, changed alongside this migration) now sets
-- `app.invite_lookup_token` to the exact token it's querying for, inside a
-- transaction, before running the SELECT. A caller that never sets this GUC
-- (raw SQL, a different tool, a future bug that forgets to call the
-- wrapper) gets `current_setting(..., true)` = NULL, which can never equal
-- a real token string — default-deny, not default-permit.
CREATE OR REPLACE FUNCTION "public"."current_invite_lookup_token"()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT current_setting('app.invite_lookup_token', true)
$$;

DROP POLICY IF EXISTS "workspace_invitations_public_pending_lookup" ON "workspace_invitations";

CREATE POLICY "workspace_invitations_public_pending_lookup"
  ON "workspace_invitations"
  FOR SELECT
  USING (
    "status" = 'pending'
    AND "token" = "public"."current_invite_lookup_token"()
  );

-- ─────────────────────────────────────────────
-- Finding 2 — the `workspace_members_insert` OR-branch added for
-- accept-invite (`has_accepted_invitation(workspace_id, user_id)`) checked
-- that an accepted invitation exists for that workspace+email, but never
-- checked that the ROLE being inserted matches the ROLE on that invitation.
-- The sibling `workspace_invitations_accept_by_invitee` policy already
-- pins its own `WITH CHECK` to `status = 'accepted'`; this insert check had
-- no equivalent pin on `role`, a latent privilege-escalation gap if a
-- future insert path into `workspace_members` (bypassing
-- `WorkspaceService.acceptInvite`) ever reused this OR-branch with an
-- attacker-chosen role.
--
-- Fix: `has_accepted_invitation` now takes the role being inserted as a
-- third argument and requires it to match the accepted invitation's own
-- `role` column exactly — the row can only be inserted with the SAME role
-- the invitation actually granted, never a different one. The 2-argument
-- overload is dropped outright (not left dangling) since the policy below
-- is its only caller.
DROP POLICY IF EXISTS "workspace_members_insert" ON "workspace_members";
DROP FUNCTION IF EXISTS "public"."has_accepted_invitation"(uuid, text);

CREATE FUNCTION "public"."has_accepted_invitation"(p_workspace_id uuid, p_user_id text, p_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "workspace_invitations" wi
    JOIN "identity_user" u ON lower(u."email") = lower(wi."email")
    WHERE wi."workspace_id" = p_workspace_id
      AND u."id" = p_user_id
      AND wi."status" = 'accepted'
      AND wi."role" = p_role
  )
$$;

DROP POLICY IF EXISTS "workspace_members_insert" ON "workspace_members";

CREATE POLICY "workspace_members_insert"
  ON "workspace_members"
  FOR INSERT
  WITH CHECK (
    "public"."is_first_member_of_workspace"("workspace_id")
    OR "public"."has_accepted_invitation"("workspace_id", "user_id", "role")
  );
