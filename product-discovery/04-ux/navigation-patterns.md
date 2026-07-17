# Navigation Patterns

Dokumen ini mendefinisikan **model navigasi dan pola perpindahan layar** pada produk **Social Media Management**.

Navigation Patterns dibangun di atas Information Architecture yang sudah ditetapkan. Dokumen ini tidak mendefinisikan layout visual atau komponen UI — melainkan menjelaskan logika bagaimana pengguna bergerak antar bagian, bagaimana konteks dipertahankan, dan kapan perpindahan layar terjadi.

---

# Overview

Navigation Patterns mendefinisikan tiga hal utama:

1. **Model navigasi** — pola struktural yang digunakan (sidebar persisten, sub-nav, dll.).
2. **Pola perpindahan layar** — bagaimana transisi terjadi antara satu layar ke layar lain.
3. **Pola navigasi kontekstual** — navigasi yang muncul dalam respons terhadap aksi pengguna.

Dokumen ini menjadi acuan untuk Key Screen Patterns dan Architecture Discovery.

---

# Prinsip Navigation Patterns

Navigation Patterns di produk ini dibangun berdasarkan tiga prinsip IA yang sudah ditetapkan.

## NP-P01 — Navigasi Selalu Dapat Diakses

**Turunan dari:** UXP-01, P-IA-01

Primary navigation selalu terlihat dan dapat diakses dari posisi manapun dalam aplikasi. Pengguna tidak pernah "terjebak" dalam sebuah layar tanpa jalur kembali ke bagian lain.

---

## NP-P02 — Perpindahan Konteks Harus Eksplisit

**Turunan dari:** UXP-04, UXP-03

Ketika pengguna akan berpindah dari satu section ke section lain (misalnya dari Draft Editor ke Workspace Settings), perpindahan tersebut harus terasa sebagai keputusan sadar — bukan sebagai konsekuensi tidak terduga dari aksi lain.

Konteks pekerjaan yang sedang dikerjakan tidak boleh hilang secara tiba-tiba karena navigasi yang tidak disengaja.

---

## NP-P03 — Kedalaman Dua Level, Tidak Lebih

**Turunan dari:** P-IA-03, UXP-03

Navigasi maksimal dua level: **primary section → sub-screen**. Tidak ada nested navigation yang memaksa pengguna menggali lebih dari dua level untuk mencapai fitur inti.

---

# Model Navigasi Utama

Produk menggunakan model **Persistent Sidebar Navigation** untuk web.

```
┌─────────────────────────────────────────────────────┐
│  Workspace Selector                                  │
├─────────────────────────────────────────────────────┤
│  [Sidebar]          │  [Main Content Area]           │
│                     │                                │
│  • Home             │  Konten layar aktif            │
│  • Publish          │  berubah sesuai                │
│  • Engage  [badge]  │  navigasi yang dipilih         │
│  • Analyze          │                                │
│  • Start Page       │                                │
│                     │                                │
├─────────────────────┤                                │
│  Notifications      │                                │
│  User Avatar        │                                │
└─────────────────────────────────────────────────────┘
```

**Karakteristik model ini:**

- Sidebar selalu terlihat — pengguna tidak perlu kembali ke halaman awal untuk berpindah section.
- Main Content Area menampilkan konten layar aktif — berganti sesuai item yang dipilih di sidebar.
- Tidak ada full-page reload saat berpindah section (navigasi client-side).
- Sidebar tidak menyembunyikan dirinya sendiri secara otomatis; pengguna yang mengontrol apakah sidebar di-collapse atau tidak (Should Have untuk pengalaman yang lebih lebar).

---

# Primary Navigation Pattern

## Struktur Sidebar

Primary navigation terdiri dari dua zona vertikal:

```
┌──────────────────────┐
│  Workspace Selector  │  ← selalu di atas
├──────────────────────┤
│  Home                │
│  Publish             │  ← navigation items
│  Engage   [badge]    │
│  Analyze             │
│  Start Page          │
├──────────────────────┤
│  Notifications       │  ← utilitas
│  User Avatar         │  ← selalu di bawah
└──────────────────────┘
```

**Zona atas:** Workspace Selector — menampilkan nama workspace aktif; klik membuka panel ganti workspace atau Workspace Settings.

**Zona tengah:** 5 navigation items — Home, Publish, Engage, Analyze, Start Page. Urutan mencerminkan alur nilai produk (UXP-07): Publishing reliability → Engagement triage → Analytics snapshot.

**Zona bawah:** Notifications icon dan User Avatar — akses ke secondary navigation. Selalu tersedia tanpa scrolling.

---

## Active State dan Visual Feedback

