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
| **M8** — Development     | v0.1 · v0.2 · v0.3 · v0.4 · v0.5 · v0.6 · v0.7 | aktif sekarang |
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
| **v0.1** Foundation        | Setup, Auth, Workspace, Connect Account, Settings  | T-001–T-019, T-039¹, T-089¹, T-093¹, T-094¹ | 23   | 🟡 13 ✅ · 1 🚫 · 6 🟡 · 1 ⏸️ · 2 ⏳ | [tasks/v01-foundation.md](tasks/v01-foundation.md)         |
| **v0.2** Publishing MVP    | Draft, Format, Schedule, Queue, Calendar, History  | T-020–T-038, T-090¹–T-092¹ | 22   | 🟡 9 ✅ · 2 🟡 · 11 ⏳ | [tasks/v02-publishing-mvp.md](tasks/v02-publishing-mvp.md) |
| **v0.3** Analytics MVP     | Dashboard, Metrics, Engagement Summary, Reports    | T-040–T-045 | 6    | 🟡 3 ✅ · 3 ⏳       | [tasks/v03-analytics-mvp.md](tasks/v03-analytics-mvp.md)   |
| **v0.4** Engagement MVP    | Comment sync 30 menit, Inbox, Reply                | T-050–T-055 | 6    | ⏳ 0 / 6             | [tasks/v04-engagement-mvp.md](tasks/v04-engagement-mvp.md) |
| **v0.5** AI Assistant MVP  | Caption generation, improvement, rewrite           | T-060–T-065 | 6    | ⏳ 0 / 6             | [tasks/v05-ai-assistant-mvp.md](tasks/v05-ai-assistant-mvp.md) |
| **v0.6** Start Page MVP    | Public profile, Link management, Theme             | T-070–T-074 | 5    | ⏳ 0 / 5             | [tasks/v06-start-page-mvp.md](tasks/v06-start-page-mvp.md) |
| **v1.0** Public Launch     | Stabilitas, Performance, Security, Docs            | T-080–T-088 | 9    | ⏳ 0 / 9             | [tasks/v10-public-launch.md](tasks/v10-public-launch.md)   |
| **v0.7** Migrasi Astryx → shadcn/ui | Cross-cutting: ganti fondasi UI component system (ADR-097) | T-095–T-102 | 8    | 8 ✅          | [tasks/v07-astryx-shadcn-migration.md](tasks/v07-astryx-shadcn-migration.md) |

**Total:** 85 task · 33 selesai · 211 subtask terdefinisi (v0.1–v0.3, v0.7).

> **Update (2026-09-04, T-102.5 tuntas — T-102 Done, rilis v0.7 selesai
> 100%):** **T-102.5** (re-evaluasi & tutup Known Issues sisa migrasi)
> selesai berdasarkan verifikasi langsung ke kode (dikerjakan Gibran
> Project Manager). **KI-005** (Astryx masih Beta) ditutup Resolved —
> moot, 0 dependency `@astryxdesign/*` tersisa di
> `apps/web/package.json`/`apps/web/src` (hanya komentar historis).
> **KI-030** (`TimeInput`) dan **KI-035** poin 1 (StyleX/`xstyle`)
> dikonfirmasi sudah Resolved sebelumnya (T-100.3, T-101.1, keduanya
> 2026-09-03) — tidak dihitung ulang sebagai temuan baru T-102.5.
> **KI-035** poin 2 (`Badge` Astryx tanpa prop size/truncation) baru
> ditutup Resolved sekarang — root cause hilang karena `Badge` sekarang
> shadcn (Tailwind-composable). Poin 3 (layout Calendar mobile ~375px)
> tetap `Open`, di luar scope. Dengan T-102.5 tuntas, seluruh 6 subtask
> **T-102** sudah ✅ — **T-102 ditutup `✅ Done`**, dan **rilis v0.7
> (migrasi Astryx→shadcn/ui, ADR-097) tuntas 100% (8/8 task)**. Task
> selesai naik 32 → **33** dari 85 total; subtask total v0.7 tetap 38 dari
> 38 (semua sudah ✅ sebelumnya, T-102.5 melengkapi sisa satu-satunya
> checklist `[ ]`). Detail: `tasks/v07-astryx-shadcn-migration.md` § T-102,
> `PROJECT_STATE.md` § KI-005, KI-035.

> **Update (2026-09-04, T-102.6 selesai — T-102.1 tuntas penuh):** **T-102.6**
> (migrasi `useToast` Astryx → shadcn) selesai dikerjakan Mark UI Engineer di
> branch `feature/t-102-cleanup-verifikasi-akhir`. Component `sonner`
> di-install via `bunx shadcn@latest add @shadcn/sonner`, diadaptasi untuk
> memakai mekanisme tema project sendiri (cookie + class `dark`, bukan
> `next-themes`) — `<Toaster theme={mode} />` dipasang di root
> `Providers.tsx` memakai `useThemeMode` context yang sudah ada. Di
> `QueueScreen.tsx`, `useToast` dari `@astryxdesign/core/Toast` diganti
> `toast()` dari `sonner`, pesan dipertahankan persis. Dependency `sonner`
> ditambahkan ke `apps/web/package.json`. Dengan ini **T-102.1 tuntas
> sepenuhnya** — `@astryxdesign/core` (sisa terakhir dependency Astryx)
> dihapus dari `apps/web/package.json`, `bun install` sukses, `bun.lock`
> sinkron. Verifikasi: `bun run typecheck` PASS 0 error, `bunx eslint .`
> PASS 0 error, grep `@astryxdesign` di `apps/web/src` sekarang **0 import
> aktif**. **Gap terbuka:** verifikasi visual browser toast baru (bagian
> dari T-102.4) belum bisa dilakukan sesi ini — dev server minta login,
> tidak ada kredensial test tersedia; perlu King Rezi cek manual sebelum
> T-102.4 ditutup. Subtask v0.7 selesai naik 33 → **35** dari 38 total
> (T-102.1 dan T-102.6 sama-sama jadi ✅). Sisa T-102: T-102.3, T-102.4,
> T-102.5. Detail: `tasks/v07-astryx-shadcn-migration.md` § T-102.

