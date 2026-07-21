# Design

Folder ini adalah **ruang kerja dokumentasi untuk tim designer** pada produk **Social Media Management**.

Isinya merangkum keputusan produk & UX yang sudah ditetapkan, lalu menerjemahkannya menjadi panduan yang siap dipakai di Figma — tanpa menggantikan Source of Truth di `product-discovery/`.

---

# Purpose

* Memberi onboarding cepat bagi designer yang baru masuk project.
* Menjadi jembatan antara UX Planning Baseline dan pekerjaan visual di Figma.
* Menjaga konsistensi: apa yang sudah diputuskan vs apa yang masih terbuka untuk eksplorasi visual.

---

# Audience

| Peran | Cara memakai folder ini |
| ----- | ----------------------- |
| Product Designer / UX Designer | Mulai dari PDF brief, atau `DESIGN_OVERVIEW.md` Bagian A |
| UI Designer / Design System | Mulai dari PDF brief, atau `DESIGN_OVERVIEW.md` Bagian B |
| Engineering (referensi) | Cek apakah wireframe/UI selaras dengan IA dan Key Screen Patterns |
| Handoff eksternal | One-pager untuk ringkas; Brief PDF untuk detail lengkap |

---

# Scope

**Termasuk:**

* Ringkasan persona, prinsip UX, navigasi, layar kritis.
* Blueprint fondasi design system untuk Figma (token, komponen, status visual).
* Daftar keputusan visual yang masih terbuka.

**Tidak termasuk (tetap di tempat asalnya):**

* Detail UX Planning lengkap → `../product-discovery/04-ux/`
* Role & permission matrix lengkap → `../product-discovery/02-product/roles-permissions.md`
* High-level system architecture → `../project-manager/ARCHITECTURE_OVERVIEW.md`
* Implementasi kode / komponen React

---

# Documents

| File | Deskripsi |
| ---- | --------- |
| `Design-One-Pager-Social-Media-Management.pdf` | **Ringkasan 1 halaman** — kickoff cepat / lampiran email |
| `Design-Brief-Social-Media-Management.pdf` | **Paket handoff lengkap** — detail UX map + design system |
| `DESIGN_ONEPAGER.html` | Sumber HTML one-pager (regenerate via Chrome print-to-PDF) |
| `DESIGN_BRIEF.md` | Sumber Markdown untuk Brief PDF |
| `DESIGN_OVERVIEW.md` | Dokumen operasional di repo: Product UX Map + Design System Blueprint |
| `_build-brief-pdf.mjs` | Script regenerate Brief PDF (butuh `marked` + Google Chrome) |

> Perubahan di folder ini tidak dicatat di `project-manager/CHANGELOG.md` atau `PROJECT_STATE.md`.

## Regenerate PDF

```bash
cd design
npm install marked
node _build-brief-pdf.mjs
```

---

# Source of Truth

| Topik | Dokumen kanonikal |
| ----- | ----------------- |
| UX Principles, IA, Flows, Nav, Screens | `../product-discovery/04-ux/` (Baseline v1.0, ADR-013) |
| Personas & insights | `../product-discovery/03-user/` (Baseline v1.0, ADR-009) |
| Roles, content status | `../product-discovery/02-product/roles-permissions.md` |
| **Design tokens** (font, warna, neutral, status — setelah design approve) | `../product-discovery/06-engineering/design-tokens.md` (ADR-038) |
| Status project | `../project-manager/PROJECT_STATE.md` |

Folder ini (`design/`) adalah **handoff operasional**, bukan SoT token atau UX. Setelah design di-approve, PM mengisi nilai final ke `design-tokens.md` (lihat panduan PM di dokumen tersebut).

Jika desain Figma bertentangan dengan baseline UX / token yang sudah di-lock, **baseline + ADR yang menang** — kecuali perubahan disepakati lewat ADR.

---

# Related Documents

* `DESIGN_OVERVIEW.md`
* `../project-manager/ARCHITECTURE_OVERVIEW.md`
* `../project-manager/PROJECT_OVERVIEW.md`
* `../product-discovery/04-ux/README.md`
