# User Flows

Dokumen ini mendefinisikan **alur solusi (solution flows)** untuk pekerjaan inti pengguna pada produk **Social Media Management**.

User flows di sini adalah future-state — menggambarkan bagaimana produk menyelesaikan pekerjaan pengguna, bukan kondisi kerja saat ini.

---

# Overview

Setiap flow didokumentasikan dari sudut pandang **Raka (P0 daily user)** sebagai aktor utama. Maya (P0 buyer) berperan sebagai observer pada flow yang melibatkan visibility.

Flow ini tidak mendefinisikan layout visual atau interaksi detail UI. Flow ini adalah acuan logika dan urutan pekerjaan yang menjadi input untuk Navigation Patterns, Key Screen Patterns, dan Architecture Discovery.

---

# Scope

## In Scope

* Alur solusi untuk Must Have MVP features.
* Happy path — skenario ideal saat tidak ada hambatan.
* Satu alternate path per flow — skenario paling kritis atau paling sering terjadi.
* Referensi ke UX Principles yang relevan.

## Out of Scope

* Wireframe atau layout visual.
* Error handling teknis (HTTP errors, server failures).
* Alur untuk fitur Should Have dan Could Have.
* Alur detail per platform media sosial (Instagram, X, dll.).

---

# Cara Membaca Dokumen Ini

Setiap flow memiliki struktur:

* **Goal** — apa yang ingin dicapai aktor di akhir flow.
* **Aktor** — siapa yang menjalankan flow.
* **Trigger** — apa yang memulai flow.
* **Modul** — modul produk yang terlibat.
* **Happy Path** — langkah-langkah saat semua kondisi terpenuhi.
* **Alternate Path** — skenario paling kritis yang menyimpang dari happy path.
* **UX Principles** — prinsip yang mengatur keputusan pada flow ini.

---

# Daftar User Flows

| ID | Flow | Aktor Utama | Modul |
| -- | ---- | ----------- | ----- |
| UF-01 | Membuat dan Menjadwalkan Konten | Raka | Publishing |
| UF-02 | Mengelola Queue Konten | Raka | Publishing |
| UF-03 | Review Kalender Publishing | Raka + Maya (observer) | Publishing |
| UF-04 | Triage Engagement Inbox | Raka | Engagement |
| UF-05 | Menghubungkan Akun Sosial | Raka / Maya | Workspace Settings |
| UF-06 | Melihat Ringkasan Performa | Maya + Raka (sekunder) | Analytics |

---

# User Flows

---

## UF-01 — Membuat dan Menjadwalkan Konten

**Goal:** Raka menyelesaikan satu konten dari tulis caption hingga terjadwal ke akun sosial yang benar.

**Aktor:** Raka (primary)

**Trigger:** Raka memulai sesi kerja konten harian atau menerima brief baru.

**Modul:** Publishing (Draft Editor, Account Selector, Schedule Picker), AI Assistant

---

### Happy Path

1. Raka membuka **Publish → Drafts**, klik **New Post**.
2. **Draft Editor** terbuka — Caption Editor aktif sebagai fokus utama.
3. Raka memilih:
   - **Menulis manual** — Raka mengetik caption langsung di Caption Editor.
   - **Menggunakan AI Assist** (opsional) — Raka memicu AI inline di Caption Editor, memilih tone/intent singkat, AI menghasilkan beberapa opsi caption. Raka memilih satu dan mengeditnya seperlunya.
4. Raka melampirkan media melalui **Media Attachment** — dari file lokal atau Media Library.
5. Raka memilih satu atau beberapa akun tujuan via **Account Selector**.
6. Raka menetapkan waktu publish via **Schedule Picker**.
7. Draft Editor menampilkan ringkasan: preview caption, akun tujuan, dan waktu yang dipilih.
8. Raka menekan **Schedule** — status konten berubah menjadi `Scheduled`.
9. Post muncul di **Calendar** dan **Queue** sesuai waktu yang ditentukan.

**Outcome:** Konten terjadwal dan terlihat di Calendar dan Queue.

---

### Alternate Path — Draft Disimpan, Belum Dijadwalkan

**Kondisi:** Caption belum final, media belum siap, atau Raka belum memutuskan waktu publish.

