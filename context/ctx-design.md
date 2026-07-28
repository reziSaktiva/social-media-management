# Context — Design (+ UX)

Pointer ke **Claude Design** (tool eksternal, live) dan ke **UX Planning
Baseline** (`04-ux/`). Product/roles/persona → `ctx-business.md`.

**Catatan (ADR-045):** folder `design/` (paket handoff untuk tim designer)
sudah **dihapus** dari repo — belum ada designer aktif yang memakainya, jadi
paket tersebut menganggur tanpa nilai. Pointer project Claude Design yang
sebelumnya ada di `design/README.md` dipindah ke bagian "Claude Design" di
bawah. Saat designer benar-benar join, susun ulang paket handoff dari
`04-ux/` + `design-tokens.md` (bukan dari histori file yang sudah dihapus).

---

## Baca dulu

### UX Planning Baseline — `04-ux/` (SoT alur & struktur layar)

| Dokumen                                                                                 | Topik                             |
| --------------------------------------------------------------------------------------- | --------------------------------- |
| [`../product-discovery/04-ux/README.md`](../product-discovery/04-ux/README.md)          | Indeks UX Baseline v1.0 (ADR-013) |
| [`information-architecture.md`](../product-discovery/04-ux/information-architecture.md) | IA / struktur informasi           |
| [`user-flows.md`](../product-discovery/04-ux/user-flows.md)                             | Alur solusi                       |
| [`navigation-patterns.md`](../product-discovery/04-ux/navigation-patterns.md)           | Navigasi                          |
| [`key-screen-patterns.md`](../product-discovery/04-ux/key-screen-patterns.md)           | Pola layar kritis                 |
| [`ux-principles.md`](../product-discovery/04-ux/ux-principles.md)                       | Prinsip UX                        |

### Claude Design (tool eksternal, referensi visual)

| Field       | Value                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project     | `Social Media Management`                                                                                                                                              |
| Project ID  | `84aded99-bb23-49b1-be9f-dd8f21c6873e`                                                                                                                                 |
| Akses       | claude.ai/design (login akun yang sama dengan Claude Code)                                                                                                             |
| Sync        | Tool `DesignSync` bawaan Claude Code (native, bukan MCP) — manual/on-request, bukan otomatis (ADR-042)                                                                 |
| Isi project | Foundations (color/type/layout), Components (buttons, status-chips, forms, cards, navigation, table, dialog), Templates 8 layar KSP-01–08 + 5 layar Auth Flow suplemen |

Project lama bernama **"Modernist"** di akun yang sama **bukan** milik product ini — jangan dipakai sebagai referensi.

---

## Aturan operasional

1. `04-ux/` tetap **SoT** untuk alur, IA, dan fungsi layar — Claude Design hanya representasi visual yang diturunkan darinya, bukan pengganti.
2. `design-tokens.md` (`../product-discovery/06-engineering/design-tokens.md`) tetap **SoT design tokens** (ADR-038, ADR-041) — bukan project Claude Design, bukan screenshot.
3. Implementasi layar M8 **tidak menunggu** token final: gunakan neutral theme Astryx dan jangan mengarang custom brand hex.
4. Astryx adalah fondasi komponen permanen. Tailwind hanya untuk layout dan responsive composition; wrapper di `components/ui/` dibuat selektif.
5. Wireframe detail di fase M8: **terbatas** — hanya jika dibutuhkan untuk implementasi layar (lihat `PROJECT_STATE` Active Conversation Mode).
6. Status konten & roles visual harus selaras `roles-permissions.md` (lihat `ctx-business.md`).
7. Persona di UI copy / contoh: Raka, Maya, Sinta, Dimas, Lara.
8. Jangan mengarang IA, flow, atau pola navigasi baru yang bertentangan dengan `04-ux/` tanpa ADR / update baseline.
9. Sinkronisasi antara baseline (`04-ux/`, `design-tokens.md`) dan project Claude Design bersifat **manual/on-request** — dijalankan saat diminta eksplisit, bukan checklist wajib di setiap sesi kerja UI (beda dengan workflow Astryx CLI di `AGENTS.md` yang wajib tiap task). Push saat UX baseline berubah berarti; review sebelum menerima perubahan dari sisi Claude Design (baseline + ADR tetap menang, lihat butir 1).

---

## Mapping task UI → baca

| Task                                     | Baca                                                   |
| ---------------------------------------- | ------------------------------------------------------ |
| Susun halaman / route sesuai menu        | `information-architecture.md`                          |
| Alur publish / approve / connect account | `user-flows.md`                                        |
| Sidebar, navigasi, workspace switch      | `navigation-patterns.md`                               |
| Pola layar editor, inbox, analytics      | `key-screen-patterns.md`                               |
| Content Format (Post/Reel/Story/Pin)     | `key-screen-patterns.md` (KSP-05-F11) + ADR-039        |
| Font, warna, neutral, status (SoT)       | `../product-discovery/06-engineering/design-tokens.md` |
| Komponen UI / styling                    | `monorepo-setup.md` + ADR-041 + Astryx CLI lokal       |

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
- Keputusan penghapusan `design/` → `../project-manager/DECISIONS.md` (ADR-045)
