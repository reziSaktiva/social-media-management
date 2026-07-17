# Roles & Permissions

Dokumen ini mendefinisikan sistem peran dan hak akses pada produk **Social Media Management**.

Setiap role merepresentasikan tanggung jawab nyata dalam sebuah tim, bukan abstraksi teknis semata. Dokumen ini menjadi acuan wajib untuk UX Planning, System Architecture, dan Engineering Planning — terutama saat mendefinisikan alur kolaborasi, visibilitas konten, dan kendali akses fitur.

Dokumen ini adalah **addendum dari Product Baseline v1.0** (ADR-012).

---

# Overview

Produk mendukung kolaborasi tim dalam satu Workspace. Setiap anggota memiliki satu role yang menentukan apa yang dapat mereka lihat, buat, dan lakukan.

Pendekatan roles ini mengikuti prinsip **visibilitas tanpa birokrasi** (UXP-06): setiap anggota tim dapat melihat status pekerjaan, tetapi kontrol akses dirancang proporsional dengan kebutuhan koordinasi MVP — bukan enforcement workflow berlapis.

---

# Roles

## Owner

Pemilik workspace. Role ini dipegang oleh orang yang mendaftarkan workspace ke platform — biasanya pimpinan tim, founder, atau account lead.

**Karakteristik:**
- Hanya ada satu Owner per workspace.
- Owner tidak bisa dihapus oleh Admin atau Member lain.
- Ownership bisa ditransfer ke Admin lain.

**Hak Akses:**

| Area | Hak Akses |
| ---- | --------- |
| Workspace Settings | Baca, ubah, hapus workspace |
| Billing & Subscription | Penuh (upgrade, downgrade, batalkan) |
| Connected Accounts | Tambah, hapus, kelola semua akun media sosial |
| Members | Undang, hapus, ubah role semua anggota |
| Brand Settings | Baca dan ubah |
| Content | Buat, edit, hapus, jadwalkan, publish semua konten |
| Analytics | Akses penuh |
| Engagement (Inbox) | Baca dan balas semua interaksi |
| Audit Logs | Baca |
| Transfer Ownership | Ya |

---

## Admin

Admin adalah kepercayaan Owner. Role ini cocok untuk manajer senior atau orang kedua yang perlu menjalankan operasional workspace secara penuh tanpa hak untuk menghapus workspace atau mentransfer kepemilikan.

**Karakteristik:**
- Workspace bisa memiliki lebih dari satu Admin.
- Admin tidak bisa mengubah role Owner atau menghapus Owner dari workspace.

**Hak Akses:**

| Area | Hak Akses |
| ---- | --------- |
| Workspace Settings | Baca dan ubah (tidak bisa hapus workspace) |
| Billing & Subscription | Baca (tidak bisa ubah plan) |
| Connected Accounts | Tambah, hapus, kelola semua akun media sosial |
| Members | Undang, hapus, ubah role (kecuali role Owner) |
| Brand Settings | Baca dan ubah |
| Content | Buat, edit, hapus, jadwalkan, publish semua konten |
| Analytics | Akses penuh |
| Engagement (Inbox) | Baca dan balas semua interaksi |
| Audit Logs | Baca |
| Transfer Ownership | Tidak |

---

## Manager

Manager adalah operator harian workspace. Role ini cocok untuk Social Media Manager atau team lead yang bertanggung jawab atas jadwal konten dan koordinasi Creator.

**Karakteristik:**
- Workspace bisa memiliki lebih dari satu Manager.
- Manager tidak bisa mengundang atau menghapus Admin/Owner.
- Manager tidak mengakses billing atau workspace-level settings.

**Hak Akses:**

