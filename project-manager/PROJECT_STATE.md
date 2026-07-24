# PROJECT STATE

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.11     |
| Status       | Active     |
| Last Updated | 2026-07-24 |

---

# Current Status

| Item              | Value                            |
| ----------------- | -------------------------------- |
| Current Phase     | Phase 5 — Repository & Bootstrap |
| Current Milestone | M7 — Repository & Bootstrap      |
| Current Sprint    | Sprint 5                         |
| Overall Progress  | 100% (M7)                        |
| Project Status    | M7 Complete — siap M8            |

---

# Current Focus

M7 Repository & Bootstrap **selesai**. Siap M8 Development.

* **AI Context layer** (`context/`) sudah di-scaffold (opsi A) — indeks + aturan operasional agent; bukan duplikasi baseline.
* `AGENTS.md` di root sudah ada; skill resmi vendor yang relevan (Prisma,
  Better Auth, Vercel, Supabase) sudah terpasang di `.agents/skills/`.
* Alignment ADR-040 pada dokumentasi baseline dan schema/migration sudah
  selesai. Implementasi runtime Outstand tetap bagian M8 dan belum dinyatakan
  selesai.
* Alignment dokumentasi ADR-041 selesai: Engineering Baseline, Project
  Overview, AGENTS, dan AI Context sudah memakai Astryx permanen, neutral theme
  M8, Tailwind layout-only, wrapper selektif, serta exact pin Beta. Instalasi
  dan smoke test Next.js 16 juga sudah selesai.

---

# Active Conversation Mode

Current Mode: Ready for Development

Current Phase: Phase 5 complete → siap Phase 6 / M8 Development

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

# Milestone Progress

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
| M8 — Development             | ⏳ Pending      |
| M9 — Testing & Release       | ⏳ Pending      |

---

# Completed

* **AI Context — opsi A:** scaffold `context/` (`README.md` + 8 `ctx-*.md`) sebagai indeks + aturan operasional; Product/User di `ctx-business`, UX di `ctx-design`, coding rules di `ctx-development`, pola fitur di `ctx-implementation`. Update `AGENTS.md` + root `README.md`.
* Membuat `AGENTS.md` di root — pintu masuk AI agent; merujuk Project OS, skills, aturan keras M8, dan struktur `context/`.
* Memasang official agent skills di `.agents/skills/` + `skills-lock.json`
  (Prisma, Better Auth, Vercel React, Supabase). Skill UI lama sudah dihapus
  setelah Astryx ditetapkan sebagai fondasi.
* Membuat `project-manager/ARCHITECTURE_OVERVIEW.md` — High-Level Architecture Overview sebagai blueprint Figma (System Context & Containers + Internal Layers & Domains).
* Menentukan arah project.
* Memilih Hybrid Monorepo sebagai strategi repository.
* Memilih Bun sebagai JavaScript runtime.
* Memilih Next.js sebagai framework utama.
* Menentukan penggunaan Domain-Driven Design (DDD).
* Menentukan penggunaan Modular Monolith Architecture.
* Menentukan Outstand sebagai external integration provider.
* Menetapkan Target Market:
  Marketing Team (utama), Startup dan Digital Agency (sekunder).
