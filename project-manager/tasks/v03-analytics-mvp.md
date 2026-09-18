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
| **Status**    | ✅ Done (2026-08-13) — seluruh subtask T-042.1–T-042.5 selesai, lolos QA Najwa + review arsitektur Ridwan (tidak ada temuan). Data yang ditampilkan masih dari `FakeOutstandAdapter` (ADR-059/ADR-079), bukan Outstand asli (KI-003) |
| **Domain**    | analytics · UI                                               |
| **ADR**       | ADR-046 (render di root path section)                        |
| **Depends**   | T-040, T-041                                                 |
| **Baca dulu** | `04-ux/key-screen-patterns.md` · `04-ux/information-architecture.md` |

Route `/[slug]` (Home) saat ini placeholder. Dashboard adalah **Must Have** MVP.

**Implementasi T-042.1 (selesai, 2026-08-12):** sesi desain Claude Design untuk `templates/home.html` — dibandingkan dulu terhadap baseline KSP-01, ditemukan 4 gap (tidak ada empty state, tidak ada visual chart/belum pernah cek komponen Chart Astryx, tidak ada selector rentang waktu, deep-link Failed tidak menyorot tujuan), dikonfirmasi scope-nya ke King Rezi, lalu diimplementasikan: blok "Referensi State Kosong" (4 state KSP-01, pola `.state-tag` side-by-side seperti `auth-forgot-password.html`), `.select` rentang waktu + `.bar-track`/`.bar-fill` (`ProgressBar`, karena Astryx dikonfirmasi tidak punya komponen Chart via `astryx docs chart`) di Analytics Snapshot, dan arrival-highlight sementara di `AppPrototype.dc.html` untuk deep-link item Failed (menyorot `.cal-card.is-failed` yang sudah ada di Calendar, tanpa mengubah `publish-calendar.html`). File yang diubah: `styles.css`, `templates/home.html`, `templates/app-prototype/AppPrototype.dc.html`, `readme.md`. Detail lengkap: `COMPLETE_TASK.md`.

- [x] **T-042.1** Sesi desain Claude Design: layar Dashboard/Home
- [x] **T-042.2** Query ringkasan periode (post terpublikasi, total engagement, akun aktif)
- [x] **T-042.3** Stat tiles + chart (cek komponen chart yang tersedia di Astryx dulu sebelum menambah dependency)
- [x] **T-042.4** Empty state saat belum ada data metrik sama sekali
- [x] **T-042.5** Selector rentang waktu

**Implementasi T-042.2–T-042.5 (selesai, 2026-08-13):** dikerjakan lewat 3 subagent sekuensial (analytics · UI, sesuai pemetaan ADR-063) — Prabowo Feature Engineer (T-042.2), Mark UI Engineer (T-042.3–T-042.5), diverifikasi Najwa QA Engineer dan Ridwan Architecture Reviewer (keduanya tidak ada temuan). **T-042.2:** type `DashboardSummary` baru di `src/domains/analytics/types.ts`; method baru `AnalyticsService.getDashboardSummary(workspaceId, period)` (return `{ totalPosts, totalEngagements, avgEngagementRate, activeAccounts }` atau `null` kalau belum ada snapshot, untuk empty state); interface lokal `ActiveAccountsPort` (tidak di-export lewat barrel, pola sama seperti `ScheduledCountsPort` — lihat ADR-078) untuk cross-domain ke workspace; method baru `WorkspaceService.countActiveConnectedAccounts(workspaceId)`; Server Action baru `getDashboardSummaryAction(period)` di `src/app/(app)/dashboard-actions.ts` sebagai composition root (instansiasi `AnalyticsService` + `WorkspaceService` dari barrel publik masing-masing domain). Test baru di `analytics.service.test.ts` dan `workspace.service.test.ts`. **T-042.3–T-042.5:** route `src/app/(app)/page.tsx` diganti dari `ScaffoldPlaceholder` jadi Server Component yang panggil `getDashboardSummaryAction("weekly")` dan render `<DashboardHome>` (baru, `src/app/(app)/components/DashboardHome.tsx`, Client Component pakai `useTransition` untuk re-fetch saat selector diganti). Komponen Astryx dipakai (diverifikasi via `astryx component <Name> --dense`): `Selector` (rentang waktu weekly/monthly), `Card`/`Grid`/`HStack`/`VStack`/`Section`/`Heading`/`Text` (stat tiles), `ProgressBar` (representasi `avgEngagementRate` — dikonfirmasi ulang Astryx tidak punya komponen Chart lewat `astryx docs chart`, jadi tidak menambah dependency chart baru), `EmptyState` (pola sama seperti `DraftsList.tsx`/`ConnectedAccountsList.tsx`). **QA:** `bun run typecheck`, `bun run lint`, `bun run test` (root) semua hijau, 103/103 test lulus; verifikasi visual dengan seed data dummy sementara (sudah di-cleanup, 0 sisa row) untuk workspace Insvire — stat tiles & ProgressBar tampil benar untuk period weekly & monthly, dark mode aman, tidak ada regresi di sidebar channel count / halaman Publish. **Review arsitektur:** tidak ada temuan — entry point bersih dari business logic, domain tidak import Prisma/Supabase langsung, cross-domain analytics→workspace lewat port/adapter pattern konsisten dengan `ScheduledCountsPort`, `DashboardSummary` tepat di domain types (bukan `packages/shared`), UI 100% komponen Astryx tanpa hardcode style. Menutup T-042 (✅ Done). Detail lengkap: `COMPLETE_TASK.md`.

