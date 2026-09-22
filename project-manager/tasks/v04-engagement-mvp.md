# v0.4 — Engagement MVP

> Bagian dari backlog berjenjang. Indeks + legend status: [`../TASKS.md`](../TASKS.md).

**Tujuan rilis:** Menyatukan interaksi media sosial dalam satu tempat.
**Baseline rilis:** `product-discovery/02-product/release-roadmap.md` → v0.4

**Kedalaman dokumen ini:** task-level saja (rolling wave). **Subtask sengaja belum diisi** — akan dirinci saat rilis ini mendekat, supaya tidak disusun mendahului desain/ADR pendukungnya. ID task sudah dikunci sejak sekarang agar bisa dirujuk.

**Titik awal:** domain `engagement/` masih stub kosong. Model `EngagementInboxItem` + `EngagementReply` **sudah ada** di schema. Route `/engage` masih placeholder — saat ini masih di bawah dynamic segment lama `[slug]`, tapi baseline routing sudah pindah ke route group `(app)` (ADR-076); kalau **T-039** (migrasi kode, `tasks/v01-foundation.md`) belum selesai saat task rilis ini dikerjakan, bangun langsung di `(app)/engage` — jangan menambah route baru di `[slug]/...` lama.

**Batas rilis (ADR-040):** Direct Message, mention, dan **webhook engagement** tidak termasuk MVP. Engagement memakai **periodic pull 30 menit + manual refresh**, bukan webhook.

---

### T-050 · Engagement domain skeleton

`🟡 In Progress` · **Domain** engagement · **ADR** ADR-017, ADR-018, ADR-031 · **Depends** T-002 ✅
**Baca dulu:** `05-architecture/domain-model.md` · `05-architecture/application-layer.md`

Service + repository interface + implementasi Prisma, mengikuti konvensi `workspace`/`publishing`. Isi `types.ts` yang saat ini masih `export {}`.

### T-051 · Comment sync job setiap 30 menit

`🟡 In Progress` · **Domain** engagement · integration · **ADR** ADR-022, ADR-040 · **Depends** T-025, T-027, T-050
**Baca dulu:** `05-architecture/background-jobs.md` · `05-architecture/integration-layer.md`

Periodic pull komentar dari Outstand per connected account, tulis ke `EngagementInboxItem`. Wajib idempoten — pull ulang tidak boleh menggandakan komentar.

### T-052 · Manual refresh

`🟡 In Progress` · **Domain** engagement · **ADR** ADR-023, ADR-040 · **Depends** T-051
**Baca dulu:** `05-architecture/realtime-strategy.md`

Kontrol refresh manual supaya pengguna tidak perlu menunggu siklus 30 menit. Data engagement **tidak** memakai Supabase Realtime (ADR-023 membatasinya hanya untuk tabel `notifications`).

### T-053 · Comments Inbox UI

`✅ Done (2026-09-22)` · **Domain** engagement · UI · **ADR** ADR-046 · **Depends** T-051 · **Terkait** KI-065
**Baca dulu:** `04-ux/key-screen-patterns.md` · `04-ux/information-architecture.md`

Inbox komentar sederhana lintas akun di `/engage`: daftar komentar, filter per akun, status sudah/belum dibalas.

**Implementasi (selesai, 2026-09-22):** rancangan sudah ada di Claude Design (`templates/engage-inbox.html`, KSP-06) tapi pola thread-list belum dikunci ("SYNCED"/"LOCKED PATTERN") — sesuai rule 17 AGENTS.md, King Rezi ditanya via `AskUserQuestion` sebelum implementasi kode UI dimulai. Jawaban: "sesuaikan dengan yang ada di Claude Design" — diimplementasikan mengikuti markup mockup apa adanya, dibangun dari komponen shadcn `Item`/`ItemGroup` (bukan `Table`, karena mockup satu blok teks per baris, bukan tabular).

Backend (Prabowo Feature Engineer): Server Action baru `listInboxAction`, `getInboxItemDetailAction`, `markAsDoneAction` di `apps/web/src/app/(app)/engage/actions.ts` — murni wiring ke `EngagementService` yang sudah ada sejak T-050, tidak ada logic domain baru.

UI (Mark UI Engineer): `apps/web/src/app/(app)/engage/page.tsx` diganti dari `ScaffoldPlaceholder` jadi Server Component; komponen baru `apps/web/src/app/(app)/engage/components/EngageInboxView.tsx` (Client Component) — layout dua panel (thread-list kiri 340px tetap + thread-detail kanan), filter 3 dropdown (Akun/Platform/Status) re-fetch server-side, tombol Mark as Done, reply box (tombol Kirim awalnya disabled, diaktifkan di T-054), empty state (`Empty` shadcn), tombol Refresh manual reuse `refreshInboxAction` (T-052).

