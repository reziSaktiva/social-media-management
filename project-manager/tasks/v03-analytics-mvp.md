# v0.3 — Analytics MVP

> Bagian dari backlog berjenjang. Indeks + legend status: [`../TASKS.md`](../TASKS.md).

**Tujuan rilis:** Memberikan visibilitas terhadap performa konten.
**Baseline rilis:** `product-discovery/02-product/release-roadmap.md` → v0.3

**Titik awal:** domain `analytics/` masih stub kosong (`index.ts` + `types.ts` berisi `export {}` + `errors.ts`). Model `AnalyticsPostMetric` dan `AnalyticsWorkspaceSnapshot` **sudah ada** di schema. Route Home dan `/analyze` masih placeholder — saat ini masih di bawah dynamic segment lama `[slug]`, tapi baseline routing sudah pindah ke route group `(app)` (ADR-076); kalau **T-039** (migrasi kode, `tasks/v01-foundation.md`) belum selesai saat task rilis ini dikerjakan, bangun langsung di `(app)/analyze` — jangan menambah route baru di `[slug]/...` lama.

**Prasyarat lintas rilis:** rilis ini tidak bisa menghasilkan angka nyata sebelum T-025 (Real OutstandAdapter) + T-027 (job runner) selesai — tanpa keduanya tidak ada sumber metrik.

---

## Analytics Foundation

### T-040 · Analytics domain skeleton

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ✅ Done (2026-08-12)                                          |
| **Domain**    | analytics                                                    |
| **ADR**       | ADR-004, ADR-017, ADR-018, ADR-031                           |
| **Depends**   | T-002 ✅                                                      |
| **Baca dulu** | `05-architecture/domain-model.md` · `05-architecture/application-layer.md` · `context/ctx-implementation.md` |

Ikuti konvensi yang sudah dipakai `workspace` + `publishing`: interface repository di `src/domains/analytics/repositories/`, implementasi Prisma di `src/lib/repositories/analytics/`.

**Implementasi T-040.1–T-040.4 (selesai, 2026-08-12):** T-040.1–T-040.4 semuanya selesai lewat Elon Backend Engineer, tidak ada yang di-skip, tidak ada gap skema Prisma. File dibuat: `apps/web/src/domains/analytics/repositories/analytics.repository.ts` (`IAnalyticsRepository`), `apps/web/src/domains/analytics/services/analytics.service.ts` (`AnalyticsService`: `getPostMetrics(postId)`, `getWorkspaceSnapshot(workspaceId, period)`), `apps/web/src/domains/analytics/services/analytics.service.test.ts` (4 test dengan fake repository), `apps/web/src/lib/repositories/analytics/analytics.repository.ts` (implementasi Prisma `analyticsRepository`), `apps/web/src/lib/repositories/analytics/index.ts` (barrel export). File diubah: `apps/web/src/domains/analytics/types.ts` (diisi `SnapshotPeriod = "weekly" | "monthly"`, sebelumnya `export {}`), `apps/web/src/domains/analytics/index.ts` (public API barrel di-extend), `packages/shared/src/ids.ts` (tambah factory `asPostMetricsId` dan `asWorkspaceSnapshotId`). Desain: `IAnalyticsRepository` sengaja hanya read path (selaras kontrak `application-layer.md`) — method tulis untuk ingestion (`syncMetrics`) sengaja tidak ditambahkan, itu scope T-041. `SnapshotPeriod` ditaruh lokal di domain analytics (bukan `packages/shared`) karena belum ada BC lain yang mengonsumsinya. Verifikasi: full test suite `apps/web/src` + `packages/shared` → 11 file, 89 test lulus (tidak ada regresi ke domain workspace/publishing), `tsc --noEmit` bersih. Detail: `COMPLETE_TASK.md`.

- [x] **T-040.1** `IAnalyticsRepository` + implementasi Prisma
- [x] **T-040.2** `AnalyticsService` + isi `types.ts` (saat ini masih `export {}`)
- [x] **T-040.3** Public API lewat `index.ts` (cross-domain hanya lewat barrel ini)
- [x] **T-040.4** Unit test service dengan repository fake

