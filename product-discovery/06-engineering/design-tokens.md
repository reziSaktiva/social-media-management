# Design Tokens

Dokumen ini adalah **Source of Truth visual tokens** untuk implementasi UI di
`apps/web` (Astryx theme + Tailwind token bridge).

Nilai token final berkembang **iteratif dan co-equal** antara dokumen ini dan
project Claude Design "Social Media Management" (ADR-056) — tidak ada lagi
gerbang "menunggu designer masuk": project ini tidak akan merekrut designer
eksternal, perannya digantikan permanen oleh King Rezi sendiri lewat Claude
Design (ADR-057, amandemen ADR-038 & ADR-041). Selama M8, implementasi
feature memakai neutral theme bawaan Astryx dan tidak menunggu token final.
Screenshot bukan acuan nilai final; folder `design/` (paket handoff designer)
sudah dihapus dan **tidak akan dibuat ulang** (ADR-045, ADR-057).

| Field | Value |
| ----- | ----- |
| Status | **Draft — berkembang iteratif bersama Claude Design (co-equal, ADR-056)** |
| Lokasi SoT | Dokumen ini, co-equal dengan Claude Design untuk nilai token (ADR-038, ADR-056) |
| Implementasi kode | `apps/web` (Astryx theme + Tailwind token bridge) |
| UX / struktur layar | Tetap di `../04-ux/` — **tidak** diganti dokumen ini |
| Peran desainer | Permanen digantikan King Rezi via Claude Design — tidak ada designer eksternal (ADR-057); pointer di `../../context/ctx-design.md` |

---

# Panduan PM — mengunci satu set token

Checklist lock ini dijalankan kapan pun King Rezi (berperan sebagai desainer
via Claude Design) menganggap satu set token sudah stabil — **tidak ada**
gerbang "designer eksternal masuk" (ADR-057). Selama development feature,
gunakan neutral theme Astryx; jangan mengisi nilai brand sementara atau
memblokir implementasi layar karena tabel masih `TBD`.

## Langkah 1 — Review & approve di Claude Design

Claude Design menggantikan Figma sebagai design handoff tool (ADR-042) — project
`Social Media Management` (projectId `84aded99-bb23-49b1-be9f-dd8f21c6873e`),
diakses lewat tool `DesignSync` bawaan Claude Code. Lihat
`../../context/ctx-design.md` untuk pointer lengkap.

Pastikan hasil design selaras dengan UX Baseline (`../04-ux/`):

* Primary nav: Home → Publish → Engage → Analyze → Start Page
* Publish default: Calendar
* Tidak ada Approval Workflow di MVP
* AI hanya inline di Draft Editor
* 6 content status + `Failed` jelas terbaca

Jika Claude Design mengubah alur/IA, **hentikan** — diskusikan dulu (perlu update UX + ADR). Jangan “mengunci token” dari desain yang bertentangan dengan UX. Sinkronisasi antara baseline ini dan project Claude Design bersifat manual/on-request (ADR-042) — bukan otomatis.

## Langkah 2 — Isi tabel token di dokumen ini

Salin nilai final dari Claude Design (theme.json / styles.css) atau style guide ke tabel di bawah:

1. Typography (font display + UI)
2. Color — brand (primary, secondary, …)
3. Color — neutral (canvas, surface, text, border)
4. Color — status konten (6 status + failed)
5. Color — feedback (success, warning, danger, info)
6. Spacing / radius / elevation (ringkas)
7. Mode tema (light-only MVP vs dark)

Ganti setiap `TBD` dengan nilai konkret (hex/HSL atau nama font). Isi kolom **Catatan** bila perlu.

## Langkah 3 — Ubah status dokumen

Di metadata atas:

* Status → **Locked — siap implementasi**
* Catat tanggal approve + link project Claude Design (opsional, di Related)

## Langkah 4 — Catat di Project OS

