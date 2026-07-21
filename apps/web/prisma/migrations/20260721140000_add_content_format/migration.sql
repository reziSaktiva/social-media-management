-- AlterTable
ALTER TABLE "publishing_post_targets" ADD COLUMN "content_format" TEXT NOT NULL DEFAULT 'post';

-- AlterTable
ALTER TABLE "publishing_post_targets" ADD COLUMN "platform_options" JSONB;