* Membuat dokumentasi dasar Project OS.
* Menyelesaikan dokumentasi `product-discovery/01-business/`.
* Menyelesaikan Business Review untuk `product-discovery/01-business/`.
* Menetapkan `product-discovery/01-business/` sebagai Baseline v1.0 (ADR-007).
* Menyelesaikan dokumentasi `product-discovery/02-product/`.
* Menyelesaikan Product Review lintas dokumen pada `product-discovery/02-product/`.
* Menambahkan `product-discovery/02-product/future-roadmap.md` untuk melengkapi artefak Product Planning.
* Menetapkan `product-discovery/02-product/` sebagai Baseline v1.0 (ADR-008).
* Menyelesaikan dokumentasi `product-discovery/03-user/` (9 dokumen).
* Menyelesaikan User Discovery Review untuk `product-discovery/03-user/`.
* Menetapkan `product-discovery/03-user/` sebagai Baseline v1.0 (ADR-009).
* Menyelesaikan M1 — Discovery.
* Menyelesaikan dokumentasi `product-discovery/04-ux/information-architecture.md`.
* Menyelesaikan dokumentasi `product-discovery/04-ux/user-flows.md`.
* Menyelesaikan dokumentasi `product-discovery/04-ux/navigation-patterns.md`.
* Menyelesaikan dokumentasi `product-discovery/04-ux/key-screen-patterns.md`.
* Membuat `product-discovery/02-product/roles-permissions.md` — definisi 4 roles (Owner, Admin, Manager, Creator), set status konten kanonikal, dan aturan transisi per role.
* Mencatat ADR-012 di `DECISIONS.md` — addendum Product Baseline untuk dokumen roles-permissions.
* Menyelesaikan UX Planning Review — semua 4 inkonsistensi (REVIEW-01 s/d REVIEW-04) telah diperbaiki.
* Menetapkan `product-discovery/04-ux/` sebagai UX Planning Baseline v1.0 (ADR-013).
* Menyelesaikan M4 — UX Planning.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/domain-model.md` — 10 bounded context, context map, shared types, dan domain boundary rules.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/database-strategy.md` — multi-tenancy RLS, 22 tabel untuk 10 BC, storage strategy, index strategy, dan soft delete strategy.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/application-layer.md` — 4-layer stack, Next.js entry point patterns, service contracts per BC, repository pattern, cross-domain communication, dan error handling strategy.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/integration-layer.md` — Anti-Corruption Layer (OutstandAdapter), ConnectedAccount OAuth flow, publishing flow, webhook handling, engagement sync, analytics sync, dan error handling strategy.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/background-jobs.md` — PostgreSQL job queue, Railway Cron, 4 job types (webhook retry, post notification, engagement sync, analytics sync), dan retry strategy.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/realtime-strategy.md` — Supabase Realtime untuk notifikasi in-app, manual refresh patterns, notification type registry, dan RLS subscription rules.
* Menyelesaikan dokumentasi `product-discovery/05-architecture/auth-architecture.md` — Better Auth, HTTP-only session cookie, Middleware workspace context resolution, RBAC di Application Service, dan RLS defense-in-depth.
* Menyelesaikan Architecture Review `product-discovery/05-architecture/` — 8 inkonsistensi ditemukan dan diperbaiki (ARCH-REVIEW-01 s/d ARCH-REVIEW-08), meliputi: nama tabel notification, klarifikasi RLS dual-context, penambahan `background_jobs` ke database-strategy, media signed URL, eliminasi circular dependency AI↔Publishing, perbaikan JOB-03, referensi `webhook_event_log`, dan konsistensi retry count.
* Menetapkan `product-discovery/05-architecture/` sebagai System Architecture Baseline v1.0 (ADR-025).
* Menyelesaikan M5 — System Architecture.
* Menyelesaikan dokumentasi `product-discovery/06-engineering/deployment-infrastructure.md` — region Singapore/SEA, topologi Production + Staging, Supabase project terpisah per environment, arsitektur service Railway (web + cron), build/deploy pipeline, scaling, dan rollback strategy (ADR-028, ADR-029).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/auth-strategy.md` — konfigurasi Better Auth, provider (email/password + Google OAuth), session cookie, integrasi Supabase JWT dual-context untuk Realtime, dan konfigurasi per environment (ADR-030).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/database-orm.md` — Prisma sebagai ORM formal, batas Supabase client (Realtime/Storage), Prisma Migrate, Supavisor pooling, Better Auth Prisma adapter (ADR-031).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/cicd-pipeline.md` — GitHub Actions quality gates, promosi feature→staging→main, Railway CD, migrate on release (ADR-032).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/environment-management.md` — katalog env vars, secret native (Railway + `.env.local`), project Cloud `social-media-local` / staging / prod, rencana cloud→self-host (ADR-033).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/dx-tooling.md` — ESLint + Prettier, Lefthook + Vitest, script workspace & local setup (ADR-034).
* Menyelesaikan dokumentasi `product-discovery/06-engineering/dependency-strategy.md` — caret ranges, lockfile root, penempatan dep, aturan shared package, update manual (ADR-035).
* Menyelesaikan seluruh 8 dokumen M6 Engineering Planning.
* Menyelesaikan Engineering Planning Review — 6 inkonsistensi ditemukan dan diperbaiki (ENG-REVIEW-01 s/d ENG-REVIEW-06).
* Menetapkan `product-discovery/06-engineering/` sebagai Engineering Planning Baseline v1.0 (ADR-036).
* Menyelesaikan M6 — Engineering Planning.
* **M7 slice B — Monorepo inti:** root Bun Workspaces, `apps/web` (Next.js App Router + 9 domain modules + route placeholders), `packages/shared` (branded IDs, enums, value objects), root `README.md` / `.gitignore` / `tsconfig.json`; `bun run typecheck` & `bun run build` hijau.
* Menetapkan lokasi env M7: `apps/web/.env.example` + `apps/web/.env.local` (EM-D04 dikunci di `environment-management.md`).
* **M7 DX tooling:** ESLint + Prettier (root), Lefthook + lint-staged (`prepare`), Vitest di root + smoke test `@social/shared`; script root sesuai DX-D04; `git init` di root (branch `main`); verifikasi `lint` / `format:check` / `test` / `typecheck` hijau.
* DX-D06 / DX-D07 dikunci di `dx-tooling.md` (Vitest config di root; Lefthook via `prepare`).
* **M7 Prisma + Auth + env + CI (selesai):**
  * `apps/web/prisma/schema.prisma` — identity_* (Better Auth) + tabel domain MVP + `background_jobs`; migrasi awal `20260717100000_init`.
  * Prisma Client singleton (`src/lib/prisma/client.ts`); Prisma **7.x** — migrate via `prisma.config.ts` (`DIRECT_URL`), runtime via `@prisma/adapter-pg` (`DATABASE_URL`) (DO-D04).
  * Better Auth skeleton (`src/lib/better-auth/auth.ts`) + route `/api/auth/[...all]`; JWT Realtime helper (AS-D03); Supabase client stubs (Realtime/Storage only).
  * Env fail-fast (`src/lib/env.ts`) + `apps/web/.env.example` (EM-D04/EM-D05).
  * `.github/workflows/ci.yml` — gates CI-D02 (install → prisma generate/validate → typecheck → lint → test).
* **ADR-040 alignment selesai:** kontrak resmi Outstand sudah diselaraskan pada
  Product/UX/Architecture/Engineering dan schema/migration. Ini menyelesaikan
  alignment, bukan implementasi runtime.
* **ADR-041 implementasi fondasi UI selesai:** Astryx Core, Neutral Theme, CLI,
  dan StyleX dipasang dengan exact pin `0.1.8` / `0.19.0`; provider global,
  CSS cascade Tailwind, token bridge, dan halaman smoke terintegrasi. Button,
  Dialog, TextInput, Table, light/dark mode, CLI doctor, typecheck, lint, test,
  browser interaction, serta Next.js 16 production build sudah terverifikasi.
* **ADR-042 — Claude Design menggantikan Figma:** project `Social Media
  Management` dibuat di Claude Design (token neutral interim, foundations,
  components, 8 layar KSP-01–08). Pointer di `design/README.md`; workflow di
  `ctx-design.md`. Sinkronisasi manual/on-request via tool `DesignSync`.
* **ADR-043 — API mobile-ready alignment selesai:** `application-layer.md`
  (Route Handler v1 — Mobile Client, AL-D08) dan `auth-strategy.md` (Bearer
  plugin, AS-D06) sudah diselaraskan; `auth-architecture.md` diperjelas
  (AU-D11). Ini menyelesaikan alignment dokumentasi, bukan implementasi
  runtime endpoint `/api/v1`.
* **Migrasi Next.js 16 middleware → Proxy selesai:** `apps/web/src/middleware.ts`
  di-rename menjadi `src/proxy.ts` (fungsi `middleware` → `proxy`), sesuai
  https://nextjs.org/docs/messages/middleware-to-proxy. Behavior tidak
  berubah — auth guard + workspace context injection tetap sama. Referensi
  path di `monorepo-setup.md`, `database-orm.md`, `auth-strategy.md` sudah
  disesuaikan. Warning deprecation di `bun run dev` sudah hilang.
* **M8 bootstrap — Supabase Cloud + DB migrate selesai:** project Supabase
  Cloud `social-media-local` dibuat (region SEA), `apps/web/.env.local` diisi,
  `bun run db:migrate` diterapkan — 4 migrasi (`init`, `add_content_format`,
  `align_outstand_contract`, dan satu migrasi baru untuk menyamakan index
  `engagement_inbox_items` yang ter-truncate Postgres) sukses; `prisma migrate
  status` konfirmasi database up to date.
* **ADR-044 — rename env var Supabase publishable key:**
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` di
  `environment-management.md`, `.env.example`, `env.ts`, dan
  `lib/supabase/client.ts`, mengikuti sistem API key baru Supabase (anon key
  legacy dijadwalkan deprecated).
