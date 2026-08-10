# PROJECT STATE

## Snapshot

* **Phase / Milestone:** Phase 6 — Implementation · M8 — Development (Sprint 5) · Overall: M7 100%, M8 in progress
* **Active Mode:** Ready for Development — implementasi fitur produk sesuai Architecture & Engineering Baseline
* **Top Next Tasks:** T-012 Sidebar "Channels" · T-029 Publish Now · T-025 Real OutstandAdapter — salinan ID dari **Fokus sekarang** di [`TASKS.md`](TASKS.md), yang merupakan satu-satunya daftar fokus
* **Blocker:** Tidak ada blocker aktif. Known issue teratas: dependency Transactional Email Provider belum ditetapkan (T-005, tidak memblokir M8 awal).
* **Backlog task lengkap:** [`TASKS.md`](TASKS.md) — 69 task per release (v0.1 → v1.0), detail di `tasks/`. Jangan cari detail task di file ini.
* Detail phase/mode/issue ada di section di bawah. Riwayat completed/ADR lengkap: lihat `COMPLETE_TASK.md` (⚠️ jangan dibaca AI kecuali diperintah)/`DECISIONS.md`.

---

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.49     |
| Status       | Active     |
| Last Updated | 2026-08-10 |

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
* Alignment dokumentasi ADR-041 selesai: Engineering Baseline, Project
  Overview, AGENTS, dan AI Context sudah memakai Astryx permanen, neutral theme
  M8, Tailwind layout-only, wrapper selektif, serta exact pin Beta. Instalasi
  dan smoke test Next.js 16 juga sudah selesai.
* Fokus M8 saat ini: Auth Flows, Workspace Onboarding, App Shell, Draft
  Editor (kini modal fullscreen, ADR-052), persistensi nyata "Save as
  Draft"/"Edit Draft", Drafts List data asli, dan persistensi nyata
  "Schedule" via Fake OutstandAdapter (ADR-059) sudah selesai; lanjut ke
  integrasi Outstand runtime asli (ADR-040) begitu kredensial tersedia.
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

Task berstatus 🟡 — detail dan subtask ada di [`TASKS.md`](TASKS.md):

* **T-031** Redirect otomatis ke sub-screen tujuan (ADR-054) — Save as Draft sudah sejalan; sisanya menyusul bersama T-029/T-032/T-034.
* **T-012** Sidebar section "Channels" (ADR-058) — detail subtask di [`TASKS.md`](TASKS.md) / `tasks/v01-foundation.md`.
* **T-016** Account & user settings screens — T-016.1/2/3/5 selesai; hanya T-016.4 (notifications) tersisa, Blocked oleh T-036 (v0.2).

Catatan non-task: template `design-tokens.md` berstatus Draft / TBD; nilai final
berkembang iteratif co-equal dengan Claude Design (ADR-056) — tidak ada lagi
gerbang "designer masuk", project ini tidak akan merekrut designer eksternal
(ADR-057, amandemen ADR-038 & ADR-041).

---

## Next Tasks

> Daftar lengkap 69 task (v0.1 → v1.0) beserta subtask, dependency, dan bacaan minimal per task ada di **[`TASKS.md`](TASKS.md)** → section **Fokus sekarang**. Itu satu-satunya daftar fokus; di file ini cukup baris `Top Next Tasks` di Snapshot. **Jangan menulis ulang daftar task di sini** (ADR-062) — daftar ketiga akan langsung desync.

**Rantai blocker terbesar:** T-025 → T-026 → T-027 (Real adapter → webhook → job runner). Ketiganya mengunci sebagian besar v0.2, seluruh v0.3, dan seluruh v0.4.

**Catatan urutan rilis:** v0.1 dan v0.2 tidak sepenuhnya sekuensial — empat task v0.1 (T-012, T-013, T-015, T-016) punya subtask yang bergantung pada task v0.2. Rinciannya di Catatan Rilis `tasks/v01-foundation.md`.

**Keputusan terbuka yang menunggu King Rezi:** T-005 (email provider), T-060 (provider AI), T-070 (strategi route publik), T-032 (semantik queue slot), T-081 (framework E2E), T-086 (tool observability), serta status Billing yang belum masuk release manapun. Rinciannya di `TASKS.md` → **Keputusan terbuka**.

---

## Known Issues

> **ID `KI-XXX`** (ADR-066, amandemen ADR-067) — global, tidak pernah didaur ulang. `Status`: `Open` / `Resolved` / `Promoted to T-XXX`. Terpisah dari namespace task (`T-XXX`) karena belum tentu jadi task formal. **Entry `Resolved` yang sudah tercatat di `COMPLETE_TASK.md` dihapus dari daftar ini** (bukan dibiarkan dengan status `Resolved`) — riwayatnya tetap ada di `COMPLETE_TASK.md`, ID-nya tidak didaur ulang untuk entry baru.

### KI-001 · Transactional Email Provider belum ditetapkan

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Dependency |
| Terkait | T-005 |

