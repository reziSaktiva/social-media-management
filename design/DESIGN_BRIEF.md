---
title: Design Brief — Social Media Management
version: 1.1.0
date: 2026-07-24
audience: Product / UX / UI / Design System
---

# Design Brief

**Social Media Management**

| | |
| --- | --- |
| **Document** | Design Brief (Product UX Map + Design System Blueprint) |
| **Version** | 1.1.0 |
| **Date** | 24 July 2026 |
| **Audience** | Product Designer · UX Designer · UI Designer · Design System |
| **Status** | Ready for design kickoff — foundations already live in Claude Design |
| **Language** | Bahasa Indonesia (UI copy) |

---

## Cover — Cara memakai dokumen ini

Dokumen ini adalah **paket handoff resmi untuk tim desain**. Isinya merangkum produk, pengguna, navigasi, layar kritis, dan kerangka design system yang sudah diputuskan di product discovery — dan sudah direalisasikan sebagai project di **Claude Design** (ADR-042, menggantikan Figma).

| Field | Value |
| ----- | ----- |
| Project | `Social Media Management` |
| Project ID | `84aded99-bb23-49b1-be9f-dd8f21c6873e` |
| Akses | claude.ai/design (login akun yang sama dengan Claude Code) |

### Yang diharapkan dari designer

1. Baca **Bagian A** sebelum melanjutkan UI — pahami produk & constraint UX.
2. Buka project Claude Design dan lanjutkan fondasi mengikuti **Bagian B** (token, komponen, pola) — struktur foundations/components sudah ada, bukan kanvas kosong.
3. **8 layar kritis (KSP-01–KSP-08)** sudah ada sebagai halaman `templates/` — lanjutkan/ubah langsung di sana.
4. Isi keputusan visual yang masih terbuka di **B.6 Open Decisions**, lalu diskusikan untuk di-lock.

### Yang sudah dikunci vs yang masih terbuka

| Dikunci (jangan diubah tanpa diskusi) | Terbuka untuk eksplorasi designer |
| ------------------------------------- | --------------------------------- |
| Primary navigation & urutannya | Brand color, wordmark, type pairing |
| Persona & dua mode kerja (eksekusi / visibilitas) | Light-only vs dark (preferensi: light MVP) |
| 6 content status + makna visual `Failed` | Illustration style untuk empty state |
| AI hanya inline di Draft Editor (bukan menu) | Kekuatan warna platform di Calendar |
| Content Format per akun (ADR-039) + tidak ada Approval Workflow di MVP | Detail visual komponen & motion |

### Struktur project Claude Design (sudah dibuat)

| Bagian dokumen ini | Sudah ada di Claude Design sebagai |
| ------------------- | ----------------------------------- |
| Bagian A.1–A.5 (Product UX Map) | Konteks kerja — acuan saat mengisi `templates/` |
| Bagian B.2 (Token Foundations) | `theme.json`, `styles.css`, `foundations/color.html`, `foundations/type.html`, `foundations/layout.html` |
| Bagian B.3 (Component Inventory) | `components/buttons.html`, `status-chips.html`, `forms.html`, `cards.html`, `navigation.html`, `table.html`, `dialog.html` |
| KSP-01 s/d KSP-08 | `templates/home.html` … `templates/settings-connected-accounts.html` |

Token saat ini masih **interim/neutral**, bukan brand final — lihat `readme.md` project untuk rasionalnya. Project lama bernama **"Modernist"** di akun yang sama bukan milik product ini.

Update terprogram bisa lewat Claude Code (tool `DesignSync`) — minta "sync ke Claude Design" di chat; sinkronisasi bersifat manual/on-request, bukan otomatis (ADR-042).

### Catatan penting

Dokumen ini adalah **ringkasan operasional untuk desain**, bukan pengganti baseline produk lengkap. Jika desain di Claude Design bertentangan dengan keputusan UX yang sudah dikunci, **baseline produk yang menang** — kecuali perubahan disepakati bersama.

---

# Bagian A — Product UX Map

## A.1 Product Snapshot

| Item | Ringkasan |
| ---- | --------- |
| Produk | Platform web Social Media Management — satu dashboard untuk siklus konten |
| Analogi kompetitor | Alternatif modern Buffer; fokus sederhana, cepat, dapat dipercaya |
| Primary users | Marketing Team |
| Secondary users | Startup, Digital Agency |
| Nilai inti MVP | Draft → Schedule → Publish → Engage → Review dalam satu tempat |
| Integrasi sosial | Via Outstand (designer tidak perlu mendesain native API; fokus pada connected accounts & status publish) |