### T-041 · Metric ingestion job dari Outstand

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ✅ Done (2026-08-13)                                          |
| **Domain**    | analytics · integration                                      |
| **ADR**       | ADR-022, ADR-040, ADR-059, ADR-079                            |
| **Depends**   | T-025, T-027, T-040                                          |
| **Baca dulu** | `05-architecture/background-jobs.md` · `05-architecture/integration-layer.md` |

**Implementasi T-041.1–T-041.5 (Fake/mock, selesai, 2026-08-13, ADR-079):** dikerjakan lewat Elon Backend Engineer memakai pola Fake yang sama seperti ADR-059 (Real Outstand credentials/T-025/T-027 masih belum ada — KI-003). `IOutstandAdapter` dipromosikan dari domain `publishing` ke `packages/shared/src/contracts/outstand-adapter.ts` (kontrak cross-domain, dipakai bersama oleh `publishing` dan `analytics`), `domains/publishing/adapters/outstand-adapter.ts` dipertahankan sebagai barrel re-export. Method baru `fetchPostMetrics(outstandJobId)` dan `fetchWorkspaceMetrics(outstandAccountId, period)` diimplementasikan di `FakeOutstandAdapter` (`apps/web/src/lib/adapters/outstand/fake-outstand-adapter.ts`) dengan data mock deterministik (hash FNV-1a dari id, bukan random). `AnalyticsIngestionUseCase` baru (`syncPostMetrics`, `syncWorkspaceSnapshot`) dipisah dari `AnalyticsService`, mengikuti pola Use Case terpisah ADR-059 poin 5. `IAnalyticsRepository` di-extend dengan `upsertPostMetrics`/`upsertWorkspaceSnapshot` (Prisma `upsert` asli) di atas unique constraint baru `@@unique([postId, connectedAccountId])` pada `AnalyticsPostMetric` — migration `20260813023329_add_analytics_post_metric_unique` sudah dijalankan ke DB dev Supabase — memenuhi T-041.5 (idempotensi). Frekuensi sync (T-041.3) ditetapkan kandidat harian, bukan 30 menit seperti engagement, sesuai catatan di baseline. Scope di luar T-041 ini: real Outstand API call (tetap T-025), cron/job scheduler asli Railway (tetap T-027), dan perhitungan `topPostId` (query agregat terpisah). Detail keputusan: ADR-079. Detail file & verifikasi: `COMPLETE_TASK.md`.

- [x] **T-041.1** `OutstandAdapter` method fetch metrik per post/akun
- [x] **T-041.2** Job handler ingestion → tulis `AnalyticsPostMetric`
- [x] **T-041.3** Tentukan frekuensi sync + catat alasannya (kandidat: harian; **bukan** 30 menit seperti engagement)
- [x] **T-041.4** Snapshot agregat workspace → `AnalyticsWorkspaceSnapshot`
- [x] **T-041.5** Idempotensi: ingestion ulang periode yang sama tidak menggandakan angka

---

## Dashboard & Metrics

### T-042 · Dashboard Home

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | 🟡 In Progress — T-042.1 selesai (2026-08-12); dependency T-040 dan T-041 sudah ✅ per 2026-08-13, T-042.2–.5 tidak lagi terblokir dari sisi dependency (data yang tersedia masih dari `FakeOutstandAdapter`, bukan Outstand asli — lihat ADR-059/ADR-079) |
| **Domain**    | analytics · UI                                               |
| **ADR**       | ADR-046 (render di root path section)                        |
| **Depends**   | T-040, T-041                                                 |
| **Baca dulu** | `04-ux/key-screen-patterns.md` · `04-ux/information-architecture.md` |

Route `/[slug]` (Home) saat ini placeholder. Dashboard adalah **Must Have** MVP.

