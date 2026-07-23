# Context — Design (+ UX)

Indeks **desain operasional** (`design/`) dan **pointer ke UX Planning** (`04-ux/`).  
Opsi A: UX digabung di file ini (bukan `ctx-ux.md` terpisah).  
Product/roles/persona → `ctx-business.md`.

---

## Baca dulu

### Design (handoff & visual)

| Dokumen                                                            | Kapan                                    |
| ------------------------------------------------------------------ | ---------------------------------------- |
| [`../design/README.md`](../design/README.md)                       | Orientasi folder design                  |
| [`../design/DESIGN_OVERVIEW.md`](../design/DESIGN_OVERVIEW.md)     | Product UX Map + Design System Blueprint |
| [`../design/DESIGN_BRIEF.md`](../design/DESIGN_BRIEF.md)           | Brief lengkap                            |
| [`../design/DESIGN_ONEPAGER.html`](../design/DESIGN_ONEPAGER.html) | Ringkas untuk handoff                    |

### UX Planning Baseline — `04-ux/`

| Dokumen                                                                                 | Topik                             |
| --------------------------------------------------------------------------------------- | --------------------------------- |
| [`../product-discovery/04-ux/README.md`](../product-discovery/04-ux/README.md)          | Indeks UX Baseline v1.0 (ADR-013) |
| [`information-architecture.md`](../product-discovery/04-ux/information-architecture.md) | IA / struktur informasi           |
| [`user-flows.md`](../product-discovery/04-ux/user-flows.md)                             | Alur solusi                       |
| [`navigation-patterns.md`](../product-discovery/04-ux/navigation-patterns.md)           | Navigasi                          |
| [`key-screen-patterns.md`](../product-discovery/04-ux/key-screen-patterns.md)           | Pola layar kritis                 |
| [`ux-principles.md`](../product-discovery/04-ux/ux-principles.md)                       | Prinsip UX                        |

---

## Aturan operasional

1. `design/` **tidak** menggantikan `product-discovery/04-ux/` — UX detail tetap di baseline.
2. `design/` **bukan** SoT design tokens — setelah feature selesai, designer
   masuk, dan design di-approve, nilai final wajib masuk
   `../product-discovery/06-engineering/design-tokens.md` (ADR-038, ADR-041).
3. Perubahan di `design/` untuk handoff visual **tidak wajib** masuk CHANGELOG development (lihat aturan project); perubahan UX Baseline atau lock token material tetap lewat proses dokumen + ADR.
4. Wireframe detail di fase M8: **terbatas** — hanya jika dibutuhkan untuk implementasi layar (lihat `PROJECT_STATE` Active Conversation Mode).
5. Status konten & roles visual harus selaras `roles-permissions.md` (lihat `ctx-business.md`).
6. Persona di UI copy / contoh: Raka, Maya, Sinta, Dimas, Lara.
7. Jangan mengarang IA, flow, atau pola navigasi baru yang bertentangan dengan `04-ux/` tanpa ADR / update baseline.
8. Implementasi layar M8 **tidak menunggu** token final: gunakan neutral theme
   Astryx dan jangan mengarang custom brand hex.
9. Astryx adalah fondasi komponen permanen. Tailwind hanya untuk layout dan
   responsive composition; wrapper di `components/ui/` dibuat selektif.

---

## Mapping task UI → baca

| Task                                     | Baca                                                   |
| ---------------------------------------- | ------------------------------------------------------ |
| Susun halaman / route sesuai menu        | `information-architecture.md`                          |
| Alur publish / approve / connect account | `user-flows.md`                                        |
| Sidebar, navigasi, workspace switch      | `navigation-patterns.md`                               |
| Pola layar editor, inbox, analytics      | `key-screen-patterns.md`                               |
| Content Format (Post/Reel/Story/Pin)     | `key-screen-patterns.md` (KSP-05-F11) + ADR-039        |
| Brief / handoff designer                 | `design/DESIGN_OVERVIEW.md` + brief                    |
| Font, warna, neutral, status (SoT)       | `../product-discovery/06-engineering/design-tokens.md` |
| Komponen UI / styling                    | `monorepo-setup.md` + ADR-041                          |

Implementasi React mengikuti `ctx-implementation.md`. Gunakan Astryx neutral
theme selama M8; komponen sederhana boleh diimpor langsung dan komponen
kritis/luas memakai wrapper selektif. Setelah designer masuk, token yang sudah
di-lock dipetakan ke Astryx theme + Tailwind token bridge.

---

## Related context

- Roles, MVP, persona → `ctx-business.md`
- Pola kode UI entry → `ctx-implementation.md`
- Stack / mirror token ke kode → `ctx-technical-context.md`
- Project mode (wireframe boleh/tidak) → `ctx-project.md` + `PROJECT_STATE.md`
