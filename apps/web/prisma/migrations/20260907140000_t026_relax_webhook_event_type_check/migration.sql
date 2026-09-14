-- T-026 QA follow-up (Najwa QA Engineer, real end-to-end HTTP test — Bug 3):
--
-- `outstand_webhook_events_event_type_check` (dari migration
-- `20260723121000_align_outstand_contract`) membatasi `event_type` hanya
-- boleh salah satu dari `'post.published' | 'post.error' |
-- 'account.token_expired'`. Tapi `OutstandWebhookProcessor`
-- (`apps/web/src/domains/integration/services/outstand-webhook-processor.ts`)
-- sengaja menganggap event type di luar tiga itu sebagai
-- `ignored_unknown_event` dan tetap merespons 2xx (durable-before-ACK,
-- ADR-040) — receipt store ini memang harus bisa menyimpan event type
-- APAPUN yang dikirim Outstand untuk observability, terlepas apakah kita
-- sudah punya handler untuk memprosesnya atau belum (termasuk event type
-- yang belum ada di kontrak hari ini, tapi ditambahkan Outstand di masa
-- depan).
--
-- Constraint whitelist ini membuat insert event type di luar 3 itu ditolak
-- di level DB sebelum baris sempat tersimpan — verifikasi HTTP nyata
-- (curl, bukan unit test) membuktikan endpoint balas
-- `503 {"error":"Gagal menyimpan receipt webhook."}` untuk event type tak
-- dikenal (mis. `something.unknown`). Karena 503 bukan 2xx, Outstand akan
-- retry delivery itu selamanya — bertentangan dengan prinsip "retry
-- delivery dari Outstand berhenti pada boundary receipt/ACK"
-- (`product-discovery/05-architecture/integration-layer.md`).
--
-- Fix: longgarkan constraint jadi hanya syarat non-empty string, bukan
-- whitelist. Validasi kontrak ADR-040 (3 event type yang benar-benar kita
-- proses) tetap ditegakkan di application layer
-- (`OutstandWebhookProcessor`), bukan di DB — DB hanya menjaga integritas
-- data dasar (event_type tidak boleh kosong), sesuai peran receipt-store
-- yang harus menerima observability data apa pun.

ALTER TABLE "outstand_webhook_events"
    DROP CONSTRAINT "outstand_webhook_events_event_type_check";

ALTER TABLE "outstand_webhook_events"
    ADD CONSTRAINT "outstand_webhook_events_event_type_check"
    CHECK (length(btrim("event_type")) > 0);
