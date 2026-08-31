# TASKS — Backlog Berjenjang

Rencana pengerjaan project dari fondasi sampai Public Launch, dikelompokkan per **release** dan dipecah jadi **task → subtask**.

Dokumen ini adalah **indeks**. Detail task ada di `tasks/`.

---

## Cara pakai (AI — baca ini dulu)

1. Baca **indeks di halaman ini** untuk tahu release aktif dan ID task yang relevan.
2. Buka **hanya satu file** `tasks/vXX-*.md` yang memuat task itu. Jangan menyapu seluruh folder `tasks/`.
3. Buka dokumen yang disebut di field **Baca dulu** pada task tersebut — itu daftar bacaan minimal yang sudah dikurasi, jadi tidak perlu menebak atau menyisir `product-discovery/`.
4. **Kalau task ini scope implementasi kode:** cek field **Domain** terhadap pemetaan Domain → Subagent di [`.claude/agents/README.md`](../.claude/agents/README.md) sebelum eksekusi — evaluasi delegasi, termasuk kemungkinan menjalankan beberapa subagent paralel kalau ada task/subtask independen (ADR-063). Jangan default mengerjakan sendiri tanpa mengevaluasi ini.
5. Setelah task selesai: ubah status di file release **dan** perbarui hitungan di indeks ini.

Untuk mode percakapan aktif, Known Issues, dan Blockers → tetap ke [`PROJECT_STATE.md`](PROJECT_STATE.md).

**Peta release ↔ milestone.** Backlog memakai release `v0.x`, `PROJECT_STATE.md` memakai milestone `M0–M9`. Pemetaannya:

| Milestone                | Release yang membentuknya | Status milestone |
| ------------------------ | ------------------------- | ---------------- |
| **M8** — Development     | v0.1 · v0.2 · v0.3 · v0.4 · v0.5 · v0.6 | aktif sekarang |
| **M9** — Testing & Release | v1.0                    | belum mulai      |

Ini penting untuk aturan `PROJECT_RULES.md` "Hindari implementasi fitur di luar ruang lingkup milestone" dan `Active Conversation Mode` yang hanya mengizinkan "Feature Implementation (M8)": **seluruh v0.1–v0.6 berada di dalam M8**, jadi task di rilis manapun dari v0.1 sampai v0.6 tidak melanggar scope milestone aktif. Yang di luar M8 hanya v1.0 (M9). Urutan pengerjaan tetap diatur oleh indeks release + `Depends`, bukan oleh milestone.

---

## Legend status

| Simbol | Arti           | Keterangan                                                        |
| ------ | -------------- | ----------------------------------------------------------------- |
| ⏳      | Not Started    | Belum disentuh.                                                   |
| 🟡      | In Progress    | Sudah dimulai, sebagian subtask selesai.                          |
| ✅      | Done           | Selesai dan terverifikasi (lolos QA/review bila fitur berdampak). |
| 🚫      | Blocked        | Tidak bisa jalan karena dependency eksternal. Alasan wajib ditulis di field **Blocker**. |
| ⏸️      | Deferred       | Sengaja ditunda ke release lain. Alasan wajib ditulis.            |

---

## Aturan ID

* **Task:** `T-001` … `T-089`, nomor global berurutan. ID **tidak** memuat kode release, supaya task bisa berpindah antar release tanpa penomoran ulang dan tanpa membuat referensi lama jadi salah.
* **Subtask:** `T-021.4` — nomor task diikuti nomor urut subtask.
* ID **tidak pernah didaur ulang**. Task yang dibatalkan ditandai `⏸️ Deferred` beserta alasannya, bukan dihapus.
* Setiap release menyisakan beberapa nomor kosong di akhir sebagai ruang tumbuh (per 2026-08-12: T-046–T-049 untuk v0.3, T-056–T-059 untuk v0.4, T-066–T-069 untuk v0.5, T-075–T-079 untuk v0.6 — v0.1/v0.2 sudah habis, lihat catatan kaki ¹).

---

## Indeks release