- Item navigasi aktif ditandai secara visual (highlight / indicator) — pengguna selalu tahu posisi mereka.
- **Engage** memiliki notification badge yang menampilkan jumlah interaksi unread — terlihat dari section manapun (mendukung UF-04 Alternate Path).
- Tidak ada loading state yang memblokir sidebar — sidebar tetap interaktif saat konten dimuat.

---

## Workspace Selector

```
Workspace Selector
├── Nama workspace aktif (ditampilkan)
├── [Klik] → Dropdown:
│   ├── Daftar workspace yang dimiliki user
│   ├── Create New Workspace
│   └── Workspace Settings → (langsung ke Workspace Settings)
```

Workspace Selector adalah titik masuk ke Workspace Settings — bukan item di primary nav. Ini sesuai dengan IA-D05 (Workspace Settings di luar primary nav).

---

# Secondary Navigation Pattern

Secondary navigation diakses melalui elemen di zona bawah sidebar — tidak menggunakan slot primary nav.

## Notifications

```
Notifications icon → Notifications Panel (overlay / drawer)
├── Daftar notifikasi in-app berurutan waktu
├── Mark as read
└── Link ke item terkait (post, akun, dll.)
```

Notifications Panel muncul sebagai overlay atau drawer — tidak menggantikan Main Content Area. Pengguna dapat menutupnya dan kembali ke pekerjaan yang sedang dikerjakan.

---

## User Settings

```
User Avatar → User Menu (dropdown)
├── Profile
├── Notifications Settings
├── Preferences
└── Logout
```

User Menu muncul sebagai dropdown kecil — akses ke halaman User Settings dilakukan dari sini. Ini bukan layar kerja harian sehingga tidak memerlukan slot di primary nav.

---

# In-Section Navigation Pattern

Beberapa section memiliki sub-navigasi di dalam Main Content Area untuk memindahkan pengguna antar sub-screen.

## Publish — Tab Navigation

Publish adalah section terbesar dengan empat sub-screen:

```
Publish
├── [Calendar]  [Queue]  [Drafts]  [History]  ← tab bar di atas main content
│
└── Main Content Area menampilkan konten sub-screen aktif
```

**Pola:** Horizontal tab bar tepat di bawah header section. Tab yang aktif terlihat jelas. Pergantian tab tidak me-reset state (filter, scroll position) antar tab kecuali diperlukan.

**Default tab:** Calendar — sesuai IA-D04. Raka masuk ke Publish dan langsung melihat overview jadwal minggu berjalan.

---

## Engage — Single Screen

Engage hanya memiliki satu layar: Inbox. Tidak ada tab navigation di dalam Engage.

```
Engage
└── Inbox  ← langsung tampil tanpa sub-navigasi tambahan
```

---

## Analyze — Single Screen

Analyze hanya memiliki satu layar: Dashboard. Tidak ada tab navigation; navigasi internal menggunakan filter inline (per akun, per periode).

```
Analyze
└── Dashboard  ← langsung tampil; filter diakses inline di dalam dashboard
```

---

## Start Page — Single Screen

Start Page tidak memiliki sub-navigasi; Page Editor, Preview, dan Share adalah elemen dalam satu layar yang sama.

---

# Contextual Navigation Pattern

Contextual navigation terjadi ketika pengguna mengklik elemen dalam layar yang membawa mereka ke layar lain dengan konteks yang dibawa.

## Pola: Item → Editor

Terjadi di Publish. Klik satu item membuka Draft Editor untuk item tersebut.

```
Publish → Calendar  → [klik item]  → Draft Editor (item X)
Publish → Queue     → [klik item]  → Draft Editor (item X)
Publish → Drafts    → [klik item]  → Draft Editor (item X)
Publish → Drafts    → [New Post]   → Draft Editor (item baru)
```

**Transisi:** Draft Editor ditampilkan sebagai **panel atau layar penuh dalam section Publish** — bukan sebagai modal overlay di atas Calendar. Sidebar tetap terlihat sehingga pengguna dapat keluar dari Publish jika diperlukan.

**Kembali:** Tombol "Back" atau "Close" di Draft Editor mengembalikan pengguna ke sub-screen asal (Calendar / Queue / Drafts).

---

## Pola: New Post CTA dari Calendar dan Queue

Terjadi ketika pengguna sedang melihat Calendar atau Queue dan ingin langsung membuat konten baru tanpa berpindah ke tab Drafts terlebih dahulu.

```
Publish → Calendar  → [New Post]  → Draft Editor (item baru)
Publish → Queue     → [New Post]  → Draft Editor (item baru)
```

**Trigger:** CTA "New Post" tersedia langsung di layar Calendar dan Queue — bukan hanya di Drafts.

