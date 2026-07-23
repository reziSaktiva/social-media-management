# 06 — Engineering Planning

Dokumentasi pada folder ini berfokus pada **Engineering Planning** untuk produk **Social Media Management**, mencakup seluruh keputusan teknis yang harus ditetapkan sebelum implementasi kode dimulai.

Seluruh dokumentasi pada folder ini harus mengacu pada **Business Baseline v1.0**, **Product Baseline v1.0**, **User Discovery Baseline v1.0**, **UX Planning Baseline v1.0**, dan **System Architecture Baseline v1.0** yang telah disepakati. Folder ini sendiri ditetapkan sebagai **Engineering Planning Baseline v1.0** (ADR-036) dan menjadi acuan wajib untuk Repository & Bootstrap (M7).

---

# Tujuan

* Mendokumentasikan seluruh keputusan teknis yang memengaruhi arsitektur dan implementasi.
* Menetapkan stack teknologi secara definitif sebelum kode pertama ditulis.
* Mendefinisikan setup infrastruktur, deployment, dan environment.
* Menyusun strategi CI/CD dan developer workflow.
* Menjadi acuan wajib sebelum Repository & Bootstrap dimulai.

---

# Scope

Folder ini hanya membahas **Engineering Planning**.

Topik yang termasuk dalam scope:

* **Monorepo & Workspace Setup** — struktur folder, workspace tooling, Bun workspaces.
* **Deployment & Infrastructure** — platform hosting, region, staging vs production.
* **Authentication Strategy** — library, session management, provider, token strategy.
* **Database & ORM** — ORM pilihan, migration strategy, connection pooling.
* **CI/CD Pipeline** — tooling, trigger, environment, test gates, deployment workflow.
* **Environment Management** — variabel environment, secret management, local vs staging vs production.
* **Package & Dependency Strategy** — versioning, lockfile, shared packages.
* **Developer Experience (DX) Tooling** — linting, formatting, pre-commit hooks, local dev setup.
* **UI Component System** — Astryx sebagai fondasi permanen, Tailwind
  layout-only, dan wrapper selektif (ADR-041).
* **Design Tokens** — Source of Truth font, warna semantic, neutral, status,
  spacing untuk implementasi UI (ADR-038, ADR-041); template tetap Draft/TBD
  selama M8 dan nilai final diisi setelah feature selesai serta designer masuk.

Topik berikut **tidak dibahas** pada folder ini:

* Wireframe detail, eksplorasi Figma, dan brief handoff designer (ada di `../../design/` — bukan SoT token)
* Product Scope dan Feature Priority (sudah di 02-product)
* System Architecture high-level (ada di 05-architecture)
* Implementasi kode (ada di fase Development)
* Database schema detail (ada di fase Development)

---

# Daftar Dokumen

* `monorepo-setup.md` — struktur Hybrid Monorepo, workspace layout, Bun workspaces.
* `deployment-infrastructure.md` — platform deployment (Railway), region, environment strategy.
* `auth-strategy.md` — authentication library (Better Auth), session, provider, token.
* `database-orm.md` — Prisma sebagai ORM formal (ADR-031), batas Supabase client (Realtime/Storage), Prisma Migrate, connection pooling.
* `cicd-pipeline.md` — GitHub Actions quality gates, promosi staging→main, Railway CD, migrate on release (ADR-032).
* `environment-management.md` — katalog env vars, secret native (Railway + `.env.local`), Supabase Cloud `social-media-local` / staging / prod (ADR-033).
* `dx-tooling.md` — ESLint + Prettier, Lefthook + lint-staged, Vitest, script workspace (ADR-034).
* `dependency-strategy.md` — caret ranges, pengecualian exact pin Astryx Beta,
  `bun.lockb` root, penempatan dep, aturan `@social/shared`, update manual
  (ADR-035, ADR-041).
* `design-tokens.md` — SoT visual tokens (font,
  brand/neutral/status/feedback colors, spacing); neutral theme Astryx dipakai
  selama M8 dan template di-lock setelah designer masuk (ADR-038, ADR-041).

---

# Engineering Planning Workflow

Seluruh proses Engineering Planning mengikuti alur berikut:

```text
System Architecture Output
        ↓
Monorepo & Workspace Setup
        ↓
Deployment & Infrastructure
        ↓
Authentication Strategy
        ↓
Database & ORM
        ↓
CI/CD Pipeline
        ↓
Environment Management
        ↓
DX Tooling & Dependency Strategy
        ↓
Engineering Planning Baseline v1.0 (ADR-036)
        ↓
Repository & Bootstrap (M7)
```

Setiap keputusan teknis yang signifikan harus dicatat sebagai ADR di `../../project-manager/DECISIONS.md`.

---

# Cara Menggunakan

1. Mulai dari `monorepo-setup.md` untuk menetapkan struktur workspace.
2. Tentukan platform deployment dan environment di `deployment-infrastructure.md`.
3. Tetapkan auth library dan strategi session di `auth-strategy.md`.
4. Tentukan ORM dan strategi migrasi di `database-orm.md`.
5. Susun pipeline CI/CD di `cicd-pipeline.md`.
6. Dokumentasikan strategi env dan secret di `environment-management.md`.
7. Tetapkan DX tooling di `dx-tooling.md`.
8. Dokumentasikan aturan dependency di `dependency-strategy.md`.
9. Gunakan seluruh output sebagai acuan Repository & Bootstrap (M7).
10. Selama M8, gunakan neutral theme Astryx dan Tailwind khusus layout tanpa
    menunggu token final.
11. Setelah feature selesai dan design UI di-approve: isi `design-tokens.md`,
    lalu mirror ke Astryx theme + Tailwind token bridge — lihat panduan PM di
    dokumen tersebut (ADR-038, ADR-041).

---

# Input dari Fase Sebelumnya

## Dari ADR yang Sudah Ada

* **ADR-001** — Hybrid Monorepo sebagai repository strategy.
* **ADR-002** — Bun sebagai JavaScript runtime dan package manager.
* **ADR-003** — Next.js sebagai framework utama.
* **ADR-004** — Modular Monolith + DDD sebagai arsitektur.
* **ADR-005** — Outstand API sebagai social media integration provider.

## Dari Product Baseline v1.0

* Domain prioritas MVP: Publishing, Workspace, Engagement, Analytics, AI Assistant.
* Skala awal: tim kecil (Marketing Team), bukan enterprise.

## Dari UX Planning

* Screen dan navigation patterns yang memengaruhi routing dan data fetching strategy.
* Pola layar utama yang memengaruhi kebutuhan API dan state management.

## Dari System Architecture Baseline v1.0 (ADR-025)

Keputusan-keputusan berikut sudah ditetapkan di `product-discovery/05-architecture/` dan menjadi constraint langsung untuk Engineering Planning:

| Topik | Keputusan | Dokumen Sumber |
| ----- | --------- | -------------- |
| Database Platform | Supabase PostgreSQL Cloud | `database-strategy.md` |
| Multi-tenancy | Row-Level Security dengan `workspace_id` | `database-strategy.md` |
| Schema | Single schema `public` dengan domain prefix | `database-strategy.md` (ADR-014) |
| Auth Library | Better Auth | `auth-architecture.md` (ADR-024) |
| Session | HTTP-only cookie, 7 hari, SameSite=lax | `auth-architecture.md` |
| Auth Provider MVP | Email + Password + Google OAuth | `auth-architecture.md` |
| Application Layer | Server Actions (UI mutations) + Route Handlers (webhook/external) | `application-layer.md` (ADR-016) |
| Repository Pattern | Interface di domain, implementasi via Prisma (ADR-031) | `application-layer.md` (ADR-017 amended) |
| Background Jobs | PostgreSQL job queue + Railway Cron sebagai trigger | `background-jobs.md` (ADR-022) |
| Real-time | Supabase Realtime hanya untuk notifikasi in-app | `realtime-strategy.md` (ADR-023) |
| Storage | Supabase Storage | `database-strategy.md` |
| Deployment | Railway | keputusan pra-architecture |
| External Integration | Outstand API via Anti-Corruption Layer (OutstandAdapter) | `integration-layer.md` (ADR-019) |
| Webhook Handling | Verify HMAC raw body → durable receipt → ACK 2xx → JOB-01 internal | `integration-layer.md` (ADR-020, ADR-040) |
| Engagement MVP | Comments/replies; JOB-03 pull 30 menit + manual refresh | `background-jobs.md` (ADR-040) |
| Publishing Media | Original Supabase Storage; working copy via Outstand upload URL → PUT → confirm | `integration-layer.md` (ADR-040) |
| Twitter/X | MVP, BYOK wajib di dashboard Outstand; app tidak menyimpan X client secret | ADR-040 |