| Release                    | Fokus                                              | Rentang ID  | Task | Status              | File                                                 |
| -------------------------- | -------------------------------------------------- | ----------- | ---- | ------------------- | ---------------------------------------------------- |
| **v0.1** Foundation        | Setup, Auth, Workspace, Connect Account, Settings  | T-001–T-019, T-039¹, T-089¹, T-093¹, T-094¹ | 23   | 🟡 12 ✅ · 1 🚫 · 7 🟡 · 1 ⏸️ · 2 ⏳ | [tasks/v01-foundation.md](tasks/v01-foundation.md)         |
| **v0.2** Publishing MVP    | Draft, Format, Schedule, Queue, Calendar, History  | T-020–T-038, T-090¹–T-092¹ | 22   | 🟡 9 ✅ · 1 🟡 · 12 ⏳ | [tasks/v02-publishing-mvp.md](tasks/v02-publishing-mvp.md) |
| **v0.3** Analytics MVP     | Dashboard, Metrics, Engagement Summary, Reports    | T-040–T-045 | 6    | 🟡 3 ✅ · 3 ⏳       | [tasks/v03-analytics-mvp.md](tasks/v03-analytics-mvp.md)   |
| **v0.4** Engagement MVP    | Comment sync 30 menit, Inbox, Reply                | T-050–T-055 | 6    | ⏳ 0 / 6             | [tasks/v04-engagement-mvp.md](tasks/v04-engagement-mvp.md) |
| **v0.5** AI Assistant MVP  | Caption generation, improvement, rewrite           | T-060–T-065 | 6    | ⏳ 0 / 6             | [tasks/v05-ai-assistant-mvp.md](tasks/v05-ai-assistant-mvp.md) |
| **v0.6** Start Page MVP    | Public profile, Link management, Theme             | T-070–T-074 | 5    | ⏳ 0 / 5             | [tasks/v06-start-page-mvp.md](tasks/v06-start-page-mvp.md) |
| **v1.0** Public Launch     | Stabilitas, Performance, Security, Docs            | T-080–T-088 | 9    | ⏳ 0 / 9             | [tasks/v10-public-launch.md](tasks/v10-public-launch.md)   |

**Total:** 77 task · 24 selesai · 173 subtask terdefinisi (v0.1–v0.3).

