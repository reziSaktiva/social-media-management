# AGENTS.md — Social Media Management

Pintu masuk untuk AI coding agent. Baca file ini dulu di setiap sesi kerja pada repo ini.

## Purpose

Dokumen ini **bukan** Source of Truth produk. Ia mengarahkan agent ke dokumen yang benar, menegakkan aturan keras, dan mencegah duplikasi / asumsi yang bertentangan dengan baseline.

**Source of Truth:**

| Area                             | Lokasi                                     |
| -------------------------------- | ------------------------------------------ |
| Status, phase, next tasks        | `project-manager/PROJECT_STATE.md`         |
| Aturan kerja & governance        | `project-manager/PROJECT_RULES.md`         |
| Keputusan (ADR)                  | `project-manager/DECISIONS.md`             |
| Produk & engineering             | `product-discovery/`                       |
| Orientasi arsitektur (ringkas)   | `project-manager/ARCHITECTURE_OVERVIEW.md` |
| AI Context (ringkas, per domain) | `context/`                                 |

## Wajib di awal sesi

1. Baca `project-manager/PROJECT_STATE.md` — phase, mode percakapan, next tasks.
2. Ikuti skill project: `.agents/skills/project-os-navigator/SKILL.md`.
3. Untuk keputusan yang belum ada di baseline: ikuti `.agents/skills/proactive-clarification/SKILL.md`.
4. Setelah pekerjaan selesai: ikuti `.agents/skills/work-report-simple/SKILL.md`.
5. Untuk task spesifik: buka file `context/ctx-*.md` yang relevan (lihat `context/README.md`).

## AI Context layer (`context/`)

Struktur **opsi A** (aktif):

```
context/
├── README.md                  ← batas antar file + cara pakai
├── ctx-project.md             ← Project OS, state, rules, ADR
├── ctx-business.md            ← Business + Product + User
├── ctx-domain.md              ← Bounded context, shared types, boundary
├── ctx-architecture.md        ← Layer, ACL, jobs, auth arch, realtime
├── ctx-technical-context.md   ← Stack, env, Prisma, Better Auth, deploy/CI
├── ctx-development.md         ← DX, script, lint/test, aturan coding
├── ctx-implementation.md      ← Pola implementasi di apps/web & domains/
└── ctx-design.md              ← design/ + pointer UX (04-ux)
```

**Aturan:** file `context/ctx-*.md` adalah **indeks + aturan operasional untuk agent** — menunjuk ke baseline, bukan menyalin ulang isi `product-discovery/` atau `project-manager/`. Jika konflik, baseline + ADR menang.

## Stack & layout (ingat cepat)

- Runtime: **Bun** · App: **Next.js** (`apps/web`) · Shared: `packages/shared`
- Auth: **Better Auth** · ORM: **Prisma 7** · DB/Storage/Realtime: **Supabase**
- Integrasi sosial: **Outstand** (via Anti-Corruption Layer), bukan SDK network langsung
- Arsitektur: **Modular Monolith + DDD** · domain di `apps/web/src/domains/`
- UI: **Astryx** (ADR-041) · neutral theme selama M8 · **Tailwind layout-only**
- Deploy: **Railway** (web + cron) · CI: **GitHub Actions**

Detail: `project-manager/PROJECT_OVERVIEW.md` dan `product-discovery/06-engineering/`.

## Aturan keras (jangan dilanggar)

