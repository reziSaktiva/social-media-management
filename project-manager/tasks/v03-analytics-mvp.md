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

- [x] **T-043.1** Query metrik per post + per target akun
- [x] **T-043.2** UI `/analyze` — tabel performa post, sortable
- [x] **T-043.3** Tampilkan metrik di halaman detail post (T-034.3)
- [x] **T-043.4** Tandai metrik yang belum tersedia dari platform (bukan nol, tapi "belum ada data")

**Implementasi T-043.2–T-043.4 (selesai, 2026-09-18):** dikerjakan lewat Mark UI Engineer, mengikuti rancangan yang dikunci Claude Design `templates/analyze-dashboard.html` (komentar SYNCED ditulis hari yang sama saat sesi desain T-043 — dicek dulu sesuai AGENTS.md rule 17 sebelum menulis kode apa pun). **T-043.2:** route `src/app/(app)/analyze/page.tsx` diganti dari `ScaffoldPlaceholder` jadi Server Component yang memanggil `getAnalyzeSummaryAction("weekly")` dan `getPostPerformanceAction()` (keduanya sudah ada dari T-043.1) paralel via `Promise.all`, merender `AnalyzeDashboard` baru (`src/app/(app)/analyze/components/AnalyzeDashboard.tsx`, Client Component — selector period weekly/monthly + `useTransition` re-fetch summary, pola disalin persis dari `DashboardHome.tsx` T-042.3, BUKAN direfactor jadi shared hook supaya tidak saling menjalar). Summary row 3 stat card (Total Posts, Total Reach, Engagement Rate) reuse pola `StatTile`/`Card`+`CardContent`+`Text` yang sama dengan Analytics Snapshot Dashboard Home. Tabel Post Performance dipisah ke komponen baru `PostPerformanceTable.tsx` — shadcn `Table`/`TableHeader`/`TableHead`/`TableBody`/`TableRow`/`TableCell` DENGAN `TableHeader` (beda dari Drafts yang tanpa header, sesuai komentar SYNCED mockup — mengikuti pola Members `MembersTable.tsx`), wrapper border+rounded manual tanpa `Card` terpisah (pola sama Members/Drafts), baris TIDAK diklik-penuh. Kolom dikunci 4: Post (thumbnail placeholder `bg-muted` + caption truncate), Akun (icon+label dari `PLATFORM_ICON`, `components/platform-icons.tsx`), Reach, Eng. Rate — sort client-side (`useState`+`useMemo`, tombol native di `TableHead` + ikon `ArrowUp01Icon`/`ArrowDown01Icon`/`ArrowUpDownIcon` hugeicons, `aria-sort` di elemen `<th>`), default Reach descending sesuai mockup. `getPostPerformanceAction()` sengaja tidak menerima `period` (T-043.1) — didokumentasikan di komentar `AnalyzeDashboard.tsx` kenapa tabel tidak ikut re-fetch saat period diganti (bukan bug). **T-043.3:** `publish/history/[postId]/page.tsx` menambah panggilan `AnalyticsService.getPostMetrics(postId)` (method sudah ada, T-040.1) paralel dengan `getHistoryById` via `Promise.all`, prop baru `metrics: PostMetricsRecord[]` diteruskan ke `HistoryDetail.tsx` — tiap target `Published` di section "Hasil per Akun" yang sudah ada dicocokkan ke baris metrics via `connectedAccountId`, menampilkan Reach + Eng. Rate di sebelah link "Lihat post asli" (tidak restrukturisasi section yang sudah ada). **T-043.4:** baris `hasMetrics: false` (tabel) dan target Published tanpa metrics yang match (detail post) konsisten menampilkan `Text variant="muted"` "Belum ada data" (bukan "0"/disembunyikan); di tabel, baris begini juga sengaja ditaruh di akhir urutan kalau disortir ke kolom Reach/Eng. Rate (bukan ikut tersortir numerik menyesatkan sebagai nilai 0). Di luar scope (sesuai instruksi task, bukan lupa): Account Overview (T-045.2), Engagement Summary (T-044), filter dropdown akun di mockup (belum ada spec eksplisit). Tidak ada perubahan di `src/domains/analytics/**` atau `analyze-actions.ts` — murni UI + composition root tipis di `publish/history/[postId]/page.tsx` (menambah satu panggilan service yang sudah ada, bukan business logic baru). Verifikasi: `bun run typecheck` dan `bun run lint` bersih (0 error/warning baru). Verifikasi visual via `mcp__Claude_Browser` TIDAK bisa dilakukan di worktree sesi ini — dev server gagal start karena `DATABASE_URL` tidak dikonfigurasi sama sekali di environment ini (bukan sekadar data kosong, tapi tidak ada koneksi DB — `.env.local` tidak ada di worktree ini), jadi tidak ada screenshot (state kosong maupun terisi) yang bisa diambil; perlu diverifikasi manual oleh King Rezi atau di sesi/environment yang punya `DATABASE_URL` valid sebelum dianggap fully verified secara visual.

**Implementasi T-043.1 (selesai, 2026-09-18):** dikerjakan lewat Prabowo Feature Engineer (scope murni data layer + composition root, UI T-043.2/3/4 sengaja belum disentuh). Type baru `PostPerformanceRow` di `src/domains/analytics/types.ts` (satu baris per post × target akun, `hasMetrics: false` menandai post `Published` yang belum punya baris `AnalyticsPostMetric` — dipakai T-043.4). Method baru `AnalyticsService.getPostPerformance(workspaceId, userId)` di `src/domains/analytics/services/analytics.service.ts`: reuse `getPostMetricsByPosts` yang sudah ada (T-033.1, tidak ada repository method baru), digabung dengan daftar post `Published` dari `publishing` lewat port lokal baru `PostInfoPort` (tidak di-export lewat barrel, pola sama `ActiveAccountsPort`/`ScheduledCountsPort`) — constructor `AnalyticsService` menambah parameter optional ketiga `postInfo`. Composition root baru `src/app/(app)/analyze/analyze-actions.ts` (Server Action, pola persis `dashboard-actions.ts`): `getAnalyzeSummaryAction(period)` (wrapper tipis ke `getWorkspaceSnapshot`, sama seperti Dashboard) dan `getPostPerformanceAction()` (wire `AnalyticsService` + `PublishingService` — `PostInfoPort` diimplementasikan inline memanggil `PublishingService.listHistory` dengan `statuses: [ContentStatus.Published]` saja, post `Failed` sengaja dikecualikan). Test baru di `analytics.service.test.ts` (4 kasus: throw tanpa port, `[]` tanpa query metrik kalau tidak ada post published, 1 row `hasMetrics:false` untuk post tanpa metrik, multi-row per post untuk metrik multi-akun). Di luar scope (eksplisit, sesuai instruksi): UI tabel (T-043.2/3/4), Account Overview (T-045.2), Engagement Summary (T-044). Verifikasi: `bun run typecheck` bersih (root, setelah `prisma generate` — client belum ter-generate di worktree ini), `bun test src/domains/analytics` 18/18 lulus, `bun run lint` tanpa error baru. Root `bun test` punya 28 fail pre-existing (env `DATABASE_URL` tidak tersedia utk test yang butuh Prisma nyata, `vi.hoisted` tidak didukung `bun test`, RuleTester eslint lokal) — tidak terkait perubahan ini, tidak ada regresi di domain analytics/publishing/workspace lain.

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