> **Update (2026-08-28, ADR-095):** King Rezi menyelesaikan inisiatif "codify coding discipline" — 2 dokumen baseline baru (`rendering-strategy.md`, `code-conventions.md`), penguncian skala Spacing di `design-tokens.md`, dan 3 rule ESLint enforcement. Ditulis sebagai **T-094** (4 subtask, 3 sudah selesai + 1 dibiarkan terbuka: cleanup `app/(app)/page.tsx` dashboard, KI-036) di `tasks/v01-foundation.md`, sibling T-001/T-002 (Project Setup) karena sifatnya tooling/dokumentasi, bukan fitur produk baru — domain `platform/tooling`. Nomor kosong v0.1 sudah habis sejak T-039/T-089/T-093, jadi memakai ID global berikutnya yang belum pernah dipakai (094), pola sama seperti task-task itu. Task ditutup `✅ Done` (scope dokumentasi + ESLint sudah terverifikasi 0 error lint/typecheck, 209 test passed/3 skipped) — 1 subtask terbuka tidak memblokir penutupan karena di luar scope ADR-095. Task naik 76 → **77**, task selesai naik 23 → **24**, subtask naik 169 → **173** (v0.1: 22 → 23 task, 11 ✅ → **12 ✅**, subtask 63 → 67). Dihitung ulang langsung dari `tasks/v01-foundation.md` (bukan increment manual), sesuai aturan maintenance.
>
> **Update lanjutan #2 (2026-08-28):** King Rezi mengoreksi rantai dependency Realtime — sebelum T-036 bisa diverifikasi/dipakai penuh (butuh ≥2 akun nyata di satu workspace), invite-to-membership harus utuh dulu. Ditemukan halaman accept-invite (`/invite/[token]`) **belum pernah dibuat** (gap yang sudah dicatat sejak ADR-080 2026-08-14, tapi belum pernah diberi nomor task). Ditambahkan **T-093 · Accept Invite page** (4 subtask: route + validasi token, buat akun/login, insert `workspace_members` dengan role dari invitation, verifikasi RBAC end-to-end 2-akun) di `tasks/v01-foundation.md`, ID global berikutnya (pola sama T-039/T-089/T-090/T-091/T-092). **T-036** (`tasks/v02-publishing-mvp.md`) dependency-nya ditambah `T-093`. Rantai lengkap sekarang: **T-093 (invite+role) → T-036 (notification bell) → T-092 (Realtime 4 screen)**. Task naik 75 → **76**, subtask naik 165 → **169** (v0.1: 21 → 22 task, breakdown 11 ✅ · 1 🚫 · 6 🟡 · 1 ⏸️ · **3 ⏳**).
>
> **Update lanjutan (2026-08-28, ADR-094):** task implementasi **T-092** (Realtime Calendar/Queue/Drafts/History, 6 subtask) ditulis ke `tasks/v02-publishing-mvp.md` — `Depends: T-036` (hard dependency, lihat ADR-094 poin 4) dan T-034 khusus subtask History (T-092.6). Nomor kosong v0.2 sudah habis, memakai ID global berikutnya (092) sama seperti T-090/T-091. Task naik 74 → **75**, subtask naik 159 → **165** (v0.2: 21 → 22 task, breakdown 9 ✅ · 1 🟡 · **12 ⏳**).
>
> **Update (2026-08-28, ADR-094):** **T-033** (Calendar view) ditutup `✅ Done` — T-033.7 (manual refresh control) dibatalkan total (bukan ditunda) setelah ADR-094 (perluasan Supabase Realtime ke `publishing_posts`) direncanakan; King Rezi memutuskan tidak perlu tombol refresh manual berdiri sendiri, sinkronisasi Calendar akan ditangani Realtime begitu task dari ADR-094 diimplementasikan. Detail: Catatan Rilis `tasks/v02-publishing-mvp.md` § T-033. Task selesai naik 22 → **23**; breakdown v0.2 dikoreksi jadi **9 ✅ · 1 🟡 · 11 ⏳** (T-030 tetap satu-satunya 🟡).
>
> **Update (2026-08-28, ADR-093):** dua task baru ditambahkan ke v0.2 — **T-090** (Import Posts dari Social Account, status `Imported` read-only, 5 subtask) dan **T-091** (Post `Published`/`Failed` jadi read-only, bug-fix terpisah ditemukan di sesi yang sama, 2 subtask). Nomor kosong v0.2 (T-020–T-038) sudah habis sejak T-039 dipinjam v0.1, jadi keduanya memakai nomor global berikutnya yang belum pernah dipakai (090, 091), pola sama T-039/T-089 — lihat Catatan Rilis `tasks/v02-publishing-mvp.md`. Task naik 72 → **74**, subtask naik 152 → **159** (v0.2: 19 → 21 task). Sekaligus dikoreksi drift breakdown status v0.2 yang sebelumnya "8 ✅ · 1 🟡 · 10 ⏳" (seharusnya 2 🟡 — T-030 dan T-033 keduanya In Progress — bukan 1) menjadi **8 ✅ · 2 🟡 · 11 ⏳**, dihitung ulang langsung dari `tasks/v02-publishing-mvp.md`.
>
> **Koreksi hitungan (2026-08-24):** breakdown status v0.1 di atas sebelumnya "11 ✅ · 5 🟡" — sudah tidak cocok dengan `tasks/v01-foundation.md` aktual (10 ✅ · 6 🟡, sebelum T-089 ditambah) sejak entah kapan drift terjadi. Dihitung ulang langsung dari file saat menambah T-089 (bukan increment manual di atas angka lama yang sudah salah), sesuai aturan maintenance di bawah. **Update sesi ini (2026-08-24):** T-089 (T-089.2/.3/.4 diimplementasikan, lolos review Ridwan + QA Najwa) ditutup `✅ Done` → v0.1 jadi 11 ✅ · 1 🚫 · 6 🟡 · 1 ⏸️ · 2 ⏳, total keseluruhan jadi 22 selesai. Dihitung ulang langsung dari `tasks/v01-foundation.md` (bukan increment manual), sesuai aturan yang sama. **Update lanjutan sesi ini (2026-08-24, ADR-089):** T-089 mendapat subtask baru **T-089.6** (dialog konfirmasi Tier 2 sebelum switch workspace) — hitungan subtask dihitung ulang langsung dari `tasks/v01-foundation.md` (bukan increment manual): total naik dari 147 jadi **148** (v0.1: 58 → 59 subtask). Task-level tetap 22 selesai (T-089 sudah `✅ Done` sebelumnya, subtask baru ini tidak mengubah status task). **Update (2026-08-26, ADR-090):** T-033 (Calendar view, belum dikerjakan) dipecah dari 4 jadi 8 subtask setelah sesi perencanaan UX Buffer (Popover, query param view/date, filter status+channel, grid week/month terpisah) — total naik dari 148 jadi **152** (v0.2: subtask T-033 4 → 8). Dihitung ulang langsung dari `tasks/v02-publishing-mvp.md`, bukan increment manual. Task-level v0.2 tidak berubah (T-033 tetap ⏳ Not Started). **Koreksi (2026-08-26, ADR-091):** komponen semula ditulis "HoverCard", diperbaiki jadi **Popover** setelah verifikasi `astryx component --dense` (HoverCard trigger-nya hover/focus, bukan klik, dan tidak boleh berisi critical action) — tidak mengubah jumlah subtask (tetap 8, tetap 152 total). **Update (2026-08-31, ADR-096):** **T-093** (Accept Invite page) — T-093.1–.3 diimplementasikan dan lolos review arsitektur Ridwan (2 temuan security RLS sudah diperbaiki). T-093.4 sebagian: 17 unit test service-level + 1 integration test DB real sudah ditulis, tapi verifikasi RBAC end-to-end 2-akun browser nyata **belum dilakukan** (dicatat **KI-038** untuk Najwa QA Engineer) — task tetap `🟡 In Progress`, belum ditutup `✅ Done`. 3 migrasi RLS baru (pola SECURITY DEFINER + session-variable GUC untuk operasi pra-membership) dicatat sebagai **ADR-096**. Breakdown v0.1 berubah dari "12 ✅ · 1 🚫 · 6 🟡 · 1 ⏸️ · 3 ⏳" menjadi **12 ✅ · 1 🚫 · 7 🟡 · 1 ⏸️ · 2 ⏳** (T-093 pindah dari ⏳ ke 🟡). Jumlah task/subtask total tidak berubah (77 task, 173 subtask) — hanya status yang berubah. Dihitung ulang langsung dari `tasks/v01-foundation.md`, sesuai aturan maintenance.

