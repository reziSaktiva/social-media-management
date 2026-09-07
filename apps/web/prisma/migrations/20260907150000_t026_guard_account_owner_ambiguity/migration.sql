-- Code review follow-up on migration
-- `20260907120000_t026_outstand_webhook_system_lookups`:
-- `webhook_find_account_owner_by_outstand_account_id` used `LIMIT 1` with no
-- tie-break even though `outstand_account_id` is only unique PER WORKSPACE
-- (`@@unique([workspaceId, outstandAccountId])`), not globally. If the same
-- external Outstand account is ever connected under two different
-- workspaces, the old function silently resolved to an arbitrary one of
-- them — an `account.token_expired` webhook could set
-- `reconnectRequired = true` and notify the WRONG workspace's Owner.
--
-- Fix mirrors the defense-in-depth pattern already applied to the sibling
-- function in migration `20260907130000_t026_unique_outstand_post_id`: drop
-- `LIMIT 1`, return every matching row, and let the repository layer detect
-- ambiguity (more than one distinct workspace) and refuse to guess rather
-- than silently picking one. A global unique index is NOT appropriate here
-- (unlike `outstand_post_id`) because the same physical account CAN
-- legitimately be connected under multiple workspaces (agency scenario) —
-- the constraint that must hold is "don't silently guess", not "must be
-- globally unique".
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
$$;
