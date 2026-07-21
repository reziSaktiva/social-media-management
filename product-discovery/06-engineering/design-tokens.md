# Design Tokens

Dokumen ini adalah **Source of Truth visual tokens** untuk implementasi UI di `apps/web` (Tailwind / CSS variables / shadcn).

Nilai token diisi **setelah design di-approve oleh Project Manager** — bukan dari folder `design/` sebagai acuan final, dan bukan dari screenshot.

| Field | Value |
| ----- | ----- |
| Status | **Draft — menunggu lock design** |
| Lokasi SoT | Dokumen ini (ADR-038) |
| Implementasi kode | `apps/web` (CSS variables / theme Tailwind) |
| UX / struktur layar | Tetap di `../04-ux/` — **tidak** diganti dokumen ini |
| Handoff designer | `../../design/` — ruang operasional; bukan SoT token |

---

# Panduan PM — saat design sudah siap

Ikuti checklist ini agar tidak bingung di mana mengisi apa.

## Langkah 1 — Review & approve di Figma

Pastikan hasil design selaras dengan UX Baseline (`../04-ux/`):

* Primary nav: Home → Publish → Engage → Analyze → Start Page
* Publish default: Calendar
* Tidak ada Approval Workflow di MVP
* AI hanya inline di Draft Editor
* 6 content status + `Failed` jelas terbaca

Jika Figma mengubah alur/IA, **hentikan** — diskusikan dulu (perlu update UX + ADR). Jangan “mengunci token” dari desain yang bertentangan dengan UX.

## Langkah 2 — Isi tabel token di dokumen ini

Salin nilai final dari Figma Variables / style guide ke tabel di bawah:

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
* Catat tanggal approve + link Figma file/page (opsional, di Related)

## Langkah 4 — Catat di Project OS

* Tambah/update ADR di `../../project-manager/DECISIONS.md` jika nilai brand/tema berdampak luas (atau amandemen singkat pada ADR-038 bahwa nilai sudah diisi).
* Update `../../project-manager/CHANGELOG.md`.
* Update `../../project-manager/PROJECT_STATE.md` bila ini menjadi next-task selesai / unlock UI shell.

## Langkah 5 — Mirror ke kode (M8)

Engineering memetakan token → implementasi:

| Token di dokumen ini | Target kode (contoh) |
| -------------------- | -------------------- |
| Brand / neutral / status | CSS variables di `apps/web` (mis. `globals.css`) |
| Skala type / spacing | Tailwind theme / utility yang selaras |
| Komponen UI | shadcn/ui memakai semantic token yang sama |

**Jangan** mengisi hex hanya di Figma atau hanya di screenshot tanpa update dokumen ini.

## Yang tidak dilakukan

* Menjadikan PDF brief / `design/DESIGN_OVERVIEW.md` sebagai SoT warna/font
* Menempel banyak screenshot ke `04-ux/` sebagai pengganti token
* Mengubah IA/nav di Figma lalu menganggap repo otomatis ikut

---

# Keputusan yang Sudah Terkunci (proses)

| ID | Topik | Keputusan |
| ---- | ----- | --------- |
| DT-D01 | Lokasi SoT token | `product-discovery/06-engineering/design-tokens.md` |
| DT-D02 | Kapan diisi | Setelah design di-approve PM — nilai di bawah tetap `TBD` sampai saat itu |
| DT-D03 | Hubungan dengan `design/` | Folder `design/` = handoff; token final **wajib** masuk dokumen ini |
| DT-D04 | Hubungan dengan UX Baseline | `04-ux/` mengatur alur & zona fungsi; dokumen ini hanya visual tokens |
| DT-D05 | Stack implementasi | Tailwind + shadcn/ui *(Planned di PROJECT_OVERVIEW)* — nama token semantic, bukan nama class Figma 1:1 |

---

# Typography

| Slot | Peran | Nilai | Catatan |
| ---- | ----- | ----- | ------- |
| `font/display` | Brand moments (login, empty hero opsional) | `TBD` | Hindari Inter/Roboto/Arial sebagai identitas utama |
| `font/sans` | UI produk (nav, list, form, caption) | `TBD` | Prioritas keterbacaan; angka tabular untuk waktu/jadwal disarankan |
| `font/mono` | Opsional — ID teknis | `TBD` atau tidak dipakai | Jangan untuk caption sosial |

**Skala type (Figma → kode):** `xs · sm · md · lg · xl · 2xl` — nilai size/line-height konkret: `TBD` setelah design lock.

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

# Spacing, Radius, Elevation

| Sistem | Keputusan | Nilai |
| ------ | --------- | ----- |
| Spacing base | Grid 4px disarankan | `TBD` (konfirmasi skala: 4/8/12/16/24/32/48) |
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

# Mapping implementasi (setelah Locked)

```text
design-tokens.md (SoT)
        ↓
apps/web — CSS variables / Tailwind theme
        ↓
Komponen shadcn + layar KSP-01 … KSP-08
```

Engineering **tidak** membaca folder `design/` sebagai sumber nilai token final.

---

# Related Documents

* `README.md` (folder Engineering)
* `../../project-manager/DECISIONS.md` — ADR-038
* `../../project-manager/PROJECT_OVERVIEW.md` — stack UI (Tailwind / shadcn Planned)
* `../04-ux/` — UX Baseline (alur & layar)
* `../02-product/roles-permissions.md` — status konten kanonikal
* `../../design/README.md` — handoff designer (bukan SoT token)
