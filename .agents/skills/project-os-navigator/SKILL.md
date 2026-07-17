---
name: project-os-navigator
description: Project OS navigator untuk Social Media Management project. Memandu AI dalam memahami cara kerja, aturan dokumentasi, dan behavior yang tepat untuk setiap jenis interaksi — diskusi, planning change, pekerjaan baru, dan bug. Gunakan skill ini di awal setiap sesi kerja pada project ini, atau ketika context project dibutuhkan.
---

# Project OS Navigator — Social Media Management

Skill ini mendefinisikan cara AI berperilaku saat bekerja pada project Social Media Management. Ikuti panduan ini untuk setiap jenis interaksi.

## Langkah Pertama: Load Context

Sebelum merespons apapun, baca file-file berikut secara berurutan:

1. `project-manager/PROJECT_STATE.md` — phase, milestone, dan progress saat ini
2. `project-manager/PROJECT_RULES.md` — aturan dan prinsip project
3. `project-manager/DECISIONS.md` — keputusan yang telah disepakati
4. `project-manager/PROJECT_OVERVIEW.md` — gambaran project

Jika diskusi menyentuh domain spesifik, baca juga dokumen relevan dari:
- `product-discovery/01-business/` — Business Baseline v1.0
- `product-discovery/02-product/` — Product Baseline v1.0
- `product-discovery/03-user/` — User Discovery Baseline v1.0
- `product-discovery/04-ux/` — UX Planning Baseline v1.0
- `product-discovery/05-architecture/` — System Architecture Baseline v1.0
- `product-discovery/06-engineering/` — Engineering Planning Baseline v1.0

`product-discovery/` adalah **Source of Truth produk** dan berada sejajar (sibling) dengan `project-manager/`, bukan di dalamnya.

### Proactive Consistency Check

Setiap kali membaca dokumen bertipe **Static Reference** (README, `PROJECT_OVERVIEW.md`, `PROJECT_RULES.md`, `SKILL.md`, atau dokumen baseline), periksa apakah dokumen tersebut memuat informasi yang seharusnya hanya ada di **Living Document** (`PROJECT_STATE.md`) — seperti status (✅ 🟡 ⏳), progress (%), atau phase/milestone aktif.

Jika ditemukan, **jangan diamkan atau perbaiki secara diam-diam**. Sebutkan secara eksplisit ke user sebagai inkonsistensi sebelum melanjutkan pekerjaan, lalu tawarkan untuk memperbaikinya (lihat behavior **Bug / Inkonsistensi Dokumen**).

Lihat `project-manager/PROJECT_RULES.md` bagian **Document Type Classification** untuk aturan lengkapnya.

---

## Behavior per Jenis Interaksi

### 1. Diskusi / Tanya Jawab

**Trigger:** User bertanya, mendiskusikan ide, atau meminta pendapat.

**Steps:**
1. Pastikan jawaban selaras dengan baseline yang sudah ada (Business, Product, User).
2. Jika ada potensi konflik dengan keputusan sebelumnya, sebutkan ADR yang relevan.
3. Jangan menyarankan solusi yang keluar dari scope phase aktif (lihat `Active Conversation Mode` di PROJECT_STATE.md).
4. Jika diskusi menghasilkan insight penting, catat di `project-manager/CONVERSATIONS.md`.

**Format CONVERSATIONS.md entry:**
```
## [YYYY-MM-DD] — [Topik Singkat]
**Phase:** [phase aktif]
**Summary:** [ringkasan diskusi dalam 2-3 kalimat]
**Key Decision/Insight:** [jika ada]
**Impact:** [apakah ada dokumen yang perlu diupdate?]
```

---

### 2. Brainstorming

**Trigger:** User ingin explore ide, kemungkinan, atau alternatif baru.

**Steps:**
1. Ikuti mode brainstorm secara bebas — jangan terlalu terikat baseline di fase ini.
2. Tandai jelas mana yang "spekulatif" vs "selaras dengan baseline".
3. Setelah brainstorm selesai, evaluasi hasilnya terhadap baseline yang ada.
4. Jika ada ide yang layak dipertimbangkan, catat di `project-manager/BRAINSTORM.md`.

**Format BRAINSTORM.md entry:**
```
## [YYYY-MM-DD] — [Topik Brainstorm]
**Phase:** [phase aktif]
**Context:** [mengapa topik ini didiskusikan]
**Ideas:**
- [ide 1]
- [ide 2]
**Evaluation:** [selaras / bertentangan / perlu ADR / perlu validasi lebih lanjut]
**Next Action:** [discard / simpan untuk fase X / buat ADR / validasi dulu]
```

---

### 3. Pekerjaan Baru / Pembuatan Dokumen

**Trigger:** User meminta membuat dokumen baru, mengerjakan task, atau melanjutkan progress.

**Steps:**
1. Cek `PROJECT_STATE.md` — pastikan task ini sesuai phase aktif.
2. Cek `Active Conversation Mode` — pastikan action type diizinkan.
3. Baca dokumen baseline yang relevan sebelum membuat dokumen baru.
4. Ikuti format dokumen yang konsisten dengan dokumen existing (lihat contoh di folder yang sama).
5. Setelah selesai, update:
   - `project-manager/PROJECT_STATE.md` — progress dan next tasks
   - `project-manager/CHANGELOG.md` — catat apa yang berubah/ditambahkan

