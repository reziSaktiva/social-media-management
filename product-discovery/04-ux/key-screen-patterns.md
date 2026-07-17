# Key Screen Patterns

Dokumen ini mendefinisikan **pola fungsi kritis pada layar utama** produk **Social Media Management**.

Key Screen Patterns dibangun di atas Information Architecture, User Flows, dan Navigation Patterns yang sudah ditetapkan. Dokumen ini tidak mendefinisikan layout visual, wireframe, atau kode — melainkan menjelaskan **fungsi apa yang wajib ada**, **bagaimana zona fungsional disusun**, **state apa yang harus ditangani**, dan **pola perilaku apa yang berlaku** pada setiap layar kritis.

---

# Overview

Dokumen ini mencakup 8 layar kritis yang menjadi inti interaksi pengguna:

| ID | Layar | Pengguna Utama |
| -- | ----- | -------------- |
| KSP-01 | Home | Maya |
| KSP-02 | Publish — Calendar | Raka + Maya |
| KSP-03 | Publish — Queue | Raka |
| KSP-04 | Publish — Drafts | Raka |
| KSP-05 | Publish — Draft Editor | Raka |
| KSP-06 | Engage — Inbox | Raka |
| KSP-07 | Analyze — Dashboard | Maya + Raka |
| KSP-08 | Workspace Settings — Connected Accounts | Raka / Maya |

Layar yang tidak tercantum (History, Start Page, User Settings) bukan layar kritis harian — polanya lebih sederhana dan tidak memerlukan dokumentasi mendalam di fase ini.

---

# Cara Membaca Dokumen Ini

Setiap layar memiliki struktur:

* **Identitas** — path layar, pengguna utama, entry points, dan UX Principles yang relevan.
* **Tujuan** — apa yang harus berhasil dilakukan pengguna setelah menggunakan layar ini.
* **Critical Functions** — fungsi yang wajib ada; diidentifikasi dengan ID unik.
* **Zona Fungsional** — pengelompokan logis area dalam layar (bukan layout visual).
* **State Handling** — kondisi layar yang harus ditangani: default, loading, empty, error.
* **Decision Log per Layar** — keputusan desain yang spesifik untuk layar ini.

---

# Key Screen Patterns

---

## KSP-01 — Home

### Identitas

| Field | Value |
| ----- | ----- |
| Path IA | `Home` |
| Pengguna Utama | Maya (visibility mode) |
| Pengguna Sekunder | Raka (orientasi awal) |
| Entry Points | Login → Home; Sidebar → Home |
| UX Principles | UXP-02, UXP-03, UXP-07 |

### Tujuan

Home adalah layar orientasi — Maya dapat memindai status publishing, engagement, dan performa dalam satu layar tanpa perlu masuk ke section kerja. Raka dapat melihat kondisi harian sebelum masuk ke Publish.

Home **bukan** layar kerja. Tidak ada aksi berat yang diselesaikan dari sini.

---

### Critical Functions

| ID | Fungsi | Deskripsi | Prinsip |
| -- | ------ | --------- | ------- |
| KSP-01-F01 | Today's Schedule | Daftar konten yang terjadwal untuk hari ini, per akun, dengan status | UXP-02, UXP-04 |
| KSP-01-F02 | Recent Activity | Riwayat aksi terbaru: post berhasil dipublish, post gagal, akun disconnected | UXP-04, UXP-06 |
| KSP-01-F03 | Engagement Snapshot | Jumlah interaksi unread di Inbox — mendorong Raka ke Engage | UXP-07 |
| KSP-01-F04 | Analytics Snapshot | Highlight performa minggu ini: total posts, total reach, engagement rate | UXP-02, UXP-07 |
| KSP-01-F05 | Deep Link ke Section | Setiap item/snapshot dapat diklik dan membawa pengguna ke layar yang relevan | UXP-01 |

---

### Zona Fungsional

Home dibagi menjadi empat zona yang disusun secara vertikal:

```
┌──────────────────────────────────────────────┐
│  TODAY'S SCHEDULE                            │
│  konten terjadwal hari ini per akun + status │
├──────────────────────────────────────────────┤
│  RECENT ACTIVITY                             │
│  aksi terbaru: publish success / failed      │
├──────────────────────────────────────────────┤
│  ENGAGEMENT SNAPSHOT    │  ANALYTICS SNAPSHOT│
│  jumlah unread inbox    │  total posts, reach│
└──────────────────────────────────────────────┘
```

**Urutan zona:** Today's Schedule ditaruh di atas karena paling time-sensitive. Analytics Snapshot di bawah — ia adalah "retention layer" yang dilihat setelah kebutuhan operasional terpenuhi (UXP-07).

---

### State Handling

| State | Tampilan |
| ----- | -------- |
| Default (ada data) | Semua zona terisi dengan data aktual |
| Tidak ada jadwal hari ini | Today's Schedule: _"Tidak ada jadwal untuk hari ini"_ + CTA ke Publish → Calendar |
| Tidak ada aktivitas terbaru | Recent Activity: kosong tersembunyi atau pesan singkat |
| Inbox kosong | Engagement Snapshot: _"0 unread"_ — tetap tampil, tidak disembunyikan |
| Belum ada data analytics | Analytics Snapshot: _"Belum ada data"_ + CTA ke Analyze |
| Ada post gagal hari ini | Recent Activity menampilkan item Failed dengan visual highlight yang membedakannya |

