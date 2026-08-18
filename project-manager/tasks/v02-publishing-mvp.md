# v0.2 — Publishing MVP

> Bagian dari backlog berjenjang. Indeks + legend status: [`../TASKS.md`](../TASKS.md).

**Tujuan rilis:** Memungkinkan pengguna membuat dan menjadwalkan konten.
**Baseline rilis:** `product-discovery/02-product/release-roadmap.md` → v0.2

**Rantai blocker rilis ini:** Real OutstandAdapter (T-025) belum ada → schedule hanya jalan lewat Fake · Connect account (T-013) belum ada → connected account harus di-seed · webhook (T-026) + job runner (T-027) masih 501 → **tidak ada transisi status post pasca-schedule**. Tiga task itu membuka hampir semua sisa rilis ini.

---

## Content Draft

### T-020 · Draft Editor sebagai modal reusable

`✅ Done` · **ADR** ADR-052 (override NP-D02)

Modal overlay fullscreen (`Dialog variant="fullscreen"`) menggantikan full-page route: caption, account selector, format per akun, Pinterest title/link, schedule date/time, confirm step in-dialog, ResumeDialog untuk draft belum tersimpan. Kode: `apps/web/src/app/[slug]/_draft-editor/modal.tsx`.

**Catatan (2026-08-05):** deskripsi di atas hanya mencakup variant Fullscreen — sejak ADR-065, Fullscreen bukan lagi satu-satunya tampilan. Toggle resmi Fullscreen/Standard (default Standard) **belum diimplementasikan** di kode ini; lihat T-038.

### T-021 · Persistensi "Save as Draft" / "Edit Draft"

`✅ Done` · **ADR** ADR-016, ADR-017, ADR-031

`PublishingService.saveDraft` / `getDraftById` / `updateDraft` + repository Prisma + Server Actions. Kode: `apps/web/src/domains/publishing/services/publishing.service.ts`.

### T-022 · Drafts List dari data asli

`✅ Done`

`listDrafts` + `drafts-list.tsx` membaca DB nyata, bukan mock.

### T-023 · Content Format per akun tujuan

`✅ Done` · **ADR** ADR-037, ADR-039

Matriks format per platform (IG/FB: Post/Reel/Story · TikTok: video feed tanpa selector · Pinterest: Pin + title/board/link · lainnya: default `post`). Kode: `apps/web/src/domains/publishing/content-format-matrix.ts`.

### T-024 · Media upload di Draft Editor

| Field         | Value                                                          |
| ------------- | -------------------------------------------------------------- |
| **Status**    | ⏳ Not Started                                                  |
| **Domain**    | media · publishing                                             |
| **ADR**       | ADR-040 (media upload working copy)                            |
| **Depends**   | T-025 (Media API adapter)                                      |
| **Baca dulu** | `05-architecture/integration-layer.md` · `06-engineering/environment-management.md` |

Kontrol lampiran media di Draft Editor sudah ada tapi **disabled** dengan keterangan "Lampiran media akan tersedia setelah OutstandAdapter Media API siap".

- [ ] **T-024.1** Domain `media` skeleton (service + repository, model `MediaItem` sudah ada di schema)
- [ ] **T-024.2** Upload ke Supabase Storage (Supabase JS client **hanya** untuk Storage/Realtime — CRUD tetap Prisma)
- [ ] **T-024.3** `OutstandAdapter` media upload working copy (ADR-040)
- [ ] **T-024.4** Aktifkan kontrol lampiran di Draft Editor + preview
- [ ] **T-024.5** Delete Media + dialog konfirmasi (ADR-049 Tier 2)

### T-038 · Toggle Fullscreen/Standard resmi di Draft Editor

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | publishing (UI)                                              |
| **ADR**       | ADR-065 (amandemen ADR-052)                                  |
| **Depends**   | T-020 (modal Draft Editor sudah ada — Done)                  |
| **Baca dulu** | `decisions/ADR-065-draft-editor-toggle-fullscreen-standard-jadi-fitur-resmi-default-standard.md` · `04-ux/key-screen-patterns.md` (KSP-05) · `04-ux/navigation-patterns.md` (NP-D11) |

