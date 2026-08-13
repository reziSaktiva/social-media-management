-- T-017.2 — RLS policies (defense-in-depth, DB-D05 / DO-D06).
--
-- Pattern (database-strategy.md § "RLS Policy Pattern", corrected 2026-08-13 —
-- see note in that file and in database-orm.md § DO-D06):
--   workspace_id is `uuid` in every domain table → cast current_setting(...)
--     to `::uuid` when comparing.
--   user_id (Better Auth identity_user.id) is a cuid `text` value, NOT uuid
--     → compare current_setting('app.current_user_id', true) as text,
--     WITHOUT an ::uuid cast.
--
-- Server sets the session variable via `withCurrentUser()`
-- (src/lib/prisma/with-current-user.ts) using `set_config(...)` inside a
-- transaction before running queries that should be subject to these
-- policies. RLS is a safety net; the Application Service remains the
-- primary authorization layer (RBAC).
--
-- Tables intentionally WITHOUT workspace-isolation RLS:
--   - workspaces               (the tenant root itself, not member-scoped data)
--   - identity_user / identity_session / identity_account / identity_verification
--     (Better Auth identity tables — not workspace-scoped)
--   - background_jobs          (system-internal queue, not workspace-scoped)
--   - outstand_webhook_events  (system-internal durable receipt, not workspace-scoped)

-- ─────────────────────────────────────────────
-- Tables with a direct workspace_id column
-- ─────────────────────────────────────────────

ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_members_workspace_isolation"
  ON "workspace_members"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

ALTER TABLE "workspace_invitations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_invitations_workspace_isolation"
  ON "workspace_invitations"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

ALTER TABLE "workspace_connected_accounts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_connected_accounts_workspace_isolation"
  ON "workspace_connected_accounts"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

ALTER TABLE "workspace_channel_orders" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workspace_channel_orders_workspace_isolation"
  ON "workspace_channel_orders"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

ALTER TABLE "publishing_posts" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "publishing_posts_workspace_isolation"
  ON "publishing_posts"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

ALTER TABLE "publishing_queue_slots" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "publishing_queue_slots_workspace_isolation"
  ON "publishing_queue_slots"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

ALTER TABLE "ai_requests" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_requests_workspace_isolation"
  ON "ai_requests"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

ALTER TABLE "engagement_inbox_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "engagement_inbox_items_workspace_isolation"
  ON "engagement_inbox_items"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

ALTER TABLE "analytics_workspace_snapshots" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_workspace_snapshots_workspace_isolation"
  ON "analytics_workspace_snapshots"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

ALTER TABLE "start_page_pages" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "start_page_pages_workspace_isolation"
  ON "start_page_pages"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

ALTER TABLE "media_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_items_workspace_isolation"
  ON "media_items"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_workspace_isolation"
  ON "notifications"
  FOR ALL
  USING (
    "workspace_id" IN (
      SELECT wm."workspace_id"
      FROM "workspace_members" wm
      WHERE wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

-- ─────────────────────────────────────────────
-- Child tables without a direct workspace_id — isolated via EXISTS join
-- to their workspace-scoped parent row.
-- ─────────────────────────────────────────────

-- publishing_post_targets → publishing_posts.workspace_id (via post_id)
ALTER TABLE "publishing_post_targets" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "publishing_post_targets_workspace_isolation"
  ON "publishing_post_targets"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM "publishing_posts" p
      JOIN "workspace_members" wm ON wm."workspace_id" = p."workspace_id"
      WHERE p."id" = "publishing_post_targets"."post_id"
        AND wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

-- ai_results → ai_requests.workspace_id (via request_id)
ALTER TABLE "ai_results" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_results_workspace_isolation"
  ON "ai_results"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM "ai_requests" r
      JOIN "workspace_members" wm ON wm."workspace_id" = r."workspace_id"
      WHERE r."id" = "ai_results"."request_id"
        AND wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

-- engagement_replies → engagement_inbox_items.workspace_id (via inbox_item_id)
ALTER TABLE "engagement_replies" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "engagement_replies_workspace_isolation"
  ON "engagement_replies"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM "engagement_inbox_items" i
      JOIN "workspace_members" wm ON wm."workspace_id" = i."workspace_id"
      WHERE i."id" = "engagement_replies"."inbox_item_id"
        AND wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

-- start_page_links → start_page_pages.workspace_id (via start_page_id)
ALTER TABLE "start_page_links" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "start_page_links_workspace_isolation"
  ON "start_page_links"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM "start_page_pages" sp
      JOIN "workspace_members" wm ON wm."workspace_id" = sp."workspace_id"
      WHERE sp."id" = "start_page_links"."start_page_id"
        AND wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );

-- analytics_post_metrics → publishing_posts.workspace_id (via post_id).
-- Verified against schema.prisma: AnalyticsPostMetric has no workspaceId
-- column (only postId, connectedAccountId) — needs the parent-join variant,
-- not the direct-workspace_id pattern (per T-017.2 instructions to verify
-- this table specifically).
ALTER TABLE "analytics_post_metrics" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_post_metrics_workspace_isolation"
  ON "analytics_post_metrics"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM "publishing_posts" p
      JOIN "workspace_members" wm ON wm."workspace_id" = p."workspace_id"
      WHERE p."id" = "analytics_post_metrics"."post_id"
        AND wm."user_id" = current_setting('app.current_user_id', true)
        AND wm."status" = 'active'
    )
  );
