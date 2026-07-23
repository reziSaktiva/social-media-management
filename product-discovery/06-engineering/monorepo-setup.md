# Monorepo Setup

Dokumen ini mendefinisikan **struktur Hybrid Monorepo**, konfigurasi Bun Workspaces, layout folder aplikasi, dan aturan import yang berlaku untuk project Social Media Management.

Dokumen ini adalah implementasi konkret dari ADR-001 (Hybrid Monorepo), ADR-002 (Bun), ADR-003 (Next.js), dan ADR-004 (Modular Monolith + DDD). Domain module structure selaras dengan domain-model.md; App Router routing structure selaras dengan information-architecture.md.

---

# Tujuan

* Menetapkan struktur folder monorepo secara definitif sebelum Repository & Bootstrap (M7) dimulai.
* Mendefinisikan workspace layout apps/ dan packages/ beserta tanggung jawab masing-masing.
* Mendefinisikan konfigurasi Bun Workspaces (root `package.json`).
* Menetapkan App Router routing structure yang mencerminkan Information Architecture.
* Mendefinisikan internal structure setiap domain module.
* Menetapkan aturan import lintas domain yang harus dipatuhi di seluruh codebase.

---

# Monorepo Root Structure

```
social-media-management/          ← monorepo root
├── apps/
│   └── web/                      ← aplikasi Next.js utama
├── packages/
│   └── shared/                   ← @social/shared — shared types lintas domain
├── product-discovery/            ← dokumentasi produk (bukan kode)
├── project-manager/              ← project OS (bukan kode)
├── package.json                  ← Bun Workspaces root config
├── tsconfig.json                 ← TypeScript base config
├── .gitignore
└── README.md
```

**Prinsip root:**
- `apps/` → satu atau lebih aplikasi yang bisa di-deploy.
- `packages/` → shared libraries yang dikonsumsi oleh satu atau lebih app.
- Folder dokumentasi (`product-discovery/`, `project-manager/`) tidak termasuk workspace — tidak diproses Bun.

---

# Bun Workspaces Configuration

File `package.json` di root mendaftarkan semua workspace yang dikelola Bun:

```json
{
  "name": "social-media-management",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "bun run --cwd apps/web dev",
    "build": "bun run --cwd apps/web build",
    "typecheck": "bun run --cwd apps/web typecheck",
    "lint": "eslint .",
    "test": "vitest run",
    "format": "prettier --write ."
  }
}
```

> Script lengkap (`lint:fix`, `format:check`, `test:watch`, `db:*`) dan tooling terkait ada di `dx-tooling.md` (ADR-034). Cuplikan di atas adalah kontrak minimal root.

**Aturan workspace:**
- Setiap workspace memiliki `package.json` sendiri dengan `name` yang unik.
- Package dalam workspace saling mereferensi via workspace protocol: `"@social/shared": "workspace:*"`.
- Lockfile (`bun.lockb`) ada di root — satu lockfile untuk seluruh monorepo.
- Jangan install dependency langsung di root kecuali untuk tooling monorepo-level (misal: TypeScript, ESLint config).

---

# apps/web — Next.js Application

Satu-satunya aplikasi yang ada pada fase MVP.

## Package Config

```json
{
  "name": "@social/web",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@social/shared": "workspace:*"
  }
}
```

## Folder Structure

