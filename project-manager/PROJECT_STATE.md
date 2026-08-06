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
| Version      | 1.0.45     |
| Status       | Active     |
| Last Updated | 2026-08-06 |

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

---

## Blockers

Tidak ada blocker saat ini.

---

## Completed (Ringkasan)

Berikut ~5 item terakhir yang diselesaikan. Riwayat lengkap (sejak M0): lihat `COMPLETE_TASK.md` — ⚠️ jangan dibaca AI kecuali diperintah eksplisit King Rezi.

* **T-016.1/2/3/5 selesai** — Account & user settings screens: layout `account/`+`settings/` (sidebar/nav internal), `/account/profile` (edit nama + avatar, domain `identity` diisi pertama kali), `/account/preferences` (toggle tema), dialog konfirmasi Logout (ADR-049 Tier 2). Lolos review arsitektur Ridwan (nihil temuan) dan QA end-to-end Najwa + verifikasi tambahan sesi utama. Bucket `avatars` diperluas untuk avatar user personal lewat **ADR-071**. T-016.4 (notifications) tetap Blocked, menunggu T-036 (v0.2). Known Issue baru: KI-014 (domain `identity` belum ada unit test).
* **KI-013 resolved** — Instalasi self-hosted Better Auth (ADR-070) terverifikasi jalan normal di `localhost:3000` (login/register berhasil, session/cookie terbaca) tanpa ngrok. `db:studio` script ditambahkan (`bun run db:studio`) untuk lihat data `identity_*`/domain lain via Prisma Studio. `QA_TEST_ACCOUNTS.md` diperbarui — verifikasi browser tidak lagi wajib tanya URL tunnel.
* **ADR-070** — Tetap self-hosted Better Auth, tolak Better Auth Cloud. Requirement tunnel ngrok di dev mode ternyata berasal dari constraint Better Auth Cloud (Base URL wajib publik, sempat dipakai tanpa tercatat ADR), bukan keterbatasan Better Auth self-hosted. Migrasi ke Supabase Auth dipertimbangkan lalu ditolak. Instalasi self-hosted (`localhost:3000` + Supabase Cloud, tanpa Railway) dilakukan mandiri oleh King Rezi.
* **KI-004 resolved** — Alur UI toggle Light/Dark (klik toggle di sidebar footer → cookie tertulis) sudah diuji lewat browser oleh King Rezi, berhasil sesuai ekspektasi.
* **KI-010 resolved** — Konvensi folder underscore-prefix (`_draft-editor`, `_sidebar-channels`) diganti: file yang meng-export React component pakai PascalCase, folder tetap kebab-case (underscore dihapus), folder `components/` ditaruh di lowest common ancestor (LCA) route pemakainya. Lahir **ADR-069**. Migrasi kode seluruh komponen colocated di `apps/web/src/app/` selesai, lolos review Ridwan dan QA Najwa.

---

## Recent Decisions (Ringkasan)

5 ADR terakhir. Daftar lengkap (indeks + link ke tiap ADR): lihat `DECISIONS.md`.

* **ADR-071** — Perluasan bucket Supabase Storage `avatars` (publik) untuk juga menampung avatar user personal (T-016.2), path baru `avatars/users/{user_id}/avatar.{ext}` di samping path avatar workspace yang sudah ada. Tidak membuat bucket baru.
* **ADR-070** — Tetap self-hosted Better Auth, tolak Better Auth Cloud (resolusi akar masalah KI-013).
* **ADR-069** — Konvensi penamaan & peletakan komponen lokal di `src/app/` (resolusi KI-010): PascalCase untuk file component, kebab-case untuk folder & file non-component, peletakan `components/` berbasis lowest common ancestor (LCA) route.
* **ADR-068** — `react-icons` diperluas jadi library ikon tunggal untuk seluruh icon (brand maupun generik), tidak lagi dibatasi logo brand saja (amandemen ADR-058 poin 6).
* **ADR-067** — Known Issues `Resolved` yang sudah tercatat di `COMPLETE_TASK.md` dihapus dari `PROJECT_STATE.md` (amandemen ADR-066), bukan dibiarkan menumpuk dengan status `Resolved`.

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
