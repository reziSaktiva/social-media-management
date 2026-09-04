-- T-093.1-3 — RLS gap closure for accept-invite (`/invite/[token]`).
--
-- Discovered while wiring up the accept-invite page: the invitee is, BY
-- DEFINITION, not yet a member of the target workspace at the moment they
-- (1) read the invitation by token, (2) flip its status pending -> accepted,
-- and (3) get their own `workspace_members` row inserted. All three steps
-- previously hit the same "must already be an active member" isolation
-- policies added in 20260813045625/20260813081715 — those were correctly
-- scoped for the bootstrap-Owner case (T-017) but never extended for the
-- accept-invite case (ADR-072's `findInvitationByToken` doc comment already
-- flagged this as a separate, deferred decision).
--
-- Follows the exact pattern already established for the bootstrap-Owner gap
-- (SECURITY DEFINER function + narrowly-scoped additional policy, see
-- 20260813073556/073842/074306/081715) instead of loosening the existing
-- isolation policies — each of the 3 additions below only widens access for
-- the ONE specific transition the accept-invite flow needs, nothing more:
--
--   1. `workspace_invitations` SELECT — a `pending` row becomes readable by
--      anyone who already has its `token` (32-byte hex, generated via
--      `randomBytes(32)` in `WorkspaceService.inviteMember` — unguessable,
--      the same trust model as a password-reset token). Does NOT expose
--      `accepted`/`revoked` rows, and does not help enumerate invitations
--      without already possessing a valid token (app code only ever
--      queries by exact `token` equality, never lists all rows).
--   2. `workspace_invitations` UPDATE — the pending -> accepted transition
--      is allowed only when the row's `email` matches the acting session's
--      OWN account email (case-insensitive, mirrors the email-bound check
--      already done in `WorkspaceService.acceptInvite`, ADR-080 point 6).
--      `WITH CHECK` additionally pins the resulting status to `accepted` —
--      this policy cannot be used to revoke/expire/mutate anything else.
--   3. `workspace_members` INSERT — extends the existing bootstrap-only
--      `is_first_member_of_workspace` check with an OR: also allow the
--      insert when an `accepted` invitation for this exact
--      (workspace, acting user's email) pair already exists. Safe because
--      `WorkspaceRepository.acceptInvitation` flips the invitation to
--      `accepted` FIRST, then inserts the member row, in the SAME
--      transaction — so by the time this check runs, policy #2 above has
--      already independently verified the requester owns that email.

-- ─────────────────────────────────────────────
-- 1. `workspace_invitations` — public read-by-token for pending invites.
-- ─────────────────────────────────────────────

CREATE POLICY "workspace_invitations_public_pending_lookup"
  ON "workspace_invitations"
  FOR SELECT
  USING ("status" = 'pending');

-- ─────────────────────────────────────────────
-- 2. `workspace_invitations` — invitee accepts (pending -> accepted).
--
-- SECURITY DEFINER (same reasoning as `current_user_workspace_ids()` /
-- `is_first_member_of_workspace()`): resolves the acting session's own
-- email from `identity_user` without that lookup being subject to RLS
-- itself (identity_* tables have no RLS at all per the note at the top of
-- 20260813045625, so this isn't bypassing anything — it's just centralizing
-- the lookup instead of repeating it inline in every policy that needs it).
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION "public"."current_user_email"()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT "email" FROM "identity_user" WHERE "id" = current_setting('app.current_user_id', true)
$$;

CREATE POLICY "workspace_invitations_accept_by_invitee"
  ON "workspace_invitations"
  FOR UPDATE
  USING (
    "status" = 'pending'
    AND lower("email") = lower("public"."current_user_email"())
  )
  WITH CHECK (
    "status" = 'accepted'
    AND lower("email") = lower("public"."current_user_email"())
  );

-- ─────────────────────────────────────────────
-- 3. `workspace_members` — insert the invitee's own row on accept.
--
-- Extends (does not replace) the bootstrap-only INSERT policy from
-- 20260813081715 with an OR branch. Joins through `identity_user` the same
-- way `current_user_email()` does, kept as its own function (rather than
-- calling `current_user_email()` internally) so this stays a single
-- self-contained EXISTS check against the two tables it actually needs.
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION "public"."has_accepted_invitation"(p_workspace_id uuid, p_user_id text)
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
  )
$$;

DROP POLICY IF EXISTS "workspace_members_insert" ON "workspace_members";

CREATE POLICY "workspace_members_insert"
  ON "workspace_members"
  FOR INSERT
  WITH CHECK (
    "public"."is_first_member_of_workspace"("workspace_id")
    OR "public"."has_accepted_invitation"("workspace_id", "user_id")
  );