```
apps/web/
├── src/
│   ├── app/                      ← Next.js App Router (routing & UI)
│   ├── domains/                  ← Domain Logic (9 BC MVP; Billing post-MVP)
│   ├── components/               ← UI Components
│   ├── lib/                      ← Infrastructure Clients & Utilities
│   └── middleware.ts             ← Auth guard + workspace context injection
├── public/                       ← Static assets
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## src/app/ — App Router Structure

Routing structure mencerminkan Information Architecture dari `product-discovery/04-ux/information-architecture.md`.

```
src/app/
├── layout.tsx                    ← Root layout (HTML, global providers)
├── page.tsx                      ← Redirect ke workspace aktif atau onboarding
│
├── (auth)/                       ← Route group: auth pages (tanpa workspace layout)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
│
├── [slug]/                       ← Dynamic segment: workspace slug
│   ├── layout.tsx                ← Workspace layout (sidebar nav, workspace context)
│   │
│   ├── home/
│   │   └── page.tsx              ← Today's Schedule, Recent Activity, Snapshots
│   │
│   ├── publish/
│   │   ├── layout.tsx            ← Publish sub-nav (Calendar / Queue / Drafts / History)
│   │   ├── calendar/
│   │   │   ├── page.tsx          ← Content Calendar
│   │   │   └── [postId]/
│   │   │       └── page.tsx      ← Draft Editor (buka dari Calendar)
│   │   ├── queue/
│   │   │   ├── page.tsx          ← Queue Management
│   │   │   └── [postId]/
│   │   │       └── page.tsx      ← Draft Editor (buka dari Queue)
│   │   ├── drafts/
│   │   │   ├── page.tsx          ← Daftar Drafts
│   │   │   └── [postId]/
│   │   │       └── page.tsx      ← Draft Editor
│   │   └── history/
│   │       ├── page.tsx          ← Published History
│   │       └── [postId]/
│   │           └── page.tsx      ← Post Detail
│   │
│   ├── engage/
│   │   └── inbox/
│   │       └── page.tsx          ← Engagement Inbox
│   │
│   ├── analyze/
│   │   └── page.tsx              ← Analytics Dashboard
│   │
│   ├── start-page/
│   │   └── page.tsx              ← Start Page Editor + Preview
│   │
│   └── settings/
│       ├── layout.tsx            ← Settings sub-nav
│       ├── general/
│       │   └── page.tsx          ← Workspace name, timezone, brand
│       ├── connected-accounts/
│       │   └── page.tsx          ← Social account management
│       ├── members/
│       │   └── page.tsx          ← Team members
│       ├── roles/
│       │   └── page.tsx          ← Roles & permissions
│       └── billing/
│           └── page.tsx          ← Billing (Post-MVP, halaman placeholder)
│
├── account/                      ← User settings (bukan workspace-specific)
│   ├── layout.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── notifications/
│   │   └── page.tsx
│   └── preferences/
│       └── page.tsx
│
└── api/                          ← Route Handlers (external / platform only)
    ├── auth/
    │   └── [...all]/
    │       └── route.ts          ← Better Auth catch-all (session, OAuth callback, dll.)
    ├── health/
    │   └── route.ts              ← Health check endpoint
    ├── jobs/
    │   └── run/
    │       └── route.ts          ← Job runner (Railway Cron → X-Job-Secret)
    └── webhooks/
        └── outstand/
            └── route.ts          ← raw body HMAC → durable receipt → ACK 2xx