**Siklus kerja yang harus terasa di UI (UXP-01):**

```text
Draft → Schedule → Publish → Engage → Analyze
```

Navigasi utama mencerminkan siklus ini, bukan daftar modul teknis.

---

## A.2 Personas & Modes

Designer harus selalu sadar **dua mode kerja** (UXP-02) — satu UI, dua kebutuhan:

| Persona | Peran | Mode | Butuh dari UI |
| ------- | ----- | ---- | ------------- |
| **Maya** | Marketing Manager (buyer) | Visibilitas | Status konten sekilas, Home, Calendar overview, Analytics snapshot |
| **Raka** | Social Media Manager (daily user P0) | Eksekusi | Publish cepat, Draft Editor, Queue, Inbox, AI caption inline |
| **Sinta** | Content Creator / Copywriter | Produksi draft | Drafts, status handoff (`In Review` / `Ready to Schedule`), tanpa schedule/publish penuh |
| **Dimas** | Agency Operator *(secondary)* | Multi-client | Workspace switch yang jelas |
| **Lara** | Founder/startup *(secondary)* | Lean ops | Alur singkat, onboarding ringan |

**Implikasi desain:**

* Jangan buat dua produk terpisah untuk Maya vs Raka.
* Calendar & status harus “scannable” untuk Maya, sekaligus actionable untuk Raka.
* Creator (Sinta) melihat status kolaborasi tanpa approval workflow berlapis (UXP-06).

### Roles di UI (workspace)

| Role | Fokus desain permission |
| ---- | ----------------------- |
| Owner | Full control termasuk billing & transfer ownership |
| Admin | Operasional penuh kecuali hapus workspace / transfer owner |
| Manager | Jadwal, publish, koordinasi Creator |
| Creator | Buat/edit draft (milik sendiri); **tidak** schedule/publish langsung |

---

## A.3 UX Principles (filter keputusan visual)

Setiap pilihan UI harus bisa lolos filter ini:

| ID | Prinsip | Artinya untuk designer |
| -- | ------- | ---------------------- |
| UXP-01 | Satu siklus, bukan kumpulan fitur | Jangan pecah publishing jadi “app dalam app”; transisi antar tahap terasa natural |
| UXP-02 | Dua mode: eksekusi & visibilitas | Status selalu terlihat di permukaan; overview tanpa drill-down dalam |
| UXP-03 | Simplisitas = quality bar | Kurangi cognitive load; default state langsung ke pekerjaan relevan |
| UXP-04 | Publishing trust | Konfirmasi akun & jadwal jelas; Failed tidak boleh bisa diabaikan |
| UXP-05 | AI menempel pada pekerjaan | AI hanya di Draft Editor (inline) — **tidak ada menu AI** di sidebar |
| UXP-06 | Status jelas, proses ringan | Chip/status terlihat di list; bukan approval berlapis |
| UXP-07 | Nilai bertambah seiring siklus | Onboarding fokus Publish; Engage/Analyze mudah diakses tapi tidak membebani hari pertama |

---

## A.4 Information Architecture & Navigation

### Primary navigation (urutan wajib)

| # | Label | Fungsi |
| - | ----- | ------ |
| 1 | Home | Orientasi status (bukan layar kerja berat) |
| 2 | Publish | Area kerja harian (Calendar default) |
| 3 | Engage | Inbox interaksi (+ badge unread) |
| 4 | Analyze | Dashboard performa |
| 5 | Start Page | Link-in-bio / halaman publik |

### Yang tidak boleh jadi item primary nav

* AI Assistant
* Media Library (masuk dari Draft Editor)
* Approval Workflow (tidak ada di MVP)

### Model shell (web)

```text
┌─────────────────────────────────────────────────────┐
│  Workspace Selector                                  │
├──────────────────────┬──────────────────────────────┤
│  Sidebar             │  Main Content                 │
│  • Home              │  Layar aktif                  │
│  • Publish           │                               │
│  • Engage  [badge]   │                               │
│  • Analyze           │                               │
│  • Start Page        │                               │
├──────────────────────┤                               │
│  Notifications       │                               │
│  User Avatar         │                               │
└──────────────────────┴──────────────────────────────┘
```

* Persistent sidebar; active state selalu jelas.
* Secondary: Workspace Settings (via selector), User Settings (via avatar), Notifications (icon).
* Max depth: **primary section → sub-screen**.

### Hierarki ringkas per section

