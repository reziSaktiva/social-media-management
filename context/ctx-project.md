# Context — Project

Indeks operasional untuk **cara kerja project** (Project OS). Bukan salinan `project-manager/`.

---

## Baca dulu

| Dokumen                                                                            | Kapan                                                                                                                           |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`../project-manager/PROJECT_STATE.md`](../project-manager/PROJECT_STATE.md)       | Setiap sesi — phase, mode, Known Issues, blockers                                                                               |
| [`../project-manager/TASKS.md`](../project-manager/TASKS.md)                       | Sebelum mengerjakan task — indeks backlog per release; detail di `tasks/vXX-*.md` (buka **hanya** file release yang dikerjakan) |
| [`../project-manager/PROJECT_RULES.md`](../project-manager/PROJECT_RULES.md)       | Governance, klasifikasi dokumen, AI collaboration                                                                               |
| [`../project-manager/DECISIONS.md`](../project-manager/DECISIONS.md)               | Sebelum mengubah keputusan material                                                                                             |
| [`../project-manager/PROJECT_OVERVIEW.md`](../project-manager/PROJECT_OVERVIEW.md) | Orientasi singkat produk + preferensi kerja                                                                                     |
| [`../AGENTS.md`](../AGENTS.md)                                                     | Pintu masuk agent + hard rules                                                                                                  |

Skill wajib: [`.agents/skills/project-os-navigator/SKILL.md`](../.agents/skills/project-os-navigator/SKILL.md).

---

## Aturan operasional

1. Status, progress (%), milestone aktif → **hanya** di `PROJECT_STATE.md`. **Pengecualian (ADR-062):** status per-task/subtask di `TASKS.md` + `tasks/vXX-*.md`.
2. Keputusan material (scope, arsitektur, stack, BC) → ADR di `DECISIONS.md` sebelum mengubah baseline.
3. Insight diskusi penting → `CONVERSATIONS.md`; ide spekulatif → `BRAINSTORM.md`.
4. Setelah pekerjaan selesai → update status task di `tasks/vXX-*.md` **dan** hitungan di `TASKS.md` (dua-duanya bersamaan), lalu `PROJECT_STATE.md` bila phase/milestone/Known Issues berubah, lalu entri baru di `COMPLETE_TASK.md`. Jangan menyalin detail task ke `PROJECT_STATE.md`.
5. Bahasa dokumentasi & komunikasi project: **Bahasa Indonesia** (kecuali diminta lain).
6. Jangan commit/push kecuali user meminta eksplisit. Jangan commit secret (`.env.local`, kredensial).
7. Untuk implementasi Outstand M8, ADR-040 mengamendemen kontrak lama. Baca
   `DECISIONS.md` + `ctx-architecture.md`; jangan menyimpulkan handler/job
   runtime sudah ada hanya karena alignment dokumentasi dan schema selesai.

---

## Living vs static

| Tipe             | File                                                                                   | Boleh memuat status/progress?                                 |
| ---------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Living           | `PROJECT_STATE.md`, `TASKS.md` + `tasks/vXX-*.md` (ADR-062)                            | Ya (STATE: phase/milestone/%; TASKS: status per-task/subtask) |
| Append-Only      | `DECISIONS.md` + `decisions/`, `COMPLETE_TASK.md`, `CONVERSATIONS.md`, `BRAINSTORM.md` | Hanya entri baru ditambahkan, entri lama tidak diedit         |
| Static reference | README, overview, baseline `product-discovery/`, `SKILL.md`                            | Tidak — jangan taruh ✅/⏳/%/phase aktif                      |

---

## Orientasi arsitektur ringkas

Blueprint high-level (bukan detail BC): [`../project-manager/ARCHITECTURE_OVERVIEW.md`](../project-manager/ARCHITECTURE_OVERVIEW.md).

Detail sistem → `ctx-architecture.md`. Stack/infra → `ctx-technical-context.md`.

---

## Related context

- Produk / persona / MVP → `ctx-business.md`
- Domain DDD → `ctx-domain.md`
