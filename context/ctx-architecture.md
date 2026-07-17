# Context — Architecture

Indeks **apa & mengapa sistem** dibangun: layer, integrasi, jobs, auth architecture, realtime, DB strategy.  
Bukan tempat config env, script DX, atau gaya kode.

---

## Baca dulu

| Dokumen                                                                                            | Topik                                                             |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`../project-manager/ARCHITECTURE_OVERVIEW.md`](../project-manager/ARCHITECTURE_OVERVIEW.md)       | Orientasi high-level                                              |
| [`../product-discovery/05-architecture/README.md`](../product-discovery/05-architecture/README.md) | Indeks Architecture Baseline v1.0 (ADR-025)                       |
| [`application-layer.md`](../product-discovery/05-architecture/application-layer.md)                | 4-layer stack, entry points, services, repository, error handling |
| [`domain-model.md`](../product-discovery/05-architecture/domain-model.md)                          | BC & boundary (detail juga di `ctx-domain.md`)                    |
| [`database-strategy.md`](../product-discovery/05-architecture/database-strategy.md)                | Multi-tenancy RLS, tabel, storage, soft delete                    |
| [`integration-layer.md`](../product-discovery/05-architecture/integration-layer.md)                | Outstand ACL, OAuth, publish, webhook, sync                       |
| [`background-jobs.md`](../product-discovery/05-architecture/background-jobs.md)                    | Job queue Postgres, Railway Cron, job types                       |
| [`realtime-strategy.md`](../product-discovery/05-architecture/realtime-strategy.md)                | Supabase Realtime untuk notifikasi                                |
| [`auth-architecture.md`](../product-discovery/05-architecture/auth-architecture.md)                | Session, middleware workspace, RBAC di service, RLS               |

---

## Layer stack (ingat cepat)

```text
Entry Points (RSC / Server Actions / Route Handlers / Middleware)
    → Application Service (satu per BC)
        → Domain Logic (pure)
            → Repository (interface di domain; impl Prisma)
                → Infrastructure (Postgres, Storage, Better Auth, Outstand via ACL)
```

---

## Aturan operasional

1. Entry points **tidak** berisi business logic — hanya memanggil Application Service.
2. Integrasi sosial **hanya** lewat Anti-Corruption Layer (OutstandAdapter) — bukan SDK network langsung.
3. Supabase JS client di arsitektur: **Realtime + Storage** saja; CRUD lewat Prisma (detail engineering di `ctx-technical-context.md`).
4. RBAC dievaluasi di Application Service; RLS = defense-in-depth.
5. Cross-domain lewat public API — lihat `application-layer.md` + `ctx-domain.md`.
6. Jangan ubah Architecture Baseline tanpa ADR baru.

---

## Mapping task → dokumen

| Task                         | Baca                                                                       |
| ---------------------------- | -------------------------------------------------------------------------- |
| Fitur / use-case             | BC di `domain-model` + service di `application-layer` + UX di `ctx-design` |
| Schema / migrasi             | `database-strategy` (+ engineering ORM di `ctx-technical-context`)         |
| Auth / session               | `auth-architecture` (+ `auth-strategy` di technical)                       |
| Outstand / webhook / publish | `integration-layer`                                                        |
| Jobs / cron                  | `background-jobs`                                                          |
| Notifikasi realtime          | `realtime-strategy`                                                        |

---

## Related context

- BC & shared types → `ctx-domain.md`
- Stack / env / Prisma config → `ctx-technical-context.md`
- Pola kode di repo → `ctx-implementation.md`
