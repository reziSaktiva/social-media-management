-- T-034.4 (ADR-092) — retry manual untuk PublishingPostTarget yang gagal.
-- Kolom baru menyimpan id post-level BARU dari OutstandAdapter.publishNow
-- khusus recreate TARGET INI SAJA (retry single-target, bukan seluruh
-- post) — BEDA dari publishing_posts.outstand_post_id yang tetap
-- merepresentasikan create original untuk semua target awal dan tidak
-- disentuh oleh retry. Nullable, default NULL — kosong sampai retry
-- pertama kali dijalankan untuk target ini.

ALTER TABLE "publishing_post_targets" ADD COLUMN "retry_outstand_post_id" TEXT;