* Tambah/update ADR di `../../project-manager/DECISIONS.md` jika nilai brand/tema berdampak luas (atau amandemen singkat pada ADR-038 bahwa nilai sudah diisi).
* Update `../../project-manager/CHANGELOG.md`.
* Update `../../project-manager/PROJECT_STATE.md` bila ini menjadi next-task selesai / unlock UI shell.

## Langkah 5 — Mirror ke kode (M8)

Engineering memetakan token → implementasi:

| Token di dokumen ini | Target kode (contoh) |
| -------------------- | -------------------- |
| Brand / neutral / status | Astryx custom theme / CSS variables di `apps/web` |
| Skala type / spacing | Astryx theme + Tailwind token bridge |
| Komponen UI | Komponen Astryx dan wrapper selektif memakai semantic token yang sama |

**Jangan** mengisi hex hanya di Claude Design atau hanya di screenshot tanpa update dokumen ini.

## Yang tidak dilakukan

* Menjadikan PDF brief atau dokumen desain lain sebagai SoT warna/font
* Menempel banyak screenshot ke `04-ux/` sebagai pengganti token
* Mengubah IA/nav di Claude Design lalu menganggap repo otomatis ikut

---

# Keputusan yang Sudah Terkunci (proses)

| ID | Topik | Keputusan |
| ---- | ----- | --------- |
| DT-D01 | Lokasi SoT token | `product-discovery/06-engineering/design-tokens.md` |
| DT-D02 | Kapan diisi | Iteratif, co-equal dengan Claude Design (ADR-056); dikunci kapan pun King Rezi menganggap stabil — tidak ada gerbang "designer masuk" (ADR-057); selama M8 gunakan neutral theme Astryx |
| DT-D03 | Hubungan dengan handoff designer | Tidak ada designer eksternal, permanen (ADR-057); folder `design/` dihapus dan tidak dibuat ulang (ADR-045); token final tetap **wajib** masuk dokumen ini |
| DT-D04 | Hubungan dengan UX Baseline | `04-ux/` mengatur alur & zona fungsi; dokumen ini hanya visual tokens |
| DT-D05 | Stack implementasi | Astryx untuk komponen/theme + Tailwind khusus layout dan responsive composition (ADR-041) |

---

# Typography

| Slot | Peran | Nilai | Catatan |
| ---- | ----- | ----- | ------- |
| `font/display` | Brand moments (login, empty hero opsional) | `TBD` | Hindari Inter/Roboto/Arial sebagai identitas utama |
| `font/sans` | UI produk (nav, list, form, caption) | `TBD` | Prioritas keterbacaan; angka tabular untuk waktu/jadwal disarankan |
| `font/mono` | Opsional — ID teknis | `TBD` atau tidak dipakai | Jangan untuk caption sosial |

**Skala type (Claude Design → kode):** `xs · sm · md · lg · xl · 2xl` — nilai size/line-height konkret: `TBD` setelah design lock.

---

# Color — Brand

| Slot | Dipakai untuk | Nilai (hex/HSL) | Catatan |
| ---- | ------------- | --------------- | ------- |
| `brand/primary` | CTA utama, active nav | `TBD` | |
| `brand/primary-hover` | Hover/focus primary | `TBD` | |
| `brand/subtle` | Background aksen lembut | `TBD` | |
| `brand/secondary` | Aksi sekunder / aksen kedua | `TBD` | Isi jika design memakai secondary eksplisit |

---

# Color — Neutral

| Slot | Dipakai untuk | Nilai (hex/HSL) | Catatan |
| ---- | ------------- | --------------- | ------- |
| `bg/canvas` | Latar aplikasi | `TBD` | |
| `bg/surface` | Panel, list row, card interaksi | `TBD` | |
| `bg/subtle` | Zona sekunder, zebra opsional | `TBD` | |
| `border/default` | Border default | `TBD` | |
| `border/strong` | Border penekanan | `TBD` | Opsional |
| `text/primary` | Teks utama | `TBD` | |
| `text/secondary` | Teks sekunder | `TBD` | |
| `text/muted` | Meta, timestamp, hint | `TBD` | |
| `text/on-brand` | Teks di atas `brand/primary` | `TBD` | Pastikan kontras AA |