> **Update (2026-09-04, gap verifikasi visual toast ditutup):** King Rezi
> mengecek manual di Publish → Queue → Cancel Schedule dan mengonfirmasi
> "toast oke" — gap verifikasi visual T-102.6 di update sebelumnya sudah
> ditutup. T-102.4 (QA visual menyeluruh, scope lebih besar) tetap belum
> selesai. Status T-102 tidak berubah (`🟡 In Progress`, sisa T-102.3,
> T-102.4, T-102.5). Detail: `tasks/v07-astryx-shadcn-migration.md` § T-102.
>
> **Update (2026-09-04, T-102 in progress — gap ditemukan):** **T-102**
> (Cleanup & Verifikasi Akhir) mulai dikerjakan di branch
> `feature/t-102-cleanup-verifikasi-akhir`, status `🟡 In Progress`.
> **T-102.2** (grep ulang `@astryxdesign/*`) ✅ selesai — menemukan gap
> tidak tercatat: 9 file masih import Astryx aktif meski T-097–T-101 sudah
> ✅ Done. Dimigrasi ke shadcn (Mark UI Engineer): `Modal.tsx`,
> `status-badge.ts` (draft-editor), `calendar-grid-shared.ts`,
> `CalendarEntryFooter.tsx`, `CalendarPostPopover.tsx` (calendar),
> `DraftsList.tsx` (drafts), `ScaffoldPlaceholder.tsx`, `Providers.tsx`
> (Theme/stoneTheme/LinkProvider Astryx dilepas sepenuhnya), `globals.css`
> (4 baris `@import` Astryx dihapus). typecheck/lint PASS 0 error,
> verifikasi visual (light+dark, mobile 375px) PASS 0 regresi. **T-102.1**
> dieksekusi **partial**: `@astryxdesign/theme-stone` + `@astryxdesign/cli`
> + script/config `astryx` dihapus dari `apps/web/package.json`;
> `@astryxdesign/core` **belum** bisa dihapus karena `useToast` di
> `QueueScreen.tsx` masih bergantung padanya (belum ada padanan Toast
> shadcn) — dicatat subtask baru **T-102.6** untuk menuntaskan ini.
> Subtask v0.7 naik 37 → **38** (T-102.6 baru), total subtask 210 → **211**.
> Detail: `tasks/v07-astryx-shadcn-migration.md` § T-102.
>
> **Update (2026-09-03, T-101.5 selesai — T-101 Done):** **T-101** (Migrasi
> Publish — Calendar, Queue, Drafts, Dashboard) ditutup `✅ Done` — seluruh
> 5/5 subtask tuntas. Subtask terakhir **T-101.5** (Dashboard:
> `DashboardHome.tsx`) tuntas di branch
> `feature/t-101-publish-calendar-queue-drafts-migration` — migrasi penuh
> dari Astryx (`Card`, `EmptyState`, `Grid`, `Heading`, `HStack`,
> `ProgressBar`, `Section`, `Selector`, `Text`, `VStack`) ke shadcn/ui.
> Komponen shadcn baru: `progress` (`Progress`, Radix). `Selector`
> weekly/monthly → shadcn `Select` (pola `CalendarToolbar.tsx` T-101.1).
> Gap dicatat (bukan penyimpangan): shadcn `Progress` tidak punya
> value-label formatting bawaan seperti Astryx — label persentase
> dirender manual sebagai `Text` terpisah, konsisten dengan presedan gap
> desain-token T-101.1/T-101.3. State/Server Action (`period`,
> `useTransition`, `getDashboardSummaryAction`, guard
> `latestRequestedPeriod`) tidak disentuh — murni migrasi presentasi;
> **KI-036** tetap technical debt terpisah. Lolos implementasi Mark UI
> Engineer (typecheck/lint PASS 0 error, verifikasi visual browser — empty
> state dark mode, golden path dark+light mode, mobile 375px, ganti
> periode via Select, console bersih) dan review arsitektur Ridwan (0
> temuan). Hitungan subtask v0.7 tidak berubah (37 — hanya status
> checklist T-101.5 yang berubah), dihitung ulang langsung dari
> `tasks/v07-astryx-shadcn-migration.md`. Task selesai naik 31 → **32**
> (breakdown v0.7: 6 ✅ · 1 🟡 · 1 ⏳ → **7 ✅ · 1 ⏳**). Next task migrasi
> shadcn v0.7: **T-102** (Cleanup & Verifikasi Akhir). Detail:
> `tasks/v07-astryx-shadcn-migration.md` § T-101, `COMPLETE_TASK.md`.
>
> **Update (2026-09-03, T-101.4 selesai):** **T-101** (Migrasi Publish —
> Calendar, Queue, Drafts, Dashboard) tetap `🟡 In Progress` — subtask
> **T-101.4** (`PublishPageHeader.tsx`/`PublishTabbar.tsx`/
> `app/(app)/publish/layout.tsx`) tuntas di branch
> `feature/t-101-publish-calendar-queue-drafts-migration`. Komponen shadcn
> baru: `tabs` (`Tabs`/`TabsList`/`TabsTrigger`, style `radix-maia`); yang
> lain (`Button`, `Text`) sudah tersedia dari migrasi sebelumnya. Lolos
> implementasi Mark UI Engineer (typecheck/lint PASS, verifikasi visual
> browser akun Raka Pratama/Owner, light/dark mode, tab switching
> Calendar→Queue→Drafts→History route-driven via `usePathname()`, mobile
> 375px, tidak ada regresi) dan review arsitektur Ridwan (0 temuan).
> Hitungan subtask v0.7 tidak berubah (37 — hanya status checklist
> T-101.4 yang berubah), dihitung ulang langsung dari
> `tasks/v07-astryx-shadcn-migration.md`. Task selesai tidak berubah
> (masih 31, T-101 sekarang 4/5 subtask). Next subtask: **T-101.5**
> (Dashboard: `DashboardHome.tsx`). Detail:
> `tasks/v07-astryx-shadcn-migration.md` § T-101.
>
> **Update (2026-09-03, T-101.3 selesai):** **T-101** (Migrasi Publish —
> Calendar, Queue, Drafts, Dashboard) tetap `🟡 In Progress` — subtask
> **T-101.3** (Drafts: `DraftsList.tsx`) tuntas di branch
> `feature/t-101-publish-calendar-queue-drafts-migration`, tidak ada
> komponen shadcn baru (semua sudah tersedia dari migrasi T-099.3), lolos
> implementasi Mark UI Engineer (typecheck/lint PASS, verifikasi visual
> browser akun Raka Pratama/Owner, light/dark mode, mobile 375px, tidak
> ada regresi) dan review arsitektur Ridwan (0 temuan). `Badge` Astryx
> sengaja dipertahankan untuk indikator status warna, presedan sama
> dengan T-100.1/T-101.1. Hitungan subtask v0.7 tidak berubah (37 — hanya
> status checklist T-101.3 yang berubah), dihitung ulang langsung dari
> `tasks/v07-astryx-shadcn-migration.md`. Task selesai tidak berubah
> (masih 31, T-101 sekarang 3/5 subtask). Next subtask: **T-101.4**
> (`PublishPageHeader.tsx`/`PublishTabbar.tsx`/`app/(app)/publish/layout.tsx`).
> Detail: `tasks/v07-astryx-shadcn-migration.md` § T-101.
>
> **Update (2026-09-03, T-101.2 selesai):** **T-101** (Migrasi Publish —
> Calendar, Queue, Drafts, Dashboard) tetap `🟡 In Progress` — subtask
> **T-101.2** (Queue: `QueueList.tsx`/`QueueScreen.tsx`) tuntas di branch
> `feature/t-101-publish-calendar-queue-drafts-migration`, tidak ada
> komponen shadcn baru (semua sudah tersedia dari migrasi sebelumnya),
> lolos implementasi Mark UI Engineer (typecheck/lint PASS, verifikasi
> visual browser akun Raka Pratama/Owner, light/dark mode, mobile 375px,
> tidak ada regresi) dan review arsitektur Ridwan (0 temuan). Icon aksi
> pindah ke `hugeicons`, icon platform tetap `react-icons` (dikecualikan
> ADR-058). Gap dicatat (bukan penyimpangan): `useToast` masih dari Astryx,
> belum ada padanan shadcn (`sonner`) — di luar scope T-101.2, dicatat
> sebagai technical debt terpisah. Hitungan subtask v0.7 tidak berubah (37
> — hanya status checklist T-101.2 yang berubah), dihitung ulang langsung
> dari `tasks/v07-astryx-shadcn-migration.md`. Task selesai tidak berubah
> (masih 31, T-101 sekarang 2/5 subtask). Next subtask: **T-101.3**
> (Drafts). Detail: `tasks/v07-astryx-shadcn-migration.md` § T-101.
>
> **Update (2026-09-03, T-101.1 selesai):** **T-101** (Migrasi Publish —
> Calendar, Queue, Drafts, Dashboard) berubah `⏳ Not Started` → `🟡 In
> Progress` — subtask **T-101.1** (Calendar:
> `CalendarMonthGrid.tsx`/`CalendarWeekGrid.tsx`/`CalendarToolbar.tsx`/
> `CalendarPostPopover.tsx` → shadcn `Popover`/`CalendarEntryFooter.tsx`/
> `CalendarScreen.tsx`) tuntas di branch
> `feature/t-101-publish-calendar-queue-drafts-migration`, lolos
> verifikasi visual Mark UI Engineer (browser real, akun Maya Anggraini/
> Admin) dan review arsitektur Ridwan (0 temuan). Pola ADR-090/091
> dipertahankan penuh. Re-evaluasi **KI-035**: poin 1 (StyleX/`xstyle`)
> ditutup Resolved (grid sudah 100% Tailwind), poin 3 (layout mobile
> sempit ~375px) tetap Open. Hitungan subtask v0.7 tidak berubah (37 —
> hanya status checklist T-101.1 yang berubah), dihitung ulang langsung
> dari `tasks/v07-astryx-shadcn-migration.md`. Task selesai tidak berubah
> (masih 31, T-101 baru 1/5 subtask). Next subtask: **T-101.2** (Queue).
> Detail: `tasks/v07-astryx-shadcn-migration.md` § T-101.
>
> **Update (2026-09-03, T-100.4 selesai — T-100 Done):** **T-100** (Migrasi
> Publish — Draft Editor Modal) ditutup `✅ Done` — seluruh 4/4 subtask
> tuntas. Subtask **T-100.4** (verifikasi behavior penuh end-to-end, murni
> QA regresi karena `Modal.tsx` tidak punya test komponen otomatis)
> dituntaskan Najwa QA Engineer: `bun run typecheck`/`lint`/`test` PASS
> (235 pass, 4 skip, 0 fail), full E2E regression PASS semua (New
> Post→Schedule/Publish Now/Save Draft, Edit Draft, `ResumeDialog`, toggle
> Fullscreen↔Standard, Close via X/Escape/klik-luar, entry point
> Calendar/Queue), `Banner`/`Badge`/`Divider` Astryx yang belum dimigrasi
> dicek tidak ada style clash, accessibility (tab order, focus-visible)
> dan RBAC (Owner/Admin/Creator) tidak ada gap. Catatan minor
> informational (bukan bug): Link "Reconnect" dan field Pinterest tidak
> bisa diverifikasi karena data test tidak punya akun kondisi tersebut;
> **KI-032** dicatat ulang (pre-existing, bukan regresi). Hitungan subtask
> v0.7 tidak berubah (37 — hanya status checklist yang berubah), dihitung
> ulang langsung dari `tasks/v07-astryx-shadcn-migration.md`. Task selesai
> naik 30 → **31** (breakdown v0.7: 5 ✅ · 1 🟡 · 2 ⏳ →
> **6 ✅ · 2 ⏳**). Next task migrasi shadcn v0.7: **T-101** (Calendar,
> Queue, Drafts, Dashboard). Detail:
> `tasks/v07-astryx-shadcn-migration.md` § T-100, `COMPLETE_TASK.md`.
>
> **Update (2026-09-03, T-100.3 selesai):** **T-100** (Migrasi Publish —
> Draft Editor Modal) tetap `🟡 In Progress` — subtask **T-100.3**
> (`TimeInput` khusus: Astryx `TimeInput` → native `<input type="time">`
> lewat `Input` shadcn, pola sama field tanggal T-100.2) tuntas di branch
> `feature/t-100-draft-editor-modal`. Dikerjakan Mark UI Engineer, lolos
> review Ridwan (0 temuan) dan QA Najwa (PASS — typecheck/lint/Vitest
> bersih 235 lulus/4 skipped, browser E2E golden + edge case PASS).
> **KI-030 ditutup Resolved** — root cause (Astryx `TimeInput` internal
> `<input type="text">` tanpa `maxLength`/`pattern`) hilang total setelah
> migrasi ke native `<input type="time">`, dibuktikan lewat pengujian
> eksplisit Mark + verifikasi independen Najwa. 1 temuan minor baru
> (pre-existing, bukan regresi) dicatat sebagai **KI-044** (gap: tidak ada
> validasi mencegah Schedule ke waktu yang sudah lewat pada tanggal hari
> ini). T-100.4 (verifikasi behavior penuh) masih tersisa — T-100 belum
> ditutup `✅ Done`. Hitungan subtask v0.7 tidak berubah (37 — hanya status
> checklist T-100.3 yang berubah), dihitung ulang langsung dari
> `tasks/v07-astryx-shadcn-migration.md`. Task selesai tidak berubah
> (masih 30, T-100 belum Done). Detail:
> `tasks/v07-astryx-shadcn-migration.md` § T-100.
>
> **Update (2026-09-03, T-100.2 selesai):** **T-100** (Migrasi Publish —
> Draft Editor Modal) tetap `🟡 In Progress` — subtask **T-100.2** (form
> controls: Caption `Textarea`, Media `Input type="file"`, Account
> `Checkbox`, Content Format `RadioGroup`, Pinterest Pin Title/Destination
> Link `Input`, Tanggal Jadwal native `<input type="date">` via `Input`)
> tuntas di branch `feature/t-100-draft-editor-modal`. Dikerjakan Mark UI
> Engineer, lolos review Ridwan (0 temuan) dan QA Najwa (PASS —
> typecheck/lint/Vitest bersih 235 lulus/4 skipped, browser E2E golden +
> edge case PASS). 1 temuan minor dicatat sebagai **KI-043**
> (`clearUnsavedNewPost()` tidak dipanggil di jalur Schedule/Publish Now —
> pre-existing, bukan regresi T-100.2). T-100.3 (`TimeInput` + evaluasi
> **KI-030**), T-100.4 (verifikasi behavior penuh) masih tersisa — T-100
> belum ditutup `✅ Done`. Hitungan subtask v0.7 tidak berubah (37 — hanya
> status checklist T-100.2 yang berubah), dihitung ulang langsung dari
> `tasks/v07-astryx-shadcn-migration.md`. Task selesai tidak berubah
> (masih 30, T-100 belum Done). Detail:
> `tasks/v07-astryx-shadcn-migration.md` § T-100.
>
> **Update (2026-09-03, T-100.1 selesai):** **T-100** (Migrasi Publish —
> Draft Editor Modal) naik status `⏳ Not Started` → `🟡 In Progress` —
> subtask **T-100.1** (struktur modal + layout, `Dialog`/`DialogHeader`/
> `DialogFooter` shadcn + Tailwind layout manual, varian Standard/
> Fullscreen ADR-065/052 dipertahankan) tuntas di branch
> `feature/t-100-draft-editor-modal`. T-100.2 (form controls), T-100.3
> (`TimeInput` + evaluasi **KI-030**), T-100.4 (verifikasi behavior penuh)
> masih tersisa — T-100 belum ditutup `✅ Done`. Review arsitektur Ridwan
> dan QA Najwa formal belum dijalankan. Hitungan subtask v0.7 tidak
> berubah (37 — hanya status checklist T-100.1 yang berubah), dihitung
> ulang langsung dari `tasks/v07-astryx-shadcn-migration.md`. Task
> selesai tidak berubah (masih 30, T-100 belum Done). Detail:
> `tasks/v07-astryx-shadcn-migration.md` § T-100.
>
> **Update (2026-09-02, T-098.4 selesai):** **T-098** ditutup kembali
> `✅ Done` (`🟡 In Progress` → `✅ Done`, 4/4 subtask tuntas) — subtask
> **T-098.4** (sidebar mobile hamburger+`Sheet` di `apps/web/src/app/(app)/`
> + `MobileTopBar.tsx` baru, `MembersTable.tsx` card layout mobile) lolos
> review arsitektur Ridwan (0 temuan) dan QA Najwa (PASS penuh — typecheck/
> lint/Vitest bersih 235 lulus/4 skipped, desktop tanpa regresi, mobile
> 375px/320px berfungsi benar termasuk auto-close `Sheet` dan dialog Tier-2
> ADR-049, tidak ada horizontal overflow). 2 temuan di luar scope dicatat
> (bukan blocker): tabel Members di 768px persis butuh scroll horizontal
> (perilaku pre-existing), card "Analytics Snapshot" Home tetap putih saat
> dark mode (bug pre-existing). **KI-042 ditutup Closed** —
> lihat `PROJECT_STATE.md` § KI-042. Task selesai naik 29 → **30**, subtask
> total tidak berubah (210 — hanya status checklist yang berubah). Dihitung
> ulang langsung dari `tasks/v07-astryx-shadcn-migration.md`, sesuai aturan
> maintenance. Detail: `tasks/v07-astryx-shadcn-migration.md` § T-098,
> `COMPLETE_TASK.md`.

