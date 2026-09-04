-- T-036.2 (ADR-023, realtime-strategy.md § "RLS pada Supabase Realtime") —
-- two pieces of setup the client-side `postgres_changes` subscription needs
-- that were still missing, discovered while wiring
-- `subscribeToNotificationInserts` (apps/web/src/lib/supabase/realtime):
--
--   1. `notifications` was not a member of the `supabase_realtime`
--      publication at all — no table was. Without this, Realtime never
--      broadcasts ANY change event for ANY table, regardless of RLS.
--
--   2. The only RLS policy on `notifications`
--      (`notifications_workspace_isolation`, added in
--      20260813045625_t017_add_rls_policies) is scoped to the SERVER-SIDE
--      session pattern — `current_setting('app.current_user_id')`, set by
--      `withCurrentUser` inside a Prisma transaction. A Realtime connection
--      never runs through that wrapper; it only carries a Supabase JWT
--      (`sub` = userId, minted by `createSupabaseRealtimeJwt`, AS-D03), so
--      Postgres only ever sees `auth.uid()`. Without a policy that checks
--      `auth.uid()`, RLS is default-deny for every Realtime read, even once
--      T-036.3 wires up the JWT bridge.
--
-- This policy is additive (PERMISSIVE, the Postgres default) alongside the
-- existing workspace-isolation one — it only widens access to rows the
-- requesting user already owns (`user_id = auth.uid()`), never beyond that,
-- and only for SELECT (Realtime never needs INSERT/UPDATE/DELETE here).
-- `notifications.user_id` is `text` (Better Auth cuid, not a Postgres uuid —
-- same correction noted in `with-current-user.ts`), so `auth.uid()` (uuid)
-- is cast to text for the comparison.

ALTER PUBLICATION supabase_realtime ADD TABLE "notifications";

CREATE POLICY "notifications_realtime_own_rows"
  ON "notifications"
  FOR SELECT
  USING ("user_id" = (auth.uid())::text);
