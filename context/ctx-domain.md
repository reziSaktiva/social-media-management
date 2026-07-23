# Context — Domain

Indeks **Bounded Context, shared types, dan domain boundary rules**.  
Sumber utama: Architecture Baseline — domain model.

---

## Baca dulu

| Dokumen                                                                                                        | Kapan                                         |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [`../product-discovery/05-architecture/domain-model.md`](../product-discovery/05-architecture/domain-model.md) | Wajib sebelum kerja di domain / shared types  |
| [`../product-discovery/05-architecture/README.md`](../product-discovery/05-architecture/README.md)             | Indeks Architecture Baseline v1.0 (ADR-025)   |
| [`../packages/shared/`](../packages/shared/)                                                                   | Implementasi ID, enum, value object lintas BC |

---

## Bounded Context (ingat cepat)

| ID    | Context      | MVP      |
| ----- | ------------ | -------- |
| BC-01 | Identity     | Ya       |
| BC-02 | Workspace    | Ya       |
| BC-03 | Publishing   | Ya       |
| BC-04 | AI Assistant | Ya       |
| BC-05 | Engagement   | Ya       |
| BC-06 | Analytics    | Ya       |
| BC-07 | Start Page   | Ya       |
| BC-08 | Media        | Ya       |
| BC-09 | Notification | Ya       |
| BC-10 | Billing      | Post-MVP |

Modul kode: `apps/web/src/domains/<nama-domain>/` (lihat `ctx-implementation.md`).

---

## Aturan operasional (domain)

1. Shared types (ID branded, enum, VO) **hanya** di `packages/shared` — tanpa business logic.
2. Cross-domain: lewat **public API** module domain lain (`index.ts`) — jangan import implementasi lintas folder.
3. Hanya pass **ID** antar domain bila memungkinkan; jangan share aggregate penuh lintas BC.
4. Domain logic **tidak** mengimpor Prisma, Supabase client, atau HTTP client Outstand.
5. Penamaan entity/tabel mengikuti `domain-model.md` + amandemen ADR (mis. ADR-027 untuk pengecualian naming tabel).
6. Jangan menambah BC baru atau mengubah boundary tanpa ADR.
7. Publishing format: enum `ContentFormat` di `packages/shared`; nilai hidup di `PostTarget` (+ `platformOptions` JSON). Matriks platform & default bisnis → `domain-model.md` / **ADR-039**. Override Outstand hanya di ACL.
8. Engagement MVP (**ADR-040**) hanya komentar dan reply. Direct Message,
   mention, serta webhook engagement bukan kontrak domain MVP; data baru berasal
   dari sync internal 30 menit atau manual refresh.
9. Nama event Outstand bukan enum/status domain. ACL memetakan
   `post.published`, `post.error`, dan `account.token_expired` ke bahasa domain.

Boundary rules lengkap (BR-01 dst.) → `domain-model.md`.

---

## Related context

- Layer & komunikasi service → `ctx-architecture.md`
- Pola folder & kode → `ctx-implementation.md`
- Produk / roles → `ctx-business.md`