T-020 hanya mengimplementasikan Draft Editor sebagai modal `Dialog variant="fullscreen"` — tidak ada variant Standard maupun toggle. ADR-065 mengangkat toggle Fullscreen/Standard (sebelumnya alat banding di Claude Design saja) jadi fitur resmi produk, dengan default berubah ke **Standard**. Referensi visual sudah ada di Claude Design (`templates/draft-editor.html`, `templates/app-prototype/AppPrototype.dc.html`).

- [ ] **T-038.1** Tambah variant Standard (`Dialog` non-fullscreen, floating card + backdrop) berdampingan dengan variant Fullscreen yang sudah ada
- [ ] **T-038.2** Toggle di header modal (sebaris status chip, kiri tombol Close) untuk berpindah Fullscreen ↔ Standard
- [ ] **T-038.3** Default state Standard setiap modal dibuka — tidak dipersist (localStorage/preference) sesuai ADR-065
- [ ] **T-038.4** Berlaku untuk New Post dan Edit Draft, keduanya

---

## Outstand Runtime (ADR-040)

### T-025 · Real OutstandAdapter (HTTP client)

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | integration                                                  |
| **ADR**       | ADR-005, ADR-019, ADR-040, ADR-059                           |
| **Terkait**   | KI-003, KI-015 (`PROJECT_STATE.md` § Blockers)                |
| **Depends**   | T-028 ✅ (port + factory sudah ada) · kredensial Outstand asli |
| **Baca dulu** | `05-architecture/integration-layer.md`                        |

Port `IOutstandAdapter` dan factory `getOutstandAdapter()` sudah ada. Factory **sengaja throw** jika `OUTSTAND_API_KEY` terisi tapi kode real adapter belum ada — bukan silent fallback ke Fake.

- [ ] **T-025.1** HTTP client + auth header + error mapping ke domain error (Anti-Corruption Layer)
- [ ] **T-025.2** `schedulePost` real (menggantikan Fake pada jalur produksi)
- [ ] **T-025.3** `publishNow` real (dipakai T-029)
- [ ] **T-025.4** `connectAccount` redirect flow (dipakai T-013)
- [ ] **T-025.5** Media API (dipakai T-024)
- [ ] **T-025.6** Engagement fetch/reply (dipakai v0.4)
- [ ] **T-025.7** Unit test adapter dengan HTTP mock — belum ada test adapter sama sekali

> Kredensial `OUTSTAND_API_KEY` / `OUTSTAND_WEBHOOK_SECRET` asli belum dimiliki King Rezi. Fake adapter (T-028) sengaja dibuat supaya rilis ini tidak berhenti menunggu.

### T-026 · Webhook handler Outstand

| Field         | Value                                                              |
| ------------- | ------------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                      |
| **Domain**    | integration                                                        |
| **ADR**       | ADR-020, ADR-040                                                   |
| **Terkait**   | KI-003 (via T-025), KI-015 (`PROJECT_STATE.md` § Blockers)                    |
| **Depends**   | T-025                                                              |
| **Baca dulu** | `05-architecture/integration-layer.md`                              |

`/api/webhooks/outstand` masih return 501. Model `OutstandWebhookEvent` sudah ada di schema, `OUTSTAND_WEBHOOK_SECRET` sudah didefinisikan di `src/lib/env.ts` tapi belum dipakai.

- [ ] **T-026.1** Verifikasi HMAC-SHA256 signature sebelum setiap pemrosesan
- [ ] **T-026.2** Durable-before-ACK — persist event dulu, baru ACK, baru proses
- [ ] **T-026.3** Handler `post.published` → update `PublishingPostTarget` outcome
- [ ] **T-026.4** Handler `post.error` → outcome gagal + trigger notifikasi (T-036)
- [ ] **T-026.5** Handler `account.token_expired` → tandai akun perlu reconnect (T-015)
- [ ] **T-026.6** Idempotensi: event duplikat tidak boleh menggandakan efek

