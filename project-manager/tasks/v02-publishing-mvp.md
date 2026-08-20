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
| **Status**    | ✅ Done                                                       |
| **Domain**    | publishing                                                   |
| **ADR**       | ADR-047, ADR-039, ADR-049, ADR-059, ADR-074                  |
| **Depends**   | T-025 (untuk jalur nyata — sementara tetap via `FakeOutstandAdapter`) |
| **Baca dulu** | `04-ux/key-screen-patterns.md` (KSP-05-F12) · `04-ux/user-flows.md` (UXP-04) · `02-product/roles-permissions.md` |

**Update 2026-08-18 — koreksi:** belum ada di kode (`grep publishNow` nol hasil di `src/`), tapi desainnya **sudah ada** di Claude Design (project "Social Media Management") — catatan lama di sini ("belum ada... maupun di App Prototype") salah dan sudah usang:
- Tombol "Publish Now" sudah ada di `templates/draft-editor.html`, berdampingan dengan "Save as Draft" dan "Schedule".
- Dialog Confirmation Summary varian Publish Now ("Konfirmasi & Publish") sudah wired interaktif di `templates/app-prototype/AppPrototype.dc.html` (`openPublishNowDialog`, `data-proto="draft-publishnow"`/`publishnow-confirm`), termasuk role switcher untuk visibility per role dan redirect ke Calendar/History setelah konfirmasi.
- Component pattern dialog-nya juga didokumentasikan di `components/dialog.html` (purpose=`form`, disebut eksplisit dipakai bersama Schedule).

Jadi T-029.4/.5/.6 di bawah **desainnya sudah tersedia** — sisa pekerjaan murni implementasi kode (Server Action + service + wiring ke komponen Astryx nyata), bukan menunggu desain baru.

- [x] **T-029.1** `PublishingService.publishNow()` — RBAC semua role (Owner/Admin/Creator, ADR-074)
- [x] **T-029.2** Validasi `ContentFormat` (ADR-039) sebelum panggil adapter
- [x] **T-029.3** Server Action + panggil `OutstandAdapter.publishNow`
- [x] **T-029.4** Tombol "Publish Now" di Draft Editor berdampingan dengan Schedule (KSP-05-F12) — desain sudah ada, tinggal implementasi komponen Astryx nyata
- [x] **T-029.5** Dialog Confirmation Summary varian Publish Now (UXP-04) — desain sudah ada di App Prototype, tinggal implementasi komponen Astryx nyata
- [x] **T-029.6** ~~Tambahkan tombolnya di App Prototype Claude Design~~ — sudah ada di App Prototype, task ini selesai dari sisi desain

**Selesai (2026-08-18):** `PublishNowUseCase` (`apps/web/src/domains/publishing/services/publish-now.use-case.ts`) mengikuti pola `SchedulePostsUseCase` (T-028/ADR-059) — RBAC eksplisit lewat `assertActorCanPublishNow` (`apps/web/src/domains/publishing/rbac.ts`, ADR-074: Owner/Admin/Creator) dijalankan fail-fast sebelum validasi `ContentFormat` (ADR-039), lalu persist dulu (`PublishingPostTarget` status `pending`, post → `Published`) sebelum panggil adapter per target — supaya tidak ada job Outstand yang orphan tanpa jejak DB. Server Action `publishNowAction` di `apps/web/src/app/(app)/components/draft-editor/actions.ts` memanggil use-case ini lewat `OutstandAdapter.publishNow`, yang jalur produksinya masih `FakeOutstandAdapter` (pola ADR-059, T-025 real adapter belum ada — KI-003). UI Draft Editor (`apps/web/src/app/(app)/components/draft-editor/Modal.tsx`) menambahkan tombol "Publish Now" berdampingan Schedule + dialog Confirmation Summary varian Publish Now, dan redirect ke Publish/Calendar setelah konfirmasi (menutup T-031.4). Sebagai bagian commit yang sama, Schedule Picker Draft Editor dirapikan menyamai mockup (heading tunggal "Jadwal", placeholder Bahasa Indonesia, ikon kalender/jam dipindah ke kanan via Tailwind `flex-row-reverse`) dan dot indicator ditambahkan ke Badge status — dua temuan dari pekerjaan ini dicatat sebagai **KI-029** (xstyle Astryx belum bisa dipakai) dan **KI-030** (TimeInput Astryx tidak membatasi input real-time) di `PROJECT_STATE.md`. Diverifikasi: `tsc --noEmit` bersih, Vitest suite terkait lulus (`publish-now.use-case.test.ts`, `fake-outstand-adapter.test.ts`, dst), end-to-end browser (New Post → Publish Now → Confirmation Summary → redirect → data DB `published`).

