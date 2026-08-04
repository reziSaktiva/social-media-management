# v0.3 — Analytics MVP

> Bagian dari backlog berjenjang. Indeks + legend status: [`../TASKS.md`](../TASKS.md).

**Tujuan rilis:** Memberikan visibilitas terhadap performa konten.
**Baseline rilis:** `product-discovery/02-product/release-roadmap.md` → v0.3

**Titik awal:** domain `analytics/` masih stub kosong (`index.ts` + `types.ts` berisi `export {}` + `errors.ts`). Model `AnalyticsPostMetric` dan `AnalyticsWorkspaceSnapshot` **sudah ada** di schema. Route `/[slug]` (Home) dan `/[slug]/analyze` masih placeholder.

**Prasyarat lintas rilis:** rilis ini tidak bisa menghasilkan angka nyata sebelum T-025 (Real OutstandAdapter) + T-027 (job runner) selesai — tanpa keduanya tidak ada sumber metrik.

---

## Analytics Foundation

### T-040 · Analytics domain skeleton

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | analytics                                                    |
| **ADR**       | ADR-004, ADR-017, ADR-018, ADR-031                           |
| **Depends**   | T-002 ✅                                                      |
| **Baca dulu** | `05-architecture/domain-model.md` · `05-architecture/application-layer.md` · `context/ctx-implementation.md` |

Ikuti konvensi yang sudah dipakai `workspace` + `publishing`: interface repository di `src/domains/analytics/repositories/`, implementasi Prisma di `src/lib/repositories/analytics/`.

- [ ] **T-040.1** `IAnalyticsRepository` + implementasi Prisma
- [ ] **T-040.2** `AnalyticsService` + isi `types.ts` (saat ini masih `export {}`)
- [ ] **T-040.3** Public API lewat `index.ts` (cross-domain hanya lewat barrel ini)
- [ ] **T-040.4** Unit test service dengan repository fake

### T-041 · Metric ingestion job dari Outstand

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | analytics · integration                                      |
| **ADR**       | ADR-022, ADR-040                                             |
| **Depends**   | T-025, T-027, T-040                                          |
| **Baca dulu** | `05-architecture/background-jobs.md` · `05-architecture/integration-layer.md` |

- [ ] **T-041.1** `OutstandAdapter` method fetch metrik per post/akun
- [ ] **T-041.2** Job handler ingestion → tulis `AnalyticsPostMetric`
- [ ] **T-041.3** Tentukan frekuensi sync + catat alasannya (kandidat: harian; **bukan** 30 menit seperti engagement)
- [ ] **T-041.4** Snapshot agregat workspace → `AnalyticsWorkspaceSnapshot`
- [ ] **T-041.5** Idempotensi: ingestion ulang periode yang sama tidak menggandakan angka

---

## Dashboard & Metrics

### T-042 · Dashboard Home

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | analytics · UI                                               |
| **ADR**       | ADR-046 (render di root path section)                        |
| **Depends**   | T-040, T-041                                                 |
| **Baca dulu** | `04-ux/key-screen-patterns.md` · `04-ux/information-architecture.md` |

Route `/[slug]` (Home) saat ini placeholder. Dashboard adalah **Must Have** MVP.

- [ ] **T-042.1** Sesi desain Claude Design: layar Dashboard/Home
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