¹ **T-039** ID-nya dipinjam dari rentang v0.2 (bukan urutan lanjutan v0.1) — nomor kosong v0.1 sudah habis, jadi diambil ID global berikutnya yang belum pernah dipakai. Lihat Catatan Rilis di `tasks/v01-foundation.md` dan `tasks/v02-publishing-mvp.md` untuk detailnya. **T-089** (Workspace Switcher, ADR-088) memakai pola serupa — ID global berikutnya yang belum pernah dipakai sama sekali (rentang v1.0 T-080–T-088 sudah habis terisi), ditempatkan di file v0.1 karena lahir sebagai amandemen ADR-076/T-039. Detail: Catatan Rilis `tasks/v01-foundation.md`. **T-090**/**T-091** (Import Posts + read-only enforcement, ADR-093) memakai pola yang sama lagi — nomor kosong v0.2 (T-020–T-038) sudah habis, jadi keduanya memakai ID global berikutnya yang belum pernah dipakai. **T-092** (Realtime Calendar/Queue/Drafts/History, ADR-094) memakai pola yang sama sekali lagi, ID global berikutnya setelah T-091. **T-093** (Accept Invite page) memakai pola yang sama untuk v0.1 — nomor kosong v0.1 sudah habis sejak T-039/T-089, jadi memakai ID global berikutnya setelah T-092, ditempatkan di `tasks/v01-foundation.md` karena domain `workspace`/invite. **T-094** (Baseline Rendering Strategy, Code Conventions, Spacing Scale + ESLint Enforcement, ADR-095) memakai pola yang sama sekali lagi — ID global berikutnya setelah T-093, ditempatkan di `tasks/v01-foundation.md` sibling T-001/T-002 karena domain `platform/tooling`. Detail: Catatan Rilis di masing-masing file release.

Urutan release mengikuti [`release-roadmap.md`](../product-discovery/02-product/release-roadmap.md). Perubahan urutan atau ruang lingkup release wajib lewat ADR.

> ⚠️ **v0.1 dan v0.2 tidak sepenuhnya sekuensial.** Tiga task v0.1 (T-013, T-015, T-016) punya subtask yang bergantung pada task v0.2 (T-025, T-026, T-036 + domain publishing), jadi v0.1 tidak bisa ditutup sebelum v0.2 berjalan. T-012 sudah ✅ Done (2026-08-12), tidak lagi bagian dari daftar ini. Rinciannya di Catatan Rilis [`tasks/v01-foundation.md`](tasks/v01-foundation.md).

---

## Kedalaman perencanaan (rolling wave)

| Release       | Kedalaman                                                                    |
| ------------- | ---------------------------------------------------------------------------- |
| v0.1 – v0.3   | **Detail penuh** — task + subtask siap dikerjakan.                            |
| v0.4 – v1.0   | **Task-level saja** — ID dan cakupan sudah dikunci, subtask sengaja belum diisi. |

Subtask untuk v0.4 ke atas diisi saat release-nya mendekat. Alasannya: menyusunnya sekarang berarti menebak detail teknis tanpa desain atau ADR pendukung — hasilnya hampir pasti direvisi, dan backlog yang isinya banyak tebakan lebih berbahaya daripada backlog yang jujur mengatakan "belum dirinci".

---

## Fokus sekarang

**Ini satu-satunya daftar fokus.** `PROJECT_STATE.md` hanya menyalin ID-nya di Snapshot dan menunjuk ke sini — jangan menulis daftar fokus versi ketiga di manapun. Kalau daftar ini berubah, perbarui juga baris `Top Next Tasks` di Snapshot `PROJECT_STATE.md` (hanya ID + judul singkat).

| ID        | Task                                            | Status | Catatan                                              |
| --------- | ----------------------------------------------- | ------ | ---------------------------------------------------- |
| **T-025** | Real OutstandAdapter                            | ⏳      | Rantai blocker terbesar — lihat di bawah. **Terhenti**: butuh `OUTSTAND_API_KEY`/`OUTSTAND_WEBHOOK_SECRET` asli (KI-003, `PROJECT_STATE.md` § Blockers), belum bisa dikerjakan sampai kredensial tersedia |
| **T-093** | Accept Invite page                              | 🟡      | Root rantai baru (2026-08-28): **T-093 → T-036 → T-092**. Implementasi T-093.1–.3 selesai (2026-08-31), lolos review Ridwan. T-093.4 sebagian — sisa: verifikasi RBAC end-to-end 2-akun browser nyata (**KI-038**), baru itu T-036 bisa diverifikasi/dipakai dengan ≥2 akun nyata di satu workspace |

> **T-033** (Calendar view) sudah ✅ **Done** (2026-08-28), branch
> `feature/calendar-design-system`. Sesi 2026-08-26 menuntaskan
> **perencanaan UX + Design System**: dipecah jadi 8 subtask (T-033.1–.8)
> mengikuti referensi Buffer + **ADR-090/ADR-091** (klik item → Popover
> Astryx sebelum Draft Editor, khusus Calendar), Claude Design sudah punya
> mockup lengkap, dan Design Review King Rezi sudah selesai (tidak ada
> revisi tersisa). Sesi implementasi 2026-08-27 menutup **T-033.1–.6**
> (query rentang tanggal, state via query param, grid Week, grid Month,
> navigasi periode Today/‹/›/toggle, filter status+akun — data asli,
> lolos review Ridwan + QA Najwa) dan **T-033.8** (Popover ringkasan post +
> metrik Published + CTA buka Draft Editor, sesi terpisah, lolos review
> Ridwan + QA Najwa). **T-033.7** (manual refresh) — sempat blocked (tidak
> ada rancangan di Claude Design), lalu **dibatalkan total** (2026-08-28)
> setelah ADR-094 (perluasan Supabase Realtime ke `publishing_posts`)
> direncanakan; Calendar untuk saat ini tetap manual-refresh apa adanya
> (tanpa tombol eksplisit) sampai task dari ADR-094 diimplementasikan.
> Detail: `tasks/v02-publishing-mvp.md` § T-033.

> **T-032** (Queue management) sudah ✅ **Done** (2026-08-20) — listQueue dari data asli (bukan `PublishingQueueSlot`, ADR-083), UI Astryx nyata, 3 aksi (Publish Now/Edit/Cancel Schedule). Menutup sebagian besar **T-030** (Cancel Schedule) untuk konteks Queue — sisa scope Calendar masih di T-033. Detail: `tasks/v02-publishing-mvp.md` § T-032.

> **T-029** (Publish Now) sudah ✅ **Done** (2026-08-18) — via `FakeOutstandAdapter` (ADR-059), jalur nyata tetap menunggu T-025. Detail: `tasks/v02-publishing-mvp.md` § T-029.

> **T-012** (Sidebar "Channels") sudah ✅ **Done** (2026-08-12) — seluruh subtask termasuk T-012.1/2 selesai, lolos review Ridwan + QA Najwa. Detail: `tasks/v01-foundation.md` § T-012.

> **T-089** (Workspace Switcher deliberate, ADR-088) sudah ✅ **Done** (2026-08-24) — seluruh subtask T-089.1–.5 selesai, lolos review Ridwan + QA Najwa; **T-089.6** ditambah sesi yang sama (dialog konfirmasi Tier 2 sebelum switch, ADR-089) — sudah lewat QA Najwa formal, KI-034 Resolved 2026-08-24. Detail: `tasks/v01-foundation.md` § T-089.

**Rantai blocker terbesar:** T-025 (Real OutstandAdapter) → T-026 (webhook) → T-027 (job runner). Ketiganya mengunci sebagian besar v0.2, seluruh v0.3, dan seluruh v0.4. Menyelesaikan T-025 membuka lebih banyak pekerjaan daripada task lain manapun.

---

## Keputusan terbuka

Task yang **menghasilkan ADR**, bukan sekadar mengikuti ADR. Semuanya menunggu keputusan King Rezi:

| Task      | Keputusan yang belum diambil                              | Menghambat                     |
| --------- | --------------------------------------------------------- | ------------------------------ |
| **T-005** | Transactional email provider (AS-D04)                     | Email verification; invite member T-007.7 (jalur "Kirim via Email") — T-007.1 "Copy Link" (ADR-080) tidak terhambat |
| **T-060** | Provider + model AI                                       | Seluruh v0.5                   |
| **T-070** | Strategi route publik tanpa auth (+ custom domain?)       | Seluruh v0.6                   |
| **T-081** | Framework E2E test                                        | Verifikasi golden path         |
| **T-086** | Tool observability / monitoring                           | Visibilitas kegagalan job      |
| —         | **Billing** belum muncul di release manapun               | Belum masuk backlog sama sekali |

---

## Aturan maintenance

* **Status task hidup di sini dan di `tasks/*.md`** — pengecualian resmi terhadap aturan "status hanya di `PROJECT_STATE.md`" (ADR-062). Yang tetap eksklusif milik `PROJECT_STATE.md`: phase, milestone (M0–M9), overall progress, Active Conversation Mode, Known Issues, dan Blockers.
* Hitungan di **Indeks release** dan **Total** adalah angka turunan. Saat status sebuah task berubah, perbarui file release **dan** baris indeksnya dalam perubahan yang sama — kalau tidak, angka di sini jadi bohong.
* **Jangan** menyalin detail task ke `PROJECT_STATE.md`. `PROJECT_STATE.md` hanya menyebut **ID + judul singkat** dan menunjuk ke sini.
* Task baru ditambahkan memakai nomor kosong di release yang bersangkutan. Kalau nomor kosongnya habis, ambil nomor berikutnya yang belum pernah dipakai secara global — jangan menggeser ID yang sudah ada.
* Menambah/memindahkan **release** atau mengubah ruang lingkupnya → wajib ADR (`release-roadmap.md` adalah baseline).
* Task yang selesai tetap tinggal di file release-nya sebagai jejak ringkas (satu paragraf, tanpa checklist subtask). Riwayat lengkap per sesi kerja tetap di `COMPLETE_TASK.md`.

---

## Related Documents

* [PROJECT_STATE.md](PROJECT_STATE.md) — phase, milestone, Known Issues, Blockers
* [PROJECT_RULES.md](PROJECT_RULES.md) — klasifikasi dokumen & governance
* [DECISIONS.md](DECISIONS.md) — indeks ADR
* [../product-discovery/02-product/release-roadmap.md](../product-discovery/02-product/release-roadmap.md) — baseline urutan release
* [../product-discovery/02-product/mvp-definition.md](../product-discovery/02-product/mvp-definition.md) — batas MVP
* [../product-discovery/02-product/feature-priority.md](../product-discovery/02-product/feature-priority.md) — MoSCoW per fitur