Keputusan di tabel ini **tidak perlu diputuskan ulang** di Engineering Planning. Engineering Planning mendokumentasikan detail teknis implementasinya — konfigurasi, tooling, dan strategi operasional.

## Amandemen Engineering Baseline — ADR-040

ADR-040 mengamandemen ADR-036 secara aditif. Engineering wajib menyediakan route ingestion raw-body-safe, persistence `outstand_webhook_events`, handler JOB-01 internal, scheduler JOB-03 30 menit + manual refresh, flow working copy media Outstand, dan runbook BYOK X per environment. Schema dan migrasi aditif wajib mengikuti kontrak tersebut; status implementasi mengacu hanya ke `PROJECT_STATE.md`.

## Amandemen Engineering Baseline — ADR-041

ADR-041 mengamandemen ADR-035, ADR-038, dan ADR-036 secara aditif:

* Astryx menggantikan shadcn/ui sebagai fondasi component system permanen;
* neutral theme Astryx digunakan selama feature development;
* Tailwind dibatasi untuk layout dan responsive page composition;
* wrapper Astryx dibuat selektif, bukan untuk seluruh komponen;
* feature implementation tidak menunggu design tokens final;
* paket Astryx Beta memakai exact stable version dan di-upgrade sebagai satu
  unit; dan
* adopsi luas atau upgrade Astryx wajib melewati smoke test UI serta Next.js
  production build.

---

# Expected Output

Setelah seluruh dokumen pada folder ini selesai, project harus memiliki:

* Keputusan teknis yang terdokumentasi dan dapat dijadikan acuan implementasi.
* Stack teknologi yang definitif (auth, ORM, deployment, CI/CD).
* Strategi environment yang jelas untuk local, staging, dan production.
* DX tooling yang siap digunakan sejak hari pertama development.
* ADR baru untuk setiap keputusan teknis signifikan.
* Input yang cukup untuk memulai Repository & Bootstrap (M7).

---

# Exit Criteria

Engineering Planning dianggap selesai apabila:

* Seluruh keputusan teknis utama telah terdokumentasi.
* Deployment platform dan environment strategy telah ditetapkan.
* Auth strategy dan ORM strategy telah dipilih dan didokumentasikan.
* CI/CD pipeline telah dirancang.
* DX tooling dan dependency strategy telah ditetapkan.
* Setiap keputusan signifikan memiliki ADR di `DECISIONS.md`.
* Tidak ada keputusan teknis yang bertentangan dengan System Architecture.
* `PROJECT_STATE.md` telah diperbarui.

---

# Decision Rules

Keputusan teknis berikut **wajib** masuk ke `../../project-manager/DECISIONS.md`:

* Perubahan atau konfirmasi deployment platform
* Perubahan atau konfirmasi authentication library
* Perubahan atau konfirmasi ORM
* Perubahan atau konfirmasi CI/CD tooling
* Perubahan pada monorepo structure
* Perubahan pada environment strategy
* Perubahan pada dependency strategy (versioning, lockfile, shared packages)
* Lock atau perubahan material design tokens (font, brand colors, tema light/dark) — lihat `design-tokens.md` (ADR-038)

Perubahan progress Engineering Planning harus diperbarui pada:

* `../../project-manager/PROJECT_STATE.md`

---

# Related Documents

* `../../project-manager/PROJECT_OVERVIEW.md`
* `../../project-manager/PROJECT_RULES.md`
* `../../project-manager/PROJECT_STATE.md`
* `../../project-manager/DECISIONS.md`
* `../README.md`
* `../01-business/README.md`
* `../02-product/README.md`
* `../03-user/README.md`
* `../04-ux/README.md`
* `../05-architecture/README.md`