| Area | Hak Akses |
| ---- | --------- |
| Workspace Settings | Tidak ada akses |
| Billing & Subscription | Tidak ada akses |
| Connected Accounts | Baca; tidak bisa tambah/hapus |
| Members | Undang Creator; tidak bisa ubah role atau hapus member lain |
| Brand Settings | Baca saja |
| Content | Buat, edit, hapus, jadwalkan, publish semua konten |
| Analytics | Baca semua |
| Engagement (Inbox) | Baca dan balas semua interaksi |
| Audit Logs | Tidak ada akses |
| Transfer Ownership | Tidak |

---

## Creator

Creator adalah anggota tim yang berfokus pada pembuatan konten. Role ini cocok untuk Content Creator, Copywriter, atau Social Media Specialist yang bertugas menghasilkan draft.

**Karakteristik:**
- Workspace bisa memiliki lebih dari satu Creator.
- Creator hanya bisa melihat dan mengedit konten miliknya sendiri, kecuali konten yang secara eksplisit dibagikan oleh Manager/Admin/Owner.
- Creator tidak bisa menjadwalkan atau mempublish konten secara langsung.

**Hak Akses:**

| Area | Hak Akses |
| ---- | --------- |
| Workspace Settings | Tidak ada akses |
| Billing & Subscription | Tidak ada akses |
| Connected Accounts | Baca saja (melihat akun yang tersedia) |
| Members | Tidak ada akses |
| Brand Settings | Baca saja |
| Content (milik sendiri) | Buat, edit, kirim ke review |
| Content (milik lain) | Baca saja (status dan preview) |
| Analytics | Baca ringkasan (tidak bisa akses detail) |
| Engagement (Inbox) | Tidak ada akses |
| Audit Logs | Tidak ada akses |
| Transfer Ownership | Tidak |

---

# Ringkasan Hak Akses per Role

| Kemampuan | Owner | Admin | Manager | Creator |
| --------- | ----- | ----- | ------- | ------- |
| Hapus workspace | ✅ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |
| Kelola billing | ✅ | 👁 | ❌ | ❌ |
| Kelola workspace settings | ✅ | ✅ | ❌ | ❌ |
| Undang/hapus member | ✅ | ✅ | Creator saja | ❌ |
| Ubah role member | ✅ | ✅ (kecuali Owner) | ❌ | ❌ |
| Tambah/hapus connected accounts | ✅ | ✅ | ❌ | ❌ |
| Buat/edit konten | ✅ | ✅ | ✅ | ✅ (milik sendiri) |
| Jadwalkan/publish konten | ✅ | ✅ | ✅ | ❌ |
| Akses Analytics penuh | ✅ | ✅ | ✅ | 👁 ringkasan |
| Kelola Engagement Inbox | ✅ | ✅ | ✅ | ❌ |
| Baca Audit Logs | ✅ | ✅ | ❌ | ❌ |

**Legenda:** ✅ Ya &nbsp; ❌ Tidak &nbsp; 👁 Baca saja

---

# Content Status — Set Kanonikal

Berikut adalah daftar status konten yang berlaku di seluruh produk. Set ini adalah **satu-satunya acuan status kanonikal** — semua dokumen UX dan implementasi harus merujuk ke daftar ini.

| Status | Deskripsi |
| ------ | --------- |
| `Draft` | Konten sedang dibuat atau diedit. Belum siap untuk ditinjau atau dijadwalkan. |
| `In Review` | Creator atau Manager telah menandai konten sebagai siap ditinjau. Menunggu konfirmasi dari Manager/Admin/Owner. |
| `Ready to Schedule` | Konten telah disetujui secara informal. Siap dijadwalkan oleh Manager/Admin/Owner. |
| `Scheduled` | Konten telah memiliki waktu tayang. Sistem akan mempublikasikannya secara otomatis. |
| `Published` | Konten telah berhasil dipublikasikan ke platform media sosial. |
| `Failed` | Konten gagal dipublikasikan. Membutuhkan tindakan manual untuk diperbaiki atau dijadwalkan ulang. |

**Catatan penting:** `In Review` dan `Ready to Schedule` adalah status koordinasi yang ringan — bukan enforcement approval workflow berlapis (UXP-06). Manager dapat melewati keduanya dan menjadwalkan konten langsung dari `Draft` jika konteks tim mengizinkan.

