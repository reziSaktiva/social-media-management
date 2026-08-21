## Decision ADR-085

### Title

`Section > Card` Membungkus Table/List di Settings (Members, Connected
Accounts) — Pengecualian Sadar atas Aturan Astryx "Dense Data Jangan
Card-Wrapped"

### Status

Accepted

### Date

2026-08-21

### Context

`apps/web/.claude/CLAUDE.md` (agent docs resmi Astryx, auto-generated) punya
aturan keras: *"Dense data = rows (Table, List/Item), never Card-wrapped
list items; Card is for standalone widgets."*

Halaman Settings > Members (`MembersTable`) dan Settings > Connected
Accounts (`ConnectedAccountsList`) membungkus `Table`/`List` dense data
dengan `<Section padding={0}><Card padding={4}>...</Card></Section>` —
secara harfiah melanggar aturan di atas. Ini ditemukan berulang kali oleh
code review (PR #88, dua ronde) karena rasionalnya sebelumnya hanya tercatat
di commit message (`a023da8`, `a7687ae`), bukan di baseline `DECISIONS.md`
— melanggar rule 4 `AGENTS.md` ("jangan ubah baseline tanpa ADR baru").

Rantai keputusan yang membawa ke sini:

1. Mockup Claude Design (`templates/settings-members.html`,
   `templates/settings-connected-accounts.html`) secara visual menampilkan
   Table/rows di dalam kotak bertepi (`class="card card-pad"` di CSS
   mockup) — bukan flat menyatu dengan background halaman.
2. `Section` (Astryx) tidak bisa diberi border/radius/background sendiri
   secara andal: `className` custom hanya nempel ke elemen luar yang tidak
   memengaruhi tampilan, dan jalur resmi untuk override visual granular
   (`xstyle`) sudah dihapus total dari project (ADR-082 — StyleX dicabut,
   `xstyle` tidak dipakai sama sekali).
3. Satu-satunya cara mendapatkan tampilan "kotak bertepi" yang cocok dengan
   Claude Design, tanpa `xstyle` dan tanpa swizzle (dilarang ADR-041), adalah
   menaruh `Card` (yang punya background/border/radius built-in) di dalam
   `Section` (yang menjaga semantik "page region" untuk kepatuhan struktural
   ke Astryx).

### Decision

1. **Section > Card tetap dipertahankan** khusus untuk 2 halaman ini
   (Members, Connected Accounts) — bukan dihapus jadi `Section` polos
   (itu sudah dicoba dan salah, lihat catatan di bawah) dan bukan
   direfactor jadi `Card` polos tanpa `Section` (itu murni jadi Card
   membungkus dense data tanpa syarat, malah makin jauh dari maksud
   aturan Astryx).
2. Pola ini dikonsolidasi jadi satu komponen bersama
   `apps/web/src/app/(app)/settings/components/SettingsSectionCard.tsx`
   — dipakai oleh `ProfileForm`, `MembersTable`, dan `ConnectedAccountsList`
   — supaya tidak lagi copy-paste 3x dan supaya alasan pengecualian ini
   punya satu titik dokumentasi di kode (komentar JSDoc merujuk ke ADR ini).
3. Pengecualian ini **sengaja dibatasi** ke konteks: dense data di dalam
   halaman Settings yang mockup Claude Design-nya sudah eksplisit
   menunjukkan tampilan berkotak. Ini bukan izin umum untuk membungkus
   Table/List dengan Card di tempat lain — implementasi baru di luar
   Settings tetap wajib mengikuti aturan Astryx apa adanya (Section polos,
   tanpa Card) kecuali ada mockup Claude Design lain yang secara eksplisit
   menuntut hal yang sama, dengan amandemen ADR ini.

### Reason

* Astryx sendiri tidak menyediakan jalur resmi untuk memberi `Section`
  tampilan card (border/radius/bg) tanpa `xstyle` — dan `xstyle` sudah
  ditutup total oleh ADR-082, bukan pilihan yang tersedia untuk task ini.
* Kesetiaan visual ke Claude Design (mockup yang sudah dikonfirmasi King
  Rezi) diprioritaskan atas kepatuhan harfiah ke satu kalimat aturan
  Astryx, ketika keduanya berkonflik dan tidak ada jalur teknis untuk
  memenuhi keduanya sekaligus.
* Trade-off ini butuh pencatatan permanen di `DECISIONS.md` (bukan cuma
  commit message) supaya tidak terus-menerus ditemukan ulang sebagai
  "pelanggaran" di setiap ronde review berikutnya.

### Alternatives Considered

* **`Section` polos tanpa `Card`** — dicoba lebih dulu di sesi ini
  (menghapus `Card` sepenuhnya), tapi membalikkan keputusan yang sudah
  dikonfirmasi King Rezi sebelumnya dan membuat tampilan flat, tidak
  cocok dengan mockup Claude Design. Ditolak.
* **`Card` polos tanpa `Section`** — menghilangkan semantik "page region"
  yang disediakan `Section`, dan tidak menyelesaikan konflik aturan (masih
  Card membungkus dense data, tanpa keuntungan struktural apa pun
  dibanding `Section > Card`). Ditolak.
* **Swizzle `Section` untuk menambah kemampuan styling native** —
  ditolak; dilarang ADR-041 pada tahap ini, dan makin tertutup sejak
  StyleX/`xstyle` dihapus (ADR-082, swizzle butuh compiler StyleX yang
  sama).
* **Override token global `--color-background-surface` agar `Section`
  default variant terlihat seperti card** — ditolak; akan mengubah
  tampilan `Section` di seluruh aplikasi (dipakai luas di luar Settings),
  bukan solusi ter-scope.

### Impact / Baseline yang diamandemen

* Tidak ada baseline `product-discovery/` yang diamandemen — ini murni
  keputusan implementasi styling untuk mendamaikan dua sumber kebenaran
  (Astryx CLI docs vs. Claude Design mockup) yang berkonflik di 2 halaman
  spesifik.
* `apps/web/.claude/CLAUDE.md` (Astryx agent docs) **tidak diedit** — file
  itu auto-generated dari CLI resmi, bukan tempat mencatat pengecualian
  project-specific. Pengecualian ini didokumentasikan di sini dan di
  komentar JSDoc `SettingsSectionCard.tsx`.
* File kode yang terdampak:
  `apps/web/src/app/(app)/settings/components/SettingsSectionCard.tsx`
  (baru, komponen bersama), dipakai di `ProfileForm.tsx`,
  `MembersTable.tsx`, `ConnectedAccountsList.tsx`.
* Menutup temuan code review PR #88 (ronde 1 & 2) soal "Table/List masih
  literally di dalam Card" — sekarang punya pencatatan ADR resmi, bukan
  hanya rasional di commit message.

---