---

### Pola: Deep Link dari Home

Setiap elemen di Home yang dapat diklik membawa pengguna ke layar spesifik:

```
Today's Schedule → item di-klik → Publish → Calendar → Draft Editor (item)
Recent Activity  → item Failed  → Publish → Calendar (item Failed tersorot)
Engagement Snapshot → klik      → Engage → Inbox
Analytics Snapshot  → klik      → Analyze → Dashboard
```

Pengguna tidak menyelesaikan pekerjaan di Home — mereka diarahkan ke layar kerja yang tepat.

---

---

## KSP-02 — Publish — Calendar

### Identitas

| Field | Value |
| ----- | ----- |
| Path IA | `Publish → Calendar` |
| Pengguna Utama | Raka (verifikasi jadwal, edit cepat) |
| Pengguna Sekunder | Maya (visibility jadwal tanpa interaksi) |
| Entry Points | Sidebar → Publish (default tab); Home → Today's Schedule |
| UX Principles | UXP-02, UXP-03, UXP-04, UXP-06 |

### Tujuan

Calendar adalah **tampilan default** saat pengguna masuk ke Publish. Layar ini memberi gambaran visual jadwal konten pada periode berjalan dan menjadi titik pertemuan antara kebutuhan eksekusi Raka dan kebutuhan visibility Maya.

---

### Critical Functions

| ID | Fungsi | Deskripsi | Prinsip |
| -- | ------ | --------- | ------- |
| KSP-02-F01 | Weekly View Default | Calendar menampilkan semua konten terjadwal dalam rentang minggu berjalan | UXP-02, UXP-03 |
| KSP-02-F02 | Status Visual per Item | Setiap item di Calendar menampilkan status: Scheduled, Published, In Review, Ready to Schedule, Draft, Failed | UXP-04, UXP-06 |
| KSP-02-F03 | Identitas Akun per Item | Setiap item menampilkan identitas akun tujuan (platform + nama akun) | UXP-04 |
| KSP-02-F04 | Klik Item → Draft Editor | Klik item membuka Draft Editor untuk item tersebut | UXP-01 |
| KSP-02-F05 | Ganti Periode | Pengguna dapat berpindah ke minggu lain atau bulan | UXP-03 |
| KSP-02-F06 | Status Failed yang Mencolok | Item dengan status Failed ditampilkan dengan visual yang berbeda dan tidak bisa diabaikan | UXP-04 |
| KSP-02-F07 | Disconnected Account Warning | Jika akun dalam item berstatus Disconnected, indikator warning tampil di item tersebut | UXP-04, UXP-06 |

---

### Zona Fungsional

```
┌──────────────────────────────────────────────────┐
│  [Tab: Calendar] [Queue] [Drafts] [History]       │
├──────────────────────────────────────────────────┤
│  PERIOD CONTROL: < Minggu Ini >   [Bulan]  [Hari]│
├────────┬──────┬──────┬──────┬──────┬──────┬──────┤
│  Sen   │ Sel  │ Rab  │ Kam  │ Jum  │ Sab  │ Ming │
│        │      │      │      │      │      │      │
│ [item] │      │[item]│      │[item]│      │      │
│        │      │[item]│      │      │      │      │
├────────┴──────┴──────┴──────┴──────┴──────┴──────┤
│  [+ New Post]                                     │
└──────────────────────────────────────────────────┘
```

**Zona tab bar:** Tab Calendar, Queue, Drafts, History selalu terlihat di bagian atas.

**Zona period control:** Pengguna berpindah minggu/bulan. Default: minggu berjalan.

**Zona grid:** Grid per hari × slot waktu. Setiap item menampilkan thumbnail akun, potongan caption, dan status.

**Zona New Post:** CTA tetap tersedia untuk langsung membuat konten baru.

---

### State Handling

| State | Tampilan |
| ----- | -------- |
| Ada konten terjadwal | Grid terisi dengan item sesuai slot waktu |
| Tidak ada konten minggu ini | Grid kosong + pesan _"Tidak ada konten minggu ini"_ + CTA ke Drafts → New Post |
| Item Failed | Item ditampilkan dengan visual berbeda (warna atau ikon khusus) — tidak disembunyikan |
| Akun Disconnected | Indikator warning pada item yang terdampak + tautan ke Settings |
| Item loading | Skeleton per item saat data sedang dimuat |

---

---

## KSP-03 — Publish — Queue

### Identitas

| Field | Value |
| ----- | ----- |
| Path IA | `Publish → Queue` |
| Pengguna Utama | Raka |
| Entry Points | Tab Queue dalam Publish |
| UX Principles | UXP-01, UXP-04, UXP-06 |

### Tujuan

Queue menampilkan konten terjadwal dalam urutan linear per akun — Raka memindai coverage, mengatur ulang urutan, dan mengidentifikasi gap atau masalah dengan cepat.

