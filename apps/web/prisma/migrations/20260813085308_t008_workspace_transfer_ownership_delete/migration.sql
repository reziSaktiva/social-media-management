-- DropForeignKey
ALTER TABLE "ai_requests" DROP CONSTRAINT "ai_requests_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "analytics_workspace_snapshots" DROP CONSTRAINT "analytics_workspace_snapshots_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "engagement_inbox_items" DROP CONSTRAINT "engagement_inbox_items_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "media_items" DROP CONSTRAINT "media_items_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "publishing_posts" DROP CONSTRAINT "publishing_posts_workspace_id_fkey";

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "pending_owner_transfer_to" TEXT;

-- AddForeignKey
ALTER TABLE "publishing_posts" ADD CONSTRAINT "publishing_posts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_requests" ADD CONSTRAINT "ai_requests_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_inbox_items" ADD CONSTRAINT "engagement_inbox_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_workspace_snapshots" ADD CONSTRAINT "analytics_workspace_snapshots_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