### T-043 · Post performance metrics

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ✅ Done (2026-09-18)                                          |
| **Domain**    | analytics · UI                                               |
| **ADR**       | —                                                            |
| **Depends**   | T-041, T-034 (riwayat post)                                  |
| **Baca dulu** | `04-ux/key-screen-patterns.md`                                |
| **Terkait**   | KI-064 (gap dokumentasi `application-layer.md` § Peta Dependency Antar Domain, ditemukan review Ridwan putaran 2) |

- [x] **T-043.1** Query metrik per post + per target akun
- [x] **T-043.2** UI `/analyze` — tabel performa post, sortable
- [x] **T-043.3** Tampilkan metrik di halaman detail post (T-034.3)
- [x] **T-043.4** Tandai metrik yang belum tersedia dari platform (bukan nol, tapi "belum ada data")

**Design-prep T-043 (Claude Design, 2026-09-18, belum implementasi kode — status subtask T-043.1–T-043.4 TETAP `⏳ Not Started`):** sesuai gate rule 17 AGENTS.md, dicek dulu ke Claude Design apakah rancangan `/analyze` sudah ada. Rancangan dasar SUDAH ada (`templates/analyze-dashboard.html`, KSP-07 — Analyze → Dashboard), tapi ditemukan gap: section "Post Performance" masih pakai markup era Astryx lama (`.post-perf-row`), belum di-resync ke shadcn/ui seperti Drafts/Workspaces/Connected Accounts/Members yang sudah dikunci T-103.1 (2026-09-10). Selain itu ambigu terhadap literal T-043.2 ("tabel performa post, sortable") — dua pola shadcn sama-sama valid (`Table` vs `Item`/`ItemGroup`) dan Claude Design belum mengunci pola konkretnya. King Rezi ditanya via `AskUserQuestion`, jawaban: (1) Post Performance pakai pola **`Table`** dengan kolom sortable, (2) resync sekaligus **seluruh halaman** `analyze-dashboard.html` (Account Overview, summary cards, Engagement Summary, Post Performance), bukan cuma Post Performance. Dikerjakan langsung di sesi utama (delegasi ke Neymar Product Designer gagal — `DesignSync` tidak termuat di sesi subagent, keterbatasan teknis tercatat di `.claude/agents/README.md`; King Rezi memberi izin eksplisit). Hasil: section Post Performance diganti jadi `<table class="table">` dengan `TableHeader` + tombol sort per kolom (`.th-sort`/`.sort-icon`, `aria-sort`, default Reach descending), 4 kolom (Post, Akun, Reach, Eng. Rate) memetakan hanya ke field nyata `AnalyticsPostMetric` (Prisma) — tidak ada field karangan. Account Overview, summary cards, dan Engagement Summary dikunci apa adanya (sudah valid `Card`+`Progress` dari resync token KI-047 sebelumnya). Komentar inline "SYNCED (T-043 design prep, 2026-09-18)" ditambahkan di file untuk mendokumentasikan keputusan. `readme.md` tabel Components diupdate: baris `.table` mencantumkan `analyze-dashboard.html` sebagai SYNCED dengan catatan pola Table+sort ini berbeda dari pola Members/Drafts, dan ditandai sebagai **rujukan target** untuk implementasi `apps/web` (bukan sync dari kode nyata, karena T-043 belum diimplementasikan). Menutup ambiguitas pola sebelum implementasi kode T-043 dimulai. Tidak ada perubahan kode di `apps/web`. Detail lengkap: `COMPLETE_TASK.md`.