---

# Color — Content Status

Harus selaras makna status di `../02-product/roles-permissions.md` dan pola visual di Key Screen Patterns. Jangan andalkan warna saja — chip tetap punya label teks.

| Slot | Status | Nilai (hex/HSL) | Catatan |
| ---- | ------ | --------------- | ------- |
| `status/draft` | Draft | `TBD` | |
| `status/in-review` | In Review | `TBD` | |
| `status/ready` | Ready to Schedule | `TBD` | |
| `status/scheduled` | Scheduled | `TBD` | |
| `status/published` | Published | `TBD` | |
| `status/failed` | Failed | `TBD` | Wajib kontras tinggi (UXP-04) |

---

# Color — Feedback

| Slot | Dipakai untuk | Nilai (hex/HSL) | Catatan |
| ---- | ------------- | --------------- | ------- |
| `feedback/success` | Toast sukses, konfirmasi | `TBD` | |
| `feedback/warning` | Peringatan (akun hampir expired, dll.) | `TBD` | |
| `feedback/danger` | Error, destroy actions | `TBD` | Selaras semantik dengan `status/failed` bila perlu |
| `feedback/info` | Info netral | `TBD` | |

---

# Color — Platform (opsional)

Warna aksen jaringan sosial di Calendar / Account Pill. Jangan mendominasi UI.

| Platform | Nilai | Kekuatan penggunaan |
| -------- | ----- | ------------------- |
| Instagram | `TBD` | `TBD` (hint kecil / sedang) |
| Facebook | `TBD` | `TBD` |
| Twitter / X | `TBD` | `TBD` |
| LinkedIn | `TBD` | `TBD` |
| TikTok | `TBD` | `TBD` |
| YouTube | `TBD` | `TBD` |
| Threads | `TBD` | `TBD` |
| Pinterest | `TBD` | `TBD` |

---

# Spacing

**Locked (ADR-095).** Base unit: **1 Astryx unit = 4px**. Skala ini dikunci
berdasarkan nilai yang sudah dipakai konsisten di kode nyata (prop `gap`/
`padding` pada `VStack`/`HStack`/`Stack`/`Grid` Astryx) — bukan angka baru
yang diciptakan dari nol.

| Unit Astryx | Px | Status |
| ----------- | -- | ------ |
| 0 | 0px | Dipakai (reset spacing sengaja) |
| 0.5 | 2px | Dipakai (dense UI, jarang) |
| 1 | 4px | Dipakai (icon-to-label, paling rapat) |
| 1.5 | 6px | Dipakai (dense UI) |
| 2 | 8px | Dipakai (item list rapat) |
| 3 | 12px | Dipakai (antar field) |
| 4 | 16px | **Paling sering dipakai** — default antar field/dalam Card |
| 5 | 20px | Dipakai (jarang) |
| 6 | 24px | Dipakai (antar section) |
| 8 | 32px | Dipakai (padding page-level) |

Nilai lain (7, 9, 10+) belum dipakai — boleh dipakai kalau kebutuhan riil
muncul, skala ini **tidak tertutup** ke daftar lama (4/8/12/16/24/32/48).
Grid 4px dengan fleksibilitas kelipatan 0.5 di ujung bawah untuk dense UI
(icon+label kecil) lebih akurat merefleksikan pemakaian nyata dibanding
daftar tertutup klasik.

## Panduan Penggunaan Semantik