```

**Aturan routing:**
- `[slug]` adalah workspace slug — digunakan Middleware untuk resolve workspace context.
- Route group `(auth)` tidak mewarisi workspace layout — render halaman kosong tanpa sidebar.
- `api/` hanya untuk Route Handlers platform/eksternal: Better Auth (`/api/auth/*`), health check, job runner (`/api/jobs/run`), dan webhook. Mutations UI menggunakan Server Actions, bukan route API internal.
- `/api/auth/*` dan `/api/jobs/*` di-bypass dari session Middleware — auth sendiri dilindungi Better Auth; job runner dilindungi header `X-Job-Secret` (lihat `auth-architecture.md`, `deployment-infrastructure.md`).
- `/api/webhooks/outstand` wajib membaca raw body sebelum parsing. Route memanggil WebhookIngestion Application Service untuk menulis `outstand_webhook_events` idempoten dan enqueue `outstand.webhook.process`; business processing tidak berjalan inline.
- `billing/` ada di routing MVP tapi halaman menampilkan placeholder — implementasi Post-MVP.

---

## src/domains/ — Domain Modules

Setiap Bounded Context **MVP** memiliki folder sendiri di `src/domains/`. Selaras dengan folder reference di `domain-model.md`.

MVP memuat **9 domain modules**. BC-10 Billing adalah post-MVP — tidak ada folder `billing/` di `src/domains/` sampai Billing diimplementasi; route Settings → Billing tetap ada sebagai halaman placeholder (lihat App Router di atas).

```
src/domains/
├── identity/           ← BC-01
├── workspace/          ← BC-02
├── publishing/         ← BC-03
├── ai-assistant/       ← BC-04
├── engagement/         ← BC-05
├── analytics/          ← BC-06
├── start-page/         ← BC-07
├── media/              ← BC-08
└── notification/       ← BC-09
# BC-10 Billing — post-MVP (belum ada folder module)
```

### Internal Structure per Domain

Setiap domain mengikuti struktur empat lapisan yang konsisten:

```
src/domains/[domain]/
├── index.ts                      ← Public API (barrel export — satu-satunya file yang boleh diimport dari luar)
├── types.ts                      ← Domain-specific types & interfaces
├── errors.ts                     ← Domain error classes
├── entities/                     ← Domain entities & aggregates
│   └── [entity].ts
├── value-objects/                ← Value objects
│   └── [vo].ts
├── repositories/                 ← Repository interfaces (bukan implementasi)
│   └── [repo].interface.ts
└── services/                     ← Application Service
    └── [domain]-service.ts
```

**Yang ada di `index.ts` (barrel):**
- Export Application Service class/factory.
- Export domain-specific types yang dikonsumsi Entry Points.
- Export repository interfaces (untuk dependency injection).

**Yang tidak di-export dari `index.ts`:**
- Implementasi internal entity.
- Implementasi repository (ada di `src/lib/`).
- Helper functions yang hanya dipakai internal domain.

---

## src/components/ — UI Components

```
src/components/
├── ui/                           ← shadcn/ui base components (Button, Input, Dialog, dll.)
└── [feature]/                    ← Feature-specific components (co-located dengan domain penggunaannya)
```

**Aturan:**
- `ui/` berisi komponen primitif dari shadcn/ui — tidak boleh dimodifikasi langsung, extend via wrapper.
- Feature components tidak boleh berisi business logic — logika ada di domain services.

---

## src/lib/ — Infrastructure Clients & Utilities

```
src/lib/
├── prisma/
│   └── client.ts                 ← PrismaClient singleton (server-only; CRUD domain)
├── supabase/
│   ├── client.ts                 ← Supabase browser client (Realtime)
│   ├── server.ts                 ← Supabase server client (Storage; bukan CRUD domain)
│   └── middleware.ts             ← Supabase client untuk Middleware (jika diperlukan)
├── better-auth/
│   └── auth.ts                   ← Better Auth instance & config (Prisma adapter)
├── outstand/
│   └── adapter.ts                ← ACL: webhook mapping, media upload, comments/replies
├── repositories/                 ← Repository implementations (Prisma-based)
│   ├── identity/
│   ├── workspace/
│   ├── publishing/
│   └── ...
└── utils/
    └── errors.ts                 ← App-level error utilities
```

Prisma schema & migrasi berada di `apps/web/prisma/` (lihat `database-orm.md`).

**Aturan:**
- Repository implementations ada di `src/lib/repositories/` — bukan di dalam folder domain.
- Domain hanya mendefinisikan interface; implementasi di `lib/` menggunakan **Prisma Client** (ADR-031).
- Supabase client **tidak** dipakai untuk CRUD domain — hanya Realtime dan Storage (`database-orm.md` DO-D02).
- `supabase/client.ts`, `supabase/server.ts`, dan `supabase/middleware.ts` adalah konteks berbeda — jangan gunakan yang salah (client.ts di Server Component akan error).

---

# packages/shared — @social/shared

Package untuk shared types yang dikonsumsi lintas domain atau lintas aplikasi.

```
packages/shared/
├── src/
│   ├── ids.ts                    ← Branded ID types (WorkspaceId, PostId, UserId, dll.)
│   ├── enums.ts                  ← Shared enums (ContentStatus, MemberRole, Platform, dll.)
│   └── value-objects.ts          ← Shared value objects (Email, URL, dll.)
├── index.ts                      ← Barrel export
├── package.json                  ← { "name": "@social/shared" }
└── tsconfig.json
```

**Package config:**

```json
{
  "name": "@social/shared",
  "version": "0.1.0",
  "main": "./index.ts",
  "exports": {
    ".": "./index.ts"
  }
}
```

**Aturan:**
- `@social/shared` tidak boleh mengimport dari `@social/web` atau domain apapun — hanya types, enums, dan value objects murni.
- Tambahkan ke shared hanya jika type benar-benar digunakan oleh lebih dari satu domain.
- Jangan pindahkan business logic ke shared — shared bukan "domain umum", hanya type contracts.

---

# TypeScript Configuration

## Root tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true
  }
}
```

## apps/web/tsconfig.json

Extends root config dan menambahkan path aliases:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@social/shared": ["../../packages/shared/index.ts"]
    }
  }
}
```

**Path aliases yang digunakan:**
- `@/*` → `src/*` — import apapun dalam apps/web tanpa relative path panjang.
- `@social/shared` → dikonfigurasi via Bun Workspaces, tidak perlu manual alias di produksi.

---

# Import Rules

Aturan ini bersumber dari BR-01 s/d BR-06 di `domain-model.md` dan wajib dipatuhi di seluruh codebase.

## Aturan Wajib

**IR-01 — Import Domain Hanya via Barrel**

```typescript
// ✅ BENAR
import { PublishingService } from '@/domains/publishing';

// ❌ DILARANG — import file internal domain
import { PublishingService } from '@/domains/publishing/services/publishing-service';
```

**IR-02 — Domain Tidak Boleh Import Domain Lain Langsung**

```typescript
// ✅ BENAR — domain berkomunikasi via Application Service atau service interface
// (Orchestrasi di Application Service, bukan di domain logic)

// ❌ DILARANG — domain importing domain lain
import { WorkspaceService } from '@/domains/workspace';  // di dalam publishing/services/
```

**IR-03 — Domain Tidak Boleh Import dari src/lib/**

```typescript
// ✅ BENAR — repository interface ada di domain, implementasi di-inject
// Domain hanya kenal interface IPostRepository, bukan PrismaPostRepository

// ❌ DILARANG
import { prisma } from '@/lib/prisma/client';  // di dalam domain entities/
```

**IR-04 — Entry Points Hanya Boleh Call Application Service**

```typescript
// ✅ BENAR — Server Action memanggil Application Service
import { PublishingService } from '@/domains/publishing';
const service = new PublishingService(/* repo injected */);
await service.schedulePost(input);