**Known gap (bukan bug, lihat KI-065):** kotak "Post asal" di detail panel hanya menampilkan label generik ("Komentar ini terhubung ke post terjadwal/terpublish") tanpa judul/thumbnail post asli — `InboxItemDetail`/`EngagementInboxItemRecord` (T-050) tidak membawa join ke caption/media post sungguhan (`postId` hanya ID, tanpa snapshot), dan menambah join lintas domain `engagement → publishing` di luar scope UI-only task ini.

**Review Ridwan Architecture Reviewer:** 0 temuan — domain purity terjaga (`IOutstandAdapter` tetap interface abstrak), entry point tanpa business logic, cross-domain lewat public API `workspace`, RBAC sesuai baseline.

**QA Najwa QA Engineer:** PASS penuh — golden path (pilih thread, Mark as Done) bekerja, filter Akun/Platform/Status semua benar, regresi `/publish/drafts` dan `/analyze` normal, gate T-103.3 (struktur vs `templates/engage-inbox.html`) cocok — pola `Item`/`ItemGroup` sesuai keputusan terkunci di atas; gap "Post asal" dikonfirmasi expected (bukan bug, konsisten `FakeOutstandAdapter` tidak pernah mengisi snapshot post).

### T-054 · Reply comment dari dalam aplikasi

`✅ Done (2026-09-22)` · **Domain** engagement · integration · **ADR** ADR-019, ADR-040 · **Depends** T-025, T-053 ✅
**Baca dulu:** `05-architecture/integration-layer.md` · `02-product/roles-permissions.md`

Kirim balasan lewat `OutstandAdapter`, persist ke `EngagementReply`.

**Implementasi (selesai, 2026-09-22):** RBAC dicek ke baseline `roles-permissions.md` — Owner/Admin/Creator semua boleh reply (tidak ada role gating tambahan, cukup member aktif workspace), tidak perlu keputusan baru.

Domain (Elon Backend Engineer): `EngagementService.reply(input, userId)` baru — validasi content tidak boleh kosong (`ValidationError`), cari inbox item (`NotFoundError` guard), panggil `IOutstandAdapter.replyToComment(item.externalId, content)` (Fake adapter, instant-success, pola sama `schedulePost`/`publishNow`), lalu persist `EngagementReply` dengan `outstandReplyId` hasil adapter, status `"sent"`. **Constructor `EngagementService` berubah** — sekarang wajib menerima `IOutstandAdapter` sebagai parameter kedua (breaking change internal, seluruh call site sudah diupdate, dikonfirmasi konsisten oleh Ridwan Architecture Reviewer). `IEngagementRepository.createReply` diperluas menerima `outstandReplyId` (kolom `EngagementReply.outstandReplyId` sudah ada di schema sejak awal, tanpa migration baru).

Server Action baru `replyToCommentAction` di `actions.ts`. UI (Mark UI Engineer): tombol "Kirim" di `EngageInboxView.tsx` diaktifkan — disabled saat draft kosong/sedang mengirim, toast sukses/error, textarea dikosongkan setelah sukses. Unit test baru untuk `EngagementService.reply` (golden path + `ValidationError` + `NotFoundError`).

**Review Ridwan Architecture Reviewer:** 0 temuan — `IOutstandAdapter` tetap interface abstrak (bukan Prisma/Supabase konkret), entry point tanpa business logic, cross-domain lewat public API `workspace`, RBAC sesuai baseline, shared types tidak duplikat, seluruh call site `EngagementService` konsisten dengan constructor baru.

**QA Najwa QA Engineer:** PASS penuh — golden path (kirim reply dari thread yang dipilih) bekerja tanpa reload, regresi `/publish/drafts` dan `/analyze` normal, gate T-103.3 cocok.

**Verifikasi akhir T-053 + T-054:** `bun run typecheck`/`bun run lint`/`bun run test` semua bersih, **448 pass/5 skip** (naik dari 426), tidak ada regresi.

### T-055 · Inbox assignment

`⏳ Not Started` · **Domain** engagement · **ADR** — · **Depends** T-053
**Baca dulu:** `02-product/feature-priority.md`

Berstatus **Could Have** — hanya dikerjakan bila waktu memungkinkan. Tidak memblokir rilis.

---

## Catatan Rilis

* T-056–T-059 sengaja dikosongkan sebagai ruang penambahan task v0.4.
* **Definition of Done rilis ini:** pengguna dapat membaca dan membalas komentar tanpa berpindah platform, dengan data diperbarui setiap 30 menit atau lewat manual refresh.
* **Yang sengaja di luar rilis ini (ADR-040 + `feature-priority.md`):** Social Listening, Direct Messages, Mentions, Engagement Webhooks.