### T-030 · Cancel Schedule + dialog konfirmasi

| Field         | Value                                            |
| ------------- | ------------------------------------------------ |
| **Status**    | ⏳ Not Started                                    |
| **Domain**    | publishing                                       |
| **ADR**       | ADR-049 (Tier 2)                                 |
| **Depends**   | T-028 ✅, T-032 (aksi dipicu dari Queue), T-033 (aksi dipicu dari Calendar) |
| **Baca dulu** | `04-ux/key-screen-patterns.md`                    |

- [ ] **T-030.1** `PublishingService.cancelSchedule` + batalkan di Outstand (T-025)
- [ ] **T-030.2** Dialog konfirmasi Tier 2 — referensi copy & interaksi sudah ada di prototipe Claude Design (`openCancelScheduleDialog`/`applyCancelSchedule`, `templates/app-prototype/AppPrototype.dc.html`, dibuat via T-032.0 2026-08-19): warning "Post kembali menjadi Draft dan tidak akan dipublikasikan otomatis" + tombol `btn-danger` "Batalkan Jadwal" — tinggal diimplementasikan sebagai Dialog Astryx nyata, bukan didesain dari nol
- [ ] **T-030.3** Aksi tersedia dari Queue (tombol icon merah `.icon-btn-danger` per row, desain final T-032.0) + Calendar

### T-031 · Redirect otomatis ke sub-screen tujuan setelah aksi terminal

| Field         | Value                                                    |
| ------------- | -------------------------------------------------------- |
| **Status**    | ✅ Done                                                   |
| **Domain**    | UI                                                       |
| **ADR**       | ADR-054                                                  |
| **Depends**   | T-029 ✅, T-032, T-034                                    |
| **Baca dulu** | `04-ux/navigation-patterns.md`                            |

Bukan task besar berdiri sendiri — cukup diselaraskan saat task tujuannya dikerjakan.

- [x] **T-031.1** Save as Draft → Drafts (sudah sejalan dengan alur existing)
- [x] **T-031.2** Pastikan tetap konsisten begitu CTA sidebar (T-011) aktif dari section manapun — `finishTerminalAction` di `_draft-editor/modal.tsx` menutup editor lalu mengarahkan ke tujuan, dipakai seragam oleh Save as Draft dan Schedule
- [x] **T-031.3** Schedule → Queue — dikerjakan lebih awal dari catatan "relevan setelah T-032": begitu CTA sidebar aktif, Schedule dari Home/Analyze meninggalkan pengguna tanpa jejak aksi, jadi destinasi ADR-054 dipakai walau layar Queue sendiri masih placeholder
- [x] **T-031.4** Publish Now → History/Calendar — ditutup bersamaan T-029 (2026-08-18), `finishTerminalAction` dipakai seragam untuk redirect setelah konfirmasi Publish Now

---

## Queue · Calendar · History

Ketiga screen ini masih placeholder "Scaffold — implementasi fitur di M8".

### T-032 · Queue management

| Field         | Value                                                        |
| ------------- | ------------------------------------------------------------ |
| **Status**    | ⏳ Not Started                                                |
| **Domain**    | publishing                                                   |
| **ADR**       | ADR-046, ADR-083                                             |
| **Depends**   | T-028 ✅                                                      |
| **Baca dulu** | `04-ux/key-screen-patterns.md` (KSP-03, amandemen ADR-083) · `05-architecture/domain-model.md` (entity `QueueSlot` sudah dihapus dari baseline) |

Model Prisma `PublishingQueueSlot` sudah ada di schema **tanpa service apapun** — **jangan dipakai** untuk implementasi T-032.2 (ADR-083 menganggapnya deprecated, Queue dihitung langsung dari `PublishingPost`/`PublishingPostTarget`).