```text
Home
├── Today's Schedule
├── Recent Activity
├── Engagement Snapshot
└── Analytics Snapshot

Publish
├── Calendar          ← default tab
├── Queue
├── Drafts → Draft Editor (AI inline, media, accounts, content format, schedule, status)
└── History → Post Detail

Engage
└── Comments Inbox → Last Sync + Manual Refresh → Comment Thread → Reply

Analyze
└── Dashboard (account / post / engagement summary)

Start Page
├── Page Editor
├── Preview
└── Share

Workspace Settings (secondary)
├── General · Connected Accounts · Members · Roles · Billing
```

---

## A.5 Key Screens Map (8 layar kritis)

Sudah direpresentasikan sebagai 8 halaman `templates/` di project Claude Design.

| ID | Layar | Pengguna utama | Prioritas desain |
| -- | ----- | -------------- | ---------------- |
| KSP-01 | Home | Maya | Scannable status; deep link ke section kerja |
| KSP-02 | Publish — Calendar | Raka + Maya | Default Publish; status per item; Failed mencolok |
| KSP-03 | Publish — Queue | Raka | Antrean sehat / gap terlihat |
| KSP-04 | Publish — Drafts | Raka / Sinta | List + filter status; masuk ke editor |
| KSP-05 | Publish — Draft Editor | Raka / Sinta | Caption, AI, media, akun, **format Post/Reel/Story/Pin per akun** (ADR-039), jadwal, trust |
| KSP-06 | Engage — Comments Inbox | Raka | Triage komentar; last sync; manual refresh; badge setelah sync; thread + reply |
| KSP-07 | Analyze — Dashboard | Maya + Raka | Snapshot, bukan BI kompleks |
| KSP-08 | Connected Accounts | Raka / Maya | Connect / reconnect / disconnect jelas |

### Content status (bahasa visual wajib)

Status kanonikal yang harus punya treatment visual konsisten di seluruh produk:

| Status | Arti singkat | Catatan desain |
| ------ | ------------ | -------------- |
| `Draft` | Sedang dibuat | Netral |
| `In Review` | Menunggu tinjauan ringan | Koordinasi — bukan “blocked approval” |
| `Ready to Schedule` | Siap dijadwalkan | Positif ringan |
| `Scheduled` | Sudah masuk jadwal | Trust / confirmed |
| `Published` | Sudah terbit | Success |
| `Failed` | Gagal publish | **Highest urgency** — tidak boleh samar |

Creator tidak bisa langsung `Draft` → `Scheduled`. Manager/Admin/Owner bisa skip review jika konteks tim mengizinkan.

---

## A.6 Alur kerja yang wajib dipahami designer

| Flow | Siapa | Inti |
| ---- | ----- | ---- |
| Create & Publish | Raka (+ Sinta draft) | Draft Editor → akun + format + jadwal → schedule/publish → status |
| Content Calendar | Raka + Maya | Lihat minggu → buka item → edit |
| Queue Management | Raka | Isi antrean, deteksi gap |
| Engagement | Raka | Periodic pull 30 menit / manual refresh → komentar → reply → done |
| Analytics | Maya | Dashboard periode → drill ke post bila perlu |

---

**Batas Engagement MVP (ADR-040):** desain KSP-06 hanya mencakup komentar dan reply. Jangan membuat tab, composer, atau state untuk Direct Message maupun mention, dan jangan menggambarkan badge sebagai webhook/real-time. Tampilkan waktu sinkronisasi terakhir, state refresh, serta kegagalan refresh tanpa menghilangkan data lama.

# Bagian B — Design System Blueprint

Bagian ini adalah **kerangka design system**, sudah direalisasikan sebagai project Claude Design (lihat Cover). Brand identity (nama final, warna primer, tipografi ekspresif) **belum ditetapkan sebagai baseline** — UX Planning sengaja tidak mendefinisikan visual. Designer melanjutkan mengisi token konkret di project Claude Design, dengan constraint di bawah.

## B.1 Visual Principles (diturunkan dari UX)

| ID | Prinsip visual | Constraint |
| -- | -------------- | ---------- |
| VP-01 | Clarity over decoration | Ornamen tidak boleh mengalahkan status & aksi primer |
| VP-02 | Trust is visible | Konfirmasi akun/jadwal dan state `Failed` selalu conspicuous |
| VP-03 | Density with breathability | Publish/Inbox boleh padat informasi; tetap scannable (bukan dashboard widget-heavy) |
| VP-04 | One job per view | Hindari menumpuk promo, stats, dan aksi sekunder di viewport pertama layar kerja |
| VP-05 | Status before chrome | Chip/status & badge Engage lebih penting dari dekorasi sidebar |
| VP-06 | AI is quiet until needed | AI = kontrol kontekstual di editor; bukan hero section atau nav item |