* **M8 — Auth Flows UI selesai (Login, Register, Forgot/Reset Password):**
  4 layar di `apps/web/src/app/(auth)/` (login, register, forgot-password,
  reset-password baru) mengikuti referensi Claude Design (ADR-042 supplement
  Auth Flow) dan workflow Astryx CLI wajib. Better Auth React client
  (`lib/better-auth/client.ts`), `googleOAuthEnabled()` (tombol Google
  disembunyikan otomatis bila env kosong), dan `sendResetPassword` stub
  (log tautan reset ke console, testable lokal tanpa provider email AS-D04).
  Typecheck/lint hijau; sign-up diverifikasi end-to-end via API. Verify-email
  disengaja tidak dibangun dulu karena `requireEmailVerification` masih
  nonaktif (AS-D04 belum ada provider).

---

# In Progress

* Tidak ada item alignment atau smoke test yang sedang dikerjakan. Fokus
  berikutnya: M8 Development — lanjut ke workspace onboarding setelah auth
  flows UI.
* Template `design-tokens.md` sudah disiapkan (status Draft / TBD); nilai final
  diisi setelah feature selesai dan designer masuk (ADR-041 mengamendemen urutan
  kerja ADR-038).
* ADR-039 dikunci: Content Format MVP terdokumentasi di Product/UX/Architecture + enum `ContentFormat` + migrasi Prisma; UI Draft Editor belum diimplementasi.