Password reset & email verification (Better Auth) membutuhkan email provider yang belum ditetapkan (kandidat: Resend, Postmark, AWS SES, SMTP Supabase). Dicatat di `auth-strategy.md` (AS-D04). `requireEmailVerification` dinonaktifkan sementara di skeleton. Tidak memblokir M8 awal.

### KI-002 · RLS SQL policies belum digenerate

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-017 |

Belum digenerate di migrasi awal — ditambahkan saat jalur server set `app.current_user_id` diimplementasi (DO-D06).

### KI-003 · Runtime ADR-040 belum diimplementasikan

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-025, T-026, T-027 |

Alignment dokumentasi dan schema/migration sudah selesai, tetapi handler webhook, durable ingestion, retry internal, media upload Outstand, engagement sync/reply, dan reconnect flow masih task M8. `schedulePost` sendiri sudah bisa dipakai lewat `FakeOutstandAdapter` (ADR-059) — `getOutstandAdapter()` akan beralih otomatis ke real adapter begitu `OUTSTAND_API_KEY` diisi **dan** kode real adapter sudah ditulis (kalau env terisi tapi kode belum ada, factory throw error, bukan silent fallback ke Fake).

### KI-005 · Astryx masih Beta

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Process |
| Terkait | — |

Kompatibilitas dasar Next.js 16 sudah dibuktikan lewat smoke test dan production build, tetapi risiko perubahan API tetap dikelola dengan exact pin, tanpa canary/swizzle, wrapper selektif, update manual, dan verifikasi ulang saat upgrade.

### KI-006 · Sidebar Channels — scheduled count stub, reorder belum persisten

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-012 (menunggu T-012.1, T-012.2) |

Bagian UI/interaksi T-012.5 (swap count↔quick-compose "+") dan T-012.6 (drag-handle shift-on-hover) sudah selesai kode-level, tapi data count di-hardcode 0 dan urutan reorder reset saat reload — kedua hal ini menunggu T-012.1 (skema reorder personal per user) dan T-012.2 (query scheduled-posts count lintas domain), yang masih deferred sampai domain publishing v0.2 siap.

### KI-014 · Domain `identity` belum punya unit test

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-016 |

`IdentityService`, `IIdentityRepository`, dan `SupabaseAvatarStorageAdapter` (domain `identity`, diisi pertama kali lewat T-016.2) belum punya unit test Vitest. Review arsitektur Ridwan sudah memverifikasi boundary domain bersih (tidak ada pelanggaran), tetapi coverage test-nya nihil. Tidak memblokir penutupan T-016.1/.2/.3/.5 — keempatnya sudah lolos QA browser end-to-end.

### KI-015 · Env var `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JOB_SECRET` belum diisi

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Dependency |
| Terkait | T-025, T-026, T-027 |

Sama seperti `OUTSTAND_API_KEY` (lihat KI-003), tiga env var ini belum diisi di `.env.local`:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — kode Google OAuth di `auth.ts` sudah siap (`socialProviders.google` terdaftar kondisional lewat `env.ts`), tapi tanpa env ini "Sign in with Google" tidak aktif.
- `JOB_SECRET` — dibutuhkan untuk header `X-Job-Secret` (Railway Cron → web, EM-D0x). Belum diisi berarti job runner (T-027) belum bisa diverifikasi end-to-end di local; dev bisa memakai nilai dummy sementara.

### KI-023 · Kode `apps/web` belum dimigrasikan ke baseline routing/Settings baru (ADR-076)

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Tech-Debt |
| Terkait | T-009, ADR-076 |

Ditemukan awalnya sebagai gap "Workspace Selector tidak pernah
diimplementasikan" (baseline navigasi lama, IA-D05/NP-D07 versi lama).
Investigasi lanjutan 2026-08-10 menyimpulkan premis itu sendiri sudah
tidak relevan: **ADR-076** menghapus konsep Workspace Selector dari
baseline sama sekali — bukan cuma belum dibangun, tapi memang tidak lagi
jadi bagian desain (digantikan entry point avatar/user menu tunggal ke
Settings gabungan Organization + Account).

Gap yang tersisa sekarang lebih besar dari sekadar satu komponen: seluruh
kode `apps/web` masih memakai skema **lama** yang sudah di-superseded ADR-076—
`apps/web/src/app/[slug]/...` (dynamic segment, bukan route group `(app)`),
`apps/web/src/app/account/...` terpisah dari `[slug]/settings/...` (bukan
`settings/account/*` gabungan), dan Middleware/`src/proxy.ts` yang masih
resolve workspace dari `WorkspaceSideNav.tsx` (elemen statis tanpa
dropdown) alih-alih dari cookie `active-workspace-id`. Halaman
`/onboarding` dengan picker workspace (re-entry saat cookie hilang) juga
belum ada.

Migrasi kode ke baseline baru belum punya task T-XXX formal — perlu
ditambahkan ke `TASKS.md` sebelum dikerjakan (lihat "Catatan implementasi"
di ADR-076, `DECISIONS.md`).

---

## Blockers

Tidak ada blocker saat ini.

---

## Completed (Ringkasan)

