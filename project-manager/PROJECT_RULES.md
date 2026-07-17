# PROJECT RULES

## Metadata

| Field        | Value      |
| ------------ | ---------- |
| Version      | 0.2.0      |
| Status       | Active     |
| Last Updated | 2026-07-14 |

---

# Purpose

Dokumen ini berisi aturan, prinsip, dan standar yang harus diikuti selama proses perencanaan dan pengembangan project.

Seluruh anggota project (Developer, AI Assistant, Designer, dan kontributor lainnya) harus mengacu pada dokumen ini sebelum melakukan perubahan pada project, baik pada dokumentasi maupun implementasi kode.

---

# Scope

Dokumen ini mengatur:

* Prinsip dasar pengembangan project.
* Klasifikasi dan tata kelola dokumen.
* Aturan development dan arsitektur.
* Aturan kolaborasi dengan AI Assistant.
* Aturan pencatatan keputusan.
* Alur kerja (workflow) project secara keseluruhan.

Dokumen ini **tidak** mengatur:

* Status, progress, atau fase aktif project — lihat `PROJECT_STATE.md`.
* Detail keputusan teknis atau bisnis — lihat `DECISIONS.md`.
* Detail scope tiap fase discovery — lihat `README.md` pada masing-masing folder `../product-discovery/`.

---

# Core Principles

Project ini dikembangkan berdasarkan prinsip berikut:

* Documentation First
* Business First
* User-Centered Design
* Domain-Driven Design (DDD)
* Modular Monolith Architecture
* AI Friendly Development
* Simplicity over Premature Optimization
* Maintainability over Complexity
* Scalability by Design

---

# Documentation Governance

## Documentation Rules

* Semua keputusan penting harus didokumentasikan.
* Dokumentasi selalu menjadi acuan utama sebelum implementasi.
* Dokumentasi harus diperbarui jika terdapat perubahan pada requirement, arsitektur, atau workflow.
* Hindari dokumentasi yang duplikat atau saling bertentangan.

## Document Type Classification

Setiap dokumen dalam project memiliki tipe yang menentukan kapan dan bagaimana dokumen tersebut boleh diubah.

**Static Reference**

Dokumen yang mendeskripsikan struktur, tujuan, scope, dan aturan. Tidak boleh berisi informasi yang berubah-ubah (status, progress, fase aktif).

Hanya boleh diubah jika terjadi perubahan **struktural** — scope baru, dokumen baru, atau aturan baru — dan perubahan tersebut wajib dicatat di `CHANGELOG.md`.

Termasuk:

* Semua `README.md`
* `PROJECT_OVERVIEW.md`
* `ARCHITECTURE_OVERVIEW.md`
* `PROJECT_RULES.md`
* Skill/navigator file (`SKILL.md`)
* Dokumen baseline yang sudah ditetapkan pada setiap fase `product-discovery/`

**Living Document**

Dokumen yang secara aktif diperbarui setiap sesi. Merupakan satu-satunya tempat yang boleh mencatat status, progress, dan fase aktif project.

Termasuk:

* `PROJECT_STATE.md` — satu-satunya source of truth untuk status dan progress.

**Append-Only**

Dokumen yang hanya bertambah. Entri lama tidak boleh diedit atau dihapus.

Termasuk:

* `DECISIONS.md` — setiap ADR baru ditambahkan sebagai entri baru.
* `CHANGELOG.md` — setiap perubahan dicatat sebagai entri baru.
* `CONVERSATIONS.md` — setiap sesi dicatat sebagai entri baru.
* `BRAINSTORM.md` — setiap ide baru dicatat sebagai entri baru.

## Formatting Rules

* README **tidak boleh** memuat status (✅ ⏳ 🟡), progress (%), atau fase aktif.
* Status folder, milestone, dan fase hanya boleh ditampilkan pada `PROJECT_STATE.md`.
* Setiap perubahan struktural pada dokumen Static Reference wajib dicatat pada `CHANGELOG.md`.

---

# Development Rules

* Implementasi harus mengikuti dokumentasi yang telah disepakati.
* Jangan mengubah requirement tanpa pembaruan dokumentasi terkait.
* Setiap fitur dikembangkan berdasarkan milestone yang sedang aktif.
* Hindari implementasi fitur di luar ruang lingkup milestone.

---

# Architecture Rules

* Menggunakan Hybrid Monorepo.
* Menggunakan satu aplikasi utama (`apps/web`) pada fase awal.
* Menggunakan arsitektur Modular Monolith.
* Menggunakan Domain-Driven Design sebagai dasar pembagian domain.
* Setiap domain harus memiliki batas tanggung jawab (boundary) yang jelas.
* Shared package hanya digunakan untuk kebutuhan lintas domain atau lintas aplikasi.

---

# AI Collaboration Rules

* AI harus membaca dokumentasi sebelum melakukan implementasi.
* AI tidak boleh mengubah arsitektur tanpa keputusan baru yang terdokumentasi.
* AI tidak boleh mengubah business rules tanpa persetujuan dan pembaruan dokumentasi.
* AI harus menjaga konsistensi struktur project.
* AI harus mematuhi klasifikasi dokumen pada bagian **Documentation Governance** saat membuat perubahan.

---

# Decision Rules

Perubahan berikut harus dicatat pada `DECISIONS.md`:

* Perubahan arsitektur
* Perubahan workflow
* Perubahan repository strategy
* Perubahan business requirement
* Penambahan domain atau fase baru
* Perubahan teknologi utama
* Keputusan penting lainnya yang memengaruhi arah project

---

# Project Workflow

```text
Idea
    ↓
Discovery
    ↓
Business
    ↓
Product
    ↓
User
    ↓
UX
    ↓
Architecture
    ↓
Engineering
    ↓
Repository & Bootstrap
    ↓
Implementation
    ↓
Testing
    ↓
Release
```

Status dan progress tiap tahap workflow ini mengacu pada milestone yang tercatat di `PROJECT_STATE.md`.

---

# Definition of Done

Sebuah milestone dianggap selesai apabila:

* Tujuan milestone telah tercapai.
* Dokumentasi telah diperbarui.
* Keputusan penting telah dicatat pada `DECISIONS.md`.
* Tidak terdapat blocker yang belum diselesaikan.
* `PROJECT_STATE.md` telah diperbarui.

---

# Related Documents

* `README.md`
* `PROJECT_OVERVIEW.md`
* `ARCHITECTURE_OVERVIEW.md`
* `PROJECT_STATE.md`
* `DECISIONS.md`
* `CHANGELOG.md`
* `../product-discovery/README.md`