---

# Next Tasks

* **M8 — Development:** auth flows UI selesai; lanjut fitur produk berikutnya (workspace onboarding, publishing MVP, dll.) sesuai baseline + `context/`.
* **Outstand runtime (ADR-040):** implementasikan `OutstandAdapter`, webhook
  `post.published` / `post.error` / `account.token_expired` dengan
  durable-before-ACK, job retry internal, media upload working copy, serta
  engagement comment/reply sync 30 menit + manual refresh.
* **Operasional X:** Project Owner mengonfigurasi kredensial BYOK X secara
  manual di dashboard Outstand; aplikasi tidak membuat form atau secret store X.
* **Publishing MVP:** Draft Editor harus mengimplementasi Content Format Selector per akun (ADR-039) — jangan ship New Post tanpa Post/Reel/Story (IG/FB) dan Pin (Pinterest).
* **API mobile (ADR-043):** siapkan skema `apps/web/app/api/v1/...` dan
  konfigurasi Better Auth Bearer plugin (`trustedOrigins`,
  `rateLimit.customRules`) mendahului M8 web berjalan jauh. Endpoint mobile
  aktual (WorkspaceService → PublishingService → EngagementService →
  NotificationService) dikerjakan setelah MVP web selesai — bukan sekarang.
* **Setelah feature selesai dan design UI di-approve:** isi nilai di
  `product-discovery/06-engineering/design-tokens.md` (ganti `TBD`), ubah status
  → Locked, lalu mirror ke Astryx theme + Tailwind token bridge (ADR-038,
  ADR-041).
