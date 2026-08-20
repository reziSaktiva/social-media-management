/*
  Warnings:

  - You are about to drop the `publishing_queue_slots` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "publishing_queue_slots" DROP CONSTRAINT "publishing_queue_slots_connected_account_id_fkey";

-- DropForeignKey
ALTER TABLE "publishing_queue_slots" DROP CONSTRAINT "publishing_queue_slots_post_id_fkey";

-- DropForeignKey
ALTER TABLE "publishing_queue_slots" DROP CONSTRAINT "publishing_queue_slots_workspace_id_fkey";

-- DropTable
DROP TABLE "publishing_queue_slots";
