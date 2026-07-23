-- ADR-040: align persisted contracts with the official Outstand API.

-- Token expiry is translated to an explicit reconnect requirement in the domain.
ALTER TABLE "workspace_connected_accounts"
    ADD COLUMN "reconnect_required" BOOLEAN NOT NULL DEFAULT false;

-- Engagement MVP ingests comments only and deduplicates per connected account.
ALTER TABLE "engagement_inbox_items"
    ALTER COLUMN "type" SET DEFAULT 'comment';

ALTER TABLE "engagement_inbox_items"
    ADD CONSTRAINT "engagement_inbox_items_type_check"
    CHECK ("type" = 'comment');

DROP INDEX "engagement_inbox_items_workspace_id_external_id_key";

CREATE UNIQUE INDEX "engagement_inbox_items_workspace_id_connected_account_id_external_id_key"
    ON "engagement_inbox_items"("workspace_id", "connected_account_id", "external_id");

-- Supabase remains the original store; these fields cache the Outstand working copy.
ALTER TABLE "media_items"
    ALTER COLUMN "url" DROP NOT NULL,
    ADD COLUMN "outstand_media_id" TEXT,
    ADD COLUMN "outstand_media_url" TEXT,
    ADD COLUMN "outstand_uploaded_at" TIMESTAMPTZ(6),
    ADD COLUMN "outstand_expires_at" TIMESTAMPTZ(6);

-- Durable webhook receipt: persist before ACK, then process asynchronously.
CREATE TABLE "outstand_webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "outstand_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "raw_body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "processing_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outstand_webhook_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "outstand_webhook_events_event_type_check"
        CHECK ("event_type" IN ('post.published', 'post.error', 'account.token_expired')),
    CONSTRAINT "outstand_webhook_events_status_check"
        CHECK ("status" IN ('received', 'processing', 'processed', 'failed', 'dead_lettered'))
);

CREATE UNIQUE INDEX "outstand_webhook_events_outstand_event_id_key"
    ON "outstand_webhook_events"("outstand_event_id");

CREATE INDEX "outstand_webhook_events_status_received_at_idx"
    ON "outstand_webhook_events"("status", "received_at");