* (Opsional) Perkaya aturan coding di `context/ctx-development.md` saat konvensi baru muncul dari praktik M8.
* (Opsional) initial git commit — menunggu instruksi eksplisit.
* (Opsional) pilih transactional email provider (AS-D04) saat butuh verification / password reset.

---

# Known Issues

* **Dependency terbuka — Transactional Email Provider.** Password reset & email verification (Better Auth) membutuhkan email provider yang belum ditetapkan (kandidat: Resend, Postmark, AWS SES, SMTP Supabase). Dicatat di `auth-strategy.md` (AS-D04). `requireEmailVerification` dinonaktifkan sementara di skeleton. Tidak memblokir M8 awal.
* **Belum ada commit awal.** Repo sudah `git init` (branch `main`); working tree belum di-commit — commit awal menunggu instruksi eksplisit.
* **RLS SQL policies** belum digenerate di migrasi awal — ditambahkan saat jalur server set `app.current_user_id` diimplementasi (DO-D06).
* **Runtime ADR-040 belum diimplementasikan.** Alignment dokumentasi dan
  schema/migration sudah selesai, tetapi handler webhook, durable ingestion,
  retry internal, media upload Outstand, engagement sync/reply, dan reconnect
  flow masih task M8.
* **Astryx masih Beta.** Kompatibilitas dasar Next.js 16 sudah dibuktikan lewat
  smoke test dan production build, tetapi risiko perubahan API tetap dikelola
  dengan exact pin, tanpa canary/swizzle, wrapper selektif, update manual, dan
  verifikasi ulang saat upgrade.
* **Hydration gagal saat diakses lewat tunnel ngrok.** Saat uji halaman auth
  lewat tunnel ngrok yang dipakai untuk `BETTER_AUTH_URL`, seluruh halaman
  (bukan spesifik komponen auth) tidak ter-hydrate — tidak ada React fiber
  di elemen manapun meski `window.next` termuat tanpa error console; klik
  submit jatuh ke native HTML form-submit. Kemungkinan besar isu HMR/
  WebSocket Turbopack lewat ngrok. Belum diselidiki lebih lanjut (di luar
  scope auth flows UI); backend/API sendiri terverifikasi benar via raw
  `fetch()`. Perlu ditelusuri sebelum uji interaksi form penuh di browser
  lewat ngrok bisa diandalkan.

---

# Blockers

Tidak ada blocker saat ini.

---

# Recent Decisions

* ADR-044 — Rename env var client-side Supabase:
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  mengikuti sistem API key baru Supabase (publishable/secret key
  menggantikan anon/service_role secara bertahap); tidak ada perubahan
  behavior (2026-07-24).
* ADR-043 — API mobile-ready via Route Handler `/api/v1` (Next.js App
  Router) di atas Application Service yang sama dengan web; tidak ada
  backend terpisah. Better Auth Bearer plugin untuk auth mobile
  (menggantikan cookie session), workspace context eksplisit per
  path/header, versioning `/api/v1`→`/api/v2` untuk breaking change, dan 4
  syarat keamanan wajib (secure device storage, `trustedOrigins` custom
  scheme, keputusan session expiry mobile, `rateLimit.customRules` per
  endpoint). Fondasi disiapkan sebelum M8 berjalan jauh; endpoint mobile
  aktual dikerjakan setelah MVP web selesai (2026-07-24).
* ADR-042 — Claude Design menggantikan Figma sebagai design handoff tool;
  project `Social Media Management` (`84aded99-bb23-49b1-be9f-dd8f21c6873e`)
  berisi token neutral, foundations, components, dan 8 layar KSP; sinkronisasi
  dengan `product-discovery/` bersifat manual/on-request, bukan otomatis
  (2026-07-24).