---

### Critical Functions

| ID | Fungsi | Deskripsi | Prinsip |
| -- | ------ | --------- | ------- |
| KSP-03-F01 | Daftar Konten Terurut | Semua post terjadwal ditampilkan berurutan berdasarkan waktu publish | UXP-01 |
| KSP-03-F02 | Status per Item | Status setiap item terlihat jelas: Scheduled, In Review, Ready to Schedule, Draft, Failed | UXP-04, UXP-06 |
| KSP-03-F03 | Filter per Akun | Pengguna dapat memfilter tampilan untuk satu akun tertentu | UXP-03 |
| KSP-03-F04 | Klik Item → Draft Editor | Klik item membuka Draft Editor untuk item tersebut | UXP-01 |
| KSP-03-F05 | Reorder Item | Pengguna dapat memindahkan item ke slot waktu yang berbeda | UXP-01 |
| KSP-03-F06 | New Post dari Queue | CTA New Post tersedia langsung dari Queue | UXP-01 |

---

### Zona Fungsional

```
┌──────────────────────────────────────────────────┐
│  [Tab: Calendar] [Queue] [Drafts] [History]       │
├──────────────────────────────────────────────────┤
│  Filter: [Semua Akun ▼]              [+ New Post]│
├──────────────────────────────────────────────────┤
│  Senin, 14 Jul — 10:00               Scheduled   │
│  Instagram @brandname | Caption preview...   [>] │
├──────────────────────────────────────────────────┤
│  Senin, 14 Jul — 15:00                  Failed   │
│  X @brandname | Caption preview...          [>] │
├──────────────────────────────────────────────────┤
│  Selasa, 15 Jul — 09:00              Scheduled   │
│  LinkedIn @brandname | Caption preview...    [>] │
└──────────────────────────────────────────────────┘
```

**Zona filter:** Memilih akun untuk mempersempit tampilan Queue.

**Zona list:** Setiap item menampilkan tanggal/waktu, platform + nama akun, potongan caption, dan status. Item dengan status Failed mendapat visual berbeda.

**Zona CTA:** New Post selalu tersedia tanpa scroll.

---

### State Handling

| State | Tampilan |
| ----- | -------- |
| Ada konten terjadwal | Daftar item berurutan |
| Queue kosong | _"Tidak ada konten terjadwal"_ + CTA New Post |
| Item Failed | Item ditandai jelas dengan status Failed |
| Filter aktif — tidak ada item | _"Tidak ada konten untuk akun ini"_ |

---

---

## KSP-04 — Publish — Drafts

### Identitas

| Field | Value |
| ----- | ----- |
| Path IA | `Publish → Drafts` |
| Pengguna Utama | Raka |
| Entry Points | Tab Drafts dalam Publish; Empty state di Queue/Calendar (CTA New Post) |
| UX Principles | UXP-01, UXP-03, UXP-06 |

### Tujuan

Drafts adalah tempat Raka menyimpan dan mengakses konten yang belum terjadwal — baik yang baru dibuat maupun yang sengaja ditarik kembali dari Queue.

---

### Critical Functions

| ID | Fungsi | Deskripsi | Prinsip |
| -- | ------ | --------- | ------- |
| KSP-04-F01 | Daftar Draft | Semua draft yang belum terjadwal, berurutan berdasarkan waktu terakhir diedit | UXP-06 |
| KSP-04-F02 | Status per Item | Status setiap item: Draft, In Review, Ready to Schedule | UXP-06 |
| KSP-04-F03 | Klik Item → Draft Editor | Klik item membuka Draft Editor untuk melanjutkan pengerjaan | UXP-01 |
| KSP-04-F04 | New Post | CTA untuk membuat draft baru, langsung membuka Draft Editor kosong | UXP-01 |
| KSP-04-F05 | Filter / Sort | Pengguna dapat memfilter atau mengurutkan draft (opsional untuk MVP) | UXP-03 |

---

### Zona Fungsional

```
┌──────────────────────────────────────────────────┐
│  [Tab: Calendar] [Queue] [Drafts] [History]       │
├──────────────────────────────────────────────────┤
│                                    [+ New Post]  │
├──────────────────────────────────────────────────┤
│  Caption preview...                      Draft   │
│  Diedit 2 jam lalu                           [>] │
├──────────────────────────────────────────────────┤
│  Caption preview...              Ready to Schedule│
│  Diedit kemarin                              [>] │
├──────────────────────────────────────────────────┤
│  Caption preview...                      Draft   │
│  Diedit 3 hari lalu                          [>] │
└──────────────────────────────────────────────────┘
```

**Zona CTA:** New Post di atas — akses paling cepat untuk membuat konten baru.

**Zona list:** Setiap item menampilkan potongan caption, waktu terakhir diedit, dan status.

---

### State Handling

| State | Tampilan |
| ----- | -------- |
| Ada draft | Daftar item berurutan waktu edit |
| Tidak ada draft | _"Belum ada draft"_ + CTA New Post |

---

---

## KSP-05 — Publish — Draft Editor

### Identitas