Berikut ~5 item terakhir yang diselesaikan. Riwayat lengkap (sejak M0): lihat `COMPLETE_TASK.md` — ⚠️ jangan dibaca AI kecuali diperintah eksplisit King Rezi.

* **ADR-076** — 14 file baseline `product-discovery/`+`context/` ditulis ulang: workspace context pindah ke cookie (hapus `[slug]`, route group `(app)`), Settings dikonsolidasi jadi Organization + Account dengan entry point avatar tunggal, `/onboarding` jadi re-entry point saat cookie hilang. Review internal (PR [#61](https://github.com/reziSaktiva/social-media-management/pull/61)) menemukan & memperbaiki 5 inkonsistensi (referensi `/dashboard` basi, bahasa "superseded" di Decision Log, `settings/account/` tanpa `page.tsx` default, contoh URL salah tulis nama route group, jumlah zona sidebar keliru) sebelum ADR dibuat. KI-023 direvisi mengikuti ADR ini. Migrasi kode `apps/web` masih menyusul sebagai task terpisah.
* **KI-021 resolved** — Design System tidak punya logic apa pun untuk membuka menu saat avatar diklik (langsung pindah screen) dan alur Logout belum pernah dimodelkan. King Rezi memperbaiki manual: avatar sidebar Design System sekarang membuka dropdown (Profile + divider + Logout, mirror `DropdownMenu` Astryx), dan Logout membuka dialog konfirmasi Tier 2 (judul "Logout dari akun ini?", mirror `AlertDialog`, sesuai ADR-049/NP-D10). Tidak ada kode `apps/web` yang berubah — perubahan murni di Design System.
* **KI-022 resolved** — Avatar Design System sebelumnya mengarah ke Workspace Settings `settings-connected-accounts`, berbeda dari kode web yang mengarah ke `/account/profile` User Settings. Dikonfirmasi kode web sudah benar sesuai baseline `information-architecture.md` + ADR-056, jadi King Rezi memperbaiki Design System mengikuti kode: item Profile sekarang mengarah ke screen baru `templates/user-settings.html` (User Settings) dengan sidebar minimal ala `AccountSideNav.tsx` (link kembali + 3 nav item Profile/Notifications/Preferences), bukan lagi sidebar workspace penuh. `readme.md` project Claude Design diperbarui menjelaskan alur baru ini.
* **KI-020 resolved** — Layout footer sidebar `WorkspaceSideNav.tsx` sebelumnya memakai `<HStack justify="between">` yang membungkus 3 children langsung (Notifikasi, Theme, Avatar) sehingga menyebar rata, berbeda dari Design System (`.sidebar-footer`) yang mengelompokkan Theme+Avatar jadi satu klaster di kanan (via `margin-left:auto` pada tombol Theme) dengan Notifikasi sendiri di kiri. King Rezi memutuskan kode ikut Design System — outer `HStack justify="between"` sekarang membungkus 2 grup: IconButton Notifikasi sendiri, dan HStack baru berisi IconButton Theme + DropdownMenu Avatar (grup kanan). Terverifikasi manual di browser (Notifikasi kiri, Theme+Avatar mengelompok kanan, dropdown avatar tetap normal), `tsc --noEmit` bersih.
* **KI-019 resolved** — Footer sidebar `WorkspaceSideNav.tsx` sebelumnya memakai `DropdownMenu` dengan tombol teks nama/email (`button={{ label: userName || userEmail, variant: "ghost" }}`), berbeda jenis elemen dari Design System (`components/navigation.html` di Claude Design) yang memakai avatar bulat berisi inisial. King Rezi memutuskan kode mengikuti Design System (bukan sebaliknya) — tombol diganti `isIconOnly` dengan `icon: <Avatar name={userName || userEmail} size="sm" />`, `hasChevron={false}`, `aria-label` nama/email dipertahankan. Terverifikasi manual di browser (light & dark mode, dropdown Profile/Logout normal, tanpa regresi). Layout container `justify="between"` (KI-020) resolved terpisah — lihat bullet di atas.

---

## Recent Decisions (Ringkasan)

5 ADR terakhir. Daftar lengkap (indeks + link ke tiap ADR): lihat `DECISIONS.md`.

* **ADR-076** — Workspace context pindah ke cookie (hapus dynamic segment `[slug]`, route group `(app)`) + Settings dikonsolidasi jadi Organization + Account dengan entry point avatar tunggal — menggantikan Workspace Selector yang tidak pernah dibangun (KI-023).
* **ADR-075** — Amandemen ADR-071: sinkronisasi kutipan `migration.sql` bucket `avatars` (resolusi KI-018).
* **ADR-074** — Reduksi struktur role dari 4 jadi 3 (Account Owner, Admin, Creator) — resolusi KI-017.
* **ADR-073** — Prisma External Tables (`initShadowDb` + `tables.external`) untuk shadow database menangani tabel platform Supabase (`storage.buckets`) — resolusi KI-016.
* **ADR-072** — Tabel `workspace_invitations` terpisah untuk invite member yang belum punya akun (T-007.1/.2).

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