**Format CHANGELOG.md entry:**
```
## [YYYY-MM-DD]
### Added
- [dokumen/fitur baru]
### Changed
- [perubahan pada dokumen existing]
### Fixed
- [perbaikan]
```

---

### 4. Planning Change / Perubahan Keputusan

**Trigger:** User ingin mengubah arah, scope, keputusan, atau baseline.

**Steps:**
1. Identifikasi apa yang berubah dan dampaknya terhadap dokumen yang sudah ada.
2. Evaluasi apakah perubahan ini memerlukan ADR baru di `DECISIONS.md`.

**Perubahan yang WAJIB masuk DECISIONS.md:**
- Target market / user segment
- Problem statement
- Product vision / scope
- MVP definition
- Arsitektur sistem
- Tech stack
- Repository strategy
- Domain / bounded context

3. Buat ADR dengan format:

```
## Decision ADR-[NNN]

### Title
[nama keputusan]

### Status
Accepted

### Date
[YYYY-MM-DD]

### Decision
[apa yang diputuskan]

### Reason
- [alasan 1]
- [alasan 2]

### Alternatives Considered
- [alternatif yang tidak dipilih]
```

4. Update dokumen yang terdampak.
5. Update `PROJECT_STATE.md` — section Recent Decisions.
6. Update `CHANGELOG.md`.

---

### 5. Bug / Inkonsistensi Dokumen

**Trigger:** Ditemukan konflik, inkonsistensi, atau kesalahan antar dokumen.

**Steps:**
1. Identifikasi dokumen mana yang terlibat dan apa yang bertentangan.
2. Tentukan dokumen mana yang menjadi **Source of Truth** (biasanya baseline yang lebih awal atau yang sudah di-ADR).
3. Perbaiki dokumen yang bertentangan agar selaras dengan Source of Truth.
4. Catat perbaikan di `CHANGELOG.md` dengan section `### Fixed`.
5. Jika bug mengindikasikan keputusan yang belum terdokumentasi, buat ADR.

---

## Aturan Context (Jangan Dilanggar)

- Jangan menyarankan implementasi kode jika `PROJECT_STATE.md` belum di phase Development.
- Jangan mengubah baseline (Business, Product, User) tanpa ADR baru.
- Jangan membuat dokumen di luar scope phase aktif.
- Selalu gunakan nama persona yang sudah ditetapkan: Raka, Maya, Sinta, Dimas, Lara.
- Selalu gunakan ID yang sudah ada (ADR-XXX, I-XX, A-XX, dll.) saat mereferensikan keputusan.
- Jika ada gap antara dokumen dengan realita phase, tanyakan ke user sebelum asumsi.
- Jangan memperbaiki inkonsistensi dokumen secara diam-diam — selalu sebutkan temuannya ke user (lihat **Proactive Consistency Check**).
- Ikuti preferensi kerja yang tercatat di `project-manager/PROJECT_OVERVIEW.md` bagian **Developer Profile & Working Preferences**, dan tambahkan preferensi baru yang ditemukan ke sana.

---

## File Map (Source of Truth)

`project-manager/` dan `product-discovery/` adalah folder top-level yang sejajar (sibling), masing-masing dengan tanggung jawab berbeda:

```
social-media-management/
├── project-manager/         → Cara kerja: proses, aturan, keputusan, status
│   ├── README.md            → Penjelasan project OS
│   ├── PROJECT_OVERVIEW.md  → Apa yang dibangun
│   ├── ARCHITECTURE_OVERVIEW.md → High-level architecture (blueprint Figma)
│   ├── PROJECT_RULES.md     → Cara bekerja
│   ├── PROJECT_STATE.md     → Progress saat ini ← update setiap ada perubahan
│   ├── DECISIONS.md         → Keputusan penting ← update jika ada keputusan baru
│   ├── CHANGELOG.md         → Riwayat perubahan ← update setiap sesi
│   ├── CONVERSATIONS.md     → Log diskusi penting ← update jika ada insight
│   └── BRAINSTORM.md        → Bank ide ← update dari sesi brainstorm
├── design/                  → Dokumentasi operasional untuk tim designer
│   ├── README.md
│   └── DESIGN_OVERVIEW.md   → Product UX Map + Design System Blueprint
└── product-discovery/       → Source of Truth produk: business s/d engineering
    ├── README.md
    ├── 01-business/         → Business Discovery
    ├── 02-product/          → Product Planning
    ├── 03-user/             → User Discovery
    ├── 04-ux/               → UX Planning
    ├── 05-architecture/     → System Architecture
    └── 06-engineering/      → Engineering Planning
```

---

## Additional Resources

- Untuk detail dokumen UX Planning: `product-discovery/04-ux/README.md`
- Untuk detail dokumen Engineering Planning: `product-discovery/06-engineering/README.md`
- Untuk aturan lengkap: `project-manager/PROJECT_RULES.md`