> **Update lama (2026-09-02, T-098.4 dibuka):** **T-098** sempat dibuka
> kembali (`✅ Done` →
> `🟡 In Progress`) — subtask baru **T-098.4** (sidebar mobile
> hamburger+drawer + pola tabel mobile card, menutup **KI-042**)
> ditambahkan setelah rancangan Claude Design tersedia. Implementasi kode
> sudah ditulis (sesi utama, bukan Mark UI Engineer — `DesignSync` gagal
> dimuat lagi di sesi subagent), typecheck/lint bersih, tapi **belum**
> direview Ridwan, **belum** di-QA Najwa, dan verifikasi visual browser
> juga belum berhasil (masalah tooling sesi, bukan kode) — jadi T-098.4
> belum dicentang selesai. Subtask total naik 209 → **210** (v0.7: 36 →
> 37), task selesai turun 30 → **29** (T-098 bukan lagi Done). Dihitung
> ulang langsung dari `tasks/v07-astryx-shadcn-migration.md`. Detail:
> `tasks/v07-astryx-shadcn-migration.md` § T-098, **KI-042** di
> `PROJECT_STATE.md`.

> **Rekonsiliasi (2026-09-02):** T-098 (branch `feature/t-098-app-shell-navigation`) dan T-099 (branch `feature/t-099-settings-migration`, worktree terpisah) dikerjakan paralel dan masing-masing sempat menghitung ulang indeks berdasarkan versi dokumen yang berbeda (masing-masing melihat dirinya sebagai satu-satunya task baru). Setelah kedua branch di-rebase jadi satu riwayat linear, hitungan v0.7 di atas (5 ✅ · 3 ⏳) dan total (30 selesai) sudah menggabungkan keduanya — dihitung ulang langsung dari `tasks/v07-astryx-shadcn-migration.md` final, bukan menjumlahkan dua klaim paralel.