**Implementasi T-043.1–T-043.4 (selesai, 2026-09-18):** dikerjakan sekuensial — **T-043.1** (Prabowo Feature Engineer): query performa post per akun, awalnya dibangun sebagai `AnalyticsService.getPostPerformance` dengan port baru `PublishingHistoryPort` (arah analytics→publishing). **T-043.2** (Mark UI Engineer): UI Table sortable di `/analyze` (`apps/web/src/app/(app)/analyze/page.tsx` + `components/AnalyzeDashboard.tsx`), 4 kolom Post/Akun/Reach/Eng. Rate, semua sortable, mengikuti pola `Table` yang sudah dikunci di Claude Design sesi design-prep di atas (2026-09-18). **T-043.4** (gap ditemukan Mark, diperbaiki Prabowo): kriteria "belum ada data" — `getPostPerformance` awalnya skip post tanpa metrik sama sekali, diperbaiki supaya post tetap disertakan dengan `reach`/`engagementRate` bernilai nullable (bukan 0). **T-043.3** (Prabowo + Mark): metrik ditampilkan di halaman detail post History (`HistoryDetail.tsx`), reuse `PostMetricsPort` yang sudah ada dari Calendar (T-033.1); komponen `MetricTile` diekstrak jadi shared (`apps/web/src/app/(app)/components/post-metric-tile.tsx`), dipakai bersama Calendar Popover dan History Detail.

**Review arsitektur Ridwan Architecture Reviewer — 2 putaran:** putaran 1 menemukan 2 temuan. **Kritis**: `PublishingHistoryPort` (arah analytics→publishing) menciptakan circular dependency dengan `PostMetricsPort` (arah publishing→analytics) yang sudah ada sejak T-033.1 — melanggar aturan "tidak ada circular dependency antar BC" di `application-layer.md`. **Moderate**: field `metrics` sempat ditaruh langsung di `HistoryItemRecord` (level repository interface), seharusnya di interface turunan level service (pola `CalendarPostItem`). King Rezi diberi `AskUserQuestion` dan memilih **refactor** (bukan mencatat ADR baru yang menerima circular dependency). Prabowo Feature Engineer memperbaiki: `getPostPerformance` dipindah dari `AnalyticsService` ke `PublishingService` (reuse `PostMetricsPort` yang sudah ada, dependency jadi satu arah `publishing→analytics`); `PostPerformanceRow` dipindah ke `publishing.service.ts`; `HistoryItemRecord.metrics` dihapus, diganti `HistoryDetailItem extends HistoryItemRecord` (pola sama seperti `CalendarPostItem`) di `publishing.service.ts`; rentang tanggal `period` dihitung independen (`post-performance-period-range.ts`, weekly = 7 hari / monthly = 30 hari), tidak lagi bergantung `AnalyticsWorkspaceSnapshot`. Putaran 2: kedua temuan **TERTUTUP**, 0 temuan blocking baru — 2 catatan non-blocking masih terbuka: (a) `application-layer.md` § Peta Dependency Antar Domain ternyata **belum pernah** mencantumkan panah `publishing→analytics` sejak T-033.1 (gap dokumentasi lama, bukan diperkenalkan sesi ini, baru ketahuan sekarang lewat review ini) — dicatat **KI-064**, perlu ditambal terpisah; (b) `post-performance-period-range.ts` awalnya kurang test coverage untuk kasus "monthly"/edge case, ditutup Najwa lewat test baru (lihat di bawah).