- [x] **T-032.0** Selaraskan Design System halaman Queue (`templates/publish-queue.html`, Claude Design) dengan referensi UX Buffer — **Done 2026-08-19**, dikerjakan 2 putaran di sesi yang sama:

  **Putaran 1 — adopsi elemen Buffer yang tidak butuh ADR/fitur baru** (King Rezi menunjukkan screenshot `publish.buffer.com/schedule`): grouping post per tanggal, urutan murni ascending waktu publish (tombol reorder ↑/↓ dihapus total — closes T-032.1), tampilkan "Dibuat X menit/jam lalu" per post. **Sengaja tidak diadopsi** (di luar scope, butuh ADR atau fitur baru yang tidak ada di backlog manapun): toggle List/Calendar menggantikan tab (ADR IA), tab "Approvals" + badge count (fitur approval workflow tidak ada di `roles-permissions.md`), filter "Tags" (tidak ada konsep tag di domain model), filter "Timezone" (tidak ada setting ini di backlog), badge count "Sent 2K".

  **Putaran 2 — revisi detail layout & aksi** (King Rezi review ulang, 9 poin, dieksekusi setelah 2 klarifikasi AskUserQuestion): filter channel dipindah ke baris terpisah di bawah tabbar, rata kanan, dipersempit (`max-width:180px`); tombol **New Post** pindah ke baris judul (`justify-content:space-between` dengan title+subtitle, memanfaatkan `.page-head` yang sudah flex-between); **1 card Astryx per schedule** (bukan 1 card menaungi seluruh list — tiap `.queue-row` sekarang dibungkus `.card.card-pad.queue-card` sendiri); status chip (Scheduled/Failed/Ready to Schedule) **dihapus total** (tidak relevan untuk halaman ini — confirmed by King Rezi); dropdown "More options (⋮)" dari putaran 1 **dihapus**, diganti **3 tombol icon eksplisit**: Publish Now, Edit, **Cancel Schedule** (icon merah, class `.icon-btn-danger`, 1 tombol saja — bukan Cancel Schedule + Delete terpisah, confirmed via AskUserQuestion); heading tanggal dirapikan (nama bulan lengkap "14 Juli" bukan "14 Jul", semibold, border-bottom pemisah).

  **Interaksi diwire nyata di prototipe** (`templates/app-prototype/AppPrototype.dc.html`, bukan cuma visual statis): tombol Publish Now → reuse `openPublishNowDialog` (dialog Confirmation Summary yang sama dengan Draft Editor, T-029); tombol Edit → reuse `triggerEditDraft` (buka modal Edit Draft yang sudah ada); tombol Cancel Schedule → dialog konfirmasi baru `openCancelScheduleDialog`/`applyCancelSchedule` (pola sama `openDisconnectDialog`: warning + tombol `btn-danger`, menghapus card dari Queue + toast "Jadwal dibatalkan — post kembali ke Drafts" — desain interaksi untuk T-030). Dead code `reorder-up`/`reorder-down` di `route()` sekalian dibersihkan (tombolnya sudah tidak ada sejak putaran 1). Kedua file diverifikasi baca-ulang dari remote setelah tiap `write_files` (scope-discipline skill poin 6) — tidak ada drift/perubahan King Rezi yang tertimpa.
- [x] **T-032.1** ~~Putuskan semantik queue slot~~ — **Resolved 2026-08-19**: queue murni urutan waktu publish (ascending), tanpa reorder manual, mengikuti referensi UX Buffer (lihat T-032.0). Tidak perlu ADR (bukan perubahan baseline, cuma keputusan implementasi UI yang sebelumnya terbuka)
- [ ] **T-032.2** `PublishingService.listQueue` + repository — query `PublishingPost`/`PublishingPostTarget` status `Scheduled` langsung, grouped by tanggal, urutan murni `scheduledAt` ascending. **Jangan pakai model Prisma `PublishingQueueSlot`** (ADR-083: dianggap deprecated)
- [ ] **T-032.3** UI daftar antrean per akun/waktu — implementasi Astryx nyata dari mockup final T-032.0 (`apps/web`): grouping per tanggal, 1 Card per schedule, tanpa status chip
- [ ] **T-032.4** Aksi per item: **Publish Now, Edit, Cancel Schedule** — 3 tombol icon eksplisit langsung di row (bukan dropdown More options, desain final T-032.0). Cancel Schedule = implementasi nyata T-030 di `apps/web`, copy dialog konfirmasi mengikuti referensi prototipe `openCancelScheduleDialog`. **Reorder dihapus dari scope** (lihat T-032.0/.1)
- [ ] **T-032.5** Migration drop model Prisma `PublishingQueueSlot` + tabel `publishing_queue_slots` (ADR-083) — **cek dulu** `apps/web/src/lib/repositories/workspace/workspace.repository.delete-cascade.test.ts` (baris 81, 129, masih memakai `tx.publishingQueueSlot`/`prisma.publishingQueueSlot` untuk test cascade-delete T-008.2), sesuaikan/hapus assertion itu dulu sebelum migration dijalankan. Bukan bagian T-032.2 — subtask sendiri supaya tidak keliru dianggap selesai begitu `listQueue` jalan

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