> **Update (2026-09-02, sesi T-099):** **T-099** (Migrasi Settings) ditutup `✅ Done` — seluruh 3 subtask tuntas: T-099.1 (`WorkspaceGeneralSettings.tsx`, `ProfileForm.tsx`, `preferences/page.tsx`, `SettingsPageHead.tsx`), T-099.2 (`MembersTable.tsx` — helper `pixel()`/`proportional()` Astryx dihapus total diganti shadcn `Table` primitive, `InviteMemberDialog.tsx`, `InviteMemberAction.tsx`), T-099.3 (`ConnectedAccountsList.tsx`, `ConnectPlatformMenu.tsx`, `WorkspacesSettingsView.tsx`). Implementasi Mark UI Engineer, lolos review arsitektur Ridwan (0 temuan) dan QA Najwa (PASS, 1 temuan minor). Temuan minor: kolom "Actions" `MembersTable.tsx` tidak terlihat penuh di viewport sempit (~800px) — dicatat sebagai detail tambahan **KI-042** (bukan KI baru, akar masalah sama: gap strategi responsive/mobile). Gap **KI-041** meluas: status "Pending" di `MembersTable.tsx` dipetakan ke `Badge variant="outline"` karena tidak ada token warning. Dikerjakan di worktree terpisah (`feature/t-099-settings-migration`, dicabang dari `feature/t-097-auth-flows-onboarding`) paralel dengan sesi T-098.