---

# Aturan Transisi Status per Role

Tabel berikut mendefinisikan siapa yang dapat memicu setiap transisi status konten.

| Transisi | Owner | Admin | Manager | Creator | Sistem |
| -------- | ----- | ----- | ------- | ------- | ------ |
| (baru) → `Draft` | ✅ | ✅ | ✅ | ✅ | — |
| `Draft` → `In Review` | ✅ | ✅ | ✅ | ✅ | — |
| `In Review` → `Draft` | ✅ | ✅ | ✅ | ✅ (milik sendiri) | — |
| `In Review` → `Ready to Schedule` | ✅ | ✅ | ✅ | ❌ | — |
| `Ready to Schedule` → `Scheduled` | ✅ | ✅ | ✅ | ❌ | — |
| `Draft` → `Scheduled` (skip review) | ✅ | ✅ | ✅ | ❌ | — |
| `Scheduled` → `Draft` (tarik jadwal) | ✅ | ✅ | ✅ | ❌ | — |
| `Scheduled` → `Published` | — | — | — | — | ✅ otomatis |
| `Scheduled` → `Failed` | — | — | — | — | ✅ otomatis |
| `Failed` → `Draft` | ✅ | ✅ | ✅ | ❌ | — |

**Catatan:**
- Semua transisi yang memerlukan `Manager` ke atas membutuhkan login dengan role tersebut — bukan pemeriksaan manual.
- `Creator` tidak dapat menjadwalkan atau mempublish konten secara langsung; mereka hanya bisa menandai konten sebagai `In Review` dan menunggu tindakan Manager/Admin/Owner.
- Transisi `Scheduled → Published` dan `Scheduled → Failed` sepenuhnya otomatis oleh sistem — tidak ada user action yang diperlukan.

---

# Mapping ke Personas

Dokumen ini dapat ditelusuri ke User Discovery Baseline v1.0 melalui pemetaan persona berikut.

| Persona | Role di Platform | Catatan |
| ------- | ---------------- | ------- |
| Maya — Marketing Manager | Admin atau Owner | Buyer; visibility tinggi, jarang buat konten langsung |
| Raka — Social Media Manager | Manager | Primary daily user; operator publishing dan queue |
| Sinta — Content Creator | Creator | Fokus buat draft; tidak bisa jadwalkan sendiri |
| Dimas — Startup Growth Lead | Owner | Solo/small team; kemungkinan merangkap semua role |
| Lara — Agency Social Lead | Admin atau Manager | Oversight multi-akun; koordinasi tim kecil |

---

# Decision Rules

1. Jika struktur roles perlu diubah (misalnya: menambah role baru), diskusikan dan buat ADR baru.
2. Set status kanonikal tidak boleh diubah tanpa ADR. Seluruh dokumen UX yang merujuk status harus diperbarui bersamaan.
3. Dokumen ini menjadi acuan untuk desain database (tabel `members`, `roles`, `content_posts`) pada fase Architecture.
4. Jangan implementasikan "Approval Workflow" berlapis — ini bukan MVP (lihat `mvp-definition.md`: Approval Workflow ada di *Could Have*, bukan *Must Have*).

---

# Related Documents

* `README.md`
* `feature-modules.md` — modul Workspace mendefinisikan Roles & Permissions sebagai responsibilities
* `mvp-definition.md` — scope MVP termasuk Workspace management
* `feature-priority.md`
* `../03-user/user-personas.md` — mapping persona ke role
* `../04-ux/ux-principles.md` — UXP-06: Status Jelas, Proses Ringan
* `../04-ux/information-architecture.md`
* `../04-ux/user-flows.md`
* `../04-ux/key-screen-patterns.md`
* `../../project-manager/DECISIONS.md` — ADR-008 (Product Baseline), ADR-012 (addendum ini)
