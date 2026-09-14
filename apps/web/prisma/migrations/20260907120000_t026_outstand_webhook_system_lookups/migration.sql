-- T-026 (Webhook handler Outstand) — narrow SECURITY DEFINER lookups for
-- SYSTEM-CONTEXT reads triggered by the Outstand webhook route
-- (`/api/webhooks/outstand`), which has NO Better Auth session / acting
-- `userId` to set via `withCurrentUser()`.
--
-- **Gap found while implementing T-026 (flagged to King Rezi in the task
-- report, not decided silently — AGENTS.md "laporkan ke user, jangan
-- putuskan sendiri"):** RLS on `publishing_posts` / `publishing_post_targets`
-- / `workspace_connected_accounts` (migration
-- `20260813045625_t017_add_rls_policies`) requires
-- `current_setting('app.current_user_id', true)` to match an ACTIVE
-- `workspace_members` row. `DATABASE_URL` connects as the non-BYPASSRLS
-- `app_runtime` role (KI-026), so a plain query with no session GUC set
-- returns ZERO rows (default-deny) — a webhook processor built only with
-- the existing `withCurrentUser`/`prisma` primitives would silently no-op
-- for every single event, because there is no legitimate userId to pass in
-- until AFTER the post/account is looked up.
--
-- This migration adds two read-only functions, `SECURITY DEFINER` so they
-- execute as the function owner (table owner, effectively BYPASSRLS for
-- their own body only — same mechanism already used by
-- `current_user_workspace_ids()` in migration
-- `20260813073556_t017_fix_workspace_members_rls_recursion`), each scoped to
-- an EXACT external Outstand id lookup (never a broad/listing query) — the
-- same shape of narrow exception already established for anonymous access
-- in this codebase (`setInviteLookupToken` / `current_invite_lookup_token()`
-- for the accept-invite token lookup, migration
-- `20260831044328_t093_code_review_rls_hardening`).
--
-- After this lookup resolves `authorId` (post events) or the workspace
-- Owner's `userId` (account events), the WebhookProcessor reuses the
-- EXISTING `withCurrentUser`-wrapped repository methods
-- (`updateTargetOutcome`, `markPostFailed`, connected-account update) with
-- that id as the acting user — so this migration only widens the READ path
-- for the initial lookup, not the write path.
--
-- Security note: unlike `current_user_workspace_ids()` (safe to leave
-- PUBLIC-executable because it depends on a session GUC that a PostgREST
-- caller never sets), these two functions do NOT depend on session state —
-- if left PUBLIC-executable, Supabase PostgREST would auto-expose them as
-- `/rest/v1/rpc/...` and let ANY anon/authenticated caller read cross-tenant
-- data by guessing/knowing an `outstand_post_id`/`outstand_account_id`,
-- bypassing RLS entirely. EXECUTE is therefore revoked from PUBLIC and
-- granted only to the `app_runtime` role that the Next.js server connects
-- as (guarded by an existence check so this migration doesn't fail against
-- a shadow/local DB that doesn't have that role).
--
-- **This pattern (system-context RLS bypass for webhook/background
-- processing) is a real architecture decision, not a mechanical schema
-- tweak — it should get its own ADR entry from Gibran Project Manager /
-- confirmation from King Rezi, and the SAME functions should be reused
-- (not re-invented) when T-027 (job runner) needs equivalent system-context
-- access.**

CREATE OR REPLACE FUNCTION "public"."webhook_find_post_targets_by_outstand_post_id"(
  p_outstand_post_id text
)
RETURNS TABLE (
  post_id uuid,
  workspace_id uuid,
  author_id text,
  post_target_id uuid,
  connected_account_id uuid,
  outstand_account_id text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    p."id" AS post_id,
    p."workspace_id" AS workspace_id,
    p."author_id" AS author_id,
    pt."id" AS post_target_id,
    pt."connected_account_id" AS connected_account_id,
    wca."outstand_account_id" AS outstand_account_id
  FROM "publishing_posts" p
  JOIN "publishing_post_targets" pt ON pt."post_id" = p."id"
  JOIN "workspace_connected_accounts" wca ON wca."id" = pt."connected_account_id"
  WHERE p."outstand_post_id" = p_outstand_post_id
    AND p."deleted_at" IS NULL
$$;

-- `workspaces` has NO RLS (see "Tables intentionally WITHOUT
-- workspace-isolation RLS" note in migration
-- `20260813045625_t017_add_rls_policies`), so only the
-- `workspace_connected_accounts` half of this join needs the
-- SECURITY DEFINER bypass. `owner_id` is read directly off `workspaces`
-- (simpler and more direct than resolving the Owner via `workspace_members`
-- role='owner', which this codebase does not otherwise query by role).
--
-- Known limitation (documented, not silently ignored): `outstand_account_id`
-- is only unique PER WORKSPACE (`@@unique([workspaceId, outstandAccountId])`
-- on `WorkspaceConnectedAccount`), not globally — if two different
-- workspaces ever connected an account with the same external id (should
-- not happen with real Outstand ids, but the schema doesn't enforce it),
-- this returns exactly one of them (`LIMIT 1`, arbitrary which). Acceptable
-- for T-026's scope; revisit if that assumption turns out false.
CREATE OR REPLACE FUNCTION "public"."webhook_find_account_owner_by_outstand_account_id"(
  p_outstand_account_id text
)
RETURNS TABLE (
  workspace_id uuid,
  connected_account_id uuid,
  owner_user_id text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT wca."workspace_id" AS workspace_id, wca."id" AS connected_account_id, w."owner_id" AS owner_user_id
  FROM "workspace_connected_accounts" wca
  JOIN "workspaces" w ON w."id" = wca."workspace_id"
  WHERE wca."outstand_account_id" = p_outstand_account_id
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION "public"."webhook_find_post_targets_by_outstand_post_id"(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION "public"."webhook_find_account_owner_by_outstand_account_id"(text) FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_runtime') THEN
    GRANT EXECUTE ON FUNCTION "public"."webhook_find_post_targets_by_outstand_post_id"(text) TO "app_runtime";
    GRANT EXECUTE ON FUNCTION "public"."webhook_find_account_owner_by_outstand_account_id"(text) TO "app_runtime";
  END IF;
END
$$;
