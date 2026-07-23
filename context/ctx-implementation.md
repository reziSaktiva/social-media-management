# Context — Implementation

Indeks **cara menulis fitur di repo ini**: struktur folder, alur entry → service → domain → repository, dan larangan import.  
Konvensi gaya / DX → `ctx-development.md`.  
Keputusan arsitektur → `ctx-architecture.md`.

---

## Baca dulu

| Dokumen                                                                                                                  | Topik                                                     |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| [`../product-discovery/05-architecture/application-layer.md`](../product-discovery/05-architecture/application-layer.md) | Kontrak service, repository, entry points, error handling |
| [`domain-model.md`](../product-discovery/05-architecture/domain-model.md)                                                | BC & boundary                                             |
| [`integration-layer.md`](../product-discovery/05-architecture/integration-layer.md)                                      | Outstand ACL — saat sentuh publish/webhook/OAuth          |
| [`../product-discovery/06-engineering/monorepo-setup.md`](../product-discovery/06-engineering/monorepo-setup.md)         | Layout `apps/web`, `packages/shared`                      |

---

## Layout kode (ingat cepat)

```text
apps/web/
├── prisma/                  ← schema + migrations
├── src/
│   ├── app/                 ← Next.js App Router (entry points saja)
│   ├── domains/
│   │   ├── identity/
│   │   ├── workspace/
│   │   ├── publishing/
│   │   ├── ai-assistant/
│   │   ├── engagement/
│   │   ├── analytics/
│   │   ├── start-page/
│   │   ├── media/
│   │   └── notification/
│   └── lib/                 ← prisma, better-auth, env, supabase stubs
packages/shared/             ← ID, enum, VO — tanpa business logic
```

Setiap domain module punya public surface via `index.ts` (dan types/errors sesuai scaffold M7).

---

## Alur implementasi fitur

```text
UI / Route / Server Action / Route Handler
    → Application Service (domain module)
        → Domain rules / entities
        → Repository interface → Prisma implementation (infrastructure)
```

Webhook / cron / eksternal → Route Handler atau job runner → Application Service
(bukan logic di handler). Khusus webhook Outstand, receipt wajib durable sebelum
ACK; pemrosesan domain berjalan sesudah ACK melalui job internal.

---

## Aturan operasional

1. **Entry points** (`app/`, Middleware, Route Handlers, Server Actions): wiring + auth guard tipis + panggil service. **Tanpa** business rules.
2. **Satu Application Service per BC** — orchestrasi, otorisasi (RBAC), koordinasi repo.
3. **Domain logic** murni: tidak import Prisma, Supabase client, atau HTTP Outstand.
4. **Repository**: interface di sisi domain; implementasi pakai Prisma di lapisan infrastructure domain tersebut.
5. **Cross-domain**: import hanya dari public API (`domains/<other>/index.ts`) — bukan file internal domain lain.
6. **Outstand**: hanya lewat adapter/ACL — lihat `integration-layer.md`.
7. **Shared**: tipe bersama di `@social/shared`; jangan taruh use-case di shared package.
8. **Billing (BC-10)**: jangan diimplementasi sebagai fitur MVP kecuali keputusan berubah + ADR.
9. Schema DB: selaraskan dengan `database-strategy.md` + `schema.prisma`; migrasi lewat Prisma Migrate.
10. **Kontrak Outstand ADR-040:** jangan membuat handler webhook komentar/DM,
    jangan mengirim signed URL Supabase sebagai media publish, dan jangan
    meminta secret X dari user aplikasi. Gunakan tiga event webhook resmi,
    Outstand Media API working copy, comment sync 30 menit/manual refresh, serta
    X BYOK manual di dashboard Outstand.
11. Keberadaan kontrak dokumentasi atau schema **bukan** bukti runtime sudah
    diimplementasikan. Saat mulai M8, verifikasi service, adapter, handler, job,
    dan test yang benar-benar ada sebelum mengandalkannya.

---

## Checklist fitur baru (ringkas)

1. Identifikasi BC + baca service contract di `application-layer.md`.
2. Cek roles/status di `roles-permissions.md` jika menyentuh akses atau workflow konten.
3. Cek UX flow di `04-ux/` (pointer di `ctx-design.md`) jika ada UI.
4. Jika menyentuh Outstand, baca ADR-040 dan checklist kontrak di
   `ctx-architecture.md`.
5. Implement di `domains/<bc>/` + entry point tipis di `app/`.
6. Jalankan checklist di `ctx-development.md`.

---

## Related context

- Coding/DX → `ctx-development.md`
- Architecture “mengapa” → `ctx-architecture.md`
- Technical stack → `ctx-technical-context.md`
- Domain map → `ctx-domain.md`