1. Raka menulis caption (sebagian atau seluruhnya) di Caption Editor.
2. Raka klik **Save as Draft** — post disimpan ke **Publish → Drafts** dengan status `Draft`.
3. Post tidak muncul di Calendar maupun Queue.
4. Raka kembali kapan saja untuk melengkapi dan menjadwalkan.

**Outcome:** Konten tersimpan sebagai draft, belum masuk antrian jadwal.

---

### UX Principles

* **UXP-01** — Flow ini mewakili tahapan Production → Scheduling dalam satu siklus kerja tanpa context switching ke tool lain.
* **UXP-04** — Ringkasan konfirmasi (caption + akun + waktu) sebelum schedule membangun kepercayaan bahwa konten akan terbit ke tempat yang benar.
* **UXP-06 (I-06)** — AI Assist hadir di dalam Caption Editor sebagai aksi kontekstual, bukan modul terpisah yang memaksa Raka keluar dari flow.

---

---

## UF-02 — Mengelola Queue Konten

**Goal:** Raka memastikan antrean konten terjadwal memiliki coverage yang sehat — tidak ada gap penting dan tidak ada slot yang terlalu padat.

**Aktor:** Raka (primary)

**Trigger:** Raka ingin memeriksa atau merapikan jadwal mingguan sebelum atau sesudah membuat konten baru.

**Modul:** Publishing (Queue, Draft Editor)

---

### Happy Path

1. Raka membuka **Publish → Queue**.
2. Queue menampilkan daftar konten terjadwal berurutan per akun — status setiap item terlihat (`Scheduled`, `In Review`, `Ready to Schedule`, `Draft`, `Failed`).
3. Raka memindai coverage: melihat apakah ada hari tanpa posting, atau slot yang terlalu berdekatan untuk akun tertentu.
4. Raka mengubah urutan item jika diperlukan — memindahkan jadwal ke slot yang lebih tepat.
5. Jika ada gap yang perlu diisi, Raka langsung membuat konten baru melalui **New Post** (kembali ke UF-01).
6. Queue diperbarui secara real-time setelah setiap perubahan.

**Outcome:** Queue terorganisir dengan coverage yang sehat untuk periode berjalan.

---

### Alternate Path — Konten Dijadwalkan Ulang ke Draft

**Kondisi:** Raka menemukan konten yang belum siap namun sudah terjadwal — misalnya caption belum final atau aset berubah.

1. Raka memilih item di Queue dengan status `Scheduled` yang perlu ditarik.
2. Raka membuka Draft Editor item tersebut.
3. Raka mengubah status menjadi `Draft` — post kembali ke **Publish → Drafts**.
4. Slot waktu di Queue dan Calendar menjadi kosong.
5. Raka menyelesaikan konten dan menjadwalkannya kembali melalui UF-01.

**Outcome:** Konten yang belum siap tidak ikut antrian, slot aman untuk diisi ulang.

---

### UX Principles

* **UXP-01** — Queue adalah representasi visual dari kelangsungan siklus kerja Raka; melihat gap di sini langsung memicu aksi buat konten baru.
* **UXP-04** — Status yang selalu terlihat di Queue (`Scheduled`, `In Review`, `Ready to Schedule`, `Draft`, `Failed`) membangun kepercayaan bahwa tidak ada posting yang "hilang" atau salah status.

---

---

## UF-03 — Review Kalender Publishing

**Goal:** Raka memastikan jadwal konten minggu berjalan sudah benar. Maya mendapat gambaran status publishing tanpa perlu bertanya ke tim.

**Aktor:** Raka (planner), Maya (observer)

**Trigger:** Awal minggu kerja, atau kapanpun Raka/Maya ingin melihat gambaran jadwal konten.

**Modul:** Publishing (Calendar)

---

### Happy Path

1. Raka membuka **Publish → Calendar** — tampilan default: weekly view.
2. Calendar menampilkan seluruh konten terjadwal dalam minggu berjalan, dibedakan secara visual per akun dan status (`Scheduled`, `Published`, `In Review`, `Ready to Schedule`, `Draft`, `Failed`).
3. Raka memindai distribusi konten: akun mana yang paling banyak / sedikit, hari mana yang kosong.
4. Raka mengklik satu item di Calendar untuk membuka Draft Editor dan melakukan edit jika diperlukan.
5. Maya (di sesinya) membuka **Home → Today's Schedule** atau langsung **Publish → Calendar**.
6. Maya melihat Calendar yang sama — membaca status publishing minggu ini tanpa perlu interaksi apapun.
7. Maya mendapat gambaran cukup untuk diskusi team atau keputusan prioritas konten.

