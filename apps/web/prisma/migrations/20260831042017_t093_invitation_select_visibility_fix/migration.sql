-- T-093.4 QA follow-up — fix SELECT-visibility gap in the accept-invite RLS
-- policies added by 20260831035427_t093_accept_invite_rls.
--
-- Discovered while browser-verifying the "Email Baru" state end-to-end:
-- `WorkspaceRepository.acceptInvitation`'s UPDATE (pending -> accepted) kept
-- failing with "new row violates row-level security policy for table
-- workspace_invitations" even though the new
-- `workspace_invitations_accept_by_invitee` policy's own USING and WITH
-- CHECK both independently evaluate true for the invitee.
--
-- Root cause, isolated with a minimal `CREATE TEMP TABLE ... FORCE ROW
-- LEVEL SECURITY` repro (Postgres 17.6): an UPDATE's resulting NEW row must
-- ALSO satisfy at least one applicable SELECT policy on the table — not
-- just the UPDATE policy's own WITH CHECK — even with no `RETURNING`
-- clause involved (a stricter version of the exact "RETURNING needs SELECT
-- visibility" gotcha already documented in 20260813074306 for
-- `workspace_members`'s owner-bootstrap row). The only SELECT policy that
-- previously existed for a `pending` row
-- (`workspace_invitations_public_pending_lookup`) stops covering the row
-- the instant its status flips to `accepted`, so the UPDATE that performs
-- that exact flip was rejected trying to "see" its own result.
--
-- Fix: add one more narrowly-scoped SELECT policy — a user can always see
-- an invitation addressed to their OWN account email, regardless of its
-- status. This is strictly narrower than the existing public
-- pending-by-token policy (requires a real, matching identity_user email,
-- not just knowledge of a token) and is exactly the visibility the
-- accept-by-invitee UPDATE's new row needs.

CREATE POLICY "workspace_invitations_own_by_email"
  ON "workspace_invitations"
  FOR SELECT
  USING (lower("email") = lower("public"."current_user_email"()));
