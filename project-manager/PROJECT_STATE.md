# PROJECT STATE

## Snapshot

* **Phase / Milestone:** Phase 6 — Implementation · M8 — Development (Sprint 5) · Overall: M7 100%, M8 in progress
* **Active Mode:** Ready for Development — implementasi fitur produk sesuai Architecture & Engineering Baseline
* **Top Next Tasks:** **T-039 Migrasi Routing & Settings (ADR-076) — ✅ Done** (2026-09-08) — subtask terakhir **T-039.4** (onboarding picker workspace) diimplementasikan, lolos review arsitektur Ridwan (0 temuan) + QA Najwa end-to-end browser (6/6 skenario PASS); **KI-023 Resolved**, entrinya sudah dihapus dari Known Issues (riwayat lengkap di `COMPLETE_TASK.md`). Kode masih di branch `feature/t-039-4-onboarding-workspace-picker`, belum di-commit/push/merge. Sebelumnya: **T-007.8 Members list gabungan Pending (ADR-101) — ✅ Done** (2026-09-07, side-quest di luar rantai utama) — lolos implementasi Prabowo Feature Engineer, review arsitektur Ridwan (1 temuan race condition di `revokeInvitation`, sudah diperbaiki), QA end-to-end Najwa (browser real, semua PASS, 0 bug). **T-026 Webhook handler Outstand — ✅ Done** (2026-09-07) dan **T-036 In-app notification + Supabase Realtime — ✅ Done** (2026-09-07) — King Rezi menjalankan `bun run db:deploy` untuk 3 migration T-026 yang sebelumnya belum ter-apply, Najwa QA Engineer retest 5 skenario webhook end-to-end nyata, semua PASS. **KI-048 Resolved**. ADR-099 (SECURITY DEFINER system-context lookup untuk webhook) dicatat sebagai preseden untuk T-027. Fokus berikutnya kembali ke **T-025 Real OutstandAdapter** (terhenti menunggu kredensial) dan **T-027 Job runner + Railway Cron** — salinan ID dari **Fokus sekarang** di [`TASKS.md`](TASKS.md), yang merupakan satu-satunya daftar fokus. Sebelumnya: **T-102 Cleanup & Verifikasi Akhir — ✅ Done** (rilis v0.7, ADR-097) menuntaskan migrasi Astryx→shadcn/ui 100%; **KI-045**, **KI-041** (ADR-098), **KI-035** sudah Resolved (2026-09-04); **KI-046** Resolved (Promoted to T-007.7, ADR-100, 2026-09-07); **KI-047**, **KI-049** (2026-09-07 — invite Copy Link rawan identity takeover kalau email penerima bukan target undangan & belum punya akun, akar masalah KI-001) dicatat sebagai gap baru/Open — **KI-049 tidak terkait/tidak berubah statusnya** oleh selesainya T-007.8, masih genuinely Open.
* **Blocker:** 2 blocker aktif (env var Outstand belum diisi + kode Real OutstandAdapter belum ditulis; env var Google OAuth belum diisi) — lihat section **Blockers** di bawah. Railway staging sudah live & terverifikasi (2026-08-14) sehingga blocker itu resolved; JOB_SECRET juga sudah diisi di Railway staging. Tidak memblokir M8 awal, tapi memblokir T-025→T-026→T-027.
* **Backlog task lengkap:** [`TASKS.md`](TASKS.md) — 85 task per release (v0.1 → v1.0, + v0.7 migrasi Astryx→shadcn/ui, ADR-097), detail di `tasks/`. Jangan cari detail task di file ini.
* Detail phase/mode/issue ada di section di bawah. Riwayat completed/ADR lengkap: lihat `COMPLETE_TASK.md` (⚠️ jangan dibaca AI kecuali diperintah)/`DECISIONS.md`.

---

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.76     |
| Status       | Active     |
| Last Updated | 2026-09-08 |

---

## Current Status

| Item              | Value                            |
| ----------------- | -------------------------------- |
| Current Phase     | Phase 6 — Implementation      |
| Current Milestone | M8 — Development               |
| Current Sprint    | Sprint 5                         |
| Overall Progress  | M7 100% · M8 in progress         |
| Project Status    | M8 berjalan — Publishing MVP (persistensi nyata, Fake OutstandAdapter) |

---

## Current Focus

M7 Repository & Bootstrap **selesai**. M8 Development **berjalan**.

