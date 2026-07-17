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
| AI Context (ringkas, per domain) | `context/` _(direncanakan — lihat bawah)_  |

## Wajib di awal sesi

1. Baca `project-manager/PROJECT_STATE.md` — phase, mode percakapan, next tasks.
2. Ikuti skill project: `.agents/skills/project-os-navigator/SKILL.md`.
3. Untuk keputusan yang belum ada di baseline: ikuti `.agents/skills/proactive-clarification/SKILL.md`.
4. Setelah pekerjaan selesai: ikuti `.agents/skills/work-report-simple/SKILL.md`.

## AI Context layer (`context/`)

Struktur yang disepakati (akan diisi; jangan mengarang isi sebelum file ada):

```
context/
├── README.md
├── ctx-project.md
├── ctx-business.md
├── ctx-domain.md
├── ctx-architecture.md
├── ctx-technical-context.md
├── ctx-development.md
├── ctx-implementation.md
└── ctx-design.md
```

**Aturan:** file `context/ctx-*.md` adalah **indeks + aturan operasional untuk agent** — menunjuk ke baseline, bukan menyalin ulang isi `product-discovery/` atau `project-manager/`. Jika konflik, baseline + ADR menang.

Sampai folder `context/` terisi, gunakan tabel Source of Truth di atas dan dokumen baseline yang relevan untuk task.

## Stack & layout (ingat cepat)

- Runtime: **Bun** · App: **Next.js** (`apps/web`) · Shared: `packages/shared`
- Auth: **Better Auth** · ORM: **Prisma 7** · DB/Storage/Realtime: **Supabase**
- Integrasi sosial: **Outstand** (via Anti-Corruption Layer), bukan SDK network langsung
- Arsitektur: **Modular Monolith + DDD** · domain di `apps/web/src/domains/`
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

## Mode kerja saat ini

Lihat `Active Conversation Mode` di `PROJECT_STATE.md`.

- M7 (Repository & Bootstrap) selesai → fokus **M8 Development** diizinkan.
- Wireframe detail & perubahan arsitektur tanpa ADR: **tidak** diizinkan.

## Mapping task → baca dulu

| Jenis task                   | Baca minimal                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Fitur / use-case             | `PROJECT_STATE.md` → BC terkait di `05-architecture/` + UX flow di `04-ux/`                                 |
| Schema / migrasi             | `05-architecture/database-strategy.md` + `06-engineering/database-orm.md` + `apps/web/prisma/schema.prisma` |
| Auth / session               | `05-architecture/auth-architecture.md` + `06-engineering/auth-strategy.md`                                  |
| Outstand / webhook / publish | `05-architecture/integration-layer.md`                                                                      |
| Jobs / cron                  | `05-architecture/background-jobs.md`                                                                        |
| Env / deploy / CI            | `06-engineering/environment-management.md`, `deployment-infrastructure.md`, `cicd-pipeline.md`              |
| Desain / handoff UI          | `design/README.md` (perubahan di `design/` tidak wajib masuk CHANGELOG development)                         |

## Setelah mengubah sesuatu

- Update `project-manager/PROJECT_STATE.md` bila progress / next tasks berubah.
- Catat di `project-manager/CHANGELOG.md`.
- Insight diskusi penting → `project-manager/CONVERSATIONS.md`.
- Keputusan material → ADR di `project-manager/DECISIONS.md`.

## Related

- Root setup: `README.md`
- Skills: `.agents/skills/`
- Planned context index: `context/README.md` _(setelah folder dibuat)_