* ADR-041 — Astryx menggantikan shadcn/ui sebagai fondasi komponen permanen;
  neutral theme dipakai selama feature development, Tailwind dibatasi ke
  layout, wrapper selektif, designer masuk setelah feature selesai, dan risiko
  Beta diterima dengan exact pin + smoke test (2026-07-23).
* ADR-040 — kontrak resmi Outstand: webhook
  `post.published`/`post.error`/`account.token_expired`,
  durable-before-ACK + retry internal, Engagement komentar/reply via sync 30
  menit + manual refresh tanpa DM/webhook engagement, Supabase original +
  Outstand media working copy, dan X BYOK manual di dashboard Outstand
  (2026-07-23).
* ADR-039 — Content Format (Post/Reel/Story/Pin) masuk MVP Publishing; format per `PostTarget`; matriks platform + Outstand ACL (2026-07-21).
* ADR-038 + ADR-041 — SoT design tokens tetap di
  `product-discovery/06-engineering/design-tokens.md`; neutral theme Astryx
  dipakai selama M8 dan nilai final diisi setelah feature selesai serta designer
  masuk; `design/` bukan SoT token.
* ADR-037 — Perluasan aditif `SocialPlatform`: Threads & Pinterest ditambah; Twitter/X & LinkedIn tetap. Daftar resmi: Instagram, Facebook, Twitter/X, LinkedIn, TikTok, YouTube, Threads, Pinterest (2026-07-21).
* AI Context — opsi A: pertahankan 8 `ctx-*.md`; Product+User di `ctx-business`; UX di `ctx-design`; coding rules di `ctx-development` + pola fitur di `ctx-implementation` (2026-07-17).
* M7 — Prisma **7.x**: URL di `prisma.config.ts` (`DIRECT_URL`) + runtime adapter (`DATABASE_URL`); semantik DO-D04 tetap (2026-07-17).
* M7 — DX-D06/DX-D07: Vitest di root; Lefthook via `prepare` (2026-07-17).
* M7 — Lokasi env file: `apps/web/` (EM-D04 dikunci; Architecture README tidak mengatur lokasi env).
* ADR-025 — System Architecture Baseline v1.0 ditetapkan: product-discovery/05-architecture/ (2026-07-15).
* ADR-026 — Monorepo Workspace Layout: apps/web, packages/shared, domain modules di src/domains/ (2026-07-15).
* ADR-027 — Amandemen ADR-014: pengecualian penamaan tabel aggregate root (`workspaces`, `notifications`) (2026-07-15).
* ADR-028 — Deployment Region: Singapore/SEA, Railway + Supabase co-located (2026-07-17).
* ADR-029 — Environment Topology: Production + Staging dengan Supabase project terisolasi (2026-07-17).
* ADR-030 — Auth Implementation: Better Auth config + Supabase JWT integration untuk Realtime (2026-07-17).
* ADR-031 — Database Access: Prisma sebagai ORM formal; amandemen ADR-017 (2026-07-17).
* ADR-032 — CI/CD: GitHub Actions gates + Railway deploy + migrate on release (2026-07-17).
* ADR-033 — Environment Management: Supabase Cloud-first, native secrets, project `social-media-local` (2026-07-17).
* ADR-034 — DX Tooling: ESLint + Prettier, Lefthook + lint-staged, Vitest (2026-07-17).
* ADR-035 — Dependency Strategy: caret ranges, manual updates, root lockfile rules (2026-07-17).
* ADR-036 — Engineering Planning Baseline v1.0 ditetapkan: product-discovery/06-engineering/ (2026-07-17).

Lihat `DECISIONS.md` untuk daftar selengkapnya.

---

# Related Documents

* PROJECT_OVERVIEW.md
* ARCHITECTURE_OVERVIEW.md
* PROJECT_RULES.md
* DECISIONS.md
* ../product-discovery/06-engineering/
* ../product-discovery/05-architecture/
* ../product-discovery/04-ux/
