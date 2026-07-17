# CHANGELOG

Seluruh perubahan penting pada dokumentasi maupun implementasi project dicatat pada dokumen ini.

---

## 2026-07-17 (sesi keempat puluh delapan)

### Added — Official agent skills (vendor)

* Prisma: `prisma-cli`, `prisma-client-api`, `prisma-database-setup`, `prisma-upgrade-v7` (`prisma/skills`).
* Better Auth: `better-auth-best-practices`, `create-auth`, `better-auth-security-best-practices`, `email-and-password-best-practices` (`better-auth/skills`).
* Vercel: `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-optimize`, `web-design-guidelines` (`vercel-labs/agent-skills`).
* Supabase: `supabase`, `supabase-postgres-best-practices` (`supabase/agent-skills`).
* shadcn/ui: `shadcn` (`shadcn/ui`).
* `skills-lock.json` — lock hash skill terpasang.

### Notes

* Skill deploy-Vercel / React Native / 2FA / organization / migrate-radix-to-base / Prisma Postgres tidak dipasang (di luar stack MVP).

---

## 2026-07-17 (sesi keempat puluh tujuh)

### Added

* `AGENTS.md` di root — pintu masuk AI coding agent (Source of Truth pointers, skills wajib, hard rules, mapping task → dokumen).

### Changed

* `PROJECT_STATE.md` — catat rencana AI Context layer (`context/` + `ctx-*.md`); `AGENTS.md` masuk Completed; next task scaffold `context/`.
* `CONVERSATIONS.md` — log keputusan struktur AI Context mengikuti screenshot referensi user.

### Notes

* Folder `context/` belum dibuat/diisi — menunggu eksekusi next task (isi sebagai indeks, bukan duplikasi baseline).

---

## 2026-07-17 (sesi keempat puluh enam)

### Changed — Prisma 7 datasource config

* `schema.prisma` — hapus `url`/`directUrl` dari datasource (tidak didukung Prisma 7).
* Tambah `apps/web/prisma.config.ts` — CLI migrate memakai `DIRECT_URL` (DO-D04).
* `src/lib/prisma/client.ts` — `PrismaClient` via `@prisma/adapter-pg` + pooled `DATABASE_URL`.
* Generator `prisma-client` → output `src/generated/prisma` (gitignored).
* Upgrade deps ke Prisma 7.8 + `pg` / `@prisma/adapter-pg`.
* Update cuplikan di `database-orm.md` agar selaras Prisma 7 (semantik DO-D04 tetap).

### Notes

* Error IDE “`url` is no longer supported in schema files” terselesaikan dengan migrasi ke pola Prisma 7.
* Verifikasi: `prisma validate`, `typecheck`, `lint`, `build` hijau.

---

## 2026-07-17 (sesi keempat puluh lima)

### Added — M7 Prisma, Better Auth, env, CI (M7 selesai)

* `apps/web/prisma/schema.prisma` — identity_* + domain MVP + `background_jobs`; migrasi `20260717100000_init`.
* `apps/web/src/lib/prisma/client.ts` — singleton PrismaClient.
* `apps/web/src/lib/better-auth/auth.ts` — Better Auth + Prisma adapter; `supabase-jwt.ts` (AS-D03).
* `apps/web/src/lib/supabase/{client,server,middleware}.ts` — stubs Realtime/Storage (DO-D02).
* `apps/web/src/lib/env.ts` — fail-fast required server vars (EM-D05).
* `apps/web/.env.example` — katalog env (EM-D04).
* `.github/workflows/ci.yml` — quality gates CI-D02.
* Route `/api/auth/[...all]` di-wire ke Better Auth (`toNextJsHandler`).

### Changed

* `apps/web/package.json` — deps Prisma 6.x, better-auth, @supabase/supabase-js, jose; script `db:*` + `postinstall` generate.
* `README.md` — setup env/migrate; hapus “Remaining M7”.
* `PROJECT_STATE.md` — Version 1.0.2 → 1.0.3; M7 ✅ Completed; fokus → M8.
* `PROJECT_OVERVIEW.md` — Status `Planning` → `Active` (hilangkan living-state stale).

### Notes

* Verifikasi: `typecheck`, `lint`, `test`, `format:check`, `build` hijau.
* Semantik DO-D04 tetap (`DATABASE_URL` pooled + `DIRECT_URL` migrate); di Prisma 7 URL tidak lagi di `schema.prisma` (lihat sesi keempat puluh enam).
* Email verification sementara off (AS-D04); RLS policies SQL belum di migrasi awal.
* Belum: initial git commit (menunggu instruksi).

---

## 2026-07-17 (sesi keempat puluh empat)

### Added — M7 DX tooling

