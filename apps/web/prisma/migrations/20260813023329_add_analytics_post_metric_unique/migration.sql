-- T-041: satu baris analytics_post_metrics per (post_id, connected_account_id),
-- dibutuhkan untuk upsert idempoten pada ingestion metrik dari Outstand.
-- Tidak ada data existing (T-041 adalah write path pertama ke tabel ini),
-- jadi aman ditambahkan langsung tanpa migrasi data.
CREATE UNIQUE INDEX "analytics_post_metrics_post_id_connected_account_id_key" ON "analytics_post_metrics"("post_id", "connected_account_id");