**Outcome:** Raka memiliki jadwal yang sudah diverifikasi. Maya mendapat visibilitas status tanpa meeting tambahan.

---

### Alternate Path — Post Menunjukkan Status Failed

**Kondisi:** Satu atau lebih post di Calendar gagal dipublish karena koneksi akun kadaluarsa atau masalah lain.

1. Raka melihat item di Calendar dengan status `Failed` — terlihat jelas tanpa harus mencarinya.
2. Raka mengklik item tersebut untuk membaca alasan kegagalan (contoh: "Akun X tidak terhubung").
3. Raka navigasi ke **Workspace Settings → Connected Accounts** untuk mengatasi masalah koneksi (lihat UF-05 Alternate Path).
4. Setelah akun terhubung kembali, Raka kembali ke Calendar dan me-reschedule atau retry post tersebut.

**Outcome:** Masalah teridentifikasi dan ditangani langsung dari konteks Calendar, bukan melalui notifikasi yang terlambat.

---

### UX Principles

* **UXP-02** — Calendar adalah titik pertemuan antara mode eksekusi Raka dan mode visibility Maya dalam satu layar yang sama.
* **UXP-04** — Status `Failed` harus terlihat secara proaktif di Calendar, bukan menunggu Raka atau Maya bertanya ke sistem.
* **UXP-03** — Calendar default ke weekly view karena itu adalah unit kerja yang paling relevan — bukan monthly view yang menyembunyikan detail harian.

---

---

## UF-04 — Triage Engagement Inbox

**Goal:** Raka menangani interaksi audiens yang penting dari semua akun yang terhubung tanpa harus membuka native app per platform.

**Aktor:** Raka (primary)

**Trigger:** Raka membuka sesi kerja engagement, atau Raka mendapat notifikasi ada interaksi baru.

**Modul:** Engagement (Inbox)

---

### Happy Path

1. Raka membuka **Engage → Inbox**.
2. Inbox menampilkan komentar dan pesan dari semua akun terhubung, berurutan berdasarkan waktu masuk.
3. Raka memfilter berdasarkan akun, platform, atau status (`Unread / Done`) jika volume tinggi.
4. Raka membuka satu thread komentar — komentar ditampilkan bersama konteks post asalnya.
5. Raka membalas komentar langsung dari dalam Inbox — tanpa membuka native app.
6. Raka menandai interaksi sebagai `Done` — item hilang dari antrian unread.
7. Raka lanjut ke interaksi berikutnya.

**Outcome:** Interaksi prioritas selesai ditangani dalam satu session di Inbox, tanpa context switching ke native apps.

---

### Alternate Path — Notifikasi Engagement Masuk Saat Raka Bekerja di Publish

**Kondisi:** Raka sedang dalam flow publishing (UF-01 atau UF-02) ketika ada interaksi penting masuk.

1. Badge notifikasi muncul pada item **Engage** di primary navigation.
2. Raka menyelesaikan aksi saat ini terlebih dahulu di Publish — tidak perlu interrupt flow.
3. Setelah selesai, Raka berpindah ke **Engage → Inbox**.
4. Interaksi baru tampil sebagai `Unread` di atas antrian.
5. Raka menangani interaksi tersebut → tandai `Done`.

**Outcome:** Engagement tertangani tepat waktu tanpa memotong flow publishing yang sedang berjalan.

---

### UX Principles

* **UXP-01** — Engage adalah tahapan natural setelah Publish dalam satu siklus kerja — navigasi mencerminkan urutan ini.
* **UXP-03** — Inbox yang terpusat menggantikan kebutuhan membuka multiple native apps; kesederhanaan ini adalah solusi inti, bukan fitur tambahan.
* **UXP-05 (I-05)** — Engagement adalah retention layer produk; Inbox yang terkonsolidasi mendorong Raka tetap menggunakan produk setelah fase publishing.

---

---

## UF-05 — Menghubungkan Akun Sosial

**Goal:** Akun media sosial berhasil terhubung ke workspace dan siap digunakan untuk publishing.

**Aktor:** Raka atau Maya (siapa yang memiliki akses Workspace Settings)

**Trigger:** Workspace baru dibuat dan belum ada akun terhubung, atau Raka ingin menambah akun platform baru.

