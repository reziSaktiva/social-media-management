# PROJECT STATE

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 1.0.3      |
| Status       | Active     |
| Last Updated | 2026-07-21 |

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
* `AGENTS.md` di root sudah ada; skill resmi vendor (Prisma, Better Auth, Vercel, Supabase, shadcn) sudah terpasang di `.agents/skills/`.

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
* Memasang official agent skills di `.agents/skills/` + `skills-lock.json` (Prisma, Better Auth, Vercel React, Supabase, shadcn).
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

---

# In Progress

* Tidak ada item dokumentasi AI Context yang sedang dikerjakan — scaffold `context/` selesai. Fokus berikutnya: M8 Development.

---

# Next Tasks

* **M8 — Development:** mulai fitur produk (auth flows UI, workspace onboarding, publishing MVP, dll.) sesuai baseline + `context/`.
* (Opsional) Perkaya aturan coding di `context/ctx-development.md` saat konvensi baru muncul dari praktik M8.
* Buat project Supabase Cloud `social-media-local` dan jalankan `bun run db:migrate` terhadap `.env.local`.
* (Opsional) initial git commit — menunggu instruksi eksplisit.
* (Opsional) pilih transactional email provider (AS-D04) saat butuh verification / password reset.

---

# Known Issues

* **Dependency terbuka — Transactional Email Provider.** Password reset & email verification (Better Auth) membutuhkan email provider yang belum ditetapkan (kandidat: Resend, Postmark, AWS SES, SMTP Supabase). Dicatat di `auth-strategy.md` (AS-D04). `requireEmailVerification` dinonaktifkan sementara di skeleton. Tidak memblokir M8 awal.
* **Next.js 16 middleware deprecation warning.** Baseline masih memakai `middleware.ts`; evaluasi migrasi ke `proxy` belakangan jika Next menstabilkan API pengganti — tidak memblokir.
* **Belum ada commit awal.** Repo sudah `git init` (branch `main`); working tree belum di-commit — commit awal menunggu instruksi eksplisit.
* **RLS SQL policies** belum digenerate di migrasi awal — ditambahkan saat jalur server set `app.current_user_id` diimplementasi (DO-D06).

---

# Blockers

Tidak ada blocker saat ini.

---

# Recent Decisions

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
