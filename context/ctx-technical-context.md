# Context — Technical Context

Indeks **stack & infrastruktur**: runtime, ORM, auth config, env, deploy, CI, dependency.  
Bukan tempat pola folder domain atau aturan gaya kode (itu `ctx-implementation` / `ctx-development`).

---

## Baca dulu

| Dokumen                                                                                            | Topik                                                                          |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [`../product-discovery/06-engineering/README.md`](../product-discovery/06-engineering/README.md)   | Indeks Engineering Baseline v1.0 (ADR-036)                                     |
| [`monorepo-setup.md`](../product-discovery/06-engineering/monorepo-setup.md)                       | Layout Hybrid Monorepo, Bun workspaces                                         |
| [`database-orm.md`](../product-discovery/06-engineering/database-orm.md)                           | Prisma 7, migrate, pooling, batas Supabase client (ADR-031)                    |
| [`auth-strategy.md`](../product-discovery/06-engineering/auth-strategy.md)                         | Better Auth, Google OAuth, JWT Realtime (ADR-030)                              |
| [`environment-management.md`](../product-discovery/06-engineering/environment-management.md)       | Env vars, secrets, `social-media-local` (ADR-033)                              |
| [`deployment-infrastructure.md`](../product-discovery/06-engineering/deployment-infrastructure.md) | Railway + Supabase SEA (ADR-028, ADR-029)                                      |
| [`cicd-pipeline.md`](../product-discovery/06-engineering/cicd-pipeline.md)                         | GitHub Actions gates, Railway CD (ADR-032)                                     |
| [`dependency-strategy.md`](../product-discovery/06-engineering/dependency-strategy.md)             | Caret ranges, lockfile, `@social/shared` (ADR-035)                             |
| [`design-tokens.md`](../product-discovery/06-engineering/design-tokens.md)                         | SoT visual tokens (font, warna, status) — isi setelah design approve (ADR-038) |

Implementasi di repo:

| Path                            | Peran                             |
| ------------------------------- | --------------------------------- |
| `apps/web/`                     | Next.js App Router                |
| `apps/web/prisma/schema.prisma` | Schema Prisma                     |
| `apps/web/prisma.config.ts`     | Migrate URL (`DIRECT_URL`)        |
| `apps/web/src/lib/prisma/`      | Prisma client singleton + adapter |
| `apps/web/src/lib/better-auth/` | Auth server                       |
| `apps/web/src/lib/env.ts`       | Env fail-fast                     |
| `apps/web/.env.example`         | Katalog env (EM-D04)              |
| `packages/shared/`              | Shared types                      |
| `.github/workflows/ci.yml`      | CI gates                          |

---

## Stack (ingat cepat)

| Area                    | Pilihan                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Runtime / PM            | Bun                                                                                          |
| App                     | Next.js (`apps/web`)                                                                         |
| Auth                    | Better Auth (email/password + Google)                                                        |
| ORM                     | Prisma **7.x** — migrate via `DIRECT_URL`, runtime via `@prisma/adapter-pg` + `DATABASE_URL` |
| DB / Storage / Realtime | Supabase                                                                                     |
| Social API              | Outstand (via ACL — lihat `ctx-architecture`)                                                |
| Deploy                  | Railway (web + cron)                                                                         |
| CI                      | GitHub Actions                                                                               |

---

## Aturan operasional

1. Env lokal: `apps/web/.env.local` (dari `.env.example`) — **jangan commit**.
2. Supabase JS: **hanya** Realtime + Storage. CRUD lewat Prisma.
3. Prisma 7: jangan mengasumsikan pola v6 (URL di schema saja); ikuti `database-orm.md` + `prisma.config.ts`.
4. Dependency: ikut `dependency-strategy.md` — shared package tanpa business logic.
5. CI wajib: install → prisma generate/validate → typecheck → lint → test.
6. Email transactional provider masih terbuka (AS-D04) — jangan hardcode provider baru tanpa keputusan.
7. Jangan ubah Engineering Baseline tanpa ADR.
8. Design tokens: SoT di `design-tokens.md` — **bukan** di folder `design/`. Jangan hardcode hex di komponen sebelum token di-lock.
9. Outstand/X (**ADR-040**): Project Owner mengatur BYOK X secara manual di
   dashboard Outstand. Jangan menambah env var, form, tabel, atau secret store
   aplikasi untuk Client ID/Client Secret X.
10. Media publishing: Supabase Storage menyimpan original; Outstand Media API
    menyimpan working copy setelah alur upload URL → `PUT` → confirm. Jangan
    menganggap signed URL Supabase sebagai URL publish Outstand.

---

## Related context

- Arsitektur sistem → `ctx-architecture.md`
- Script, lint, konvensi coding → `ctx-development.md`
- Pola fitur di kode → `ctx-implementation.md`