> **Update (2026-09-02):** **T-098** (Migrasi App Shell & Navigasi) ditutup `✅ Done` — seluruh 3 subtask tuntas: T-098.1 (`WorkspaceSideNav.tsx`, `SettingsSideNav.tsx`, `ChannelsSection.tsx`), T-098.2 (`NotificationBell.tsx` ke shadcn `Sheet`, wrapper custom `components/ui/Drawer.tsx` dihapus), T-098.3 (re-verifikasi **KI-040**, ditutup Resolved setelah diverifikasi Najwa lewat browser nyata light+dark mode). Implementasi Mark UI Engineer di branch `feature/t-098-app-shell-navigation`, lolos review arsitektur Ridwan (0 temuan) dan QA Najwa (PASS penuh setelah 1 bug ditemukan+diperbaiki — dot indikator unread menimpa teks timestamp). Typecheck/lint/Vitest bersih (235 passed/4 skipped/0 fail, tidak ada regresi). Gap ditemukan (dicatat, bukan diputuskan sendiri): migrasi sidebar mobile (hamburger+drawer) di `(app)/layout.tsx` ke shadcn `Sidebar` primitive tidak masuk breakdown T-098 — dicatat **KI-042** di `PROJECT_STATE.md`, menunggu keputusan King Rezi. Task naik 28 → **29**, subtask total tidak berubah (209 — hanya status checklist yang berubah). Dihitung ulang langsung dari `tasks/v07-astryx-shadcn-migration.md`, sesuai aturan maintenance.
>
> **Update (2026-09-02):** **T-097** (Migrasi Auth Flows & Onboarding) ditutup `✅ Done` — seluruh 5 subtask tuntas: T-097.1 (Login & Register), T-097.2 (Forgot/Reset password), T-097.3 (Accept Invite), T-097.4 (`app/(auth)/layout.tsx`), T-097.5 (Onboarding flow). Implementasi Mark UI Engineer di branch `feature/t-097-auth-flows-onboarding`, lolos review arsitektur Ridwan (0 temuan) dan QA Najwa (semua PASS, typecheck 0 error, lint 0 error, Vitest 235 passed/4 skipped, browser E2E golden+edge case). Gap desain ditemukan (dan dicatat, bukan ditutup sendiri): Stone theme shadcn belum punya token `--success`/`--warning` — dicatat **KI-041** di `PROJECT_STATE.md`. Task naik 27 → **28**, subtask total tidak berubah (209 — hanya status checklist yang berubah). **T-098** (Migrasi App Shell & Navigasi) menyusul sebagai task berikutnya rilis v0.7. Dihitung ulang langsung dari `tasks/v07-astryx-shadcn-migration.md`, sesuai aturan maintenance.
>
> **Update (2026-09-01):** **T-096** (Migrasi Core Infra & Shared Primitives) ditutup `✅ Done` — seluruh 4 subtask tuntas: T-096.1 (`globals.css` baru berbasis Tailwind v4 + shadcn, `@import` Astryx sengaja dipertahankan sementara untuk route-segment yang belum dimigrasi, akan dihapus di T-102), T-096.2 (`Providers.tsx` — `dark` class shadcn ditambahkan berdampingan dengan `<Theme>` Astryx, bukan pengganti, supaya dark/light mode tidak desync; `ThemeModeContext`/`useThemeMode` dipertahankan apa adanya), T-096.3 (root `app/(app)/layout.tsx` dimigrasi ke komposisi shadcn — gap sidebar mobile hamburger+drawer sengaja belum direplikasi, menyusul di T-098), T-096.4 (primitive `Button`/`Card`/`Dialog`/`Input` via CLI shadcn resmi + `Text`/Typography ditulis manual). Dikerjakan Mark UI Engineer di branch `feature/t-096-core-infra-migration`, typecheck & lint bersih, verifikasi visual manual browser tidak ada regresi, dikonfirmasi King Rezi ("aman"). Sekaligus dikoreksi drift hitungan subtask v0.7: klaim sebelumnya 26 subtask ternyata tidak cocok dengan `tasks/v07-astryx-shadcn-migration.md` aktual (36 subtask, sudah termasuk T-096 yang belum dirinci saat v0.7 dibuat) — dihitung ulang langsung dari file, bukan increment manual. Task naik selesai 26 → **27**, subtask total naik 199 → **209** (v0.1–v0.3 tidak berubah, 173; v0.7 dikoreksi 26 → 36). T-097 (Migrasi Auth Flows & Onboarding) menyusul sebagai task berikutnya rilis v0.7.
>
> **Update (2026-09-01, ADR-097):** King Rezi memutuskan migrasi fondasi UI dari Astryx ke shadcn/ui setelah audit menemukan 49 file/~44 komponen Astryx dipakai di `apps/web/src` (terisolasi penuh di layer presentasi) dan keterbatasan Beta berulang (KI-005, KI-030, KI-035, KI-040). Ditulis sebagai release baru **v0.7** (bukan disisipkan ke v0.1–v0.6, beda dari pola T-094, karena skalanya besar: 8 task, 26 subtask) di `tasks/v07-astryx-shadcn-migration.md`, ID global berikutnya setelah T-094 (T-095–T-102, pola sama T-039/T-089/T-090–T-094). Strategi **incremental per route-segment** (Astryx & shadcn coexist sementara), bukan big-bang — M8 tetap berjalan paralel. Task naik 77 → **85**, subtask naik 173 → **199** (v0.7: 8 task, 26 subtask, seluruhnya ⏳). Task selesai tidak berubah (masih 25).
>
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
> **Update (2026-08-31):** **T-093** (Accept Invite page) ditutup `✅ Done` — T-093.4 (verifikasi RBAC end-to-end) dituntaskan Najwa QA Engineer dengan 3 akun real (Owner/Admin/Creator) di satu workspace, seluruh skenario RBAC PASS. 1 bug ditemukan selama verifikasi (Creator bisa mengakses `/settings/members` yang seharusnya "Tidak ada akses" — information disclosure UI-level, backend RBAC sudah benar sejak awal) dan sudah diperbaiki + diverifikasi ulang (commit `6fdf272`); **KI-038 Resolved**. Rantai **T-093 → T-036 → T-092** sekarang tidak lagi terhambat T-093 — T-036 tinggal menunggu giliran dikerjakan (masih `⏳ Not Started`, tidak ada blocker task lain). Task selesai naik 24 → **25**. Breakdown v0.1 berubah dari "12 ✅ · 1 🚫 · 7 🟡 · 1 ⏸️ · 2 ⏳" menjadi **13 ✅ · 1 🚫 · 6 🟡 · 1 ⏸️ · 2 ⏳** (T-093 pindah dari 🟡 ke ✅). Jumlah task/subtask total tidak berubah (77 task, 173 subtask) — hanya status yang berubah. Dihitung ulang langsung dari `tasks/v01-foundation.md`, sesuai aturan maintenance.
>
> **Update (2026-08-31):** **T-036** (In-app notification + Supabase Realtime) mulai dikerjakan (branch `feature/t-036-notification-realtime`) — T-036.1 (domain skeleton service+repository, ditambah unit test yang sebelumnya tidak ada) dan T-036.2 (subscribe Supabase Realtime tabel `notifications` event `INSERT` filter `user_id`, plus perbaikan gap infra: tabel ditambahkan ke publication `supabase_realtime` dan RLS policy baru berbasis `auth.uid()`, migration `20260831150000_t036_notifications_realtime_setup` sudah dijalankan & terverifikasi) selesai. T-036.3 (sambungkan JWT Better Auth) dan T-036.5 (trigger dari webhook) masih tersisa. T-036.4 (UI bell+panel) **blocked** — dicek ke Claude Design, rancangan Notifications Panel belum ada, dicatat **KI-039**. Task T-036 pindah dari `⏳ Not Started` ke `🟡 In Progress`. Breakdown v0.2 berubah dari "9 ✅ · 1 🟡 · 12 ⏳" menjadi **9 ✅ · 2 🟡 · 11 ⏳**. Jumlah task/subtask total tidak berubah (77 task, 173 subtask) — hanya status yang berubah. Dihitung ulang langsung dari `tasks/v02-publishing-mvp.md`, sesuai aturan maintenance.
>
> **Update (2026-09-01):** **T-036** (In-app notification + Supabase Realtime) — T-036.3 (Route Handler `api/realtime/token` menerbitkan Supabase Realtime JWT dari session Better Auth, dipakai `useNotificationRealtime` sebelum subscribe; sekaligus dituntaskan method `list`/`markAsRead`/`markAllAsRead` yang ditunda dari T-036.1) dan T-036.4 (bell + panel notifikasi di sidebar footer, komponen wrapper selektif baru `Drawer.tsx` karena Astryx ter-pin belum punya primitive Drawer) selesai — lolos review arsitektur Ridwan (tanpa temuan) dan QA Najwa (semua PASS setelah 1 bug RLS `auth.uid()::uuid` vs `userId` cuid ditemukan dan diperbaiki lewat migration `20260901120000_t036_fix_realtime_rls_cuid_cast`). **KI-039 Resolved** (rancangan Notifications Panel ternyata sudah ada di Claude Design). Task T-036 tetap `🟡 In Progress` — hanya T-036.5 (trigger dari webhook) yang tersisa. Breakdown status v0.2 tidak berubah (task-level tetap 9 ✅ · 2 🟡 · 11 ⏳, subtask-level tidak bertambah — hanya perubahan status checklist di dalam T-036). Jumlah task/subtask total tidak berubah (77 task, 173 subtask). Dihitung ulang langsung dari `tasks/v02-publishing-mvp.md`, sesuai aturan maintenance.
>
> **Update (2026-09-01, koreksi):** **T-036.4** dibuka kembali (checklist `[x]` → `[ ]`) — review lanjutan menemukan 5 gap visual konkret pada `NotificationBell.tsx` vs spec Claude Design (`components/notifications-panel.html`): background tint unread, dot indikator unread, icon circle badge, weight/warna title per status, dan deskripsi ellipsis. Kelima gap sudah diperbaiki di kode (lint + `tsc` bersih), tapi verifikasi visual di browser belum dilakukan (dev server minta login, tidak ada kredensial test tersedia sesi ini) — jadi subtask belum ditutup. Bukan temuan KI baru, bagian dari investigasi yang sama dengan **KI-040** (tetap Open). Task T-036 tetap `🟡 In Progress` — tersisa T-036.4 (verifikasi visual) dan T-036.5 (trigger dari webhook). Jumlah task/subtask total tidak berubah (77 task, 173 subtask), hanya status checklist yang berubah. Detail: `tasks/v02-publishing-mvp.md` § T-036.
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
| **T-102** | Cleanup & Verifikasi Akhir                      | ✅      | **Done** — seluruh 6 subtask tuntas: T-102.1 (hapus dependency Astryx), T-102.2 (grep 0 import aktif), T-102.3 (update `ctx-design.md`/`ctx-implementation.md`), T-102.4 (QA visual menyeluruh Najwa QA Engineer, PASS 0 regresi; **KI-045** ditemukan — regresi RBAC Creator, di luar scope), T-102.5 (re-evaluasi & tutup KI-005 moot, KI-030 & KI-035 poin 1 dikonfirmasi closed sebelumnya, KI-035 poin 2 baru ditutup Resolved), T-102.6 (migrasi `useToast` → `sonner`, verifikasi visual toast dikonfirmasi manual King Rezi "toast oke" 2026-09-04). Dengan ini rilis **v0.7 tuntas 100%**. Lihat `tasks/v07-astryx-shadcn-migration.md` § T-102 |
| **T-101** | Migrasi Publish — Calendar, Queue, Drafts, Dashboard | ✅      | **Selesai (2026-09-03)** — seluruh 5/5 subtask tuntas: T-101.1 (Calendar), T-101.2 (Queue), T-101.3 (Drafts), T-101.4 (header/tabbar/layout), T-101.5 (Dashboard). Lolos review Ridwan (0 temuan) tiap subtask. Lihat `tasks/v07-astryx-shadcn-migration.md` § T-101 |
| **T-100** | Migrasi Publish — Draft Editor Modal             | ✅      | **Selesai (2026-09-03)** — seluruh 4/4 subtask tuntas (struktur modal + layout, form controls shadcn, `TimeInput` → native `<input type="time">` (**KI-030 Closed**), verifikasi behavior penuh end-to-end). Lolos review Ridwan (0 temuan) + QA Najwa (PASS penuh). Temuan minor: **KI-043**, **KI-044**. Lihat `tasks/v07-astryx-shadcn-migration.md` § T-100 |
| **T-099** | Migrasi Settings                                 | ✅      | **Selesai (2026-09-02)** — 3/3 subtask (`WorkspaceGeneralSettings.tsx`/`ProfileForm.tsx`/`preferences/page.tsx`/`SettingsPageHead.tsx`, `MembersTable.tsx`/`InviteMemberDialog.tsx`/`InviteMemberAction.tsx`, `ConnectedAccountsList.tsx`/`ConnectPlatformMenu.tsx`/`WorkspacesSettingsView.tsx`), lolos review Ridwan (0 temuan) + QA Najwa (PASS, 1 temuan minor viewport sempit dicatat di **KI-042**). Lihat `tasks/v07-astryx-shadcn-migration.md` § T-099 |
| **T-098** | Migrasi App Shell & Navigasi                     | ✅      | **Selesai (2026-09-02)** — seluruh 4/4 subtask tuntas: T-098.1–.3 (`WorkspaceSideNav`/`SettingsSideNav`/`ChannelsSection`, `NotificationBell` ke `Sheet` + hapus `Drawer.tsx`, re-verifikasi **KI-040** → Closed), T-098.4 (sidebar mobile + tabel mobile card, menutup **KI-042** — lolos review Ridwan 0 temuan + QA Najwa PASS penuh). Lihat `tasks/v07-astryx-shadcn-migration.md` § T-098 |
| **T-097** | Migrasi Auth Flows & Onboarding                  | ✅      | **Selesai (2026-09-02)** — 5/5 subtask (Login/Register, Forgot/Reset password, Accept Invite, `(auth)/layout.tsx`, Onboarding), lolos review Ridwan (0 temuan) + QA Najwa (semua PASS). Gap desain token `--success`/`--warning` Stone theme dicatat **KI-041** (belum ditutup, menunggu keputusan King Rezi). Lihat `tasks/v07-astryx-shadcn-migration.md` § T-097 |
| **T-096** | Migrasi Core Infra & Shared Primitives           | ✅      | **Selesai (2026-09-01)** — `globals.css`, `Providers.tsx`, root `app/(app)/layout.tsx`, primitive `Button`/`Card`/`Dialog`/`Input`/`Text`. Lihat `tasks/v07-astryx-shadcn-migration.md` § T-096 untuk detail & 2 keputusan penting (CSS/Theme Astryx dipertahankan sementara) |
| **T-095** | Setup Fondasi shadcn/ui & Tooling Migrasi        | ✅      | **Selesai (2026-09-01)** — task pertama rilis v0.7 (migrasi Astryx→shadcn/ui, ADR-097), seluruh 7 subtask tuntas: T-095.1 (init shadcn/ui, base Radix + preset Maia), T-095.2 (MCP server shadcn di `.mcp.json`+`.cursor/mcp.json`), T-095.3 (tulis ulang `apps/web/.claude/CLAUDE.md` ke workflow shadcn CLI/MCP), T-095.4 (rule 14/15 `AGENTS.md`, sudah selesai lebih dulu di commit `07a3aa2`), T-095.5 (pemetaan Stone→shadcn di `design-tokens.md`), T-095.6 (update subagent Mark UI Engineer ke shadcn, izin eksplisit King Rezi), T-095.7 (sinkronisasi docs baseline) |
| **T-025** | Real OutstandAdapter                            | ⏳      | Rantai blocker terbesar — lihat di bawah. **Terhenti**: butuh `OUTSTAND_API_KEY`/`OUTSTAND_WEBHOOK_SECRET` asli (KI-003, `PROJECT_STATE.md` § Blockers), belum bisa dikerjakan sampai kredensial tersedia |
| **T-036** | In-app notification + Supabase Realtime         | 🟡      | T-036.1/.2/.3 selesai. T-036.4 dibuka kembali (2026-09-01) — gap visual vs Claude Design belum terverifikasi di browser (lihat KI-040). Tersisa T-036.4 (verifikasi visual) dan T-036.5 (trigger dari webhook) |

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

> **T-093** (Accept Invite page) sudah ✅ **Done** (2026-08-31) — 4/4 subtask selesai, verifikasi RBAC end-to-end (Najwa QA Engineer, 3 akun real Owner/Admin/Creator) tuntas, 1 bug ditemukan & diperbaiki selama verifikasi (KI-038 Resolved). Detail: `tasks/v01-foundation.md` § T-093.

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