* Root: `eslint.config.mjs`, `prettier.config.mjs`, `.prettierignore`, `vitest.config.ts`, `lefthook.yml`.
* Root scripts: `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `db:*`, `prepare` (Lefthook).
* `packages/shared/src/enums.test.ts` — smoke test Vitest.
* `git init` di root (branch `main`) agar pre-commit hooks aktif.

### Changed

* `dx-tooling.md` — DX-D06 (Vitest di root) dan DX-D07 (Lefthook via `prepare`) dikunci.
* `apps/web/package.json` — ESLint dipindah ke root; script `db:*` disiapkan untuk Prisma.
* `README.md` — dokumentasi script DX dan setup hooks.
* `PROJECT_STATE.md` — Version 1.0.1 → 1.0.2; M7 progress ~60%.

### Notes

* Verifikasi: `bun run lint`, `format:check`, `test`, `typecheck` hijau.
* Belum: Prisma, Better Auth, `.env.example`, CI, initial git commit.

---

## 2026-07-17 (sesi keempat puluh tiga)

### Added — M7 slice B: Hybrid Monorepo inti

* Root Bun Workspaces: `package.json`, `tsconfig.json`, `.gitignore`, `README.md`, `bun.lock`.
* `apps/web` (`@social/web`) — Next.js App Router, placeholder routes sesuai IA, 9 domain modules MVP, `src/lib/` stubs, middleware skeleton.
* `packages/shared` (`@social/shared`) — branded IDs, enums (`ContentStatus`, `MemberRole`, `SocialPlatform`, `WorkspacePlan`), value objects.

### Changed

* `environment-management.md` — EM-D04 dikunci: lokasi env di `apps/web/` (bukan root). Catatan: `05-architecture/README.md` tidak mengatur lokasi env (di luar scope Architecture).
* `PROJECT_STATE.md` — Version 1.0.0 → 1.0.1; M7 progress ~35%; Next Tasks digeser ke DX / Prisma / Auth / CI / git init.

### Notes

* Verifikasi: `bun run typecheck` dan `bun run build` hijau.
* Belum: DX tooling, Prisma, Better Auth, `.env.example`, CI, `git init` di root.

---

## 2026-07-17 (sesi keempat puluh dua)

### Changed

* `PROJECT_OVERVIEW.md` — preferensi kerja: perubahan di `design/` tidak dicatat di `CHANGELOG.md` / `PROJECT_STATE.md` (ruang operasional desain, bukan tracking development).

---

## 2026-07-17 (sesi keempat puluh satu)

### Added

* `project-manager/ARCHITECTURE_OVERVIEW.md` — High-Level Architecture Overview (2 frame Figma: System Context & Containers + Internal Layers & Domains), disintesis dari Architecture Baseline v1.0 dan Engineering Baseline v1.0.

### Changed

* `project-manager/README.md` — menambahkan `ARCHITECTURE_OVERVIEW.md` ke folder structure & Core Documents; klarifikasi pengecualian ringkasan visual vs SoT di product-discovery.
* `project-manager/PROJECT_OVERVIEW.md` — Related Documents merujuk `ARCHITECTURE_OVERVIEW.md` dan architecture README.
* `project-manager/PROJECT_RULES.md` — `ARCHITECTURE_OVERVIEW.md` diklasifikasikan sebagai Static Reference.
* `.agents/skills/project-os-navigator/SKILL.md` — File Map memuat `ARCHITECTURE_OVERVIEW.md`.
* `PROJECT_STATE.md` — mencatat penambahan Architecture Overview.

---

## 2026-07-17 (sesi keempat puluh)

### Added — ADR-036 Engineering Planning Baseline v1.0

* `project-manager/DECISIONS.md` — ADR-036: seluruh 8 dokumen `product-discovery/06-engineering/` ditetapkan sebagai Engineering Planning Baseline v1.0 setelah ENG-REVIEW-01 s/d ENG-REVIEW-06 Fixed.

### Changed

* `PROJECT_STATE.md` — Version 0.9.7 → 1.0.0; M6 ditutup (✅ Completed); M7 dibuka (🟡 In Progress); phase → Phase 5 — Repository & Bootstrap; Active Conversation Mode → Repository & Bootstrap (bootstrap diizinkan; feature implementation tetap dibatasi); Next Tasks diganti ke inisialisasi monorepo/tooling.
* `.agents/skills/project-os-navigator/SKILL.md` — referensi folder UX / Architecture / Engineering diperbarui ke Baseline v1.0 (menghapus status living "in progress" / "pending" yang melanggar Document Type Classification).

---

## 2026-07-17 (sesi ketiga puluh sembilan)

### Fixed — Engineering Planning Review: ENG-REVIEW-01 s/d ENG-REVIEW-06

**ENG-REVIEW-01 — `monorepo-setup.md`** (Major):
* Ditambahkan `api/jobs/run/route.ts` pada pohon App Router — selaras `deployment-infrastructure.md`, `background-jobs.md`, `auth-architecture.md`.

**ENG-REVIEW-02 — `monorepo-setup.md`** (Major):
* Ditambahkan `api/auth/[...all]/route.ts` (Better Auth catch-all) + catatan bypass Middleware untuk `/api/auth/*` dan `/api/jobs/*`.

**ENG-REVIEW-03 — `auth-strategy.md`** (Major):
* Cookie `Secure` / `useSecureCookies` dibuat env-aware: `false` di local HTTP, `true` di staging/production HTTPS — selaras `environment-management.md`.

**ENG-REVIEW-04 — `monorepo-setup.md`** (Minor):
* Klarifikasi 9 domain modules MVP; BC-10 Billing post-MVP tanpa folder `src/domains/billing/` (route Settings → Billing tetap placeholder).

**ENG-REVIEW-05 — `cicd-pipeline.md`** (Minor):
* Urutan CI-D02 di tabel keputusan diselaraskan: `install → prisma generate → prisma validate → typecheck → lint → test`.

**ENG-REVIEW-06 — `monorepo-setup.md`** (Minor):
* Komentar IR-03 diganti ke `PrismaPostRepository` / larangan import `prisma` client di domain (ADR-031).

### Changed

* `PROJECT_STATE.md` — Version 0.9.6 → 0.9.7, progress 96% → 97%; ENG-REVIEW Fixed; Next: Baseline v1.0.

---

## 2026-07-17 (sesi ketiga puluh delapan)

### Changed — Engineering Planning Review (M6)

* Review konsistensi lintas 8 dokumen `product-discovery/06-engineering/` terhadap sesama dokumen M6, Architecture Baseline (ADR-025), dan ADR-028 s/d ADR-035.
* **6 temuan** dicatat di `PROJECT_STATE.md` Known Issues sebagai ENG-REVIEW-01 s/d ENG-REVIEW-06 (belum diperbaiki).
* `PROJECT_STATE.md` — Version 0.9.5 → 0.9.6, progress 95% → 96%; fokus bergeser ke perbaikan temuan review sebelum Baseline v1.0.

---

## 2026-07-17 (sesi ketiga puluh tujuh)

### Added — Dokumen M6: dependency-strategy.md

* `product-discovery/06-engineering/dependency-strategy.md` — dokumen kedelapan (terakhir) M6 Engineering Planning:
  * Version ranges eksternal **caret (`^`)**; resolusi dikunci lockfile (DS-D01).
  * Update dependency **manual**; tanpa Renovate/Dependabot di MVP (DS-D02).
  * Satu **`bun.lockb` di root**, commit wajib, frozen install di CI (DS-D03).
  * Penempatan: root = tooling; `apps/web` = runtime; `@social/shared` tanpa runtime deps (DS-D04).
  * Shared packages: hanya `@social/shared` di MVP; package baru butuh alasan kuat (DS-D05).
  * Tanpa Bun Catalog di MVP (DS-D06).
  * Decision Log DS-D01 s/d DS-D06.

### Added — ADR-035

* `project-manager/DECISIONS.md` — ADR-035: Dependency Strategy — caret ranges, manual updates, root lockfile rules.

### Changed

* `PROJECT_OVERVIEW.md` — Technical Overview: baris Dependencies.
* `product-discovery/06-engineering/README.md` — deskripsi `dependency-strategy.md`; Decision Rules dependency strategy.
* `dx-tooling.md`, `monorepo-setup.md` — Related Documents menunjuk ke `dependency-strategy.md` / ADR-035.
* `PROJECT_STATE.md` — Version 0.9.4 → 0.9.5, progress 93% → 95%; 8/8 dokumen M6 selesai; Next: Engineering Planning Review.

---

## 2026-07-17 (sesi ketiga puluh enam)

### Added — Dokumen M6: environment-management.md

* `product-discovery/06-engineering/environment-management.md` — dokumen keenam M6 Engineering Planning:
  * Supabase **Cloud-first** untuk local/staging/production; self-host ditunda sampai skema stabil (EM-D01).
  * Local memakai project Cloud terpisah **`social-media-local`** (EM-D02).
  * Secret management **native**: Railway Variables + Supabase dashboard + `.env.local` (EM-D03, EM-D04).
  * Katalog env vars server/client, validasi fail-fast, isolasi kredensial antar tier (EM-D05, EM-D06).
  * Decision Log EM-D01 s/d EM-D06.

### Added — Dokumen M6: dx-tooling.md

* `product-discovery/06-engineering/dx-tooling.md` — dokumen ketujuh M6 Engineering Planning:
  * **ESLint + Prettier** untuk lint/format (DX-D01).
  * **Lefthook + lint-staged** untuk pre-commit (DX-D02).
  * **Vitest** sebagai test runner (`bun run test`) (DX-D03).
  * Kontrak script root + checklist local setup (DX-D04, DX-D05).
  * Decision Log DX-D01 s/d DX-D05.

### Added — ADR-033, ADR-034

* `project-manager/DECISIONS.md` — ADR-033 (Environment Management), ADR-034 (DX Tooling).

### Changed

* `PROJECT_OVERVIEW.md` — Technical Overview: Lint/Format, Pre-commit, Test Runner, Env/Secrets.
* `product-discovery/06-engineering/README.md` — deskripsi `environment-management.md` dan `dx-tooling.md`.
* `deployment-infrastructure.md`, `auth-strategy.md`, `database-orm.md`, `cicd-pipeline.md`, `monorepo-setup.md` — referensi ke ADR-033/034; target DB lokal dikunci ke `social-media-local`.
* `PROJECT_STATE.md` — Version 0.9.3 → 0.9.4, progress 91% → 93%; 7/8 dokumen M6; Next: `dependency-strategy.md`.

---

## 2026-07-17 (sesi ketiga puluh lima)

### Added — Dokumen M6: cicd-pipeline.md

* `product-discovery/06-engineering/cicd-pipeline.md` — dokumen kelima M6 Engineering Planning:
  * **GitHub Actions** sebagai CI (CI-D01); gates PR: install → prisma generate/validate → typecheck → lint → test (CI-D02).
  * Promosi kode: `feature/*` → `staging` → `main` (CI-D03).
  * CD tetap **Railway auto-deploy** (CI-D04, selaras DI-D05).
  * `prisma migrate deploy` di Railway release/pre-start per environment (CI-D05).
  * Secret sensitif tidak di PR CI (CI-D06).
  * Decision Log CI-D01 s/d CI-D06.

### Added — ADR-032

* `project-manager/DECISIONS.md` — ADR-032: CI/CD Pipeline — GitHub Actions gates + Railway deploy + migrate on release.

### Changed

* `PROJECT_OVERVIEW.md` — Technical Overview: baris `CI | GitHub Actions`.
* `product-discovery/06-engineering/README.md` — deskripsi `cicd-pipeline.md`.
* `deployment-infrastructure.md` / `database-orm.md` — referensi ke ADR-032 / CI-D05.
* `PROJECT_STATE.md` — Version 0.9.2 → 0.9.3, progress 89% → 91%; 5/8 dokumen M6; Next: `environment-management.md`.

---

## 2026-07-17 (sesi ketiga puluh empat)

### Added — Dokumen M6: database-orm.md

* `product-discovery/06-engineering/database-orm.md` — dokumen keempat M6 Engineering Planning:
  * **Prisma** sebagai ORM formal; repository implementations memakai Prisma Client (DO-D01).
  * Batas Supabase client: hanya Realtime + Storage, bukan CRUD domain (DO-D02).
  * **Prisma Migrate** sebagai sumber kebenaran migrasi; alur staging → production (DO-D03).
  * Connection pooling via Supabase Supavisor: `DATABASE_URL` (pooled) + `DIRECT_URL` (migrate) (DO-D04).
  * Better Auth via Prisma adapter; model `identity_*` di schema yang sama (DO-D05).
  * RLS defense-in-depth via `SET LOCAL app.current_user_id` melalui Prisma (DO-D06).
  * Decision Log DO-D01 s/d DO-D06.

### Added — ADR-031

* `project-manager/DECISIONS.md` — ADR-031: Prisma sebagai ORM formal; mengamandemen ADR-017 (implementasi repository dari Supabase client → Prisma).

### Changed — Sinkronisasi dokumen terdampak Prisma

* `DECISIONS.md` — ADR-017 di-amandemen (status + decision text).
* `PROJECT_OVERVIEW.md` — Technical Overview: `ORM | Prisma`; Data Access = Prisma (CRUD) + Supabase client (Realtime, Storage).
* `product-discovery/06-engineering/README.md` — deskripsi `database-orm.md` dan baris Repository Pattern di tabel input.
* `product-discovery/06-engineering/monorepo-setup.md` — `src/lib/prisma/`, repositories Prisma-based, batas Supabase client.
* `product-discovery/06-engineering/auth-strategy.md` — Prisma adapter, Konteks 1 via Prisma, AS-D01 diselaraskan.
* `product-discovery/05-architecture/application-layer.md` — repository via Prisma Client (ADR-031).
* `product-discovery/05-architecture/database-strategy.md` — Migration Strategy tooling diganti ke Prisma Migrate.

### Changed — PROJECT_STATE.md

* Version 0.9.1 → 0.9.2, Overall Progress 87% → 89%.
* Completed: `database-orm.md`; In Progress: 4/8 dokumen M6; Next: `cicd-pipeline.md`.
* Recent Decisions: ADR-031.

---

## 2026-07-17 (sesi ketiga puluh tiga)

### Added — Dokumen M6: deployment-infrastructure.md

* `product-discovery/06-engineering/deployment-infrastructure.md` — dokumen kedua M6 Engineering Planning:
  * Keputusan region: **Singapore / Southeast Asia** — Railway + Supabase co-located untuk latency terendah ke target market Indonesia (DI-D01).
  * Topologi environment: **Production + Staging** (dua tier persisten), branch `main`→prod, `staging`→staging (DI-D02, DI-D05).
  * Supabase project terpisah per environment untuk isolasi data penuh (DI-D03).
  * Arsitektur Railway: dua service per environment — `web` (Next.js) + `cron` (trigger background jobs, selaras ADR-022) (DI-D04).
  * Build & deploy pipeline untuk monorepo Bun, strategi domain/TLS, scaling MVP (single instance, stateless), dan rollback (expand-and-contract) (DI-D06).
  * Decision Log DI-D01 s/d DI-D06.

### Added — Dokumen M6: auth-strategy.md

* `product-discovery/06-engineering/auth-strategy.md` — dokumen ketiga M6 Engineering Planning:
  * Konfigurasi instance Better Auth (database Supabase, prefix `identity_`, database session) (AS-D01, AS-D02).
  * Provider MVP: email + password (dengan verifikasi email) + Google OAuth, redirect URI per environment (AS-D05).
  * Atribut session cookie (HttpOnly, Secure, SameSite=lax, expiry 7 hari).
  * **Dual-context RLS**: server-side via service role + `app.current_user_id`; Supabase Realtime via JWT Supabase-compatible (HS256, `sub=userId`) agar `auth.uid()` valid — menkonkretkan ARCH-REVIEW-02 (AS-D03).
  * Konfigurasi auth per environment dan security considerations.
  * Dependency terbuka dicatat: transactional email provider untuk password reset/verification belum ditetapkan (AS-D04).
  * Decision Log AS-D01 s/d AS-D05.

### Added — ADR-028, ADR-029, ADR-030

* `project-manager/DECISIONS.md`:
  * **ADR-028** — Deployment Region: Singapore/Southeast Asia, Railway + Supabase co-located.
  * **ADR-029** — Environment Topology: Production + Staging dengan Supabase project terisolasi.
  * **ADR-030** — Auth Implementation: Better Auth config + Supabase JWT integration untuk Realtime.

### Changed — PROJECT_STATE.md

* Version 0.9.0 → 0.9.1, Last Updated → 2026-07-17, Overall Progress 85% → 87%.
* Completed: menambahkan `deployment-infrastructure.md` dan `auth-strategy.md`.
* In Progress: M6 kini 3 dari 8 dokumen selesai; dokumen berikutnya `database-orm.md`.
* Next Tasks: menghapus dua dokumen yang sudah selesai.
* Recent Decisions: menambahkan ADR-028, ADR-029, ADR-030.
* Known Issues: mencatat dependency terbuka transactional email provider (AS-D04).

---

## 2026-07-15 (sesi ketiga puluh dua)

### Fixed — Sinkronisasi PM dengan Keputusan Arsitektur Terbaru

Audit konsistensi seluruh dokumen `project-manager/` terhadap keputusan yang sudah ditetapkan (ADR-014 s/d ADR-026). Ditemukan dan diperbaiki 4 inkonsistensi:

* `project-manager/PROJECT_OVERVIEW.md` — Technical Overview: baris `ORM | Prisma` dihapus (asumsi prematur yang bertentangan dengan ADR-017). Diganti `Data Access | Supabase client *(ORM formal TBD — M6)*` sesuai keputusan arsitektur. Ditambahkan baris yang sebelumnya tertinggal: `Auth | Better Auth` (ADR-024), `Storage | Supabase Storage`, `Deployment | Railway`.
* `product-discovery/06-engineering/README.md` — daftar dokumen: `database-orm.md — ORM (Prisma)` diselaraskan menjadi strategi akses data via Supabase client (ADR-017) dengan pilihan ORM formal masih TBD — menghapus asumsi Prisma yang bocor.

### Added — ADR-027

* `project-manager/DECISIONS.md` — ADR-027: Amandemen ADR-014, mencatat pengecualian penamaan tabel aggregate root (`workspaces`, `notifications`) yang sebelumnya hanya ada di CHANGELOG sesi ke-29 dan belum terdokumentasi sebagai keputusan. Menutup gap traceability.

### Changed — PROJECT_STATE.md

* Recent Decisions: ditambahkan ADR-027.

---

## 2026-07-15 (sesi ketiga puluh satu)

### Fixed — Cleanup Dokumentasi project-manager/

* `project-manager/PROJECT_STATE.md` — menghapus 11 item strikethrough (`~~done~~`) dari section **Next Tasks** yang sudah tidak relevan (seluruh topik M5 + monorepo-setup.md sudah tercatat di section Completed). Next Tasks kini hanya berisi task yang benar-benar pending.
* `project-manager/PROJECT_OVERVIEW.md` — memperbaiki inkonsistensi: kolom Database di Technical Overview diperbarui dari `PostgreSQL *(Planned)*` menjadi `Supabase PostgreSQL`, sesuai keputusan yang sudah ditetapkan di CONVERSATIONS (sesi ke-20) dan ADR-015 (Database Strategy Baseline v1.0). Last Updated diperbarui ke 2026-07-15.

---

## 2026-07-15 (sesi ketiga puluh)

### Added

* ADR-025 di `DECISIONS.md` — System Architecture Baseline v1.0 ditetapkan untuk `product-discovery/05-architecture/`.

### Changed

* `PROJECT_STATE.md` — M5 ditutup (✅ Completed), M6 dibuka (🟡 In Progress), phase diperbarui ke Phase 4 — Engineering Planning, progress ke 85%, Active Conversation Mode diperbarui ke Engineering Planning, Next Tasks diperbarui untuk seluruh 8 dokumen M6.
* `product-discovery/06-engineering/README.md` — bagian "Input dari Fase Sebelumnya — Dari System Architecture" diperbarui: ditambahkan tabel 14 keputusan konkret dari System Architecture Baseline v1.0 sebagai constraint langsung untuk Engineering Planning.
* `project-manager/PROJECT_STATE.md` — ADR-026 ditambahkan ke Recent Decisions, monorepo-setup.md ditandai Done di Next Tasks.

### Added (lanjutan)

* `product-discovery/06-engineering/monorepo-setup.md` — dokumen pertama M6 Engineering Planning: monorepo root structure, Bun Workspaces config, apps/web folder structure, App Router routing (selaras IA), domain modules structure, packages/shared, TypeScript config, import rules (IR-01 s/d IR-05), dan decision log (MS-D01 s/d MS-D05).
* ADR-026 di `DECISIONS.md` — Monorepo Workspace Layout: apps/web, packages/shared, domain modules di src/domains/.

---

## 2026-07-15 (sesi kedua puluh sembilan)

### Changed — Naming Convention Exception: tabel utama tanpa redundansi prefix

**Keputusan:** DB-D01 diperbarui — tabel utama (aggregate root) domain yang namanya identik dengan domain prefix boleh menggunakan nama pendek tanpa prefix.

**Tabel yang diubah:**
* `workspace_workspaces` → `workspaces` (semua FK references diperbarui di `database-strategy.md`)
* `notification_notifications` → `notifications` (semua referensi diperbarui di `database-strategy.md` dan `realtime-strategy.md`)

**Dokumen yang diperbarui:**
* `product-discovery/05-architecture/database-strategy.md` — DB-D01, naming convention section, schema tabel BC-02 & BC-09, FK references, Index Strategy, Traceability, Decision Log
* `product-discovery/05-architecture/realtime-strategy.md` — semua referensi tabel notification

---

## 2026-07-15 (sesi kedua puluh delapan)

### Fixed — Architecture Review: 8 inkonsistensi lintas dokumen diperbaiki

**ARCH-REVIEW-01 — `realtime-strategy.md`** (Critical):
* Nama tabel dikoreksi dari `notifications` menjadi `notification_notifications` (sesuai naming convention domain prefix).
* Schema tabel di realtime-strategy.md diselaraskan dengan database-strategy.md — `payload JSONB` dihapus (fungsi ini sudah ditangani oleh `related_entity_type` + `related_entity_id`).
* Subscription block diperbarui: menambahkan `Table: notification_notifications` secara eksplisit.

**ARCH-REVIEW-02 — `database-strategy.md` + `realtime-strategy.md`** (Major):
* Ditambahkan klarifikasi dua konteks RLS: server-side service role menggunakan `current_setting('app.current_user_id')`, sedangkan Supabase Realtime client menggunakan `auth.uid()` (memerlukan Better Auth + Supabase JWT integration — dikonfigurasi di M6).
* `realtime-strategy.md` menambahkan catatan cross-reference ke `auth-architecture.md` tentang konfigurasi JWT.

**ARCH-REVIEW-03 — `database-strategy.md`** (Major):
* Ditambahkan section baru **System Tables (Cross-cutting Concerns)** yang mendefinisikan tabel `background_jobs`.
* Traceability table diperbarui — menambahkan mapping `background_jobs` sebagai system-level table.

**ARCH-REVIEW-04 — `integration-layer.md`** (Major):
* Publishing flow notes: "URL publik media" dikoreksi menjadi "Signed URL sementara (TTL ~24 jam)" — konsisten dengan database-strategy.md bahwa bucket `media` bersifat Private.
* IL-D07 diperbarui: mencantumkan bahwa signed URL di-generate saat scheduling, bukan URL publik.

**ARCH-REVIEW-05 — `application-layer.md`** (Major):
* Circular dependency Publishing ↔ AI Assistant dieliminasi dari dependency map.
* `BC-04 AI Assistant` tidak memanggil `BC-03 Publishing` — `postId` hanya context data bawaan, bukan service call. Hasil AI diterapkan user via aksi `PublishingService.updateDraft` yang terpisah.
* Ditambahkan rule eksplisit pada "Dependency yang dilarang": AI Assistant tidak boleh memanggil Publishing.

**ARCH-REVIEW-06 — `background-jobs.md`** (Minor):
* JOB-03 (Engagement Sync) handler diperbaiki — tidak lagi membuat JOB-02 (Post Status Notification, payload tidak kompatibel). Diganti dengan direct call ke `NotificationService.notify()` dengan type `engagement.new`, dengan aggregation untuk menghindari spam.

**ARCH-REVIEW-07 — `integration-layer.md`** (Minor):
* Referensi ke tabel `webhook_event_log` (tidak pernah didefinisikan) dihapus. Diganti dengan referensi yang benar ke tabel `background_jobs` dan JOB-01.

**ARCH-REVIEW-08 — `integration-layer.md`** (Minor):
* Retry count webhook dikoreksi dari "maks 5x" menjadi "maks 3x" — konsisten dengan JOB-01 di `background-jobs.md`.

---

## 2026-07-15 (sesi kedua puluh tujuh)

### Added — product-discovery/05-architecture/background-jobs.md

* Dokumen baru: **Background Jobs & Scheduler** — topik #5 M5.
* Arsitektur job queue: PostgreSQL tabel `background_jobs` sebagai sumber kebenaran status job.
* Railway Cron sebagai trigger eksekusi via Route Handler `/api/jobs/run` (dilindungi `X-Job-Secret`).
* 4 job types terdefinisi: `outstand.webhook.retry` (JOB-01), `notification.post_status` (JOB-02), `engagement.sync` (JOB-03), `analytics.sync` (JOB-04).
* Retry strategy: exponential backoff (5m, 15m, 60m), max 3 kali, dead letter via status `failed`.
* Concurrency control: `SELECT FOR UPDATE SKIP LOCKED` — atomic locking native PostgreSQL.
* Integrasi dengan domain: Publishing BC → webhook retry, Workspace BC → engagement sync trigger.
* Decision Log BG-D01 s/d BG-D06.
* ADR-022 (Background Job Strategy: PostgreSQL job queue + Railway Cron).

### Added — product-discovery/05-architecture/realtime-strategy.md

* Dokumen baru: **Real-time Strategy** — topik #6 M5.
* Scope real-time MVP: Supabase Realtime hanya untuk tabel `notifications`; data lain menggunakan manual refresh.
* Notification flow: domain event → JOB-02 → `NotificationService` → INSERT ke `notifications` → Supabase Realtime → client.
* Supabase Realtime subscription: channel per `user_id`, filter INSERT only, RLS menghormati subscription.
* Notification type registry: 4 tipe (`post.published`, `post.failed`, `engagement.new`, `post.scheduled_reminder`).
* Manual refresh patterns: content calendar menggunakan optimistic update + hint dari notifikasi; engagement inbox badge + manual load; analytics on demand.
* Post-MVP considerations: presence, collaborative editing, push notification.
* Decision Log RT-D01 s/d RT-D05.
* ADR-023 (Real-time Strategy: Supabase Realtime untuk notifikasi + manual refresh).

### Added — product-discovery/05-architecture/auth-architecture.md

* Dokumen baru: **Auth Architecture** — topik #7 M5.
* Authentication via Better Auth: Email + Password + Google OAuth untuk MVP.
* Session: HTTP-only cookie (Secure, SameSite=lax, expiry 7 hari), tidak dapat diakses JavaScript browser.
* Workspace context resolution: Middleware membaca workspace slug dari URL, query membership, inject `x-workspace-id` dan `x-workspace-role` sebagai request headers.
* RBAC enforcement: `assertPermission(role, operation)` di Application Service sebelum domain logic; RLS sebagai defense-in-depth.
* Middleware flow: public routes bypass auth; webhook/job routes dilindungi secret; `/dashboard/*` wajib session + workspace membership check.
* Permission matrix ringkasan per role (Owner, Admin, Manager, Creator) untuk operasi kritikal.
* Onboarding flow: user baru tanpa workspace diarahkan ke `/onboarding`.
* Post-MVP considerations: multi-workspace switching, 2FA, SSO/SAML, API key.
* Decision Log AU-D01 s/d AU-D07.
* ADR-024 (Auth Architecture: Better Auth + HTTP-only cookie + Application-layer RBAC).

### Changed — project-manager/PROJECT_STATE.md

* Progress diperbarui: 70% → 80%.
* Project Status: "System Architecture In Progress" → "System Architecture Review Pending".
* Current Focus diperbarui: seluruh 7 dokumen architecture selesai, menunggu Architecture Review.
* In Progress diperbarui: semua 7 topik M5 selesai.
* Next Tasks: topik #5, #6, #7 ditandai Done; ditambahkan task Architecture Review dan baseline.
* ADR-022, ADR-023, ADR-024 ditambahkan ke Recent Decisions.

---

## 2026-07-15 (sesi kedua puluh enam)

### Added — product-discovery/05-architecture/integration-layer.md

* Dokumen baru: **Integration Layer** — topik #4 M5.
* Posisi Outstand API sebagai external system dengan diagram arsitektur inbound dan outbound flow.
* Anti-Corruption Layer (ACL): `OutstandAdapter` sebagai satu-satunya titik interaksi dengan Outstand API — isolasi domain dari perubahan API Outstand.
* ConnectedAccount management: OAuth redirect flow via Outstand, token tidak disimpan internal, CSRF protection via `state` parameter.
* Publishing flow: schedule dan cancel post via Outstand API, `outstandJobId` sebagai external reference di `PostTarget`.
* Webhook handling: Route Handler `/api/webhooks/outstand`, HMAC-SHA256 signature verification, daftar 5 event type, async processing, idempotency strategy.
* Engagement data sync: webhook push untuk item baru + polling periodik sebagai fallback.
* Analytics data sync: pull-based polling periodik untuk post metrics dan workspace snapshot.
* Error handling strategy: klasifikasi 5 tipe error (transient, client, auth, account, not found), penanganan per operasi, `IntegrationError` sebagai tipe domain.
* Decision Log IL-D01 s/d IL-D08.
* ADR-019 (Anti-Corruption Layer), ADR-020 (Webhook Handling), ADR-021 (OAuth via Outstand).

---

## 2026-07-15 (sesi kedua puluh lima)

### Added — product-discovery/05-architecture/application-layer.md

* Dokumen baru: **Application Layer** — topik #3 M5.
* Layer stack 4-tingkat: Entry Points → Application Service → Domain Logic → Repository → Infrastructure.
* Next.js entry point patterns: Server Components (read), Server Actions (UI mutations), Route Handlers (webhook/external), Middleware (auth guard + workspace context resolution).
* Application Service contracts untuk seluruh 9 bounded context MVP.
* Repository Pattern eksplisit: interface di domain module, implementasi via Supabase client, satu repository per Aggregate Root.
* Cross-domain communication: service-to-service call via `index.ts` (public API), aturan no circular dependency, only pass ID lintas domain.
* Error handling hierarchy: ApplicationError → AuthorizationError, NotFoundError, ValidationError, ConflictError, ExternalServiceError.
* 3 contoh request flow: Schedule Post, Webhook Outstand, Load Calendar Page.
* Decision Log AL-D01 s/d AL-D04.

### Changed — project-manager/DECISIONS.md

* Ditambahkan ADR-016: Application Layer — Next.js Entry Point Strategy.
* Ditambahkan ADR-017: Application Layer — Repository Pattern.
* Ditambahkan ADR-018: Application Layer — Cross-Domain Communication.

### Changed — project-manager/PROJECT_STATE.md

* Version: 0.6.0 → 0.7.0.
* Overall Progress: 65% → 70%.
* Current Focus diperbarui: Application Layer selesai, next Integration Layer.
* In Progress diperbarui ke topik #4: Integration Layer.
* Completed ditambahkan: application-layer.md.
* Next Tasks: Application Layer ditandai Done.
* Recent Decisions ditambahkan ADR-016, ADR-017, ADR-018.

---

## 2026-07-15 (sesi kedua puluh empat)

### Added — product-discovery/05-architecture/database-strategy.md

* Dokumen baru: **Database Strategy** — topik #2 M5.
* Multi-tenancy strategy: RLS dengan `workspace_id` sebagai unit isolasi; pendekatan application-enforced auth + RLS sebagai defense-in-depth karena Better Auth tidak terintegrasi native dengan Supabase JWT.
* Schema organization: single schema `public` dengan domain prefix (ADR-014).
* ID Convention: UUID v4 via `gen_random_uuid()` — native PostgreSQL/Supabase.
* 22 tabel terdefinisi untuk 10 bounded context — memetakan seluruh entitas dari domain-model.md ke tabel database.
* BC-01 Identity: tabel dikelola Better Auth dengan prefix `identity_`.
* Soft delete strategy: hard delete by default; `deleted_at` hanya pada `publishing_posts`.
* Storage strategy: Supabase Storage dengan dua bucket (`media` private, `avatars` public).
* Index strategy: workspace_id mandatory pada semua tabel multi-tenant; query-driven indexes per tabel.
* Migration strategy: Supabase CLI, detail di Engineering Planning (M6).
* Decision Log DB-D01 s/d DB-D06.

### Changed — project-manager/DECISIONS.md

* Ditambahkan ADR-014: Database Schema Organization — Single Schema dengan Domain Prefix.
* Ditambahkan ADR-015: Database Strategy Baseline v1.0.

### Changed — project-manager/PROJECT_STATE.md

* Version: 0.5.0 → 0.6.0.
* Overall Progress: 58% → 65%.
* Current Focus: diperbarui — Database Strategy selesai, fokus beralih ke Application Layer.
* In Progress: diperbarui ke topik #3 Application Layer.
* Next Tasks: Database Strategy ditandai Done.
* Completed: ditambahkan database-strategy.md.
* Recent Decisions: ditambahkan ADR-014 dan ADR-015.

---

## 2026-07-15 (sesi kedua puluh tiga)

### Added — product-discovery/05-architecture/domain-model.md

* Dokumen baru: **Domain Model & Bounded Context** — topik #1 M5.
* Mendefinisikan 10 bounded context: Identity, Workspace, Publishing, AI Assistant, Engagement, Analytics, Start Page, Media, Notification, Billing.
* Menetapkan Core Entities dan Key Attributes per bounded context.
* Context Map — diagram dan tabel relasi antar bounded context.
* Shared Types (`packages/shared`) — ID types, enums kanonikal (ContentStatus, MemberRole, SocialPlatform, WorkspacePlan), value objects.
* Domain Boundary Rules (BR-01 s/d BR-06) — aturan implementasi Pragmatic Boundary.
* Traceability ke Product Baseline (feature-modules.md) dan User Insights (I-01, I-04, I-06, I-08).
* Decision Log DM-D01 s/d DM-D06.

### Changed — project-manager/PROJECT_STATE.md

* Overall Progress: 55% → 58%.
* Current Focus: diperbarui — Domain Model selesai, fokus beralih ke Database Strategy.
* In Progress: diperbarui ke topik #2 Database Strategy.
* Next Tasks: Domain Model ditandai Done, Database Strategy menjadi prioritas berikutnya.
* Completed: ditambahkan domain-model.md.

---

## 2026-07-15 (sesi kedua puluh dua)

### Added — CONVERSATIONS.md

* Entry baru: Keputusan Pra-Architecture — Domain Boundary, Storage & Deployment.

### Changed — product-discovery/05-architecture/README.md

* Tambah 3 keputusan pra-architecture ke tabel: Storage (Supabase Storage), Deployment (Railway), Domain Boundary Strictness (Pragmatic Boundary).

---

## 2026-07-15 (sesi kedua puluh satu)

### Added — product-discovery/05-architecture/

* `README.md` — struktur, scope, daftar dokumen, workflow, input dari baseline sebelumnya, expected output, exit criteria, dan decision rules untuk fase System Architecture.

---

## 2026-07-15 (sesi kedua puluh)

### Added — CONVERSATIONS.md

* Entry baru: Keputusan Pra-Architecture — Database, Auth & Real-time. 4 keputusan ditetapkan, 2 masih pending.

---

## 2026-07-15 (sesi kesembilan belas)

### Added — DECISIONS.md

* ADR-013 — UX Planning Baseline v1.0: seluruh dokumen `product-discovery/04-ux/` ditetapkan sebagai baseline setelah semua 4 UX Planning Review item selesai diperbaiki.

### Changed — PROJECT_STATE.md

* Versi naik dari 0.4.0 → 0.5.0.
* Phase diupdate: Phase 2 — UX Planning → Phase 3 — System Architecture.
* Milestone aktif diupdate: M4 → M5.
* Sprint diupdate: Sprint 2 → Sprint 3.
* Overall Progress diupdate: 45% → 55%.
* M4 — UX Planning ditandai ✅ Completed.
* M5 — System Architecture ditandai 🟡 In Progress.
* Current Focus, Active Conversation Mode, In Progress, Next Tasks, Known Issues, dan Recent Decisions diperbarui sesuai fase baru.

### Added — CONVERSATIONS.md

* Entry baru: Briefing M5 System Architecture Planning — topik, urutan pembahasan, dan cara kerja antar sesi.

---

## 2026-07-15 (sesi kedelapan belas)

### Fixed — UX Planning Review — REVIEW-04 (Minor)

* `product-discovery/04-ux/navigation-patterns.md` — tambah pola baru **"New Post CTA dari Calendar dan Queue"** di section Contextual Navigation Pattern. Mendokumentasikan bahwa CTA New Post tersedia langsung dari Calendar dan Queue (bukan hanya dari Drafts), trigger dan konteks penggunaannya, serta perilaku transisi dan tombol Back.
* Tambah **NP-D09** ke Decision Log: alasan New Post CTA tersedia di Calendar dan Queue — mengurangi friction saat Raka menemukan gap jadwal di titik penemuan kebutuhan.
* Tambah baris baru ke Ringkasan Pola.

### Changed — PROJECT_STATE.md

* Fix #4 dipindahkan dari Next Tasks ke selesai; Next Tasks diperbarui ke satu item sisa: ADR-013 UX Planning Baseline.
* REVIEW-04 ditandai Fixed di Known Issues.
* Semua 4 REVIEW item kini berstatus Fixed.

---

## 2026-07-15 (sesi ketujuh belas)

### Fixed — UX Planning Review — REVIEW-03 (Minor)

* `product-discovery/04-ux/key-screen-patterns.md` — tambah KSP-D11 ke Decision Log: mendokumentasikan alasan eksklusi Start Page dari 8 layar kritis. Start Page bukan bagian dari siklus kerja harian; polanya sederhana (konfigurasi + preview) dan tidak memerlukan dokumentasi mendalam di fase ini.

### Changed — PROJECT_STATE.md

* Fix #3 dipindahkan dari Next Tasks ke selesai.
* REVIEW-03 ditandai Fixed di Known Issues.

---

## 2026-07-15 (sesi keenam belas)

### Fixed — UX Planning Review — REVIEW-02 (Minor)

* `product-discovery/04-ux/key-screen-patterns.md` — KSP-02-F07 (Disconnected Account Warning): koreksi referensi prinsip dari `UXP-05` menjadi `UXP-06`. UXP-06 (Status Jelas, Proses Ringan) adalah prinsip yang tepat untuk status visibilitas akun; UXP-05 mengacu ke prinsip AI.

### Changed — PROJECT_STATE.md

* Fix #2 dipindahkan dari Next Tasks ke selesai.
* REVIEW-02 ditandai Fixed di Known Issues.

---

## 2026-07-15 (sesi kelima belas)

### Fixed — UX Planning Review — REVIEW-01 (Kritis)

Selaraskan set status konten kanonikal lintas 4 dokumen UX — mengacu ke `product-discovery/02-product/roles-permissions.md` sebagai sumber kebenaran.

* `product-discovery/04-ux/ux-principles.md` — UXP-06: tambah `failed` ke status list; koreksi "ready" → "ready to schedule"; tambah bullet referensi ke `roles-permissions.md` untuk aturan transisi per role.
* `product-discovery/04-ux/information-architecture.md` — Status Indicator di IA tree: tambah `in review` dan `ready to schedule`.
* `product-discovery/04-ux/user-flows.md` — 3 tempat: Queue happy path, Queue UX principles rationale, Calendar happy path — semua status list dilengkapi dengan `In Review` dan `Ready to Schedule`.
* `product-discovery/04-ux/key-screen-patterns.md` — 3 tempat: KSP-02-F02 (Calendar status), KSP-03-F02 (Queue status), KSP-05-F07 (Draft Editor Status Indicator) — semua dilengkapi dengan `In Review` dan `Ready to Schedule`.

### Changed — PROJECT_STATE.md

* Fix #1 dipindahkan dari Next Tasks ke selesai.
* REVIEW-01 ditandai Fixed di Known Issues.

---

## 2026-07-15 (sesi keempat belas)

### Added — Roles & Permissions

* `product-discovery/02-product/roles-permissions.md` — addendum Product Baseline v1.0. Mendefinisikan 4 roles (Owner, Admin, Manager, Creator) beserta hak akses per area fitur, set status konten kanonikal (Draft, In Review, Ready to Schedule, Scheduled, Published, Failed), aturan transisi status per role, dan mapping roles ke 5 persona User Discovery Baseline.

### Added — DECISIONS.md

* ADR-012 — Addendum Product Baseline: `roles-permissions.md` ditambahkan ke `product-discovery/02-product/`. Mencakup alasan pendefinisian roles di fase Product dan penetapan set status konten sebagai acuan kanonikal lintas dokumen UX.

### Changed — PROJECT_STATE.md

* Task 1 (Roles & Permissions) dipindahkan dari Next Tasks ke Completed.
* Recent Decisions diperbarui: ADR-012 ditambahkan.

---

## 2026-07-15 (sesi ketiga belas)

### Changed — PROJECT_STATE.md

* Versi dinaikkan ke 0.4.0.
* Current Focus diperbarui: fokus bergeser ke UX Planning Review dan Roles & Permissions.
* In Progress diperbarui: UX Planning Review sedang berjalan, 4 inkonsistensi ditemukan.
* Next Tasks diperbarui: 2 task utama didefinisikan — Task 1 (Roles & Permissions + ADR-012) dan Task 2 (4 perbaikan UX Planning Review + ADR-013 untuk UX Planning Baseline).
* Known Issues diisi: 4 temuan inkonsistensi dari UX Planning Review dicatat sebagai REVIEW-01 hingga REVIEW-04.

---

## 2026-07-15 (sesi kedua belas)

### Added — Key Screen Patterns

* `product-discovery/04-ux/key-screen-patterns.md` — pola fungsi kritis untuk 8 layar utama produk: KSP-01 Home, KSP-02 Publish Calendar, KSP-03 Publish Queue, KSP-04 Publish Drafts, KSP-05 Draft Editor (termasuk pola AI Assist inline, Account Selector dengan status, dan Confirmation Summary), KSP-06 Engage Inbox (master-detail pattern), KSP-07 Analyze Dashboard, KSP-08 Connected Accounts. Setiap layar memiliki critical functions dengan ID, zona fungsional, state handling, dan decision log. 10 keputusan desain terdokumentasi (KSP-D01 hingga KSP-D10). Dokumen terakhir dari M4 — UX Planning.

### Changed — PROJECT_STATE.md

* Overall Progress diperbarui dari 38% ke 45%.
* `key-screen-patterns.md` dipindahkan dari In Progress ke Completed.
* Next Tasks diperbarui: fokus berikutnya adalah UX Planning Review lintas dokumen dan penetapan UX Planning Baseline.

---

## 2026-07-15 (sesi kesebelas)

### Added — Navigation Patterns

* `product-discovery/04-ux/navigation-patterns.md` — model dan pola navigasi lengkap: Persistent Sidebar Navigation sebagai model utama, primary/secondary/in-section navigation patterns, 5 contextual navigation patterns (Item→Editor, Thread Expansion, Status→Settings, Empty State→Action, Deep Link), notification badge pattern, cross-section navigation pattern, dan decision log 8 keputusan navigasi (NP-D01 hingga NP-D08).

---

## 2026-07-15 (sesi kesepuluh)

### Added — User Flows

* `product-discovery/04-ux/user-flows.md` — 6 solution flows untuk Must Have MVP: UF-01 (Membuat & Menjadwalkan Konten), UF-02 (Mengelola Queue), UF-03 (Review Kalender), UF-04 (Triage Engagement Inbox), UF-05 (Menghubungkan Akun Sosial), UF-06 (Melihat Ringkasan Performa). Setiap flow memiliki happy path + 1 alternate path paling kritis. 4 UX Decisions (UXD-01 hingga UXD-04) terdokumentasi.

### Added — Skill: Proactive Clarification

* `.agents/skills/proactive-clarification/SKILL.md` — skill baru yang memandu AI untuk secara proaktif mengidentifikasi keputusan yang belum ditentukan sebelum mengeksekusi tugas apapun. AI wajib bertanya dengan pilihan-pilihan terbaik di kelasnya (maks 4–5 opsi dikurasi), berlaku untuk semua jenis interaksi — dokumentasi, fitur, arsitektur, konfigurasi. Skill tidak aktif jika keputusan sudah ada di baseline project.

---

## 2026-07-15 (sesi kesembilan)

### Added — Information Architecture

* `product-discovery/04-ux/information-architecture.md` — IA lengkap: struktur navigasi (primary + secondary), hierarki layar untuk seluruh domain MVP (Home, Publish, Engage, Analyze, Start Page, Workspace Settings, User Settings), pemetaan fitur Must Have ke layar, entry points per persona, dan decision log 7 keputusan struktural.

### Added — UX Principles

* `product-discovery/04-ux/ux-principles.md` — 7 UX Principles ditetapkan, masing-masing diturunkan dari insight User Discovery (I-01 hingga I-08) dengan implikasi desain yang actionable.

---

## 2026-07-14 (sesi kedelapan)

### Fixed — Inkonsistensi pada PROJECT_OVERVIEW.md

* `project-manager/PROJECT_OVERVIEW.md` — menghapus section `Current Phase` yang memuat status/milestone basi (masih menyebut M1 — Discovery), melanggar aturan Document Type Classification yang sudah ditetapkan sendiri di `PROJECT_RULES.md`.

### Added — Developer Profile & Working Preferences

* Menambahkan section **Developer Profile & Working Preferences** di `PROJECT_OVERVIEW.md` — mencatat profil solo developer dan preferensi kerja yang sudah terkonfirmasi dari sesi-sesi sebelumnya.
* Menambahkan retroaktif 3 entri `CONVERSATIONS.md` yang terlewat: diskusi Document Type Classification, pemisahan `product-discovery/` dari `project-manager/`, dan evaluasi "apakah project-manager sudah menjadi asisten pribadi".

### Added — Proactive Consistency Check

* Menambahkan section **Proactive Consistency Check** pada `SKILL.md` — AI wajib memeriksa dokumen Static Reference terhadap kebocoran status/progress, dan wajib melaporkannya ke user (bukan memperbaiki diam-diam).
* Menambahkan 2 aturan baru pada **Aturan Context** di `SKILL.md`: larangan memperbaiki inkonsistensi secara diam-diam, dan kewajiban mengikuti serta memperbarui Working Preferences.

### Status

Gap yang ditemukan saat evaluasi "apakah project-manager sudah menjadi asisten pribadi" sudah ditindaklanjuti: status basi dibersihkan, log diskusi disinkronkan, working preference mulai terdokumentasi, dan ada mekanisme proaktif untuk mencegah inkonsistensi serupa terulang.

---

## 2026-07-14 (sesi ketujuh)

### Changed — Pemisahan Struktur `product-discovery/` dari `project-manager/`

* Memindahkan folder `product-discovery/` keluar dari `project-manager/` menjadi folder top-level, sejajar (sibling) dengan `project-manager/`.
* Menambahkan ADR-011 pada `DECISIONS.md` — mendokumentasikan alasan pemisahan struktur.
* Menulis ulang `project-manager/README.md` secara menyeluruh: menghapus struktur folder usang yang tidak pernah ada (`01-discovery/`, `07-ai/`, `08-management/`, dsb.), menjelaskan `project-manager/` sebagai dokumentasi cara kerja, dan `product-discovery/` sebagai Source of Truth produk.

### Fixed — Perbaikan Path Referensi Antar Dokumen

* `product-discovery/README.md` — path ke dokumen `project-manager/` diperbaiki (`../project-manager/...`).
* `product-discovery/01-business/README.md` — memperbaiki path yang sudah rusak sejak sebelum pemindahan folder (Documents dan Decision Rules section), sekaligus menyesuaikan ke struktur baru.
* `product-discovery/02-product/README.md`, `03-user/README.md`, `04-ux/README.md`, `06-engineering/README.md` — seluruh referensi ke `PROJECT_OVERVIEW.md`, `PROJECT_RULES.md`, `PROJECT_STATE.md`, `DECISIONS.md` diperbaiki menjadi `../../project-manager/...`.
* `project-manager/PROJECT_STATE.md`, `PROJECT_RULES.md`, `PROJECT_OVERVIEW.md` — section `Related Documents` diperbaiki menjadi `../product-discovery/...`.
* `.agents/skills/project-os-navigator/SKILL.md` — path operasional (`Load Context`, `File Map`, `Additional Resources`) diperbaiki dari `project-manager/product-discovery/...` menjadi `product-discovery/...`, dan File Map dipecah menjadi dua tree sejajar.
* Seluruh dokumen individual di `product-discovery/01-business/`, `02-product/`, `03-user/` (bukan hanya README.md) — referensi ke `PROJECT_OVERVIEW.md`, `PROJECT_RULES.md`, `PROJECT_STATE.md`, `DECISIONS.md`, `CHANGELOG.md` diperbaiki secara massal menjadi `../../project-manager/...`.

### Status

Struktur repository kini: `project-manager/` (cara kerja) dan `product-discovery/` (pengetahuan produk) sebagai dua folder top-level yang terpisah. Seluruh referensi path antar dokumen telah disinkronkan.

---

## 2026-07-14 (sesi ketiga)

### Added — Engineering Planning Phase

* Menambahkan `product-discovery/06-engineering/README.md` — titik masuk Engineering Planning (M6).
* Menambahkan ADR-010 pada `DECISIONS.md` — Engineering Planning sebagai fase baru di product-discovery.

### Changed — Milestone Numbering

* Menambahkan M6 — Engineering Planning sebagai milestone baru.
* Menggeser milestone lama: M6 → M7 (Repository & Bootstrap), M7 → M8 (Development), M8 → M9 (Testing & Release).
* Memperbarui `PROJECT_STATE.md`: milestone table, Recent Decisions, dan Related Documents.
* Memperbarui file map pada `.agents/skills/project-os-navigator/SKILL.md`.

### Status

Engineering Planning (M6) terdaftar sebagai fase baru. Masih ⏳ Pending — akan dikerjakan setelah M5 System Architecture selesai.

---

## 2026-07-14 (sesi keempat)

### Changed — product-discovery/README.md

* Memperbarui Objectives: menambahkan poin dokumentasi keputusan teknis engineering.
* Memperbarui Workflow: menambahkan step Engineering setelah Architecture.
* Memperbarui Folder Structure: menambahkan `06-engineering/` dengan status tiap folder.
* Memperbarui Discovery Stages: memisahkan scope `05-architecture` dan menambahkan section `06-engineering`.
* Memperbarui Exit Criteria: menambahkan Engineering Planning sebagai syarat selesai, menandai Business/Product/User Baseline yang sudah selesai.
* Memperbarui Next Phase: merujuk ke M7 — Repository & Bootstrap dengan referensi ADR-001.

### Status

`product-discovery/README.md` selaras dengan dokumentasi terbaru.

---

## 2026-07-14 (sesi kelima)

### Changed — Document Type Classification

* Menambahkan section **Document Type Classification** pada `PROJECT_RULES.md` yang mendefinisikan tiga tipe dokumen: Static Reference, Living Document, dan Append-Only.
* Menetapkan `PROJECT_STATE.md` sebagai satu-satunya source of truth untuk status dan progress.
* Menetapkan aturan: README tidak boleh memuat status (✅ ⏳ 🟡), progress (%), atau phase aktif.

### Fixed — Penghapusan Status Indicator dari README

* `product-discovery/01-business/README.md` — hapus section `Current Status`.
* `product-discovery/02-product/README.md` — hapus section `Current Status`.
* `product-discovery/03-user/README.md` — hapus section `Current Status`.
* `product-discovery/04-ux/README.md` — hapus section `Current Status`.
* `product-discovery/06-engineering/README.md` — hapus section `Current Status`.
* `product-discovery/README.md` — hapus status indicator (✅ 🟡 ⏳) dari Folder Structure dan Exit Criteria.
* `.agents/skills/project-os-navigator/SKILL.md` — hapus status indicator dari file map.

### Status

Seluruh README kini bersifat Static Reference. Status dan progress hanya ada di `PROJECT_STATE.md`.

---

## 2026-07-14 (sesi keenam)

### Changed — PROJECT_RULES.md Restructuring

* Menaikkan versi `PROJECT_RULES.md` dari 0.1.0 ke 0.2.0.
* Menambahkan section **Scope** untuk memperjelas batas aturan yang diatur dokumen ini.
* Menggabungkan `Documentation Rules` dan `Document Type Classification` menjadi satu section **Documentation Governance**, dengan subsection tambahan **Formatting Rules**.
* Memperbarui **Project Workflow**: menambahkan tahap `User` dan `Engineering` yang sebelumnya tidak tercantum, menyelaraskan dengan workflow di `product-discovery/README.md` dan milestone di `PROJECT_STATE.md`.
* Memperbaiki **Related Documents**: menghapus referensi usang `06-development/` yang tidak lagi sesuai struktur project, mengganti dengan daftar dokumen yang akurat.
* Menambahkan aturan baru pada **AI Collaboration Rules**: AI wajib mematuhi klasifikasi dokumen pada Documentation Governance.

### Status

`PROJECT_RULES.md` v0.2.0 — struktur lebih rapi, konsisten dengan milestone dan workflow terbaru.

---

## 2026-07-14 (sesi kedua)

### Added — Project OS & UX Planning Setup

* Menambahkan `CONVERSATIONS.md` — log percakapan penting antar sesi.
* Menambahkan `BRAINSTORM.md` — bank ide dari sesi brainstorming.
* Membuat `.cursor/skills/project-os-navigator/SKILL.md` — skill Cursor untuk menjaga AI selalu dalam konteks project.
* Membuat `product-discovery/04-ux/README.md` — titik masuk UX Planning (M4).

### Updated — Milestone & State

* Menyelesaikan User Discovery Review untuk `product-discovery/03-user/`.
* Menambahkan ADR-009 pada `DECISIONS.md` — User Discovery Baseline v1.0.
* Memperbarui `PROJECT_STATE.md`: M1 Discovery ✅ selesai, M4 UX Planning 🟡 aktif, progress 38%.

### Status

M1 Discovery selesai. Project masuk Phase 2 — UX Planning (M4).

---

## 2026-07-14 (sesi pertama)

### Added — Product Planning Completion

* Menambahkan `product-discovery/02-product/future-roadmap.md` sebagai backlog strategis pasca-MVP.
* Menambahkan ADR-008 pada `DECISIONS.md` untuk menetapkan Baseline Product Discovery v1.0.

### Updated — Cross-Document Synchronization

* Menandai `product-discovery/02-product/README.md` sebagai selesai (100%) dengan status review passed.
* Menyinkronkan status dan fokus terbaru pada `PROJECT_STATE.md` untuk transisi ke `product-discovery/03-user/`.
* Menyesuaikan progres overall project setelah selesainya tahap Product Planning.
* Merapikan konsistensi dokumen agar selaras dengan baseline Business v1.0 dan Product v1.0.

### Status

Product Planning selesai dan siap transisi ke User Discovery.

---

## 2026-07-13

### Added — Project Foundation

* Membuat struktur awal `project-manager/`.
* Menambahkan `README.md`.
* Menambahkan `PROJECT_OVERVIEW.md`.
* Menambahkan `PROJECT_RULES.md`.
* Menambahkan `PROJECT_STATE.md`.
* Menambahkan `DECISIONS.md`.
* Menambahkan `CHANGELOG.md`.
* Menambahkan struktur folder `product-discovery/` beserta subfolder domain.
* Menambahkan 8 dokumen awal pada `product-discovery/01-business/`.

### Updated — Documentation

* Menstandarkan struktur `product-discovery/01-business/README.md` menjadi:
  Overview, Purpose, Scope, Documents, Workflow, Expected Output,
  Exit Criteria, Decision Rules, dan Current Status.
* Menyinkronkan seluruh dokumen bisnis agar selaras dengan target market baru:
  Marketing Team (primary), Startup dan Digital Agency (secondary).
* Memperbarui `PROJECT_OVERVIEW.md`, `target-market.md`, `business-model.md`,
  `problem-statement.md`, `pricing-strategy.md`, dan `product-vision.md`.
* Menambahkan ADR-006 pada `DECISIONS.md` untuk perubahan target market.
* Menandai `product-discovery/01-business/` sebagai selesai (100%).
* Memperbarui status milestone aktif pada `PROJECT_STATE.md` ke M1 — Discovery.
* Menyesuaikan fokus project ke tahap `product-discovery/02-product/`.
* Melakukan Business Review lintas dokumen pada `product-discovery/01-business/`.
* Menyelaraskan `business-model.md` dan `pricing-strategy.md` agar konsisten (MVP free access, subscription sebagai hipotesis monetisasi).
* Menetapkan `product-discovery/01-business/` sebagai Baseline v1.0 melalui ADR-007.

### Decisions

* Memilih Hybrid Monorepo sebagai strategi repository.
* Memilih Bun sebagai JavaScript runtime.
* Memilih Next.js sebagai framework utama.
* Memilih Modular Monolith + Domain-Driven Design (DDD).
* Memilih Outstand API sebagai external integration provider.

### Status

Project Foundation sedang berlangsung.
