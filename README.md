# Social Media Management

Hybrid monorepo untuk platform Social Media Management (working title).

## Structure

```
apps/web          → Next.js app (@social/web)
packages/shared   → Shared types (@social/shared)
product-discovery → Product / architecture / engineering baselines
project-manager   → Project OS (state, decisions, rules)
design            → Design ops docs
```

## Prerequisites

- [Bun](https://bun.sh) (ADR-002)
- Git (untuk Lefthook pre-commit hooks)

## Setup

```bash
bun install          # juga memasang Lefthook via prepare
bun run dev
```

App: `http://localhost:3000`

Env lokal: salin `apps/web/.env.example` → `apps/web/.env.local` setelah template tersedia (sisa M7).

## Scripts (root)

| Script                                             | Description                   |
| -------------------------------------------------- | ----------------------------- |
| `bun run dev`                                      | Start Next.js dev server      |
| `bun run build`                                    | Production build              |
| `bun run start`                                    | Start production server       |
| `bun run typecheck`                                | TypeScript check              |
| `bun run lint` / `lint:fix`                        | ESLint                        |
| `bun run format` / `format:check`                  | Prettier                      |
| `bun run test` / `test:watch`                      | Vitest                        |
| `bun run db:generate` / `db:migrate` / `db:deploy` | Prisma (setelah bootstrap DB) |

## DX notes

- Pre-commit: Lefthook → lint-staged (ESLint + Prettier pada file staged di `apps/` & `packages/`)
- Lint/format scope: kode app & shared; folder dokumentasi di-ignore Prettier

## Remaining M7

Prisma + Better Auth skeleton, `apps/web/.env.example`, CI GitHub Actions.

## Documentation

- Project status: `project-manager/PROJECT_STATE.md`
- Engineering baseline: `product-discovery/06-engineering/`
- Monorepo layout: `product-discovery/06-engineering/monorepo-setup.md`