**Konteks penggunaan:**
- Raka melihat Calendar dan menemukan gap jadwal di hari tertentu → klik New Post langsung dari Calendar untuk mengisi gap tersebut.
- Raka memindai Queue dan ingin menambah konten ke antrean tanpa berganti tab.

**Transisi:** Identik dengan New Post dari Drafts — Draft Editor kosong dibuka dalam section Publish. Sub-screen asal (Calendar atau Queue) menjadi tujuan tombol Back.

**Kembali:** Tombol "Back" atau "Close" di Draft Editor mengembalikan ke Calendar atau Queue (sesuai sub-screen asal).

---

## Pola: Thread Expansion

Terjadi di Engage. Klik satu thread membuka detail thread di dalam Inbox — tidak membuka layar baru.

```
Engage → Inbox → [klik thread]  → Thread detail muncul di panel kanan / inline
                                   (sidebar tetap terlihat, Inbox tetap terlihat di kiri)
```

**Alasan:** Volume triage engagement tinggi — pengguna perlu berpindah cepat antar thread tanpa full-page navigation setiap kali.

---

## Pola: Status Indicator → Settings

Terjadi ketika pengguna menemukan status masalah di layar kerja dan perlu ke Settings untuk memperbaikinya.

```
Calendar / Queue / Account Selector → status "Disconnected" atau "Failed"
    → [klik indikator / pesan error]
    → Workspace Settings → Connected Accounts
```

**Transisi:** Navigasi langsung ke Settings — bukan sidebar manual. Pesan error menyertakan tautan aksi ("Reconnect") yang langsung membawa pengguna ke halaman yang tepat.

**Kembali:** Setelah reconnect selesai, pengguna dapat kembali ke Calendar/Queue secara manual melalui sidebar — tidak ada redirect otomatis karena state Calendar mungkin sudah berubah.

---

## Pola: Empty State → Onboarding Action

Terjadi di layar yang belum memiliki data.

```
Analyze → Dashboard (kosong)
    → "Connect Account" → Workspace Settings → Connected Accounts (UF-05)
    → "Create First Post" → Publish → Drafts → New Post (UF-01)

Engage → Inbox (kosong)
    → "Start publishing to see engagement" → Publish → Drafts

Publish → History (kosong)
    → "You haven't published anything yet" → Publish → Drafts → New Post
```

**Pola yang konsisten:** Setiap empty state menyertakan satu atau dua tautan aksi — tidak ada dead end. Pengguna selalu tahu langkah berikutnya (UXD-03).

---

# Notification Badge Pattern

Notification badge pada item Engage di sidebar menginformasikan pengguna bahwa ada interaksi baru — tanpa mengganggu alur pekerjaan yang sedang berjalan.

```
Badge behavior:
├── Muncul: ketika ada interaksi unread baru di Inbox
├── Angka: menampilkan jumlah unread (cap di angka 99+)
├── Hilang: ketika semua item di Inbox ditandai Done atau dibuka
└── Tetap terlihat dari section manapun (sidebar persisten)
```

**Prinsip:** Badge hanya ada pada Engage — sesuai dengan fokus produk pada siklus kerja. Tidak ada badge pada Analytics atau Publish karena kedua section tersebut bukan "inbox" yang menuntut respons segera.

---

# Cross-Section Navigation Pattern

Beberapa user flow melibatkan perpindahan antar section yang dipicu oleh tautan atau aksi — bukan navigasi sidebar manual.

## Deep Link ke Sub-Screen

Beberapa aksi membawa pengguna langsung ke sub-screen tertentu, melewati default tab.

```
Home → Analytics Snapshot → [klik]  → Analyze → Dashboard
Home → Today's Schedule   → [klik item]  → Publish → Calendar → Draft Editor (item)
Empty State Analytics     → [Create First Post]  → Publish → Drafts → Draft Editor (baru)
```

**Prinsip:** Deep link hanya digunakan untuk aksi yang bermakna — bukan sebagai navigasi pengganti sidebar. Pengguna harus masih bisa mencapai tujuan yang sama melalui sidebar secara manual.

---

## Navigasi Balik Setelah Cross-Section

Ketika pengguna tiba di section baru melalui cross-section navigation (misalnya dari Calendar error → Workspace Settings), tidak ada tombol "back" otomatis yang mengembalikan ke posisi sebelumnya.

**Alasan:** Terlalu kompleks untuk ditangani di level navigasi tanpa history stack yang jelas. Pengguna menggunakan sidebar untuk navigasi kembali.

**Pengecualian:** Draft Editor selalu memiliki tombol kembali ke sub-screen asal di dalam section Publish — karena perpindahan ini bersifat drill-down dalam section yang sama.

---

# Decision Log

Keputusan navigasi yang dibuat dalam dokumen ini.