### T-027 · Job runner + Railway Cron

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | platform                                                     |
| **ADR**       | ADR-022, ADR-028, ADR-032, ADR-040                           |
| **Terkait**   | KI-003 (via T-025), KI-015, KI-025 (Railway belum pernah dibuat, `PROJECT_STATE.md` § Blockers) |
| **Depends**   | T-025                                                        |
| **Baca dulu** | `05-architecture/background-jobs.md` · `06-engineering/deployment-infrastructure.md` |

`/api/jobs/run` masih return 501. Model `BackgroundJob` ada di schema tapi **nol referensi** di kode aplikasi. Tidak ada cron config apapun di repo.

- [ ] **T-027.1** Job runner: klaim job dari `BackgroundJob` (locking aman untuk eksekusi paralel)
- [ ] **T-027.2** Autentikasi endpoint via `JOB_SECRET` (sudah ada di env, belum dipakai)
- [ ] **T-027.3** Retry internal dengan backoff + dead-letter state
- [ ] **T-027.4** Konfigurasi Railway Cron (service cron terpisah dari web)
- [ ] **T-027.5** Job handler: publish scheduled post saat waktunya tiba

---

## Schedule & Publish

### T-028 · Persistensi "Schedule" via Fake OutstandAdapter

`✅ Done` · **ADR** ADR-059

`SchedulePostsUseCase` + `resolveScheduleTargets` + validasi format (`assertContentFormatAllowed`) + `WorkspaceService.listConnectedAccounts` (query real). Lolos QA + review arsitektur Ridwan tanpa temuan. Kode: `apps/web/src/domains/publishing/services/schedule-posts.use-case.ts`.

### T-029 · Publish Now

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | 🟡 In Progress                                                |
| **Domain**    | publishing                                                   |
| **ADR**       | ADR-047, ADR-039, ADR-049                                    |
| **Depends**   | T-025                                                        |
| **Baca dulu** | `04-ux/key-screen-patterns.md` (KSP-05-F12) · `04-ux/user-flows.md` (UXP-04) · `02-product/roles-permissions.md` |

**Update 2026-08-18 — koreksi:** belum ada di kode (`grep publishNow` nol hasil di `src/`), tapi desainnya **sudah ada** di Claude Design (project "Social Media Management") — catatan lama di sini ("belum ada... maupun di App Prototype") salah dan sudah usang:
- Tombol "Publish Now" sudah ada di `templates/draft-editor.html`, berdampingan dengan "Save as Draft" dan "Schedule".
- Dialog Confirmation Summary varian Publish Now ("Konfirmasi & Publish") sudah wired interaktif di `templates/app-prototype/AppPrototype.dc.html` (`openPublishNowDialog`, `data-proto="draft-publishnow"`/`publishnow-confirm`), termasuk role switcher untuk visibility per role dan redirect ke Calendar/History setelah konfirmasi.
- Component pattern dialog-nya juga didokumentasikan di `components/dialog.html` (purpose=`form`, disebut eksplisit dipakai bersama Schedule).

Jadi T-029.4/.5/.6 di bawah **desainnya sudah tersedia** — sisa pekerjaan murni implementasi kode (Server Action + service + wiring ke komponen Astryx nyata), bukan menunggu desain baru.

- [ ] **T-029.1** `PublishingService.publishNow()` — RBAC semua role (Owner/Admin/Creator, ADR-074)
- [ ] **T-029.2** Validasi `ContentFormat` (ADR-039) sebelum panggil adapter
- [ ] **T-029.3** Server Action + panggil `OutstandAdapter.publishNow`
- [ ] **T-029.4** Tombol "Publish Now" di Draft Editor berdampingan dengan Schedule (KSP-05-F12) — desain sudah ada, tinggal implementasi komponen Astryx nyata
- [ ] **T-029.5** Dialog Confirmation Summary varian Publish Now (UXP-04) — desain sudah ada di App Prototype, tinggal implementasi komponen Astryx nyata
- [ ] **T-029.6** ~~Tambahkan tombolnya di App Prototype Claude Design~~ — sudah ada di App Prototype, task ini selesai dari sisi desain

### T-030 · Cancel Schedule + dialog konfirmasi

