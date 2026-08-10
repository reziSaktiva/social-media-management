# v0.4 — Engagement MVP

> Bagian dari backlog berjenjang. Indeks + legend status: [`../TASKS.md`](../TASKS.md).

**Tujuan rilis:** Menyatukan interaksi media sosial dalam satu tempat.
**Baseline rilis:** `product-discovery/02-product/release-roadmap.md` → v0.4

**Kedalaman dokumen ini:** task-level saja (rolling wave). **Subtask sengaja belum diisi** — akan dirinci saat rilis ini mendekat, supaya tidak disusun mendahului desain/ADR pendukungnya. ID task sudah dikunci sejak sekarang agar bisa dirujuk.

**Titik awal:** domain `engagement/` masih stub kosong. Model `EngagementInboxItem` + `EngagementReply` **sudah ada** di schema. Route `/engage` masih placeholder — saat ini masih di bawah dynamic segment lama `[slug]`, tapi baseline routing sudah pindah ke route group `(app)` (ADR-076); kalau **T-039** (migrasi kode, `tasks/v01-foundation.md`) belum selesai saat task rilis ini dikerjakan, bangun langsung di `(app)/engage` — jangan menambah route baru di `[slug]/...` lama.

**Batas rilis (ADR-040):** Direct Message, mention, dan **webhook engagement** tidak termasuk MVP. Engagement memakai **periodic pull 30 menit + manual refresh**, bukan webhook.

---

### T-050 · Engagement domain skeleton

`⏳ Not Started` · **Domain** engagement · **ADR** ADR-017, ADR-018, ADR-031 · **Depends** T-002 ✅
**Baca dulu:** `05-architecture/domain-model.md` · `05-architecture/application-layer.md`

Service + repository interface + implementasi Prisma, mengikuti konvensi `workspace`/`publishing`. Isi `types.ts` yang saat ini masih `export {}`.

### T-051 · Comment sync job setiap 30 menit

`⏳ Not Started` · **Domain** engagement · integration · **ADR** ADR-022, ADR-040 · **Depends** T-025, T-027, T-050
**Baca dulu:** `05-architecture/background-jobs.md` · `05-architecture/integration-layer.md`

Periodic pull komentar dari Outstand per connected account, tulis ke `EngagementInboxItem`. Wajib idempoten — pull ulang tidak boleh menggandakan komentar.

### T-052 · Manual refresh

`⏳ Not Started` · **Domain** engagement · **ADR** ADR-023, ADR-040 · **Depends** T-051
**Baca dulu:** `05-architecture/realtime-strategy.md`

Kontrol refresh manual supaya pengguna tidak perlu menunggu siklus 30 menit. Data engagement **tidak** memakai Supabase Realtime (ADR-023 membatasinya hanya untuk tabel `notifications`).

### T-053 · Comments Inbox UI

`⏳ Not Started` · **Domain** engagement · UI · **ADR** ADR-046 · **Depends** T-051
**Baca dulu:** `04-ux/key-screen-patterns.md` · `04-ux/information-architecture.md`

Inbox komentar sederhana lintas akun di `/engage`: daftar komentar, filter per akun, status sudah/belum dibalas. Butuh sesi desain Claude Design lebih dulu.

### T-054 · Reply comment dari dalam aplikasi

`⏳ Not Started` · **Domain** engagement · integration · **ADR** ADR-019, ADR-040 · **Depends** T-025, T-053
**Baca dulu:** `05-architecture/integration-layer.md` · `02-product/roles-permissions.md`

Kirim balasan lewat `OutstandAdapter`, persist ke `EngagementReply`. Tentukan RBAC role mana yang boleh membalas.

### T-055 · Inbox assignment

`⏳ Not Started` · **Domain** engagement · **ADR** — · **Depends** T-053
**Baca dulu:** `02-product/feature-priority.md`

Berstatus **Could Have** — hanya dikerjakan bila waktu memungkinkan. Tidak memblokir rilis.

---

## Catatan Rilis

* T-056–T-059 sengaja dikosongkan sebagai ruang penambahan task v0.4.
* **Definition of Done rilis ini:** pengguna dapat membaca dan membalas komentar tanpa berpindah platform, dengan data diperbarui setiap 30 menit atau lewat manual refresh.
* **Yang sengaja di luar rilis ini (ADR-040 + `feature-priority.md`):** Social Listening, Direct Messages, Mentions, Engagement Webhooks.