1. Jangan ubah Architecture / Engineering / Product / Business baseline tanpa ADR baru di `DECISIONS.md`.
2. Entry points (RSC, Server Actions, Route Handlers, Middleware) **tidak** boleh berisi business logic — hanya memanggil Application Service.
3. Domain logic **tidak** mengimpor Prisma, Supabase client, atau HTTP client Outstand.
4. Cross-domain: lewat public API module domain lain — bukan import implementasi lintas folder.
5. Shared types hanya di `packages/shared` (ID, enum, value object) — tanpa business logic.
6. Supabase JS client: **hanya** Realtime + Storage. CRUD lewat Prisma.
7. Status progress (% / ✅ / phase aktif) **hanya** di `PROJECT_STATE.md` — jangan taruh di README atau baseline.
8. Persona kanonikal: Raka, Maya, Sinta, Dimas, Lara.
9. Bahasa komunikasi & dokumentasi project: **Bahasa Indonesia** (kecuali user meminta lain).
10. Jangan commit / push kecuali user meminta eksplisit. Jangan commit secret (`.env.local`, kredensial).
11. UI produk hanya memakai Astryx. Wrapper dibuat selektif; jangan memakai
    canary atau `swizzle` Astryx pada tahap awal (ADR-041).
12. Sebelum menulis atau mengubah UI Astryx, baca dokumentasi dari CLI lokal
    yang versinya terkunci. Jangan menebak nama komponen, props, atau pola
    styling.

## Workflow Astryx wajib

Untuk setiap task UI di `apps/web`, jalankan dari root repository:

1. `bun run --cwd apps/web astryx -- template --list` — cari pola halaman yang
   paling dekat.
2. `bun run --cwd apps/web astryx -- template <name> --skeleton` — pelajari
   struktur layout bila ada template relevan.
3. `bun run --cwd apps/web astryx -- component <Name> --dense` — baca API setiap
   komponen yang akan dipakai.
4. Untuk styling atau token, baca
   `bun run --cwd apps/web astryx -- docs styling --dense` dan
   `bun run --cwd apps/web astryx -- docs tokens --dense`.

CLI lokal adalah referensi utama karena sesuai exact version yang terpasang.
Jangan mengganti langkah ini dengan asumsi model atau dokumentasi versi lain.

## Mode kerja

Lihat `Active Conversation Mode` di `PROJECT_STATE.md` untuk fase, objective,
action yang diizinkan, dan pembatasan terkini. Jangan menduplikasi status atau
fase aktif di file ini.

## Mapping task → baca dulu

| Jenis task                   | Context dulu                                 | Baseline minimal                                                                               |
| ---------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Fitur / use-case             | `ctx-domain` + `ctx-implementation`          | BC di `05-architecture/` + UX di `04-ux/` (+ `ctx-business` untuk roles/MVP)                   |
| Schema / migrasi             | `ctx-architecture` + `ctx-technical-context` | `database-strategy.md` + `database-orm.md` + `apps/web/prisma/schema.prisma`                   |
| Auth / session               | `ctx-architecture` + `ctx-technical-context` | `auth-architecture.md` + `auth-strategy.md`                                                    |
| Outstand / webhook / publish | `ctx-architecture`                           | `integration-layer.md`                                                                         |
| Jobs / cron                  | `ctx-architecture`                           | `background-jobs.md`                                                                           |
| Env / deploy / CI            | `ctx-technical-context`                      | `environment-management.md`, `deployment-infrastructure.md`, `cicd-pipeline.md`                |
| Coding conventions / DX      | `ctx-development`                            | `dx-tooling.md`                                                                                |
| UI component / styling       | `ctx-design` + `ctx-implementation`          | `monorepo-setup.md` + `design-tokens.md` + ADR-041                                             |
| Desain / handoff UI          | `ctx-design`                                 | `design/README.md` + `04-ux/` (perubahan di `design/` tidak wajib masuk CHANGELOG development) |

## Setelah mengubah sesuatu

- Update `project-manager/PROJECT_STATE.md` bila progress / next tasks berubah.
- Catat di `project-manager/CHANGELOG.md`.
- Insight diskusi penting → `project-manager/CONVERSATIONS.md`.
- Keputusan material → ADR di `project-manager/DECISIONS.md`.

## Related

- Root setup: `README.md`
- Skills: `.agents/skills/`
- AI Context index: `context/README.md`