| Field | Value |
| ----- | ----- |
| Path IA | `Publish → Drafts → Draft Editor` |
| Pengguna Utama | Raka |
| Entry Points | New Post; Klik item dari Calendar / Queue / Drafts |
| UX Principles | UXP-01, UXP-03, UXP-04, UXP-05, UXP-06 |

### Tujuan

Draft Editor adalah **layar kerja terpenting** dalam produk. Raka menulis, melengkapi, dan menjadwalkan konten dari layar ini. Semua kebutuhan untuk menyelesaikan satu konten tersedia di sini tanpa berpindah layar.

---

### Critical Functions

| ID | Fungsi | Deskripsi | Prinsip |
| -- | ------ | --------- | ------- |
| KSP-05-F01 | Caption Editor | Area tulis utama untuk caption konten — menjadi fokus saat layar terbuka | UXP-01, UXP-03 |
| KSP-05-F02 | AI Caption Assist | Trigger AI inline di Caption Editor — menghasilkan opsi caption; aksi kontekstual, bukan navigasi terpisah | UXP-05 |
| KSP-05-F03 | Media Attachment | Lampirkan gambar atau video dari perangkat lokal atau Media Library | UXP-01 |
| KSP-05-F04 | Account Selector | Pilih satu atau beberapa akun tujuan — dengan indikator status koneksi tiap akun | UXP-04 |
| KSP-05-F05 | Schedule Picker | Tentukan tanggal dan waktu publish | UXP-04 |
| KSP-05-F06 | Confirmation Summary | Ringkasan: preview caption, akun tujuan, waktu — ditampilkan sebelum Schedule dieksekusi | UXP-04 |
| KSP-05-F07 | Status Indicator | Status draft saat ini: Draft, In Review, Ready to Schedule, Scheduled, Published, Failed — selalu terlihat | UXP-06 |
| KSP-05-F08 | Save as Draft | Simpan progres tanpa menjadwalkan | UXP-01 |
| KSP-05-F09 | Schedule Action | Eksekusi penjadwalan setelah pengguna konfirmasi | UXP-04 |
| KSP-05-F10 | Kembali ke Sub-Screen Asal | Tombol Back / Close mengembalikan ke Calendar / Queue / Drafts tanpa kehilangan state | UXP-03 |

---

### Zona Fungsional

Draft Editor dibagi menjadi dua area utama:

```
┌─────────────────────────────────────────────────────────┐
│  [← Kembali]                      Status: [Draft ▼]    │
├────────────────────────────┬────────────────────────────┤
│  CAPTION EDITOR            │  KONFIGURASI               │
│                            │                            │
│  [Tulis caption di sini...]│  Account Selector          │
│                            │  ☐ Instagram @brand        │
│  [AI Assist ✨]            │  ☐ X @brand                │
│                            │  ☐ LinkedIn @brand [!warn] │
│                            │                            │
│  MEDIA ATTACHMENT          │  Schedule Picker           │
│  [+ Tambah Media]          │  [Tanggal] [Waktu]         │
│                            │                            │
│  [preview media]           ├────────────────────────────┤
│                            │  [Save as Draft]  [Schedule│
└────────────────────────────┴────────────────────────────┘
```

**Zona kiri — Caption Editor:** Area utama yang menjadi fokus saat layar terbuka. Caption Editor besar, bisa expand. AI Assist trigger tampil di dalam atau di dekat Caption Editor.

**Zona kiri — Media Attachment:** Di bawah Caption Editor. Preview media yang dilampirkan.

**Zona kanan — Account Selector:** Daftar akun terhubung yang tersedia. Setiap akun menampilkan status koneksinya. Akun Disconnected menampilkan warning.

**Zona kanan — Schedule Picker:** Input tanggal dan waktu. Terletak di bawah Account Selector.

**Zona kanan — Action bar:** Save as Draft dan Schedule. Schedule adalah aksi primer; Save as Draft adalah aksi sekunder.

---

### Pola: AI Caption Assist

AI Assist bukan layar terpisah — ia hadir sebagai aksi kontekstual di dalam Caption Editor.

```
Caption Editor kosong atau terfokus
    → trigger muncul: tombol / ikon "Generate with AI" atau "Improve Caption"
    → [klik trigger]
    → Panel AI muncul inline atau sebagai drawer:
        - Input singkat: tone, topik, atau instruksi (opsional)
        - AI menghasilkan 2-3 opsi caption
    → Raka memilih satu opsi → caption masuk ke Caption Editor
    → Raka mengedit seperlunya
```

Panel AI tidak membawa Raka keluar dari Draft Editor. Sidebar navigasi tetap terlihat. (UXP-05)

---

### Pola: Account Selector dengan Status

```
Account Selector menampilkan semua akun terhubung:

  ✅ Instagram @brandname      (Active)
  ✅ X @brandname              (Active)
  ⚠️  LinkedIn @brandname      (Disconnected) → [Reconnect]
  ✅ Facebook @brandname       (Active)
```

Akun Disconnected tetap ditampilkan — tidak disembunyikan. Pengguna melihat masalah di titik kritis (saat memilih akun), bukan setelah dijadwalkan. (UXP-04)