// ❌ DILARANG — Server Action memanggil repository langsung
import { postRepository } from '@/lib/repositories/publishing/post-repository';
await postRepository.save(post);
```

**IR-05 — @social/shared Tidak Boleh Import Apapun dari Monorepo**

```typescript
// ✅ BENAR — shared hanya berisi types, enums, value objects murni
export type WorkspaceId = string & { readonly __brand: 'WorkspaceId' };

// ❌ DILARANG — shared mengimport dari domain atau lib
import { something } from '@/domains/workspace';  // di dalam packages/shared/
```

---

# Decision Log

| ID | Keputusan | Alasan | Alternatif |
|----|-----------|--------|-----------|
| MS-D01 | `apps/web` sebagai satu-satunya aplikasi pada MVP | Sesuai ADR-004 Modular Monolith — satu deployment unit sampai ada alasan kuat untuk memisahkan | Multi-app sejak awal (premature separation) |
| MS-D02 | Domain modules di `src/domains/` dalam apps/web, bukan sebagai workspace package terpisah | Domain logic tightly coupled dengan Next.js entry points di fase MVP — memisahkan ke package menambah indirection tanpa benefit nyata untuk single-app | packages/identity, packages/publishing, dst. |
| MS-D03 | App Router routing menggunakan `[slug]` sebagai workspace dynamic segment | Workspace context di-resolve dari URL slug — selaras dengan auth-architecture.md dan keputusan Middleware workspace resolution | Query param `?workspace=slug` (kurang bersih, tidak SEO-friendly) |
| MS-D04 | `packages/shared` hanya untuk branded IDs, enums, dan value objects yang digunakan 2+ domain | Mencegah shared menjadi "junk drawer" — hanya types yang genuinely cross-domain | Tidak ada shared package, tiap domain define ulang (duplikasi) |
| MS-D05 | Repository implementations ada di `src/lib/repositories/`, bukan di dalam domain folder | Domain hanya kenal interface — implementations di-inject, memudahkan testing dan penggantian infrastruktur | Repository implementation di dalam domain folder (mencampur domain logic dan infrastructure) |
| MS-D06 | Outstand webhook route hanya ingestion; processor berjalan sebagai JOB-01 | Durable-before-ACK dan retry internal tidak bercampur dengan HTTP delivery vendor |
| MS-D07 | `src/lib/outstand/` menjadi lokasi implementasi ACL | Semua kontrak vendor, termasuk upload media dan comments/replies, terisolasi dari domain |
| MS-D08 | ADR-040 | MS-D06–D07 mengamandemen detail route/infrastructure Engineering Baseline |

---

# Related Documents

* `README.md` — scope dan workflow Engineering Planning
* `deployment-infrastructure.md` — deploy & build dari root monorepo
* `dependency-strategy.md` — versioning, lockfile, penempatan dep, aturan shared (ADR-035)
* `dx-tooling.md` — script root dan tooling monorepo
* `../../product-discovery/05-architecture/domain-model.md` — domain modules dan boundary rules
* `../../product-discovery/05-architecture/application-layer.md` — layer stack dan entry point patterns
* `../../product-discovery/05-architecture/auth-architecture.md` — Middleware workspace context
* `../../product-discovery/04-ux/information-architecture.md` — hierarki layar (dasar routing structure)
* `../../project-manager/DECISIONS.md` — ADR-001, ADR-002, ADR-003, ADR-004, ADR-026, ADR-035
