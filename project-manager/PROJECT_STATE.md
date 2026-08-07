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
| Version      | 1.0.46     |
| Status       | Active     |
| Last Updated | 2026-08-07 |

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

### KI-019 · Footer sidebar: avatar bulat (Design System) vs tombol teks nama (Web)

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Design-Consistency |
| Terkait | `apps/web/src/app/[slug]/components/WorkspaceSideNav.tsx`, project Claude Design "Social Media Management" |

Design System (`components/navigation.html` di Claude Design) me-render
footer sidebar dengan avatar bulat berisi inisial saja
(`<span class="avatar-round">RK</span>` dibungkus icon button
`aria-label="Menu akun"`), tanpa teks nama sama sekali. Implementasi web
(`WorkspaceSideNav.tsx` baris ~116-121) memakai `DropdownMenu` dengan
`button={{ label: userName || userEmail, variant: "ghost" }}` — ini tombol
TEKS nama/email, bukan komponen `Avatar`. Bukan cuma beda posisi visual,
elemen UI yang dipakai memang berbeda jenis (avatar bulat vs text button).

Ditemukan 2026-08-07 saat King Rezi mengecek Design System pasca-implementasi
T-007.4. Murni pencatatan temuan — resolusi (Design System ikut kode, kode
ikut Design System, atau keduanya direvisi) belum diputuskan, tidak ada
perbaikan kode yang dilakukan.

### KI-020 · Layout footer sidebar: grouping (Design System) vs spread merata `justify="between"` (Web)

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Design-Consistency |
| Terkait | `apps/web/src/app/[slug]/components/WorkspaceSideNav.tsx`, project Claude Design "Social Media Management" |

Design System CSS (`.sidebar-footer` di `styles.css`) tidak memakai
`justify-content` pada container-nya (cuma `display:flex; gap:var(--spacing-1)`)
— efek "renggang" didapat dari `margin-left:auto` yang ditempel LANGSUNG pada
tombol Theme, sehingga Notifikasi menempel kiri sementara Theme+Avatar
mengelompok jadi satu klaster di kanan. Implementasi web
(`WorkspaceSideNav.tsx` baris ~97) memakai
`<HStack gap={2} align="center" justify="between" width="100%">` yang
membungkus 3 children langsung (IconButton Notifikasi, IconButton Theme,
DropdownMenu Avatar/nama) — `justify="between"` di container menyebar
ketiganya dengan jarak SAMA rata (Notifikasi kiri, Theme di tengah, Avatar
di kanan), bukan mengelompokkan Theme+Avatar jadi satu grup di kanan seperti
Design System.

Ditemukan 2026-08-07 saat King Rezi mengecek Design System pasca-implementasi
T-007.4. Murni pencatatan temuan — resolusi (Design System ikut kode, kode
ikut Design System, atau keduanya direvisi) belum diputuskan, tidak ada
perbaikan kode yang dilakukan.

### KI-021 · Klik avatar tidak memunculkan menu Profile/Logout di Design System — alur Logout belum pernah dimodelkan

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Design-Consistency |
| Terkait | `apps/web/src/app/[slug]/components/WorkspaceSideNav.tsx`, project Claude Design "Social Media Management" |

Design System (`templates/app-prototype/AppPrototype.dc.html`, fungsi
`route()`) tidak punya logic apa pun untuk membuka dropdown/menu saat avatar
diklik — satu-satunya handler yang cocok adalah
`if (el.querySelector && el.querySelector('.avatar-round')) return this.go('settings-connected-accounts');`
yang langsung pindah screen, tanpa render menu. Tidak ada satu pun logout
screen/logic di seluruh daftar 12 screen prototype (`SCREENS` array) — alur
logout memang belum pernah dimodelkan di Design System sama sekali.
Implementasi web sudah punya alur lengkap: `DropdownMenu` dengan item
Profile + divider + Logout (yang membuka `AlertDialog` konfirmasi Tier 2
sesuai ADR-049/NP-D10). Root cause: fitur Logout (T-016.5) dan alur akun
(T-016.1-3) dikerjakan setelah Design System prototype dibuat, dan Design
System tidak pernah disinkronkan ulang untuk merefleksikan fitur-fitur ini.

Ditemukan 2026-08-07 saat King Rezi mengecek Design System pasca-implementasi
T-007.4. Murni pencatatan temuan — resolusi (Design System ikut kode, kode
ikut Design System, atau keduanya direvisi) belum diputuskan, tidak ada
perbaikan kode yang dilakukan.

### KI-022 · Klik avatar ke Workspace Settings (Design System) vs ke User Settings `/account/profile` (Web)

| Field | Value |
|-------|-------|
| Status | Open |
| Kategori | Design-Consistency |
| Terkait | `apps/web/src/app/[slug]/components/WorkspaceSideNav.tsx`, project Claude Design "Social Media Management" |