* **Prioritas utama saat ini (2026-09-02):** migrasi UI component system
  dari Astryx ke shadcn/ui (**ADR-097**, rilis **v0.7**,
  `tasks/v07-astryx-shadcn-migration.md`, T-095–T-102) — permintaan
  eksplisit King Rezi, dikerjakan **sebelum** T-025/T-036. Strategi
  incremental per route-segment, Astryx & shadcn coexist sementara.
  T-095/T-096/T-097/T-098/T-099/T-100/T-101/**T-102** sudah `✅ Done` — rilis
  **v0.7 tuntas 100%** (8/8 task, 2026-09-04).
* **AI Context layer** (`context/`) sudah di-scaffold (opsi A) — indeks + aturan operasional agent; bukan duplikasi baseline.
* `AGENTS.md` di root sudah ada; skill resmi vendor yang relevan (Prisma,
  Better Auth, Vercel, Supabase) sudah terpasang di `.claude/skills/` —
  satu-satunya lokasi skill sejak ADR-064 (`.agents/skills/` dihapus).
* Project dikerjakan di **dua tool**: Claude Code (utama) dan Cursor. Paritas
  aset agent + dua pasang file kembar yang wajib dijaga sinkron (config MCP,
  proteksi baca secret) didokumentasikan di section "Kompatibilitas tool"
  pada `AGENTS.md` (ADR-064).
* Alignment ADR-040 pada dokumentasi baseline dan schema/migration sudah
  selesai. Implementasi runtime Outstand tetap bagian M8 dan belum dinyatakan
  selesai (T-025 → T-026 → T-027).
* Alignment dokumentasi ADR-041 (2026-07-23) — **sekarang superseded oleh
  ADR-097 (2026-09-01)**, lihat bullet prioritas utama di atas. Riwayat:
  Engineering Baseline, Project Overview, AGENTS, dan AI Context sempat
  disinkronkan memakai Astryx permanen (theme Stone sejak ADR-087),
  Tailwind layout-only, wrapper selektif, exact pin Beta — seluruh dokumen
  itu sudah disinkronkan ulang ke shadcn/ui (ADR-097, T-095.7). Instalasi
  dan smoke test Next.js 16 (2026-07-23) tetap valid, tidak terpengaruh
  perubahan ini.
* Fokus M8 saat ini: Auth Flows, Workspace Onboarding, App Shell, Draft
  Editor (modal, default Standard per ADR-065; Fullscreen via toggle,
  ADR-052), persistensi nyata "Save as Draft"/"Edit Draft", Drafts List
  data asli, dan persistensi nyata "Schedule" via Fake OutstandAdapter
  (ADR-059) sudah selesai; lanjut ke integrasi Outstand runtime asli
  (ADR-040) begitu kredensial tersedia.
* **Perencanaan task** kini berjenjang per release di [`TASKS.md`](TASKS.md) +
  `tasks/` (ADR-062), menggantikan flat list `Next Tasks` yang lama.

---

## Active Conversation Mode

Current Mode: Ready for Development

Current Phase: Phase 6 / M8 Development berjalan

Current Objective:
- Memulai implementasi fitur produk sesuai Architecture & Engineering Baseline
- Memakai `context/` + `AGENTS.md` sebagai pintu masuk agent saat coding

Allowed Actions:
- Discussion
- Brainstorm
- Documentation
- Feature Implementation (M8)
- Penyempurnaan AI Context (`context/`, `AGENTS.md`) bila perlu

Restricted Actions:
- Perubahan Architecture / Engineering Baseline tanpa ADR
- Wireframe Detail (kecuali dibutuhkan untuk implementasi layar)

---

## Milestone Progress

| Milestone                    | Status         |
| ---------------------------- | -------------- |
| M0 — Project Foundation      | ✅ Completed    |
| M1 — Discovery               | ✅ Completed    |
| M2 — Business Planning       | ✅ Completed    |
| M3 — Product Planning        | ✅ Completed    |
| M4 — UX Planning             | ✅ Completed    |
| M5 — System Architecture     | ✅ Completed    |
| M6 — Engineering Planning    | ✅ Completed    |
| M7 — Repository & Bootstrap  | ✅ Completed    |
| M8 — Development             | 🟡 In Progress  |
| M9 — Testing & Release       | ⏳ Pending      |

---

## In Progress

Task berstatus 🟡 dan subtask detail **hanya** ada di [`TASKS.md`](TASKS.md) +
`tasks/vXX-*.md` (ADR-062) — tidak diduplikasi di sini supaya tidak desync.

Catatan non-task (bukan task, jadi memang layak di sini): template
`design-tokens.md` berstatus Draft / TBD; nilai final berkembang iteratif
co-equal dengan Claude Design (ADR-056) — tidak ada lagi gerbang "designer
masuk", project ini tidak akan merekrut designer eksternal (ADR-057,
amandemen ADR-038 & ADR-041).

---

## Next Tasks

Daftar lengkap 72 task (v0.1 → v1.0) beserta subtask, dependency, rantai
blocker, catatan urutan rilis, dan keputusan terbuka yang menunggu King
Rezi — semuanya **hanya** di **[`TASKS.md`](TASKS.md)** (section **Fokus
sekarang** + **Keputusan terbuka**). Snapshot di atas sudah menyalin ID +
judul singkatnya. **Jangan menulis ulang daftar/detail task di sini**
(ADR-062) — daftar ketiga akan langsung desync.

---

## Known Issues

> **ID `KI-XXX`** (ADR-066, amandemen ADR-067) — global, tidak pernah didaur ulang. `Status`: `Open` / `Resolved` / `Sebagian Resolved — sisa scope: <ID>` / `Promoted to T-XXX`. `Sebagian Resolved` dipakai kalau sebagian besar gap sudah ditutup tapi ada 1 subtask/scope kecil yang eksplisit belum — sebutkan sisa scope-nya di string status. Terpisah dari namespace task (`T-XXX`) karena belum tentu jadi task formal. **Entry `Resolved` yang sudah tercatat di `COMPLETE_TASK.md` dihapus dari daftar ini** (bukan dibiarkan dengan status `Resolved`) — riwayatnya tetap ada di `COMPLETE_TASK.md`, ID-nya tidak didaur ulang untuk entry baru.

### KI-001 · Transactional Email Provider belum ditetapkan

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Dependency |
| Terkait | T-005 |

Password reset & email verification (Better Auth) membutuhkan email provider yang belum ditetapkan (kandidat: Resend, Postmark, AWS SES, SMTP Supabase). Dicatat di `auth-strategy.md` (AS-D04). `requireEmailVerification` dinonaktifkan sementara di skeleton. Tidak memblokir M8 awal.

### KI-003 · Runtime ADR-040 belum diimplementasikan

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-025, T-026, T-027 |

Alignment dokumentasi dan schema/migration sudah selesai, tetapi handler webhook, durable ingestion, retry internal, media upload Outstand, engagement sync/reply, dan reconnect flow masih task M8. `schedulePost` sendiri sudah bisa dipakai lewat `FakeOutstandAdapter` (ADR-059) — `getOutstandAdapter()` akan beralih otomatis ke real adapter begitu `OUTSTAND_API_KEY` diisi **dan** kode real adapter sudah ditulis (kalau env terisi tapi kode belum ada, factory throw error, bukan silent fallback ke Fake). Per 2026-08-13, T-041 (metric ingestion) juga sudah diselesaikan lewat pola Fake yang sama (ADR-079) — `fetchPostMetrics`/`fetchWorkspaceMetrics` mengembalikan data mock deterministik sampai kredensial asli tersedia. T-042 (Dashboard Home) juga sudah ✅ Done (2026-08-13, seluruh subtask), tapi datanya tetap dari `FakeOutstandAdapter` sampai KI-003 ini resolved.

### KI-014 · Domain `identity` belum punya unit test

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-016 |

`IdentityService`, `IIdentityRepository`, dan `SupabaseAvatarStorageAdapter` (domain `identity`, diisi pertama kali lewat T-016.2) belum punya unit test Vitest. Review arsitektur Ridwan sudah memverifikasi boundary domain bersih (tidak ada pelanggaran), tetapi coverage test-nya nihil. Tidak memblokir penutupan T-016.1/.2/.3/.5 — keempatnya sudah lolos QA browser end-to-end.

### KI-015 · Env var `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` belum diisi

| Field | Value |
|-------|-------|
| Status | Sebagian Resolved — sisa scope: `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` |
| Kategori | Dependency |
| Terkait | T-025, T-026 |

Sama seperti `OUTSTAND_API_KEY` (lihat KI-003):

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — kode Google OAuth di `auth.ts` sudah siap (`socialProviders.google` terdaftar kondisional lewat `env.ts`), tapi tanpa env ini "Sign in with Google" tidak aktif. Masih placeholder dummy.
- `JOB_SECRET` — **resolved 2026-08-14**: sudah diisi nilai asli generated di Railway staging (env var), dan job runner (T-027, `POST /api/jobs/run` via Railway Cron `X-Job-Secret`) sudah terverifikasi end-to-end 2x run berturut-turut SUCCESS di staging. Local `.env.local` masih boleh memakai nilai dummy untuk dev.

### KI-024 · Header sidebar Settings belum sesuai spec Design System (back-button vs judul)

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-039.5, ADR-077 |

Ditemukan 2026-08-11 saat memperbaiki header `WorkspaceSideNav.tsx` agar
sesuai Design System (lihat `COMPLETE_TASK.md`). `SettingsSideNav.tsx`
(dibuat via T-039.5/ADR-077) merender `SideNavHeading` dengan back-icon +
judul "Settings" sebagai **satu link utuh**, sedangkan spec desain
(`.settings-sidebar-header` di `styles.css` Claude Design, baris ~316-319)
memisahkan back-button (kotak ikon 28px, klik-able sendiri) dari judul
"Settings" (teks statis, font `--text-body-size`, lebih kecil dari default
`SideNavHeading` yang pakai `--text-large-size`). Belum diperbaiki — dicatat
sebagai temuan untuk follow-up King Rezi, belum dibuatkan task formal.

### KI-027 · Selector target Admin di dialog Transfer Ownership (T-008) belum dikonfirmasi ke desain

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Process |
| Terkait | T-008 |

Mockup `templates/settings-general.html` di Claude Design tidak menunjukkan cara memilih Admin target sebelum dialog Transfer Ownership dibuka. Mark UI Engineer menambahkan komponen `Selector` Admin aktif sebagai keputusan implementasi sendiri (bukan sesuai desain final yang disetujui King Rezi) supaya alur tetap bisa dipakai. Perlu konfirmasi/update balik ke Claude Design dari King Rezi — T-008 sengaja belum ditutup `✅ Done` sampai ini selesai (lihat `tasks/v01-foundation.md` § T-008).

### KI-028 · Production Railway environment & Supabase project belum dibuat

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Dependency |
| Terkait | T-027, seluruh CI/CD deploy step (ADR-028, ADR-029, ADR-032) |

Ditemukan saat menutup KI-025 (2026-08-14): staging environment (Railway +
Supabase) sudah live & terverifikasi, tapi **production** belum ada sama
sekali — belum ada project/environment Railway `production`, dan belum
ada project Supabase terpisah untuk production (staging permanen memakai
project Supabase existing "Sosial Media Management",
ref `ndcrkzqgqukqfmekgoze` — dikonfirmasi permanen via ADR-081, amandemen
EM-D02; lihat catatan di `COMPLETE_TASK.md` 2026-08-14). Baseline
`deployment-infrastructure.md`, `environment-topology`
(ADR-029), region Singapore (ADR-028), dan CI/CD pipeline (ADR-032) untuk
jalur production masih rencana, belum ada realisasi. Tidak memblokir M8,
tapi wajib dituntaskan sebelum rilis production.

### KI-032 · Publish Now dari Queue belum auto-advance ke Confirmation Summary

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-032 (§ T-032.4, `tasks/v02-publishing-mvp.md`) |

Ditemukan 2026-08-20 saat wiring tombol "Publish Now" di Queue (T-032.4): tombol ini reuse modal Draft Editor via `openEditDraft` dengan `initialPendingAction: "publish-now"` supaya modal auto-advance ke step Confirmation Summary begitu draft ready — tapi `getDraftAction` **belum preload target akun** yang sudah dijadwalkan, sehingga `isReadyToPublishNow` sering `false` saat dibuka dari Queue. Efeknya: modal jatuh ke form biasa (bukan langsung ke Confirmation Summary) — bukan bug fungsional (Publish Now tetap bisa dilakukan lewat form), murni gap UX auto-advance. Sengaja dibiarkan (di luar scope T-032.4) — perlu subtask terpisah nanti (preload target akun untuk Edit Draft) kalau UX ini mau disempurnakan. Tidak memblokir M8.

### KI-033 · 2 workspace test tersisa dari QA T-089 belum dibersihkan

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Data Hygiene |
| Terkait | T-089 (`tasks/v01-foundation.md` § T-089) |

Ditemukan saat QA Najwa untuk T-089.2–.4 (2026-08-24): 2 workspace test
tersisa di database — **"Najwa QA Test Workspace"** (sengaja dibuat untuk
menguji `createWorkspaceAction`) dan **"QA Queue Test"** (sisa sesi QA
sebelumnya, bukan dari sesi T-089). Bukan bug — keduanya sengaja tidak
dihapus oleh Najwa karena hapus workspace bersifat ireversibel dan di luar
wewenang eksekusi otonom QA. Perlu dibersihkan manual oleh King Rezi via
Settings → General → Danger Zone kalau perlu. Tidak memblokir M8.

### KI-036 · Dashboard (`app/(app)/page.tsx`) fetch data lewat Server Action, menyimpang RS-D02

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | ADR-095, T-094 |

Ditemukan saat penulisan `rendering-strategy.md` (ADR-095, 2026-08-28): `app/(app)/page.tsx` (dashboard) mengambil data lewat Server Action (`getDashboardSummaryAction`) untuk pure read — seharusnya memanggil Application Service langsung dari Server Component (composition root), seperti pola yang sudah benar di `app/(app)/publish/calendar/page.tsx` (sesuai AGENTS.md rule 5 dan RS-D02 di `rendering-strategy.md`). ADR-095 secara eksplisit **tidak** memperbaiki ini sebagai bagian ADR — dicatat sebagai exception pra-existing, cleanup terpisah di **T-094.4** (`tasks/v01-foundation.md`). Tidak urgent, tidak memblokir M8.

**Update (2026-08-28) — 2 exception tambahan ditemukan review arsitektur Ridwan** (sesi yang sama, setelah ADR-095/T-094 dicatat, belum masuk subtask formal manapun — technical debt yang perlu di-follow-up terpisah dari T-094.4 di atas):
1. **RS-D03** — `app/(app)/settings/account/preferences/page.tsx` punya `"use client"` di baris pertama, membuat seluruh page jadi Client Component (seharusnya Server Component dengan `"use client"` hanya di leaf yang butuh interactivity).
2. **CC-D02** — `draft-editor/actions.ts` (6 fungsi) tidak punya `try/catch`/`toActionError()` sama sekali; `settings/account/actions.ts` dan `onboarding/components/actions.ts` masih pakai pola `instanceof` manual sendiri, bukan `toActionError()`.

### KI-037 · `design-tokens.md` section Spacing (ADR-095) belum disinkronkan ke Claude Design

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Process |
| Terkait | ADR-095, ADR-056 |

Section Spacing di `design-tokens.md` baru dikunci (base 1 unit = 4px, skala 0/0.5/1/1.5/2/3/4/5/6/8 = 0–32px, menggantikan `TBD` sejak ADR-038) lewat ADR-095. Mengikuti pola reminder ADR-056 (dokumen ini co-equal dengan Claude Design, perubahan salah satu wajib disinkronkan ke yang lain), sinkronisasi ke Claude Design belum dilakukan di sesi ADR-095 — perlu langkah lanjutan terpisah. Tidak memblokir M8.

### KI-043 · `clearUnsavedNewPost()` tidak dipanggil di jalur Schedule/Publish Now

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Bug |
| Terkait | T-100 |

Ditemukan QA Najwa QA Engineer saat verifikasi T-100.2 (2026-09-03,
`apps/web/src/app/(app)/components/draft-editor/Modal.tsx`) — bukan
regresi T-100.2, sudah ada sejak versi lama file (diverifikasi via
`git log -p`), dan bukan blocker penutupan T-100.2.

`clearUnsavedNewPost()` hanya dipanggil di `handleSaveDraft`, tidak
dipanggil di `handleConfirmSchedule`/`handleConfirmPublishNow`. Akibatnya
localStorage "unsaved draft" tidak terhapus setelah Schedule/Publish Now
sukses (kalau user sempat trigger `persistUnsavedNewPost` sebelumnya) —
`ResumeDialog` bisa muncul lagi dengan caption basi di sesi New Post
berikutnya. Perlu ditindaklanjuti terpisah, di luar scope T-100 (dijadwal
kapan pun oleh King Rezi, tidak memblokir T-100.3/T-100.4).

### KI-044 · Tidak ada validasi mencegah Schedule ke waktu yang sudah lewat pada tanggal hari ini

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Bug |
| Terkait | T-100 |

Ditemukan QA Najwa QA Engineer saat verifikasi T-100.3 (2026-09-03,
`apps/web/src/app/(app)/components/draft-editor/Modal.tsx`) — bukan
regresi T-100.3, sudah ada sejak sebelum migrasi (Astryx `TimeInput` lama
juga tidak punya validasi ini), dan bukan blocker penutupan T-100.3.

Tidak ada validasi yang mencegah user men-Schedule post ke waktu yang
sudah lewat pada tanggal hari ini (mis. jadwalkan jam 08:00 padahal
sekarang sudah jam 11:48) — post berhasil masuk Queue tanpa
penolakan/warning apa pun. Perlu ditindaklanjuti terpisah, di luar scope
T-100 (dijadwal kapan pun oleh King Rezi, tidak memblokir T-100.4).

### KI-046 · `MemberStatus.Pending` tidak pernah di-assign di flow produksi manapun

| Field | Value |
|-------|-------|
| Status | Promoted to T-007.7 (2026-09-07, ADR-100) |
| Kategori | Tech-Debt / Gap |
| Terkait | T-007.7, ADR-080, ADR-100 |

Ditemukan Najwa QA Engineer saat QA badge "Pending" `MembersTable.tsx`
(bagian penutupan KI-041, ADR-098, 2026-09-04): `MemberStatus.Pending` (di
Prisma schema / `@social/shared`) ternyata tidak pernah di-assign di kode
produksi manapun — flow invite saat ini (accept invitation) selalu langsung
membuat member berstatus **Active**. Akibatnya badge "Pending" adalah dead
code secara fungsional — tidak bisa dicapai lewat alur user manapun saat
ini, hanya dipakai di unit test.

**Resolved (2026-09-07, ADR-100):** King Rezi memutuskan status ini bukan
dead code — direservasi untuk metode invite **"Kirim via Email"** (T-007.7,
masih blocked T-005). Desain alurnya sudah dikunci di ADR-100: baris
`workspace_members` dibuat langsung `Pending` saat invite dikirim via
email, lalu diupdate jadi `Active` saat user accept. Implementasi konkret
menunggu T-005 selesai — dipindah jadi bagian scope resmi **T-007.7**,
bukan lagi Known Issue berdiri sendiri.

### KI-047 · Claude Design "Social Media Management" belum disinkronkan ke Stone theme shadcn (masih dokumentasi Astryx lama)

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Process / Design Gap |
| Terkait | ADR-097, ADR-098 |

Ditemukan saat mengerjakan KI-041 (2026-09-04): seluruh project Claude
Design "Social Media Management" (`readme.md`, `theme.json`, `styles.css`,
`foundations/color.html` sebelum diedit sesi ini) ternyata masih 100%
dokumentasi **Astryx lama** ("Astryx fidelity policy", basis
`@astryxdesign/theme-neutral@0.1.8`) — tidak pernah disinkronkan ke **Stone
theme shadcn/ui** yang jadi baseline kode sejak migrasi ADR-097 (T-095–T-102,
selesai 2026-09-04). Artinya foundations/tokens/warna yang didokumentasikan
di Claude Design saat ini tidak mencerminkan kode aktual — gap dokumentasi
besar, di luar scope sesi ini (yang hanya menambah 2 section baru secara
additive di `foundations/color.html` dan `templates/publish-calendar.html`
tanpa resync menyeluruh). Perlu keputusan King Rezi: apakah worth resync
besar-besaran Claude Design ke Stone/shadcn, dan kapan. Tidak memblokir M8.

### KI-049 · Invite via Copy Link — email tidak diverifikasi kepemilikan inbox, rawan identity takeover

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Security / Bug |
| Terkait | T-007.1, T-093, KI-001, ADR-080, ADR-096 |

Ditemukan King Rezi saat diskusi (2026-09-07): kalau invite lewat **Copy
Link** ditujukan ke email A tapi link-nya (sengaja atau tidak) terbuka oleh
email B, dan **email A belum pernah punya akun** (`isExistingUser: false`),
email B bisa langsung mengisi Nama + Password **pilihannya sendiri** di
form `/invite/[token]` ([AcceptInviteForm.tsx](../apps/web/src/app/(auth)/invite/[token]/components/AcceptInviteForm.tsx))
dan submit — form memang mengunci field email jadi read-only ke email A
(`AcceptInviteForm.tsx:127-128`), tapi ini cuma memastikan **string email**
yang dikirim ke `authClient.signUp.email()` sama dengan email A, **bukan**
membuktikan email B benar-benar memegang inbox email A.

Root cause: `requireEmailVerification: false` di Better Auth
([auth.ts:53](../apps/web/src/lib/better-auth/auth.ts:53), bagian dari
**KI-001** — provider email belum ditetapkan) — Better Auth tidak pernah
mengirim email konfirmasi untuk verifikasi kepemilikan inbox saat sign-up.
Guard `actorEmail === invitation.email` di
`WorkspaceService.acceptInvite` ([workspace.service.ts:615](../apps/web/src/domains/workspace/services/workspace.service.ts:615))
sudah benar secara logic (mencegah user lain yang sudah login pakai akun
berbeda ikut menerima invite ini), tapi tidak bisa mencegah skenario ini
karena sign-up baru sama sekali belum pernah diverifikasi oleh siapa pun.

**Dampak:** email B efektif membajak identitas "email A" — akun baru
dengan email A dan password buatan B berhasil dibuat, B langsung jadi
member workspace atas nama A. Kalau pemilik asli email A kemudian mencoba
daftar, Better Auth akan menolak ("email sudah terdaftar") — pemilik asli
terkunci keluar dari identitasnya sendiri.

**Catatan lingkup:** kalau email A **sudah punya akun** (`isExistingUser:
true`), skenario ini **aman** — email B harus tahu password akun A untuk
bisa sign-in, jadi tidak bisa dieksploitasi tanpa itu. Gap ini spesifik ke
kasus akun baru (belum pernah daftar).

Belum ada keputusan mitigasi (opsi yang mungkin: tunda Copy Link sampai
T-005/email verification selesai, atau tambahkan verifikasi email terpisah
khusus alur accept-invite). Tidak memblokir M8 saat ini, tapi risiko
keamanan nyata untuk Copy Link yang sudah dipakai di production.

---

## Blockers

**Wajib dicek AI sebelum mengerjakan subtask apapun yang menyentuh area di
bawah.** Keduanya adalah dependency eksternal yang belum tersedia di
lingkungan lokal/CI — bukan bug kode. Kalau eksekusi subtask di area ini
gagal/crash, cek dulu apakah salah satu blocker ini penyebabnya sebelum
menyimpulkan ada bug dan mulai "memperbaiki" kode yang sebenarnya sudah
benar.

| ID         | Blocker                                                        | Menghambat                          |
| ---------- | --------------------------------------------------------------- | ------------------------------------ |
| **KI-003** | `OUTSTAND_API_KEY`/`OUTSTAND_WEBHOOK_SECRET` belum diisi **dan** kode Real OutstandAdapter belum ditulis sama sekali (bukan cuma env — factory sengaja throw kalau env terisi tapi kode belum ada) | T-025 → T-027 (rantai terbesar) |
| **KI-015** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` belum diisi (JOB_SECRET sudah resolved 2026-08-14 di Railway staging) | Google OAuth sign-in |

**Resolved 2026-09-07:** KI-048 (3 migration Prisma T-026 belum `prisma
migrate deploy` ke DB dev/live) — King Rezi menjalankan `bun run
db:deploy`, migration terverifikasi ter-apply (Najwa QA Engineer cross-check
via Supabase MCP), retest end-to-end nyata 5 skenario webhook semua PASS.
**T-026 dan T-036 keduanya ditutup `✅ Done`**, lihat `COMPLETE_TASK.md`.

**Resolved 2026-08-14:** KI-025 (Railway belum pernah dibuat) — staging
sudah live & terverifikasi, lihat `COMPLETE_TASK.md`. Sisa gap production
dicatat terpisah sebagai **KI-028** (tidak memblokir M8/T-027 staging).

**Resolved 2026-08-24:** KI-034 (QA Najwa belum retest golden path switch
workspace dengan dialog konfirmasi Tier 2 baru, T-089.6/ADR-089) — QA
formal Najwa selesai, lolos penuh (unit test + full suite 157 passed/3
skipped/0 gagal + golden path browser end-to-end, tidak ada bug baru),
lihat `COMPLETE_TASK.md`.

**Resolved 2026-08-31:** KI-038 (T-093.4 verifikasi RBAC end-to-end 2-akun
browser nyata belum dilakukan) — Najwa QA Engineer menuntaskan verifikasi
dengan 3 akun real (Owner/Admin/Creator) di satu workspace, seluruh skenario
RBAC PASS; 1 bug ditemukan (Creator bisa mengakses `/settings/members` yang
seharusnya "Tidak ada akses") dan sudah diperbaiki + diverifikasi ulang
(commit `6fdf272`), lihat `COMPLETE_TASK.md`.

Detail masing-masing ada di section **Known Issues** di atas — tabel ini
hanya pointer supaya blocker aktif langsung terlihat tanpa harus menyisir
seluruh daftar Known Issues.

---

## Completed (Ringkasan)

Berikut ~5 item terakhir yang diselesaikan. Riwayat lengkap (sejak M0): lihat `COMPLETE_TASK.md` — ⚠️ jangan dibaca AI kecuali diperintah eksplisit King Rezi.

* **T-039 ditutup `✅ Done` — onboarding picker workspace T-039.4, KI-023 Resolved (2026-09-08)** — halaman `/onboarding` sekarang branching 3 skenario: 0 workspace → form buat workspace baru (tidak berubah); 1 workspace → tetap auto-redirect `onboarding/resume` (tidak berubah); >1 workspace → `WorkspacePicker` baru (Client Component, pola `Item`/`ItemGroup` shadcn) yang menanyakan pilihan user secara eksplisit lewat Server Action `selectWorkspaceAction` (reuse `WorkspaceService.switchWorkspace`), menggantikan auto-pick diam-diam `getDefaultWorkspaceForUser`. Lolos review arsitektur Ridwan (0 temuan) dan QA Najwa end-to-end browser (6/6 skenario PASS, termasuk verifikasi dengan akun 4-workspace nyata). Dengan ini seluruh subtask T-039.1–.5 tuntas, menutup sisa scope **KI-023**. Kode masih di branch `feature/t-039-4-onboarding-workspace-picker`, belum di-commit/push/merge. Detail: `tasks/v01-foundation.md` § T-039.
* **T-007.8 ditutup `✅ Done` — Members list gabungan Pending, ADR-101 (2026-09-07)** — Members list (`/settings/members`) sekarang menampilkan undangan pending sebagai baris status Pending, berlaku **kedua metode invite** (Copy Link + Kirim via Email), lewat gabungan data `workspace_members` + `WorkspaceInvitation` (tanpa migrasi skema, sesuai ADR-101 yang mengamandemen ADR-100). Diimplementasikan Prabowo Feature Engineer, direview Ridwan Architecture Reviewer (1 temuan race condition di `revokeInvitation`, sudah diperbaiki, re-verifikasi bersih 269 passed/5 skipped), QA end-to-end Najwa QA Engineer (browser real: golden path invite→pending row→cancel, golden path accept→pending hilang jadi Active, mobile 375px, RBAC Creator tetap tidak bisa akses, invitation expired tidak muncul — **semua PASS, 0 bug**). Task induk **T-007** tetap `🟡 In Progress` (sisa scope T-007.7, blocked T-005). Detail: `tasks/v01-foundation.md` § T-007.8, `decisions/ADR-101-*.md`.
* **KI-046 Resolved — Promoted to T-007.7, ADR-100 (2026-09-07)** — `MemberStatus.Pending` yang sebelumnya tidak pernah di-assign di flow produksi manapun dikunci desainnya: King Rezi memutuskan status ini direservasi untuk metode invite "Kirim via Email" (T-007.7, masih blocked T-005), bukan dead code. Baris `workspace_members` akan dibuat langsung `Pending` saat invite dikirim via email, diupdate `Active` saat user accept — Copy Link tidak berubah (tetap insert `Active` langsung saat accept). Implementasi konkret menunggu T-005 selesai; ADR ini murni mengunci desain. Detail: `decisions/ADR-100-memberstatus-pending-direservasi-metode-invite-kirim-via-email.md`, `tasks/v01-foundation.md` § T-007.7.
* **T-026 & T-036 ditutup `✅ Done` — KI-048 Resolved (2026-09-07)** — King Rezi menjalankan `bun run db:deploy` untuk 3 migration T-026 yang sebelumnya belum ter-apply; Najwa QA Engineer cross-check ter-apply via Supabase MCP, lalu retest end-to-end nyata (HTTP request langsung ke `/api/webhooks/outstand`) 5 skenario — golden path `post.published`, `post.error`, `account.token_expired` (menutup T-036.5), event type tak dikenal, idempotensi + signature invalid — **semua PASS**. Kedua task ini akhirnya tuntas penuh setelah kode-nya selesai lebih dulu (2026-09-07, ADR-099). Detail: `tasks/v02-publishing-mvp.md` § T-026/T-036, `COMPLETE_TASK.md`.
* **T-026 Webhook handler Outstand — kode selesai, blocked deploy migration (2026-09-07, ADR-099)** — implementasi penuh route `/api/webhooks/outstand` (HMAC-SHA256 verify, durable-before-ACK, handler `post.published`/`post.error`/`account.token_expired`, idempotensi), dikerjakan Elon Backend Engineer → review Ridwan (temuan diperbaiki) → QA end-to-end Najwa (bug diperbaiki), lolos `typecheck`/`lint`/`test` (261 pass/4 skip). Menutup **T-036.5** sekaligus. **ADR-099** (2 fungsi Postgres `SECURITY DEFINER` untuk lookup system-context tanpa `userId` webhook, preseden untuk T-027) dicatat. Detail: `tasks/v02-publishing-mvp.md` § T-026/T-036, `COMPLETE_TASK.md`.
---

## Recent Decisions (Ringkasan)

5 ADR terakhir. Daftar lengkap (indeks + link ke tiap ADR): lihat `DECISIONS.md`.

* **ADR-101** — Members List Menampilkan Undangan Pending via Gabungan Data (Amandemen ADR-100) — Berlaku Kedua Metode Invite: pendekatan teknis berubah dari "pre-create baris `workspace_members`" (ADR-100) menjadi gabungan data presentasi (`workspace_members` + `WorkspaceInvitation` pending belum expired) setelah ditemukan `WorkspaceMember.userId` bersifat `NOT NULL` — berlaku untuk Copy Link **dan** Kirim via Email sekaligus, tanpa migrasi skema. Task baru **T-007.8** ditambahkan (tidak bergantung T-005), sudah `✅ Done`. Detail: `decisions/ADR-101-members-list-gabungkan-invitation-pending-amandemen-adr-100.md`.
* **ADR-100** — `MemberStatus.Pending` Direservasi untuk Metode Invite "Kirim via Email" (T-007.7): resolusi **KI-046** — status `Pending` bukan dead code, direservasi untuk T-007.7 (blocked T-005). Baris `workspace_members` dibuat `Pending` saat invite dikirim via email, diupdate `Active` saat accept; metode Copy Link tidak berubah. Implementasi konkret menunggu T-005. Detail: `decisions/ADR-100-memberstatus-pending-direservasi-metode-invite-kirim-via-email.md`.
* **ADR-099** — SECURITY DEFINER System-Context Lookup untuk Webhook Outstand (T-026): route webhook `/api/webhooks/outstand` tidak punya Better Auth session/`userId`, tapi RLS mewajibkan `app.current_user_id` — 2 fungsi Postgres `SECURITY DEFINER` baru (`webhook_find_post_targets_by_outstand_post_id`, `webhook_find_account_owner_by_outstand_account_id`), scope sempit exact-match, `EXECUTE` hanya di-grant role `app_runtime`; operasi tulis tetap lewat `withCurrentUser` normal. Preseden untuk T-027 (job runner). Detail: `decisions/ADR-099-security-definer-system-context-lookup-webhook-outstand.md`.
* **ADR-098** — Tambah Token `--success`/`--warning` ke Stone Theme shadcn (Amandemen T-095.5): Stone theme shadcn sebelumnya hanya punya `--destructive` (KI-041) — ditambah 4 token CSS variable baru light+dark, desaturated konsisten `--destructive`, kontras ≥6.3:1 WCAG AA. King Rezi memutuskan menambah token baru (bukan tetap netral) setelah gap berulang 3x. Detail: `decisions/ADR-098-token-success-warning-stone-theme-shadcn.md`.
* **ADR-097** — Migrasi UI Component System dari Astryx ke shadcn/ui (Reverse ADR-041): shadcn/ui menggantikan Astryx sebagai fondasi komponen permanen, dipicu audit 49 file/~44 komponen Astryx dan keterbatasan Beta berulang (KI-005/030/035/040). Migrasi **incremental per route-segment** (Astryx & shadcn coexist sementara), MCP shadcn dipasang, wrapper `Drawer.tsx` diganti `Sheet`. Mengamendemen ADR-055/057/082. Detail task: `tasks/v07-astryx-shadcn-migration.md` (T-095–T-102).

---

## Related Documents

* TASKS.md — backlog task berjenjang (indeks) + `tasks/` per release
* PROJECT_OVERVIEW.md
* ARCHITECTURE_OVERVIEW.md
* PROJECT_RULES.md
* DECISIONS.md
* ../product-discovery/06-engineering/
* ../product-discovery/05-architecture/
* ../product-discovery/04-ux/