**Arah yang dihindari (kecuali diputuskan eksplisit nanti):**

* Tema ungu-on-white / purple-to-indigo generik.
* Estetika “cream + serif + terracotta” generik AI.
* Layout koran (hairline rules, zero radius, kolom padat) sebagai default app shell.
* Glow berlebihan, pill cluster, multi-layer shadow sebagai bahasa utama.

---

## B.2 Token Foundations (isi di Claude Design)

### B.2.1 Color — semantic slots (wajib ada)

Tentukan nilai hex/HSL di `styles.css`/`theme.json` pada project Claude Design; yang penting **slot-nya lengkap dan dipakai konsisten**:

| Token group | Slot contoh | Dipakai untuk |
| ----------- | ----------- | ------------- |
| Neutral | `bg/canvas`, `bg/surface`, `bg/subtle`, `border/default`, `text/primary`, `text/secondary`, `text/muted` | Shell, list, form |
| Brand | `brand/primary`, `brand/primary-hover`, `brand/subtle` | CTA utama, active nav *(nilai masih terbuka)* |
| Status | `status/draft`, `status/in-review`, `status/ready`, `status/scheduled`, `status/published`, `status/failed` | Chip status konten |
| Feedback | `feedback/success`, `feedback/warning`, `feedback/danger`, `feedback/info` | Toast, banner, validasi |
| Platform *(opsional)* | warna aksen per jaringan sosial | Hanya sebagai hint kecil — jangan mendominasi UI |

**Aturan:** `status/failed` dan `feedback/danger` harus cukup kontras untuk scannability (UXP-04). Jangan andalkan warna saja — ikon/label teks tetap wajib (aksesibilitas).

### B.2.2 Typography

| Slot | Peran | Catatan |
| ---- | ----- | ------- |
| `font/display` | Brand moments (opsional: login, empty hero Start Page) | Boleh ekspresif; jangan default Inter/Roboto/Arial sebagai identitas |
| `font/sans` | UI product (nav, list, form, captions) | Prioritas keterbacaan & angka tabular untuk waktu/jadwal |
| `font/mono` *(opsional)* | ID teknis, debug — jarang di produk | Jangan untuk caption sosial |

Skala sudah didraft di `foundations/type.html`: `xs · sm · md · lg · xl · 2xl · 3xl` dengan line-height tetap. Caption di Draft Editor butuh nyaman untuk tulisan panjang.

### B.2.3 Spacing, radius, elevation

| Sistem | Rekomendasi awal | Catatan |
| ------ | ---------------- | ------- |
| Spacing | Grid 4px (4 / 8 / 12 / 16 / 24 / 32 / 48) | Konsisten antar list & form |
| Radius | Satu keluarga (mis. 6 / 8 / 12) | Hindari `rounded-full` sebagai default chip/status kecuali badge kecil |
| Elevation | 0–2 level bermakna | Shadow hanya untuk overlay (modal, popover), bukan kartu di mana-mana |
| Layout | Sidebar + main; content max-width opsional di Analyze/Home | Publish Calendar boleh full-bleed area kerja |

### B.2.4 Motion

Minimal 2–3 motion yang disengaja (bukan noise):

1. **Sidebar active indicator** — pindah section terasa jelas.
2. **Status change** — chip berubah saat Draft → Scheduled / Failed.
3. **Inbox badge** — update jumlah unread tanpa mengagetkan.

Hindari parallax, glow pulse berulang, dan animasi yang menunda aksi publish.

---

## B.3 Component Inventory (Claude Design `components/`)

Bangun library dengan prioritas berikut (P0 dulu):

### P0 — dipakai hampir di semua layar

| Komponen | Catatan produk |
| -------- | -------------- |
| App Shell (sidebar + top workspace) | Active state, collapse *(Should Have)* |
| Nav Item + Engage Badge | Badge hanya di Engage |
| Button (primary / secondary / ghost / danger) | Primary = aksi trust (Schedule, Publish, Reply) |
| Icon Button | Notifications, more menus |
| Form fields (text, textarea, select, date-time) | Draft Editor + settings |
| Status Chip | 6 status konten |
| Account Pill / Avatar+platform | Selector akun tujuan |
| List Row (post / queue / inbox) | Scannable: akun, cuplikan, waktu, status |
| Empty State | Copy singkat + satu CTA |
| Toast / Inline Alert | Failed publish & reconnect account |
| Modal / Confirm | Publish & disconnect account |
| Tabs (Publish: Calendar / Queue / Drafts / History) | Default = Calendar |

### P1 — domain spesifik