**Modul:** Workspace Settings (Connected Accounts), Authentication (OAuth)

---

### Happy Path

1. Aktor membuka **Workspace Settings → Connected Accounts**.
2. Aktor klik **Connect Account**.
3. Sistem menampilkan daftar platform yang tersedia (Instagram, Facebook, X, LinkedIn, TikTok, YouTube, Threads, Pinterest).
4. Aktor memilih platform tujuan.
5. Sistem membuka alur OAuth platform — aktor login ke akun platform-nya dan memberikan izin.
6. Platform mengirim konfirmasi ke sistem.
7. Sistem kembali ke **Connected Accounts** — akun baru muncul dengan status `Active`.
8. Akun tersebut kini tersedia di **Account Selector** pada Draft Editor.

**Outcome:** Akun sosial terhubung dan siap dipakai untuk publishing.

---

### Alternate Path — Token Akun Kadaluarsa

**Kondisi:** Akun yang sudah terhubung sebelumnya kehilangan akses karena token OAuth kadaluarsa atau izin dicabut di platform.

1. Raka melihat indikator `Disconnected` pada akun di Calendar, Queue, atau Draft Editor Account Selector.
2. Sistem menampilkan pesan ringkas: akun X kehilangan akses, perlu reconnect.
3. Raka membuka **Workspace Settings → Connected Accounts**.
4. Akun yang bermasalah ditampilkan dengan status `Disconnected` dan tombol **Reconnect**.
5. Raka klik **Reconnect** → alur OAuth diulang untuk akun tersebut.
6. Setelah berhasil, status akun kembali `Active`.
7. Post yang terjadwal untuk akun ini tidak ikut gagal — mereka tetap di antrean dan akan terkirim pada waktunya.

**Outcome:** Akun kembali aktif, publishing pipeline tidak terganggu.

---

### UX Principles

* **UXP-04** — Status `Disconnected` pada akun harus terlihat di titik-titik kritis (Calendar, Queue, Account Selector) — bukan hanya di Settings — agar masalah ketahuan sebelum post gagal.
* **UXP-03** — Alur OAuth mengikuti standar platform; tidak ada langkah tambahan yang tidak perlu di antara klik "Connect" dan halaman OAuth.

---

---

## UF-06 — Melihat Ringkasan Performa

**Goal:** Maya mendapat gambaran performa konten minggu ini yang cukup untuk keputusan arah konten berikutnya — tanpa harus mengumpulkan data manual dari native dashboards.

**Aktor:** Maya (primary), Raka (sekunder — melihat performa konten yang ia publish)

**Trigger:** Akhir minggu atau awal minggu — Maya memulai review mingguan.

**Modul:** Analytics (Dashboard), Home

---

### Happy Path

1. Maya membuka **Home** — **Analytics Snapshot** di layar Home menampilkan highlight performa minggu ini: total posts, total reach, engagement rate keseluruhan.
2. Maya memutuskan ingin melihat lebih detail — klik **Analytics Snapshot** atau navigasi langsung ke **Analyze → Dashboard**.
3. Dashboard menampilkan:
   - **Account Overview** — performa per akun sosial terhubung.
   - **Post Performance** — metrik per posting (reach, engagement, klik jika tersedia).
   - **Engagement Summary** — total interaksi pada periode yang dipilih.
4. Maya memfilter per akun atau mengubah rentang waktu (minggu ini, bulan ini).
5. Maya melihat post mana yang menghasilkan engagement terbaik — membentuk keputusan arah konten berikutnya.
6. Maya mendiskusikan insight ini bersama Raka dalam weekly sync — tidak perlu ekspor laporan formal di MVP.

**Outcome:** Maya mendapat ringkasan performa yang cukup untuk keputusan mingguan dalam beberapa menit — tanpa kompilasi manual.

---

### Alternate Path — Belum Ada Data (Empty State)

**Kondisi:** Workspace baru atau belum ada konten yang pernah dipublish lewat produk.

1. Maya atau Raka membuka **Analyze → Dashboard**.
2. Dashboard menampilkan **empty state** dengan pesan: _"Belum ada data. Hubungkan akun sosial dan mulai publish konten untuk melihat performa."_
3. Empty state menyertakan tautan langsung ke dua aksi:
   - **Connect Account** → mengarah ke Workspace Settings → Connected Accounts (UF-05).
   - **Create First Post** → mengarah ke Publish → Drafts → New Post (UF-01).
