-- T-092.4 bugfix (found during King Rezi's cross-tab verification of
-- Realtime granular patch on Queue, 2026-09-11) — root cause of "item never
-- disappears in tab B after Cancel Schedule in tab A, zero console errors,
-- channel reaches SUBSCRIBED, no `publishing_posts` postgres_changes ever
-- delivered".
--
-- This is NOT the same bug T-036 already fixed (cuid vs uuid cast on
-- `auth.uid()`) — `publishing_posts_realtime_workspace_members`
-- (20260911090000_t092_1_publishing_posts_realtime_rls) already applies that
-- fix from the start, reads the JWT `sub` claim directly as text, no
-- `::uuid` cast anywhere in it. Confirmed live in the DB: publication
-- membership, the policy itself, and `REPLICA IDENTITY` on `publishing_posts`
-- are all identical in shape to the working `notifications` precedent.
--
-- The actual root cause is one level down. Unlike
-- `notifications_realtime_own_rows` (checks `user_id` directly on the
-- `notifications` row itself — no dependency on any other table's RLS),
-- `publishing_posts_realtime_workspace_members`'s USING clause is a
-- subquery into `workspace_members`:
--
--   workspace_id IN (SELECT wm.workspace_id FROM workspace_members wm
--                     WHERE wm.user_id = <jwt sub> AND wm.status = 'active')
--
-- Row Level Security applies to subqueries too — that subquery's visibility
-- into `workspace_members` is governed by `workspace_members`'s OWN RLS
-- policies, not by the JWT claim the outer policy just read. Every existing
-- SELECT policy on `workspace_members`
-- (`workspace_members_workspace_isolation`, from
-- 20260813081715_t017_scope_workspace_members_insert_and_visibility) checks
-- ONLY `current_setting('app.current_user_id')` (the server-side
-- `withCurrentUser` GUC pattern) or `current_user_workspace_ids()` — which
-- internally checks the exact same GUC (`pg_get_functiondef` confirms this,
-- `SELECT ... WHERE wm.user_id = current_setting('app.current_user_id', true)`).
-- A Realtime connection never runs through `withCurrentUser` — it only ever
-- carries a Supabase JWT — so `app.current_user_id` is always unset there,
-- and `workspace_members` is invisible to every Realtime connection
-- regardless of which user it belongs to. The subquery inside
-- `publishing_posts_realtime_workspace_members` therefore always evaluates
-- against an empty result set, so the policy is always false — matching the
-- reported symptom exactly (SUBSCRIBED, zero rows, no error, since an
-- RLS-filtered-to-nothing subquery is not an error).
--
-- Fix: add one more additive PERMISSIVE SELECT policy on `workspace_members`
-- itself, scoped to the requesting user's OWN membership rows via the JWT
-- `sub` claim (same pattern as `notifications_realtime_own_rows` /
-- `publishing_posts_realtime_workspace_members`) — this is exactly what lets
-- the subquery above see rows again under a Realtime/JWT-only connection,
-- without widening `workspace_members` visibility any further than "a user
-- can see their own membership rows". Does not touch or replace any existing
-- `workspace_members` policy (server-side GUC ones stay as-is for
-- `withCurrentUser`-wrapped reads).

CREATE POLICY "workspace_members_realtime_own_row"
  ON "workspace_members"
  FOR SELECT
  USING (
    "user_id" = coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )
  );