**QA Najwa QA Engineer:** 0 temuan blocking. Golden path PASS semua (Table sortable, empty state "Belum ada data" di Table dan History Detail, regresi Calendar Popover setelah ekstraksi `post-metric-tile.tsx` PASS, dark/light mode aman). Menambah test baru `post-performance-period-range.test.ts` (8 test) menutup catatan (b) di atas. **Satu hal tidak bisa diverifikasi visual browser**: metrik tersembunyi di History Detail untuk post `Failed` (tidak ada post `Failed` di data dev saat verifikasi) — tervalidasi lewat unit test eksplisit saja, dianggap aman secara desain tapi belum ada bukti visual browser nyata. Verifikasi akhir keseluruhan task: `typecheck`/`lint` bersih, `bun run test` **411 pass/5 skip** (42 file). Detail lengkap: `COMPLETE_TASK.md`.

### T-046 · Account Overview

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | analytics · UI                                               |
| **ADR**       | —                                                            |
| **Depends**   | T-041, T-043 (reuse pola halaman `/analyze` yang sudah ada)  |
| **Baca dulu** | `04-ux/key-screen-patterns.md` · `templates/analyze-dashboard.html` (Claude Design, section "Account Overview") |

Ringkasan performa per akun/platform di `/analyze` — jumlah post + total reach per akun, direpresentasikan sebagai bar (pola `.bar-track`/`.bar-fill` → shadcn `Progress`, SUDAH dikunci di design-prep T-043 sebagai pola valid, lihat komentar "SYNCED" di `analyze-dashboard.html`, tidak perlu sesi desain ulang — cukup ambil struktur yang sudah ada).

- [ ] **T-046.1** Query agregasi jumlah post + total reach per akun/platform untuk period tertentu (weekly/monthly, konsisten `SnapshotPeriod` yang sudah ada)
- [ ] **T-046.2** UI bar performa per akun di `/analyze` (reuse `Progress`, pola sama `analyze-dashboard.html`)
- [ ] **T-046.3** Empty state kalau belum ada data (konsisten pola T-043.4/T-042.4 — "Belum ada data", bukan 0)

### T-047 · Summary row (/analyze)

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | analytics · UI                                               |
| **ADR**       | —                                                            |
| **Depends**   | T-041, kemungkinan reuse logic mirip `AnalyticsService.getDashboardSummary` (T-042.2) tapi scoped halaman `/analyze` — perlu diputuskan saat implementasi apakah reuse persis atau query terpisah |
| **Baca dulu** | `templates/analyze-dashboard.html` (Claude Design, section summary-row) · `apps/web/src/app/(app)/components/DashboardHome.tsx` (pola `StatTile` Card yang sudah ada di Home, T-042.3) |

3 stat card di bagian atas `/analyze` — Total Posts, Total Reach, Engagement Rate untuk period yang dipilih.

- [ ] **T-047.1** Tentukan sumber data: reuse `AnalyticsService.getDashboardSummary`-style query atau bikin query terpisah scoped `/analyze` — catat keputusannya sebagai bagian implementasi (bukan pra-keputusan di sini)
- [ ] **T-047.2** UI 3 stat card di `/analyze` (reuse pola `StatTile` dari `DashboardHome.tsx`, T-042.3)
- [ ] **T-047.3** Empty state konsisten pola T-042.4/T-043.4

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

* T-046–T-049 sengaja dikosongkan sebagai ruang penambahan task v0.3. **Update 2026-09-18:** T-046 (Account Overview) dan T-047 (Summary row /analyze) sudah terpakai — gap perencanaan murni ditemukan saat implementasi T-043 (dua section `analyze-dashboard.html` yang sengaja dikecualikan dari scope T-043 ternyata belum pernah dapat nomor task). Tersisa **T-048–T-049** sebagai ruang kosong.
* **Definition of Done rilis ini:** pengguna dapat mengevaluasi hasil publikasi.
* **Yang sengaja di luar rilis ini:** Custom Reports, AI Insights, Enterprise Analytics (`feature-priority.md`).
