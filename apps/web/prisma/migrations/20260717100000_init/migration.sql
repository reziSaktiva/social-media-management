-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "identity_user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "identity_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "brand_name" TEXT,
    "brand_tone" TEXT,
    "brand_guidelines" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invited_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joined_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_connected_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "outstand_account_id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "connected_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_connected_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publishing_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "author_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "caption" TEXT NOT NULL DEFAULT '',
    "media_ids" UUID[] DEFAULT ARRAY[]::UUID[],
    "scheduled_at" TIMESTAMPTZ(6),
    "published_at" TIMESTAMPTZ(6),
    "failed_at" TIMESTAMPTZ(6),
    "failure_reason" TEXT,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publishing_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publishing_post_targets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "connected_account_id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "outstand_job_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "published_url" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publishing_post_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publishing_queue_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "connected_account_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMPTZ(6) NOT NULL,
    "post_id" UUID,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publishing_queue_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" UUID,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "context" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "variant_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_inbox_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "connected_account_id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "author_handle" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "post_id" UUID,
    "received_at" TIMESTAMPTZ(6) NOT NULL,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_inbox_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_replies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inbox_item_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "outstand_reply_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_post_metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "connected_account_id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER,
    "engagement_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "fetched_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_post_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_workspace_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "total_posts" INTEGER NOT NULL DEFAULT 0,
    "total_reach" BIGINT NOT NULL DEFAULT 0,
    "total_engagements" BIGINT NOT NULL DEFAULT 0,
    "avg_engagement_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "top_post_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_workspace_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "start_page_pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT,
    "avatar_url" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "view_count" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "start_page_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "start_page_links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "start_page_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "click_count" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "start_page_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "uploader_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "url" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DECIMAL(10,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "related_entity_type" TEXT,
    "related_entity_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMPTZ(6),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "background_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "identity_user_email_key" ON "identity_user"("email");

-- CreateIndex
CREATE INDEX "identity_session_userId_idx" ON "identity_session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "identity_session_token_key" ON "identity_session"("token");

-- CreateIndex
CREATE INDEX "identity_account_userId_idx" ON "identity_account"("userId");

-- CreateIndex
CREATE INDEX "identity_verification_identifier_idx" ON "identity_verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "workspace_members_workspace_id_idx" ON "workspace_members"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspace_id_user_id_key" ON "workspace_members"("workspace_id", "user_id");

-- CreateIndex
CREATE INDEX "workspace_connected_accounts_workspace_id_idx" ON "workspace_connected_accounts"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_connected_accounts_workspace_id_outstand_account__key" ON "workspace_connected_accounts"("workspace_id", "outstand_account_id");

-- CreateIndex
CREATE INDEX "publishing_posts_workspace_id_idx" ON "publishing_posts"("workspace_id");

-- CreateIndex
CREATE INDEX "publishing_posts_workspace_id_status_idx" ON "publishing_posts"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "publishing_posts_scheduled_at_idx" ON "publishing_posts"("scheduled_at");

-- CreateIndex
CREATE INDEX "publishing_posts_deleted_at_idx" ON "publishing_posts"("deleted_at");

-- CreateIndex
CREATE INDEX "publishing_post_targets_post_id_idx" ON "publishing_post_targets"("post_id");

-- CreateIndex
CREATE INDEX "publishing_queue_slots_workspace_id_idx" ON "publishing_queue_slots"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "publishing_queue_slots_connected_account_id_scheduled_at_key" ON "publishing_queue_slots"("connected_account_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "ai_requests_workspace_id_idx" ON "ai_requests"("workspace_id");

-- CreateIndex
CREATE INDEX "engagement_inbox_items_workspace_id_idx" ON "engagement_inbox_items"("workspace_id");

-- CreateIndex
CREATE INDEX "engagement_inbox_items_workspace_id_status_idx" ON "engagement_inbox_items"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "engagement_inbox_items_external_id_idx" ON "engagement_inbox_items"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "engagement_inbox_items_workspace_id_external_id_key" ON "engagement_inbox_items"("workspace_id", "external_id");

-- CreateIndex
CREATE INDEX "analytics_post_metrics_post_id_idx" ON "analytics_post_metrics"("post_id");

-- CreateIndex
CREATE INDEX "analytics_workspace_snapshots_workspace_id_idx" ON "analytics_workspace_snapshots"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_workspace_snapshots_workspace_id_period_period_st_key" ON "analytics_workspace_snapshots"("workspace_id", "period", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "start_page_pages_slug_key" ON "start_page_pages"("slug");

-- CreateIndex
CREATE INDEX "start_page_pages_workspace_id_idx" ON "start_page_pages"("workspace_id");

-- CreateIndex
CREATE INDEX "media_items_workspace_id_idx" ON "media_items"("workspace_id");

-- CreateIndex
CREATE INDEX "notifications_workspace_id_idx" ON "notifications"("workspace_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "background_jobs_status_scheduled_at_idx" ON "background_jobs"("status", "scheduled_at");

-- AddForeignKey
ALTER TABLE "identity_session" ADD CONSTRAINT "identity_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_account" ADD CONSTRAINT "identity_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_connected_accounts" ADD CONSTRAINT "workspace_connected_accounts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publishing_posts" ADD CONSTRAINT "publishing_posts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publishing_post_targets" ADD CONSTRAINT "publishing_post_targets_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "publishing_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publishing_post_targets" ADD CONSTRAINT "publishing_post_targets_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "workspace_connected_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publishing_queue_slots" ADD CONSTRAINT "publishing_queue_slots_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publishing_queue_slots" ADD CONSTRAINT "publishing_queue_slots_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "workspace_connected_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publishing_queue_slots" ADD CONSTRAINT "publishing_queue_slots_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "publishing_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_requests" ADD CONSTRAINT "ai_requests_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_results" ADD CONSTRAINT "ai_results_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "ai_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_inbox_items" ADD CONSTRAINT "engagement_inbox_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_inbox_items" ADD CONSTRAINT "engagement_inbox_items_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "workspace_connected_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_replies" ADD CONSTRAINT "engagement_replies_inbox_item_id_fkey" FOREIGN KEY ("inbox_item_id") REFERENCES "engagement_inbox_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_workspace_snapshots" ADD CONSTRAINT "analytics_workspace_snapshots_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "start_page_pages" ADD CONSTRAINT "start_page_pages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "start_page_links" ADD CONSTRAINT "start_page_links_start_page_id_fkey" FOREIGN KEY ("start_page_id") REFERENCES "start_page_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