| Field         | Value                                            |
| ------------- | ------------------------------------------------ |
| **Status**    | ⏳ Not Started                                    |
| **Domain**    | publishing                                       |
| **ADR**       | ADR-049 (Tier 2)                                 |
| **Depends**   | T-028 ✅, T-032 (aksi dipicu dari Queue), T-033 (aksi dipicu dari Calendar) |
| **Baca dulu** | `04-ux/key-screen-patterns.md`                    |

- [ ] **T-030.1** `PublishingService.cancelSchedule` + batalkan di Outstand (T-025)
- [ ] **T-030.2** Dialog konfirmasi Tier 2
- [ ] **T-030.3** Aksi tersedia dari Queue + Calendar

### T-031 · Redirect otomatis ke sub-screen tujuan setelah aksi terminal

| Field         | Value                                                    |
| ------------- | -------------------------------------------------------- |
| **Status**    | 🟡 In Progress                                            |
| **Domain**    | UI                                                       |
| **ADR**       | ADR-054                                                  |
| **Depends**   | T-029, T-032, T-034                                      |
| **Baca dulu** | `04-ux/navigation-patterns.md`                            |

Bukan task besar berdiri sendiri — cukup diselaraskan saat task tujuannya dikerjakan.

- [x] **T-031.1** Save as Draft → Drafts (sudah sejalan dengan alur existing)
- [x] **T-031.2** Pastikan tetap konsisten begitu CTA sidebar (T-011) aktif dari section manapun — `finishTerminalAction` di `_draft-editor/modal.tsx` menutup editor lalu mengarahkan ke tujuan, dipakai seragam oleh Save as Draft dan Schedule
- [x] **T-031.3** Schedule → Queue — dikerjakan lebih awal dari catatan "relevan setelah T-032": begitu CTA sidebar aktif, Schedule dari Home/Analyze meninggalkan pengguna tanpa jejak aksi, jadi destinasi ADR-054 dipakai walau layar Queue sendiri masih placeholder
- [ ] **T-031.4** Publish Now → History/Calendar (relevan setelah T-029 + T-034)

---

## Queue · Calendar · History

Ketiga screen ini masih placeholder "Scaffold — implementasi fitur di M8".

### T-032 · Queue management

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | publishing                                                   |
| **ADR**       | ADR-046                                                      |
| **Depends**   | T-028 ✅                                                      |
| **Baca dulu** | `04-ux/key-screen-patterns.md` · `05-architecture/domain-model.md` |

Model `PublishingQueueSlot` sudah ada di schema **tanpa service apapun**.

- [ ] **T-032.1** Putuskan semantik queue slot: apakah slot waktu berulang, atau sekadar urutan antrean → berpotensi butuh ADR
- [ ] **T-032.2** `PublishingService.listQueue` + repository
- [ ] **T-032.3** UI daftar antrean per akun/waktu
- [ ] **T-032.4** Aksi per item: edit jadwal, cancel (T-030), reorder

### T-033 · Calendar view

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | publishing                                                   |
| **ADR**       | ADR-023 (manual refresh, bukan realtime), ADR-046            |
| **Depends**   | T-028 ✅                                                      |
| **Baca dulu** | `04-ux/key-screen-patterns.md` · `05-architecture/realtime-strategy.md` |

Data kalender **tidak** realtime — pakai manual refresh (ADR-023 membatasi Realtime hanya untuk tabel `notifications`).

- [ ] **T-033.1** Query post per rentang tanggal + filter akun
- [ ] **T-033.2** Komponen kalender bulanan/mingguan (cek dulu apa yang tersedia di Astryx sebelum bikin sendiri)
- [ ] **T-033.3** Manual refresh control
- [ ] **T-033.4** Klik item → buka detail / Draft Editor

### T-034 · Publishing History + detail post

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | publishing                                                   |
| **ADR**       | ADR-046                                                      |
| **Depends**   | T-026 (status akhir datang dari webhook)                     |
| **Baca dulu** | `04-ux/key-screen-patterns.md`                                |

Route `/publish/history` dan `/publish/history/[postId]` sudah ada sebagai placeholder.

