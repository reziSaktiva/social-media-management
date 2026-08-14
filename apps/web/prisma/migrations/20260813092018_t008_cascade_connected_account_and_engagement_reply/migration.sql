-- DropForeignKey
ALTER TABLE "engagement_inbox_items" DROP CONSTRAINT "engagement_inbox_items_connected_account_id_fkey";

-- DropForeignKey
ALTER TABLE "engagement_replies" DROP CONSTRAINT "engagement_replies_inbox_item_id_fkey";

-- DropForeignKey
ALTER TABLE "publishing_post_targets" DROP CONSTRAINT "publishing_post_targets_connected_account_id_fkey";

-- DropForeignKey
ALTER TABLE "publishing_queue_slots" DROP CONSTRAINT "publishing_queue_slots_connected_account_id_fkey";

-- AddForeignKey
ALTER TABLE "publishing_post_targets" ADD CONSTRAINT "publishing_post_targets_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "workspace_connected_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publishing_queue_slots" ADD CONSTRAINT "publishing_queue_slots_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "workspace_connected_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_inbox_items" ADD CONSTRAINT "engagement_inbox_items_connected_account_id_fkey" FOREIGN KEY ("connected_account_id") REFERENCES "workspace_connected_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_replies" ADD CONSTRAINT "engagement_replies_inbox_item_id_fkey" FOREIGN KEY ("inbox_item_id") REFERENCES "engagement_inbox_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