| Konteks | Prop | Nilai Astryx (px) | Alasan |
| ------- | ---- | ------------------ | ------ |
| Icon-to-label (Button, MenuItem, Badge) | `gap` | 1–1.5 (4–6px) | Elemen sangat dekat, jarak visual minimal |
| Item dalam list/stack rapat (baris Table, item Menu) | `gap` | 2 (8px) | Grouping jelas tapi tetap padat |
| Antar field form / antar komponen dalam satu Card/Section | `gap` | 3–4 (12–16px) | Pemisahan antar unit input yang related tapi berbeda |
| Antar section/blok dalam satu page | `gap` | 6 (24px) | Pemisahan visual section yang lebih tegas |
| Padding internal komponen kecil (Badge, Chip, Pill) | `padding` | 1–1.5 (4–6px) | Komponen dense, padding minimal |
| Padding Card/Section/Container standar | `padding` | 4 (16px) | Default paling umum dipakai |
| Padding Container/page-level wrapper besar | `padding` | 8 (32px) | Breathing room level page, dipakai sengaja lebih jarang |
| Reset/no-space (Stack yang dibungkus komponen lain) | `gap`/`padding` | 0 | Sengaja tanpa spacing tambahan |

## Larangan

* **Tailwind spacing utility mentah** (`gap-`, `p-`, `m-`, `space-x/y-`)
  langsung di komponen — gunakan prop `gap={n}`/`padding={n}` pada
  `VStack`/`HStack`/`Stack`/`Grid`.
* **Arbitrary value** (`gap-[13px]`, `p-[10px]`) — selalu pakai unit dari
  skala di atas.
* **`margin`** pada child untuk spacing antar sibling — spacing datang dari
  `gap` milik parent Stack/Grid, bukan `margin` self.

Dua exception historis ditemukan (`p-0`, `my-1` di `ChannelsSection.tsx`) —
dicatat sebagai technical debt kecil untuk dirapikan, **bukan** preseden
yang boleh diikuti di kode baru.

---

# Radius, Elevation

| Sistem | Keputusan | Nilai |
| ------ | --------- | ----- |
| Radius | Satu keluarga | `TBD` (contoh: 6 / 8 / 12) |
| Elevation | 0–2 level bermakna | `TBD` — shadow terutama untuk overlay |

---

# Tema (Light / Dark)

| ID | Keputusan | Nilai |
| ---- | --------- | ----- |
| DT-THEME | Mode MVP | `TBD` — preferensi awal project: **light-only MVP** (boleh diganti saat lock design) |

---

# Motion (ringkas)

Minimal 2–3 motion disengaja setelah design lock — catat di sini jika design menetapkan durasi/easing:

| Motion | Tujuan | Spec |
| ------ | ------ | ---- |
| Sidebar active | Pindah section jelas | `TBD` |
| Status change | Chip Draft → Scheduled / Failed | `TBD` |
| Inbox badge | Update unread | `TBD` |

---

# Mapping implementasi

```text
M8 sebelum token Locked
        ↓
Astryx neutral theme + Tailwind layout-only

Setelah design-tokens.md Locked (co-equal dengan Claude Design, ADR-056/057)
        ↓
apps/web — Astryx custom theme + Tailwind token bridge
        ↓
Komponen Astryx + wrapper selektif + layar KSP-01 … KSP-08
```

Engineering **tidak** membaca paket handoff designer sebagai sumber nilai
token final (folder `design/` sudah dihapus dan tidak akan dibuat ulang,
ADR-045, ADR-057).

---

# Related Documents

* `README.md` (folder Engineering)
* `../../project-manager/DECISIONS.md` — ADR-038, ADR-041, ADR-056, ADR-057, ADR-095 (kunci skala Spacing)
* `../../project-manager/PROJECT_OVERVIEW.md` — Astryx + Tailwind layout-only
* `../04-ux/` — UX Baseline (alur & layar)
* `../02-product/roles-permissions.md` — status konten kanonikal
* `../../context/ctx-design.md` — pointer Claude Design (folder `design/` dihapus, ADR-045)