- [ ] **T-034.1** Query riwayat + status per target (published / error)
- [ ] **T-034.2** UI daftar riwayat + filter
- [ ] **T-034.3** Halaman detail post: hasil per akun, pesan error, link ke post asli
- [ ] **T-034.4** Aksi retry manual untuk target yang gagal

### T-035 · Delete Post + dialog konfirmasi

| Field         | Value                          |
| ------------- | ------------------------------ |
| **Status**    | ⏳ Not Started                  |
| **Domain**    | publishing                     |
| **ADR**       | ADR-049 (Tier 2)               |
| **Depends**   | T-022 ✅                        |
| **Baca dulu** | `04-ux/key-screen-patterns.md`  |

- [ ] **T-035.1** `PublishingService.deletePost` + aturan: post yang sudah published tidak dihapus dari platform
- [ ] **T-035.2** Dialog konfirmasi Tier 2
- [ ] **T-035.3** Aksi tersedia dari Drafts + Queue + History

---

## Notification

### T-036 · In-app notification + Supabase Realtime

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | notification                                                 |
| **ADR**       | ADR-023, ADR-030 (Supabase JWT)                              |
| **Depends**   | T-026 (sumber event notifikasi)                              |
| **Baca dulu** | `05-architecture/realtime-strategy.md` · `apps/web/src/lib/better-auth/supabase-jwt.ts` |

`Basic Notifications` berstatus **Should Have** di `mvp-definition.md` — ditempatkan di rilis ini karena hasil publish (`post.published` / `post.error`) tidak berguna tanpa cara memberi tahu pengguna. Domain `notification/` masih stub kosong; model `Notification` sudah ada di schema.

- [ ] **T-036.1** Domain skeleton: service + repository
- [ ] **T-036.2** Subscribe Supabase Realtime pada tabel `notifications`, event `INSERT`, filter per `user_id` — **hanya** tabel ini (ADR-023)
- [ ] **T-036.3** Sambungkan Supabase JWT dari session Better Auth (helper sudah ada, belum dipakai di route manapun)
- [ ] **T-036.4** UI notification bell di sidebar footer + panel daftar
- [ ] **T-036.5** Trigger notifikasi dari webhook publish result

---

## Developer Experience

### T-037 · Perkaya aturan coding di `context/ctx-development.md`

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | DX                                                           |
| **ADR**       | ADR-034                                                      |
| **Depends**   | —                                                            |
| **Baca dulu** | `06-engineering/dx-tooling.md` · `context/ctx-development.md` |

Berjalan **kontinu** selama rilis ini, bukan sekali selesai: setiap kali konvensi baru muncul dari praktik nyata (bukan teori), catat ke `ctx-development.md` supaya lapisan konteks yang dibaca setiap agent tidak menjadi basi. Prioritas rendah — tidak memblokir rilis.

- [ ] **T-037.1** Catat konvensi struktur repository: interface di `src/domains/*/repositories/`, implementasi Prisma di `src/lib/repositories/*/` — sudah konsisten di `workspace` + `publishing`, tapi belum tertulis sebagai aturan sehingga domain baru bisa menyimpang
- [ ] **T-037.2** Catat konvensi penempatan use-case terpisah dari service (preseden: `schedule-posts.use-case.ts`)
- [ ] **T-037.3** Catat konvensi test: service diuji dengan repository fake (preseden yang sudah ada di `publishing`/`workspace`)

---

## Catatan Rilis

* Ruang kosong v0.2 sebelumnya mencakup T-039, tapi nomor itu sudah dipakai untuk **T-039** (Migrasi Routing & Settings, ADR-076) di `tasks/v01-foundation.md`, bukan task v0.2 — lihat Catatan Rilis file tersebut. Tidak ada lagi ruang kosong tersisa untuk task v0.2 baru; task v0.2 berikutnya memakai nomor global berikutnya yang belum pernah dipakai (cek Indeks release di `TASKS.md`).
* **Definition of Done rilis ini** (dari `release-roadmap.md`): pengguna dapat mengelola proses publikasi dari awal hingga selesai — draft → format per akun → schedule/publish → lihat queue/calendar → lihat hasil di history.