Design System: baris kode yang sama di KI-021 (`route()` handler avatar)
mengarahkan ke `settings-connected-accounts` — bagian dari Workspace
**Settings**. Implementasi web: item "Profile" di `DropdownMenu`
mengarahkan ke `/account/profile` (`router.push("/account/profile")`) —
route User **Settings** (bukan Workspace Settings). Implementasi web ini
sebenarnya SESUAI baseline UX
(`product-discovery/04-ux/information-architecture.md`: "User Settings
diakses via Avatar/user menu" vs "Workspace Settings diakses via Workspace
Selector") — jadi kemungkinan Design System yang perlu diperbarui mengikuti
baseline, bukan sebaliknya, tapi keputusan final ini tetap milik King Rezi
(belum diputuskan sesi ini).

Ditemukan 2026-08-07 saat King Rezi mengecek Design System pasca-implementasi
T-007.4. Murni pencatatan temuan — resolusi (Design System ikut kode, kode
ikut Design System, atau keduanya direvisi) belum diputuskan, tidak ada
perbaikan kode yang dilakukan.

---

## Blockers

Tidak ada blocker saat ini.

---

## Completed (Ringkasan)

Berikut ~5 item terakhir yang diselesaikan. Riwayat lengkap (sejak M0): lihat `COMPLETE_TASK.md` — ⚠️ jangan dibaca AI kecuali diperintah eksplisit King Rezi.

* **T-007.4 selesai** — UI daftar anggota `/settings/members` (Astryx Table): `page.tsx` diganti dari `ScaffoldPlaceholder` jadi server component nyata, `MembersTable.tsx` (client component baru, kolom Member/Role/Status/Actions). Tombol Change Role/Remove disabled dengan tooltip (menunggu T-007.5), disembunyikan untuk baris Owner/diri sendiri. Backend: `WorkspaceService.listMembersWithUser` + repository method baru (domain `workspace`), 26 unit test pass, `tsc`/lint bersih. Verifikasi visual browser belum dilakukan (tidak ada kredensial test user) — known gap, bukan klaim selesai penuh.
* **KI-016 resolved** — Shadow database Prisma gagal (P3006) untuk migrasi berikutnya, diatasi permanen lewat fitur resmi Prisma 7 External Tables (`initShadowDb` + `tables.external`) di `apps/web/prisma.config.ts`, tanpa mengubah migration history yang sudah applied. Terverifikasi end-to-end (replay shadow DB, `migrate status` bersih, uji `migrate dev --create-only` tanpa P3006). Lahir **ADR-073**. Temuan terpisah selama verifikasi (staleness ADR-071) dicatat sebagai KI-018 baru.
* **KI-018 resolved** — Kutipan `migration.sql` di ADR-071 ("Catatan implementasi") stale terhadap kode aktual (`ON CONFLICT DO NOTHING` tanpa guardrail, padahal kode sudah `ON CONFLICT DO UPDATE` + guardrail `file_size_limit`/`allowed_mime_types`). Diperbaiki lewat amandemen **ADR-075** — DECISIONS.md append-only, jadi kutipan disinkronkan via ADR baru, bukan edit diam-diam ADR-071.
* **T-016.1/2/3/5 selesai** — Account & user settings screens: layout `account/`+`settings/` (sidebar/nav internal), `/account/profile` (edit nama + avatar, domain `identity` diisi pertama kali), `/account/preferences` (toggle tema), dialog konfirmasi Logout (ADR-049 Tier 2). Lolos review arsitektur Ridwan (nihil temuan) dan QA end-to-end Najwa + verifikasi tambahan sesi utama. Bucket `avatars` diperluas untuk avatar user personal lewat **ADR-071**. T-016.4 (notifications) tetap Blocked, menunggu T-036 (v0.2). Known Issue baru: KI-014 (domain `identity` belum ada unit test).
* **KI-013 resolved** — Instalasi self-hosted Better Auth (ADR-070) terverifikasi jalan normal di `localhost:3000` (login/register berhasil, session/cookie terbaca) tanpa ngrok. `db:studio` script ditambahkan (`bun run db:studio`) untuk lihat data `identity_*`/domain lain via Prisma Studio. `QA_TEST_ACCOUNTS.md` diperbarui — verifikasi browser tidak lagi wajib tanya URL tunnel.
* **ADR-070** — Tetap self-hosted Better Auth, tolak Better Auth Cloud. Requirement tunnel ngrok di dev mode ternyata berasal dari constraint Better Auth Cloud (Base URL wajib publik, sempat dipakai tanpa tercatat ADR), bukan keterbatasan Better Auth self-hosted. Migrasi ke Supabase Auth dipertimbangkan lalu ditolak. Instalasi self-hosted (`localhost:3000` + Supabase Cloud, tanpa Railway) dilakukan mandiri oleh King Rezi.

---

## Recent Decisions (Ringkasan)

5 ADR terakhir. Daftar lengkap (indeks + link ke tiap ADR): lihat `DECISIONS.md`.

* **ADR-073** — Prisma External Tables (`initShadowDb` + `tables.external`) untuk shadow database menangani tabel platform Supabase (`storage.buckets`) — resolusi KI-016.
* **ADR-072** — Tabel `workspace_invitations` terpisah untuk invite member yang belum punya akun (T-007.1/.2).
* **ADR-071** — Perluasan bucket Supabase Storage `avatars` (publik) untuk juga menampung avatar user personal (T-016.2), path baru `avatars/users/{user_id}/avatar.{ext}` di samping path avatar workspace yang sudah ada. Tidak membuat bucket baru.
* **ADR-070** — Tetap self-hosted Better Auth, tolak Better Auth Cloud (resolusi akar masalah KI-013).
* **ADR-069** — Konvensi penamaan & peletakan komponen lokal di `src/app/` (resolusi KI-010): PascalCase untuk file component, kebab-case untuk folder & file non-component, peletakan `components/` berbasis lowest common ancestor (LCA) route.

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