**Implementasi T-042.1 (selesai, 2026-08-12):** sesi desain Claude Design untuk `templates/home.html` — dibandingkan dulu terhadap baseline KSP-01, ditemukan 4 gap (tidak ada empty state, tidak ada visual chart/belum pernah cek komponen Chart Astryx, tidak ada selector rentang waktu, deep-link Failed tidak menyorot tujuan), dikonfirmasi scope-nya ke King Rezi, lalu diimplementasikan: blok "Referensi State Kosong" (4 state KSP-01, pola `.state-tag` side-by-side seperti `auth-forgot-password.html`), `.select` rentang waktu + `.bar-track`/`.bar-fill` (`ProgressBar`, karena Astryx dikonfirmasi tidak punya komponen Chart via `astryx docs chart`) di Analytics Snapshot, dan arrival-highlight sementara di `AppPrototype.dc.html` untuk deep-link item Failed (menyorot `.cal-card.is-failed` yang sudah ada di Calendar, tanpa mengubah `publish-calendar.html`). File yang diubah: `styles.css`, `templates/home.html`, `templates/app-prototype/AppPrototype.dc.html`, `readme.md`. Detail lengkap: `COMPLETE_TASK.md`.

- [x] **T-042.1** Sesi desain Claude Design: layar Dashboard/Home
- [ ] **T-042.2** Query ringkasan periode (post terpublikasi, total engagement, akun aktif)
- [ ] **T-042.3** Stat tiles + chart (cek komponen chart yang tersedia di Astryx dulu sebelum menambah dependency)
- [ ] **T-042.4** Empty state saat belum ada data metrik sama sekali
- [ ] **T-042.5** Selector rentang waktu

### T-043 · Post performance metrics

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | analytics · UI                                               |
| **ADR**       | —                                                            |
| **Depends**   | T-041, T-034 (riwayat post)                                  |
| **Baca dulu** | `04-ux/key-screen-patterns.md`                                |

- [ ] **T-043.1** Query metrik per post + per target akun
- [ ] **T-043.2** UI `/analyze` — tabel performa post, sortable
- [ ] **T-043.3** Tampilkan metrik di halaman detail post (T-034.3)
- [ ] **T-043.4** Tandai metrik yang belum tersedia dari platform (bukan nol, tapi "belum ada data")

### T-044 · Engagement summary

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | analytics                                                    |
| **ADR**       | ADR-018 (cross-domain lewat public API)                      |
| **Depends**   | T-041 · idealnya setelah v0.4 (data komentar nyata)          |
| **Baca dulu** | `05-architecture/application-layer.md`                        |

Ringkasan engagement adalah **Must Have** MVP. Ambil data lintas domain lewat public API domain `engagement` — **bukan** query tabel engagement langsung dari analytics.

- [ ] **T-044.1** Sepakati kontrak: analytics memanggil `engagement` public API, atau engagement mengirim agregat ke analytics
- [ ] **T-044.2** Implementasi agregasi (komentar masuk, komentar dibalas, rasio respons)
- [ ] **T-044.3** Tampilkan di Dashboard (T-042)

---

## Reports

### T-045 · Comparative reports

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | analytics · UI                                               |
| **ADR**       | —                                                            |
| **Depends**   | T-042, T-043                                                 |
| **Baca dulu** | `02-product/feature-priority.md`                              |

Berstatus **Should Have** di `feature-priority.md` — boleh ditunda tanpa memblokir rilis. `Custom Reports` dan `AI Insights` berstatus Could Have, **tidak** masuk backlog rilis ini.

- [ ] **T-045.1** Perbandingan antar periode (bulan ini vs bulan lalu)
- [ ] **T-045.2** Perbandingan antar akun/platform
- [ ] **T-045.3** Export (format menunggu keputusan — CSV kandidat paling murah)

---

## Catatan Rilis

* T-046–T-049 sengaja dikosongkan sebagai ruang penambahan task v0.3.
* **Definition of Done rilis ini:** pengguna dapat mengevaluasi hasil publikasi.
* **Yang sengaja di luar rilis ini:** Custom Reports, AI Insights, Enterprise Analytics (`feature-priority.md`).