Klik tautan **Reconnect** membawa pengguna ke KSP-08.

---

### Pola: Confirmation Summary sebelum Schedule

Sebelum tombol Schedule dieksekusi, pengguna melihat ringkasan konfirmasi:

```
Konfirmasi Jadwal:
  Caption: "Selamat pagi! Hari ini kami..."
  Akun: Instagram @brandname, X @brandname
  Waktu: Senin, 14 Jul 2025 — 10:00 WIB
  
  [Batal]   [Konfirmasi & Jadwalkan]
```

Ini adalah satu-satunya momen di mana pengguna diminta konfirmasi eksplisit sebelum data diproses. (UXP-04)

---

### State Handling

| State | Tampilan |
| ----- | -------- |
| Draft baru (kosong) | Caption Editor terfokus; Account Selector belum dipilih; Schedule Picker kosong |
| Draft ada konten | Caption terisi, media terlampir (jika ada), akun dan waktu terisi |
| Status Scheduled | Status Indicator menampilkan "Scheduled"; aksi berubah: Edit Schedule / Unschedule |
| Status Published | Status Indicator menampilkan "Published"; layar read-only dengan opsi lihat di platform |
| Status Failed | Status Indicator menampilkan "Failed" + pesan alasan; aksi: Retry atau Edit |
| Akun Disconnected | Warning pada Account Selector + aksi Reconnect |

---

---

## KSP-06 — Engage — Inbox

### Identitas

| Field | Value |
| ----- | ----- |
| Path IA | `Engage → Inbox` |
| Pengguna Utama | Raka |
| Entry Points | Sidebar → Engage; Notification badge; Deep link dari Home |
| UX Principles | UXP-01, UXP-03, UXP-06 |

### Tujuan

Inbox adalah pusat triage engagement — Raka menangani komentar dari semua akun dalam satu tempat, tanpa harus membuka native app per platform.

---

### Critical Functions

| ID | Fungsi | Deskripsi | Prinsip |
| -- | ------ | --------- | ------- |
| KSP-06-F01 | Thread List | Daftar komentar/interaksi berurutan berdasarkan waktu masuk, dengan status Unread/Done | UXP-06 |
| KSP-06-F02 | Filter | Filter berdasarkan akun, platform, atau status (Unread / Done) | UXP-03 |
| KSP-06-F03 | Thread Expansion Inline | Klik thread membuka detail di panel kanan atau inline — tidak membuka layar baru | UXP-03 |
| KSP-06-F04 | Konteks Post Asal | Thread menampilkan preview post yang memicu komentar tersebut | UXP-01 |
| KSP-06-F05 | Reply Action | Pengguna dapat membalas komentar langsung dari Inbox | UXP-01 |
| KSP-06-F06 | Mark as Done | Pengguna menandai interaksi sebagai selesai — item hilang dari antrian Unread | UXP-06 |

---

### Zona Fungsional

Inbox menggunakan pola **master-detail**: daftar thread di kiri, detail thread di kanan.

```
┌────────────────────────────────────────────────────────┐
│  Filter: [Semua Akun ▼] [Semua Platform ▼] [Unread ▼] │
├───────────────────────────┬────────────────────────────┤
│  THREAD LIST              │  THREAD DETAIL             │
│                           │                            │
│  ● @user1 — Komentar...   │  Post: "Selamat pagi..."   │
│    Instagram · 5 mnt lalu │  [preview gambar]          │
│                           │                            │
│  ● @user2 — Komentar...   │  @user1: Komentar asli     │
│    X · 12 mnt lalu        │                            │
│                           │  [Balas...]                │
│  ○ @user3 — Komentar...   │                            │
│    LinkedIn · 1 jam lalu  │  [Mark as Done]            │
│    (Done)                 │                            │
└───────────────────────────┴────────────────────────────┘
```

**Zona filter:** Memfilter Thread List berdasarkan akun, platform, atau status.

**Zona Thread List:** Setiap item menampilkan nama pengguna, potongan komentar, platform, waktu, dan status (Unread ditandai berbeda dari Done).

**Zona Thread Detail:** Muncul saat thread diklik. Menampilkan konteks post asal, thread komentar, area balas, dan tombol Mark as Done.

---

### State Handling

| State | Tampilan |
| ----- | -------- |
| Ada interaksi unread | Thread List terisi; item Unread tampil di atas atau dengan penanda berbeda |
| Semua sudah Done | Thread List menampilkan item Done; filter Unread menghasilkan daftar kosong |
| Inbox kosong (tidak ada interaksi) | _"Belum ada interaksi"_ + pesan _"Mulai publish konten untuk melihat engagement"_ + CTA ke Publish |
| Filter aktif — tidak ada hasil | _"Tidak ada interaksi untuk filter ini"_ |
| Thread terbuka | Thread Detail tampil di panel kanan; Thread List tetap terlihat |

---

### Pola: Notification Badge → Inbox

Badge pada Engage di sidebar:

```
Badge muncul → Raka menyelesaikan pekerjaan saat ini (tidak interrupt)
             → Raka klik Engage di sidebar
             → Inbox terbuka dengan item Unread baru di atas
             → Raka tangani satu per satu → Mark as Done
             → Badge hilang saat semua Unread sudah Done
```

Badge tidak memaksa Raka interrupt alur yang sedang berjalan. Badge adalah sinyal, bukan perintah. (UXP-01, UXP-03)

---

---

## KSP-07 — Analyze — Dashboard

### Identitas

| Field | Value |
| ----- | ----- |
| Path IA | `Analyze → Dashboard` |
| Pengguna Utama | Maya (review mingguan) |
| Pengguna Sekunder | Raka (memahami performa konten) |
| Entry Points | Sidebar → Analyze; Home → Analytics Snapshot |
| UX Principles | UXP-02, UXP-03, UXP-07 |

### Tujuan

Dashboard memberi Maya gambaran performa konten yang cukup untuk keputusan mingguan — tanpa navigasi berlapis dan tanpa ekspor manual. Angka harus dapat dibaca sekilas.

---

### Critical Functions

| ID | Fungsi | Deskripsi | Prinsip |
| -- | ------ | --------- | ------- |
| KSP-07-F01 | Summary Row | Highlight metrik utama periode aktif: total posts, total reach, total engagement | UXP-02, UXP-03 |
| KSP-07-F02 | Account Overview | Performa per akun sosial terhubung — memudahkan perbandingan antar akun | UXP-02 |
| KSP-07-F03 | Post Performance | Daftar post dengan metrik individual: reach, engagement, klik | UXP-02 |
| KSP-07-F04 | Engagement Summary | Total interaksi (komentar, likes) pada periode yang dipilih | UXP-02 |
| KSP-07-F05 | Period Filter | Filter per rentang waktu: minggu ini, bulan ini | UXP-03 |
| KSP-07-F06 | Account Filter | Filter tampilan untuk satu akun tertentu | UXP-03 |

---

### Zona Fungsional

```
┌────────────────────────────────────────────────────────┐
│  Filter: [Minggu Ini ▼]  [Semua Akun ▼]               │
├────────────────────────────────────────────────────────┤
│  SUMMARY ROW                                           │
│  12 Posts    4,320 Reach    6.5% Engagement            │
├────────────────────────────────────────────────────────┤
│  ACCOUNT OVERVIEW                                      │
│  Instagram @brand: 5 posts, 2,100 reach                │
│  X @brand: 4 posts, 1,400 reach                        │
│  LinkedIn @brand: 3 posts, 820 reach                   │
├────────────────────────────────────────────────────────┤
│  POST PERFORMANCE                        ENGAGEMENT    │
│  [Post 1] caption...  1,200 reach        SUMMARY       │
│  [Post 2] caption...    900 reach        48 komentar   │
│  [Post 3] caption...    750 reach        128 likes     │
│  ...                                                   │
└────────────────────────────────────────────────────────┘
```

**Summary Row:** Angka agregat di atas — Maya membaca ini pertama. Dibuat besar dan jelas.

**Account Overview:** Breakdown per akun. Maya melihat akun mana yang paling berkinerja.

**Post Performance:** Daftar post individual dengan metrik. Dapat diurutkan berdasarkan reach atau engagement.

**Engagement Summary:** Ringkasan total interaksi — melengkapi Post Performance.

---

### State Handling

| State | Tampilan |
| ----- | -------- |
| Ada data | Dashboard terisi penuh dengan angka aktual |
| Belum ada data (workspace baru) | Empty state: _"Belum ada data analytics."_ + CTA Connect Account + CTA Create First Post |
| Filter menghasilkan data kosong | _"Tidak ada data untuk filter ini"_ — tidak ada angka kosong atau grafik tanpa data |
| Akun baru belum ada data | Account Overview: akun tampil tanpa angka, dengan pesan _"Belum ada data untuk akun ini"_ |

---

### Pola: Empty State Analytics

```
Analyze → Dashboard (belum ada data)
  ↓
Tampilkan:
  "Belum ada data analytics."
  "Hubungkan akun sosial untuk mulai melacak performa konten."

  [Connect Account]    →  Workspace Settings → Connected Accounts
  [Create First Post]  →  Publish → Drafts → New Post
```

Tidak ada angka nol atau grafik kosong yang ditampilkan — lebih baik empty state yang komunikatif daripada data yang misleading. (UXD-03)

---

---

## KSP-08 — Workspace Settings — Connected Accounts

### Identitas

| Field | Value |
| ----- | ----- |
| Path IA | `Workspace Settings → Connected Accounts` |
| Pengguna Utama | Raka atau Maya (siapa yang memiliki akses Settings) |
| Entry Points | Workspace Selector → Workspace Settings; Error indicator / Reconnect link dari Calendar, Queue, Account Selector |
| UX Principles | UXP-03, UXP-04 |

### Tujuan

Layar ini adalah satu-satunya tempat pengguna mengelola koneksi akun media sosial — menambah akun baru, memeriksa status koneksi yang ada, dan menangani akun yang terputus.

---

### Critical Functions