| ID | Keputusan | Alasan | Prinsip |
| -- | --------- | ------ | ------- |
| NP-D01 | Model navigasi: Persistent Sidebar | Web app; sidebar memberikan akses cepat antar section tanpa kehilangan konteks | UXP-01, NP-P01 |
| NP-D02 | Draft Editor ditampilkan sebagai panel/layar penuh dalam Publish, bukan modal overlay | Modal menutupi Calendar/Queue; pengguna kehilangan konteks jadwal saat mengedit | NP-P02, UXP-04 |
| NP-D03 | Thread Inbox: inline expansion, bukan layar baru | Volume triage tinggi; pengguna perlu berpindah thread dengan cepat tanpa full-page nav | UXP-03, NP-P03 |
| NP-D04 | Notification badge hanya pada Engage | Hanya Engage yang memerlukan respons segera; badge di semua section menambah noise | UXP-03, UXP-07 |
| NP-D05 | Tidak ada redirect otomatis setelah cross-section navigation | State layar asal mungkin sudah berubah; redirect otomatis menciptakan kebingungan | NP-P02 |
| NP-D06 | Publish default ke tab Calendar | Calendar memberi overview jadwal terbaik untuk Raka dan Maya (IA-D04) | UXP-02, P-IA-02 |
| NP-D07 | Workspace Selector sebagai entry point ke Workspace Settings | Workspace Settings bukan akses harian; tidak perlu slot di primary nav (IA-D05) | UXP-03 |
| NP-D08 | Notifications Panel sebagai overlay, bukan pengganti Main Content Area | Pengguna harus bisa menutup panel dan kembali ke pekerjaan tanpa kehilangan state | NP-P02 |
| NP-D09 | New Post CTA tersedia langsung dari Calendar dan Queue, bukan hanya dari Drafts | Raka sering menemukan gap jadwal saat melihat Calendar atau Queue — memaksanya berpindah ke tab Drafts dulu menambah friction yang tidak perlu. CTA langsung di titik penemuan kebutuhan selaras dengan alur siklus kerja (UXP-01) | UXP-01, UXP-03 |

---

# Ringkasan Pola

| Konteks | Pola | Transisi |
| ------- | ---- | -------- |
| Berpindah section (Home, Publish, dll.) | Klik sidebar item | Ganti konten Main Content Area |
| Berpindah sub-screen dalam Publish | Klik tab (Calendar / Queue / Drafts / History) | Ganti konten dalam section Publish |
| Buka item dari Calendar / Queue / Drafts | Klik item | Buka Draft Editor (panel/fullscreen dalam Publish) |
| Buat post baru dari Calendar atau Queue | Klik CTA "New Post" | Buka Draft Editor kosong; Back kembali ke sub-screen asal |
| Buka thread dari Inbox | Klik thread | Expand inline panel kanan dalam Inbox |
| Akses Workspace Settings | Klik Workspace Selector → dropdown | Navigasi ke Workspace Settings |
| Akses User Settings | Klik User Avatar → dropdown | Navigasi ke User Settings |
| Buka Notifications | Klik Notifications icon | Buka Notifications Panel (overlay) |
| Error status → Settings | Klik indikator error / tautan aksi | Navigasi ke Workspace Settings → Connected Accounts |
| Empty state → aksi pertama | Klik CTA di empty state | Navigasi ke section / sub-screen terkait |

---

# Expected Output

Setelah dokumen ini selesai, project harus memiliki:

* Model navigasi utama yang terdefinisi (Persistent Sidebar Navigation).
* Pola primary, secondary, dan in-section navigation yang konsisten.
* Pola contextual navigation untuk semua drill-down kritis (Item → Editor, Thread, Error → Settings).
* Notification badge behavior yang jelas.
* Cross-section navigation yang terdokumentasi.
* Decision log yang dapat ditelusuri ke UX Principles dan IA Decisions.

---

# Exit Criteria

Navigation Patterns dianggap selesai apabila:

* Model navigasi utama telah terdefinisi dan selaras dengan IA.
* Setiap pola perpindahan layar kritis sudah terdokumentasi.
* Tidak ada navigasi yang memerlukan lebih dari dua level.
* Setiap keputusan navigasi dapat ditelusuri ke UX Principles.
* Tidak ada user flow (UF-01 hingga UF-06) yang membutuhkan pola navigasi yang belum terdokumentasi di sini.

---

# Related Documents

* `README.md`
* `ux-principles.md`
* `information-architecture.md`
* `user-flows.md`
* `key-screen-patterns.md`
* `../02-product/feature-modules.md`
* `../02-product/mvp-definition.md`
* `../03-user/user-personas.md`
* `../03-user/user-journey.md`
* `../03-user/insights.md`
* `../../project-manager/PROJECT_STATE.md`
* `../../project-manager/DECISIONS.md`
