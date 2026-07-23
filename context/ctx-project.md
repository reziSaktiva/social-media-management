# Context — Project

Indeks operasional untuk **cara kerja project** (Project OS). Bukan salinan `project-manager/`.

---

## Baca dulu

| Dokumen                                                                            | Kapan                                             |
| ---------------------------------------------------------------------------------- | ------------------------------------------------- |
| [`../project-manager/PROJECT_STATE.md`](../project-manager/PROJECT_STATE.md)       | Setiap sesi — phase, mode, next tasks, blockers   |
| [`../project-manager/PROJECT_RULES.md`](../project-manager/PROJECT_RULES.md)       | Governance, klasifikasi dokumen, AI collaboration |
| [`../project-manager/DECISIONS.md`](../project-manager/DECISIONS.md)               | Sebelum mengubah keputusan material               |
| [`../project-manager/PROJECT_OVERVIEW.md`](../project-manager/PROJECT_OVERVIEW.md) | Orientasi singkat produk + preferensi kerja       |
| [`../AGENTS.md`](../AGENTS.md)                                                     | Pintu masuk agent + hard rules                    |

Skill wajib: [`.agents/skills/project-os-navigator/SKILL.md`](../.agents/skills/project-os-navigator/SKILL.md).

---

## Aturan operasional

1. Status, progress (%), milestone aktif → **hanya** di `PROJECT_STATE.md`.
2. Keputusan material (scope, arsitektur, stack, BC) → ADR di `DECISIONS.md` sebelum mengubah baseline.
3. Insight diskusi penting → `CONVERSATIONS.md`; ide spekulatif → `BRAINSTORM.md`.
4. Setelah pekerjaan selesai → update `PROJECT_STATE.md` + `CHANGELOG.md` bila progress berubah.
5. Bahasa dokumentasi & komunikasi project: **Bahasa Indonesia** (kecuali diminta lain).
6. Jangan commit/push kecuali user meminta eksplisit. Jangan commit secret (`.env.local`, kredensial).
7. Untuk implementasi Outstand M8, ADR-040 mengamendemen kontrak lama. Baca
   `DECISIONS.md` + `ctx-architecture.md`; jangan menyimpulkan handler/job
   runtime sudah ada hanya karena alignment dokumentasi dan schema selesai.

---

## Living vs static

| Tipe             | File                                                   | Boleh memuat status/progress?            |
| ---------------- | ------------------------------------------------------ | ---------------------------------------- |
| Living           | `PROJECT_STATE.md`, `CHANGELOG.md`, `CONVERSATIONS.md` | Ya (khusus STATE untuk phase/%)          |
| Static reference | README, overview, baseline `product-discovery/`        | Tidak — jangan taruh ✅/⏳/%/phase aktif |

---

## Orientasi arsitektur ringkas

Blueprint high-level (bukan detail BC): [`../project-manager/ARCHITECTURE_OVERVIEW.md`](../project-manager/ARCHITECTURE_OVERVIEW.md).

Detail sistem → `ctx-architecture.md`. Stack/infra → `ctx-technical-context.md`.

---

## Related context

- Produk / persona / MVP → `ctx-business.md`
- Domain DDD → `ctx-domain.md`