| ID | Fungsi | Deskripsi | Prinsip |
| -- | ------ | --------- | ------- |
| KSP-08-F01 | Daftar Akun Terhubung | Semua akun yang sudah terhubung ditampilkan dengan status koneksinya | UXP-04, UXP-06 |
| KSP-08-F02 | Status Koneksi per Akun | Status tiap akun: Active, Disconnected, Expired | UXP-04 |
| KSP-08-F03 | Connect Account | CTA untuk menambah akun baru — memulai alur pemilihan platform dan OAuth | UXP-04 |
| KSP-08-F04 | Reconnect | Tombol Reconnect pada akun berstatus Disconnected — memulai ulang alur OAuth untuk akun tersebut | UXP-04 |
| KSP-08-F05 | Disconnect / Remove | Pengguna dapat melepas koneksi akun yang tidak diperlukan | UXP-03 |
| KSP-08-F06 | Platform Selector | Daftar platform yang tersedia saat menambah akun baru | UXP-03 |

---

### Zona Fungsional

```
┌────────────────────────────────────────────────────────┐
│  Connected Accounts                    [+ Connect Account] │
├────────────────────────────────────────────────────────┤
│  Instagram                                    Active ✅ │
│  @brandname · Terhubung sejak 2 Jan          [Disconnect]│
├────────────────────────────────────────────────────────┤
│  X (Twitter)                            Disconnected ⚠️ │
│  @brandname · Token kadaluarsa          [Reconnect]     │
├────────────────────────────────────────────────────────┤
│  LinkedIn                                     Active ✅ │
│  Company Page · Terhubung sejak 10 Mar        [Disconnect]│
└────────────────────────────────────────────────────────┘
```

**Zona daftar akun:** Setiap akun menampilkan platform, username/nama halaman, status koneksi, dan tanggal dihubungkan. Aksi tersedia sesuai status.

**Zona CTA Connect:** Di atas daftar — tersedia kapanpun, tidak perlu scroll.

---

### Pola: Connect Account Flow

```
[+ Connect Account]
    ↓
Tampilkan daftar platform: Instagram, Facebook, X, LinkedIn, dll.
    ↓
Pengguna memilih platform
    ↓
Buka OAuth flow platform (dibuka di tab/popup baru atau redirect)
    ↓
Pengguna login ke akun platform + berikan izin
    ↓
Kembali ke Connected Accounts
    ↓
Akun baru muncul dengan status Active
```

Langkah antara klik "Connect" dan halaman OAuth platform harus seminimal mungkin — tidak ada form tambahan yang tidak diperlukan. (UXP-03)

---

### Pola: Reconnect Flow

```
Akun berstatus Disconnected
    ↓
[Reconnect] diklik
    ↓
OAuth flow diulang untuk akun tersebut
    ↓
Setelah berhasil → status kembali Active
    ↓
Post yang sudah terjadwal untuk akun ini tetap di antrean
```

Post terjadwal **tidak otomatis dibatalkan** ketika akun disconnect. Mereka tetap di Queue dan akan terkirim setelah akun kembali Active. (UF-05 Alternate Path)

---

### State Handling

| State | Tampilan |
| ----- | -------- |
| Ada akun aktif | Daftar akun dengan status Active |
| Ada akun disconnect | Akun Disconnected ditampilkan dengan visual berbeda + tombol Reconnect |
| Tidak ada akun sama sekali | Empty state: _"Belum ada akun terhubung"_ + CTA Connect Account yang menonjol |
| OAuth sedang berjalan | Indikator loading pada akun yang sedang dalam proses connect |
| OAuth gagal | Pesan error + opsi untuk mencoba ulang |

---

---

# Decision Log

Keputusan desain yang dibuat dalam dokumen ini.