4. Tidak ada angka kosong atau grafik tanpa data yang ditampilkan.

**Outcome:** Empty state komunikatif — pengguna tahu apa yang harus dilakukan berikutnya, tidak ada dead end.

---

### UX Principles

* **UXP-02** — Analyze adalah layar kerja utama Maya dalam mode visibility; ia harus dapat membaca ringkasan bermakna tanpa navigasi berlapis.
* **UXP-03** — Analytics Snapshot di Home adalah shortcut pertama — Maya tidak harus masuk ke Analyze untuk mendapat gambaran cepat.
* **I-05** — Analytics adalah retention layer; nilainya muncul setelah Raka membangun ritme publishing yang konsisten.

---

---

# Ringkasan Flow

| ID | Flow | Trigger Utama | Outcome |
| -- | ---- | ------------- | ------- |
| UF-01 | Membuat dan Menjadwalkan Konten | Raka membuat post baru | Post terjadwal di Calendar dan Queue |
| UF-02 | Mengelola Queue Konten | Raka review antrian mingguan | Queue terkoverasi dan terorganisir |
| UF-03 | Review Kalender Publishing | Raka verifikasi jadwal; Maya butuh overview | Raka confirm jadwal; Maya punya visibility |
| UF-04 | Triage Engagement Inbox | Raka session engagement atau notif masuk | Interaksi prioritas ditangani tanpa native apps |
| UF-05 | Menghubungkan Akun Sosial | Workspace baru atau token kadaluarsa | Akun aktif dan siap untuk publishing |
| UF-06 | Melihat Ringkasan Performa | Review mingguan Maya | Maya dapat keputusan arah konten berikutnya |

---

# Relasi Antar Flow

```text
UF-05 (Connect Account)
    ↓
UF-01 (Create & Schedule Post)  ←→  UF-02 (Manage Queue)
    ↓                                      ↓
UF-03 (Review Calendar) ←─────────────────┘
    ↓
UF-04 (Triage Inbox)
    ↓
UF-06 (View Performance)  ←── Maya entry point dari Home
```

Siklus ini mencerminkan **UXP-01**: Draft → Schedule → Publish → Engage → Review adalah satu siklus, bukan kumpulan fitur terpisah.

---

# Keputusan UX yang Terdokumentasi

| ID | Keputusan | Prinsip | Dampak |
| -- | --------- | ------- | ------ |
| UXD-01 | AI Caption diakses dari dalam Caption Editor — bukan menu atau layar terpisah | UXP-06, I-06 | AI tidak menambah navigasi baru; ia mempercepat alur yang sudah ada |
| UXD-02 | Status `Failed` dan `Disconnected` terlihat di Calendar dan Queue — bukan hanya di Settings | UXP-04 | Masalah terdeteksi sebelum publish gagal |
| UXD-03 | Empty state Analytics memberi dua tautan aksi, bukan hanya pesan informasi | UXP-03 | Pengguna tidak stuck; dead end dihilangkan |
| UXD-04 | Maya dan Raka berbagi Calendar yang sama — bukan view terpisah | UXP-02 | Visibilitas tanpa overhead: satu Calendar melayani dua kebutuhan |

---

# Assumptions yang Dievaluasi

| ID | Asumsi | Evaluasi |
| -- | ------ | -------- |
| A-05 | Publishing adalah pekerjaan inti | UF-01 dan UF-02 adalah flow terpanjang dan paling kompleks — mendukung asumsi ini |
| A-07 | AI berguna jika masuk workflow | AI Assist di UF-01 adalah opsional in-flow, bukan titik masuk terpisah — selaras dengan I-06 |
| A-02 | Buyer ≠ daily user | UF-03 dan UF-06 dirancang agar Maya mendapat value tanpa harus ikut flow Raka |

---

# Related Documents

* `ux-principles.md`
* `information-architecture.md`
* `navigation-patterns.md` ← dokumen berikutnya
* `key-screen-patterns.md`
* `../03-user/user-personas.md`
* `../03-user/user-journey.md`
* `../03-user/insights.md`
* `../02-product/mvp-definition.md`
* `../02-product/feature-modules.md`
* `../../project-manager/DECISIONS.md`
* `../../project-manager/PROJECT_STATE.md`