| Komponen | Layar |
| -------- | ----- |
| Calendar cell / event chip | KSP-02 |
| Queue group by account | KSP-03 |
| Draft Editor layout (caption + side panel) | KSP-05 |
| AI Assist control + suggestion cards | KSP-05 (inline only) |
| Media thumbnail / attachment strip | KSP-05 |
| Content format radios / Pin fields (per account) | KSP-05 (ADR-039) |
| Schedule picker | KSP-05 |
| Inbox thread + reply composer | KSP-06 |
| Metric stat (simple) | KSP-01, KSP-07 |
| Connected account row (active / expired) | KSP-08 |

### P2 — belakangan

| Komponen | Catatan |
| -------- | ------- |
| Start Page blocks | Theme selector = Should Have |
| Billing cards | Post-MVP untuk sebagian besar visual polish |
| Data table kompleks | Hindari di MVP Analyze |

**Catatan komponen:** Implementasi kode memakai Astryx + Tailwind layout-only (ADR-041). Design system di Claude Design sebaiknya **semantically compatible** (Button, Dialog, Tabs, dll.) tanpa harus 1:1 nama class.

---

## B.4 Pattern Notes per area

| Area | Do | Don't |
| ---- | -- | ----- |
| Home | 4 zona status; deep link keluar | Jadikan Home pusat editing |
| Publish | Calendar default; Failed mencolok | Sembunyikan akun tujuan sampai langkah terakhir |
| Draft Editor | AI & media di konteks caption | Halaman “AI Hub” terpisah |
| Engage | Unread jelas; reply cepat | Samakan visual dengan email client yang ramai |
| Analyze | Snapshot minggu/periode | Dashboard BI penuh chart kompetitif |
| Connected Accounts | Reconnect path obvious | Biarkan disconnected terlihat “OK” |

---

## B.5 Accessibility & Content

* Kontras teks & status memenuhi WCAG AA sebagai target MVP.
* Jangan andalkan warna saja untuk `Failed` / unread.
* Microcopy status & error harus actionable (“Reconnect LinkedIn”, bukan “Error 401”).
* Bahasa UI produk: **Bahasa Indonesia**, kecuali proper noun platform.

---

## B.6 Open Decisions (untuk diisi designer)

Keputusan berikut **belum dikunci** — putuskan di Claude Design lalu usulkan untuk dicatat sebagai keputusan produk jika sudah final:

| ID | Topik | Pertanyaan |
| -- | ----- | ---------- |
| DS-O01 | Brand name visual | Lock working title atau wordmark sementara? |
| DS-O02 | Primary brand color | Arah warna primer (hindari klise ungu generik kecuali dipilih sadar) |
| DS-O03 | Type pairing | Pasangan display + UI sans |
| DS-O04 | Light / dark | MVP light-only, atau dark dari awal? *(preferensi saat ini: tidak default dark)* |
| DS-O05 | Illustration style | Empty state: flat, line, atau fotografi produk? |
| DS-O06 | Platform color usage | Seberapa kuat warna Instagram/X/dll. di Calendar? |
| DS-O07 | Marketing site vs app | Satu sistem visual atau terpisah? *(di luar scope MVP app shell)* |

Setelah DS-O01–O04 diputuskan, update token di `styles.css`/`theme.json` (project Claude Design) dan laporkan ringkasannya ke product owner.

---

## B.7 Struktur Project Claude Design (sudah dibuat)

```text
Social Media Management (Claude Design project)
├── theme.json, styles.css, readme.md, thumbnail.html
├── foundations/  (color.html, type.html, layout.html)
├── components/   (buttons, status-chips, forms, cards, navigation, table, dialog)
└── templates/    (home, publish-calendar, publish-queue, publish-drafts,
                    draft-editor, engage-inbox, analyze-dashboard,
                    settings-connected-accounts — KSP-01 … KSP-08)
```

Ini bukan lagi rencana — struktur ini sudah live di project Claude Design; lanjutkan langsung di sana.

---

# Lampiran — Referensi internal (opsional)

Detail kanonikal tetap di repository project:

| Topik | Lokasi |
| ----- | ------ |
| UX Planning Baseline | `product-discovery/04-ux/` |
| Personas | `product-discovery/03-user/` |
| Roles & content status | `product-discovery/02-product/roles-permissions.md` |
| Design overview (sumber Markdown) | `design/DESIGN_OVERVIEW.md` |
| Claude Design project | `Social Media Management` (`84aded99-bb23-49b1-be9f-dd8f21c6873e`) via claude.ai/design |
| Architecture overview (opsional) | `project-manager/ARCHITECTURE_OVERVIEW.md` |

---

*End of Design Brief — Social Media Management v1.0.0*