| ID | Keputusan | Alasan | Prinsip |
| -- | --------- | ------ | ------- |
| KSP-D01 | Home adalah layar orientasi, bukan dashboard kerja — tidak ada aksi berat yang diselesaikan di sini | Home melayani kebutuhan visibility Maya tanpa memaksa Raka melewatinya (IA-D03) | UXP-02, UXP-03 |
| KSP-D02 | Draft Editor memiliki dua zona: kiri (Caption + Media) dan kanan (Account, Schedule, Actions) | Pemisahan ini memungkinkan Raka fokus menulis di kiri sambil konfigurasi publish di kanan — alur linear dari kiri ke kanan | UXP-01, UXP-03 |
| KSP-D03 | AI Assist tampil sebagai trigger di dalam Caption Editor, bukan panel terpisah yang dibuka secara sengaja | AI paling berguna saat muncul tepat di momen penulisan, bukan sebagai destinasi navigasi (UXP-05, I-06) | UXP-05 |
| KSP-D04 | Account Selector menampilkan akun Disconnected — tidak disembunyikan | Pengguna harus melihat masalah di titik keputusan, bukan setelah post gagal | UXP-04 |
| KSP-D05 | Confirmation summary muncul sebelum tombol Schedule dieksekusi | Membangun kepercayaan bahwa konten akan terbit ke akun dan waktu yang benar (UXP-04) | UXP-04 |
| KSP-D06 | Engage Inbox menggunakan master-detail (thread list + thread detail di panel kanan) | Volume triage tinggi; pengguna perlu berpindah thread tanpa full-page navigation (NP-D03) | UXP-03 |
| KSP-D07 | Analytics Dashboard menampilkan Summary Row sebagai zona teratas | Maya membaca angka agregat pertama — bukan tabel detail yang mengharuskan scanning panjang | UXP-02, UXP-03 |
| KSP-D08 | Empty state Analytics menampilkan dua CTA, bukan angka nol atau grafik kosong | Angka nol atau grafik tanpa data misleading dan tidak membantu; CTA mengarahkan ke aksi yang bermakna (UXD-03) | UXP-03 |
| KSP-D09 | Post terjadwal tidak dibatalkan otomatis saat akun disconnect | Pembatalan otomatis lebih merusak daripada membiarkan post dalam antrean dan menunggu reconnect | UXP-04 |
| KSP-D10 | Publish History tidak masuk daftar 8 layar kritis | History adalah layar review passif — polanya sederhana (daftar + detail) dan tidak memerlukan dokumentasi mendalam di fase ini | UXP-03 |
| KSP-D11 | Start Page tidak masuk daftar 8 layar kritis | Start Page bukan bagian dari siklus kerja harian (UXP-01: Draft → Schedule → Publish → Engage → Review). Start Page adalah fitur konfigurasi yang diakses sesekali — bukan setiap sesi kerja. Polanya sederhana: form pengaturan + preview publik. Tidak ada pola koordinasi tim atau alur multi-langkah yang perlu didokumentasikan mendalam di fase ini. | UXP-01, UXP-03 |

---

# Ringkasan Pola per Layar

| Layar | Pola Utama | State Kritis |
| ----- | ---------- | ------------ |
| KSP-01 Home | 4 zona informatif + deep link | Failed post di Recent Activity |
| KSP-02 Calendar | Grid per hari × waktu + klik → Editor | Item Failed, Disconnected warning |
| KSP-03 Queue | Daftar linear berurutan + filter | Item Failed, Queue kosong |
| KSP-04 Drafts | Daftar draft + CTA New Post | Drafts kosong |
| KSP-05 Draft Editor | Dua zona (Caption / Konfigurasi) + AI inline + Confirmation Summary | Akun Disconnected, Status Failed |
| KSP-06 Inbox | Master-detail (thread list + thread detail inline) | Badge → Unread, Inbox kosong |
| KSP-07 Dashboard | Summary Row + Account Overview + Post Performance | Empty state (belum ada data) |
| KSP-08 Connected Accounts | Daftar akun + status + aksi kontekstual | Disconnected → Reconnect |

---

# Traceability ke UX Principles

| Prinsip | Layar yang Menerapkan |
| ------- | --------------------- |
| UXP-01 — Satu Siklus | KSP-02, KSP-03, KSP-04, KSP-05, KSP-06 |
| UXP-02 — Dua Mode Kerja | KSP-01, KSP-02, KSP-07 |
| UXP-03 — Simplisitas Quality Bar | KSP-01, KSP-03, KSP-04, KSP-05, KSP-06, KSP-07, KSP-08 |
| UXP-04 — Publishing Trust | KSP-02, KSP-03, KSP-05, KSP-08 |
| UXP-05 — AI Menempel pada Pekerjaan | KSP-05 |
| UXP-06 — Status Jelas, Proses Ringan | KSP-02, KSP-03, KSP-04, KSP-05, KSP-06, KSP-08 |
| UXP-07 — Nilai Bertambah Seiring Siklus | KSP-01, KSP-07 |

---

# Expected Output

Setelah dokumen ini selesai, project harus memiliki:

* Pola fungsi kritis untuk 8 layar utama produk.
* Fungsi wajib per layar yang terdokumentasi dengan ID.
* Zona fungsional per layar yang dapat dijadikan acuan arsitektur dan development.
* State handling yang terdokumentasi untuk kondisi kritis.
* Decision log yang dapat ditelusuri ke UX Principles.
* Input yang siap untuk Architecture Discovery (M5).

---

# Exit Criteria

Key Screen Patterns dianggap selesai apabila:

* Seluruh layar kritis (8 layar) telah terdokumentasi.
* Setiap layar memiliki Critical Functions yang teridentifikasi dengan ID.
* Setiap layar memiliki zona fungsional yang terdefinisi.
* State kritis (empty, error, disconnected) terdokumentasi untuk setiap layar.
* Setiap keputusan desain dapat ditelusuri ke UX Principles.
* Tidak ada keputusan yang bertentangan dengan Product Baseline v1.0 atau Navigation Patterns.

---

# Related Documents

* `README.md`
* `ux-principles.md`
* `information-architecture.md`
* `user-flows.md`
* `navigation-patterns.md`
* `../02-product/feature-modules.md`
* `../02-product/mvp-definition.md`
* `../02-product/feature-priority.md`
* `../03-user/user-personas.md`
* `../03-user/user-journey.md`
* `../03-user/insights.md`
* `../../project-manager/PROJECT_STATE.md`
* `../../project-manager/DECISIONS.md`
