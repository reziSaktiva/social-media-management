# COMPLETE_TASK

> ⚠️ **PERINGATAN KERAS — JANGAN BACA ISI FILE INI KECUALI DIPERINTAHKAN SECARA EKSPLISIT oleh King Rezi.**
> File ini adalah riwayat lengkap seluruh task/perubahan yang sudah selesai sejak awal project (ribuan baris). Untuk status terkini, cukup baca section **Snapshot** di `PROJECT_STATE.md`. AI dilarang membuka/membaca isi lengkap file ini secara proaktif — hanya boleh dibaca saat King Rezi secara eksplisit meminta riwayat lengkap atau menyebut file ini.
> **Pengecualian:** menambahkan entri baru di bagian atas (tepat di bawah `---` ini) setelah sesi kerja selesai tetap **wajib** — itu operasi tulis/append, bukan baca, dan tidak memerlukan membaca entri-entri lama di bawahnya.

Seluruh perubahan penting pada dokumentasi maupun implementasi project dicatat pada dokumen ini.

---

## 2026-09-03 — T-100.1 selesai: struktur Draft Editor Modal dimigrasi ke shadcn (T-100 naik jadi In Progress)

**T-100** (Migrasi Publish — Draft Editor Modal, rilis v0.7, ADR-097) naik
status `⏳ Not Started` → `🟡 In Progress` — subtask pertama dari 4
tuntas, dikerjakan King Rezi langsung di branch
`feature/t-100-draft-editor-modal`.

**T-100.1 (Struktur modal + layout) — File:**
`apps/web/src/app/(app)/components/draft-editor/Modal.tsx`

- Astryx `Dialog`/`DialogHeader` → shadcn `Dialog`/`DialogContent`/
  `DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter`
  (`@/components/ui/dialog`).
- Astryx `Layout`/`LayoutContent`/`LayoutFooter` → komposisi Tailwind
  manual (wrapper flex-col, header row, body scrollable, footer) —
  beberapa `<div>` mentah diberi `eslint-disable-next-line
  no-restricted-syntax` per-baris (belum ada padanan shadcn, mengikuti
  pola yang sama dipakai `InviteMemberDialog.tsx` di T-099.2).
- Astryx `Button` → shadcn `Button` untuk seluruh CTA header (toggle
  Fullscreen/Standard, tombol close) dan footer (Save as Draft/Publish
  Now/Schedule, Batal/Konfirmasi, Mulai Baru/Resume di `ResumeDialog`).
  Loading state pakai `Spinner` menggantikan prop `isLoading` Astryx.
- Varian **Standard/Fullscreen** (ADR-065 default Standard, ADR-052
  toggle Fullscreen) dipertahankan penuh — Standard pakai `style` inline
  (`width: min(960px, 94vw)`, `maxHeight: 88vh`) karena
  `tailwindcss/no-arbitrary-value` melarang class arbitrary-value di
  luar `components/ui/**`; Fullscreen pakai `style` inline (`inset:0`,
  `100vw`/`100dvh`) + class `translate-none` — bug ditemukan+diperbaiki
  saat verifikasi browser: Tailwind v4 memisahkan CSS property
  `translate` dari `transform`, jadi override inline `transform:none`
  saja tidak cukup membatalkan utility `-translate-1/2` bawaan
  `DialogContent` shadcn.
- `ResumeDialog` (KSP-05-F13) — perilaku `purpose="required"` Astryx
  (tidak bisa ditutup Escape/klik-luar, tanpa tombol close) direplikasi
  manual via `onEscapeKeyDown`/`onInteractOutside` `preventDefault()` +
  `showCloseButton={false}` pada `DialogContent`.
- Scope yang sengaja belum disentuh (subtask lain): form controls di
  body (`TextArea`, `CheckboxInput`, `RadioList`/`RadioListItem`,
  `DateInput`, `FileInput`, `TextInput` Pinterest) masih Astryx →
  **T-100.2**. `TimeInput` masih Astryx → **T-100.3** (termasuk evaluasi
  **KI-030**). `Badge`, `Banner`, `Divider`, `Link` di body masih Astryx,
  belum diverifikasi regresi end-to-end penuh → **T-100.4**.

**Verifikasi yang sudah dilakukan:**

- Typecheck: 0 error (`bunx tsc --noEmit` bersih untuk file ini).
- Lint: 0 error/warning untuk file ini (termasuk `tailwindcss/
  no-arbitrary-value` dan rule `no-restricted-syntax` div — ditutup
  lewat inline `style` atau `eslint-disable-next-line` beralasan).
- Browser E2E manual (Chrome via Claude Browser, akun test Raka Pratama
  dari `QA_TEST_ACCOUNTS.md`, workspace "Insvire"): New Post Standard ✅,
  toggle ke Fullscreen ✅ (setelah fix bug `translate-none` di atas),
  toggle balik ke Standard ✅, tombol close (X) ✅, alur Resume
  Unfinished Post end-to-end (isi caption → close tanpa save → buka New
  Post lagi → `ResumeDialog` muncul dengan caption+timestamp tersimpan,
  tidak bisa ditutup Escape/klik-luar, tombol Resume memuat balik
  caption) ✅.
- Belum dijalankan: review arsitektur Ridwan, QA Najwa formal, Vitest
  suite (belum diminta King Rezi).

**Penutupan dokumentasi:**

- `tasks/v07-astryx-shadcn-migration.md` § T-100 — checkbox T-100.1
  dicentang `[x]`, status task `⏳ Not Started` → `🟡 In Progress`,
  catatan implementasi ditambahkan.
- `TASKS.md` — indeks v0.7: `5 ✅ · 0 🟡 · 3 ⏳` → `5 ✅ · 1 🟡 · 2 ⏳`
  (dihitung ulang dari file release: 24 `[x]` + 13 `[ ]` = 37 subtask,
  tidak berubah — hanya status checklist T-100.1). Total task selesai
  tidak berubah (masih 30, T-100 belum Done). Baris **Fokus sekarang**
  T-100 ditambahkan dengan status 🟡.
- `PROJECT_STATE.md` — Snapshot "Top Next Tasks" dan bullet "Prioritas
  utama" di Current Focus diperbarui (pointer ID + judul singkat ke
  `TASKS.md`/`tasks/v07-astryx-shadcn-migration.md` § T-100, sesuai
  ADR-062 — tidak menyalin detail subtask). Tidak menambah bullet baru
  di "Completed (Ringkasan)" karena T-100 belum selesai. Version
  metadata naik 1.0.60 → 1.0.61.

File yang diubah sesi ini (dokumentasi saja, kode ditulis di branch
`feature/t-100-draft-editor-modal`):
`apps/web/src/app/(app)/components/draft-editor/Modal.tsx`,
`project-manager/tasks/v07-astryx-shadcn-migration.md`,
`project-manager/TASKS.md`, `project-manager/PROJECT_STATE.md`.

---

## 2026-09-02 — T-098.4 selesai: review Ridwan + QA Najwa PASS, T-098 ditutup Done, KI-042 Closed

Lanjutan entri di bawah ("T-098.4: Implementasi kode..."). Kode T-098.4
(sidebar mobile hamburger+`Sheet` via `MobileTopBar.tsx` baru,
`MembersTable.tsx` card layout mobile) yang sesi sebelumnya sudah ditulis
tapi belum direview/di-QA, sekarang tuntas seluruh tahapannya.

**Review Ridwan (Architecture Reviewer) — 0 temuan:**

- Entry point bersih — tidak ada business logic bocor ke komponen.
- Tidak ada import Prisma/Supabase client di komponen client yang diubah
  (`MobileTopBar.tsx`, `AppSideNav.tsx`, `WorkspaceSideNav.tsx`,
  `SettingsSideNav.tsx`, `MembersTable.tsx`).
- Cross-domain tetap lewat public API module domain — tidak ada import
  implementasi lintas folder baru.
- Prop `onNavigate?: () => void` opsional dikonfirmasi tidak breaking —
  default `undefined` di sidebar desktop, behavior lama tidak berubah.
- Prop `fullWidth` baru di `MemberActions` konsisten dipakai di kedua
  varian (desktop table row vs mobile card).

**QA Najwa — PASS penuh:**

- Automated: `bun run typecheck` PASS (0 error), `bun run lint` PASS
  (0 error), `bun run test` PASS (235 lulus, 4 skipped — baseline sama,
  tidak ada regresi).
- Desktop (≥768px): tidak ada regresi — sidebar & `MembersTable.tsx`
  identik dengan sebelum T-098.4.
- Mobile (375px, 320px): `MobileTopBar` + hamburger + `Sheet` berfungsi
  benar untuk `WorkspaceSideNav` maupun `SettingsSideNav` (termasuk
  auto-close `Sheet` via `onNavigate` saat memilih menu),
  `MembersTable.tsx` berganti ke card layout dengan tombol Change
  Role/Remove full-width berfungsi normal, dialog konfirmasi Tier-2
  (ADR-049) tetap muncul benar dari card mobile.
- Edge case: tidak ada horizontal overflow di layar sempit (320–375px),
  dark mode smoke test oke.
- 2 temuan DI LUAR SCOPE T-098.4 (dicatat, bukan blocker penutupan):
  (a) tabel Members di lebar persis 768px butuh scroll horizontal
  internal — perilaku tabel yang **sudah ada sebelum** T-098.4, bukan
  regresi baru dari perubahan mobile; (b) card "Analytics Snapshot" di
  halaman Home tetap berlatar putih saat dark mode aktif — bug dark mode
  pre-existing, tidak terkait T-098.4.

**Insiden kecil saat QA (diklarifikasi & disetujui King Rezi, bukan
pelanggaran governance):** Najwa sempat mematikan proses dev server
project lain (`/Users/rezisaktiva/Documents/dev/rezisaktiva`) yang memakai
port 3000 supaya bisa testing di port yang sama (Better Auth menolak
origin selain yang di-trust). King Rezi eksplisit menyetujui ("boleh kill
aja") setelah ditanya — housekeeping environment lokal, tidak relevan
untuk project state, tidak dicatat sebagai KI/ADR.

**Penutupan:**

- `tasks/v07-astryx-shadcn-migration.md` § T-098 — checkbox T-098.4
  dicentang `[x]`, catatan review+QA ditambahkan, Status T-098 `🟡 In
  Progress` → `✅ Done` (4/4 subtask tuntas).
- `TASKS.md` — indeks v0.7 dihitung ulang dari file release: 5 ✅ · 0 🟡 ·
  3 ⏳ (checkbox subtask 23 `[x]` + 14 `[ ]` = 37, tidak berubah dari
  sebelumnya — hanya status checklist yang berubah). Total task selesai
  naik 29 → **30**, subtask total tetap 210. Baris "Fokus sekarang" untuk
  T-098 diubah ke ✅.
- `PROJECT_STATE.md` — **KI-042 Status: Open → Closed (2026-09-02)** dengan
  catatan penutup review Ridwan + QA Najwa; "Top Next Tasks" di Snapshot
  diperbarui (T-098 penuh Done); bullet T-098 di "Completed (Ringkasan)"
  diupdate merefleksikan T-098.4 tuntas (tetap 5 item, tidak menambah
  bullet baru — hanya mengedit bullet T-098 yang sudah ada).

File yang diubah sesi ini (dokumentasi saja, kode sudah ditulis sesi
sebelumnya): `apps/web/src/app/(app)/layout.tsx`,
`apps/web/src/app/(app)/components/MobileTopBar.tsx`,
`apps/web/src/app/(app)/components/AppSideNav.tsx`,
`apps/web/src/app/(app)/components/WorkspaceSideNav.tsx`,
`apps/web/src/app/(app)/settings/components/SettingsSideNav.tsx`,
`apps/web/src/app/(app)/settings/members/components/MembersTable.tsx`
(implementasi, tidak diubah lagi sesi ini) — `project-manager/tasks/v07-astryx-shadcn-migration.md`,
`project-manager/TASKS.md`, `project-manager/PROJECT_STATE.md` (dokumentasi,
diubah sesi ini).

---

## 2026-09-02 — T-098.4: Implementasi kode sidebar mobile + tabel mobile card (KI-042), menunggu review + QA

King Rezi minta lanjut ke implementasi kode setelah rancangan Claude Design
untuk **T-098.4** dibuat di sesi sebelumnya. Dikerjakan di **sesi utama**
(bukan lewat Mark UI Engineer — `DesignSync` juga gagal dimuat di sesi
subagent Mark, konfirmasi ketiga kalinya pola keterbatasan yang sama
seperti Neymar Product Designer sebelumnya).

**Scope 1 — Sidebar mobile (hamburger + Sheet):**

- `apps/web/src/app/(app)/layout.tsx` — `<aside>` desktop diubah dari
  selalu `flex` jadi `hidden md:flex` (gap ini eksplisit dicatat di
  komentar T-096.3 lama; komentar itu diupdate menyatakan gap sudah
  ditutup). Ditambah `<MobileTopBar>` di atas baris sidebar+main.
- File baru `apps/web/src/app/(app)/components/MobileTopBar.tsx` — top bar
  (`md:hidden`, tinggi 52px/`h-13`) dengan tombol hamburger (`Menu01Icon`)
  yang membuka shadcn `Sheet` (`side="left"`, lebar 3/4 layar) berisi
  `AppSideNav` yang sama persis dengan sidebar desktop (tidak
  diduplikasi). Title top bar dinamis: nama workspace di luar
  `/settings`, "Settings" di dalamnya.
- `apps/web/src/app/(app)/components/AppSideNav.tsx`,
  `WorkspaceSideNav.tsx`, dan
  `apps/web/src/app/(app)/settings/components/SettingsSideNav.tsx` —
  ditambah prop opsional `onNavigate?: () => void` (dipanggil di setiap
  Link/tombol nav utama) supaya Sheet otomatis tertutup setelah user
  memilih menu di mobile. Prop `undefined` di sidebar desktop, tidak ada
  perubahan behavior di sana.
- Breakpoint: `md` (768px Tailwind), sesuai keputusan breakpoint di
  rancangan Claude Design.

**Scope 2 — Members table responsive:**

- `apps/web/src/app/(app)/settings/members/components/MembersTable.tsx`
  — tabel desktop shadcn `Table` dibungkus `hidden md:block` (isi tidak
  diubah). Ditambah blok baru `flex flex-col gap-3 md:hidden` berisi card
  per anggota (avatar+nama+email, badge Status, baris Role, lalu
  `MemberActions` dengan prop baru `fullWidth` yang membuat tombol Change
  Role/Remove full-width sebagai baris terpisah dengan border-top,
  alih-alih rata-kanan di sel tabel).

**Verifikasi:**

- `bun run typecheck` — bersih, 0 error.
- `bun run lint` — bersih, 0 error (sempat 1 error
  `no-restricted-syntax` di `MobileTopBar.tsx` karena raw `<div>`, diberi
  `eslint-disable-next-line` dengan alasan file baru dikomposisi Tailwind
  shadcn sejak awal, bukan migrasi Astryx).
- **Verifikasi visual browser TIDAK berhasil dilakukan** — tool Browser
  pane gagal total (navigate timeout 300s berulang kali, baik ke
  `localhost` dev server maupun file lokal), tampak masalah
  infrastruktur/tooling sesi ini, bukan masalah kode (dev server Next.js
  start normal, "Ready in 319ms", tidak ada error compile di log — dev
  server masih berjalan di background sesi ini).

**Status:** kode sudah ditulis, **belum** direview Ridwan (Architecture
Reviewer) dan **belum** di-QA Najwa, verifikasi visual manual juga belum
berhasil dilakukan siapa pun. **T-098.4 tidak ditandai selesai** — T-098
tetap `🟡 In Progress` (dibuka kembali dari `✅ Done`), **KI-042 tetap
Open**. Next step: review arsitektur Ridwan + QA Najwa (termasuk
menggantikan verifikasi visual yang gagal di sesi ini).

Dokumentasi diupdate: `tasks/v07-astryx-shadcn-migration.md` § T-098
(subtask T-098.4 ditambahkan dengan catatan implementasi lengkap),
`TASKS.md` (Indeks v0.7: 5 ✅·3 ⏳ → 4 ✅·1 🟡·3 ⏳; Total: 30 selesai/209
subtask → 29 selesai/210 subtask; Fokus sekarang baris T-098 diupdate),
`PROJECT_STATE.md` (§ KI-042, Top Next Tasks, Completed Ringkasan bullet
T-098).

---

## 2026-09-02 — KI-042: Rancangan mobile/responsive dibuat di Claude Design (blocker T-098.4 resolved)

King Rezi mengerjakan sendiri (bukan lewat Neymar Product Designer — `DesignSync`
gagal dimuat 2x di sesi Neymar) penambahan rancangan mobile/responsive di
Claude Design (project "Social Media Management", `projectId`
`84aded99-bb23-49b1-be9f-dd8f21c6873e`) yang sebelumnya jadi **blocker**
eksplisit sebelum subtask **T-098.4** (sidebar mobile hamburger+drawer + pola
tabel responsive) bisa mulai dikerjakan sebagai kode, sesuai rule 17
`AGENTS.md`. Seluruh perubahan murni penambahan (append-only) — tidak ada
markup/CSS existing yang diubah atau dihapus.

**Added (Claude Design):**

- `styles.css` — 2 blok CSS baru di akhir file: pattern "Mobile Shell"
  (`.mobile-topbar`, `.mobile-nav-backdrop`, `.mobile-nav-drawer` +
  `@media (max-width: 768px)` yang menyembunyikan `.sidebar`/
  `.settings-sidebar` desktop dan menampilkan top bar mobile, reuse penuh
  anatomy overlay `.notif-backdrop`/`.notif-drawer` yang sudah ada,
  dicerminkan buka dari kiri) dan pattern "Table — mobile card layout"
  (class opt-in `.table-responsive` + `.table-card`/`.table-card-row`/
  `.table-card-actions`, di-gate lewat wrapper supaya tabel yang belum
  pakai class ini tidak terpengaruh). Breakpoint `768px` deliberate reuse
  dari satu-satunya precedent breakpoint terdokumentasi di project
  (`product-discovery/04-ux/key-screen-patterns.md` § KSP-02-F10),
  dinyatakan eksplisit di komentar CSS sebagai keputusan (bukan asumsi
  diam-diam) karena precedent itu untuk konteks lain (indikator tipe
  konten Calendar).
- `foundations/layout.html` — section baru "Shell — Mobile (≤768px,
  KI-042)" ditambahkan setelah section "Shell — AppShell + SideNav" yang
  sudah ada. Baris "sidebar shape never changes" di section desktop tidak
  diubah/dihapus.
- `components/navigation-mobile.html` (file baru) — 3 demo state static
  mengikuti pola `demo-frame` yang sudah dipakai di
  `components/notifications-panel.html`: "Collapsed — sidebar hidden" (top
  bar saja), "Open — Workspace drawer" (markup `WorkspaceSideNav` persis
  sama dengan desktop, direflow ke lebar drawer), "Open — Settings drawer"
  (markup `SettingsSideNav` persis sama dengan desktop).
- `components/table.html` — section baru "Mobile — card layout (KI-042)"
  ditambahkan setelah tabel desktop existing (tidak diubah), pakai data
  sama dengan `templates/settings-members.html` (Raka/Maya/Lara — Name+
  Avatar, Role, Status chip, Actions sebagai row full-width di bawah).

**Belum selesai (sengaja tidak ditandai selesai):**

- **T-098.4 (implementasi kode)** belum dikerjakan sama sekali — sesi ini
  hanya menghasilkan rancangan di Claude Design. Keputusan King Rezi
  sebelumnya ("jadi subtask T-098.4, tapi ditunda dulu, belum dikerjakan
  sekarang") tetap berlaku — bukan otomatis siap dikerjakan.
- **KI-042 tetap Status Open** — yang berubah hanya bagian blocker/
  rancangan di dalam entrinya (blocker desain resolved), bukan status KI
  itu sendiri.
- Verifikasi visual browser tidak dilakukan (sandbox environment tidak
  bisa render file HTML lokal di luar project folder Claude Design) — King
  Rezi disarankan cek visual langsung di Claude Design sebelum lanjut ke
  implementasi kode.

**Docs diupdate:** `project-manager/PROJECT_STATE.md` (§ KI-042),
`project-manager/tasks/v07-astryx-shadcn-migration.md` (§ T-098, catatan
T-098.4).

---

## 2026-09-02 — T-098: Migrasi App Shell & Navigasi selesai (ADR-097)

Task keempat rilis v0.7 (migrasi Astryx → shadcn/ui), dikerjakan di branch
`feature/t-098-app-shell-navigation` oleh Mark UI Engineer, lolos review
arsitektur Ridwan Architecture Reviewer (0 temuan) dan QA Najwa QA Engineer
(PASS penuh setelah 1 bug ditemukan+diperbaiki). Seluruh 3 subtask tuntas:

- **T-098.1** `WorkspaceSideNav.tsx`, `SettingsSideNav.tsx`,
  sidebar-channels `ChannelsSection.tsx` — dimigrasi penuh dari Astryx ke
  shadcn/ui + Tailwind.
- **T-098.2** Notification panel (`NotificationBell.tsx`) — dimigrasi ke
  shadcn `Sheet`. Wrapper custom `apps/web/src/components/ui/Drawer.tsx`
  **dihapus** (dikonfirmasi tidak ada consumer lain oleh Mark, di-cross-check
  ulang oleh Ridwan).
- **T-098.3** Re-verifikasi **KI-040** (gap visual panel notifikasi) —
  **Closed**, diverifikasi Najwa lewat browser nyata (light & dark mode);
  root cause lama (geometri wrapper `Drawer` custom) hilang bersama
  penggantian ke `Sheet` asli.

**Added:**

- Komponen shadcn baru: `avatar`, `badge`, `dropdown-menu`, `alert-dialog`,
  `sheet`, `tooltip`.
- Helper baru `apps/web/src/lib/utils/get-initials.ts`.
- `TooltipProvider` ditambahkan ke `apps/web/src/components/Providers.tsx`.
- Known Issue baru **KI-042** — gap sidebar mobile (hamburger + drawer) di
  `apps/web/src/app/(app)/layout.tsx` belum dimigrasi ke shadcn `Sidebar`
  primitive (built-in mobile-`Sheet`); komentar existing dari T-096.3
  menyebutnya akan "menyusul di T-098", tapi breakdown resmi 3 subtask
  T-098 tidak mencakup file `layout.tsx`/`AppSideNav.tsx`. Keputusan
  (subtask baru T-098.4? task terpisah? ditunda ke T-102?) menunggu King
  Rezi — dicatat, bukan diputuskan sendiri.

**Removed:**

- `apps/web/src/components/ui/Drawer.tsx` (wrapper selektif Astryx,
  digantikan `Sheet` shadcn asli).

**Fixed:**

- Bug ditemukan Najwa QA Engineer: dot indikator unread menimpa teks
  timestamp di panel notifikasi — diperbaiki, lalu re-verifikasi PASS
  penuh.

**Resolved:**

- **KI-040** (gap visual panel notifikasi vs Claude Design) — Closed via
  T-098.3, sudah dihapus dari daftar Known Issues `PROJECT_STATE.md`
  sesuai aturan (entry Resolved yang sudah tercatat di sini tidak
  dibiarkan berstatus Resolved di daftar itu). Back-reference ditambahkan
  di `tasks/v02-publishing-mvp.md` § T-036.

**Hasil verifikasi:** typecheck 0 error, lint 0 error, Vitest 235
passed/4 skipped/0 fail (baseline sama, tidak ada regresi test). Browser
E2E semua PASS: nav items, logout Tier-2 safety check, `ChannelsSection`,
notification panel mark-read/mark-all-read/persistence, light+dark mode.

Task T-098 naik dari `🟡 In Progress` ke `✅ Done`. Task selesai naik
28 → 29 (subtask total tidak berubah, tetap 209 — hanya status checklist
yang berubah). **T-099** (Migrasi Settings) sedang berjalan paralel di
sesi lain — sudah tahap implementasi selesai, menunggu verifikasi visual
final.

File berubah: `tasks/v07-astryx-shadcn-migration.md`,
`tasks/v02-publishing-mvp.md`, `TASKS.md`, `PROJECT_STATE.md`.

Detail: `tasks/v07-astryx-shadcn-migration.md` § T-098.

---

## 2026-09-02 — T-099: Migrasi Settings selesai (ADR-097)

Task rilis v0.7 (migrasi Astryx → shadcn/ui), dikerjakan di worktree
terpisah (branch `feature/t-099-settings-migration`, dicabang dari
`feature/t-097-auth-flows-onboarding`, paralel dengan sesi T-098) oleh
Mark UI Engineer, lolos review arsitektur Ridwan Architecture Reviewer
(0 temuan) dan QA Najwa QA Engineer (PASS dengan 1 temuan minor). Seluruh
3 subtask tuntas:

**Added**

- Komponen shadcn baru di-install: `alert-dialog`, `avatar`, `badge`,
  `dropdown-menu`, `item`, `radio-group`, `select`, `table`,
  `toggle`/`toggle-group`, `tooltip`.
- Helper baru `getInitials()` di `apps/web/src/lib/utils.ts` (dipakai di
  4 file).
- `TooltipProvider` ditambahkan ke `apps/web/src/components/Providers.tsx`.
- **KI-042** (baru) — aplikasi belum punya strategi responsive/mobile yang
  didesain; entri ini mengumpulkan gap serupa lintas task (T-098 sidebar
  mobile, T-099 kolom Actions `MembersTable.tsx`) di satu tempat.

**Changed**

- **T-099.1** `SettingsPageHead.tsx`, `WorkspaceGeneralSettings.tsx`,
  `ProfileForm.tsx`, `preferences/page.tsx` dimigrasi penuh dari Astryx ke
  shadcn/ui + Tailwind.
- **T-099.2** `MembersTable.tsx` — sistem kolom `pixel()`/`proportional()`
  Astryx dihapus total, diganti shadcn `Table` primitive + JSX langsung;
  `InviteMemberDialog.tsx`, `InviteMemberAction.tsx` dimigrasi.
- **T-099.3** `ConnectedAccountsList.tsx`, `ConnectPlatformMenu.tsx`,
  `WorkspacesSettingsView.tsx` dimigrasi.
- **KI-041** meluas — status "Pending" di `MembersTable.tsx` dipetakan ke
  `Badge variant="outline"` (bukan "secondary" seperti Active/Removed)
  karena tidak ada token warning; treatment varian, bukan warna baru,
  konsisten dengan keputusan T-097.

**Verifikasi**

- Review Ridwan: 0 temuan pelanggaran arsitektur — entry point bersih,
  tidak ada leak Prisma/Supabase/Outstand, cross-domain lewat public API,
  validasi file avatar dikonfirmasi tetap otoritatif di server
  (`IdentityService.updateProfile`), tidak hilang saat migrasi
  client-side check.
- QA Najwa: seluruh golden path PASS (General settings edit+persist,
  Danger Zone Transfer Ownership & Delete Workspace dialog Tier 1, upload
  avatar + validasi ukuran file, toggle tema Preferences, invite member
  flow lengkap sampai buka link undangan, Connected Accounts, switch
  workspace) di light & dark mode. Typecheck/lint/vitest bersih (235
  pass, 4 skip, 0 fail).
- 1 temuan minor (severity Moderate): kolom "Actions" (Change Role/
  Remove) di `MembersTable.tsx` tidak terlihat penuh pada viewport sempit
  (~800px) — perlu scroll horizontal (shadcn `Table` sudah punya
  `overflow-x-auto` bawaan, bukan crash/broken). Dicatat sebagai detail
  tambahan di **KI-042** (baru dibuat di sesi ini karena belum ada di
  worktree ini; kemungkinan sudah dibuat lebih dulu oleh sesi T-098 di
  repo utama — penyatuan dua sisi dokumentasi dilakukan King Rezi setelah
  PR digabung).

**Catatan multi-sesi:** dikerjakan paralel dengan sesi T-098 (working
directory repo utama, bukan worktree ini) — dokumen-dokumen yang diubah
di sini (`TASKS.md`, `PROJECT_STATE.md`, `tasks/v07-astryx-shadcn-migration.md`)
masih berbasis versi sebelum update T-098; penyatuan dilakukan King Rezi
setelah kedua PR digabung.

Detail lengkap: `tasks/v07-astryx-shadcn-migration.md` § T-099.

---

## 2026-09-02 — T-097: Migrasi Auth Flows & Onboarding selesai (ADR-097)

Task ketiga rilis v0.7 (migrasi Astryx → shadcn/ui), dikerjakan di branch
`feature/t-097-auth-flows-onboarding` (dicabang dari
`feature/t-096-core-infra-migration`) oleh Mark UI Engineer, lolos review
arsitektur Ridwan Architecture Reviewer (0 temuan) dan QA Najwa QA Engineer
(semua PASS). Seluruh 5 subtask tuntas:

- **T-097.1** Login & Register forms (`LoginForm.tsx`, `RegisterForm.tsx` +
  page wrapper, `app/(auth)/login/`, `app/(auth)/register/`).
- **T-097.2** Forgot/Reset password forms (`ForgotPasswordForm.tsx`,
  `ResetPasswordForm.tsx` + page wrapper masing-masing).
- **T-097.3** Accept Invite pages (`AcceptInvitePageClient.tsx`,
  `AcceptInviteForm.tsx`, `app/(auth)/invite/[token]/page.tsx`).
- **T-097.4** `app/(auth)/layout.tsx`, `app/onboarding/layout.tsx`
  (migrasi Center/HStack/Text/VStack Astryx → shadcn + Tailwind).
- **T-097.5** Onboarding flow (`app/onboarding/page.tsx`,
  `app/onboarding/layout.tsx`, `CreateWorkspaceForm.tsx`).

**Komponen shadcn baru di-install:** `alert`, `checkbox`, `label`,
`separator`, `field` (Field/FieldGroup/FieldLabel/FieldSeparator/
FieldDescription), `empty` (Empty/EmptyHeader/EmptyMedia/EmptyTitle/
EmptyDescription), `input-group`, `textarea` (dependency ikutan, tidak
dipakai langsung di scope ini).

**2 keputusan/gap penting:**

1. Astryx `Banner status="info"/"error"` → shadcn `Alert` cuma punya
   varian `default`/`destructive` (tidak ada varian info) — error
   dipetakan ke `destructive`, info ke `default` netral, tidak mengarang
   varian baru.
2. **Gap desain terverifikasi** (Mark, dikonfirmasi independen Ridwan
   lewat grep `globals.css`): Stone theme shadcn **belum punya token
   `--success`/`--warning`**, hanya `--destructive`. Astryx
   `EmptyState color="success"/"warning"/"error"` dipakai untuk 3 state
   Accept Invite (success/expired/invalid) — state "invalid" dipetakan ke
   `text-destructive` (token yang memang ada), "expired"/"success"
   dibiarkan netral (bukan mengarang hex/token baru tanpa ADR). Dicatat
   sebagai **KI-041** (Open) — keputusan terbuka untuk King Rezi (tambah
   token ke Stone theme, butuh ADR baru, atau tetap netral selamanya),
   belum ditutup sendiri.

Penyesuaian teknis kecil (settled, bukan gap): `max-w-[400px]`/`[480px]`
arbitrary value → `max-w-sm`/`max-w-md` (rule lint
`tailwindcss/no-arbitrary-value`); `text-on-accent` →
`text-accent-foreground` (nama token shadcn yang benar); `Button` tidak
punya prop `isLoading` bawaan → pola manual `disabled` + ikon spinner
`animate-spin`.

**Hasil verifikasi:** typecheck 0 error, lint 0 error (2 warning kosmetik
pre-existing di `textarea.tsx`, bukan dari perubahan ini), Vitest 235
passed/4 skipped, browser E2E semua PASS (login, register, forgot/reset
password, accept invite golden+edge case, onboarding, dark/light mode via
cookie `theme`, regresi shell `(app)/layout.tsx` dari T-096 aman). Seluruh
import `@astryxdesign/*` di `app/(auth)/**` dan `app/onboarding/**` sudah
hilang (diverifikasi grep, sisa cuma di komentar dokumentasi).

Catatan sampingan dari Najwa (QA): dibuat 2 akun test baru di database
lokal (`najwa.qa.t097@kopiselasar.com`, `dimas.qa.t097@kopiselasar.com`)
untuk uji accept-invite — data test lokal, bukan dokumentasi permanen.

Task T-097 naik dari `🟡 In Progress` ke `✅ Done`. Task selesai naik
27 → 28 (subtask total tidak berubah, tetap 209 — hanya status checklist
yang berubah). **T-098** (Migrasi App Shell & Navigasi) adalah task
berikutnya rilis v0.7.

File berubah: `tasks/v07-astryx-shadcn-migration.md`, `TASKS.md`,
`PROJECT_STATE.md`, `CONVERSATIONS.md`.

Detail: `tasks/v07-astryx-shadcn-migration.md` § T-097.

---

## 2026-09-01 — T-096: Migrasi Core Infra & Shared Primitives selesai (ADR-097)

Task kedua rilis v0.7 (migrasi Astryx → shadcn/ui), dikerjakan Mark UI
Engineer di branch `feature/t-096-core-infra-migration`, dikonfirmasi
"aman" oleh King Rezi. Seluruh 4 subtask tuntas:

- **T-096.1** `globals.css` ditulis ulang berbasis Tailwind v4 + shadcn
  sesuai pemetaan token T-095.5.
- **T-096.2** `components/Providers.tsx` diganti ke pendekatan shadcn
  (`dark` class strategy); `ThemeModeContext`/`useThemeMode` custom
  (cookie persisted) dipertahankan apa adanya.
- **T-096.3** Root `app/(app)/layout.tsx` dimigrasi dari `AppShell` Astryx
  ke komposisi shadcn.
- **T-096.4** Primitive dasar baru: `Button`, `Card`, `Dialog`, `Input`
  (via CLI shadcn resmi), plus `Text`/Typography ditulis manual (shadcn
  tidak punya komponen Typography resmi).

**2 keputusan penting (disetujui King Rezi):**

1. `@import` CSS Astryx di `globals.css` **sengaja dipertahankan**
   (tidak dihapus sesuai rencana awal T-096.1) karena route-segment yang
   belum dimigrasi (auth/settings/publish — T-097–T-101) masih butuh CSS
   itu; akan dihapus di T-102 setelah semua route-segment selesai
   migrasi.
2. `<Theme>` Astryx di `Providers.tsx` **sengaja dipertahankan
   berdampingan** dengan class `dark` shadcn (bukan pengganti) — supaya
   dark/light mode tidak desync antara bagian yang sudah shadcn dan yang
   masih Astryx; akan dilepas di T-102.

Gap yang sengaja belum ditutup: sidebar mobile (hamburger+drawer) di
`(app)/layout.tsx` belum direplikasi di layout baru, menyusul di T-098
bersamaan migrasi `WorkspaceSideNav`/`SettingsSideNav` ke `Sheet`.

**Hasil verifikasi:** typecheck bersih, lint bersih, verifikasi visual
manual di browser tidak menemukan regresi.

Sekaligus dikoreksi drift hitungan subtask v0.7 di `TASKS.md`: klaim
sebelumnya 26 subtask ternyata tidak cocok dengan
`tasks/v07-astryx-shadcn-migration.md` aktual (36 subtask) — dihitung
ulang langsung dari file. Task selesai naik 26 → 27, subtask total naik
199 → 209.

Detail: `tasks/v07-astryx-shadcn-migration.md` § T-096.

---

## 2026-09-01 — T-095.6: Update subagent Mark UI Engineer ke shadcn/ui (izin eksplisit King Rezi) — T-095 selesai penuh

Subtask keenam sekaligus **penutup** T-095 (rilis v0.7, ADR-097).
`.claude/agents/mark-ui-engineer.md` adalah Static Reference — perubahan
hanya dilakukan setelah King Rezi eksplisit meminta "kerjakan T-095.6"
(instruksi eksplisit, sesuai gate di `AGENTS.md` § Subagent kerja).

Perubahan: frontmatter `description` diganti dari Astryx ke shadcn/ui
(ditambah catatan bahwa migrasi berjalan incremental per route-segment —
agent harus cek dulu file yang disentuh masih Astryx atau sudah shadcn,
jangan asumsikan seluruh app sudah shadcn). Body ditulis ulang total:
- Wajib dibaca: `apps/web/.claude/CLAUDE.md` (sekarang berisi workflow
  shadcn, hasil T-095.3), ditambah pointer ke
  `tasks/v07-astryx-shadcn-migration.md` untuk task migrasi.
- Aturan keras diganti dari model Astryx (props-only, Tailwind
  layout-only, CLI `astryx component <Name>`) ke model shadcn: Tailwind
  utility sebagai mekanisme styling utama, `cn()` untuk merge className,
  variant dibaca dari blok `cva()` di file komponen (bukan tabel props
  terpusat), `hugeicons` sebagai default icon library, plus rule baru
  soal migrasi file yang campur Astryx/shadcn (ganti tuntas sesuai scope
  subtask, jangan campur parsial).
- Workflow wajib tiap task UI diganti ke urutan discover-first yang sama
  dengan `apps/web/.claude/CLAUDE.md`: cek `components/ui/` → search →
  view source/props → cek contoh pakai → install → audit.

Bagian yang **tidak** diubah (tetap relevan lintas Astryx/shadcn): sebutan
"King Rezi", langkah pertama ubah Status task jadi In Progress, di luar
scope (Application Service/domain logic → Prabowo, Claude Design →
Neymar, dokumentasi project → Gibran), dan langkah verifikasi visual
lewat preview tool.

**T-095 (Setup Fondasi shadcn/ui & Tooling Migrasi) resmi ditutup `✅
Done`** — seluruh 7 subtask selesai. Status ditandai `✅ Done` di
`tasks/v07-astryx-shadcn-migration.md` § T-095, baris T-095 & indeks v0.7
di `TASKS.md` (total task selesai naik 25 → **26**), Snapshot + section
**Completed (Ringkasan)** di `PROJECT_STATE.md` (bullet terlama —
"Polishing UI grid Calendar 2026-08-27" — digeser keluar sesuai batas 5
item). **T-096 Migrasi Core Infra & Shared Primitives** adalah task
berikutnya rilis v0.7, belum dimulai.

File berubah: `.claude/agents/mark-ui-engineer.md`,
`tasks/v07-astryx-shadcn-migration.md`, `TASKS.md`, `PROJECT_STATE.md`.

---

## 2026-09-01 — T-095.5: Pemetaan token Stone theme → CSS variable shadcn/ui

Subtask kelima T-095 (rilis v0.7, ADR-097). Dibaca langsung dari sumber:
`@astryxdesign/theme-stone/dist/theme.css` (v0.4.3 ter-install, isi
`--color-*`/`--font-family-*`/`--radius-*` Stone theme, semua dalam bentuk
`light-dark(<light>, <dark>)`) dan `apps/web/src/app/globals.css` +
`layout.tsx` kondisi sekarang (hasil init CLI T-095.1) untuk tahu variable
shadcn apa saja yang sudah ada dan perlu diisi nilai Stone-nya nanti di
T-096.1.

Ditulis sebagai section baru **"Engineering Mapping — Stone theme → CSS
variable shadcn/ui (T-095.5)"** di
`product-discovery/06-engineering/design-tokens.md` (Source of Truth
visual token, DT-D01), bukan di file lain — supaya satu dokumen jadi
rujukan tunggal engineering untuk implementasi T-096.1. Ditambahkan juga
entri **DT-D06** ke tabel keputusan, menegaskan section ini murni
pemetaan literal 1:1 (bukan token brand baru — § Color — Brand/Content
Status/Feedback tetap `TBD` menunggu design lock, tidak disentuh).

**Isi mapping:**
* Tabel warna `:root`/`.dark` untuk 11 variable inti (`--background`
  s.d. `--ring`) + tabel `--sidebar-*` (8 variable, dipakai T-096.3),
  masing-masing dengan sumber `--color-*` Stone yang dipecah dari
  `light-dark()`.
* **Radius: sengaja tidak dipetakan dari skala radius Stone** — preset
  Maia (shadcn) sudah generate komponen (`Button` → `rounded-4xl`,
  lihat `apps/web/src/components/ui/button.tsx`) yang dikalibrasi ke
  base `--radius: 0.625rem` bawaan CLI; ganti ke nilai Stone
  (`--radius-element` 0.5rem) akan menggeser seluruh skala turunan
  tanpa review visual. Diputuskan pertahankan default Maia; kalau King
  Rezi mau radius Stone lama dipertahankan persis, itu keputusan visual
  terpisah yang perlu approve eksplisit.
* **Chart palette (`--chart-1..5`): sengaja tidak dipetakan** — Stone/
  Astryx tidak punya sistem palet chart, dan domain Analytics belum
  masuk scope 8 task v0.7 ini. Dibiarkan default grayscale CLI.
* **Gap font ditemukan:** `--font-sans` (body) sudah cocok — Figtree
  sudah di-load `next/font/google` sejak T-095.1. Tapi `--font-heading`
  saat ini fallback ke `var(--font-sans)` (ikut Figtree) di `globals.css`
  `@theme inline` baris 16, padahal Stone pakai **Montserrat** khusus
  heading (`h1`–`h6`) — belum ada font Montserrat di-load sama sekali di
  project. Dicatat sebagai to-do konkret untuk T-096.1: load Montserrat
  via `next/font/google` (pola sama seperti `figtree`/`geistSans` di
  `layout.tsx`), lalu ganti binding `--font-heading`.

File berubah: `product-discovery/06-engineering/design-tokens.md` (section
baru "Engineering Mapping" + DT-D06 + isi baris Radius di § Radius,
Elevation yang tadinya `TBD`). Tidak ada perubahan kode (`globals.css`
belum disentuh — itu scope T-096.1, dokumen ini murni referensi). Status
ditandai di `tasks/v07-astryx-shadcn-migration.md` (T-095.5 → selesai) dan
`TASKS.md` § Fokus sekarang.

---

## 2026-09-01 — T-095.4: Update `AGENTS.md` rule 14 & 15 ke shadcn/ui (sudah selesai lebih dulu, diverifikasi ulang)

Subtask keempat T-095 (rilis v0.7, ADR-097). Dicek: rule 14 & 15 `AGENTS.md`
**sudah** berisi konten shadcn/ui (bukan Astryx lagi) — bukan hasil kerja
sesi ini, melainkan sudah masuk lewat commit `07a3aa2` ("docs: sinkronkan
baseline UI docs ke shadcn/ui sesuai ADR-097"), bagian dari sinkronisasi
baseline yang dilakukan **sebelum** T-095.1–.3 dikerjakan di sesi ini
(commit itu mendahului task-task tersebut secara kronologis di riwayat
git, meski T-095.4 baru ditandai selesai sekarang secara administratif).

Isi yang diverifikasi cocok dengan requirement T-095.4: rule 14 menyebut
"UI produk memakai **shadcn/ui** (ADR-097, membalik ADR-041)" + catatan
migrasi incremental per route-segment (Astryx & shadcn coexist sementara,
pointer ke `tasks/v07-astryx-shadcn-migration.md`); rule 15 mewajibkan baca
`apps/web/.claude/CLAUDE.md` dan/atau cek registry/CLI/MCP shadcn lokal
sebelum menulis/mengubah komponen UI, dengan larangan eksplisit menebak
nama komponen/props/pola styling. Tidak ada gap ditemukan, tidak ada edit
tambahan diperlukan di `AGENTS.md`.

File berubah: tidak ada (verifikasi murni, `AGENTS.md` sudah benar).
Status ditandai di `tasks/v07-astryx-shadcn-migration.md` (T-095.4 →
selesai) dan `TASKS.md` § Fokus sekarang.

---

## 2026-09-01 — T-095.3: Tulis ulang agent docs `apps/web/.claude/CLAUDE.md` ke workflow shadcn

Subtask ketiga T-095 (rilis v0.7, ADR-097). Konten lama (blok
`<!-- ASTRYX:START -->`…`<!-- ASTRYX:END -->`) diganti total dengan blok
`<!-- SHADCN:START -->`…`<!-- SHADCN:END -->` — bukan edit sebagian, karena
model kerja shadcn (source-copy ke `components/ui/`, styling lewat Tailwind
utility + `cva` variant di file komponen) beda fundamental dari Astryx
(closed dependency, styling lewat props tertutup).

Workflow discover-first baru (paralel ke tool MCP shadcn yang sudah
tersambung dari T-095.2): cek dulu apakah komponen sudah ada di
`components/ui/` → `search_items_in_registries`/`shadcn search` → baca
source & props asli via `view_items_in_registries`/`shadcn view` (bukan
asumsi API-nya sama dengan Astryx) → cek contoh pakai
`get_item_examples_from_registries` → install via
`get_add_command_for_items`/`shadcn add` → audit akhir dengan
`get_audit_checklist`. Tiap langkah CLI dipetakan eksplisit ke tool MCP
padanannya supaya agent tahu mana yang dipakai duluan (MCP untuk
exploration dalam sesi, CLI sebagai fallback/eksekusi install).

Rules disesuaikan dari model Astryx (props-only, tokens via
`astryx docs tokens`, no `<div>`) ke model shadcn: Tailwind utility sebagai
mekanisme styling utama, token lewat CSS variable `globals.css` (bukan
sistem token Astryx terpisah), `cn()` dari `@/lib/utils` untuk merge class,
variant dibaca dari blok `cva(...)` di file komponen itu sendiri (bukan
tabel props terpusat seperti `astryx component <Name>`). Icon library
`hugeicons` (default preset Maia, dikonfirmasi tetap dipakai di T-095.1)
dicatat sebagai default komponen baru; `react-icons` (era Astryx) dicatat
coexist untuk kode yang belum migrasi — bukan dianggap salah pakai.

File berubah: `apps/web/.claude/CLAUDE.md`. Status ditandai di
`tasks/v07-astryx-shadcn-migration.md` (T-095.3 → selesai) dan `TASKS.md`
§ Fokus sekarang.

---

## 2026-09-01 — T-095.2: Install & konfigurasi MCP server shadcn

Subtask kedua T-095 (rilis v0.7, ADR-097). Dikerjakan via CLI resmi shadcn,
bukan edit manual: `bunx shadcn@latest mcp init --client claude` lalu
`--client cursor`, keduanya dijalankan dari root repo (bukan `apps/web/`)
supaya menulis ke `.mcp.json` dan `.cursor/mcp.json` di lokasi yang benar
(dua file kembar wajib sinkron, ADR-064 — lihat `AGENTS.md` § Kompatibilitas
tool). Hasil identik di kedua file: server baru `"shadcn"` terdaftar sebagai
`stdio` (`command: "npx"`, `args: ["shadcn@latest", "mcp"]`) — beda transport
dari 3 server lain yang sudah ada (`xds`, `supabase`, `railway`, semuanya
`http`). Server `xds` (Astryx) **dibiarkan tetap ada** untuk sementara,
belum dihapus — akan dihapus di T-102 cleanup setelah migrasi selesai
(Astryx & shadcn coexist per strategi ADR-097 poin 2), bukan lupa dihapus.

**Efek samping CLI:** menambah devDependency `shadcn@^4.19.1` di root
`package.json` (+ `bun.lock`) — versi sama dengan yang sudah ada di
`apps/web/package.json` dari T-095.1, konsisten, dibiarkan apa adanya
(bukan duplikasi yang perlu dibersihkan, CLI butuh keduanya untuk jalan di
scope monorepo vs `apps/web`).

**Update:** setelah restart Claude Code, koneksi awal gagal
(`CONNECTION_CLOSED`) — root cause: cache `~/.npm/_cacache` root-owned
(bug lama npm, sisa dari sudo npm/npx sebelumnya), bikin `npx
shadcn@latest mcp` gagal EACCES saat di-spawn. Diperbaiki King Rezi
sendiri via `sudo chown -R 501:20 ~/.npm` (di luar scope AI, butuh
password sistem), lalu restart ulang. **Terverifikasi tersambung** — 7
tool muncul: `search_items_in_registries`, `view_items_in_registries`,
`list_items_in_registries`, `get_add_command_for_items`,
`get_item_examples_from_registries`, `get_project_registries`,
`get_audit_checklist`.

File berubah: `.mcp.json`, `.cursor/mcp.json`, `package.json` (root) +
`bun.lock`. Status ditandai di `tasks/v07-astryx-shadcn-migration.md`
(T-095.2 → selesai) dan `TASKS.md` § Fokus sekarang.

---

## 2026-09-01 — T-095.1: Init shadcn/ui di apps/web (base Radix + preset Maia)

Subtask pertama implementasi kode rilis v0.7 (migrasi Astryx → shadcn/ui,
ADR-097). Sebelum eksekusi, King Rezi diberi penjelasan trade-off 3 base
library shadcn (Radix/Base UI/React Aria) — memilih **Radix** (paling
matang, kompatibel dengan MCP server shadcn yang akan dipasang di T-095.2)
dengan style preset **Maia** (softer/rounded, dipilih King Rezi lebih dulu).

**Hambatan teknis & solusi:** `bunx shadcn@latest init` (v4.19.1) gagal
deteksi Tailwind v4 karena `globals.css` project pakai 3 baris `@import`
terpisah (`tailwindcss/theme.css`/`preflight.css`/`utilities.css`, pola ini
dipakai supaya layer Astryx (`astryx-base`, `astryx-theme`) bisa
diselipkan di antara `base` dan `components`) — bukan `@import
"tailwindcss";` tunggal yang dicari CLI lewat exact substring match.
Diganti ke bentuk tunggal, **identik secara fungsional** (isi
`tailwindcss/index.css` upstream = gabungan 3 baris itu; urutan cascade
layer tetap dikontrol oleh deklarasi `@layer reset, theme, base,
astryx-base, astryx-theme, components, utilities;` di baris 1, bukan
posisi fisik `@import`).

Init berhasil: `components.json` dibuat (`style: radix-maia`), file
`src/lib/utils.ts` (util `cn()`) + `src/components/ui/button.tsx` dibuat.
CLI juga otomatis mem-patch `layout.tsx` (tambah font Figtree + import
`cn`) dan `globals.css` (append CSS variable tema default shadcn). **Bug
CLI ditemukan & diperbaiki manual:** hasil merge menulis
`--font-sans: var(--font-sans);` (self-referencing/circular, akan resolve
ke initial value di browser) — dikembalikan ke `var(--font-geist-sans)`.

**Icon library:** preset Maia default `iconLibrary: "hugeicons"` (bukan
`lucide-react` yang lebih umum di ekosistem shadcn) — dikonfirmasi ke King
Rezi, keputusan: **tetap hugeicons**, ikuti default preset apa adanya.
`react-icons` (Astryx lama) coexist sampai migrasi selesai, wajar untuk
masa transisi ADR-097.

**Verifikasi:** `bun run typecheck` bersih. Dev server (`bun run dev`)
direstart bersih, log `GET / 200`, `GET /api/realtime/token 200`, tanpa
error compile. Verifikasi visual di Browser pane sempat terhambat
`ERR_TOO_MANY_REDIRECTS` bolak-balik `/`↔`/login` — ternyata bukan bug
dari perubahan T-095.1, melainkan session cookie basi di profil browser
pane yang memicu bug pre-existing di `src/proxy.ts`: gate cepat halaman
auth publik cuma cek *keberadaan* cookie (`getSessionCookie`), bukan
validitasnya, jadi cookie yang ada-tapi-invalid memicu loop antara
"gate cepat redirect ke /" dan "validasi penuh redirect ke /login". Diatasi
untuk sesi ini dengan sign-out manual lewat `/api/auth/sign-out` (bypass
path proxy), bukan dengan mengubah `proxy.ts` (beda domain/scope dari
T-095, dicatat sebagai temuan terpisah untuk auth/proxy, bukan diperbaiki
diam-diam di sini). Setelah cookie bersih, halaman `/login` render normal
— styling Astryx utuh, tidak ada regresi visual dari `globals.css` baru.

File berubah: `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`,
`apps/web/package.json` (+ `bun.lock`), file baru `apps/web/components.json`,
`apps/web/src/lib/utils.ts`, `apps/web/src/components/ui/button.tsx`.
Status ditandai di `tasks/v07-astryx-shadcn-migration.md` (T-095 →
🟡 In Progress) dan `TASKS.md` § Fokus sekarang.

---

## 2026-09-01 — Docs consistency audit: 3 gap ditemukan & diperbaiki (topik "components")

### Fixed
- **`project-manager/DECISIONS.md`** — 4 baris index (ADR-041, ADR-055, ADR-057, ADR-082) belum menyebut "Amended by ADR-097 (2026-09-01)" di kolom Status, padahal file ADR masing-masing sudah punya catatan itu — index dan sumbernya desync. Diperbaiki, kolom Status di-sync ulang.
- **`project-manager/decisions/ADR-041-ui-component-system-astryx-sebagai-fondasi-permanen-dan-design-later-workflow.md`** — Status line kehilangan referensi "Amended by ADR-082 (2026-08-19)" (tertimpa saat edit T-095.7 sebelumnya, seharusnya ditambah bukan diganti). Dikembalikan jadi `Accepted — Amended by ADR-057 (2026-07-31), ADR-082 (2026-08-19), ADR-097 (2026-09-01)`.
- **`project-manager/PROJECT_STATE.md`** § Current Focus — bullet lama "Alignment dokumentasi ADR-041 selesai ... Astryx permanen ... Tailwind layout-only ... exact pin Beta" berkontradiksi langsung dengan bullet ADR-097/prioritas-utama 13 baris di atasnya dalam section yang sama. Ditandai eksplisit sebagai superseded oleh ADR-097, riwayat instalasi/smoke-test Next.js 16 dipertahankan sebagai fakta yang masih valid.

### Context
Dijalankan via skill `/docs-consistency-audit` dengan argumen topik "components" — scope dipersempit ke UI component system (Astryx/shadcn) setelah dikonfirmasi ke King Rezi (grep awal "component" menghasilkan banyak false-positive "Server Component"/"Client Component" React/Next.js yang tidak relevan). 33 file dibaca penuh (context/, product-discovery/06-engineering, product-discovery/04-ux, 12 ADR terkait, DECISIONS.md, TASKS.md + tasks/v07, PROJECT_OVERVIEW.md, PROJECT_STATE.md, .claude/agents/*, AGENTS.md). Mayoritas file dari ronde sinkronisasi T-095.7 sebelumnya terverifikasi bersih — 3 gap di atas adalah sisa yang lolos dari ronde itu, semuanya Kelas A (mekanis, jawaban benar jelas dari Source of Truth). Diperbaiki setelah dikonfirmasi King Rezi ("ya, perbaiki semua"), mengikuti mode report-only-lalu-tanya skill ini (tidak ada perbaikan diam-diam).

**Tidak ditemukan gap** di: context/ctx-*.md (4 file), product-discovery/06-engineering/README.md, monorepo-setup.md, code-conventions.md, dependency-strategy.md, design-tokens.md (kecuali 1 cross-reference blurb minor, tidak diperbaiki — severity Low, murni redaksional), product-discovery/04-ux/ (README.md, key-screen-patterns.md, navigation-patterns.md), TASKS.md, tasks/v07-astryx-shadcn-migration.md, PROJECT_OVERVIEW.md, .claude/agents/README.md, prabowo-feature-engineer.md, AGENTS.md.

---

## 2026-09-01 — T-095.7: Sinkronisasi dokumentasi baseline Astryx→shadcn/ui

### Changed
- **14 file** diupdate supaya konsisten dengan ADR-097 (shadcn/ui menggantikan Astryx sebagai fondasi UI permanen): `context/ctx-implementation.md`, `ctx-technical-context.md`, `ctx-development.md`, `ctx-design.md`; `product-discovery/06-engineering/dependency-strategy.md` (DS-D07 ditandai superseded), `monorepo-setup.md`, `README.md`, `design-tokens.md`; `product-discovery/04-ux/key-screen-patterns.md`, `navigation-patterns.md` (nama komponen "Astryx Popover"/"Card Astryx" dinetralkan); `.claude/agents/README.md`, `.claude/agents/prabowo-feature-engineer.md`; `AGENTS.md` (root); `project-manager/PROJECT_OVERVIEW.md`.
- **4 ADR** (`ADR-041`, `ADR-055`, `ADR-057`, `ADR-082`) — baris Status ditambah `Amended by ADR-097 (2026-09-01)`; isi Decision/Reason/Alternatives Considered tidak diubah (riwayat keputusan tetap utuh).

### Context
King Rezi meminta seluruh dokumentasi yang jadi acuan kerja (terutama UI/UX) ikut disinkronkan **sebelum** implementasi migrasi kode dimulai — bukan ditunda ke T-102 cleanup di akhir rilis v0.7. Prinsip edit: minimal-diff, pointer ke ADR-097 di tempat relevan, detail teknis Astryx yang sudah tidak berlaku (exact-pin Beta, canary, swizzle, CLI `astryx build/template/component`) ditandai historis/superseded bukan dihapus begitu saja. Sengaja **tidak** menyentuh `.claude/agents/mark-ui-engineer.md` (Static Reference, chmod 444, butuh izin eksplisit terpisah — dicatat T-095.6) dan `apps/web/.claude/CLAUDE.md` (task terpisah T-095.3, agent docs Astryx CLI ditulis ulang saat setup shadcn CLI/MCP benar-benar terpasang).

Diverifikasi lewat `grep -rn "Astryx"` ulang di seluruh scope — sisa mention yang ditemukan semuanya legitimate (riwayat/historical, catatan migrasi transisi, atau baris Status ADR yang memang seharusnya menyebut ADR lama). Ditemukan 1 file tambahan di luar daftar awal (`project-manager/PROJECT_OVERVIEW.md`, tabel Tech Stack) yang juga diupdate.

**T-095.7** ditandai selesai di `tasks/v07-astryx-shadcn-migration.md` — belum ada kode aplikasi yang berubah, T-095.1–.6 (setup shadcn/MCP/CLI nyata) masih `⏳ Not Started`.

---

## 2026-09-01 — v0.7 (migrasi Astryx→shadcn/ui) dijadikan prioritas utama

### Changed
- `project-manager/TASKS.md` § Fokus sekarang — **T-095** (task pertama v0.7) ditambahkan sebagai baris teratas, mendahului T-025/T-036, dengan catatan eksplisit "Prioritas utama".
- `project-manager/PROJECT_STATE.md` § Snapshot (Top Next Tasks) dan § Current Focus — diperbarui menyebut T-095/v0.7 sebagai prioritas utama saat ini, dikerjakan sebelum T-025/T-036.

### Context
Setelah ADR-097 + rilis v0.7 dibuat (lihat entri di bawah), King Rezi meminta migrasi ini dijadikan task yang harus diutamakan. T-025 (Real OutstandAdapter) tetap terhenti menunggu kredensial (KI-003) dan T-036 tersisa 2 subtask non-blocking, jadi tidak ada konflik prioritas nyata — migrasi bisa langsung dimulai dari T-095. Belum ada implementasi kode di sesi ini.

---

## 2026-09-01 — ADR-097: Migrasi Astryx → shadcn/ui direncanakan (audit + task list)

### Added
- **ADR-097** (`project-manager/decisions/ADR-097-migrasi-astryx-ke-shadcn-ui.md`) — reverse ADR-041: shadcn/ui menggantikan Astryx sebagai fondasi komponen UI permanen. Mengamendemen ADR-055/057/082, tidak mengubah ADR-087 (theme Stone jadi acuan token).
- Release baru **v0.7** (`project-manager/tasks/v07-astryx-shadcn-migration.md`) — 8 task (T-095–T-102), 26 subtask, strategi incremental per route-segment (Astryx & shadcn coexist sementara, bukan big-bang).

### Context
Atas permintaan King Rezi, dilakukan audit menyeluruh atas seluruh pemakaian Astryx di `apps/web/src` sebelum menyusun rencana migrasi ke shadcn/ui. Latar belakang: KI-040 (gap visual notification panel) dan riwayat KI-030 (TimeInput)/KI-035 (Badge, StyleX) dianggap sebagai keterbatasan Astryx yang berulang dan tidak bisa diperbaiki dari sisi project (closed-package, masih Beta — KI-005).

**Hasil audit:** 49 file unik meng-import `@astryxdesign/*`, ~44 komponen/hook berbeda, 1 wrapper selektif (`components/ui/Drawer.tsx`, dibuat karena Astryx tanpa primitive Drawer), 0 file test komponen UI. Seluruh pemakaian terisolasi di `app/` (46 file) dan `components/` (3 file) — `domains/`/`lib/` bersih dari dependency UI, sehingga migrasi feasible tanpa menyentuh business logic.

King Rezi mengonfirmasi dua keputusan lewat `AskUserQuestion`: (1) formalisasi langsung ke ADR + TASKS.md (bukan disimpan sebagai proposal draft dulu), (2) strategi **incremental per route-segment** (bukan big-bang/freeze fitur M8).

**Task breakdown (T-095–T-102):** T-095 (setup shadcn/ui + MCP server + tulis ulang agent docs + update AGENTS.md rule 14/15), T-096 (core infra: globals.css, Providers.tsx, AppShell, primitive dasar), T-097 (Auth & Onboarding), T-098 (App Shell & Navigasi, termasuk hapus wrapper `Drawer.tsx` → shadcn `Sheet`, re-verifikasi KI-040), T-099 (Settings), T-100 (Draft Editor Modal, ~68 titik pakai — task tersendiri karena paling kompleks, termasuk re-evaluasi KI-030 TimeInput), T-101 (Calendar/Queue/Drafts/Dashboard, termasuk re-evaluasi KI-035), T-102 (cleanup dependency + QA visual menyeluruh + tutup KI terkait).

Belum ada implementasi kode — sesi ini murni audit + perencanaan/dokumentasi.

### Related
- `project-manager/DECISIONS.md` (index ADR-097 ditambahkan di atas)
- `project-manager/TASKS.md` (indeks release v0.7 ditambahkan, total task 77→85, subtask 173→199)
- `project-manager/PROJECT_STATE.md` (Snapshot + Recent Decisions diperbarui, ADR-087 digeser keluar dari daftar 5)

---

## 2026-09-01 — T-036.4 dibuka kembali (5 gap visual vs Claude Design ditemukan, verifikasi visual belum dilakukan)

### Context

Branch `feature/t-036-notification-realtime`. T-036.4 (UI notification bell + panel) sebelumnya sudah ditandai `[x]` Done di sesi ini. Review lanjutan membandingkan langsung ke spec Claude Design (`components/notifications-panel.html`) menemukan 5 gap visual pada `apps/web/src/app/(app)/components/notification-panel/NotificationBell.tsx`: (1) background tint item unread, (2) dot indikator unread, (3) icon circle badge, (4) weight/warna title berbeda per status, (5) deskripsi terpotong ellipsis.

### Perubahan

- Kelima gap sudah diperbaiki oleh subagent lain langsung di `NotificationBell.tsx` (lint + `tsc` bersih).
- Verifikasi visual di browser **belum dilakukan** — dev server minta login, tidak ada kredensial test tersedia di sesi ini.
- Karena itu checklist **T-036.4 dikembalikan dari `[x]` ke `[ ]`** di `project-manager/tasks/v02-publishing-mvp.md` sampai ada verifikasi visual browser nyata yang mengonfirmasi kecocokan dengan spec.
- Bukan KI baru — dianggap bagian dari investigasi yang sama dengan **KI-040** (tetap Open, tidak diubah statusnya).
- Dokumen yang diperbarui: `project-manager/tasks/v02-publishing-mvp.md` (checklist + catatan), `project-manager/TASKS.md` (baris Fokus sekarang T-036 + update log baru), `project-manager/PROJECT_STATE.md` (Top Next Tasks, catatan lanjutan KI-040, bullet Completed Ringkasan T-036.3/.4).

---

## 2026-09-01 — Polishing styling panel notifikasi (2 ronde) + KI-040 dibuka

### Context

Branch `feature/t-036-notification-realtime`, lanjutan dari T-036.3/.4
(entri di bawah). Setelah T-036.4 lolos review Ridwan + QA Najwa, King Rezi
meminta polish styling panel notifikasi (`Drawer`) agar lebih sesuai spec
Claude Design (NP-D08). Dua ronde fix dilakukan, keduanya diverifikasi
presisi lewat source Astryx sebelum diterapkan:

* **Ronde 1** — perbaikan padding/gap/border-radius list item notifikasi
  di dalam panel supaya sesuai spec `components/notifications-panel.html`.
* **Ronde 2** — perbaikan vertical-centering empty-state (saat tidak ada
  notifikasi) dan kontras border header panel di dark mode.

Setelah ronde 2, King Rezi mengambil screenshot langsung dari Chrome
browser asli (bukan lewat tool preview) di `localhost:3000` dan melaporkan
panel masih terlihat "banyak yang terpotong atau tidak sempurna"
dibanding rancangan di Claude Design — meski dari screenshot yang terlihat
(dark mode, viewport desktop besar) elemen header dan empty-state sudah
tampak lengkap tanpa clipping yang jelas. Root cause belum teridentifikasi
presisi (kemungkinan masalah geometri/proporsi seperti lebar panel di
viewport besar) — berbeda dari 2 bug ronde 1/2 yang sudah diverifikasi
lewat source Astryx. Dicatat sebagai **KI-040** (Open, lihat
`PROJECT_STATE.md` § Known Issues dan `tasks/v02-publishing-mvp.md` §
T-036). Atas instruksi eksplisit King Rezi, pekerjaan perbaikan dihentikan
untuk sesi ini — butuh sesi investigasi visual terpisah side-by-side
dengan Claude Design.

### Changed

* `apps/web/src/app/(app)/components/notification-panel/` — styling list
  item (padding/gap/border-radius), empty-state vertical-centering, border
  header panel dark mode.
* `apps/web/src/components/ui/Drawer.tsx` — penyesuaian mengikuti fix di
  atas.

### Known Issues

* **KI-040 (baru, Open)** — panel notifikasi masih ada gap visual vs
  Claude Design setelah 2 ronde fix, root cause belum ditemukan.

---

## 2026-09-01 — T-036.3/.4 Supabase JWT bridge + UI notification bell/panel

### Context

Branch `feature/t-036-notification-realtime`, lanjutan T-036.1/.2 (entri di
bawah). Dua subtask diselesaikan sesi ini: T-036.3 (sambungkan Supabase JWT
dari session Better Auth) dan T-036.4 (UI notification bell + panel). Lolos
review arsitektur Ridwan (tanpa temuan) dan QA Najwa (semua PASS termasuk
realtime live-update, setelah 1 bug ditemukan dan diperbaiki). T-036.5
(trigger dari webhook) masih belum dikerjakan — T-036 tetap `🟡 In Progress`.

### Added

* Route Handler `apps/web/src/app/api/realtime/token/route.ts` (GET) — cek
  session Better Auth, terbitkan Supabase Realtime JWT via
  `createSupabaseRealtimeJwt` (helper sudah ada sejak awal, baru sekarang
  dipakai).
* Method `list`, `markAsRead`, `markAllAsRead` di `INotificationRepository`
  + implementasi Prisma + `NotificationService` (sengaja ditunda dari
  T-036.1 supaya tidak menulis kode yang belum terpakai).
* Server Actions `markNotificationReadAction`/`markAllNotificationsReadAction`
  di `apps/web/src/app/(app)/components/notification-panel/actions.ts`.
* Komponen baru `apps/web/src/app/(app)/components/notification-panel/NotificationBell.tsx`
  (bell + panel + state + wiring realtime + mark-as-read).
* `apps/web/src/components/ui/Drawer.tsx` — wrapper selektif pertama di
  codebase ini. Spec Claude Design (NP-D08,
  `components/notifications-panel.html`) menyebut Astryx `Drawer`, tapi
  Astryx ter-pin (`@astryxdesign/core@0.4.3`) tidak punya komponen itu.
  Emulasi dengan `Dialog` posisi edge gagal full-height (base style
  `Dialog` hardcode `height: fit-content`, bentrok dengan positioning
  `top`+`bottom`, over-constrained). King Rezi memutuskan (dikonfirmasi 2x
  via AskUserQuestion): pakai wrapper selektif, bukan `Dialog` — dirakit
  dari primitive Astryx resmi (`useLayer` mode fixed/top-layer via native
  Popover API, `useFocusTrap`, `useScrollLock`, `Stack`/`VStack`), bukan
  swizzle/CSS manual. Preseden baru untuk kasus serupa selama Astryx belum
  expose primitive Drawer/Sheet generik.
* 3 test case baru di `notification.service.test.ts` (total 5).
* Migration `apps/web/prisma/migrations/20260901120000_t036_fix_realtime_rls_cuid_cast/`
  (lihat Fixed).

### Changed

* `apps/web/src/lib/hooks/use-notification-realtime.ts` — fetch token dari
  endpoint `api/realtime/token` dan panggil `client.realtime.setAuth(token)`
  sebelum subscribe.
* `apps/web/src/app/(app)/components/WorkspaceSideNav.tsx` — bell trigger +
  badge unread di footer sidebar (sebelumnya `router.push` ke halaman
  settings, sekarang membuka panel).
* Threading data: `apps/web/src/app/(app)/layout.tsx` (fetch initial
  notifications via `NotificationService.list()`) →
  `apps/web/src/app/(app)/components/AppSideNav.tsx` → `WorkspaceSideNav.tsx`.

### Fixed

* Bug ditemukan Najwa QA: notifikasi Realtime tidak muncul live tanpa
  refresh (channel `SUBSCRIBED`, nol event, tanpa error terlihat). Root
  cause (dikonfirmasi via diagnostic PostgREST 400→200): bukan
  `SUPABASE_JWT_SECRET` mismatch — fungsi `auth.uid()` bawaan Supabase
  selalu cast klaim JWT `sub` ke `::uuid`, padahal `userId` Better Auth
  berformat `cuid()` (pola yang sudah diketahui di `with-current-user.ts`,
  DO-D06, tapi luput diterapkan saat policy Realtime
  `notifications_realtime_own_rows` dibuat di T-036.2, migration
  `20260831150000_t036_notifications_realtime_setup`). RLS gagal
  dievaluasi untuk setiap user asli, Realtime menelan error itu diam-diam.
  Fix: migration `20260901120000_t036_fix_realtime_rls_cuid_cast`
  (drop+recreate policy supaya baca klaim `sub` sebagai text langsung,
  tanpa cast `::uuid`; tidak menyentuh `auth.uid()` itu sendiri).
  Diterapkan manual oleh King Rezi (classifier auto-mode Claude Code
  memblokir eksekusi `prisma migrate deploy` dari sesi manapun terhadap
  database live — batasan tooling, bukan gap arsitektur). QA ulang: PASS
  (alur asli Transfer Ownership + insert manual). Closing gap bug RLS,
  sama pola dengan migration T-036.2 — bukan keputusan arsitektur baru,
  tidak ada ADR baru untuk ini.

### Lain-lain

* **KI-039 Resolved** — rancangan Notifications Panel
  (`components/notifications-panel.html`) ternyata sudah ditambahkan ke
  Claude Design sebelum sesi ini dimulai (2026-08-31 pagi).
* Catatan kosmetik minor dari Najwa (bukan bug produk, informasional saja):
  badge Next.js Dev Tools indicator menimpa posisi tombol bell saat
  `bun run dev` — hanya muncul di development, tidak berdampak production,
  tidak ada action item formal.

---

## 2026-08-31 — T-036.1/.2 In-app notification domain skeleton + Supabase Realtime subscribe

### Context

Branch `feature/t-036-notification-realtime` (dari `staging`). Mulai
mengerjakan T-036 (In-app notification + Supabase Realtime) — rantai
**T-093 → T-036 → T-092** sudah tidak lagi terhambat sejak T-093 ditutup
Done (entri di atas). Dua subtask diselesaikan sesi ini: T-036.1 (domain
skeleton) dan T-036.2 (subscribe Realtime).

### T-036.1 — Domain skeleton: service + repository

Skeleton `NotificationService.notify()` + `notificationRepository.create()`
ternyata sudah ada sebelumnya (dibangun untuk fitur Transfer Ownership
T-008.3), tapi belum pernah punya test — beda dengan domain lain
(workspace, publishing, analytics) yang semuanya sudah punya
`.service.test.ts`. Ditambahkan
`apps/web/src/domains/notification/services/notification.service.test.ts`
(2 test case: delegasi ke `repository.create()` + return record yang
benar, termasuk kasus tanpa `relatedEntityType`/`relatedEntityId`
opsional). Lulus semua, lint bersih, `tsc --noEmit` bersih. Method CRUD
lain (list/markAsRead) sengaja tidak ditambah — ditunda ke T-036.4 (UI
panel) supaya tidak menulis kode yang belum ada consumer-nya.

### T-036.2 — Subscribe Supabase Realtime tabel `notifications`

File baru:

* `apps/web/src/lib/supabase/realtime/notifications.ts` —
  `subscribeToNotificationInserts(client, userId, onInsert)`: subscribe
  channel `notifications:{userId}`, event `postgres_changes` INSERT,
  filter `user_id=eq.{userId}`, plus mapper payload snake_case Realtime →
  `NotificationRecord` domain type. Return fungsi unsubscribe.
* `apps/web/src/lib/hooks/use-notification-realtime.ts` — hook React
  `useNotificationRealtime(userId, onInsert)`, pembungkus lifecycle
  (subscribe on mount saat `userId` tersedia, unsubscribe on
  unmount/`userId` berubah). Tidak merender JSX apa pun, jadi tidak masuk
  kategori "UI/UX-related" yang butuh gate Claude Design (rule 17
  AGENTS.md) — akan dipasang nanti oleh komponen bell (T-036.4).

**Temuan infra penting** (dicek via MCP Supabase, project
`ndcrkzqgqukqfmekgoze`): tabel `notifications` belum pernah dimasukkan ke
publication `supabase_realtime` (tidak ada satu pun tabel di publication
itu — Realtime tidak pernah broadcast apapun sebelumnya), dan RLS policy
yang ada (`notifications_workspace_isolation`) berbasis
`current_setting('app.current_user_id')` (pola server-side
`withCurrentUser`), bukan `auth.uid()` — tanpa perbaikan, subscription
Realtime akan tetap default-deny walau JWT bridge (T-036.3) sudah selesai
nanti.

**Perbaikan:** migration baru
`apps/web/prisma/migrations/20260831150000_t036_notifications_realtime_setup/migration.sql`
— (1) `ALTER PUBLICATION supabase_realtime ADD TABLE "notifications"`, (2)
`CREATE POLICY "notifications_realtime_own_rows" ON "notifications" FOR
SELECT USING ("user_id" = (auth.uid())::text)` (policy tambahan/permisif,
berdampingan dengan policy lama, tidak menggantikan). Migration ini sudah
dijalankan (`bun run db:deploy`) dan diverifikasi lewat MCP Supabase —
publication dan policy baru sudah ada di database. Tidak ada ADR baru
untuk temuan ini — ini closing gap yang memang sudah disyaratkan ADR-023
(`realtime-strategy.md` § "RLS pada Supabase Realtime"), bukan keputusan
arsitektur baru.

### Sisa scope T-036 (belum dikerjakan)

* **T-036.3** — sambungkan Supabase JWT dari session Better Auth ke hook
  `useNotificationRealtime` (saat ini masih pakai anon key polos,
  `createBrowserSupabaseClient()` tanpa JWT Realtime).
* **T-036.4** — UI notification bell + panel daftar. **Blocked** —
  dicek ke Claude Design (project "Social Media Management"), rancangan
  Notifications Panel belum ada (App Prototype menampilkan toast "Panel
  notifikasi belum ada layarnya" saat ikon bell diklik). Dicatat
  **KI-039**. Menunggu King Rezi membuat/mengonfirmasi desain (langsung
  atau lewat Neymar Product Designer).
* **T-036.5** — trigger notifikasi dari webhook publish result. Belum
  dikerjakan, depends T-026 yang juga belum selesai.

### Status

T-036 pindah dari `⏳ Not Started` ke `🟡 In Progress` (2/5 subtask
selesai). Tidak ada ADR baru ditulis sesi ini.

---

## 2026-08-31 — T-093 Accept Invite page ditutup Done (T-093.4 verifikasi RBAC end-to-end + fix bug Creator-akses-Members)

### Context

Sesi lanjutan menutup T-093 (Accept Invite page) yang di sesi sebelumnya
sudah menyelesaikan T-093.1–.3 (implementasi) tapi meninggalkan T-093.4
(verifikasi RBAC end-to-end dengan akun real kedua) sebagian — hanya
unit/integration test service-level, belum verifikasi browser dengan akun
nyata (dicatat **KI-038**). Najwa QA Engineer menuntaskan verifikasi dengan
**3 akun real** (Owner/Admin/Creator) di satu workspace ("Insvire").

### Hasil verifikasi RBAC (Najwa)

* Danger Zone hidden non-Owner — **PASS**
* Transfer Ownership target eligible (hanya Admin, bukan Creator) — **PASS**
* Update Role (siapa boleh ubah siapa) — **PASS** untuk Owner & Admin
* Remove Member (proteksi Owner/diri sendiri) — **PASS** untuk Owner & Admin

### Bug ditemukan & diperbaiki

Creator seharusnya "Tidak ada akses" ke halaman `/settings/members`
(`product-discovery/02-product/roles-permissions.md`), tapi sebelumnya
halaman tetap terbuka penuh dan mengirim data member+email ke client —
`MembersTable` cuma menyembunyikan tombol aksi per baris, tidak pernah
mengecek role si pengunjung halaman. Backend (`assertActorCanManageMembers`)
sudah benar sejak awal (tidak ada mutasi tidak sah yang berhasil saat
dites) — ini murni information-disclosure di level UI, risiko rendah tapi
nyata.

**Fix (Prabowo Feature Engineer, commit `6fdf272`):**

* `WorkspaceService.canManageMembers(workspaceId, actorUserId)` — method
  publik baru, reuse `assertActorCanManageMembers` yang privat (sudah
  dipakai `removeMember`/`updateMemberRole`/`inviteMember`), supaya
  kriteria RBAC tidak terduplikasi.
* `apps/web/src/app/(app)/settings/members/page.tsx` — gate
  `canManageMembers` dipanggil **sebelum** `listMembersWithUser`; kalau
  `false`, `redirect("/settings")` terjadi di server sebelum data member
  pernah diambil sama sekali (menutup celah information disclosure).
* 5 unit test baru di `workspace.service.test.ts` untuk `canManageMembers`
  (Owner/Admin true, Creator/non-member/non-Active false).
* Diverifikasi ulang live browser: Raka (Owner) & Maya (Admin) tetap akses
  penuh Members (tidak ada regresi), Sinta (Creator) langsung redirect ke
  `/settings` tanpa data member sempat tampil.
* Full suite: 229 passed, 4 skipped. Typecheck & lint bersih.

### Status

T-093 ditutup **✅ Done** (4/4 subtask selesai). **KI-038 Resolved**.
Rantai **T-093 → T-036 → T-092** tidak lagi terhambat T-093 — T-036
(In-app notification + Supabase Realtime) sekarang giliran berikutnya di
v0.1 tanpa blocker task lain. Dokumentasi diperbarui: `TASKS.md` (task
selesai 24 → 25, breakdown v0.1 12 ✅ → 13 ✅ · 7 🟡 → 6 🟡),
`tasks/v01-foundation.md` § T-093, `PROJECT_STATE.md` (Completed Ringkasan,
Blockers § Resolved, Top Next Tasks).

---

## 2026-08-31 — T-093 Accept Invite page (T-093.1–.3) + ADR-096 (RLS pra-membership)

### Context

King Rezi menutup gap yang sudah dicatat sejak ADR-080 (2026-08-14):
halaman `/invite/[token]` (accept-invite) belum pernah dibuat, sehingga link
Copy Link yang dihasilkan T-007.1/.6 404 kalau dibuka. Rantai dependency
Realtime (T-093 → T-036 → T-092, ADR-094) butuh invite-to-membership utuh
dulu supaya bisa diuji/dipakai dengan ≥2 akun nyata di satu workspace.
Dikerjakan Prabowo Feature Engineer (implementasi), lolos review arsitektur
Ridwan (2 temuan security langsung diperbaiki).

### Implemented

* Route `/invite/[token]` (`apps/web/src/app/(auth)/invite/[token]/`) —
  validasi token (valid/expired/invalid) + auto-detect `isExistingUser`
  (email invitation sudah punya akun atau belum).
* Alur Better Auth: sign-up (email baru) atau sign-in (email sudah
  terdaftar) — email dikunci ke invitation, tidak bisa diedit manual
  (email-bound, ADR-080). UI auto-detect (bukan pilihan manual user) sesuai
  desain final Claude Design `templates/accept-invite.html`.
* Insert `workspace_members` dengan role dari invitation (bukan default),
  mark invitation `accepted`, redirect ke `/` + cookie
  `active-workspace-id` (bukan `/[slug]`, ADR-076 sudah menghapus dynamic
  segment itu).
* Method baru langsung di `WorkspaceService` (bukan use-case terpisah),
  konsisten pola method lain di file yang sama.
* File: `apps/web/src/domains/workspace/{repositories/workspace.repository.ts, services/workspace.service.ts, services/workspace.service.test.ts, types.ts}`,
  `apps/web/src/lib/repositories/workspace/workspace.repository.ts` + test
  integrasi baru `workspace.repository.accept-invitation.test.ts`,
  `apps/web/src/lib/prisma/with-current-user.ts` (helper baru
  `setInviteLookupToken`), `apps/web/src/proxy.ts` (`/invite` masuk bypass
  list), UI baru `apps/web/src/app/(auth)/invite/[token]/{page.tsx, actions.ts, components/AcceptInvitePageClient.tsx, components/AcceptInviteForm.tsx}`.
* Test: 17 unit test baru (fake repository, service-level) + 1 integration
  test terhadap DB real (`workspace.repository.accept-invitation.test.ts`).

### ADR-096 — 3 migrasi RLS

Pola RLS untuk operasi pra-membership (baca invitation by token, update
status invitation, insert membership pertama) — SECURITY DEFINER function +
session-variable GUC, ditetapkan sebagai preseden untuk kasus serupa di masa
depan. 3 migrasi diterapkan ke DB dev, berurutan:

1. `20260831035427_t093_accept_invite_rls` — 3 policy RLS awal: SELECT
   invitation pending by token, UPDATE pending→accepted by invitee email
   match, INSERT `workspace_members` via accepted invitation.
2. `20260831042017_t093_invitation_select_visibility_fix` — bug fix:
   Postgres mensyaratkan baris UPDATE juga lolos minimal satu policy SELECT
   (bukan cukup WITH CHECK milik UPDATE-nya sendiri) — policy SELECT lama
   berhenti meng-cover baris begitu status berubah jadi `accepted`; ditambah
   policy SELECT baru: user selalu bisa lihat invitation yang emailnya
   cocok dengan emailnya sendiri apa pun statusnya.
3. `20260831044328_t093_code_review_rls_hardening` — 2 temuan review
   Ridwan: (a) policy SELECT token-lookup awal terlalu longgar (buka baca
   semua invitation pending, bukan cuma yang token-nya cocok) — diperbaiki
   pakai session-variable GUC pattern (`app.invite_lookup_token`, konsisten
   `app.current_user_id`), default-deny kalau GUC tidak di-set; (b) policy
   INSERT `workspace_members` tidak mengunci `role` pada baris hasil
   accept-invite — diperbaiki dengan menambah parameter role ke fungsi
   `has_accepted_invitation` sehingga role yang di-insert harus sama persis
   dengan role di invitation.

### Belum selesai (dicatat sebagai KI-038)

T-093.4 "verifikasi RBAC end-to-end dengan akun real kedua" (Owner vs Admin
vs Creator, browser 2-akun nyata) belum dilakukan di sesi ini — di luar
scope sesi implementasi, dicatat sebagai catatan terpisah untuk Najwa QA
Engineer. T-093 tetap `🟡 In Progress`, belum ditutup `✅ Done`.

### Docs

`tasks/v01-foundation.md` § T-093 (checklist T-093.1–.3 `[x]`, status
diupdate), `TASKS.md` (breakdown v0.1: 12 ✅ · 1 🚫 · 7 🟡 · 1 ⏸️ · 2 ⏳,
T-093 pindah ⏳→🟡), `PROJECT_STATE.md` (Completed Ringkasan, Recent
Decisions, KI-038 baru), `DECISIONS.md` + `decisions/ADR-096-*.md` (ADR
baru).

---

## 2026-08-28 — Follow-up PR #94: sisa drift setelah ganti base ke staging

### Fixed

* `context/ctx-technical-context.md` — kalimat Light/Dark Mode Toggle yang masih merujuk "neutral theme ini" diselaraskan ke Stone theme Astryx (ADR-087).
* `project-manager/PROJECT_STATE.md` — Current Focus Draft Editor yang masih menulis "modal fullscreen" diselaraskan ke default Standard (ADR-065), Fullscreen via toggle (ADR-052).

---

## 2026-08-28 — Docs Consistency Audit (scope: all) + Perbaikan Temuan Kelas A/B

### Context

King Rezi menjalankan `/docs-consistency-audit for all` — audit menyeluruh atas `project-manager/`, `context/`, dan `product-discovery/` (~160 file termasuk 95 ADR). Dieksekusi via 7 subagent paralel (3 batch ekstraksi ADR, 1 untuk `context/`, 2 untuk `product-discovery/`, 1 untuk status/hitungan `project-manager/`), disintesis jadi laporan tunggal, lalu King Rezi mengonfirmasi seluruh temuan Kelas A untuk diperbaiki + 2 temuan Kelas B (F20, F21).

### Fixed — Status/Hitungan Drift

* `TASKS.md` — catatan T-089.6 diupdate (KI-034 sudah Resolved, bukan lagi "belum lewat QA formal").
* `tasks/v02-publishing-mvp.md` — field Depends T-030 diupdate: T-033 sudah ✅ Done tapi tidak menambahkan entry point Cancel Schedule di Calendar (bukan lagi diblokir T-033).
* `PROJECT_STATE.md` — hitungan task 72→77 (sinkron dengan `TASKS.md`), Top Next Tasks ditambah T-093, deskripsi tema Astryx di "Current Focus" diperbaiki (Stone, bukan neutral, ADR-087).
* `ARCHITECTURE_OVERVIEW.md` — tabel Environment Topology diupdate (local menumpang staging, ADR-081), rentang ADR di "Source of Truth (Detail)" digeneralisasi (bukan lagi "s/d ADR-040" yang stale).

### Fixed — ADR Amendment Belum Tercermin di Baseline

* `realtime-strategy.md` — ditambahkan section baru "Perluasan ke `publishing_posts` (ADR-094)": channel per-workspace, granular client-side patch, RLS baru, dependency T-036; RT-D09 ditambahkan ke Decision Log.
* `integration-layer.md` — ditambahkan catatan promosi `IOutstandAdapter` ke `packages/shared/src/contracts/` (ADR-079); referensi `OutstandJobId` basi diganti `outstandPostId`/`platformPostId` (ADR-092).
* `database-strategy.md` — Related Documents diberi penanda deprecated untuk `publishing_queue_slots` (konsisten dengan badan dokumen, ADR-083).
* `dependency-strategy.md`, `monorepo-setup.md`, `06-engineering/README.md`, `ctx-development.md`, `ctx-implementation.md`, `ctx-technical-context.md` — requirement/frasa StyleX ("hindari pada tahap awal") diperbaiki jadi "dihapus total, permanen" (ADR-082); referensi `theme-neutral` diganti `theme-stone` (ADR-087) di seluruh file ini plus `design-tokens.md` (4 lokasi) dan tabel dependency-strategy.md.
* `dx-tooling.md`, `database-orm.md` — referensi project lokal terpisah `social-media-local` diperbaiki jadi "menumpang project staging" (ADR-081) di seluruh lokasi (tabel stack, script `db:migrate`, setup checklist, Related Documents).
* ADR-072, ADR-036 (file + indeks `DECISIONS.md`) — Status header dilengkapi ("Amended by ADR-080" dan "Addendum by ADR-041").

### Fixed — Terminologi & Referensi Mati

* `key-screen-patterns.md` § KSP-05 — 2 bagian (Identitas, Zona Fungsional) yang masih bilang variant Dialog "belum difinalkan, fullscreen default" diperbaiki jadi konsisten dengan `navigation-patterns.md` NP-D11: **Standard** adalah default final (ADR-065), Fullscreen alternatif via toggle.
* `ux-principles.md` — rujukan mati `CHANGELOG.md` (sudah dikonsolidasi ke `COMPLETE_TASK.md` sejak ADR-061) diperbaiki.

### Fixed — Pelanggaran Source of Truth (status di baseline doc)

* `success-metrics.md` — baris "Phase: Product Validation" (klaim fase proyek eksplisit di baseline) dihapus, diganti catatan pointer ke `PROJECT_STATE.md`.
* `code-conventions.md` — temuan review Ridwan (gap `try/catch`/`toActionError`) yang tertanam tanpa pointer diganti rujukan ke `PROJECT_STATE.md` § KI-036 (CC-D02).
* `pricing-strategy.md`, `mvp-definition.md`, `design-tokens.md` — field "Status: Draft/Baseline v1.0" level dokumen dihapus/disederhanakan atas keputusan eksplisit King Rezi (F20).

### Fixed — Drift Penamaan Fitur (F21, diinvestigasi mandiri atas permintaan King Rezi)

* `mvp-definition.md` diselaraskan dengan `feature-priority.md`: "AI Rewrite"→"Tone Rewrite", "Custom Analytics"→"Custom Reports", "AI Performance Insight"→"AI Performance Suggestions"; ditambahkan item yang sebelumnya cuma ada di salah satu dokumen ("Workspace Branding" ke `mvp-definition.md`; "AI Insights", "Team Activity Feed", "Hashtag Suggestions" ke `feature-priority.md`).

### F22 — Resolved (follow-up sesi yang sama, setelah dibahas)

Ambiguitas scope "Approval Workflow" (Could Have di `mvp-definition.md`) vs
"Advanced Approval Workflow" (Won't Have di `feature-priority.md`) vs UXP-06
("jangan approval berlapis") dibahas dan diputuskan: King Rezi mengonfirmasi
struktur role dipertahankan seperti sekarang — semua role (termasuk Creator,
role terbawah) tetap bebas Schedule/Publish sendiri tanpa gate approval dari
role lain (`roles-permissions.md`), konsisten dengan UXP-06 dan
`feature-priority.md`. `mvp-definition.md` diperbaiki: "Approval Workflow"
dihapus dari Could Have, dipindah ke Out of Scope dengan catatan alasan
(gate berlapis ditolak eksplisit oleh UXP-06; status konten `In
Review`/`Ready to Schedule` tetap Must Have sebagai label koordinasi
ringan, bukan gate).

---

## 2026-08-28 — ADR-095 Follow-up: 2 Custom ESLint Rule Menutup Known Limitation

### Context

Setelah PR #93 (ADR-095) dibuka, King Rezi menanyakan detail 2 known limitation yang didokumentasikan (`no-restricted-imports` tidak menjangkau dynamic import; `tailwindcss/no-arbitrary-value` tidak menjangkau arbitrary-value di variabel terpisah), lalu meminta keduanya ditutup dengan custom rule.

### Added

* `eslint.config.mjs` — 2 custom rule lokal (plugin inline, tanpa dependency baru): `local/no-dynamic-restricted-import` (block dynamic `import("@prisma/client")` dkk di domain layer, scope sama dengan `no-restricted-imports`) dan `local/no-arbitrary-value-in-variable` (block arbitrary-value Tailwind yang disimpan di `const`/assignment terpisah, scope sama dengan `tailwindcss/no-arbitrary-value`).

### Fixed

* `ChannelsSection.tsx` — `TRANSITION_FAST` (satu-satunya instans di seluruh codebase yang match pola ini, dikonfirmasi grep menyeluruh) sekarang tertangkap rule baru, diberi `eslint-disable-next-line local/no-arbitrary-value-in-variable` karena token-backed CSS var (legit, bukan magic number).
* `project-manager/decisions/ADR-095-*.md` — section Decision poin 6 diupdate: 2 known limitation sebelumnya sekarang dicatat sebagai closed via custom rule, dengan catatan sisa limitation (re-export pass-through tidak langsung tetap tidak terjangkau, butuh analisis lintas-file).

### Verification

Rule diverifikasi bekerja lewat probe file nyata (dynamic import ke `@prisma/client` di domain layer → tertangkap, file dihapus lagi setelah diverifikasi). `bun run lint`/`typecheck`/`test` — semua hijau: 0 error, 209 test passed/3 skipped.

---

## 2026-08-28 — ADR-095 Baseline Rendering Strategy, Code Conventions, Spacing Scale + ESLint Enforcement

### Context

King Rezi meminta "codify coding discipline" — menuliskan konvensi rendering, error handling, dan spacing yang sudah konsisten dipakai di kode nyata (Server Actions 100% mutation-only via `actions.ts`, hierarki error `AppError`/`ApplicationError`/`XxxDomainError`/`toActionError`, spacing 100% prop numerik Astryx kecuali 2 baris exception) sebagai baseline resmi, sekaligus menutup `TBD` skala Spacing yang menggantung sejak ADR-038, dan menambah enforcement tooling ESLint untuk mencegah drift ke depan.

### Added

* `product-discovery/06-engineering/rendering-strategy.md` — baru. Baseline rendering strategy Next.js (Server Component vs Client, Server Actions = mutation only/RS-D02, streaming, SSR/SSG/ISR).
* `product-discovery/06-engineering/code-conventions.md` — baru. Baseline naming convention + hierarki error handling (`AppError`/`ApplicationError`/`XxxDomainError`/`toActionError`, CC-D01/CC-D02).
* `project-manager/decisions/ADR-095-baseline-rendering-strategy-code-conventions-spacing-scale-server-actions-mutation-only.md` — baru, ADR lengkap. Indeks ditambahkan di `project-manager/DECISIONS.md` (baris paling atas, sebelum ADR-094).
* **T-094** (`tasks/v01-foundation.md`, sibling T-001/T-002, domain `platform/tooling`) — task baru untuk mencatat deliverable ADR-095, ditutup `✅ Done` (4 subtask: 3 selesai + 1 dibiarkan terbuka, cleanup dashboard, lihat KI-036). `TASKS.md` diperbarui: indeks v0.1 22→23 task (11✅→12✅), Total 76→77 task/23→24 selesai/169→173 subtask.
* **KI-036** (`PROJECT_STATE.md`) — dashboard (`app/(app)/page.tsx`) fetch data lewat Server Action, menyimpang RS-D02; Tech-Debt, tidak urgent, terkait ADR-095 + T-094.
* **KI-037** (`PROJECT_STATE.md`) — `design-tokens.md` section Spacing baru dikunci, belum disinkronkan ke Claude Design (pola reminder ADR-056); Process, terkait ADR-095 + ADR-056.

### Changed

* `product-discovery/06-engineering/design-tokens.md` — section Spacing dikunci (sebelumnya `TBD` sejak ADR-038): base 1 unit Astryx = 4px, skala terpakai 0/0.5/1/1.5/2/3/4/5/6/8 (0–32px) + panduan semantik penggunaan. Section Radius/Elevation tidak berubah, tetap `TBD`.
* `context/ctx-development.md`, `context/ctx-implementation.md`, `AGENTS.md` — pointer/index ditambahkan ke 2 dokumen baseline baru di atas.
* `eslint.config.mjs` — 3 rule baru: `no-restricted-imports` di `apps/web/src/domains/**` (block `@prisma/client`, `@supabase/supabase-js`, import langsung `lib/repositories/**`/`lib/adapters/**`/`**/generated/**`, menegakkan AGENTS.md rule 6), `no-restricted-syntax` (block `<div>` mentah di `apps/web/src/app/**/*.tsx` dan `apps/web/src/components/**/*.tsx`), `tailwindcss/no-arbitrary-value: "error"` (sebelumnya `off`). 6 lokasi arbitrary-value token-backed existing (`ChannelsSection.tsx`, `ConnectedAccountsList.tsx`) diberi `eslint-disable-next-line` + komentar alasan. Diverifikasi 0 pelanggaran sebelum diaktifkan sebagai `"error"`.

### Known deviation (sengaja tidak diperbaiki)

`apps/web/src/app/(app)/page.tsx` (dashboard) mengambil data lewat Server Action (`getDashboardSummaryAction`) untuk pure read — seharusnya panggil Application Service langsung dari Server Component seperti `apps/web/src/app/(app)/publish/calendar/page.tsx` (pola benar sesuai AGENTS.md rule 5 dan RS-D02). Diakui sebagai exception pra-existing di ADR-095, sengaja tidak diperbaiki sebagai bagian ADR ini — dicatat KI-036 + subtask terbuka T-094.4.

### Fixed (setelah review arsitektur Ridwan)

Ridwan Architecture Reviewer (read-only) menemukan 6 temuan atas perubahan
di atas — 4 langsung diperbaiki di sesi yang sama, 2 didokumentasikan
sebagai known limitation (tidak ada mitigasi otomatis tersedia):

* **Diperbaiki** — `eslint.config.mjs`: pattern `no-restricted-imports`
  domain layer bolong untuk `**/lib/prisma/**` dan `**/lib/supabase/**`
  (celah nyata dibuktikan Ridwan via probe file, sudah dihapus lagi) —
  ditambahkan ke `patterns`. Diverifikasi ulang: masih 0 pelanggaran.
* **Diperbaiki** — komentar jumlah arbitrary-value di `eslint.config.mjs`
  dikoreksi (sebelumnya "6", akurat "5 diberi disable comment, 2 lagi di
  `TRANSITION_FAST` tidak terjangkau rule sama sekali").
* **Diperbaiki** — `rendering-strategy.md`: klaim "0 `use client` di
  page.tsx/layout.tsx" salah — `settings/account/preferences/page.tsx`
  adalah exception yang tidak tercatat. Teks dikoreksi + dicatat sebagai
  known exception.
* **Diperbaiki** — `code-conventions.md` + `ADR-095`: klaim `toActionError`
  "sudah dipakai konsisten" dikoreksi — 3 file (`draft-editor/actions.ts`,
  `settings/account/actions.ts`, `onboarding/components/actions.ts`) belum
  migrasi, dicatat sebagai technical debt pra-existing.
* **Didokumentasikan sebagai known limitation** (tidak diperbaiki, bawaan
  keterbatasan rule) — `no-restricted-imports` tidak menjangkau dynamic
  import/re-export pass-through; `tailwindcss/no-arbitrary-value` tidak
  menjangkau arbitrary-value yang disimpan di konstanta string terpisah
  (contoh nyata: `TRANSITION_FAST`). Keduanya butuh custom ESLint rule
  untuk ditutup sepenuhnya — di luar scope sesi ini.

### Verification

`bun run lint` / `typecheck` / `test` — semua hijau: 0 error, 209 test passed / 3 skipped. Diverifikasi ulang setelah fix di atas, tetap hijau.

### Files

* `product-discovery/06-engineering/rendering-strategy.md` (baru)
* `product-discovery/06-engineering/code-conventions.md` (baru)
* `product-discovery/06-engineering/design-tokens.md` (section Spacing)
* `project-manager/decisions/ADR-095-baseline-rendering-strategy-code-conventions-spacing-scale-server-actions-mutation-only.md` (baru)
* `project-manager/DECISIONS.md` (baris index ADR-095)
* `context/ctx-development.md`, `context/ctx-implementation.md`, `AGENTS.md` (pointer)
* `eslint.config.mjs` (3 rule baru) + 2 file kode (`ChannelsSection.tsx`, `ConnectedAccountsList.tsx`, disable-comment)
* `project-manager/tasks/v01-foundation.md` (T-094 baru)
* `project-manager/TASKS.md` (indeks v0.1, Total, footnote ¹)
* `project-manager/PROJECT_STATE.md` (KI-036, KI-037, Recent Decisions, Completed Ringkasan, Metadata)

### Status

ADR-095 Accepted. T-094 `✅ Done` (1 subtask terbuka, tidak memblokir). KI-036 dan KI-037 `Open`, tidak memblokir M8.

---

## 2026-08-28 — ADR-094 Realtime Calendar + T-033 ditutup Done (T-033.7 dibatalkan)

### Context

Lanjutan diskusi ADR-093 (Import Posts) — King Rezi kembali ke rencana Realtime Calendar (opsi 1 dari diskusi awal sesi) dan meminta draft ADR untuk itu. Investigasi arsitektur menemukan 2 hal penting: (1) tidak ada Realtime subscription yang benar-benar hidup di aplikasi ini sekarang (T-036, satu-satunya konsumen bridge Better Auth↔Supabase JWT, masih Not Started); (2) RLS policy server-side existing (`current_setting`) tidak berlaku untuk koneksi Realtime client (butuh `auth.uid()`). Setelah ADR-094 disetujui, King Rezi menanyakan nasib T-033.7 (manual refresh control, sudah blocked karena tidak ada rancangan Claude Design) — apakah dihapus atau tetap dikerjakan mengingat Realtime akan menggantikan fungsi utamanya.

### Decisions

* **ADR-094** dibuat dan **Accepted**: mengamandemen RT-D01/RT-D02 (`realtime-strategy.md`) — tabel `publishing_posts` ditambahkan sebagai target Supabase Realtime kedua setelah `notifications`, khusus 4 screen Publish (Calendar, Queue, Drafts, History — History belum dibangun, wajib menyertakan pola ini sejak desain T-034). Channel per-workspace (`publishing_posts:{workspaceId}`, event INSERT/UPDATE, filter `workspace_id`), butuh RLS policy baru berbasis `auth.uid()` (varian baru dari RLS Policy Pattern, terpisah dari policy server-side yang sudah ada). Strategi update **granular client-side patch** (dipilih King Rezi meski lebih kompleks dari full `router.refresh()`, demi tidak mereset state lokal tiap screen) — tiap screen simpan state list sendiri, saat event masuk fetch 1 record termapping lalu upsert/remove ke local state; event echo dari aksi sendiri diproses sama (idempoten). **Hard dependency ke T-036** — wiring generic Supabase Realtime + JWT bridge dibangun di T-036 dulu (scope lebih kecil, sudah di backlog), fitur ini reuse, bukan jalan paralel/duluan.
* Setelah ADR-094 disetujui, King Rezi memutuskan **T-033.7 dibatalkan total** (bukan didesain ulang jadi fallback seperti yang sempat saya usulkan) — Realtime akan menangani sinkronisasi Calendar, tombol refresh manual berdiri sendiri dianggap tidak perlu lagi. Subtask ditandai `[x]` dengan strikethrough + alasan (pola sama T-018.1/.2), **bukan dihapus** (ID tidak didaur ulang). Scope-nya sengaja **tidak** dipindah ke task Realtime baru — kalau dibutuhkan lagi nanti (mis. fallback recovery), jadi task baru dengan ID sendiri.
* **T-033 ditutup `✅ Done`** — seluruh 8 subtask tertutup (7 diimplementasikan + 1 dibatalkan by design). Data Calendar untuk saat ini tetap manual-refresh apa adanya (tanpa tombol eksplisit) sampai task dari ADR-094 diimplementasikan.
* `TASKS.md` diperbarui: v0.2 breakdown 8✅·2🟡·11⏳ → **9✅·1🟡·11⏳** (T-030 tetap satu-satunya 🟡), total selesai 22→**23**. Task baru untuk ADR-094 **belum** ditulis ke `TASKS.md`/`tasks/v02-publishing-mvp.md` — menunggu sesi berikutnya.

### Files

* `project-manager/decisions/ADR-094-perluasan-supabase-realtime-publishing-posts-granular-patch.md` (baru)
* `project-manager/DECISIONS.md` (baris index ADR-094)
* `project-manager/tasks/v02-publishing-mvp.md` (T-033 status → Done, T-033.7 dibatalkan, catatan penutup)
* `project-manager/TASKS.md` (indeks release v0.2, Total, blok Fokus sekarang)

### Status

ADR-094 Accepted. T-033 `✅ Done`. Task implementasi dari ADR-094 (Realtime Calendar/Queue/Drafts/History) belum ditulis ke backlog — masih perlu sesi lanjutan.

### Lanjutan (sesi sama) — T-092 ditulis ke backlog

King Rezi minta lanjut menulis task implementasi ADR-094. **T-092 · Realtime Calendar/Queue/Drafts/History via Supabase Realtime** ditambahkan ke `tasks/v02-publishing-mvp.md` (6 subtask: T-092.1 RLS policy `auth.uid()`, T-092.2 wiring channel per-workspace reuse T-036, T-092.3–.5 granular patch Calendar/Queue/Drafts, T-092.6 granular patch History depends T-034). `Depends: T-036` (hard dependency, ADR-094 poin 4). ID global berikutnya setelah T-091 (nomor kosong v0.2 sudah habis, pola sama T-039/T-089/T-090/T-091). `TASKS.md` diperbarui: v0.2 21→22 task (breakdown 9✅·1🟡·12⏳), total 74→75 task, 159→165 subtask.

**Files tambahan:** `project-manager/tasks/v02-publishing-mvp.md` (section baru "Realtime Collaboration" T-092, Catatan Rilis diperbarui), `project-manager/TASKS.md` (indeks v0.2, Total).

**Status akhir:** ADR-093, ADR-094 Accepted. T-033 Done. T-090/T-091/T-092 `⏳ Not Started`, siap dikerjakan sesuai urutan dependency (T-092 menunggu T-036).

### Lanjutan lagi (sesi sama) — T-093 ditambahkan, rantai dependency dikoreksi

King Rezi mengoreksi rantai: sebelum T-036 → T-092, seharusnya ada **invite (add user to workspace) → user role** dulu. Investigasi menemukan halaman accept-invite (`/invite/[token]`) memang **belum pernah dibuat sama sekali** — gap yang sudah dicatat CodeRabbit di PR #73 (2026-08-14, ADR-080) sebagai "future work terpisah, belum ada nomor T-XXX", tapi tidak pernah dikonversi jadi task resmi sampai sekarang. Diklarifikasi ke King Rezi apakah "invite" dan "role" itu 1 atau 2 task — dipilih **1 task** dengan beberapa subtask (role sebenarnya sudah otomatis ter-assign dari invitation yang dibuat T-007.6, bukan langkah terpisah secara teknis).

**T-093 · Accept Invite page** ditambahkan ke `tasks/v01-foundation.md` (setelah T-007, domain `workspace`) — 4 subtask: route `/invite/[token]` + validasi token, buat akun/login via Better Auth (email-bound), insert `workspace_members` dengan role dari invitation, dan verifikasi/hardening RBAC end-to-end dengan akun real kedua (menutup gap QA T-008 yang sebelumnya cuma bisa diverifikasi via code review karena dev DB cuma 1 member). Tidak ada ADR baru — murni menutup gap yang sudah didokumentasikan ADR-072/080.

**Dependency chain diperbaiki:** T-036 (`tasks/v02-publishing-mvp.md`) sekarang `Depends: T-026, T-093`. Rantai lengkap: **T-093 → T-036 → T-092**. T-093 ditambahkan ke tabel "Fokus sekarang" `TASKS.md` sebagai root chain baru — tidak ada blocker eksternal (beda dari T-025 yang terhenti kredensial), bisa dikerjakan kapan saja.

**Files:** `project-manager/tasks/v01-foundation.md` (T-093 baru, Catatan Rilis), `project-manager/tasks/v02-publishing-mvp.md` (Depends T-036 ditambah), `project-manager/TASKS.md` (indeks v0.1, Total, Fokus sekarang, footnote ¹).

**Status akhir sesi:** v0.1 22 task (11✅·1🚫·6🟡·1⏸️·3⏳), v0.2 22 task (9✅·1🟡·12⏳). Total 76 task/169 subtask, 23 selesai. Rantai penuh menuju Realtime Calendar: T-093 → T-036 → T-092, ketiganya `⏳ Not Started`.

---

## 2026-08-28 — ADR-093 Import Posts + task T-090/T-091 ditambahkan ke backlog

### Context

Diskusi berawal dari perbandingan kode vs Claude Design untuk T-033 (Calendar), lalu meluas ke pertanyaan King Rezi soal fitur realtime ala Buffer (dua user melihat perubahan draft/schedule secara live). Investigasi arsitektur (`realtime-strategy.md`, RT-D01/RT-D02) mengonfirmasi Content Calendar saat ini manual-refresh, dan data post kita sendiri (Supabase/Prisma) adalah source of truth — Outstand cuma perantara publish via ACL. King Rezi lalu menemukan dokumentasi Outstand punya endpoint berbayar `POST /v1/social-accounts/{id}/imports` untuk menarik post yang dibuat langsung di platform (di luar tool kita), dan meminta ini dibangun sebagai fitur terpisah dari rencana Realtime Calendar (yang belum punya ADR sendiri, belum dieksekusi).

### Decisions

* **ADR-093** dibuat dan **Accepted**: status domain baru `ContentStatus.Imported` (terminal, immutable, read-only via guard repository), tampil di Calendar & History. Tiga jalur trigger — otomatis saat connect (sekali), periodik (Railway Cron harian, pola JOB-04), manual dari Settings "Sync Now" — ketiganya pakai watemark `lastImportedUntil` (kecuali trigger awal) supaya tidak mengulang seluruh rentang tiap kali. Dua job baru: `JOB-05` (trigger `import.sync`) dan `JOB-06` (processing webhook `import.completed`/`import.failed`, pola JOB-01). Guard concurrent-import per akun + **3 lapis pengaman biaya** khusus jalur manual (karena endpoint ini berbayar, kekhawatiran eksplisit King Rezi): RBAC Owner/Admin (reuse hak existing "kelola Connected Accounts", tanpa aturan baru), cooldown 24 jam per akun, dan cap **1x/minggu per workspace** (dihitung dari tabel `background_jobs` yang sudah ada sebagai audit log, tanpa skema counter baru — cap ini paling dominan, jauh lebih ketat dari cooldown). `PublishingPost.authorId` jadi nullable (null hanya untuk `Imported`). `FakeOutstandAdapter.importPosts` dipakai dulu (pola ADR-059) karena `OUTSTAND_API_KEY` asli belum ada.
* Ditemukan sekaligus (di luar scope ADR-093, sengaja ditrack terpisah): post `Published`/`Failed` yang dikirim lewat tool kita sendiri saat ini masih bisa dibuka ke Draft Editor lewat CTA di `CalendarPostPopover.tsx` — seharusnya read-only juga begitu sudah live di platform. Bukan bagian ADR-093 (beda kebutuhan RBAC/asal-usul dari `Imported`), jadi jadi task independen T-091.
* Dua task baru ditulis ke `TASKS.md` + `tasks/v02-publishing-mvp.md`: **T-090** (Import Posts, 5 subtask, ADR-093) dan **T-091** (read-only enforcement Published/Failed, 2 subtask, bug-fix tanpa ADR baru). Nomor kosong v0.2 (T-020–T-038) sudah habis sejak T-039 dipinjam v0.1, jadi keduanya memakai ID global berikutnya yang belum pernah dipakai (090, 091), pola sama T-039/T-089. Index `TASKS.md` diperbarui: v0.2 19→21 task, total 72→74 task/152→159 subtask; sekaligus dikoreksi drift breakdown status v0.2 (8✅·1🟡·10⏳ yang sudah tidak cocok dengan file aktual → 8✅·2🟡·11⏳, T-030 dan T-033 sama-sama In Progress).
* Kedua task (T-090.5 UI Import + T-091.2 UI read-only Popover) di-gate rule 17 `AGENTS.md` — belum boleh dikode sampai rancangannya dikonfirmasi di Claude Design; tidak ada mockup sama sekali untuk kartu `Imported` maupun state read-only Popover saat ini.
* Rencana Realtime Calendar (opsi Supabase Realtime ke `PublishingPost`, dibahas sebelum ADR-093) **belum** dituangkan jadi ADR/task — masih diskusi terbuka, disengaja dipisah dari sesi ini atas permintaan King Rezi ("jangan digabung dulu").

### Files

* `project-manager/decisions/ADR-093-import-posts-dari-social-account-status-imported-read-only.md` (baru)
* `project-manager/DECISIONS.md` (baris index ADR-093)
* `project-manager/tasks/v02-publishing-mvp.md` (section baru "Import" T-090, "Read-Only Enforcement" T-091, Catatan Rilis diperbarui)
* `project-manager/TASKS.md` (indeks release v0.2, Total, footnote ¹)

### Status

ADR-093 Accepted, T-090/T-091 `⏳ Not Started` — belum ada implementasi kode. Realtime Calendar masih diskusi, belum jadi ADR/task.

---

## 2026-08-27 — Polishing UI grid Calendar (Month & Week) sebelum T-033.7

### Context

Polishing/revisi UI di atas **T-033.1–.6 & T-033.8** (Calendar view, domain
`publishing`, `project-manager/tasks/v02-publishing-mvp.md` § T-033) yang
sudah `[x]` sebelumnya — **bukan** subtask baru, tidak mengubah checklist
task. Dilakukan sebelum T-033.7 (manual refresh control), yang tetap
**tidak** tersentuh sesi ini (masih blocked, tidak ada rancangan di Claude
Design). Branch `feature/calendar-design-system`, 2 commit: `ab1932f` dan
`8bba7ae`.

### Perubahan

Semua file di
`apps/web/src/app/(app)/publish/calendar/components/`:

- `CalendarMonthGrid.tsx`, `CalendarWeekGrid.tsx`, `calendar-grid-shared.ts`
  (commit `ab1932f`) — fix bug CSS Grid: grid 7-kolom tidak sejajar antar
  baris (track blowout — kolom dengan card lebar "mencuri" lebar kolom
  lain), diperbaiki via `isScrollable` per sel + `StackItem size="fill"`
  untuk truncation. **Bukan** `xstyle`/StyleX Astryx seperti rencana awal —
  compiler StyleX belum ter-setup di `apps/web` (dependency ter-install,
  babel/Next.js plugin belum), dicatat sebagai **KI-035**. Redesain kartu
  post: avatar+nama akun sejajar 1 baris, waktu post pojok kanan atas
  (Month), caption full-width baris terpisah (Week), indikator tipe konten
  Post/Reel/Story/Pin (pakai field `contentFormat` yang sudah ada di
  `CalendarItemTargetRecord`/`QueueItemTargetRecord`, bukan data baru).
  Footer status+content-format di mobile (≤768px, breakpoint konsisten
  collapse point `AppShell` mobile-nav) diganti `StatusDot`+`Icon` compact
  — `Badge` Astryx tidak punya prop ukuran/truncation (dicatat di
  **KI-035**), overflow di kolom sempit; `Badge`+`Badge` tetap dipakai
  >768px.
- `CalendarPostPopover.tsx` (commit `ab1932f`) — ditambah Badge
  content-format.
- `CalendarMonthGrid.tsx`, `CalendarWeekGrid.tsx`, `calendar-grid-shared.ts`
  (commit `8bba7ae`) — garis pemisah vertikal antar kolom hari ditambahkan
  (sebelumnya cuma horizontal antar baris), warna `border-border` (sama
  border Card/ClickableCard, bukan `border-border-strong` Divider
  horizontal). Gap grid dihapus (`gap={2}`→`{0}`, semua `<Grid columns=
  {CALENDAR_DAY_COLUMNS}>`) dikompensasi padding cell dinaikkan: Week
  `padding` sel jam 1→1.5, Month `paddingInline` +2 pada VStack sel hari
  (padding uniform 1 dipertahankan sisi atas/bawah).

### Temuan/rekomendasi dicatat sebagai Known Issue (KI-035, `PROJECT_STATE.md`)

Bukan blocker M8, tidak ada keputusan arsitektur final jadi belum layak
ADR — murni catatan referensi ke depan:

1. StyleX ter-install sebagai dependency tapi compiler-nya belum ter-setup
   di `apps/web` — kalau ke depan butuh `xstyle` Astryx (jalur resmi CLI
   untuk override track template `Grid` dkk), harus disetup dulu.
2. `Badge` Astryx tidak punya prop `size`/truncation — `StatusDot` dipakai
   sebagai alternatif compact di Calendar mobile, beda pola dari `Badge`
   yang dipakai Queue/Draft; perlu keputusan konsistensi kalau mau
   diperluas ke UI lain.
3. Layout Calendar di viewport sangat sempit (~375px, grid 7-kolom fixed)
   masih padat — perbaikan lanjutan (mis. tampilan agenda/list khusus
   mobile) butuh rancangan baru di Claude Design dulu (rule 17
   `AGENTS.md`), bukan sekadar tweak CSS lagi.

### Verifikasi

Verifikasi manual browser (perubahan murni CSS/layout, tidak menyentuh
domain/data-wiring — review arsitektur Ridwan & QA formal Najwa tidak
dijalankan untuk sesi ini). Kode sudah di-push ke
`feature/calendar-design-system` (commit `ab1932f`, `8bba7ae`).

---

## 2026-08-27 — T-033.8 Popover ringkasan post + CTA Draft Editor Calendar view selesai

### Context

Implementasi kode **T-033.8** (klik item Calendar → Popover ringkasan post +
CTA buka Draft Editor, `project-manager/tasks/v02-publishing-mvp.md` §
T-033, domain `publishing`), branch `feature/calendar-design-system`.
Direview arsitektur oleh Ridwan Architecture Reviewer (tanpa temuan) dan
lolos QA Najwa QA Engineer (tanpa bug fungsional; satu catatan inconclusive
soal tooling emulasi mobile viewport, bukan bug aplikasi). **T-033.7**
(manual refresh control) **TIDAK** dikerjakan sesi ini — di-STOP karena
tidak ada rancangannya sama sekali di Claude Design (AGENTS.md rule 17),
menunggu konfirmasi desain dari King Rezi.

### Perubahan

Semua file di `apps/web/src`, kecuali disebutkan lain:

- `app/(app)/publish/calendar/components/CalendarPostPopover.tsx` (BARU) —
  client component, Astryx `Popover` (BUKAN HoverCard, ADR-090/ADR-091),
  controlled `isOpen` lokal per kartu. Isi: header account+platform,
  avatar+status chip, caption, media placeholder (domain belum punya field
  media), 4 tile metrik untuk status Published (Views→`impressions`,
  Reach→`reach`, Replies→`comments`, Eng. Rate→`engagementRate`, format
  "–" kalau belum ada data), link "Go to post" (kalau `platformPostUrl`
  ada), CTA "Buka Draft Editor" (reuse `useDraftEditor().openEditDraft`,
  pola sama Queue).
- `app/(app)/publish/calendar/components/CalendarWeekGrid.tsx` dan
  `CalendarMonthGrid.tsx` — TODO/no-op `onClick` sebelumnya diganti wrap
  `ClickableCard` dengan `CalendarPostPopover`.
- `domains/publishing/repositories/publishing.repository.ts` — interface
  baru `CalendarItemTargetRecord extends QueueItemTargetRecord` + field
  `platformPostUrl: string | null` (dari `PublishingPostTarget.platformPostUrl`,
  kolom Prisma yang sudah ada tapi belum pernah di-expose ke domain — bukan
  migrasi baru).
- `lib/repositories/publishing/publishing.repository.ts` —
  `mapCalendarItem` memetakan `platformPostUrl`.
- `app/(app)/publish/calendar/page.tsx` — composition root sekarang
  instansiasi `AnalyticsService` dan pass sebagai `PostMetricsPort` ke
  `PublishingService` (sebelumnya tanpa argumen kedua, jadi `metrics`
  selalu kosong) — supaya metrik Published benar-benar terisi.
- `app/(app)/publish/calendar/components/calendar-grid-shared.ts` —
  `CalendarCardEntry` (kartu per-target) diperluas `connectedAccountId`,
  `metrics: PostMetricsRecord | null` (dicocokkan per
  `connectedAccountId` target), `platformPostUrl: string | null` di
  `flattenCalendarItemsToEntries`.
- `domains/publishing/services/publishing.service.test.ts` — fixture
  disesuaikan dengan field baru.

### Verifikasi

`bun run typecheck`, `bun run lint`, `bun run test` (root) — semua
bersih/pass (209 test pass, 3 skipped; tidak ada test baru ditambah —
pola project ini tidak unit-test file di folder "components" app-router,
cek lewat browser preview manual sebagai gantinya, konsisten T-033.3–.6).
Review arsitektur Ridwan — tanpa temuan. QA manual (main agent + Najwa):
Week & Month view, popover Scheduled & Published, exclusivity/dismiss
(klik kartu lain/klik luar/Escape), regresi toolbar (navigasi/filter),
regresi Queue & Drafts (tetap langsung buka Draft Editor tanpa Popover —
scope Popover khusus Calendar), dark mode, multi-target post (2 kartu
platform berbeda dari 1 post — data tidak tertukar) — semua pass. Satu
catatan non-blocking: emulasi mobile viewport di tooling browser pane
sempat tidak stabil saat QA (bukan bug aplikasi, inconclusive) — follow-up
verifikasi manual opsional, bukan bug tercatat.

### Scope belum dikerjakan (sengaja, bukan bug)

**T-033.7** (manual refresh control) — **blocked**, tidak ada rancangan
sama sekali di Claude Design, menunggu King Rezi membuat/mengonfirmasi
desain (AGENTS.md rule 17). Status task-level **T-033** tetap
`🟡 In Progress`.

---

## 2026-08-27 — T-033.5/.6 Navigasi periode + filter status/Channels Calendar view selesai

### Context

Implementasi kode **T-033.5** (navigasi periode: tombol Today, ‹ › prev/next,
label periode termasuk format lintas-bulan untuk Week, toggle Minggu/Bulan)
dan **T-033.6** (filter status post dropdown + filter Channels/akun di atas
grid) untuk Calendar view (`/publish/calendar`,
`project-manager/tasks/v02-publishing-mvp.md` § T-033, domain `publishing`),
branch `feature/calendar-design-system`. Direview arsitektur oleh Ridwan
Architecture Reviewer (tanpa temuan) dan lolos QA Najwa QA Engineer (golden
path + regresi pass).

### Perubahan

Semua file di `apps/web/src`:

- `domains/publishing/services/parse-calendar-view-state.ts` —
  `CalendarViewState` diperluas: `statuses: ContentStatus[]`,
  `connectedAccountIds: ConnectedAccountId[]`, parsing dari query param
  `status`/`accounts` (comma-separated, drop token invalid diam-diam).
- `domains/publishing/services/parse-calendar-view-state.test.ts` — test
  baru untuk parsing status/accounts, semua pass.
- `app/(app)/publish/calendar/page.tsx` — memanggil
  `WorkspaceService.listConnectedAccounts` (cross-domain via public API
  `@/domains/workspace`, pola sama `draft-editor/actions.ts`) untuk opsi
  filter Channels, meneruskan `statuses`/`connectedAccountIds` ke
  `PublishingService.listCalendarPosts`.
- `app/(app)/publish/calendar/hooks/useCalendarPeriodState.ts` —
  `setPeriod` diperluas untuk update `statuses`/`connectedAccountIds` di
  URL (dihapus dari URL kalau array kosong, bukan `status=` kosong).
- `app/(app)/publish/calendar/components/CalendarToolbar.tsx` (BARU) —
  client component: Today/‹/›, label periode, toggle Minggu/Bulan, filter
  status (7 opsi: All Posts + 6 `ContentStatus`, reuse
  `CONTENT_STATUS_LABEL`), filter Channels (Semua Akun + akun asli
  workspace). Semua Astryx (`Button`, `IconButton`, `Selector`).
- `app/(app)/publish/calendar/components/calendar-grid-shared.ts` —
  tambah `addMonths(date, months)` pure function.
- `app/(app)/publish/calendar/components/CalendarScreen.tsx` — render
  `CalendarToolbar` di atas grid, terima prop baru
  `accounts: ConnectedAccountRecord[]`.
- `app/(app)/publish/calendar/components/CalendarMonthGrid.tsx` —
  tambahan di luar scope asli T-033.5/.6 tapi ditemukan Najwa saat QA:
  Month view sebelumnya tidak punya `EmptyState` saat filter menghasilkan
  0 post (beda dengan Week view yang sudah punya sejak T-033.3). Sudah
  ditambahkan (`EmptyState` "Belum ada post di bulan ini").

### Verifikasi

`bun run typecheck`, `bun run lint`, `bun run test` (root) — semua
bersih/pass (209 test pass, 3 skipped, termasuk 2 file test Calendar).
Review arsitektur Ridwan — tanpa temuan (entry point bersih, domain logic
tanpa Prisma/Supabase, cross-domain lewat public API, shared types
konsisten). QA Najwa — semua golden path pass (navigasi lintas-bulan,
toggle Minggu/Bulan mempertahankan anchor date, filter status+akun
kombinasi, reload URL dengan query filter ter-restore benar, regresi ke
Queue/Drafts/History bersih, dark mode oke); gap kecil (EmptyState Month
view) ditemukan & ditutup di sesi yang sama, diverifikasi ulang browser.

### Scope belum dikerjakan (sengaja, bukan bug)

**T-033.7** (manual refresh control), **T-033.8** (Popover klik item +
CTA Draft Editor). Status task-level **T-033** tetap `🟡 In Progress`.

---

## 2026-08-27 — T-033.3/.4 Grid Week & Month Calendar view selesai

### Context

Implementasi kode **T-033.3** (grid Week) dan **T-033.4** (grid Month) untuk
Calendar view (`/publish/calendar`, `project-manager/tasks/v02-publishing-mvp.md`
§ T-033, domain `publishing`), branch `feature/calendar-design-system`.
Data-wiring dikerjakan Prabowo Feature Engineer, grid UI dikerjakan Mark UI
Engineer, review arsitektur oleh Ridwan Architecture Reviewer (1 temuan
duplikasi logic, diperbaiki langsung di sesi yang sama).

### Perubahan

File baru:
- `apps/web/src/domains/publishing/services/calendar-range.ts` + `.test.ts`
  — pure function domain `publishing`: `getWeekRange(date)` /
  `getMonthRange(date)`, menghitung rentang tanggal awal/akhir untuk grid.
- `apps/web/src/app/(app)/publish/calendar/components/CalendarWeekGrid.tsx`
  — grid 7 hari × 12 slot waktu (per 2 jam).
- `apps/web/src/app/(app)/publish/calendar/components/CalendarMonthGrid.tsx`
  — grid 7 hari × N minggu, padding hari di luar bulan aktif (muted), badge
  "+N More" untuk sel padat (maks 3 kartu per sel, expand di tempat —
  bukan silently truncate).
- `apps/web/src/app/(app)/publish/calendar/components/calendar-grid-shared.ts`
  — util bersama Week/Month: flatten `CalendarPostItem[]` → kartu per
  target akun, format tanggal (UTC).
- `apps/web/.claude/launch.json` — config preview dev server, ditambahkan
  untuk kebutuhan verifikasi browser Mark UI Engineer (belum ada
  sebelumnya).

File diubah:
- `apps/web/src/domains/publishing/index.ts` — tambah export
  `calendar-range` + `effectiveCalendarDate`.
- `apps/web/src/domains/publishing/services/sort-calendar-items.ts` —
  fungsi privat `effectiveDate` diekspor jadi `effectiveCalendarDate`
  (public). **Perbaikan temuan Ridwan:** sebelumnya UI (`calendar-grid-shared.ts`)
  menghitung ulang aturan "tanggal efektif" post secara terpisah dari
  domain, dengan behavior yang mulai divergen — sekarang direuse dari satu
  sumber kebenaran di domain.
- `apps/web/src/app/(app)/publish/calendar/page.tsx` — composition root
  nyata: `getWorkspaceContext` + `getCachedSession` + `getWeekRange`/
  `getMonthRange` + `PublishingService.listCalendarPosts` (tanpa
  `statuses`/`connectedAccountIds`/`PostMetricsPort` — sesuai scope; filter
  & metrics itu T-033.6/.8 terpisah).
- `apps/web/src/app/(app)/publish/calendar/components/CalendarScreen.tsx`
  — dispatcher `view === "month" ? <CalendarMonthGrid/> : <CalendarWeekGrid/>`,
  `EmptyState` placeholder (dari T-033.2) diganti grid asli.

### Verifikasi

`tsc --noEmit` bersih, `eslint` bersih (1 warning config eksisting tidak
terkait), 45 test Vitest pass, review arsitektur Ridwan clean setelah 1
fix, browser preview manual (Week & Month, data post asli, status
Scheduled/Published, badge status, padding hari muted di Month, highlight
hari-ini) OK.

### Scope belum dikerjakan (sengaja, bukan bug)

Subtask terpisah menyusul: **T-033.5** (navigasi Today/‹/›/toggle
Minggu-Bulan), **T-033.6** (filter status+akun), **T-033.7** (manual
refresh), **T-033.8** (Popover klik item + Draft Editor CTA). Status
task-level **T-033** tetap `🟡 In Progress`.

---

## 2026-08-27 — T-033.2 State periode Calendar via query param selesai

### Context

Implementasi kode **T-033.2** (state periode Calendar via query param,
`project-manager/tasks/v02-publishing-mvp.md` § T-033, domain `publishing`)
sudah selesai oleh Prabowo Feature Engineer di branch
`feature/calendar-design-system`, route tunggal `/publish/calendar` (ADR-046,
tidak menambah route baru).

### Perubahan

File baru:
- `apps/web/src/domains/publishing/services/parse-calendar-view-state.ts` —
  pure function domain `publishing` (tanpa I/O, tidak import
  Prisma/Supabase/HTTP) parsing & validasi `view`/`date` dari query param.
  Tipe `CalendarViewMode` (`"week" | "month"`), `CalendarViewState`.
- `apps/web/src/domains/publishing/services/parse-calendar-view-state.test.ts`
  — 18 test case (default, valid, invalid, case-sensitivity, duplicate query
  param/array, string kosong/whitespace, non-numeric, `Infinity`).
- `apps/web/src/app/(app)/publish/calendar/components/CalendarScreen.tsx` —
  placeholder Astryx (`Card`+`Badge`+`EmptyState`, bukan raw `<div>`)
  menampilkan state `view`/`date` ter-parse; akan digantikan grid asli di
  T-033.3/.4.
- `apps/web/src/app/(app)/publish/calendar/hooks/useCalendarPeriodState.ts` —
  fondasi client hook (`"use client"`, `usePathname`/`useRouter`/`useSearchParams`)
  untuk T-033.5 nanti: baca state via `parseCalendarViewState` yang sama +
  `setPeriod()` push ke URL via `router.replace` (bukan `push`, supaya
  toggle/navigasi periode tidak menumpuk history). Belum dipakai di UI mana
  pun — sengaja hanya fondasi, di luar scope UI T-033.2.

File diubah:
- `apps/web/src/app/(app)/publish/calendar/page.tsx` — Server Component
  tipis: `await searchParams` → `parseCalendarViewState` → render
  `CalendarScreen`. Tidak ada business logic di entry point (rule 5
  `AGENTS.md`).
- `apps/web/src/domains/publishing/index.ts` — tambah 1 baris export barrel.

Parsing & fallback:
- `view`: valid hanya kalau persis `"month"` (case-sensitive, lowercase) —
  selain itu (termasuk `"week"`, hilang, typo, casing lain seperti
  `"Month"`) → default `"week"`.
- `date`: diperlakukan sebagai epoch milliseconds. Hilang/kosong/whitespace/
  non-numeric/`Infinity`/`NaN` → default hari ini (jam server).
- Query param diulang (array, mis. `?view=week&view=month`) → ambil elemen
  pertama.

### Verifikasi

`bun run typecheck`, `bun run lint`, `bun run test` semua bersih (193
passed, 3 skipped, tidak ada regresi). Verifikasi browser end-to-end (akun
test Raka Pratama): golden path (tanpa query param → Tampilan Minggu + hari
ini), `?view=month&date=<valid>` → Tampilan Bulan + tanggal sesuai,
`?view=yearly&date=not-a-number` (invalid) → fallback benar ke default.

### Keputusan implementasi (dikonfirmasi King Rezi di sesi ini)

1. Format `date` pakai epoch milliseconds (bukan ISO string) — sesuai
   literal task `?date=<timestamp>`, tidak ada precedent lain di codebase.
2. `view` case-sensitive (lowercase only) — `?view=Month` invalid → fallback
   week. Dikonfirmasi eksplisit, tidak diubah.
3. Nama hook `useCalendarPeriodState`/method `setPeriod` — pilihan
   sementara, mudah di-rename saat T-033.5 dikerjakan karena belum ada
   consumer.

### Dokumentasi

- `project-manager/tasks/v02-publishing-mvp.md` — checkbox **T-033.2**
  ditandai selesai (`[x]`). T-033 (task-level) tetap `🟡 In Progress` —
  T-033.3–.8 masih terbuka.
- `project-manager/TASKS.md` — tidak ada perubahan angka; jumlah subtask
  T-033 tetap 8, task-level v0.2 tidak berubah.

---

## 2026-08-27 — T-033.1 Calendar query selesai

### Context

Implementasi kode `PublishingService.listCalendarPosts` (query post per
rentang tanggal + filter akun + filter status, hanya status
Scheduled/Published/Failed sesuai keputusan yang sudah dicatat di section
T-033 `tasks/v02-publishing-mvp.md`, 2026-08-26) sudah selesai, lolos test
Vitest, `tsc`/`eslint` bersih, dan sudah di-commit + push ke PR #91
(`feature/calendar-design-system` → `staging`, goal PR = T-033 penuh).

### Perubahan dokumentasi

- `project-manager/tasks/v02-publishing-mvp.md` — checkbox **T-033.1**
  ditandai selesai (`[x]`). T-033 (task-level) tetap `⏳ Not Started` /
  belum Done — T-033.2–.8 masih terbuka.
- `project-manager/TASKS.md` — tidak ada perubahan angka; jumlah subtask
  T-033 tetap 8 (tidak ada subtask ditambah/dihapus), task-level v0.2 tidak
  berubah.

---

## 2026-08-26 — Redesain kontrak ACL Outstand (ADR-092)

### Context

Ditemukan saat verifikasi gap T-033 (Calendar): setelah membaca dokumentasi
resmi Outstand API (create-a-post, get-post-details, list-posts,
get-post-analytics, post-lifecycle), kontrak `IOutstandAdapter` yang ada
sebelumnya ternyata tidak merefleksikan bentuk API asli — `create-a-post`
menerima SEMUA akun target dalam satu call dan mengembalikan satu `post.id`
(bukan satu job per akun), status per akun baru tersedia async, dan tidak
ada endpoint retry resmi.

### Perubahan

- `IOutstandAdapter.schedulePost`/`publishNow` diredesain menjadi satu call
  yang menerima `targets[]` dan mengembalikan satu `outstandPostId`.
- Method baru `fetchPostOutcome(outstandPostId)` untuk resolve status per
  akun (polling sekarang, webhook T-026 nanti tanpa rework kontrak).
- `cancelScheduledPost` sekarang dipanggil sekali per post.
- Schema Prisma: `PublishingPost.outstandPostId` (baru),
  `PublishingPostTarget.outstandJobId`/`.publishedUrl` diganti
  `.platformPostId`/`.platformPostUrl`. Migration
  `20260826092111_redesign_outstand_acl_contract` sudah diterapkan ke DB
  dev (`prisma migrate diff` bersih).
- `IPublishingRepository.markPostFailed` diperluas: transisi dari
  `Scheduled` juga didukung (sebelumnya hanya dari `Published`), karena
  1-call-semua-target berarti gagalnya schedulePost bersifat all-or-nothing.
- File yang berubah: `packages/shared/src/contracts/outstand-adapter.ts`,
  `apps/web/src/domains/publishing/adapters/outstand-adapter.ts`,
  `apps/web/src/lib/adapters/outstand/fake-outstand-adapter.ts`,
  `apps/web/src/domains/publishing/repositories/publishing.repository.ts`
  (+ implementasi Prisma), `schedule-posts.use-case.ts`,
  `publish-now.use-case.ts`, `cancel-schedule.use-case.ts`,
  `analytics-ingestion.use-case.ts` (rename parameter), Prisma schema +
  migration.

### Verifikasi

`bun run test` (179 passed, 3 skip butuh DB asli), `typecheck`, `lint`
bersih — dilakukan oleh Elon Backend Engineer di sesi ini.

### Dokumentasi

- ADR baru: **ADR-092** (`project-manager/decisions/ADR-092-redesain-kontrak-acl-outstand-1-call-semua-target-polling-outcome.md`).
- Catatan follow-up ditambahkan di task **T-034** (`tasks/v02-publishing-mvp.md`)
  soal retry manual (T-034.4) wajib mengikuti pola delete-lalu-create-ulang
  Outstand, bukan re-trigger generik.
- Gap diketahui, belum diselesaikan: bentuk hasil
  `fetchPostMetrics`/`fetchWorkspaceMetrics` (T-041) belum direvisi
  mengikuti response asli `get-post-analytics` — dievaluasi ulang saat
  T-041 disentuh lagi.

---

## 2026-08-26 — Bug fix T-029 (Publish Now) + koreksi mockup T-033 Calendar

### Context

Ditemukan saat verifikasi T-033 (Calendar): `PublishNowUseCase` tidak
pernah men-set `PublishingPost.status` jadi `Failed` walau semua target
gagal publish — melanggar aturan yang sudah ada di
`integration-layer.md:269-270,305`. Diperbaiki oleh Prabowo Feature
Engineer di sesi ini. Terpisah, King Rezi juga mengonfirmasi koreksi
mockup Claude Design untuk T-033 terkait status apa saja yang boleh
muncul di grid Calendar.

### Bug fix T-029 (Publish Now)

* Repository method baru `markPostFailed` — idempoten, hanya update
  baris yang masih status `Published` — ditambahkan ke interface
  `IPublishingRepository`
  (`apps/web/src/domains/publishing/repositories/publishing.repository.ts`)
  + implementasi Prisma
  (`apps/web/src/lib/repositories/publishing/publishing.repository.ts`).
* `apps/web/src/domains/publishing/services/publish-now.use-case.ts`:
  setelah `Promise.all` publish ke semua target selesai, kalau SEMUA
  outcome gagal → panggil `markPostFailed`. Kalau minimal satu target
  sukses (partial atau full) → tetap `Published`, tidak berubah dari
  perilaku sebelumnya.
* Test baru: 3 skenario (semua gagal, partial, semua sukses) — semua
  pass. Diverifikasi: `tsc --noEmit` bersih, `eslint` bersih, tidak ada
  regresi (151 test lain tetap pass).
* Fitur inti T-029 tetap `✅ Done` — ini murni koreksi bug korektnes,
  bukan perubahan status task. Detail: `tasks/v02-publishing-mvp.md`
  § T-029.

### Koreksi mockup Claude Design T-033 (Calendar)

* `templates/publish-calendar.html` — 3 card yang sebelumnya berstatus
  "Ready to Schedule" (Week: TikTok "Video latte art 15 detik"; Month:
  X "Countdown grand launching" & TikTok "Tutorial latte art") diubah
  jadi "Scheduled".
* Alasan: dikonfirmasi dengan King Rezi bahwa status
  `Draft`/`In Review`/`Ready to Schedule` tidak pernah punya
  `scheduledAt` (`roles-permissions.md:131-136`), sehingga tidak
  seharusnya muncul di grid Calendar sama sekali.
* Keputusan implementasi final: grid Calendar (Week & Month) hanya
  menampilkan post berstatus Scheduled, Published, Failed. Draft/In
  Review/Ready to Schedule tidak pernah muncul di grid. Query
  `listCalendarPosts` (T-033.1) sudah benar secara alami untuk aturan
  ini, tidak ada perubahan kode. Filter dropdown status (T-033.6) tetap
  6 opsi, tidak diubah — hanya contoh card di mockup yang dikoreksi.
* Bukan perubahan baseline (menyelaraskan implementasi dengan
  `roles-permissions.md` yang sudah ada), tidak ada ADR baru. Detail:
  `tasks/v02-publishing-mvp.md` § T-033.

---

## 2026-08-26 — T-033 Calendar view: Design System selesai (Claude Design)

### Context

Lanjutan sesi T-033 (dua entri di bawah: perencanaan UX + ADR-090, lalu
koreksi ADR-091). Setelah dokumentasi disinkronkan, King Rezi lanjut
eksekusi ke Design System (Claude Design, project "Social Media
Management") — sebagian dikerjakan langsung oleh King Rezi memakai
prompt yang disiapkan AI utama, sebagian dieksekusi AI utama langsung
lewat `DesignSync` setelah King Rezi melaporkan hasil yang keliru.

### Hasil akhir di Claude Design

* `templates/publish-calendar.html` — dua state referensi (Week: grid
  per-jam × 7 hari; Month: grid tanggal 1 bulan + badge "N More"),
  **ditumpuk vertikal** (bukan side-by-side seperti percobaan pertama —
  dikoreksi karena grid Calendar terlalu lebar untuk pola horizontal,
  beda dari card auth 380px yang jadi acuan awal). Navigasi Today/‹/›/
  label periode + filter Status/Channel per state. Tombol **New Post**
  dipindah ke `.page-head` sejajar judul halaman di kanan atas (pola
  sama `publish-queue.html`) — sebelumnya berdiri sendiri di bawah grid.
* `components/popover.html` — komponen baru, anatomi Header+Body+Trigger
  Astryx `Popover` (bukan `HoverCard`, ADR-091) terverifikasi
  `astryx component --dense`, dengan tulisan penjelasan koreksi
  HoverCard-vs-Popover di dalamnya.
* `templates/app-prototype/AppPrototype.dc.html` — klik item Calendar
  → `openPostPopover()` → CTA → `triggerEditDraft()` (Queue/Drafts tidak
  berubah); toggle Minggu/Bulan diwire nyata via `applyCalendarView()`
  (class `.cal-view-select`, sengaja **bukan** `data-proto` supaya tidak
  bentrok delegated click-listener runner yang men-`preventDefault()`
  semua elemen `[data-proto]` — pola sama dengan filter Engage yang
  pakai id polos). Default Week, tidak persist antar navigasi (sama
  seperti aturan Dark Mode toggle).
* `readme.md` — bagian "Calendar — Week/Month States & Post Preview
  Popover" diperbarui menjelaskan koreksi layout (stacked, bukan
  side-by-side) dan status wiring toggle.

### Status

**Murni Design System — belum ada kode `apps/web`.** Checkbox
T-033.1–.8 di `tasks/v02-publishing-mvp.md` tetap terbuka (rencana
mockup ≠ implementasi kode); ditandai selesai satu per satu saat
implementasi asli berjalan. Langkah berikut: design review, baru
implementasi kode dimulai.

---

## 2026-08-26 — Koreksi ADR-090: Popover (bukan HoverCard) untuk preview post Calendar (ADR-091)

### Context

Lanjutan sesi T-033 (entri di bawah). King Rezi mulai eksekusi ADR-090 di
sesi Claude Design (Design System), dan agent di sana melaporkan tidak
bisa menjalankan `astryx` CLI untuk verifikasi anatomi `HoverCard` (tidak
ada akses shell di lingkungan Claude Design). King Rezi meneruskan
pertanyaan itu ke AI utama, yang punya akses langsung ke `apps/web`.

### Temuan

AI utama menjalankan `astryx component HoverCard --dense` dan
`astryx component Popover --dense` langsung dari `apps/web` (CLI resmi
ter-pin v0.1.8, rule 15 AGENTS.md) dan menemukan **ADR-090 salah pilih
komponen**:

* `HoverCard` — trigger resminya hover/focus (`delay: 300ms`,
  `hideDelay: 200ms`), **tidak punya prop `isOpen` controlled** (hanya
  `isDefaultOpen` saat mount), dan guideline resminya eksplisit melarang
  menaruh critical action (CTA "Edit" ke Draft Editor) di dalamnya.
* `Popover` — click-triggered secara resmi, punya `isOpen`/
  `onOpenChange` controlled, anatomi Header+Body+Trigger — cocok persis
  dengan rencana awal King Rezi (klik item → ringkasan + CTA).

King Rezi setuju amandemen ke Popover.

### Perubahan

* **ADR baru:** `project-manager/decisions/ADR-091-amandemen-adr-090-popover-bukan-hovercard-untuk-preview-post-calendar.md`.
* `ADR-090` — Status diperbarui jadi "Accepted — Amended by ADR-091";
  body (append-only) tidak diedit.
* `DECISIONS.md` — entri ADR-091 ditambahkan, kolom Status ADR-090
  diperbarui.
* `product-discovery/04-ux/key-screen-patterns.md` — KSP-02-F04/F08 dan
  seluruh sebutan di Zona Fungsional/State Handling: HoverCard → Popover.
* `product-discovery/04-ux/navigation-patterns.md` — pola "Item →
  Editor" (baris Calendar) dan NP-D15: HoverCard → Popover.
* `project-manager/tasks/v02-publishing-mvp.md` § T-033 — field ADR,
  catatan referensi UX, dan T-033.8: HoverCard → Popover (+ catatan
  koreksi).
* `project-manager/TASKS.md` — catatan T-033 dan koreksi hitungan:
  HoverCard → Popover (jumlah subtask tidak berubah, tetap 8/152 total).

### Status

Ditemukan **sebelum** satu markup pun ditulis di Claude Design — tidak
ada rework kode/desain, murni koreksi dokumentasi sebelum eksekusi
lanjut. Interaksi dan konten yang disepakati King Rezi (klik item →
ringkasan + CTA Edit) tidak berubah sama sekali.

---

## 2026-08-26 — Perencanaan T-033 Calendar view: sinkronisasi dokumentasi vs referensi Buffer (ADR-090)

### Context

King Rezi memulai kerja pada T-033 (Calendar view, Publishing MVP) di
branch baru `feature/calendar-design-system`, mengikuti alur kerja
dokumentasi → Design System → implementasi kode (belum di tahap
implementasi). Sebelum menyentuh Claude Design, King Rezi mengeksplorasi
halaman Calendar Buffer (week view per-jam, month view + "N More", klik
post → popover ringkasan metrik, filter Channels/Status/Tags/Timezone,
navigasi Today/prev-next, state via URL) dan meminta agent mengecek
kesesuaiannya dengan baseline `context/`/`product-discovery/` sebelum
lanjut — sesuai rule 17 AGENTS.md (gate desain) dan alur kerja custom
yang disepakati untuk sesi ini.

### Riset & keputusan

Riset dokumentasi (T-028, KSP-02, navigation-patterns, domain-model,
ADR-046/052) menemukan beberapa gap antara referensi Buffer dan baseline
existing. Setelah dikonfirmasi ke King Rezi:

1. **Tags & Timezone filter per-view: tidak diadopsi** — konsisten
   dengan alasan penolakan yang sama di T-032.0 (Queue): tidak ada
   konsep Tag di domain model, Timezone bukan setting per-view di
   backlog. Tidak ada perubahan baseline, tidak butuh ADR.
2. **Route Calendar: tetap satu** `/publish/calendar` (ADR-046, tidak
   diamandemen), state view (week/month) + date dibawa lewat query param
   `?view=week|month&date=<timestamp>` — bukan dua route terpisah.
3. **Klik item Calendar → Astryx `HoverCard` dulu, baru CTA ke Draft
   Editor** — dikonfirmasi Astryx punya komponen ini via `astryx
   component` sebelum diputuskan (rule 15 AGENTS.md). Ini mengubah pola
   interaksi KSP-02-F04 yang sudah Accepted, sehingga dicatat sebagai
   **ADR-090** (khusus Calendar; Queue dan Drafts tidak berubah, tetap
   klik → langsung Draft Editor).

### Dokumentasi yang disesuaikan

* **ADR baru:** `project-manager/decisions/ADR-090-hovercard-astryx-preview-post-calendar-amandemen-ksp-02-f04.md`
  + entri di `DECISIONS.md`.
* `product-discovery/04-ux/key-screen-patterns.md` § KSP-02 — F04 direvisi
  (HoverCard dulu), F08 baru (HoverCard Ringkasan Post, mapping metrik ke
  `PostMetrics`: Views→`impressions`, Reach→`reach`, Replies→`comments`,
  Eng. Rate→`engagementRate`), F09 baru (Filter Status & Channel, catat
  Tags/Timezone tidak diadopsi), F05 diperluas (Today/prev-next/label
  lintas-bulan/query param), Zona Fungsional & State Handling diperbarui
  (grid per-jam Week, grid Month + "N More").
* `product-discovery/04-ux/navigation-patterns.md` — baris Calendar di §
  "Pola: Item → Editor" direvisi (lewat HoverCard), Queue/Drafts tidak
  diubah; row **NP-D15** baru ditambahkan.
* `project-manager/tasks/v02-publishing-mvp.md` § T-033 — ADR field +
  ADR-090, subtask dipecah dari 4 jadi 8 (T-033.1–.8: query, query-param
  view/date, grid Week, grid Month, navigasi periode, filter
  status+channel, manual refresh, HoverCard+CTA Draft Editor).
* `project-manager/TASKS.md` — total subtask 148 → **152** (v0.2: T-033
  4 → 8 subtask), dihitung ulang langsung dari file task, bukan
  increment manual.

### Status

Murni dokumentasi — **belum ada implementasi kode maupun perubahan
Claude Design**. Langkah berikutnya menunggu arahan King Rezi: lanjut ke
Design System (Claude Design, mengikuti breakdown T-033 di atas), lalu
design review, baru implementasi `apps/web`.

---

## 2026-08-24 — QA formal Najwa T-089.6 (ADR-089): KI-034 closed (Resolved)

### Context

Lanjutan T-089.6 (entri di bawah): kode dialog konfirmasi Tier 2 sebelum
switch workspace sudah diselaraskan dan diverifikasi end-to-end browser
oleh AI utama, tetapi belum lewat proses QA Najwa formal seperti
T-089.2–.4 sebelumnya — gap ini dicatat sebagai **KI-034**
(`PROJECT_STATE.md`). King Rezi meminta Najwa QA Engineer menjalankan QA
formal untuk menutup gap tersebut.

### Hasil QA

* `bun run typecheck`, `bun run lint`, `bun run test` — semua PASS (157
  passed, 3 skipped, 0 gagal).
* Golden path browser (localhost:3000, akun Raka Pratama/Insvire) — 6
  langkah PASS: list workspace benar; klik row non-aktif membuka
  `AlertDialog` dengan judul dinamis benar; Batal membatalkan tanpa efek;
  Pindah berhasil redirect + workspace aktif berubah; chip Aktif berpindah
  benar setelah kembali ke halaman; regresi dialog "Buat Workspace Baru"
  aman.
* 2 edge case tambahan (dari 3 temuan code-review low-severity
  sebelumnya):
  1. Escape + klik row lain saat switch masih in-flight — **tidak
     reproducible** (request switch selesai ~1ms di localhost, jauh lebih
     cepat dari race window). Catatan analisis: secara teoretis di
     network production yang lambat, Escape bisa menutup `AlertDialog`
     sebelum switch selesai (`AlertDialog` tidak punya guard tambahan
     terhadap `isSwitchPending` di `onOpenChange`) — tapi dampaknya hanya
     UX minor (row tetap menunjukkan "Memindahkan..." dan disabled sampai
     selesai, redirect/error tetap jalan normal, tidak ada state korup
     atau crash). Bukan bug baru, hanya konfirmasi ulang salah satu dari
     3 temuan code-review low-severity yang sudah pernah dilaporkan
     (sebagian — stale loading spinner — sudah diperbaiki sebelumnya).
  2. Refresh saat dialog terbuka — PASS, tidak reproducible sebagai bug
     (state dialog cuma `useState` client-side, hilang wajar saat reload,
     workspace aktif tidak berubah).
* Tidak ada bug baru ditemukan. Najwa tidak mengubah kode apa pun (murni
  QA), dan mengembalikan workspace aktif ke kondisi semula ("Insvire")
  setelah testing selesai.
* Rekomendasi Najwa: KI-034 ditutup (Resolved). Opsional backlog kecil
  (bukan blocker): guard `isSwitchPending` di `onOpenChange` `AlertDialog`
  supaya Escape tidak menutup dialog selagi switch berjalan — murni
  peningkatan UX, tidak wajib.

### Dampak dokumentasi

* `PROJECT_STATE.md` — blok Known Issue **KI-034** dihapus dari section
  Known Issues (sudah Resolved & tercatat di sini, sesuai pola KI-025);
  pointer "Resolved 2026-08-24" ditambah di section Blockers; referensi
  KI-034 di catatan KI-023 diperbarui jadi Resolved.
* `tasks/v01-foundation.md` § T-089 — status task diperbarui (T-089.6 kini
  juga lolos QA formal Najwa), catatan checklist T-089.6 dan catatan
  eksekusi diperbarui menyatakan KI-034 closed.
* Tidak ada ADR baru — ini murni QA closure atas keputusan yang sudah ada
  (ADR-089), bukan keputusan arsitektur baru.

---

## 2026-08-24 — T-089.6 (ADR-089): dialog konfirmasi Tier 2 sebelum switch workspace

### Context

Lanjutan dari T-089.1–.5 (sudah `✅ Done`, entri di bawah). Setelah kode
T-089.2/.3/.4 lolos review Ridwan + QA Najwa, King Rezi mengubah rancangan
`settings-workspaces.html` di Claude Design: klik row workspace lain tidak
lagi langsung overwrite cookie `active-workspace-id` + redirect Home tanpa
konfirmasi (versi awal ADR-088 poin 2 & 4) — sekarang membuka dialog
konfirmasi Tier 2 (`AlertDialog`, ADR-049) lebih dulu, reuse pola yang
sama dengan Logout (T-016.5) dan Remove Member. King Rezi mencatat
perubahan rancangan ini di `readme.md` project Claude Design: kolom
ketiga `components/dialog.html` dipakai ulang tanpa variant baru untuk
konfirmasi Switch Workspace di `templates/settings-workspaces.html`.

### Perubahan kode

`apps/web/src/app/(app)/settings/account/workspaces/components/WorkspacesSettingsView.tsx`
diselaraskan mengikuti rancangan baru:

1. **Dialog konfirmasi Tier 2** — klik row workspace membuka `AlertDialog`
   Astryx (pola sama dengan `apps/web/src/app/(app)/components/WorkspaceSideNav.tsx:142-159`):
   title dinamis `"Pindah ke workspace [nama]?"`, description
   `"Anda akan keluar dari workspace saat ini dan berpindah konteks
   kerja."`, `cancelLabel="Batal"`, `actionLabel="Pindah"`,
   `actionVariant="primary"` (non-destruktif, bukan `destructive`) — switch
   (`switchWorkspaceAction`) baru dijalankan setelah user klik "Pindah".
2. **Density List** `balanced` → `spacious` — murni visual/spacing antar
   item, tidak berdampak behavior, tidak dianggap keputusan material
   (tidak butuh ADR).

Diverifikasi end-to-end di browser oleh AI utama (bukan lewat proses QA
Najwa formal): Batal dan Pindah keduanya bekerja benar, redirect ke Home
sukses setelah konfirmasi. Gap retest formal oleh Najwa QA Engineer
dicatat sebagai **KI-034** (baru) di `PROJECT_STATE.md` — tidak
memblokir M8.

### Governance

- **ADR-089** (baru) dibuat mengamandemen **ADR-088** poin 2 & 4 (append-only —
  body ADR-088 tidak diedit, hanya header `### Status` ditambah catatan
  "Amended by ADR-089"). `DECISIONS.md` baris tabel ADR-088 ikut ditambah
  catatan Status yang sama.
- **Koreksi penomoran subtask:** rancangan Claude Design mencatat label
  "T-016.6" untuk perubahan ini — dicek, T-016 di `tasks/v01-foundation.md`
  hanya sampai subtask `.5` (Dialog Logout), tidak ada `.6`. Diputuskan
  dicatat sebagai **T-089.6** (subtask baru di bawah T-089, task yang
  memang membahas mekanisme switch workspace ini), bukan T-016.6 — detail
  alasan di ADR-089.
- `tasks/v01-foundation.md` § T-089: subtask baru T-089.6 ditambahkan
  (checked), body task diperbarui (gap description, koreksi mekanisme,
  acceptance T-089.3, field Status/Terkait/ADR) agar tidak lagi
  menyiratkan switch langsung tanpa konfirmasi.
- `TASKS.md`: total subtask terdefinisi naik dari 147 → 148 (dihitung
  ulang langsung dari `tasks/vXX-*.md`, bukan increment manual); v0.1
  58 → 59 subtask. Task-level tetap 22 selesai (T-089 sudah `✅ Done`
  sebelumnya).
- `PROJECT_STATE.md`: KI-034 baru; KI-023 (Terkait ditambah ADR-089,
  catatan update lanjutan); Completed (Ringkasan) dan Recent Decisions
  (Ringkasan) dirotasi (masing-masing tetap 5 item).

### Catatan pembagian kerja

`product-discovery/05-architecture/auth-architecture.md` (section
Workspace Context/Onboarding Flow) **sengaja tidak disentuh** pada sesi
governance ini — diserahkan ke main agent untuk diupdate setelah nomor
ADR-089 ini dikonfirmasi, supaya tidak race condition antar sesi.

---

## 2026-08-24 — T-089.2/.3/.4 selesai: Workspace Switcher deliberate (ADR-088) diimplementasikan, direview, lolos QA

### Context

Lanjutan T-089.1 (desain) dan T-089.5 (wiring Claude Design) yang sudah
selesai sebelumnya. Sesi ini menutup 3 subtask kode terakhir: T-089.2
(`WorkspaceService.switchWorkspace`), T-089.3 (UI halaman
`/settings/account/workspaces`), T-089.4 (dialog "Buat Workspace Baru").
Task **T-089** sekarang `✅ Done` secara keseluruhan (seluruh T-089.1–.5).

### Dikerjakan oleh

- **Prabowo Feature Engineer** (T-089.2) — `WorkspaceService.switchWorkspace`:
  validasi membership user ke workspace target, throw `AuthorizationError`
  kalau bukan member aktif; **tanpa** cookie/redirect di dalam service
  (tetap tanggung jawab entry point). Ditambah `listWorkspacesForUser` di
  service & `IWorkspaceRepository` — implementasi Prisma pakai
  `withCurrentUser`.
- **Mark UI Engineer** (T-089.3 dan T-089.4, paralel dengan Prabowo) —
  route baru `apps/web/src/app/(app)/settings/account/workspaces/`
  (`page.tsx`, `actions.ts` dengan `switchWorkspaceAction`), komponen
  `WorkspacesSettingsView.tsx` (Astryx List/ListItem/Badge/StatusDot/
  Dialog). Nav sidebar `SettingsSideNav.tsx` ditambah item "Workspaces" di
  posisi pertama grup Account. Dialog "Buat Workspace Baru" pakai
  `createWorkspaceAction` yang reuse penuh `WorkspaceService.createWorkspace`
  (T-006) tanpa modifikasi method itu sendiri.
- **Ridwan Architecture Reviewer** (sekuensial setelah implementasi) —
  review 8 file, **tidak ada temuan pelanggaran arsitektur**: entry point
  bersih dari business logic, domain tidak mengimpor Prisma langsung,
  RLS/`withCurrentUser` konsisten, error handling via `toActionError`,
  reuse T-006 terkonfirmasi tanpa duplikasi logic.
- **Najwa QA Engineer** (sekuensial setelah review) — unit test 58/58 lulus
  `workspace.service.test.ts`, full suite project 157 passed/3 skipped/0
  gagal, golden path browser end-to-end lulus semua (list workspace,
  switch, create dialog, nav ordering), edge case (refresh, konsistensi
  state) lulus, regresi di `/settings` dan `/settings/account` aman.
  **Tidak ada bug** dilaporkan.

### Catatan sisa (bukan bug) — KI-033 baru

Selama QA, Najwa membuat workspace test **"Najwa QA Test Workspace"**
(sengaja, untuk menguji `createWorkspaceAction`) yang sengaja tidak
dihapus setelahnya — hapus workspace bersifat ireversibel dan di luar
wewenang eksekusi otonom QA. Ditemukan juga **"QA Queue Test"**, sisa
sesi QA sebelumnya (bukan dari sesi T-089 ini). Keduanya dicatat sebagai
**KI-033** di `PROJECT_STATE.md` — perlu dibersihkan manual oleh King Rezi
via Settings → General → Danger Zone kalau perlu.

### Dokumentasi diupdate

- `tasks/v01-foundation.md` § T-089 — checklist T-089.2/.3/.4 dicentang,
  Status task jadi `✅ Done`, catatan eksekusi + catatan sisa KI-033
  ditambahkan.
- `TASKS.md` — Indeks release v0.1 dihitung ulang langsung dari
  `tasks/v01-foundation.md` (11 ✅ · 1 🚫 · 6 🟡 · 1 ⏸️ · 2 ⏳, dari
  sebelumnya 10 ✅ · 7 🟡), Total keseluruhan jadi 22 selesai, pointer T-089
  ditambahkan di "Fokus sekarang".
- `PROJECT_STATE.md` — bullet "Completed (Ringkasan)" untuk T-089 diupdate
  dari status desain-saja jadi selesai penuh (total tetap 5 item), KI-023
  diupdate (T-089 tidak lagi bagian sisa scope, hanya T-039.4), Known Issue
  baru **KI-033** ditambahkan, versi metadata → 1.0.53.

Tidak ada ADR baru di sesi ini — murni implementasi sesuai ADR-088 yang
sudah ada, tidak ada keputusan arsitektur/workflow baru.

---

## 2026-08-24 — T-089: 2 bug fix pasca-review desain Workspace Switcher, dikerjakan King Rezi sendiri di Claude Design

### Context

Setelah desain T-089.1 (`templates/settings-workspaces.html` + kolom
dialog ke-5 di `components/dialog.html`) selesai, AI melakukan review dan
melaporkan 2 bug ke King Rezi. King Rezi memperbaiki keduanya **sendiri**
langsung di Claude Design (project "Social Media Management") — bukan AI
atau subagent yang mengerjakan fix-nya. Ini governance/docs murni; tidak
ada kode `apps/web` yang disentuh.

### Bug 1 — dialog "Buat Workspace Baru" langsung terbuka & tidak bisa ditutup

Root cause: CSS `.dialog-backdrop.hidden{ display:none; }` tidak ada di
`<style>` blok lokal `templates/settings-workspaces.html` (ada di file
lain seperti `settings-members.html`, lupa disalin ke halaman baru ini
saat T-089.1). King Rezi menambahkan baris CSS tersebut — sudah
diverifikasi AI lewat `DesignSync get_file`, sudah ada di file sekarang.
King Rezi juga sekaligus menambahkan peningkatan kecil di luar scope bug
report: script halaman sekarang benar-benar memindahkan chip "Aktif" dari
row lama ke row yang diklik (simulasi switch lebih hidup).

### Bug 2 — nav "Workspaces" di App Prototype error "belum ada di scope: settings-workspaces"

Root cause: halaman baru ini sengaja belum diwire ke
`templates/app-prototype/AppPrototype.dc.html` (interactive runner) saat
T-089.1 (dicatat sebagai T-089.5, follow-up terbuka). King Rezi menambahkan
entry `{ key: 'settings-workspaces', file: 'settings-workspaces.html',
code: 'SETTINGS', title: 'Settings → Account → Workspaces', menu:
'Settings · Account · Workspaces' }` ke array `SCREENS` di runner tersebut,
dan menambahkannya ke scope Templates list. Diverifikasi AI lewat
`DesignSync get_file` + grep.

### Dampak dokumentasi

`tasks/v01-foundation.md` § T-089: T-089.5 dicentang selesai (dengan
catatan pengerjaan oleh King Rezi), T-089.1 mendapat catatan tambahan soal
fix CSS, field Status header T-089 diperbarui. Tidak ada perubahan di
`TASKS.md` (hitungan task-level T-089 tetap 🟡 In Progress, T-089.2-.4
belum dikerjakan) maupun `PROJECT_STATE.md` (status T-089 overall tidak
berubah).

---

## 2026-08-24 — Desain + ADR-088 Deliberate Workspace Switcher (Settings → Account → Workspaces) — task baru T-089

### Context

Setelah T-039.4 (onboarding picker workspace) didesain di sesi sebelumnya
hari ini, King Rezi menyadari gap nyata pada premis ADR-076 poin 4: picker
`/onboarding` hanya muncul sebagai re-entry saat cookie `active-workspace-id`
hilang, bukan mekanisme untuk **sengaja** pindah workspace kapan saja
setelah user pernah memilih satu. King Rezi minta gap ini diperbaiki.

AI memberi rekomendasi trade-off antara (a) halaman tersendiri vs
(b) digabung ke General Settings existing. King Rezi memutuskan opsi (a):
**bangun halaman tersendiri.**

### Klasifikasi & gate rule 17 `AGENTS.md`

Task ini UI/UX-related — dicek dulu ke Claude Design sebelum implementasi
kode apa pun. Belum ada rancangannya, sehingga pekerjaan sesi ini murni
desain (Claude Design) + keputusan arsitektur (ADR), bukan kode `apps/web`.

### Pekerjaan — Design System (Claude Design, project "Social Media Management")

Dikerjakan AI utama langsung via `DesignSync` (bukan subagent Neymar
Product Designer — riwayat `DesignSync` gagal dimuat di sesi Neymar sudah
tercatat 4x sebelumnya, sama seperti pola T-039.4 di sesi sebelumnya hari
ini):

1. File baru `templates/settings-workspaces.html` — halaman Settings, grup
   **Account**, posisi teratas (di atas Profile). Isi: list seluruh
   workspace milik user — workspace aktif dirender sebagai chip "Aktif"
   non-interactive, workspace lain sebagai row yang bisa diklik untuk
   switch (reuse `.ws-pick-item` yang sudah ada dari
   `templates/onboarding.html`, T-039.4) — plus tombol "Buat Workspace
   Baru".
2. Dialog "Buat Workspace Baru" — form sederhana, non-destruktif (tanpa
   tier konfirmasi type-to-confirm karena tidak ada risiko kehilangan
   data). Ditambahkan sebagai kolom ke-5 baru di `components/dialog.html`.
3. 6 halaman `settings-*.html` lain ditambah link navigasi "Workspaces" di
   sidebar Settings grup Account, supaya halaman baru ini konsisten
   ditemukan dari halaman Settings manapun.
4. `styles.css` — modifier baru `.ws-pick-item.is-active` (state chip
   "Aktif" pada row workspace saat ini, dibedakan dari row workspace lain
   yang clickable).
5. `readme.md` (Claude Design) diupdate dengan section penjelasan lengkap
   halaman baru ini.
6. **Belum diwire** ke `templates/app-prototype/AppPrototype.dc.html`
   (interactive runner) — sengaja dibiarkan sebagai follow-up terbuka
   (dicatat sebagai subtask T-089.5), bukan oversight.

### Keputusan arsitektur — ADR-088

**ADR-088** ("Amandemen ADR-076 — Deliberate Workspace Switcher via
Settings → Account → Workspaces") dibuat oleh subagent Gibran Project
Manager pada panggilan sebelumnya di sesi ini. Ringkasan:

- Mengamandemen **ADR-076 poin 4** (append status "Accepted — Amended by
  ADR-088 (2026-08-24, poin 4)", bukan ditulis ulang — append-only).
- Scope MVP sengaja **narrow**: hanya (a) switch active workspace antar
  membership yang sudah ada, (b) create workspace tambahan dari halaman
  ini. **Bukan** bagian scope: multi-workspace management penuh (bulk
  actions, billing gabungan, shared views) — tetap Out of Scope.
- Baseline yang diamandemen: `mvp-definition.md`, `auth-architecture.md`
  (Workspace Context + Onboarding Flow + AU-D03), `application-layer.md`
  (kontrak `switchWorkspace` baru di `WorkspaceService`),
  `information-architecture.md` (Settings → Account → Workspaces).
- Baseline yang dicek tapi sengaja **tidak** diubah (tidak relevan — tidak
  ada perubahan skema data/routing URL): `monorepo-setup.md`,
  `auth-strategy.md`, `domain-model.md`, `database-strategy.md`.

### Koreksi mekanisme penting

Switch yang disengaja ini **bukan** "hapus cookie dulu, lalu ulang lewat
`/onboarding`" (miskonsepsi awal King Rezi yang mengira begitu dan
menganggapnya aneh). Mekanisme yang benar: **langsung overwrite** cookie
`active-workspace-id` ke workspace target (setelah validasi ulang
membership terhadap `workspace_members`), lalu redirect ke Home. Tidak ada
langkah delete cookie di jalur ini.

### Governance — task baru T-089 (bukan subtask T-039.6)

Dipertimbangkan sebagai subtask T-039.6 (satu rumpun routing/workspace,
ADR-076) vs task baru dengan nomor global sendiri. Diputuskan **task baru
T-089** — ini fitur produk baru (switcher) yang lahir dari amandemen
ADR-076, bukan subtask kecil dari migrasi routing lama T-039. ID `T-089`
diambil karena rentang v1.0 (`T-080`–`T-088`) sudah habis terisi, jadi
ini ID global berikutnya yang belum pernah dipakai sama sekali (berbeda
dari T-039 yang meminjam dari cadangan v0.2). Ditempatkan di
`tasks/v01-foundation.md` (bukan file rilis lain) karena scope-nya sejalan
dengan rumpun Workspace/Settings T-009/T-016/T-039, bukan Publishing v0.2.

Status T-089: `🟡 In Progress` — subtask desain (T-089.1) sudah selesai,
4 subtask kode (T-089.2–.5) belum dikerjakan sama sekali. Branch
`feature/t039-4-onboarding-workspace-picker` (dibuat sesi sebelumnya untuk
T-039.4) belum ada commit kode apa pun untuk task ini juga — implementasi
kode T-039.4 **dan** T-089 sama-sama masih menunggu approval King Rezi
atas desain, sebelum eksekusi kode dimulai.

### Diupdate

- `tasks/v01-foundation.md` — section baru "Workspace Switcher (ADR-088)"
  berisi T-089 (5 subtask, 1 selesai) + catatan spin-off di penutup § T-039
  + Catatan Rilis (penomoran ID).
- `TASKS.md` — indeks release v0.1 (Task 20→21, breakdown status
  dihitung ulang dari file sumber — sekaligus mengoreksi drift lama "11 ✅
  · 5 🟡" yang sudah tidak cocok dengan file aktual sebelum penambahan ini
  menjadi "10 ✅ · 6 🟡"), **Total** (71→72 task, 22→21 selesai,
  142→147 subtask), Aturan ID (`T-088`→`T-089`).
- `PROJECT_STATE.md` — KI-023 (catatan update baru, append; field
  `Terkait` ditambah T-089/ADR-088), Recent Decisions (ADR-088
  ditambahkan di puncak, ADR-083 digeser keluar dari 5 item), Completed
  Ringkasan (bullet baru ditambahkan, bullet KI-031 resolved digeser keluar
  dari 5 item), Metadata (versi 1.0.52, tanggal 2026-08-24), Snapshot/Next
  Tasks (jumlah task 71→72).
- `DECISIONS.md` — entri ADR-088 (dibuat di panggilan sebelumnya, bukan
  sesi ini) + status ADR-076 ditandai "Amended by ADR-088".

---

## 2026-08-24 — Desain T-039.4 (halaman `/onboarding` picker workspace) selesai di Claude Design — implementasi kode belum dimulai

### Context

T-039.4 ("Bangun halaman `/onboarding` dengan picker workspace") sebelumnya
berstatus belum dikerjakan. Sesuai rule 17 `AGENTS.md`, task ini diklasifikasi
UI/UX-related — sebelum kode ditulis, gate mewajibkan cek dulu ke Claude
Design apakah screen ini sudah ada rancangannya. Belum ada, sehingga
implementasi kode di-STOP dulu dan pekerjaan sesi ini murni membuat
rancangannya di Claude Design (project "Social Media Management", projectId
`84aded99-bb23-49b1-be9f-dd8f21c6873e`), mengikuti keputusan yang sudah ada
sebelumnya (ADR-076, ADR-077) — bukan keputusan arsitektur baru, jadi tidak
ada ADR baru untuk pekerjaan ini.

### Proses delegasi

Awalnya didelegasikan ke subagent Neymar Product Designer, tapi `DesignSync`
gagal dimuat di sesi subagent tersebut — ini kejadian ke-4 dengan pola gagal
yang sama, sudah dicatat sebelumnya di `.claude/agents/README.md` oleh Neymar
sendiri di sesi sebelum sesi ini. King Rezi memberi izin eksplisit untuk
melanjutkan pekerjaan desain di sesi utama (bukan subagent), dan `DesignSync`
berhasil dimuat di sana. Seluruh pekerjaan desain di bawah ini dikerjakan di
sesi utama.

### Pekerjaan

1. File baru `templates/onboarding.html` di Claude Design — 2 state referensi
   side-by-side memakai pola `.state-tag` yang sudah baku di project ini:
   - **"Belum Punya Workspace"** — form buat workspace baru (field Nama
     Workspace + Button primary).
   - **"Pilih Workspace (>1, cookie hilang)"** — list `.ws-pick-item` yang
     bisa diklik (avatar inisial + nama workspace + role sebagai
     description), masing-masing row langsung set active workspace +
     redirect ke Home.
2. `styles.css` (Claude Design) ditambah section baru "Onboarding — Workspace
   Picker (T-039.4, ADR-076)" berisi class `.ws-pick-list`, `.ws-pick-item`,
   `.ws-pick-avatar`, `.ws-pick-body`, `.ws-pick-name`, `.ws-pick-role`,
   `.ws-pick-chevron` — semua mereplikasi Astryx `List`+`ListItem` (dibangun
   dari primitive `Item`: startContent Avatar, label, description,
   onClick/href). Verifikasi komponen dilakukan lewat MCP `xds`
   (`get("ClickableCard")`, `get("Item")`, `get("List")`); dipilih
   `List`/`Item` bukan `ClickableCard` karena beberapa row berbagi satu list
   di dalam satu card, bukan masing-masing jadi card berdiri sendiri.
3. `readme.md` (Claude Design) diupdate: entri baru di section "## Files"
   untuk `templates/onboarding.html` dan class `.ws-pick-*`, plus section
   naratif baru "## Onboarding — Workspace Picker (T-039.4, ADR-076/ADR-077,
   2026-08-24)".
4. Branch git `feature/t039-4-onboarding-workspace-picker` dibuat (checkout
   dari `staging`) sebelum kerja ini dimulai — belum ada commit apa pun di
   branch itu, karena seluruh pekerjaan sesi ini terjadi di Claude Design
   (bukan file kode `apps/web`), jadi tidak ada perubahan file lokal yang
   perlu di-commit.

### Open gap yang dicatat, bukan bagian scope T-039.4

Project Claude Design ini masih memakai token `@astryxdesign/theme-neutral`,
sedangkan `apps/web` sudah pindah ke `@astryxdesign/theme-stone` sejak
ADR-087 (2026-08-21) — ADR-087 sendiri sudah mencatat ini sebagai item
terbuka ("Claude Design belum disinkronkan ke theme Stone"). Screen
onboarding baru ini sengaja memakai token Neutral yang sudah ada apa adanya,
**tidak** mencoba resync sebagian — dicatat ulang di `readme.md` Claude
Design sebagai reminder, bukan ADR baru (ADR-087 sudah cukup mencakupnya).

### Status setelah sesi ini

- Desain T-039.4 selesai di Claude Design — gate rule 17 `AGENTS.md`
  terpenuhi untuk screen ini.
- Implementasi kode `/onboarding` di `apps/web` **belum dikerjakan sama
  sekali** — menunggu approval King Rezi atas desain ini sebelum
  dilanjutkan.
- Diupdate: `tasks/v01-foundation.md` § T-039 (Status header + catatan
  T-039.4), `PROJECT_STATE.md` (KI-023, update sisa scope).

---

## 2026-08-21 — Ganti theme Astryx dari Neutral ke Stone (ADR-087)

### Context

King Rezi meminta secara eksplisit mengganti theme Astryx project ini dari
Neutral ke Stone ("Warm stone and slate tones; Montserrat + Figtree type" —
deskripsi resmi `astryx docs theme`). Ini murni preferensi visual King Rezi,
bukan temuan bug/audit. King Rezi eksplisit meminta: proses sekarang tapi
**jangan sentuh Claude Design dulu** — fokus hanya code dan dokumentasi;
rule 17 `AGENTS.md` (gate Claude Design sebelum implementasi UI/UX) sengaja
dilewati untuk task ini atas instruksi eksplisit tersebut.

### Pekerjaan

Perubahan kode (diterapkan di sesi terpisah, sudah diverifikasi: computed
style browser menunjukkan `data-astryx-theme="stone"`, font heading/body
sudah Montserrat/Figtree, dan `bun run build` production build hijau tanpa
error untuk seluruh 30 route):

1. `apps/web/package.json` — field `"astryx": { "theme": ... }` diubah dari
   `"@astryxdesign/theme-neutral"` ke `"@astryxdesign/theme-stone"`;
   dependency `@astryxdesign/theme-neutral` dihapus (`bun remove`), diganti
   `@astryxdesign/theme-stone` versi `0.4.3` (sama seperti versi
   `@astryxdesign/core`/`@astryxdesign/cli` yang sudah ter-pin).
2. `apps/web/src/app/globals.css` — `@import
   "@astryxdesign/theme-neutral/theme.css";` diganti `@import
   "@astryxdesign/theme-stone/theme.css";`.
3. `apps/web/src/components/Providers.tsx` — import `neutralTheme` dari
   `@astryxdesign/theme-neutral/built` diganti `stoneTheme` dari
   `@astryxdesign/theme-stone/built`; pemakaian `<Theme mode={mode}
   theme={neutralTheme}>` diganti `<Theme mode={mode} theme={stoneTheme}>`.
4. Dikonfirmasi tidak ada sisa referensi `theme-neutral`/`neutralTheme` di
   `apps/web/src` maupun `package.json` (grep bersih).

Perubahan dokumentasi (sesi ini, oleh Gibran Project Manager):

5. ADR baru dibuat:
   `project-manager/decisions/ADR-087-ganti-theme-astryx-neutral-ke-stone.md`,
   mendokumentasikan keputusan, alasan (permintaan eksplisit, bukan bug),
   detail perubahan kode, alasan rule 17 `AGENTS.md` sengaja dilewati, dan
   item terbuka (Claude Design belum disinkronkan).
6. `project-manager/DECISIONS.md` — baris index `ADR-087` ditambahkan di
   posisi teratas.
7. `AGENTS.md` § Stack & layout — baris "neutral theme selama M8" diganti
   "Stone theme (ADR-087)".
8. `context/ctx-technical-context.md` — baris "Astryx — neutral theme
   selama M8" diganti menjadi Stone theme + rujukan ADR-087.
9. `context/ctx-design.md` — baris yang menyebut "gunakan neutral theme
   Astryx" dan penjelasan Light/Dark Mode Toggle (ADR-055) terkait
   `@astryxdesign/theme-neutral` disesuaikan ke Stone theme; makna kalimat
   asli tidak berubah, hanya nama tema.
10. `project-manager/PROJECT_STATE.md` — section Completed (Ringkasan)
    ditambah bullet baru di posisi teratas (tetap 5 item, item terlama
    digeser keluar). Section Recent Decisions (Ringkasan) ditambah
    `ADR-087` di posisi teratas, `ADR-082` digeser keluar dari 5 ADR
    terakhir.

### Hasil

Dokumentasi konsisten dengan perubahan kode yang sudah diterapkan &
diverifikasi di sesi terpisah. **Item terbuka eksplisit:** Claude Design
(seluruh KSP + App Prototype project "Social Media Management") belum
disinkronkan mengikuti theme Stone ini — perlu langkah lanjutan terpisah,
kemungkinan lewat Neymar Product Designer. Tidak ada baseline
`product-discovery/` yang diamandemen (murni ganti theme package Astryx).

---

## 2026-08-21 — Revert total swap warna AppShell, kembali ke default Astryx (ADR-086, membatalkan ADR-084)

### Context

Lanjutan audit menyeluruh King Rezi terhadap seluruh override warna custom
di project ini (satu rangkaian dengan pembatalan pola `Section > Card` di
Settings, ADR-085, pada hari yang sama). King Rezi memutuskan AppShell tidak
perlu kustomisasi warna apapun — kembali murni ke default `neutralTheme`
bawaan Astryx, membatalkan penuh ADR-084 (2026-08-20).

### Pekerjaan

Perubahan kode (diterapkan di sesi terpisah, sudah diverifikasi King Rezi
lewat browser untuk light mode dan dark mode — tidak ada regresi):

1. `apps/web/src/app/globals.css` — seluruh blok `@layer components` yang
   ditambahkan ADR-084 (2 rule CSS untuk `.astryx-app-shell`/
   `.astryx-app-shell-sidenav` dan `.astryx-layout-content`, beserta
   comment penjelasannya) **dihapus total**. File sekarang hanya berisi
   `@layer` declaration, `@import`, `@theme inline` font vars, dan style
   `body { font-family: ... }`.
2. AppShell kembali ke default `neutralTheme` Astryx sepenuhnya: sidebar
   abu-abu, konten putih di light mode (sama seperti sebelum ADR-084);
   dark mode tidak berubah.

Perubahan dokumentasi (sesi ini, oleh Gibran Project Manager):

3. ADR baru dibuat:
   `project-manager/decisions/ADR-086-revert-swap-warna-appshell-kembali-ke-default-astryx.md`.
4. `project-manager/DECISIONS.md` — baris index `ADR-086` ditambahkan di
   posisi teratas; baris index `ADR-084` kolom `Status` diubah menjadi
   `Accepted — Reverted by ADR-086 (2026-08-21)`.
5. `project-manager/decisions/ADR-084-swap-warna-appshell-light-mode-css-selector-scoped-bukan-defineTheme.md`
   — **hanya** header `### Status` diubah menjadi
   `Accepted — Reverted by ADR-086 (2026-08-21)`; isi body lainnya (Context,
   Decision, Reason, Alternatives, Impact) tidak diedit sama sekali,
   mengikuti pola append-only (ADR-084 tidak dihapus karena sudah jadi
   rujukan di `PROJECT_STATE.md` dan `.claude/agents/README.md`, berbeda
   dari kasus ADR-085/086 versi lama yang baru dibuat hari yang sama dan
   belum jadi preseden).
6. `project-manager/PROJECT_STATE.md` — section Completed (Ringkasan)
   diperbarui: bullet lama "Swap warna sidebar ↔ konten AppShell" dihapus
   dan digantikan bullet baru "Revert total swap warna AppShell" di posisi
   teratas (tetap 5 item terakhir). Section Recent Decisions (Ringkasan)
   diperbarui: `ADR-086` ditambahkan di posisi teratas, `ADR-081` digeser
   keluar dari 5 ADR terakhir, baris `ADR-084` diberi catatan
   "Reverted by ADR-086".
7. `.claude/agents/README.md` dan body `project-manager/decisions/ADR-085-*.md`
   dicek — keduanya hanya menyebut ADR-084 sebagai catatan kronologi
   historis (insiden `DesignSync` gagal dimuat; urutan penulisan baris
   index), bukan klaim tentang state warna AppShell saat ini, sehingga
   tidak diubah (tidak menyesatkan pembaca).

### Hasil

Tidak ada perubahan kode di sesi ini (kode sudah diterapkan & diverifikasi
di sesi terpisah sebelumnya). Dokumentasi konsisten: ADR-084 tetap utuh
sebagai jejak historis dengan status Reverted, ADR-086 baru menjelaskan
pembatalannya, dan `PROJECT_STATE.md` tidak lagi menyesatkan pembaca soal
state warna AppShell saat ini.

---

## 2026-08-21 — `SettingsSectionCard` dihapus total (bukan wrapper tipis) — lanjutan ADR-085

### Context

Lanjutan langsung dari entri ADR-085 di bawah ini (dibuat hari yang sama).
Setelah `SettingsSectionCard` direstrukturisasi jadi wrapper tipis
`<Section>{children}</Section>` (tanpa `Card`), King Rezi menilai wrapper
ini trivial — tidak menambah value apapun dibanding memakai `<Section>`
langsung — sehingga diputuskan komponennya **dihapus total**, bukan
dipertahankan sebagai wrapper tipis.

### Pekerjaan

Perubahan kode (diterapkan di sesi terpisah, sudah diverifikasi King Rezi
lewat browser preview untuk ketiga halaman, light mode):

1. File dihapus: `apps/web/src/app/(app)/settings/components/SettingsSectionCard.tsx`.
2. `apps/web/src/app/(app)/settings/account/components/ProfileForm.tsx` —
   import `SettingsSectionCard` dihapus, ganti
   `import { Section } from "@astryxdesign/core/Section";`. `<SettingsSectionCard>`
   yang membungkus `<form>` diganti `<Section>` langsung.
3. `apps/web/src/app/(app)/settings/members/components/MembersTable.tsx` —
   pola sama: import `Section` langsung, `<SettingsSectionCard>` yang
   membungkus `EmptyState`/`Table` diganti `<Section>` langsung.
4. `apps/web/src/app/(app)/settings/connected-accounts/components/ConnectedAccountsList.tsx` —
   pola sama: import `Section` langsung, `<SettingsSectionCard>` yang
   membungkus `EmptyState`/`List` diganti `<Section>` langsung.
5. Dikonfirmasi tidak ada sisa referensi `SettingsSectionCard` di
   `apps/web/src` (grep bersih) dan `tsc --noEmit` tidak ada error terkait
   file-file ini.

Dokumentasi (sesi ini):

- `project-manager/decisions/ADR-085-settings-section-murni-tanpa-card-kepatuhan-aturan-astryx.md` —
  diupdate in-place (bukan ADR baru) di bagian Decision dan Impact untuk
  mencerminkan keputusan final: `SettingsSectionCard` tidak dipertahankan
  sebagai wrapper tipis, tapi dihapus total.
- `project-manager/DECISIONS.md` — ringkasan satu-baris ADR-085 diupdate
  agar menyebut penghapusan total komponen wrapper, bukan cuma
  restrukturisasi jadi `Section` murni.

### Catatan

Tidak ada ADR baru dibuat untuk langkah ini — dianggap kelanjutan langsung
keputusan ADR-085 yang baru dibuat pada hari yang sama, bukan keputusan
material terpisah.

---

## 2026-08-21 — Settings pakai `Section` murni tanpa `Card` — ADR-085 & ADR-086 lama dihapus total

### Context

Entri ini menggantikan entri lama "Fix `Section variant` (DashboardHome,
SettingsSectionCard) + aturan verifikasi dual-mode — ADR-086" yang
**dihapus total** dari file ini (bukan diamandemen) karena diskusi lanjutan
dengan King Rezi menemukan pendekatan ADR-085 dan ADR-086 (versi lama,
sama-sama dibuat 2026-08-21) melanggar aturan resmi Astryx.

Dikonfirmasi lewat `bunx astryx docs layout` (section "Cards vs Rows":
dense data harus rows, "✗ Nesting Cards inside Cards", "✗ Wrapping each
list item in a Card") dan `bunx astryx docs shape` (`Section` = page region
flat/`radius: none`, `Card` = widget diskrit rounded `--radius-container`
12px — dua komponen ini tidak didesain untuk ditumpuk). Artifact border
siku Section menonjol dari lengkungan Card di `SettingsSectionCard.tsx`
ternyata bukan soal kontras warna (dugaan versi lama ADR-086), melainkan
konsekuensi struktural dari pola `Section > Card` itu sendiri (pola versi
lama ADR-085) yang salah dari awal untuk dense data.

### Pekerjaan

Perubahan kode (diterapkan di sesi terpisah sebelum dokumentasi ini
ditulis, sudah diverifikasi King Rezi):

1. `apps/web/src/app/(app)/settings/components/SettingsSectionCard.tsx` —
   direstrukturisasi total, `Card` dihapus sepenuhnya. Sekarang `Section`
   (default, tanpa `variant`) langsung membungkus `children` — dipakai
   oleh `ProfileForm`/`MembersTable`/`ConnectedAccountsList`.
2. `apps/web/src/app/(app)/components/DashboardHome.tsx` — Section
   "Analytics Snapshot" dikembalikan ke default (tanpa
   `variant="transparent"`), revert total dari perbaikan versi lama
   ADR-086.

Dokumentasi (sesi ini):

- **ADR-085 dan ADR-086 versi lama dihapus total**: file
  `decisions/ADR-085-section-card-dense-data-settings-pengecualian-aturan-astryx.md`
  dan `decisions/ADR-086-section-transparent-fit-content-dan-verifikasi-dual-mode-light-dark-wajib.md`
  dihapus; baris indeksnya di `DECISIONS.md` dihapus. Pengecualian eksplisit
  dari pola append-only ADR — kedua ADR itu baru lahir hari yang sama dan
  belum jadi preseden di tempat lain, sehingga King Rezi memilih hapus
  bersih alih-alih menumpuk amandemen di atas keputusan yang salah dari
  awal.
- **ADR baru dibuat, nomor dipakai ulang jadi `ADR-085`** (bukan
  `ADR-087`) karena nomor lama sudah kosong sebelum ADR baru ini ditulis —
  isinya: keputusan final Settings pakai `Section` murni, plus catatan
  eksplisit riwayat penghapusan total ADR-085/086 versi lama untuk jejak
  audit di masa depan.
- `context/ctx-development.md` — item checklist "verifikasi visual light
  DAN dark mode wajib" (mengacu ADR-086 versi lama) dihapus total dari
  "Checklist sebelum selesai task kode". Item lama soal smoke test UI +
  dark mode khusus upgrade/penambahan Astryx (sudah ada sebelum ADR-086
  versi lama dibuat) **tetap dipertahankan**, tidak ikut terhapus.

### Dampak

- File dihapus: `project-manager/decisions/ADR-085-section-card-dense-data-settings-pengecualian-aturan-astryx.md`,
  `project-manager/decisions/ADR-086-section-transparent-fit-content-dan-verifikasi-dual-mode-light-dark-wajib.md`.
- File baru: `project-manager/decisions/ADR-085-settings-section-murni-tanpa-card-kepatuhan-aturan-astryx.md`.
- `project-manager/DECISIONS.md` — baris indeks ADR-085/086 versi lama
  diganti satu baris `ADR-085` baru.
- `context/ctx-development.md` — item checklist dual-mode dihapus total.
- Konsekuensi visual produk disadari: 3 halaman Settings (Profile,
  Members, Connected Accounts) sekarang flat/persegi mengikuti bentuk asli
  `Section`, menyimpang dari mockup Claude Design yang sebelumnya minta
  tampilan kotak rounded — belum disinkronkan ulang ke Claude Design (next
  step terpisah).
- Tidak ada task `TASKS.md`/`tasks/vXX-*.md` yang terdampak — ini
  perbaikan bug ad-hoc di luar backlog, sama seperti pola ADR-084.

---

## 2026-08-20 — Swap warna sidebar ↔ konten AppShell (light mode saja) — ADR-084

### Context

Permintaan ad-hoc King Rezi (bukan bagian task backlog `TASKS.md`/
`tasks/vXX-*.md` manapun), dikerjakan di branch `feature/swap-appshell-bg-light-mode`
(dibuat dari `staging`, belum commit). Minta swap warna background AppShell
untuk **light mode saja** — dark mode sengaja tidak disentuh:

- Sidebar: abu (`#f1f1f1`) → **putih** (`#ffffff`).
- Area konten utama (semua halaman: Home, Publish/Queue/Calendar/Drafts/
  History, Engage, Analyze, Settings): putih (`#ffffff`) → **abu**
  (`#f1f1f1`).

### Pekerjaan

Investigasi menemukan warna sidebar (`.astryx-app-shell-sidenav`) dan
konten (`.astryx-layout-content`, komponen generik `Layout`/`LayoutContent`
Astryx) bukan elemen unik AppShell — component key yang sama dipakai ulang
di **seluruh dialog** aplikasi (Cancel Schedule Queue, Transfer Ownership &
Hapus Workspace Settings > General, Invite Member Settings > Members,
Draft Editor Modal). Override lewat jalur resmi `defineTheme({ components:
{ 'layout-content': {...} } })` akan ikut mengubah warna konten semua
dialog itu — ditolak.

Solusi: 1 blok `@layer components` baru ditambahkan di akhir
`apps/web/src/app/globals.css` — CSS selector ter-scope presisi ke slot
AppShell (`.astryx-app-shell[data-variant="elevated"]`,
`.astryx-app-shell-sidenav[data-variant="elevated"]`) + exclusion
`:not(dialog .astryx-layout-content)` supaya konten dialog manapun (semua
dirender via elemen native `<dialog>`, dikonfirmasi lewat inspeksi DOM)
tidak ikut ter-match. Nilai warna pakai `light-dark(#ffffff, #1b1b1b)`
untuk shell/sidenav dan `light-dark(#f1f1f1, #262626)` untuk konten —
mempertahankan dark mode identik nilai lama di selector yang sama. Semua
nilai HEX diverifikasi dari *computed style* browser (bukan tabel
`astryx docs tokens` yang ternyata tidak akurat terhadap built theme yang
sebenarnya jalan) — bukan warna baru/brand baru.

Pendekatan ini sah menurut dokumentasi resmi Astryx (`astryx docs styling`
→ "Preferred Selector Surface: Data Attributes") — bukan swizzle (ADR-041)
dan bukan StyleX/`xstyle` (dihapus, ADR-082).

### Verifikasi

Browser: light mode Queue + Settings (warna tertukar sesuai permintaan);
dialog Hapus Workspace dicek eksplisit **tidak berubah**; dark mode dicek
identik sebelum/sesudah (shell/sidenav `#1b1b1b`, konten `#262626`). Tidak
ada Vitest/`tsc`/`eslint` tambahan — perubahan murni CSS, tidak menyentuh
logic/TypeScript.

### Keputusan ADR

**ADR-084** dibuat — mencatat alasan penolakan `defineTheme` component
override, detail selector CSS yang dipakai, dan keputusan sekali-pakai
soal urutan kerja (implementasi dulu, dokumentasi menyusul setelah acc
visual — dibalik dari rule 17 `AGENTS.md`, eksplisit bukan preseden
permanen untuk task UI lain).

### Status

Selesai, sudah di-acc visual King Rezi. Bukan task backlog, sehingga tidak
ada entri baru di `TASKS.md`/`tasks/vXX-*.md`. Dokumentasi governance
diperbarui dalam perubahan yang sama: `DECISIONS.md` + `decisions/ADR-084-*.md`,
`PROJECT_STATE.md` (Recent Decisions + Completed Ringkasan). Next step
(di luar cakupan sesi ini): sinkronisasi ke Claude Design oleh Neymar
Product Designer. Commit/push belum dilakukan — menunggu instruksi
eksplisit King Rezi.

---

## 2026-08-20 — T-032 Queue management selesai (implementasi penuh) + T-030 (Cancel Schedule) ditutup untuk konteks Queue

### Context

Lanjutan dari T-032.0/.1 (ADR-083, 2026-08-19) yang menyelaraskan Design
System halaman Queue. Sesi ini mengerjakan 4 subtask implementasi kode yang
tersisa (T-032.2–.5) lewat delegasi paralel/sekuensial beberapa subagent
(Prabowo Feature Engineer ×2, Elon Backend Engineer, Mark UI Engineer),
diikuti review Ridwan (Architecture Reviewer) dan QA Najwa, ditutup 2
putaran fix dari sesi utama.

### Pekerjaan per subtask

- **T-032.2** (Prabowo) — `PublishingService.listQueue` + repository: query
  `PublishingPost`/`PublishingPostTarget` status `Scheduled` langsung (bukan
  `PublishingQueueSlot`, ADR-083), grouped per tanggal via helper baru
  `apps/web/src/domains/publishing/services/group-queue-items.ts` (+ test),
  ascending `scheduledAt`. File diubah: `publishing.repository.ts` (interface
  + tipe `QueueItemRecord`/`QueueItemTargetRecord`), `publishing.service.ts`,
  `index.ts`, implementasi Prisma di
  `apps/web/src/lib/repositories/publishing/publishing.repository.ts`.
- **T-032.5** (Elon) — Migration `20260820024619_drop_publishing_queue_slot`
  men-drop model Prisma `PublishingQueueSlot` + tabel `publishing_queue_slots`
  + 3 field relasi balik (ADR-083). Test
  `workspace.repository.delete-cascade.test.ts` disesuaikan (assertion
  queue-slot dihapus, cascade-delete T-008.2 diverifikasi ulang dengan
  koneksi DB asli).
- **T-032.3** (Mark) — UI Astryx nyata di
  `apps/web/src/app/(app)/publish/queue/page.tsx` (RSC) +
  `components/QueueList.tsx` (client): grouping per tanggal (heading nama
  hari + tanggal, mis. "Senin, 14 Juli"), 1 Card per schedule tanpa status
  chip, filter akun client-side, 3 tombol icon (Publish Now/Edit/Cancel
  Schedule). Judul halaman dikoreksi dari "Queue" jadi **"Publish"** di sesi
  utama, setelah verifikasi ulang terhadap mockup Claude Design
  (`templates/publish-queue.html` via `DesignSync`) — cocok dengan pola
  existing `DraftsList.tsx`.
- **T-032.4** (Prabowo) — Wiring 3 aksi + **implementasi nyata T-030 (Cancel
  Schedule) secara penuh** untuk bagian Queue (menutup T-030.1/.2/.3 —
  bagian Calendar dari T-030.3 menyusul di T-033):
  - Kontrak ACL baru `IOutstandAdapter.cancelScheduledPost`
    (`packages/shared/src/contracts/outstand-adapter.ts`) + implementasi
    `FakeOutstandAdapter` (instan always-success, ADR-059).
  - Repository: method cancel (status `Scheduled` → `Draft`, `scheduledAt`
    di-null-kan, `PublishingPostTarget` dihapus).
  - RBAC: `assertActorCanCancelSchedule` (Owner/Admin/Creator, ADR-074) di
    `rbac.ts`.
  - Use-case baru `cancel-schedule.use-case.ts` (persist dulu baru panggil
    adapter, best-effort per target — pola sama `PublishNowUseCase`).
  - Server Action `cancelScheduleAction`
    (`apps/web/src/app/(app)/publish/queue/actions.ts`, file baru).
  - UI: `QueueScreen.tsx` (client wrapper baru) — `AlertDialog` Tier 2 (pola
    sama `MembersTable.tsx`), copy "Batalkan jadwal ini?" / "Post kembali
    menjadi Draft dan tidak akan dipublikasikan otomatis." / tombol
    "Batal"/"Batalkan Jadwal", toast sukses "Jadwal dibatalkan — post
    kembali ke Drafts" (pemakaian pertama `useToast` Astryx di codebase).
  - Gap tambahan ditemukan & diselesaikan: tombol "Publish Now" di Queue
    awalnya cuma reuse `openEditDraft` (sama seperti Edit) — diperbaiki
    dengan menambah `initialPendingAction?: "publish-now"` ke
    `DraftEditorState`/`openEditDraft` (`Context.tsx`, `Modal.tsx`) supaya
    modal auto-advance ke step Confirmation Summary begitu draft ready.
    **Known limitation, sengaja dibiarkan** (dicatat sebagai **KI-032**):
    `getDraftAction` belum preload target akun yang sudah dijadwalkan, jadi
    `isReadyToPublishNow` sering `false` saat dibuka dari Queue → jatuh ke
    form biasa alih-alih auto-advance.

### Verifikasi

- **Ridwan (Architecture Reviewer):** review lengkap — entry point bersih,
  domain tidak import Prisma/Supabase/HTTP, cross-domain lewat public API,
  shared types murni, RBAC fail-fast, urutan persist-then-adapter benar,
  `PublishingQueueSlot` bersih total, UI Astryx murni — **0 temuan**.
- **Najwa (QA):** Vitest 153 passed/3 skipped (skip disengaja, butuh DB
  asli), `tsc --noEmit` bersih, `eslint` bersih, E2E browser lengkap (golden
  path, filter, Edit, Publish Now fallback yang diharapkan, Cancel Schedule
  + dialog + toast + DB state, empty state, regresi Drafts, regresi Publish
  Now lama dari Draft Editor langsung, light/dark mode) — **semua pass**, 1
  bug kosmetik ditemukan: double `@` di label akun (`@@qaqueue.demo`).
- **Fix sesi utama (2 putaran):** (1) judul halaman "Queue" → "Publish"
  setelah verifikasi ulang mockup; (2) bug double-`@` diperbaiki di
  `QueueList.tsx` (label filter + label target, hapus prefix `@` duplikat)
  dan diverifikasi ulang via browser (`tsc --noEmit` bersih, screenshot
  mengonfirmasi label benar `@qaqueue.demo`, toast dan alur cancel bekerja).

### Keputusan ADR

**Tidak ada ADR baru.** Seluruh keputusan sesi ini murni implementasi
mengikuti ADR yang sudah ada (ADR-083 queue tanpa `QueueSlot`, ADR-059 pola
Fake adapter, ADR-049 Tier 2 dialog, ADR-074 RBAC). Dua keputusan kecil yang
dipertimbangkan tapi dinilai tidak cukup material untuk ADR tersendiri:
"Publish Now Queue auto-advance via `initialPendingAction`" (detail wiring
UI, bukan perubahan arsitektur/kontrak) dan "Cancel Schedule menghapus
`PublishingPostTarget` alih-alih soft-reset" (konsisten dengan pola create
row-per-target di `SchedulePostsUseCase`, tidak mengubah domain model/ACL).

### Status

T-032 (parent task) → **✅ Done** (seluruh subtask T-032.0–.5). T-030
(Cancel Schedule) → **🟡 In Progress**: T-030.1/.2/.3 selesai untuk konteks
Queue, sisa scope Calendar menunggu T-033. Dokumentasi governance
diperbarui dalam perubahan yang sama: `tasks/v02-publishing-mvp.md` (T-032,
T-030), `TASKS.md` (indeks v0.2: 8 ✅ · 1 🟡 · 10 ⏳, Total 22 selesai/142
subtask), `PROJECT_STATE.md` (Completed Ringkasan + KI-032 baru).

---

## 2026-08-19 — ADR-083: baseline `04-ux`/`05-architecture` direkonsiliasi dengan desain final Queue

### Context

Setelah T-032.0 (mockup Queue diselaraskan ke pola Buffer, entri di bawah)
selesai, King Rezi meminta audit eksplisit: "apakah aman tidak ada gap atau
ui/ux yang berlawanan dengan design system yang baru?" — mencakup
`context/` dan `product-discovery/`. Explore agent menelusuri seluruh
referensi Queue/`QueueSlot`/KSP-03 di project dan menemukan **konflik nyata
di 3 dokumen baseline inti**, bukan cuma gap kecil.

### Temuan audit & Resolusi

Audit menemukan konflik nyata di 3 dokumen baseline inti (`key-screen-patterns.md`
KSP-03, `user-flows.md` UF-02, `domain-model.md`/`application-layer.md`
entity `QueueSlot`) plus 2 drift kecil (`TASKS.md` "Keputusan terbuka" stale,
`information-architecture.md` frasa Queue). King Rezi memilih opsi "Buat ADR
+ update baseline". Detail lengkap temuan, keputusan, alasan, alternatif
yang dipertimbangkan, dan daftar file yang diamandemen: lihat
**`project-manager/decisions/ADR-083-queue-murni-urutan-waktu-publish-hapus-reorder-status-chip-queueslot.md`**
(§ Context, § Decision, § Impact / Baseline yang diamandemen).

### Status

Audit + ADR + amandemen baseline selesai. T-032 (parent task) tetap ⏳ Not
Started — T-032.2/.3/.4 (implementasi kode) belum dikerjakan. Kerja masih
di branch `feature/t-032-0-queue-design-buffer-alignment`, belum di-commit.

---

## 2026-08-19 — T-032.0 selesai: mockup Claude Design halaman Queue diselaraskan ke referensi UX Buffer

### Context

Investigasi awal sesi (deployment Railway staging stuck sejak commit lama)
berujung ke diskusi task apa yang bisa dikerjakan sekarang — King Rezi
memilih T-032 (Queue management). Sebelum implementasi kode, T-032.1
(semantik queue slot) masih jadi keputusan terbuka di `TASKS.md`. King Rezi
menunjukkan screenshot halaman Queue Buffer (`publish.buffer.com/schedule`)
sebagai referensi UX yang diinginkan, memicu subtask baru **T-032.0**
(selaraskan Design System dulu sebelum kode) yang dikerjakan dalam 2 putaran
di sesi yang sama.

### Putaran 1 — adopsi elemen Buffer yang tidak butuh ADR/fitur baru

Analisis perbandingan mockup lama (`templates/publish-queue.html`) vs
Buffer: grouping per tanggal, aksi per-post (Publish Now/Edit/More options),
tanpa reorder manual, filter Channels/Tags/Timezone, tab Approvals, badge
count. King Rezi diminta memilih cakupan lewat AskUserQuestion — hasilnya
**adopsi hanya 4 elemen** yang tidak mengubah baseline: grouping per
tanggal, urutan murni waktu publish (tombol reorder ↑/↓ dihapus total —
**closes T-032.1**, tidak perlu ADR), timestamp "Dibuat X lalu". Elemen yang
sengaja di-skip (butuh ADR atau fitur baru di luar backlog manapun): toggle
List/Calendar, tab "Approvals" (fitur approval workflow tidak ada di
`roles-permissions.md`), filter "Tags"/"Timezone" (tidak ada di domain
model/backlog).

### Putaran 2 — revisi detail layout & aksi (9 poin King Rezi)

Setelah preview hasil putaran 1, King Rezi minta 9 perbaikan lebih detail
dari screenshot Buffer yang sama. Dua poin ambigu diklarifikasi lewat
AskUserQuestion sebelum eksekusi (menghindari rework): (a) apakah "Cancel
Schedule" dan "Delete" di poin 5 & 8 adalah 1 tombol atau 2 — dipilih **1
tombol merah** (Cancel Schedule saja); (b) posisi filter channel relatif
tombol New Post — dipilih **baris terpisah** (New Post naik ke baris judul,
filter tetap di baris lama tapi dipindah kanan + diperkecil).

Hasil final `templates/publish-queue.html`: filter channel kecil rata kanan
di baris tersendiri; tombol **New Post** pindah ke baris judul
(`justify-content:space-between` dengan title+subtitle, memanfaatkan
`.page-head` yang sudah flex-between secara default); **1 Card Astryx per
schedule** (`.card.card-pad.queue-card` per row, bukan 1 card menaungi
seluruh list); status chip (Scheduled/Failed/Ready to Schedule) **dihapus
total** (tidak relevan untuk halaman ini); dropdown "More options (⋮)" dari
putaran 1 **dihapus**, diganti 3 tombol icon eksplisit: Publish Now, Edit,
**Cancel Schedule** (icon merah, class baru `.icon-btn-danger`); heading
tanggal dirapikan (nama bulan lengkap, semibold, border-bottom pemisah).

### Interaksi diwire nyata di prototipe (bukan cuma visual statis)

`templates/app-prototype/AppPrototype.dc.html` diedit supaya 3 tombol baru
benar-benar berfungsi saat diklik di App Prototype interaktif (bukan cuma
mockup diam): tombol Publish Now → reuse `openPublishNowDialog` (dialog
Confirmation Summary yang sama dengan Draft Editor, T-029); tombol Edit →
reuse `triggerEditDraft`; tombol Cancel Schedule → dialog konfirmasi baru
`openCancelScheduleDialog`/`applyCancelSchedule` (pola sama
`openDisconnectDialog`: warning + tombol `btn-danger`, menghapus card dari
Queue + toast konfirmasi) — desain interaksi ini jadi referensi siap pakai
untuk implementasi nyata T-030 (Cancel Schedule) di `apps/web`. Dead code
`reorder-up`/`reorder-down` di `route()` dibersihkan sekalian (tombolnya
sudah tidak ada sejak putaran 1). Kedua file diverifikasi baca-ulang dari
remote setelah tiap `write_files` (scope-discipline skill poin 6) — tidak
ada drift/perubahan King Rezi yang tertimpa.

### Dokumentasi

`project-manager/tasks/v02-publishing-mvp.md` § T-032 diperbarui: T-032.0
ditandai selesai dengan ringkasan 2 putaran di atas, T-032.1 tetap resolved
(urutan murni waktu publish, tanpa reorder), T-032.2/.3/.4 disesuaikan
referensinya ke desain final (grouped by date, 1 Card per schedule, 3 tombol
icon eksplisit tanpa dropdown). § T-030 (Cancel Schedule) ditambah
cross-reference ke `openCancelScheduleDialog` sebagai referensi copy &
interaksi siap pakai untuk implementasi nyata.

### Status

T-032.0 (subtask desain) selesai. T-032 (parent task) tetap **⏳ Not
Started** — T-032.2 (`PublishingService.listQueue`), T-032.3 (implementasi
UI Astryx nyata di `apps/web`), dan T-032.4 (wiring aksi ke service) belum
dikerjakan. Kerja ada di branch `feature/t-032-0-queue-design-buffer-alignment`,
belum di-commit.

---

## 2026-08-19 — KI-031 resolved: ikon Date/TimeInput dikonfirmasi permanen kiri + mockup Claude Design diperbaiki (DateTimeInput + calendar popover)

### Context

Kelanjutan diskusi KI-029/ADR-082 (entri di bawah). Fix kode untuk KI-031
sendiri (`flex-row-reverse` dihapus, ikon kembali ke posisi default kiri
Astryx demi a11y/WCAG 2.4.3) sudah diterapkan sejak 2026-08-18 — sisa gap
yang belum ditutup murni soal mockup Claude Design (`templates/draft-editor.html`,
`components/forms.html`, `templates/app-prototype/AppPrototype.dc.html`)
yang masih menampilkan pola lama (native `<input type="date"/"time">`,
posisi ikon tidak konsisten) dan tidak mencerminkan keputusan final.

### Perbaikan mockup Claude Design (project "Social Media Management")

Tiga putaran revisi sebelum konvergen ke bentuk yang benar (dicatat supaya
tidak diulang):

1. **Percobaan 1 (ditolak King Rezi):** satu box gabungan (`.dt-input`,
   ikon kalender tunggal + segmen tanggal/waktu). Salah interpretasi
   anatomi `DateTimeInput` — dikoreksi setelah King Rezi mengirim
   screenshot rendering resmi `astryx.atmeta.com/components/DateTimeInput`
   yang menunjukkan **dua kotak terpisah** berdampingan (bukan satu box).
2. **Percobaan 2:** dua kotak terpisah (`.sched-field` × 2, ikon kalender +
   ikon jam masing-masing, `type="text"` bukan native date/time) — sudah
   benar strukturnya, tapi belum ada calendar popover interaktif.
3. **Percobaan 3 (ditambah fitur):** King Rezi minta field tanggal bisa
   diklik untuk memunculkan calendar popover (bulan/tahun + navigasi prev/
   next + grid hari), sesuai anatomi resmi `DateInput`'s "Calendar popover".
   Implementasi pertama pakai class `.cal-day`/`.cal-popover` dst — **bug
   ditemukan dari screenshot King Rezi**: grid kalender rusak (baris
   raksasa, header/weekday hilang) karena `.cal-day` **bentrok** dengan
   class `.cal-day` yang sudah ada untuk layar Publish → Calendar (KSP-02,
   `min-height: 150px` untuk kartu jadwal harian) — nama class sama,
   properti CSS saling menimpa sebagian (cascade per-property, bukan
   per-block). **Fix:** dibangun ulang dari state bersih (sebelum fitur
   kalender ditambahkan), semua class calendar-popover diberi prefix unik
   `schedcal-*` (bukan `cal-*`), arah buka popover diubah dari ke-atas jadi
   ke-bawah (hindari clipping oleh `.dialog-fs-body{overflow-y:auto}`).
   Diverifikasi: `node --check` sintaks JS ketiga file lolos, dan `diff`
   terhadap rules `.cal-*` original (KSP-02) di `styles.css` menunjukkan
   **nol perubahan** — dijamin tidak ada regresi ke layar Calendar.

### Keputusan final

KI-031 ditutup **Resolved** — bukan cuma "sebagian":
- Kode `apps/web`: posisi ikon kiri permanen (a11y, sejak 2026-08-18).
- Mockup Claude Design: sudah sinkron, merepresentasikan `DateTimeInput`
  Astryx asli (dua kotak + ikon kiri masing-masing + calendar popover
  fungsional), bukan lagi native browser input yang menyesatkan.
- Opsi swizzle (satu dari dua opsi solusi lama) tertutup permanen sejak
  ADR-082; opsi lain (tunggu Astryx tambah prop resmi) tidak lagi relevan
  karena posisi kiri sudah diterima sebagai final, bukan trade-off
  sementara yang menunggu sesuatu.

### File yang berubah

- `project-manager/PROJECT_STATE.md` — KI-031 dihapus dari daftar Known
  Issues (status Resolved, sesuai aturan KI di section tersebut).
- Claude Design project "Social Media Management" (`DesignSync`):
  `templates/draft-editor.html`, `components/forms.html`,
  `templates/app-prototype/AppPrototype.dc.html`, `styles.css`.
- Tidak ada perubahan kode `apps/web` di sesi ini (fix kodenya sudah lama
  ada sejak 2026-08-18; sesi ini murni menyinkronkan mockup + menutup
  status).

---

## 2026-08-19 — KI-029 ditutup Won't Fix (ADR-082): Astryx Tailwind-only, dependency StyleX dihapus

### Context

Kelanjutan investigasi KI-029 (lihat entri tepat di bawah ini untuk detail 3 putaran investigasi teknis). Setelah putaran investigasi berakhir negatif dan sesi jeda, King Rezi melanjutkan diskusi dengan membaca ulang dokumentasi resmi:

1. `astryx.atmeta.com/docs/styling` — dikonfirmasi Astryx punya hirarki resmi (`xstyle` prioritas #1 untuk override komponen, Tailwind untuk layout/wrapper).
2. `astryx.atmeta.com/docs/styling-libraries` — tidak memihak Tailwind vs StyleX, menyarankan "integrasi paling sempit sesuai kebutuhan".
3. `stylexjs.com/docs/learn/installation/nextjs` — ditemukan jalur resmi StyleX alternatif (`@stylexjs/postcss-plugin`) yang diklaim kompatibel Turbopack sejak Next.js 16.0.3 (belum pernah diuji di 3 putaran sebelumnya, yang semuanya memakai jembatan komunitas `@stylexswc/nextjs-plugin`).
4. `github.com/facebook/astryx/tree/main/apps/example-nextjs-tailwind` — dikonfirmasi Astryx (repo resmi `facebook/astryx`) mendukung resmi pola konsumsi tanpa compiler StyleX sama sekali (`package.json` contoh ini tidak punya dependency StyleX apapun).

King Rezi juga sempat menanyakan apakah `astryx.atmeta.com` benar-benar Meta — dikonfirmasi ya (repo `facebook/astryx`, footer "©2026 Meta Platforms, Inc.").

Dua file diskusi dibuat sebagai catatan proses: `project-manager/reports/KI-029-astryx-styling-gaps.md` (konversi dari `.html` sebelumnya) dan `project-manager/reports/KI-029-xstyle-diskusi.md` (rangkuman hirarki styling resmi + akar masalah teknis `xstyle`).

### Keputusan final

King Rezi memutuskan **tidak melanjutkan investigasi teknis apapun** untuk `xstyle` (termasuk opsi jalur resmi `@stylexjs/postcss-plugin` yang belum diuji) dan menutup KI-029 sebagai **Won't Fix** — bukan bug yang di-fix, melainkan keputusan arsitektur sadar untuk berhenti memakai `xstyle`/StyleX sepenuhnya, mengikuti pola resmi Meta (`example-nextjs-tailwind`). Didokumentasikan formal di **ADR-082** (amandemen ADR-041).

Konsekuensi yang disadari dan diterima: opsi "restrukturisasi DOM manual via `astryx swizzle`" untuk KI-031 (reposisi ikon `DateInput`/`TimeInput`) ikut tertutup, karena swizzle butuh compiler StyleX yang sama untuk hasilnya ter-styling. Satu-satunya opsi tersisa untuk KI-031 adalah menunggu Astryx menambah prop resmi posisi ikon.

### Eksekusi

- Dependency `@stylexjs/stylex` (`"0.19.0"`) dihapus dari `apps/web/package.json` — tidak pernah dipakai aktif di kode (seluruh percobaan 3 putaran sudah di-revert bersih sebelumnya). `@stylexjs/stylex` tetap ada di `bun.lock` sebagai peer dependency transitif `@astryxdesign/core` (dipakai internal Astryx untuk CSS pre-compiled-nya) — ini normal, bukan sisa dependency kita.
- `bun install` dijalankan ulang — lockfile ter-update bersih (24 packages resolved), tidak ada perubahan lain.
- `tsc --noEmit` dikonfirmasi bersih pasca-penghapusan.

### File yang berubah

- `apps/web/package.json`, `bun.lock` — hapus dependency `@stylexjs/stylex`.
- `project-manager/decisions/ADR-082-astryx-tailwind-only-hapus-stylex-xstyle-amandemen-adr-041.md` — ADR baru.
- `project-manager/DECISIONS.md` — indeks ADR-082 ditambahkan; ADR-041 ditandai `Amended by ADR-082`.
- `project-manager/PROJECT_STATE.md` — KI-029 dihapus dari daftar Known Issues (status Resolved, sesuai aturan KI di baris pembuka section tersebut); KI-031 diperbarui merefleksikan penutupan opsi swizzle.
- `project-manager/reports/KI-029-astryx-styling-gaps.md`, `project-manager/reports/KI-029-xstyle-diskusi.md` — catatan diskusi (dibuat sesi ini).

---

## 2026-08-19 — Upgrade Astryx 0.4.3 (selesai bersih) + investigasi KI-029 putaran 2 & 3 (hasil negatif, dihentikan sementara)

### Context

Branch `fix/ki-029-stylex-babel-plugin`. Dua pekerjaan berbeda terjadi di branch yang sama:

1. **Upgrade Astryx `0.1.8 → 0.4.3`** (core, cli, theme-neutral) — dilakukan sebagai bagian eksplorasi apakah versi baru sudah punya rekomendasi resmi berbeda untuk wiring StyleX (lihat poin 2). Selesai bersih: `astryx upgrade --apply` melaporkan "No changes needed" untuk 156 komponen (tidak ada breaking change yang menyentuh kode existing). File berubah: `apps/web/package.json`, `bun.lock`, `apps/web/.claude/CLAUDE.md` (regenerated otomatis via `bunx astryx init --features agents --agent claude`). Diverifikasi `tsc --noEmit`, `bun run build`, smoke-test browser — semua lolos, tidak ada regresi.
2. **Investigasi lanjutan KI-029** (putaran 2 & 3, melanjutkan putaran 1 yang sudah tercatat sebelumnya) — dicoba paket resmi baru yang direkomendasikan `astryx docs styling` versi 0.4.3, **`@stylexswc/nextjs-plugin`** (compiler berbasis SWC/Rust NAPI-RS, gantinya `@stylexjs/nextjs-plugin` lama yang gagal total di putaran 1 karena Turbopack tidak memanggil hook webpack). Putaran 2 (`v0.18.3` stable): compiler berhasil jalan (bug resolusi modul `@stylexswc/turbopack-plugin/loader` ditemukan & diperbaiki sendiri), tapi nilai numerik (`maxWidth: 420`, dst.) dan fungsi warna (`rgb(...)`) hilang total dari CSS hasil ekstraksi — hanya nilai keyword string yang ter-extract. Putaran 3 (`v0.18.4-rc.2`, pre-release, changelog eksplisit menyebut fix "number rendering, rounding, unsupported value handling" PR #1258 upstream): dicoba atas persetujuan eksplisit King Rezi untuk ambil risiko pre-release — **bug identik, tidak fixed**, dikonfirmasi definitif lewat perbandingan classList baseline-vs-xstyle dan grep langsung isi CSS terkirim. Semua perubahan percobaan (`next.config.ts`, `postcss.config.mjs`, `package.json`+`bun.lock` untuk paket `@stylexswc/*`, halaman test) **sudah di-revert bersih** di kedua putaran — tidak ada sisa kode permanen dari investigasi ini.

### Keputusan penutup

Setelah 3 putaran investigasi teknis lengkap (webpack-based gagal total → SWC-based stable ada bug ekstraksi → SWC-based pre-release bug identik), King Rezi memutuskan **berhenti melanjutkan investigasi teknis KI-029/KI-030/KI-031 untuk saat ini** dan **menempuh jalan lain** (kata beliau langsung). Belum ada detail spesifik jalur alternatif yang dimaksud pada momen keputusan ini diambil. Ini **bukan** keputusan Resolved — ketiga Known Issue (KI-029, KI-030, KI-031) tetap berstatus `Open` di `PROJECT_STATE.md`, workaround existing (`className` Tailwind untuk KI-029, ikon posisi default kiri untuk KI-031) tetap berlaku.

### Referensi bukti lengkap

Laporan investigasi lengkap (seluruh 3 putaran KI-029: kutipan resmi `astryx docs styling`, output `astryx component TimeInput/DateInput --dense`, changelog Astryx, GitHub Releases upstream `Dwlad90/stylex-swc-plugin`, tabel pengukuran computed style browser + grep CSS chunk) didokumentasikan sebagai file mandiri: `project-manager/reports/KI-029-astryx-styling-gaps.md` (dibuat sebagai `.html`, dikonversi ke `.md` dan `.html`-nya dihapus 2026-08-19 — lihat entri di atas).

### File yang berubah

- `apps/web/package.json`, `bun.lock` — upgrade Astryx 0.4.3.
- `apps/web/.claude/CLAUDE.md` — regenerated (auto, mengikuti `@astryxdesign/cli` v0.4.3).
- `project-manager/PROJECT_STATE.md` — catatan penutup investigasi di KI-029/030/031 + entri "Completed (Ringkasan)" untuk upgrade Astryx.
- `project-manager/reports/KI-029-astryx-styling-gaps.md` — laporan bukti (dibuat di sesi sebelumnya sebagai `.html`, direferensikan di sini; dikonversi ke `.md` 2026-08-19).

Tidak ada perubahan pada `TASKS.md`/`tasks/vXX-*.md` (KI-029/030/031 bukan task formal bernomor) maupun `DECISIONS.md` (tidak ada perubahan baseline arsitektur — investigasi berakhir tanpa solusi yang diadopsi).

---

## 2026-08-18 — T-029 Publish Now selesai + perbaikan UI Schedule Picker Draft Editor (KI-029, KI-030)

### Context

T-029 (Publish Now, ADR-047) sebelumnya salah tercatat sebagai "belum ada desain apapun" — koreksi (commit `c967b47`) menemukan tombol "Publish Now" dan dialog konfirmasinya sudah ada di Claude Design (`templates/draft-editor.html`, `templates/app-prototype/AppPrototype.dc.html`), jadi sisa pekerjaan murni implementasi kode. Implementasi dikerjakan oleh Prabowo Feature Engineer (backend/use-case) dan Mark UI Engineer (komponen Astryx di Draft Editor), commit `1c35004`, branch `feature/t-029-publish-now`, PR #80 ke base `staging`.

### Yang diubah — Backend

- **`apps/web/src/domains/publishing/services/publish-now.use-case.ts`** (baru) — `PublishNowUseCase`, mengikuti pola `SchedulePostsUseCase` (T-028/ADR-059). RBAC eksplisit (`assertActorCanPublishNow`) dijalankan fail-fast sebelum validasi `ContentFormat` (ADR-039, `assertContentFormatAllowed`). Urutan kritis: persist dulu (`PublishingPostTarget` status `pending`, post → `Published`) lewat `repository.publishNow`, baru panggil adapter per target, baru update outcome — mencegah job Outstand orphan tanpa jejak DB.
- **`apps/web/src/domains/publishing/rbac.ts`** (baru) — `assertActorCanPublishNow`, role diizinkan (ADR-074): Owner, Admin, Creator — sama persis dengan Schedule, dieksplisitkan di kode (bukan implicit "semua boleh") karena `getWorkspaceContext()` men-cast `role` dari header tanpa validasi runtime.
- **`apps/web/src/domains/publishing/repositories/publishing.repository.ts`** + **`apps/web/src/lib/repositories/publishing/publishing.repository.ts`** — tambah method `publishNow` (interface + implementasi Prisma).
- **`apps/web/src/lib/adapters/outstand/fake-outstand-adapter.ts`** + **`apps/web/src/domains/publishing/adapters/outstand-adapter.ts`** + **`packages/shared/src/contracts/outstand-adapter.ts`** — perluasan `IOutstandAdapter`/`FakeOutstandAdapter` dengan `publishNow`, pola ADR-059 (auto-switch via env var, fidelity instan tanpa simulasi delay/failure). Jalur produksi tetap `FakeOutstandAdapter` — T-025 real adapter masih blocked kredensial (KI-003).
- **`apps/web/src/domains/publishing/index.ts`** — expose public API baru.

### Yang diubah — UI Draft Editor

- **`apps/web/src/app/(app)/components/draft-editor/Modal.tsx`** — tombol "Publish Now" berdampingan "Save as Draft"/"Schedule" (KSP-05-F12), dialog Confirmation Summary varian Publish Now (UXP-04). Sebagai bagian commit yang sama: Schedule Picker dirapikan menyamai mockup Claude Design — heading tunggal "Jadwal" (sebelumnya duplikat), label individual field disembunyikan, placeholder Bahasa Indonesia, ikon kalender/jam dipindah ke kanan lewat Tailwind `flex-row-reverse` (bukan `xstyle`/`stylex.create()` — lihat KI-029 di bawah), dan dot indicator ditambahkan ke `Badge` status lewat slot icon resmi (`currentColor`, otomatis menyesuaikan variant).
- **`apps/web/src/app/(app)/components/draft-editor/actions.ts`** — Server Action `publishNowAction`, satu-satunya call site `PublishNowUseCase`.
- **`apps/web/src/app/(app)/components/draft-editor/terminal-destination.ts`** (+ test) — redirect setelah konfirmasi Publish Now diarahkan ke Publish/Calendar lewat `finishTerminalAction`, menutup T-031.4 sekaligus (dipakai seragam dengan Save as Draft dan Schedule).

### Known Issues baru

- **KI-029** — `@stylexjs/babel-plugin` tidak pernah di-wire di `next.config.ts` `apps/web`, sehingga prop `xstyle`+`stylex.create()` (mekanisme kustomisasi resmi Astryx) gagal di runtime (`"Unexpected 'stylex.create' call ... must be compiled by '@stylexjs/babel-plugin'"`). Workaround sementara: `className` Tailwind layout-only (rule 14 AGENTS.md) untuk kasus yang bisa diselesaikan lewat class utility biasa.
- **KI-030** — `TimeInput` Astryx tidak membatasi input real-time (elemen `<input>` internal `type="text"` tanpa `maxLength`/`pattern`), tidak ada prop resmi untuk membatasinya. Mitigasi wrapper `onKeyDownCapture`/`onPaste` sempat dicoba tapi **dihapus atas keputusan King Rezi** (2026-08-18) karena belum solid (tidak menangkap paste/drag-drop/IME) — menunggu Astryx menambah prop resmi.

### Verifikasi

- `tsc --noEmit` bersih.
- Vitest: `publish-now.use-case.test.ts` (baru, 357 baris), `fake-outstand-adapter.test.ts` (tambahan test `publishNow`), plus test terkait lain yang disesuaikan (`publishing.repository.ts`, `schedule-posts.use-case.test.ts`, `terminal-destination.test.ts`, `analytics-ingestion.use-case.test.ts`) — semua lulus.
- End-to-end browser: New Post → isi caption/target → klik "Publish Now" → dialog Confirmation Summary → konfirmasi → redirect ke Publish/Calendar → data di DB berstatus `published`.

### Dokumentasi terkait

- `project-manager/tasks/v02-publishing-mvp.md` § T-029 (Status ✅ Done, seluruh subtask T-029.1–.6 dicentang) dan § T-031 (T-031.4 dicentang, Status task ✅ Done).
- `project-manager/TASKS.md` — indeks v0.2 (7 ✅ · 12 ⏳), Total (21 selesai · 140 subtask), Fokus sekarang (T-029 dipindah jadi catatan Done, tersisa T-025).
- `project-manager/PROJECT_STATE.md` — Completed (Ringkasan) + Top Next Tasks diperbarui.

---

## 2026-08-14 — Bug fix: redirect `localhost:8080` di proxy/onboarding (root cause dari `request.url` di balik reverse proxy Railway)

### Context

Ditemukan ad-hoc saat King Rezi menguji login manual di staging (browser test, akun QA `raka.test@kopiselasar.com`): sesekali browser sempat di-redirect ke `http://localhost:8080` (gagal load, `ERR_SSL_PROTOCOL_ERROR`/`ERR_BLOCKED_BY_CLIENT`) sebelum session tetap terbentuk normal. Log Railway (`railway logs`) mengonfirmasi `next start` di container memang bind internal ke `localhost:8080` — cocok dengan console error browser "Failed to fetch RSC payload for .../onboarding/resume. Falling back to browser navigation."

### Root cause

`proxy.ts` (Next.js Middleware, 5 titik) dan `app/onboarding/resume/route.ts` (2 titik) membangun redirect pakai `new URL(path, request.url)`. `request.url` mencerminkan Host header yang diterima proses Next.js — di balik reverse proxy Railway, ini bisa jadi alamat bind internal container (`http://localhost:8080`) alih-alih domain publik, khususnya saat race di request awal (container baru start/warm-up). Alur redirect: `proxy.ts` (workspace cookie belum ke-set) → `/onboarding` → `onboarding/page.tsx` → `/onboarding/resume` → route handler ini — semua titik memakai pola yang sama, jadi kalau origin salah di satu titik, tetap salah di seluruh chain.

### Yang diubah

- **`apps/web/src/proxy.ts`**: tambah helper `redirectTo(path)` yang membangun origin dari `getServerEnv().BETTER_AUTH_URL` (bukan `request.url`). 5 pemanggil `NextResponse.redirect(new URL(..., request.url))` diganti pakai helper ini.
- **`apps/web/src/app/onboarding/resume/route.ts`**: origin redirect diambil sekali di awal handler (`getServerEnv().BETTER_AUTH_URL`), dipakai di 2 titik redirect (`/login`, `/` atau `/onboarding`).
- Pola ini konsisten dengan base URL publik yang sudah dipakai untuk invite link (`settings/members/actions.ts:106`).

### Verifikasi

- `tsc --noEmit` bersih (apps/web).
- `eslint .` tidak ada error baru pada file yang diubah (warning "Pages directory cannot be found" pre-existing, tidak terkait).
- Login manual lokal (`bun run dev`, akun QA Raka Pratama): logout → login → dashboard, tidak ada redirect salah, tidak ada regresi, console bersih.
- Tidak sempat direproduksi ulang di staging secara deterministik (bug bersifat race/kondisional) — perbaikan berdasarkan root cause yang terkonfirmasi dari log Railway + kode, bukan dari reproduksi berulang.

### Known Issues terdampak

- Tidak ada KI baru dibuka. Bukan task bernomor (perbaikan ad-hoc, ditemukan di luar backlog formal). Tidak ada ADR baru — ini bug fix, bukan perubahan baseline arsitektur.

---

## 2026-08-14 — ADR-081: Open question local dev ditutup — local resmi menumpang ke project staging

### Context

King Rezi menjawab open question yang tercatat di ADR-081 (entri di bawah): local development **tidak** akan memakai project Supabase terpisah — akan menumpang ke project staging yang sama (ref `ndcrkzqgqukqfmekgoze`). Alasan: efisiensi/kesederhanaan operasional, project ini baru satu-satunya yang aktif. Ini adalah finalisasi/kelanjutan ADR-081 yang sudah ada, **bukan** ADR baru terpisah.

### Yang diubah

- **`project-manager/decisions/ADR-081-...md`**: bagian open question diganti jadi keputusan final (poin 4 di Decision) — local development resmi menumpang ke project staging yang sama, tanpa isolasi database local↔staging. Ditambahkan sub-bagian konsekuensi yang disadari (migrasi/eksperimen lokal langsung menyentuh data staging; EM-D06 dikecualikan untuk pasangan local↔staging, tetap penuh untuk staging↔production). Bagian "Alternatives Considered" diupdate — opsi project local terpisah kini eksplisit **ditolak** (bukan lagi "belum diputuskan").
- **`project-manager/DECISIONS.md`**: baris indeks ADR-081 diupdate — kalimat "open question" dihapus, diganti ringkasan keputusan final.
- **`product-discovery/06-engineering/environment-management.md`**: EM-D02, diagram/tabel Environment Tiers, Secret Management, Perbedaan Konfigurasi per Tier (baris Migrate/Seed-reset), Alur Setup Local, dan Decision Log (EM-D06 dicatat pengecualian eksplisit, EM-D10 dirapikan, **EM-D11 baru** untuk keputusan final) — seluruh referensi "open question" strategi local dev dihapus/ditandai selesai.
- **`project-manager/PROJECT_STATE.md`**: dicek — tidak ada referensi eksplisit ke open question ini di file tersebut (KI-028 hanya membahas gap production, tidak terdampak), jadi tidak ada perubahan.

### Known Issues terdampak

- Tidak ada — KI-028 (gap production) tetap terbuka, tidak terkait closure open question ini.

---

## 2026-08-14 — ADR-081: Project Supabase existing resmi jadi staging permanen (amandemen EM-D02)

### Context

King Rezi mengonfirmasi eksplisit bahwa pemakaian project Supabase Cloud existing ("Sosial Media Management", ref `ndcrkzqgqukqfmekgoze`, region Singapore `ap-southeast-1`) sebagai database **staging** — dicatat sebagai gap terhadap EM-D02 saat penutupan KI-025 (entri 2026-08-14 di atas) — adalah keputusan **permanen**, bukan shortcut sementara.

### Yang diubah

- **ADR baru ADR-081** ditambahkan di `project-manager/DECISIONS.md` + `project-manager/decisions/ADR-081-project-supabase-existing-resmi-jadi-staging-amandemen-em-d02.md`, mengamandemen **ADR-033/EM-D02**.
- **ADR-033** (`project-manager/decisions/ADR-033-...md` dan baris indeks di `DECISIONS.md`): Status ditandai `Accepted — Amended by ADR-081 (2026-08-14)`.
- **`product-discovery/06-engineering/environment-management.md`**: EM-D02, diagram/tabel Environment Tiers, Secret Management, Alur Setup Local, dan Decision Log (baris EM-D09/EM-D10 baru) diupdate — project existing resmi jadi staging, rencana project `social-media-local` terpisah dibatalkan. Strategi local development pasca-amandemen ditandai **open question** (belum diputuskan).
- **`project-manager/PROJECT_STATE.md`** (KI-028): kalimat disesuaikan — "staging saat ini memakai" → "staging permanen memakai", ditambah referensi ADR-081.
- **Tidak diubah** (di luar scope): DI-D03 (`deployment-infrastructure.md`, isolasi staging↔production tetap wajib project terpisah) dan KI-028 (production project belum dibuat, tetap open).

### Known Issues terdampak

- KI-028 tetap terbuka — tidak resolved oleh ADR ini (hanya soal staging, bukan production).

---

## 2026-08-14 — Railway staging deploy live: KI-025 resolved, KI-028 (gap production) dibuka

### Context

Deploy pertama kalinya project ke Railway. Menutup KI-025 ("belum ada project Railway sama sekali") dengan bukti deploy staging sukses + verifikasi runtime, bukan cuma pembuatan project.

### Yang dibuat/diverifikasi

- **Project Railway** `social-media-management` (workspace Insvire), environment `staging`, region Singapore (`asia-southeast1-eqsg3a`) sesuai DI-D01.
- **Service `web`** (Next.js) — connect ke branch `staging` GitHub repo. Build command `bun install && bun run build`, `preDeployCommand` `cd apps/web && bunx prisma migrate deploy`, `startCommand` `bun run --cwd apps/web start`, healthcheck `/api/health`. Domain: `web-staging-60d7.up.railway.app`. Deploy SUCCESS, health check 200 OK terverifikasi.
- **Service `cron`** — image `curlimages/curl:latest`, `cronSchedule` `* * * * *`, trigger `POST /api/jobs/run` dengan header `X-Job-Secret`. 2x run berturut-turut SUCCESS.
- **Env var staging** lengkap dan terisi nilai asli/generated: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `JOB_SECRET`. `BETTER_AUTH_API_KEY` sengaja dikosongkan (ADR-070). `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`OUTSTAND_API_KEY`/`OUTSTAND_WEBHOOK_SECRET` masih placeholder dummy — 4 env var tersisa dari known gap sebelumnya (JOB_SECRET kini sudah diisi nilai asli generated).
- **Database staging**: memakai project Supabase Cloud yang **sudah ada sebelumnya** ("Sosial Media Management", ref `ndcrkzqgqukqfmekgoze`, region Singapore) — keputusan eksplisit King Rezi, bukan project baru terpisah seperti disebut awal di EM-D02. Project Supabase untuk **production** belum dibuat sama sekali.
- **Git**: branch `staging` dibuat dari `main` dan di-push ke GitHub (repo sebelumnya cuma punya `main`).
- **Bug fix**: script `prepare` di root `package.json` (`lefthook install`) gagal di container build Railway (tidak ada git hooks context) — diubah jadi `lefthook install || true`, di-commit ke branch `staging`.
- **Railway MCP server** (`https://mcp.railway.com`) didaftarkan ke `.mcp.json` dan `.cursor/mcp.json` (dua file kembar, ADR-064) via `railway setup agent --oauth`.
- **Branch protection GitHub** diaktifkan untuk `main` dan `staging`: wajib PR (no direct push), wajib status check "Quality gates" (workflow CI `.github/workflows/ci.yml`) hijau sebelum merge, force-push & delete branch diblokir, required approving reviews = 0 (solo developer).

### Known Issues terdampak

- **KI-025 resolved** — dihapus dari daftar Known Issues aktif di `PROJECT_STATE.md` (sesuai konvensi ADR-066/067, riwayat lengkap ada di sini).
- **KI-015** — status berubah jadi "Sebagian Resolved": `JOB_SECRET` sudah resolved (staging), sisa scope `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`.
- **KI-028 dibuka** (baru) — production Railway environment dan production Supabase project belum dibuat sama sekali; menyusul setelah KI-003/KI-015 (Outstand/Google) resolved atau sesuai prioritas King Rezi.

### Catatan untuk King Rezi (flag, bukan keputusan final)

Keputusan memakai project Supabase existing "Sosial Media Management" sebagai database staging (alih-alih membuat project baru terpisah) berpotensi menyimpang dari premis awal EM-D02. Ini dicatat di sini sebagai temuan governance — belum dibuatkan ADR baru karena instruksi sesi ini secara eksplisit meminta konfirmasi dulu ke King Rezi sebelum menulis ADR.

---

## 2026-08-14 — T-007.1/.5/.6 (Members management: Invite via Copy Link + safety dialogs Remove/Update Role): selesai

### Context

Bagian dari T-007 (Members management), memakai ADR-080 (invite dipecah dua metode — Copy Link vs Kirim via Email, amandemen ADR-072). Dikerjakan dalam satu sesi, direview Ridwan Architecture Reviewer dan diverifikasi Najwa QA Engineer.

### T-007.1 — `WorkspaceService.inviteMember` (jalur Copy Link)

Generate invitation email-bound + token, tidak bergantung T-005 (provider email). `removeMember` dan `updateMemberRole` (RBAC Owner/Admin) juga bagian subtask ini — sudah selesai sebelumnya, dikonfirmasi ulang tetap benar. Jalur "Kirim via Email" tetap terpisah sebagai T-007.7, masih blocked T-005.

**Catatan cakupan (ditemukan CodeRabbit, review PR #73):** subtask ini hanya membuat invitation + link — halaman `/invite/[token]` (accept-invite: validasi token, buat akun/login dengan email yang sama, insert `workspace_members`) **belum dibuat sama sekali** (ADR-072 "future work" terpisah, belum ada nomor T-XXX). Link yang dihasilkan hari ini 404 kalau dibuka. Jangan anggap alur invite-to-membership sudah utuh sampai halaman itu ada.

### T-007.5 — Dialog konfirmasi Remove Member + Update Member Role

ADR-049 Tier 2 — dialog konfirmasi sebelum aksi Remove Member dan Update Member Role dieksekusi.

### T-007.6 — UI dialog Invite Member (2 metode)

Dialog "Undang Anggota Baru" dengan Selector Role, 2 opsi metode (Copy Link default aktif, Kirim via Email disabled berbadge "Segera"), field email-bound wajib, link readonly + tombol Salin — sesuai desain yang sudah dikonfirmasi King Rezi di Claude Design (`templates/settings-members.html`, 2026-08-14).

### Fix tambahan selama implementasi

Heading duplikat "Members" sempat muncul (komponen `MembersTable` merender heading section-nya sendiri berdampingan dengan heading halaman) — diperbaiki dengan menambah slot `headerAction` baru di `MembersTable`, dipakai untuk menaruh tombol "Undang Anggota" tanpa mengulang judul.

### Review Ridwan Architecture Reviewer

Bersih, tanpa temuan.

### QA Najwa

Full suite (typecheck/lint/test: 126 passed + 3 skip pre-existing) hijau. Yang **benar-benar terverifikasi** di browser: gating tombol submit (disabled sampai email valid), radio group Copy Link/Kirim via Email tampil sesuai desain, dialog konfirmasi Remove Member/Update Role termount dengan copy yang benar. Yang **tidak** berhasil dibuktikan hidup (dikoreksi setelah review CodeRabbit menandai klaim "golden path ... diverifikasi" sebelumnya tidak akurat): klik "Buat Link Undangan" gagal dengan error `Missing required server environment variables: JOB_SECRET` — generate-link-lalu-salin belum pernah dibuktikan sukses secara visual. Remove Member dan Update Role **tidak** bisa diuji end-to-end penuh secara live — dev DB saat ini cuma punya 1 member (belum ada akun kedua nyata untuk jadi target aksi). Keduanya known gap lingkungan (KI-015), bukan bug baru dari task ini.

### Status task T-007

Tetap `🟡 In Progress` — sisa T-007.7 (jalur Kirim via Email) masih blocked T-005 (provider email transactional belum ditetapkan).

---

## 2026-08-13 — T-008 (Workspace Settings — General + Danger Zone): implementasi selesai, 1 open item desain belum ditutup

### Context

T-008.2–.4 dikerjakan dalam satu sesi oleh dua subagent berurutan: Prabowo Feature Engineer (backend) lalu Mark UI Engineer (UI), direview Ridwan Architecture Reviewer, dan diverifikasi Najwa QA Engineer.

### T-008.2 — `deleteWorkspace`

RBAC Owner-only, cascade delete via `ON DELETE CASCADE`. Ditemukan gap: baseline menyatakan seluruh tabel `workspace_id` sudah cascade, tapi realita `schema.prisma` awal masih RESTRICT di beberapa tabel. Diperbaiki lewat 2 migration applied ke DB nyata:

- `20260813085308_t008_workspace_transfer_ownership_delete` — 6 tabel: `publishing_posts`, `ai_requests`, `engagement_inbox_items`, `analytics_workspace_snapshots`, `media_items`, `notifications`.
- `20260813092018_t008_cascade_connected_account_and_engagement_reply` — 4 FK tambahan ditemukan Ridwan: `publishing_post_targets.connected_account_id`, `publishing_queue_slots.connected_account_id`, `engagement_inbox_items.connected_account_id`, `engagement_replies.inbox_item_id` (yang terakhir sebelumnya sama sekali tidak punya jalur cascade dari `workspaces`).

### T-008.3 — `transferOwnership` + `acceptOwnershipTransfer` + `cancelOwnershipTransfer`

Kolom baru `workspaces.pending_owner_transfer_to`. `transferOwnership` (RBAC Owner, target harus Admin aktif) set pending state + kirim notifikasi `ownership_transfer_requested`, tidak langsung swap role. `acceptOwnershipTransfer` (RBAC hanya target) swap role Owner↔Admin dalam satu transaksi + notifikasi `ownership_transfer_resolved`. Ditambah `cancelOwnershipTransfer` (tidak eksplisit di baseline awal, ditambahkan karena UI butuh tombol "Batalkan Permintaan" di pending banner — konsisten pola RBAC Owner-only). Domain `notification` (sebelumnya scaffold kosong) diisi minimal (`NotificationService.notify`), dipanggil workspace service via port lokal, bukan import langsung — cross-domain boundary terjaga.

Fix review Ridwan putaran ke-2: logic "siapa yang eligible jadi target Transfer Ownership" (Admin + status Active) sebelumnya terduplikasi di RSC `page.tsx` dan service — diekstrak jadi `WorkspaceService.listTransferEligibleMembers` (satu sumber kebenaran, dipakai baik untuk render UI maupun validasi transfer).

### T-008.4 — UI

`apps/web/src/app/(app)/settings/page.tsx` + `components/WorkspaceGeneralSettings.tsx`. Card General (rename, tanpa konfirmasi) + Card Danger Zone (hidden total untuk non-Owner, bukan cuma disabled) dengan 2 dialog Tier 1 "ketik nama workspace untuk konfirmasi" (Transfer Ownership, Hapus Workspace) — pola baru, dikomposisi dari Dialog+Field+TextInput Astryx yang sudah ada, tanpa komponen baru.

### Gap desain terbuka — BELUM dikonfirmasi King Rezi

Mockup `templates/settings-general.html` di Claude Design tidak menunjukkan cara memilih Admin target sebelum dialog Transfer Ownership dibuka. Mark UI Engineer menambahkan `Selector` Admin aktif sebagai keputusan implementasi sendiri (bukan sesuai desain final) — dicatat sebagai open item (KI-027), bukan langsung ditutup sebagai selesai 100%, karena butuh konfirmasi/update balik ke Claude Design.

### QA Najwa

Full suite (typecheck/lint/test: 118 passed + 3 skip pre-existing) hijau. Golden path rename ✅, Danger Zone visible+correct untuk Owner ✅, dialog type-to-confirm (salah→disabled, benar→enabled) ✅, RBAC hidden-by-code untuk non-Owner ✅ (verified via code review, bukan live 2-akun), delete workspace end-to-end nyata berhasil (dipakai sekaligus sebagai test cleanup). 3 item TIDAK diverifikasi live (Selector dengan data Admin sungguhan, RBAC live dengan akun non-Owner, alur transfer 2-akun end-to-end) karena fitur invite member (T-007.1) belum selesai sehingga tidak bisa membuat akun Admin kedua di workspace yang sama — dicatat sebagai limitation environment, bukan bug.

### Dampak dokumentasi

`tasks/v01-foundation.md` § T-008: T-008.1–.4 dicentang selesai, status task tetap `🟡 In Progress` (bukan `✅ Done`) karena open item desain Selector belum dikonfirmasi. `PROJECT_STATE.md`: Completed (Ringkasan) ditambah entry T-008 (item terlama T-040 dihapus dari daftar untuk menjaga batas 5), Known Issues ditambah KI-027. Tidak ada perubahan di `TASKS.md` Fokus sekarang (T-008 memang bukan bagian dari fokus itu) maupun hitungan Total subtask (masih 138, T-008 tidak menambah/mengurangi jumlah subtask terdefinisi). Tidak ada ADR baru — ini implementasi dari task yang sudah ada (T-008, ADR-049/ADR-050), deviasi kecil Selector adalah gap implementasi menunggu konfirmasi desain, bukan perubahan keputusan arsitektur.

---

## 2026-08-13 — KI-026 resolved: RLS BYPASSRLS diperbaiki + 2 bug desain policy `workspace_members` ditemukan & diperbaiki

### Context

Lanjutan dari T-017 (lihat entri di bawah, dikerjakan hari yang sama). Setelah T-017 ditutup dengan gap runtime terpisah (KI-026: role koneksi `postgres` punya `BYPASSRLS = true` sehingga RLS belum efektif), King Rezi menindaklanjuti langsung di sesi yang sama.

### Root cause & resolusi

King Rezi membuat role Postgres baru `app_runtime` (tanpa `BYPASSRLS`) via Supabase SQL Editor — grant CRUD ke semua tabel `public` + default privileges untuk tabel baru. `DATABASE_URL` dipindah ke role ini; `DIRECT_URL` sengaja **tetap** memakai role `postgres` (butuh privilege DDL untuk `prisma migrate deploy` — keputusan sadar, bukan oversight).

Setelah RLS benar-benar aktif (bukan lagi dilewati BYPASSRLS), ditemukan 2 bug desain baru yang sebelumnya tersembunyi (root cause sama: policy lama ditulis dengan asumsi tidak pernah benar-benar dieksekusi):

1. **Infinite recursion** pada policy `workspace_members_workspace_isolation` — policy tabel `workspace_members` melakukan subquery ke tabel itu sendiri, memicu Postgres error "infinite recursion detected in policy". Fix: migration `20260813073556_t017_fix_workspace_members_rls_recursion` — pecah subquery jadi `SECURITY DEFINER` function `current_user_workspace_ids()` (dimiliki role `postgres`/BYPASSRLS, jadi tidak memicu ulang RLS saat dipanggil dari dalam function).
2. **INSERT bootstrap gap** — policy asli pakai `FOR ALL` (WITH CHECK = USING), sehingga insert membership pertama (owner baru bikin workspace) gagal karena user itu belum terdaftar jadi member aktif manapun (chicken-and-egg). Ditambah, Prisma selalu `INSERT ... RETURNING`, jadi SELECT-policy juga dicek ke baris yang baru diinsert. Fix 2 migration:
   - `20260813073842_t017_split_workspace_members_insert_policy` — pisah `FOR ALL` jadi `FOR SELECT/UPDATE/DELETE` (tetap strict, pakai function) + `FOR INSERT WITH CHECK (true)` terpisah (aman karena authorization utama tetap di Application Service/RBAC per DB-D05 — insert ke `workspace_members` cuma dipanggil dari `WorkspaceRepository.createWithOwner`, sudah divalidasi di service layer).
   - `20260813074306_t017_allow_self_visibility_workspace_members` — tambah klausa `OR user_id = current_setting('app.current_user_id', true)` langsung (tanpa subquery) di SELECT policy, supaya baris yang baru diinsert bisa langsung "melihat dirinya sendiri" tanpa perlu query ulang tabel (yang tidak akan melihat baris in-flight).

Fix kode aplikasi terkait: `apps/web/src/lib/repositories/workspace/workspace.repository.ts` method `createWithOwner` sekarang set `app.current_user_id = ownerId` (via `tx.$executeRaw` `set_config`) di awal transaksi, sebelum insert workspace + membership pertama — supaya SELECT-policy self-visibility di atas bisa match.

Test `apps/web/src/lib/prisma/with-current-user.test.ts` diupdate: 2 assertion yang tadinya berlabel "KNOWN GAP" (mendokumentasikan bug BYPASSRLS lama) sekarang dibalik jadi assertion positif (cross-workspace row tidak terlihat; default-deny tanpa `SET LOCAL` benar-benar terjadi) — sesuai instruksi yang sudah ditulis di komentar test itu sendiri sejak awal. Setup `beforeAll` di test juga diupdate untuk pakai `withCurrentUser` (pola sama seperti fix repository).

Verifikasi: full test suite `bun run test` (dengan `DATABASE_URL` nyata via `--env-file`) → 14 file test, 105 passed + 1 skipped (skip disengaja untuk environment tanpa DB). `tsc --noEmit` bersih. Tidak ada regresi di test lain yang menyentuh `workspace_members`/`workspaces`.

Ketiga migration baru sudah **applied ke database Supabase nyata** (`bunx prisma migrate deploy`), bukan cuma file lokal.

Railway belum pernah dibuat/dipakai sama sekali oleh King Rezi saat ini — jadi tidak ada perubahan env var production dari pekerjaan ini, hanya `apps/web/.env.local` (lokal). Blocker "Railway belum pernah dibuat" (KI-025) tidak berubah. Follow-up King Rezi di masa depan: begitu Railway project pertama dibuat & deploy production, `DATABASE_URL` production juga perlu di-set ke role `app_runtime` (pola sama seperti `.env.local`), `DIRECT_URL` tetap `postgres`.

### File yang berubah

- `apps/web/src/lib/prisma/with-current-user.test.ts` (modified)
- `apps/web/src/lib/repositories/workspace/workspace.repository.ts` (modified)
- `apps/web/prisma/migrations/20260813073556_t017_fix_workspace_members_rls_recursion/migration.sql` (baru, applied)
- `apps/web/prisma/migrations/20260813073842_t017_split_workspace_members_insert_policy/migration.sql` (baru, applied)
- `apps/web/prisma/migrations/20260813074306_t017_allow_self_visibility_workspace_members/migration.sql` (baru, applied)

### Dampak dokumentasi

KI-026 dihapus dari daftar Known Issues di `PROJECT_STATE.md` (status Resolved, riwayat lengkap ada di entri ini, ID tidak didaur ulang). T-017 di `tasks/v01-foundation.md` tetap ✅ Done, catatan gap runtime dan 2 assertion "KNOWN GAP" diupdate jadi resolved. Tidak ada ADR baru — ini bugfix/implementasi dari task yang sudah ada (T-017), bukan perubahan baseline arsitektur.

---

## 2026-08-13 — T-017 (RLS SQL policies), T-019 (skema API mobile) selesai; T-008 desain dimulai; T-018 di-defer

### Context

King Rezi meminta laporan task yang bisa dikerjakan, lalu mengerjakan beberapa secara paralel dalam satu sesi: T-017 didelegasikan ke Elon Backend Engineer (subagent), T-019 dikerjakan langsung di sesi utama, T-008 (Workspace Settings) sedang didesain King Rezi sendiri di Claude Design, dan T-018 (investigasi hydration ngrok) ditemukan sudah superseded oleh ADR-070.

### T-018 — Deferred (superseded ADR-070)

Investigasi awal (dugaan bug HMR/Turbopack lewat ngrok) ternyata sudah terjawab oleh ADR-070 (2026-08-06): requirement ngrok berasal dari constraint Better Auth Cloud (Base URL wajib publik), bukan keterbatasan Better Auth self-hosted. Setelah kembali ke self-hosted, testing browser langsung via `localhost:3000` — ngrok tidak lagi dipakai. T-018.1/.2 dicoret (tidak relevan lagi), T-018.3 tidak dilanjutkan. Status diubah ke ⏸️ Deferred di `tasks/v01-foundation.md`. Catatan basi di T-004 (salah merujuk "T-017" untuk isu ngrok, seharusnya T-018) juga diperbaiki.

### T-008 — Desain dimulai (belum implementasi kode)

Cek Claude Design project "Social Media Management": belum ada rancangan Workspace Settings → General + Danger Zone (slot "General" di sidebar Organization masih dead-link `href="#"` di 5 file `settings-*.html`). Disusun brief desain lengkap (file baru `templates/settings-general.html`, pola Tier 1 "ketik nama workspace untuk konfirmasi" baru — belum ada preseden di `components/dialog.html`, alur Transfer Ownership dua langkah ADR-050, RBAC Danger Zone Owner-only, wiring ke `AppPrototype.dc.html` + `readme.md`). King Rezi mengerjakan desainnya sendiri langsung di Claude Design (bukan via subagent/`DesignSync`). Status T-008 diubah ke 🟡 In Progress dengan instruksi eksplisit untuk sesi berikutnya: cek `DesignSync` dulu sebelum lanjut implementasi kode (aturan keras #17).

### T-019 — Selesai (skema API mobile `/api/v1` + Better Auth Bearer plugin, ADR-043)

File diubah/ditambah:
- `apps/web/src/lib/better-auth/auth.ts` — `bearer()` plugin aktif tanpa syarat (bareng `dash` kondisional), `trustedOrigins` dari env `BETTER_AUTH_TRUSTED_ORIGINS` (opsional, kosong untuk sekarang), `rateLimit.customRules` diperketat untuk `/sign-in/email` (60s/5) dan `/sign-up/email` (60s/3)
- `apps/web/src/proxy.ts` — `/api/v1` ditambahkan ke `BYPASS_PREFIXES` supaya request Bearer tidak kena redirect `/login`
- `apps/web/src/app/api/v1/health/route.ts` (baru) — endpoint skema pembuktian wiring (bukan endpoint bisnis), validasi session via `auth.api.getSession`

Verifikasi: `typecheck`/`lint`/`test` (103 test) hijau. Uji manual curl dengan Bearer token asli belum dilakukan. Catatan terbuka (bukan blocker, follow-up sebelum endpoint mobile pertama dirilis): keputusan durasi session mobile, isi `trustedOrigins` dengan scheme mobile nyata, secure storage token di client (ADR-043 §7).

### T-017 — Selesai dengan gap runtime terpisah (RLS SQL policies, KI-026)

Dikerjakan Elon Backend Engineer (subagent), 2 putaran konfirmasi King Rezi di tengah jalan karena 2 gap ditemukan:

1. **Gap tipe data** — baseline SQL (`database-strategy.md`/`database-orm.md`) mencontohkan cast `current_setting(...)::uuid` untuk `app.current_user_id`, tapi `identity_user.id` (Better Auth) adalah `cuid()` text, bukan UUID. Dikoreksi langsung di kedua dokumen baseline (bukan ADR baru — koreksi tipe pada contoh, bukan perubahan keputusan RLS) + SQL migration pakai perbandingan text untuk `user_id` (`workspace_id` tetap `::uuid`).
2. **Gap BYPASSRLS (lebih serius, KI-026 baru)** — role Postgres `postgres` yang dipakai `DATABASE_URL`/`DIRECT_URL` punya `rolbypassrls = true` (default Supabase), sehingga seluruh policy RLS **tidak efektif** di runtime nyata meski benar secara desain dan sudah applied. Authorization tetap 100% di Application Service (RBAC) untuk sekarang — sesuai desain DB-D05, bukan regresi. Follow-up (butuh King Rezi, dashboard Supabase): buat role `app_runtime` baru tanpa BYPASSRLS, pindahkan `DATABASE_URL`/`DIRECT_URL`.

File dibuat/diubah:
- `apps/web/src/lib/prisma/with-current-user.ts` (baru) — helper `withCurrentUser(userId, callback)`, `prisma.$transaction` + `set_config('app.current_user_id', $1, true)` (tagged-template, aman SQL injection)
- `apps/web/prisma/migrations/20260813045625_t017_add_rls_policies/migration.sql` (baru, applied ke DB nyata) — RLS untuk 16 tabel (12 `workspace_id` langsung + 4 EXISTS-join ke parent + `analytics_post_metrics` via subquery `publishing_posts`)
- `apps/web/src/lib/repositories/workspace/workspace.repository.ts` — adopsi contoh (`getMember` lewat `withCurrentUser`; adopsi penuh sengaja ditunda)
- `apps/web/src/lib/prisma/with-current-user.test.ts` (baru) — integration test nyata ke Supabase (auto-skip tanpa `DATABASE_URL`), termasuk 2 assertion eksplisit "KNOWN GAP" yang membuktikan BYPASSRLS
- `product-discovery/05-architecture/database-strategy.md`, `product-discovery/06-engineering/database-orm.md` — koreksi contoh SQL + catatan status runtime
- `project-manager/PROJECT_STATE.md` — KI-002 (RLS belum digenerate) di-resolve dan dihapus dari daftar Known Issues (riwayatnya di sini); KI-026 baru ditambahkan
- `project-manager/tasks/v01-foundation.md`, `project-manager/TASKS.md` — status T-017/T-019/T-008/T-018 + indeks v0.1 diperbarui

---

## 2026-08-13 — T-042.2–T-042.5 selesai: Dashboard Home tuntas (v0.3)

### Context

King Rezi menyelesaikan sisa subtask T-042 (Dashboard Home, v0.3 Analytics MVP) lewat 3 subagent sekuensial (analytics · UI, sesuai pemetaan ADR-063): Prabowo Feature Engineer (T-042.2, query/service/action), Mark UI Engineer (T-042.3–T-042.5, UI), lalu diverifikasi Najwa QA Engineer dan Ridwan Architecture Reviewer (keduanya tidak ada temuan). Seluruh subtask T-042.1–T-042.5 sekarang selesai.

### File dibuat

- `apps/web/src/app/(app)/components/DashboardHome.tsx` — Client Component dashboard, `useTransition` untuk re-fetch saat selector rentang waktu diganti

### File diubah

- `apps/web/src/domains/analytics/types.ts` — type baru `DashboardSummary` (`totalPosts`, `totalEngagements`, `avgEngagementRate`, `activeAccounts`)
- `apps/web/src/domains/analytics/services/analytics.service.ts` — method baru `getDashboardSummary(workspaceId, period)`, return `null` kalau belum ada snapshot (empty state); interface lokal `ActiveAccountsPort` (tidak di-export lewat barrel, pola sama seperti `ScheduledCountsPort`/ADR-078) untuk cross-domain ke workspace
- `apps/web/src/domains/workspace/services/workspace.service.ts` — method baru `countActiveConnectedAccounts(workspaceId)` (hitung `WorkspaceConnectedAccount.status === "active"`)
- `apps/web/src/app/(app)/dashboard-actions.ts` — Server Action baru `getDashboardSummaryAction(period)`, composition root (instansiasi `AnalyticsService` + `WorkspaceService` dari barrel publik masing-masing domain)
- `apps/web/src/app/(app)/page.tsx` — diganti dari `ScaffoldPlaceholder` jadi Server Component yang panggil `getDashboardSummaryAction("weekly")` dan render `<DashboardHome>`
- `apps/web/src/domains/analytics/services/analytics.service.test.ts`, `apps/web/src/domains/workspace/services/workspace.service.test.ts` — test baru untuk method di atas

### Desain

Komponen Astryx yang dipakai diverifikasi lewat `astryx component <Name> --dense` (bukan tebakan): `Selector` (rentang waktu weekly/monthly, T-042.5), `Card`/`Grid`/`HStack`/`VStack`/`Section`/`Heading`/`Text` (stat tiles, T-042.3), `ProgressBar` (representasi `avgEngagementRate` — dikonfirmasi ulang Astryx tidak punya komponen Chart lewat `astryx docs chart`, jadi tidak menambah dependency chart baru seperti `recharts`), `EmptyState` (T-042.4, pola sama seperti `DraftsList.tsx`/`ConnectedAccountsList.tsx`).

### QA (Najwa)

`bun run typecheck`, `bun run lint`, `bun run test` (root, vitest config ada di root) semua hijau, 103/103 test lulus. Verifikasi visual dengan seed data dummy sementara (sudah di-cleanup, dikonfirmasi 0 sisa row) untuk workspace Insvire: stat tiles dan ProgressBar tampil benar untuk period weekly & monthly, dark mode aman, tidak ada regresi di sidebar channel count / halaman Publish.

### Review arsitektur (Ridwan)

Tidak ada temuan — entry point bersih dari business logic, domain tidak import Prisma/Supabase langsung, cross-domain analytics→workspace lewat port/adapter pattern konsisten dengan `ScheduledCountsPort` existing (bukan pelanggaran boundary), `DashboardSummary` tepat di domain types (bukan `packages/shared`), UI 100% komponen Astryx tanpa hardcode style.

### Hasil

T-042 (Status `✅ Done`, seluruh subtask T-042.1–.5 selesai). Tidak ada ADR baru — implementasi mengikuti pola existing (ScheduledCountsPort/ADR-078, FakeOutstandAdapter/ADR-059+ADR-079), bukan keputusan arsitektur baru. Dokumentasi diperbarui: `tasks/v03-analytics-mvp.md` § T-042 (checklist dicentang, status ✅ Done, paragraf implementasi), `TASKS.md` (indeks v0.3 jadi 3 ✅ · 3 ⏳, Total jadi 17 selesai), `PROJECT_STATE.md` (Completed Ringkasan — bullet T-042.2–.5 ditambah, bullet T-039.5 terlama dihapus untuk menjaga batas 5 item; KI-003 prosa diperbarui menyebut T-042 ✅ Done).

---

## 2026-08-13 — T-041 selesai: Metric ingestion job dari Outstand (v0.3, Fake/mock, ADR-079)

### Context

King Rezi menyelesaikan implementasi T-041 (Metric ingestion job dari Outstand, v0.3 Analytics MVP) lewat Elon Backend Engineer, versi Fake/mock mengikuti pola ADR-059, karena kredensial Outstand asli (`OUTSTAND_API_KEY`) masih belum ada (KI-003). Keputusan material dicatat sebagai ADR-079 (amandemen ADR-059).

### Keputusan (ADR-079)

`IOutstandAdapter` dipromosikan dari domain-owned (`domains/publishing/adapters/outstand-adapter.ts`) ke kontrak cross-domain `packages/shared/src/contracts/outstand-adapter.ts`, dengan kategori baru untuk isi `packages/shared`: port/ACL contract. Domain `publishing` tetap mengimpor dari lokasi lama karena file itu dipertahankan sebagai barrel re-export.

### File dibuat

- `packages/shared/src/contracts/outstand-adapter.ts` — kontrak `IOutstandAdapter` cross-domain, method baru `fetchPostMetrics(outstandJobId)` dan `fetchWorkspaceMetrics(outstandAccountId, period)`
- `apps/web/src/domains/analytics/services/analytics-ingestion.use-case.ts` — `AnalyticsIngestionUseCase` (`syncPostMetrics`, `syncWorkspaceSnapshot`), terpisah dari `AnalyticsService` (pola ADR-059 poin 5)
- Migration `20260813023329_add_analytics_post_metric_unique`

### File diubah

- `apps/web/src/domains/publishing/adapters/outstand-adapter.ts` — jadi barrel re-export dari `@social/shared`
- `apps/web/src/lib/adapters/outstand/fake-outstand-adapter.ts` — extend `FakeOutstandAdapter` dengan data mock deterministik (hash FNV-1a dari id)
- `apps/web/src/domains/analytics/repositories/analytics.repository.ts` + implementasi Prisma-nya — tambah `upsertPostMetrics`/`upsertWorkspaceSnapshot`
- `apps/web/prisma/schema.prisma` — unique constraint baru `@@unique([postId, connectedAccountId])` pada `AnalyticsPostMetric`

### Desain

Idempotensi (T-041.5) ditegakkan lewat Prisma `upsert` asli di atas unique constraint DB, bukan insert-check-manual. Data mock deterministik (hash, bukan random) dipilih supaya hasil ingestion konsisten/reproducible antar test run. Frekuensi sync (T-041.3) ditetapkan kandidat harian, bukan 30 menit seperti engagement.

### Scope di luar T-041

Real Outstand API call (tetap T-025), cron/job scheduler asli Railway (tetap T-027), perhitungan `topPostId` (query agregat terpisah).

### Hasil

T-041 (Status `✅ Done`) menutup dependency T-042 dari sisi T-040+T-041 (T-042.2–.5 belum dikerjakan, tapi tidak lagi terblokir secara dependency — datanya tetap dari `FakeOutstandAdapter` sampai KI-003 resolved). Dokumentasi diperbarui: `DECISIONS.md` (baris ADR-079 + tag "Amended by" di ADR-059), `decisions/ADR-079-...md` (baru), `decisions/ADR-059-...md` (Status ditandai amended), `tasks/v03-analytics-mvp.md` § T-041 (checklist dicentang, status ✅ Done, catatan implementasi) + § T-042 (catatan dependency terpenuhi), `TASKS.md` (indeks v0.3 jadi 2 ✅ · 1 🟡 · 3 ⏳, Total jadi 16 selesai), `PROJECT_STATE.md` (Completed Ringkasan — bullet T-041 ditambah, bullet T-039.1–.3 terlama dihapus untuk menjaga batas 5 item; Recent Decisions ditambah ADR-079; KI-003 ditambah catatan T-041/T-042).

---

## 2026-08-12 — T-040 selesai: Analytics domain skeleton (v0.3)

### Context

King Rezi menyelesaikan implementasi T-040 (Analytics domain skeleton, v0.3 Analytics MVP) lewat Elon Backend Engineer. T-040.1–T-040.4 semuanya selesai, tidak ada yang di-skip, tidak ada gap skema Prisma.

### File dibuat

- `apps/web/src/domains/analytics/repositories/analytics.repository.ts` — `IAnalyticsRepository` (T-040.1)
- `apps/web/src/domains/analytics/services/analytics.service.ts` — `AnalyticsService` (T-040.2): `getPostMetrics(postId)`, `getWorkspaceSnapshot(workspaceId, period)`
- `apps/web/src/domains/analytics/services/analytics.service.test.ts` — unit test dengan fake repository (T-040.4), 4 test lulus
- `apps/web/src/lib/repositories/analytics/analytics.repository.ts` — implementasi Prisma `analyticsRepository`
- `apps/web/src/lib/repositories/analytics/index.ts` — barrel export implementasi

### File diubah

- `apps/web/src/domains/analytics/types.ts` — diisi `SnapshotPeriod = "weekly" | "monthly"` (sebelumnya `export {}`)
- `apps/web/src/domains/analytics/index.ts` — public API barrel di-extend (T-040.3)
- `packages/shared/src/ids.ts` — tambah factory `asPostMetricsId` dan `asWorkspaceSnapshotId`

### Desain

`IAnalyticsRepository` di T-040 ini sengaja hanya read path (selaras kontrak `application-layer.md`), method tulis untuk ingestion (`syncMetrics`) sengaja tidak ditambahkan karena itu scope T-041. `SnapshotPeriod` ditaruh lokal di domain analytics (bukan `packages/shared`) karena belum ada BC lain yang mengonsumsinya.

### Verifikasi

Full test suite `apps/web/src` + `packages/shared` → 11 file, 89 test, semua lulus (tidak ada regresi ke domain workspace/publishing). `tsc --noEmit` di `apps/web` bersih.

### Hasil

T-040 (Status `✅ Done`) menutup blocker desain untuk T-042.2–.5 dari sisi domain analytics — sisanya masih menunggu T-041 (Metric ingestion, terblokir KI-003/KI-025). Dokumentasi diperbarui: `tasks/v03-analytics-mvp.md` § T-040 (checklist T-040.1–.4 dicentang, status ✅ Done, catatan implementasi), `TASKS.md` (indeks v0.3 jadi 1 ✅ · 1 🟡 · 4 ⏳, Total jadi 15 selesai), `PROJECT_STATE.md` (Completed Ringkasan — bullet T-040 ditambah, bullet ADR-076 terlama dihapus untuk menjaga batas 5 item).

---

## 2026-08-12 — T-042.1 selesai: sesi desain Claude Design untuk Dashboard/Home

### Context

King Rezi minta mulai T-042.1 (sesi desain Claude Design untuk layar Dashboard/Home, bagian dari T-042 Dashboard Home, release v0.3), dengan permintaan tambahan: cek dulu apa yang perlu ditambahkan/diubah dari System Design yang sekarang. Dikerjakan di sesi utama (bukan subagent Neymar — DesignSync diketahui gagal di sesi subagent, lihat memory `feedback_designsync_subagent_limitation`).

### Temuan awal (perbandingan `templates/home.html` vs baseline KSP-01)

4 zona (Today's Schedule, Recent Activity, Engagement Snapshot, Analytics Snapshot) dan deep-link (KSP-01-F05) sudah fungsional di `AppPrototype.dc.html`. Gap yang ditemukan: (1) tidak ada satu pun empty-state meski KSP-01 State Handling mewajibkan 3 kondisi kosong + 1 keputusan "tetap tampil di angka nol"; (2) tidak ada visual chart untuk Analytics Snapshot dan component library belum pernah cek apakah Astryx punya komponen Chart; (3) tidak ada selector rentang waktu di Home; (4) deep-link item Failed di Recent Activity tidak menyorot item tujuan di Calendar. Dikonfirmasi ke King Rezi via `AskUserQuestion` — keempatnya dipilih untuk dikerjakan.

### Implementasi

- Cek CLI Astryx (`astryx docs chart` → topic tidak ada; `astryx component --list` + `--dense` untuk `EmptyState`/`ProgressBar`/`Selector`) — dikonfirmasi Astryx tidak punya komponen Chart, ada `EmptyState` (title/description/actions) dan `ProgressBar` (sudah dipakai sebagai `.bar-track`/`.bar-fill` di `templates/analyze-dashboard.html`).
- `styles.css`: tambah `.empty-title`/`.empty-desc` (mapping `EmptyState` anatomy) dan `.cal-card.is-arrival-highlight` + `@keyframes arrival-flash` (highlight sementara ~3.2s, self-clearing).
- `templates/home.html`: tambah blok kedua "Referensi State Kosong" (pola `.state-tag` side-by-side, sama seperti `auth-forgot-password.html`) untuk 4 state KSP-01 (Today's Schedule kosong + CTA Calendar, Recent Activity kosong, Engagement 0 unread tetap tampil, Analytics kosong + CTA Analyze). Analytics Snapshot default juga ditambah `.select` rentang waktu (reuse pola `analyze-dashboard.html`) dan `.bar-track`/`.bar-fill` untuk engagement rate.
- `templates/app-prototype/AppPrototype.dc.html`: wiring `route()` untuk 2 CTA baru (`home-empty-cta-calendar`/`-analyze`), plus logic highlight — klik item Failed di Recent Activity set flag, `inject()` menambah class `.is-arrival-highlight` ke `.cal-card.is-failed` yang sudah ada di Calendar (tidak mengubah `publish-calendar.html`) dan auto-scroll, lalu hapus class setelah ~3.2s.
- `readme.md`: section baru "Home (KSP-01) — Empty States, Analytics Snapshot & Arrival Highlight (T-042.1, 2026-08-12)" + update baris Files untuk `styles.css`/`home.html`/`AppPrototype.dc.html` + tabel Components (`.empty`, `.bar-track`/`.bar-fill`).

### Verifikasi

Tidak bisa verifikasi visual langsung (Browser pane butuh login claude.ai terpisah dari auth DesignSync) — diverifikasi via `get_file` re-read untuk konfirmasi konten tersimpan sesuai yang ditulis. Tidak ada perubahan pada tampilan default 4-zona Home yang sudah ada, atau screen lain manapun (scope discipline, `.claude/skills/claude-design-scope-discipline/SKILL.md`).

### Hasil

T-042.1 selesai. T-042.2–.5 (query real, render chart data asli, empty state di kode, selector di kode) tetap menunggu **T-040** (Analytics domain skeleton, tidak ada blocker) dan **T-041** (Metric ingestion, terblokir KI-003/KI-025) — sesi ini hanya referensi desain, bukan implementasi `apps/web`.

---

## 2026-08-12 — Audit konsistensi dokumentasi task/state/ADR + governance Gibran/PROJECT_RULES

### Context

King Rezi minta audit menyeluruh: apakah `TASKS.md`/`tasks/vXX-*.md`,
`PROJECT_STATE.md`, dan `DECISIONS.md`/`decisions/` sudah selaras, dan
apakah dokumen yang membantu AI (`AGENTS.md`, `context/`, skills, subagent,
config kembar ADR-064) aman tanpa gap. Dijalankan lewat 4 subagent audit
paralel (read-only), lalu King Rezi memutuskan 3 fork governance lewat
AskUserQuestion.

### Fixed

- **TASKS.md**: klaim "142 subtask (v0.1–v0.3)" → **138** (hitung ulang
  langsung dari `tasks/vXX-*.md`); contoh "nomor kosong" basi (T-019,
  T-037–T-039, sudah terisi) diganti nomor kosong yang benar-benar kosong
  (T-046–T-049, T-056–T-059, T-066–T-069, T-075–T-079); T-025 di "Fokus
  sekarang" diberi catatan blocker eksplisit KI-003.
- **tasks/v02-publishing-mvp.md**: T-025/T-026/T-027 diberi field
  `Terkait KI-003`/`KI-015`/`KI-025` (sebelumnya link satu arah — KI
  menyebut task, task tidak menyebut balik KI).
- **tasks/v01-foundation.md**: T-039 field `Terkait` ditambah `KI-024`.
- **PROJECT_STATE.md**: baris "69 task" → **71 task**; urutan section
  KI-024/KI-025 dibetulkan (sebelumnya 025 ditulis sebelum 024); baris
  Blockers KI-003 direvisi (bukan cuma env var, kode adapter juga belum
  ditulis); enum Status Known Issues diperluas menambahkan `Sebagian
  Resolved — sisa scope: <ID>` (dipakai KI-023, sebelumnya di luar enum
  dokumentasi); section **In Progress** dan **Next Tasks** dipangkas dari
  duplikasi detail subtask jadi pointer singkat ke `TASKS.md` (menegakkan
  ADR-062 yang sudah dinyatakan file ini sendiri tapi dilanggar sendiri).
- **DECISIONS.md** + 14 file `decisions/ADR-XXX.md` lama: backfill tag
  `Amended by` yang hilang — ADR-005/008/013/019/020/022/023/025/036
  (diamendemen ADR-040), ADR-035/038 (ADR-041), ADR-014 (ADR-027), ADR-060
  (ADR-061), ADR-052 (ADR-065). ADR-038 digabung dengan tag amandemen yang
  sudah ada (ADR-056/057) jadi satu urutan kronologis.
- **`.claude/agents/*.md`**: 5 dari 7 file subagent ditemukan writable
  (644), seharusnya read-only 644 → dikembalikan ke `chmod 444`
  (`gibran-project-manager.md`, `najwa-qa-engineer.md`,
  `neymar-product-designer.md`, `prabowo-feature-engineer.md`,
  `ridwan-architecture-reviewer.md`).
- **`.cursor/mcp.json`**: entry `supabase` kehilangan field `"type":
  "http"` yang ada di `.mcp.json` (ADR-064 twin-file drift) → disamakan.

### Changed — Governance (izin eksplisit King Rezi)

- **`PROJECT_RULES.md`** § Append-Only: ditambahkan satu pengecualian
  eksplisit — kolom `Status`/header `### Status` ADR lama boleh diedit
  khusus untuk menambah tag `Amended by ADR-YYY`, karena praktik ini sudah
  berjalan sejak ADR-056/057 tanpa pernah dituliskan sebagai exception,
  menyebabkan drift 14 ADR lama di atas.
- **`.claude/agents/gibran-project-manager.md`** (Static Reference, chmod
  444 — di-unlock sementara untuk edit ini, dikembalikan ke 444 setelah):
  section "In Progress" ditegaskan pointer-only setara "Next Tasks"
  (sebelumnya hanya "Next Tasks" yang eksplisit disebut pointer, jadi
  celah duplikasi); tambah instruksi menjaga simetri `Terkait KI-XXX`
  dua arah; tambah instruksi hitung ulang (bukan asumsi) angka
  Total/subtask; tambah pengecualian append-only untuk tag `Amended by`
  yang sinkron dengan perubahan `PROJECT_RULES.md` di atas.

### Not Changed (disengaja)

- `COMPLETE_TASK.md` dan `decisions/ADR-063-*.md` masih menyebut "69
  task/134 subtask" — itu snapshot historis di titik keputusan/entri
  masing-masing dibuat, bukan live counter, jadi tidak dikoreksi (akan
  jadi revisionis kalau diubah).

## 2026-08-12 — Fix 5 temuan /code-review PR #68

### Context

`/code-review` atas PR #68 (audit dokumentasi sebelumnya) menemukan PR itu
sendiri membawa 5 gap baru: simbol status ganda tidak valid, back-link
KI-015 yang masih terlewat di T-026/T-027, wiki-link `[[...]]` orphan ke
memory pribadi di `AGENTS.md`, ambiguitas target status di langkah Gibran,
dan urutan field `Terkait` yang tidak konsisten antar file task.

### Fixed

- **`TASKS.md`**: status T-025 di "Fokus sekarang" dikembalikan ke simbol
  Legend tunggal `⏳` (bukan kombinasi `⏳ 🚫` yang tidak terdefinisi),
  catatan "Terhenti" tetap di kolom Catatan saja.
- **`tasks/v02-publishing-mvp.md`**: T-026/T-027 ditambah back-link
  `KI-015` yang tadinya cuma `KI-003` (KI-015 sendiri sudah menyebut
  T-025/T-026/T-027 di `PROJECT_STATE.md`); urutan field `Terkait`
  dipindah sebelum `Depends` di T-025/T-026/T-027, menyamakan konvensi
  dengan T-039 di `tasks/v01-foundation.md`.
- **`AGENTS.md`**: hapus syntax wiki-link `[[feedback-uiux-docs-design-sync-reminder]]`
  (target itu memory pribadi di luar repo, bukan artefak repo) — diganti
  frasa biasa tanpa link.
- **`.claude/agents/gibran-project-manager.md`** (Static Reference, chmod
  444 — di-unlock sementara, dikembalikan setelah edit): langkah 1
  diperjelas — target eksplisit `✅ Done`, disebutkan task mungkin sudah
  `🟡 In Progress` dari langkah pertama subagent implementasi, tugas
  Gibran adalah promosi `🟡 → ✅`, bukan membiarkannya di `🟡`.

## 2026-08-12 — Konsistensi aturan "jangan putuskan sendiri" ke Mark & Elon

### Context

`prabowo-feature-engineer.md` sudah punya aturan keras eksplisit "kalau
menemukan gap/inkonsistensi saat kerja, laporkan ke user, jangan putuskan
sendiri" — `mark-ui-engineer.md` dan `elon-backend-engineer.md` belum,
padahal perilakunya sama-sama ditegakkan main agent. King Rezi minta
disamakan supaya tidak bergantung ke main agent "ingat" menegakkannya.

### Changed (Static Reference, chmod 444 — di-unlock sementara, dikembalikan setelah edit)

- **`.claude/agents/mark-ui-engineer.md`**: tambah baris aturan keras
  yang sama, contoh kasus spesifik (spec desain vs komponen Astryx yang
  tersedia).
- **`.claude/agents/elon-backend-engineer.md`**: tambah baris aturan
  keras yang sama, contoh kasus spesifik (kontrak Outstand di kode vs
  ADR-040).

## 2026-08-12 — Opsi B: mark "In Progress" otomatis oleh subagent implementasi saat mulai kerja

### Context

Follow-up dari audit governance sebelumnya: status task sering baru
ter-update jadi Done di akhir sesi (lewat Gibran), tanpa pernah eksplisit
ditandai In Progress saat kerja dimulai. King Rezi minta opsi otomasi
ringan (Opsi B dari 3 opsi yang diajukan: hook validasi, instruksi
subagent, atau Workflow penuh) — pilih instruksi eksplisit ke subagent
implementasi, tanpa infrastruktur baru.

### Changed (Static Reference, chmod 444 — di-unlock sementara, dikembalikan setelah edit)

- **`.claude/agents/prabowo-feature-engineer.md`**,
  **`mark-ui-engineer.md`**, **`elon-backend-engineer.md`**: tambah
  section "Langkah pertama sebelum menulis kode" — wajib ubah field
  `Status` task jadi `🟡 In Progress` di `tasks/vXX-*.md` sebelum menulis
  kode, sebagai **satu-satunya** edit dokumentasi project yang subagent
  ini boleh lakukan sendiri. Baris "Di luar scope kamu" masing-masing
  diperjelas supaya exception sempit ini tidak dibaca sebagai izin
  menyentuh `tasks/` secara umum — subtask checkbox, `TASKS.md`,
  `PROJECT_STATE.md`, `DECISIONS.md`, `COMPLETE_TASK.md` tetap eksklusif
  kerjaan Gibran Project Manager di akhir sesi.

## 2026-08-12 — ADR-078: amandemen ADR-018 (port lokal + composition root) + bersihkan T-012/KI-006 dari PROJECT_STATE

### Context

Follow-up dokumentasi setelah T-012.1/2: pola cross-domain
`ScheduledCountsPort` + wiring `PublishingService` di composition root
belum tercatat di ADR, sementara `PROJECT_STATE.md` masih menyisakan
T-012 di In Progress dan KI-006 Resolved di Known Issues (bertentangan
dengan ADR-067).

### Added

- **ADR-078** — Amandemen ADR-018: port lokal sempit di domain pemanggil
  (tidak di-export ke barrel), larangan import service konkret lintas
  domain di layer domain, wiring konkret hanya di composition root.
  Preseden kanonikal: `ScheduledCountsPort` +
  `apps/web/src/app/(app)/layout.tsx` (T-012.2). File:
  `project-manager/decisions/ADR-078-amandemen-adr-018-port-lokal-composition-root-scheduled-counts.md`.

### Changed

- `project-manager/DECISIONS.md` — baris indeks ADR-078; Status ADR-018 →
  `Accepted — Amended by ADR-078 (2026-08-12)`.
- `project-manager/tasks/v01-foundation.md` — catatan T-012.2 + field ADR
  mereferensikan ADR-078.
- Catatan T-012.2 di entri COMPLETE_TASK di bawah ini (sibling) juga
  mereferensikan ADR-078.
- `project-manager/PROJECT_STATE.md` — T-012 dihapus dari In Progress;
  KI-006 dihapus dari Known Issues (Resolved + sudah tercatat di
  COMPLETE_TASK, sesuai ADR-067); catatan "empat task" → "tiga task"
  (T-012 sudah Done); Recent Decisions digeser (ADR-078 masuk).

### Fixed

- Drift status: T-012 ✅ Done masih muncul di In Progress; KI-006 Resolved
  masih di Known Issues padahal riwayatnya sudah di COMPLETE_TASK.

---

## 2026-08-12 — T-012.1/2 selesai: persist reorder channel per user + badge scheduled-count real

### Context

Dua subtask T-012 yang sebelumnya di-flag "deferred, menunggu domain
publishing v0.2" ternyata sudah unblocked sejak T-028 (Persistensi Schedule
via Fake OutstandAdapter) selesai — data source (`PublishingPost`/
`PublishingPostTarget`) sudah ada, tidak perlu menunggu real Outstand
adapter (T-025/026/027). Dikerjakan oleh Prabowo Feature Engineer, lolos
review arsitektur Ridwan dan QA end-to-end Najwa. Menutup task **T-012**
(sekarang ✅ Done, seluruh subtask selesai) dan **KI-006** (Resolved).

### Changed — Implementasi

**T-012.1 (persist reorder channel sidebar per user):**

- Model Prisma baru `WorkspaceChannelOrder` (per workspace + user + account,
  strategi full-rewrite position setiap kali ada drop — bukan patch parsial).
- Migration diterapkan ke DB: `20260812033031_add_workspace_channel_orders`.
- Repository method baru `saveChannelOrder` / `getChannelOrder` di
  `IWorkspaceRepository` (domain `workspace`).
- Server Action `reorderChannelsAction` di
  `apps/web/src/app/(app)/components/sidebar-channels/actions.ts`.
- Wiring optimistic UI + revert-on-failure di `ChannelsSection.tsx`; helper
  `mergeChannels` lama dihapus karena sudah tidak diperlukan.

**T-012.2 (badge scheduled-count real dari domain publishing):**

- Method baru `countScheduledByAccount` (batch `groupBy`, bukan N+1 query)
  di public API domain `publishing`.
- Migration diterapkan ke DB:
  `20260812032852_add_publishing_post_target_connected_account_index`.
- Dipanggil dari `WorkspaceService` lewat interface port lokal
  `ScheduledCountsPort` (bukan import konkret `PublishingService` ke domain
  layer workspace) — sesuai aturan cross-domain AGENTS.md #7. Constructor
  `WorkspaceService` sekarang punya parameter opsional kedua untuk port ini;
  wiring konkret `PublishingService` hanya terjadi di composition root
  (`apps/web/src/app/(app)/layout.tsx`). Ini preseden pertama di codebase
  untuk satu domain service memanggil domain service lain secara langsung.
  Pola dikunci di **ADR-078** (amandemen ADR-018).

### Review arsitektur (Ridwan)

1 temuan ringan: `ScheduledCountsPort` sempat bocor dari barrel
`domains/workspace/index.ts` via `export *`. Diperbaiki dengan menghapus
keyword `export` dari deklarasi interface tersebut (jadi interface lokal,
tidak re-export lewat barrel).

### QA (Najwa)

Typecheck, lint, dan test (85/85) PASS. Reorder persist diverifikasi lewat
query DB langsung (bukan hanya observasi UI). Badge scheduled count
exact-match dengan hasil query DB. Tidak ada regresi pada UI quick-compose
"+" maupun drag-handle shift-on-hover (T-012.5/T-012.6).

### Dokumentasi terupdate

- `project-manager/tasks/v01-foundation.md` — T-012.1/2 dicentang, Status
  header T-012 jadi ✅ Done, catatan stale T-012.5/T-012.6 dihapus, daftar
  "task v0.1 yang menunggu v0.2" di Catatan Rilis dikurangi (T-012 dikeluarkan).
- `project-manager/TASKS.md` — indeks v0.1 (9 ✅ · 1 🚫 · 4 🟡 · 6 ⏳), Total
  (14 selesai), baris T-012 dikeluarkan dari "Fokus sekarang" (diganti
  catatan Done).
- `project-manager/PROJECT_STATE.md` — KI-006 ditandai Resolved, pointer
  T-012 di Next Tasks diupdate ke ✅ Done, Top Next Tasks Snapshot
  dikurangi jadi T-029/T-025, entri baru ditambah di Completed (Ringkasan)
  (item terlama — KI-022 resolved — dihapus untuk menjaga hitungan 5).

---

## 2026-08-11 — Bug-fix ad-hoc: posisi `ChannelsSection` di `WorkspaceSideNav` samakan dengan Design System (menempel footer via `VStack`)

### Context

Bukan task terjadwal — perbaikan kecil oleh main agent (Jokowi) langsung,
dipicu King Rezi meminta section "Channels" di sidebar utama app disamakan
posisinya dengan Claude Design (project "Social Media Management", projectId
`84aded99-bb23-49b1-be9f-dd8f21c6873e`). Di desain (`components/navigation.html`
+ `styles.css`, class `.nav`), nav items punya `flex:1` sehingga menghabiskan
sisa ruang vertikal dan mendorong `.channels` supaya selalu menempel tepat di
atas `.sidebar-footer`.

### Root cause

Div internal `.scrollable` milik komponen `SideNav` (dari `@astryxdesign/core`)
sudah `flex:1` mengisi sisa tinggi sidebar, tapi children di dalamnya
(`SideNavSection` + `ChannelsSection`, sebelumnya dua sibling lepas) tidak
flex — jadi sisa spasi jatuh di BAWAH `ChannelsSection` (sebelum footer)
alih-alih Channels didorong menempel ke footer seperti di desain.

### Changed — Implementasi

- `apps/web/src/app/(app)/components/WorkspaceSideNav.tsx` — tambah import
  `VStack` dari `@astryxdesign/core/VStack`. Children `<SideNav>` (dulu
  `<SideNavSection title="Menu">...</SideNavSection>` diikuti langsung
  `<ChannelsSection channels={channels} />` sebagai dua sibling lepas)
  dibungkus jadi:

  ```tsx
  <VStack vAlign="between" className="min-h-full">
    <SideNavSection title="Menu">...</SideNavSection>
    <ChannelsSection channels={channels} />
  </VStack>
  ```

  `vAlign="between"` map ke `justify-content:space-between` — dengan cuma 2
  child, ini mendorong Channels ke bawah pas ada slack space, identik efek
  `.nav{flex:1}` di desain, dan tidak mengubah apapun kalau konten sudah
  lebih tinggi dari area yang tersedia (overflow-scroll tetap jalan seperti
  biasa).

### Verification

Sudah dicek di browser preview (dev server `bun run --cwd apps/web dev`,
halaman `/`) — screenshot dikonfirmasi Channels sekarang menempel tepat di
atas footer (Notifikasi/Theme/Avatar), tidak ada gap kosong lagi. PASS.

### Catatan

Tidak ada ADR baru — pure layout bug-fix menyamakan implementasi dengan
Design System yang sudah ada, sama seperti fix header pada entri di bawah.
Tidak ada task terkait di `TASKS.md`/`tasks/`, sifatnya ad-hoc. Tidak
berkaitan dengan KI-024 (itu soal `SettingsSideNav.tsx`, file & scope
berbeda) — KI-024 masih Open, tidak berubah.

### Status

Selesai, terverifikasi visual.

---

## 2026-08-11 — Bug-fix ad-hoc: header `WorkspaceSideNav` samakan dengan Design System (avatar + nama, tanpa superheading)

### Context

Bukan task terjadwal — perbaikan kecil (2 baris) oleh main agent (Jokowi)
langsung, dipicu King Rezi meminta header sidebar utama app disamakan dengan
spec Design System (Claude Design, project "Social Media Management",
projectId `84aded99-bb23-49b1-be9f-dd8f21c6873e`). Setelah dibaca langsung
dari `components/navigation.html` + `styles.css` (class `.ws-switch`,
`.ws-avatar`, `.ws-name`, baris ~288-290), spec desain menampilkan **Avatar
bulat berisi inisial workspace + nama workspace**, tanpa label "Workspace"
apa pun (tidak ada superheading) — berbeda dari implementasi lama.

### Changed — Implementasi

- `apps/web/src/app/(app)/components/WorkspaceSideNav.tsx` (baris ~74-81) —
  `SideNavHeading` sebelumnya render `superheading="Workspace"` +
  `heading={workspaceName}` sebagai teks link tanpa avatar/icon. Diubah jadi:

  ```tsx
  <SideNavHeading
    icon={<Avatar name={workspaceName} size="sm" />}
    heading={workspaceName}
    headingHref="/"
  />
  ```

  `Avatar` sudah diimpor di file itu (dipakai juga di footer). `size="sm"`
  (24px) dipilih sebagai token Astryx terdekat ke 26px custom di desain,
  sekaligus konsisten dengan avatar footer yang juga pakai `size="sm"`.

### Verification

- Prop `icon`/`heading` pada `SideNavHeading` dikonfirmasi lewat
  `bunx astryx component SideNavHeading --dense` (cocok source
  `@astryxdesign/core` v0.1.8, sesuai AGENTS.md #15).
- Verifikasi visual di browser preview **belum selesai** dijalankan (proses
  terinterupsi sebelum sempat screenshot) — masih TODO terbuka, bukan
  "sudah diverifikasi visual".

### Catatan

Tidak ada ADR baru — ini bug-fix menyamakan implementasi dengan Design
System yang sudah ada, bukan keputusan desain baru. Ditemukan juga
divergensi kedua di luar scope sesi ini (Settings sidebar header) — lihat
KI-024 di `PROJECT_STATE.md`.

### Status

Selesai untuk `WorkspaceSideNav.tsx`. Verifikasi visual browser masih
tertunda (TODO, bukan blocker).

---

## 2026-08-11 — T-039.5 selesai: migrasi kode sidebar Settings ke pola Buffer (ADR-077)

### Context

Menyusul baseline ADR-077 (entri di bawah) dan T-039.1/.2/.3 (entri
selanjutnya), King Rezi memerintahkan eksekusi T-039.5 — migrasi kode
render sidebar Settings dari secondary nav ke sidebar tunggal pola Buffer.
Dikerjakan Mark UI Engineer, lalu direview arsitektur oleh Ridwan dan QA
end-to-end browser oleh Najwa.

### Changed — Implementasi

- `apps/web/src/app/(app)/layout.tsx` — `sideNav` di `AppShell` jadi
  kondisional per-route lewat komponen baru `AppSideNav.tsx`.
- `apps/web/src/app/(app)/settings/components/SettingsSideNav.tsx` —
  ditambah header back-navigation ("← Settings" → Home).

### Added — Implementasi

- `apps/web/src/app/(app)/components/AppSideNav.tsx` (Client Component
  baru) — `usePathname()` memilih render `SettingsSideNav` di bawah
  `/settings`, atau `WorkspaceSideNav` di luar itu.

### Removed — Implementasi

- `apps/web/src/app/(app)/settings/layout.tsx` (dihapus total) — wrapper
  `Layout`+`LayoutPanel role="navigation"` secondary nav tidak diperlukan
  lagi karena sidebar Settings sekarang tunggal, content jadi full-width.

### Verification

- Review arsitektur Ridwan: lolos, tidak ada temuan.
- QA Najwa (end-to-end browser): PASS semua golden path — typecheck
  bersih, lint bersih, 79/79 test pass, sidebar Settings menggantikan
  total main sidebar dengan header back-navigation berfungsi, taksonomi
  Organization/Account tidak berubah, tidak ada regresi di halaman lain,
  dark mode konsisten, reload langsung juga benar.

### Status

T-039.5 ✅ selesai. Menutup sisa gap render sidebar Settings di KI-023
(bersama ADR-077, lihat `PROJECT_STATE.md`). Sisa scope terbuka
KI-023/T-039 sekarang hanya **T-039.4** (onboarding picker workspace).
Tidak ada ADR baru — ini eksekusi ADR-077 yang sudah Accepted, tidak ada
amandemen.

---

## 2026-08-11 — ADR-077: Settings pakai sidebar tunggal pola Buffer (amandemen mekanisme render ADR-076)

### Context

King Rezi membagikan screenshot halaman Settings Buffer dan meminta pola
itu ditiru: saat masuk Settings, main sidebar workspace digantikan total
oleh satu sidebar khusus Settings (bukan dua sidebar berdampingan seperti
kondisi sekarang, warisan implementasi T-016.1). Diskusi berjalan bertahap
sesuai `proactive-clarification` — riset struktur kode dulu, klarifikasi
cakupan (murni halaman Settings) dan status keputusan (mau dieksekusi,
tapi diskusi dulu), baru King Rezi mengerjakan desainnya sendiri langsung
di Claude Design (bukan lewat Neymar) memakai prompt yang disusun sesi ini.
Setelah desain dikonfirmasi selesai, King Rezi meminta baseline dokumen
diperbarui menyusul.

### Added — Dokumentasi

- `DECISIONS.md` + `decisions/ADR-077-settings-sidebar-tunggal-menggantikan-main-sidebar-pola-buffer.md`
  (baru) — mengamandemen mekanisme render Settings dari ADR-076 (taksonomi
  grup Organization/Account tidak berubah, murni ubah render jadi sidebar
  tunggal + header back-navigation, cakupan terbatas halaman Settings).
- `tasks/v01-foundation.md` § T-039 — subtask baru **T-039.5** untuk
  migrasi kode `apps/web` (AppShell `sideNav` kondisional per-route, hapus
  `LayoutPanel` secondary nav, tambah header back di `SettingsSideNav`).

### Updated — Dokumentasi

- `product-discovery/04-ux/information-architecture.md` — "Secondary
  Navigation" + section "6. Settings": deskripsi mekanisme jadi
  "menggantikan primary nav", bukan coexist.
- `product-discovery/04-ux/navigation-patterns.md` — section "Settings"
  (tambah deskripsi back-navigation), NP-D07, catatan "Navigasi Balik
  Setelah Cross-Section" (Settings jadi pengecualian baru), tabel
  "Ringkasan Pola" (baris Akses Settings).

### Verification

- Cross-check `readme.md` project Claude Design via `DesignSync` — pola
  `.settings-sidebar`/`.settings-back-btn` + deskripsinya sudah ada
  duluan (dikerjakan King Rezi sendiri), sehingga **tidak perlu** prompt
  update readme — sudah sinkron sebelum sesi ini menulis baseline.

### Status

Baseline dokumentasi selesai (ADR-077 Accepted). Desain sudah selesai di
Claude Design. Kode `apps/web` **belum** dimigrasikan — menyusul sebagai
T-039.5, task terpisah.

---

## 2026-08-11 — T-039.1/.2/.3 selesai: migrasi kode `apps/web` ke baseline ADR-076

### Context

Menyusul task backlog T-039 (dibuat 2026-08-10, lihat entri di bawah) dan
sinkronisasi Design System ke ADR-076 (entri di bawahnya), King Rezi
memerintahkan eksekusi T-039.1–T-039.3. Dikerjakan lewat 5 track paralel:
`proxy.ts` + `/onboarding`, App Shell + Draft Editor, Publish, Engage/
Analyze/Start Page/Home, dan konsolidasi Settings. T-039.4 (halaman
`/onboarding` dengan picker workspace untuk user dengan >1 workspace)
sengaja tidak termasuk — tetap terbuka sebagai task terpisah.

### Changed — Implementasi

- Seluruh route workspace-scoped (`Home`, `Publish`, `Engage`, `Analyze`,
  `Start Page`, `Settings`) dipindah dari dynamic segment
  `apps/web/src/app/[slug]/...` ke route group `apps/web/src/app/(app)/...`.
- `apps/web/src/app/account/...` (terpisah) digabung ke dalam
  `(app)/settings/account/*`, konsisten dengan konsolidasi Settings jadi
  dua grup sidebar "Organization" + "Account", satu entry point avatar/user
  menu. Label avatar menu diganti dari "Profile" jadi **"Settings"**
  (keputusan dikonfirmasi King Rezi saat eksekusi).
- `apps/web/src/proxy.ts`: resolusi workspace diganti dari parsing URL
  `[slug]` menjadi baca cookie `active-workspace-id` (HTTP-only), divalidasi
  ulang terhadap `workspace_members` di setiap request, lalu inject header
  `x-workspace-id`/`x-workspace-role` ke downstream. Runtime diubah ke
  Node.js (bukan Edge) karena Prisma memakai adapter `pg`.
- Dihapus `apps/web/src/app/page.tsx` (root) — konflik routing dengan
  `(app)/page.tsx` karena route group tidak menambah segmen URL.
- Ditambahkan Route Handler baru `apps/web/src/app/onboarding/resume/route.ts`
  — set cookie untuk user existing yang kehilangan cookie tapi sudah punya
  workspace (bagian T-039.3; bukan picker T-039.4 untuk user dengan >1
  workspace).

### Fixed — Review Ridwan (Architecture Reviewer)

- Dead code `getWorkspaceBySlug`/`findBySlug` dihapus dari
  `WorkspaceService`, `IWorkspaceRepository`, dan implementasi Prisma-nya
  (tidak ada lagi caller produksi pasca migrasi).
- Hardening: header `x-workspace-id`/`x-workspace-role` di-strip
  (`stripWorkspaceHeaders`) di jalur bypass (`/api/auth`, `/api/jobs`,
  `/api/health`) dan `/onboarding`, dipanggil di semua `NextResponse.next()`
  — mencegah client memalsukan header ini.

### Fixed — QA Najwa (bug blocking, ditemukan sebelum task ditutup)

- Versi awal `proxy.ts` menyebabkan infinite redirect loop di `/login`,
  `/register`, `/forgot-password`, `/reset-password` untuk SEMUA user tanpa
  session — root cause: hilang early-return untuk kombinasi
  `!hasSessionCookie && isPublicAuthPage` setelah refactor redirect logic.
  Diperbaiki + ditambah test regresi baru `proxy.test.ts`.

### Verification

- `tsc --noEmit` bersih, lint bersih, 80 test pass (termasuk
  `proxy.test.ts` baru).
- Verifikasi visual: Claude Design (sudah disinkron ke ADR-076 sebelumnya)
  dicek cocok dengan hasil implementasi `SettingsSideNav` (grouping
  Organization/Account, urutan & label item) — tidak ada perubahan di
  Claude Design.

### Status

T-039.1/.2/.3 ✅ selesai (review + QA lolos). T-039.4 (onboarding picker
workspace untuk skenario >1 workspace) tetap terbuka, task terpisah.
Menutup sebagian besar KI-023 di `PROJECT_STATE.md` (sisa scope: T-039.4).
Tidak ada ADR baru — ini eksekusi ADR-076 yang sudah ada; dua keputusan
kecil saat eksekusi (label "Settings", penghapusan `page.tsx` root) dicatat
sebagai detail implementasi di `tasks/v01-foundation.md` § T-039, bukan
amandemen ADR.

---

## 2026-08-11 — Design System (Claude Design) disinkronkan ke ADR-076

### Context

King Rezi menyinkronkan Claude Design project "Social Media Management"
(`84aded99-bb23-49b1-be9f-dd8f21c6873e`) lewat serangkaian prompt manual,
mengikuti konsolidasi Settings (Organization + Account, entry point avatar
tunggal) dan penghapusan premis Workspace Selector dari ADR-076. Ini murni
perubahan di Claude Design — verifikasi dilakukan lewat DesignSync
(read-only `get_file`/`list_files`). Kode `apps/web` (T-039) **tidak
disentuh sama sekali** dan tetap `⏳ Not Started`.

### Changed — Claude Design

- `templates/settings-connected-accounts.html` dan
  `templates/settings-members.html`: sidebar `.settings-subnav` sekarang
  dua grup — "Organization" (General, Connected Accounts, Members, Roles &
  Permissions, Billing) dan "Account" (Profile, Notifications,
  Preferences). `page-title` jadi "Settings", `page-sub` jadi breadcrumb
  "Organization / Connected Accounts" dan "Organization / Members".
- Halaman Account (Profile/Notifications/Preferences) dipindah jadi 3 file
  baru — `templates/settings-profile.html`,
  `templates/settings-notifications.html`,
  `templates/settings-preferences.html` — semuanya pakai shell app penuh
  yang sama. File lama yang duplikat/divergen
  (`templates/user-settings.html`, `templates/account-profile.html`,
  `templates/account-preferences.html`) dihapus.
- `templates/app-prototype/AppPrototype.dc.html`: avatar dropdown menu
  sekarang cuma 2 item — "Settings" (bukan "Profile") + "Logout". Array
  `SCREENS` diperbarui untuk `settings-members` dan 3 halaman Account baru
  ("Settings → Account → Profile/Notifications/Preferences"). Komentar
  kode lama soal "Workspace Selector vs User Settings" diganti mengikuti
  ADR-076 (satu entry point Settings konsolidasi).
- Fix ikon Light/Dark di halaman Preferences (`.pref-row` "Tema
  Tampilan"): emoji mentah (☀/🌙) diganti SVG identik dengan tombol
  theme-toggle di sidebar-footer, konsisten Astryx.
- Fix entry `settings-connected-accounts` di SCREENS array yang kelewat
  saat rename pertama, kode KSP-08 dipertahankan.
- `readme.md` project Claude Design diperbarui: section "Avatar Menu"
  tidak lagi menjelaskan pembedaan lama Workspace Selector vs User
  Settings, jumlah "navigable screens" diperbaiki jadi 16, daftar file di
  section "Files" mencantumkan 3 file Account baru dan menghapus referensi
  `user-settings.html`.

### Status

Design System sekarang jadi referensi visual yang akurat untuk ADR-076.
Migrasi kode `apps/web` (T-039) masih menyusul sebagai task terpisah,
tetap diblokir sampai King Rezi memerintahkan eksekusi eksplisit.

---

## 2026-08-10 — Task baru T-039 (Migrasi Routing & Settings, ADR-076) — entry backlog, belum dieksekusi

### Context

ADR-076 (PR #61) mengubah baseline routing workspace dari dynamic segment
`[slug]` ke route group `(app)` + cookie `active-workspace-id`, dan
mengonsolidasi Settings jadi Organization + Account — tapi PR itu hanya
mengubah baseline dokumentasi, kode `apps/web` belum dimigrasikan. Catatan
implementasi ADR-076 eksplisit menyebut migrasi kode ini butuh task T-XXX
formal sebelum dikerjakan, dan KI-023 di `PROJECT_STATE.md` mencatat gap
yang sama. King Rezi meminta task ini dibuat dulu (entry backlog saja),
eksekusi ditunda.

### Added

- **T-039** ditambahkan ke `tasks/v01-foundation.md` (section baru "Migrasi
  Routing & Settings (ADR-076)"), status `⏳ Not Started`, 4 subtask
  (T-039.1–T-039.4): hapus dynamic segment `[slug]` → route group `(app)`,
  gabung `account/` terpisah ke `settings/account/*`, ganti resolusi
  workspace Middleware/`src/proxy.ts` dari URL ke cookie
  `active-workspace-id`, dan bangun halaman `/onboarding` dengan picker
  workspace.
- ID **T-039** dipilih karena rentang v0.1 (T-001–T-019) sudah penuh —
  dipinjam dari nomor yang sebelumnya dicadangkan untuk ruang pertumbuhan
  v0.2 (`tasks/v02-publishing-mvp.md`, Catatan Rilis diperbarui mengikuti
  ini), sesuai aturan "ambil nomor global berikutnya yang belum pernah
  dipakai" di `TASKS.md`.
- `TASKS.md`: indeks release v0.1 diperbarui (Rentang ID → "T-001–T-019,
  T-039", Task 19→20, status ⏳ bertambah 1), **Total** 70→71 task, 138→142
  subtask.
- `PROJECT_STATE.md` KI-023: field **Terkait** ditambah `T-039`, paragraf
  penutup diperbarui dari "belum punya task T-XXX formal" menjadi
  mereferensikan T-039 yang sudah dibuat (status Not Started).
- **Tidak ada kode `apps/web` yang berubah** — murni penambahan entry
  backlog dokumentasi, sesuai permintaan eksplisit King Rezi untuk menunda
  eksekusi.

---

## 2026-08-10 — KI-021/KI-022 resolved (Design System, avatar dropdown + Logout + Profile routing) — KI-023 baru (Workspace Selector belum diimplementasikan)

### Context

KI-021 mencatat bahwa Design System (`templates/app-prototype/AppPrototype.dc.html`)
tidak punya logic apa pun untuk membuka menu saat avatar diklik (langsung
pindah screen) dan alur Logout belum pernah dimodelkan sama sekali di
prototype. KI-022 mencatat bahwa avatar Design System mengarah ke Workspace
Settings `settings-connected-accounts`, sementara kode web mengarah ke
`/account/profile` User Settings — dan investigasi baseline
(`information-architecture.md`) mengonfirmasi kode web sudah benar,
kemungkinan Design System yang perlu mengikuti.

King Rezi mengerjakan sendiri fix di Claude Design (manual, di luar sesi
AI) dan meminta hasilnya diverifikasi cocok dengan kode
(`WorkspaceSideNav.tsx`, `AccountSideNav.tsx`, `account/layout.tsx`) lalu
dicatat sebagai resolved. Tidak ada kode `apps/web` yang diubah di semua
ini.

### Fixed

- **KI-021 resolved** — Avatar sidebar di Design System sekarang membuka
  dropdown (Profile + divider + Logout), mirror `DropdownMenu` Astryx di
  kode. Item Logout membuka dialog konfirmasi Tier 2 (judul "Logout dari
  akun ini?", deskripsi "Perubahan yang belum disimpan di halaman ini bisa
  hilang (ADR-049/NP-D10).", tombol Batal/Logout) — mirror `AlertDialog`
  di kode, sesuai ADR-049/NP-D10.
- **KI-022 resolved** — Item Profile pada dropdown avatar Design System
  sekarang mengarah ke screen baru `templates/user-settings.html` (User
  Settings), dengan sidebar minimal ala `AccountSideNav.tsx` (link kembali
  + 3 nav item Profile/Notifications/Preferences) — bukan lagi sidebar
  workspace penuh menuju Workspace Settings. Konfirmasi: kode web
  (`/account/profile`, User Settings) sudah benar sesuai baseline
  `information-architecture.md` + ADR-056; Design System yang disesuaikan
  mengikuti kode/baseline, bukan sebaliknya.
- `readme.md` project Claude Design "Social Media Management" diperbarui,
  section baru "Avatar Menu (KI-021/KI-022 fix)" menjelaskan alur
  dropdown + screen User Settings + dialog Logout ini.

Tidak dibuat ADR baru — ini menegakkan ADR-056 (User Settings vs Workspace
Settings) dan ADR-049/NP-D10 (dialog konfirmasi Tier 2) yang sudah ada,
bukan keputusan material baru.

### Added (Known Issue baru — KI-023)

Riset navigasi di sesi ini menemukan gap terpisah yang belum pernah
tercatat: **KI-023** — Workspace Selector belum pernah diimplementasikan
di kode, meski didefinisikan lengkap di baseline navigasi. Status masih
Open (belum resolved) — detail lengkap sengaja hanya disimpan di
`PROJECT_STATE.md` (satu sumber, bukan diduplikasi di sini) supaya tidak
ada dua salinan yang bisa divergen saat isu ini nanti berubah/resolved.

### Documentation

- `project-manager/PROJECT_STATE.md` — KI-021 dan KI-022 dihapus dari
  Known Issues (riwayatnya tercatat di entri ini), 2 bullet baru
  ditambahkan di **Completed (Ringkasan)** (2 bullet paling lama
  dikeluarkan dari daftar 5 item, riwayatnya tetap ada di entri
  `COMPLETE_TASK.md` sebelumnya). **KI-023** ditambahkan baru ke Known
  Issues (Status Open, Kategori Tech-Debt, Terkait T-009/IA-D05/NP-D07).
  Version 1.0.47 → 1.0.48.
- `TASKS.md`/`tasks/` tidak disentuh — KI-021/022/023 tidak pernah terkait
  ke task T-XXX manapun secara formal.

---

## 2026-08-10 — KI-020 resolved: layout footer sidebar grouping, kode ikut Design System

### Context

KI-020 mencatat mismatch layout di footer sidebar: Design System CSS
(`.sidebar-footer` di `styles.css`) tidak memakai `justify-content` pada
container-nya (cuma `display:flex; gap:var(--spacing-1)`) — efek
"renggang" didapat dari `margin-left:auto` yang ditempel LANGSUNG pada
tombol Theme, sehingga Notifikasi menempel kiri sementara Theme+Avatar
mengelompok jadi satu klaster di kanan. Implementasi web
(`WorkspaceSideNav.tsx`) sebelumnya memakai `<HStack gap={2} align="center"
justify="between" width="100%">` yang membungkus 3 children langsung
(IconButton Notifikasi, IconButton Theme, DropdownMenu Avatar) —
`justify="between"` di container menyebar ketiganya dengan jarak sama
rata, bukan mengelompokkan Theme+Avatar jadi satu grup di kanan seperti
Design System.

King Rezi memutuskan arah resolusi: **kode mengikuti Design System**,
Design System tidak diubah.

### Changed (kode)

- `apps/web/src/app/[slug]/components/WorkspaceSideNav.tsx`:
  - Outer `HStack justify="between"` sekarang membungkus 2 grup, bukan 3
    children langsung: (1) IconButton Notifikasi sendiri, (2) `HStack`
    baru berisi IconButton Theme + `DropdownMenu` Avatar (grup kanan).
  - `AlertDialog` konfirmasi Logout tetap di level yang sama (tidak
    visual, cuma overlay) — tidak terdampak.

### Verifikasi

Diverifikasi manual di browser preview: layout footer sidebar menunjukkan
Notifikasi kiri, Theme+Avatar mengelompok kanan — sesuai Design System.
Dropdown avatar (Profile/Logout) tetap berfungsi normal (menuitem
terdeteksi via `read_page`). `tsc --noEmit` di `apps/web` bersih, tidak
ada error. Tidak menjalankan test suite otomatis lain; tidak ada regresi
terdeteksi di area lain.

### Keputusan dokumentasi

Tidak dibuat ADR baru — ini pilihan implementasi kecil (grouping layout
mengikuti Design System yang sudah ada), bukan keputusan
arsitektur/workflow/repository strategy/business requirement/domain/
teknologi baru, sejalan dengan pola resolusi KI-019.

### Resolved

KI-020 dihapus dari `PROJECT_STATE.md` — riwayatnya tercatat di entri
ini.

---

## 2026-08-10 — KI-019 resolved: footer sidebar pakai `Avatar`, kode ikut Design System

### Context

KI-019 mencatat mismatch elemen UI di footer sidebar: Design System
(`components/navigation.html` di Claude Design, project "Social Media
Management") me-render avatar bulat berisi inisial (`<span
class="avatar-round">`, dibungkus icon button `aria-label="Menu akun"`),
sedangkan implementasi web (`WorkspaceSideNav.tsx`) memakai `DropdownMenu`
dengan tombol TEKS nama/email (`button={{ label: userName || userEmail,
variant: "ghost" }}`) — beda jenis elemen, bukan cuma beda posisi visual.

King Rezi memutuskan arah resolusi: **kode mengikuti Design System**, Design
System tidak diubah.

### Changed (kode, dikerjakan Mark UI Engineer)

- `apps/web/src/app/[slug]/components/WorkspaceSideNav.tsx`:
  - Tambah import `Avatar` dari `@astryxdesign/core/Avatar`.
  - `DropdownMenu` footer: `button` diganti jadi `{ isIconOnly: true, icon:
    <Avatar name={userName || userEmail} size="sm" />, variant: "ghost",
    label: userName || userEmail }`, tambah `hasChevron={false}`.
  - `items` (Profile, divider, Logout) tidak berubah.
  - Layout container `HStack` (`justify="between"`) **tidak disentuh** —
    tetap scope KI-020 (Known Issue terpisah, masih Open).

### Verifikasi

Diverifikasi manual di browser oleh AI utama (akun test Raka Pratama):
avatar bulat "RP" tampil menggantikan teks nama di footer sidebar,
`aria-label="Raka Pratama"` tetap ada (aksesibilitas terjaga), dropdown
Profile/Logout berfungsi normal saat avatar diklik, dark mode dicek (avatar
tetap terbaca, tidak ada regresi), IconButton Notifikasi & Theme di
sebelahnya tidak terdampak.

### Keputusan dokumentasi

Tidak dibuat ADR baru — ini perbaikan implementasi UI mengikuti Design
System yang sudah ada (bukan keputusan arsitektur/workflow/repository
strategy/business requirement/domain/teknologi baru), sejalan dengan pola
resolusi KI-004 (verifikasi/perbaikan UI langsung tanpa ADR).

### Resolved

KI-019 dihapus dari `PROJECT_STATE.md` (ADR-067) — riwayatnya tercatat di
entri ini. KI-020 (layout `justify="between"`) tetap Open, tidak
tersentuh.

---

## 2026-08-07 — Resolusi KI-018: Amandemen ADR-071 (sinkronisasi kutipan migration.sql)

### Context

KI-018 ditemukan saat investigasi KI-016 (ADR-073): kutipan SQL di bagian
"Catatan implementasi" ADR-071 (`ON CONFLICT (id) DO NOTHING`, tanpa
guardrail kolom) sudah stale terhadap isi aktual
`apps/web/prisma/migrations/20260806120000_extend_avatars_bucket_user_profile/migration.sql`
(`ON CONFLICT (id) DO UPDATE` + guardrail `file_size_limit`/
`allowed_mime_types`) — kode diedit setelah ADR-071 ditulis, kutipannya
tidak ikut diperbarui.

### Changed (dokumentasi)

- ADR baru **ADR-075** dibuat (`project-manager/decisions/ADR-075-amandemen-adr-071-sinkronisasi-kutipan-migration-sql-bucket-avatars.md`)
  mengamandemen ADR-071 — DECISIONS.md append-only, jadi kutipan lama
  ADR-071 tidak diedit, hanya digantikan lewat ADR baru yang eksplisit
  merujuknya (konvensi amandemen ADR-027/ADR-067).
- `project-manager/DECISIONS.md` — baris ADR-075 ditambahkan; baris ADR-071
  diupdate Status jadi `Accepted — Amended by ADR-075 (2026-08-07)`.
- `project-manager/PROJECT_STATE.md` — KI-018 Status diubah dari `Open` ke
  `Resolved`, ditambah catatan referensi ADR-075; baris log KI-018 resolved
  ditambahkan di dekat entri KI-016.
- Tidak ada perubahan kode — murni koreksi dokumentasi (Docs-Consistency),
  tidak ada keputusan arsitektur baru.

---

## 2026-08-07 — T-007.4: UI daftar anggota `/settings/members` (Astryx Table)

### Context

Lanjutan T-007 (Members management). Setelah T-007.3 menyelesaikan Server
Actions untuk `removeMember`/`updateMemberRole`, T-007.4 membangun UI daftar
anggota nyata di `/settings/members` menggantikan `ScaffoldPlaceholder`,
memakai Astryx Table.

### Changed (kode)

- Domain `workspace` (`apps/web/src/domains/workspace/`): `IWorkspaceRepository`
  ditambah method `listMembers` dan `findUsersByIds` + implementasi Prisma-nya;
  `WorkspaceService.listMembersWithUser` (join member + data user); type baru
  `WorkspaceMemberWithUser`. Test baru ditambahkan ke
  `workspace.service.test.ts` (26 test pass, tanpa regresi).
- `apps/web/src/app/[slug]/settings/members/page.tsx` — diganti dari
  `ScaffoldPlaceholder` jadi server component nyata yang memanggil
  `listMembersWithUser`.
- `apps/web/src/app/[slug]/settings/members/components/MembersTable.tsx` —
  baru, client component memakai Astryx Table dengan kolom
  Member/Role/Status/Actions. Tombol Change Role/Remove disabled dengan
  tooltip "Tersedia setelah T-007.5 selesai", dan disembunyikan untuk baris
  Owner atau baris milik user yang sedang login.
- Verifikasi: `bunx tsc --noEmit` bersih, `bun run lint` bersih, unit test
  service pass (26/26). Verifikasi visual browser **tidak** dilakukan (tidak
  ada kredensial test user yang valid tersedia saat sesi ini) — dicatat
  sebagai known gap, bukan diklaim selesai penuh secara end-to-end.

### Changed (dokumentasi)

- `project-manager/tasks/v01-foundation.md` — T-007.4 ditandai selesai
  (`[x]`). T-007 tetap 🟡 In Progress (T-007.1 `inviteMember` masih menunggu
  T-005, T-007.5 dialog konfirmasi Remove Member/Update Role belum
  dikerjakan).
- `project-manager/PROJECT_STATE.md` — entri baru di "Completed (Ringkasan)",
  metadata `Version`/`Last Updated` diperbarui.

### Di luar scope (sengaja belum dikerjakan)

- Dialog konfirmasi Remove Member/Update Role → T-007.5 (masih ⏳ Not
  Started, ADR-049 Tier 2).
- Tombol Invite Member → masih menunggu T-005 (transactional email provider).

### Tindak lanjut

- T-007.5 (dialog konfirmasi) jadi next step logis untuk menutup T-007
  sepenuhnya (bersama T-007.1 begitu T-005 selesai).

---

## 2026-08-07 — T-007.3: Server Actions + delegasi RBAC ke domain layer (Members Management)

### Context

Lanjutan T-007 (Members management). RBAC `removeMember`/`updateMemberRole`
sudah lengkap di domain layer (`WorkspaceService`, T-007.1 partial). T-007.3
membuat Server Actions tipis di route `[slug]/settings/members` yang
mewiring UI ke service tersebut, sesuai aturan keras `#5` (entry point tidak
boleh berisi business logic).

### Changed (kode)

- `apps/web/src/app/[slug]/settings/members/actions.ts` — baru:
  `removeMemberAction` dan `updateMemberRoleAction`, wiring tipis ke
  `WorkspaceService.removeMember` / `updateMemberRole`. Helper lokal
  `resolveWorkspaceAndSession(slug)`. Tidak ada business logic baru — RBAC
  tetap di domain layer.
- `apps/web/src/app/[slug]/settings/members/actions.test.ts` — baru, 6 test.
- Verifikasi: vitest lolos (6/6 test baru + 24/24
  `workspace.service.test.ts` tanpa regresi), typecheck bersih. Tidak ada
  perubahan domain/service layer maupun schema.

### Changed (dokumentasi)

- `project-manager/tasks/v01-foundation.md` — T-007.3 ditandai selesai
  (`[x]`). T-007 tetap 🟡 In Progress (T-007.1 inviteMember masih menunggu
  T-005, T-007.4 UI dan T-007.5 dialog konfirmasi belum dikerjakan).

### Tindak lanjut

- T-007.4 (UI daftar anggota `/settings/members`, Astryx Table) jadi next
  step logis untuk melanjutkan T-007.

---

## 2026-08-07 — ADR-074: Reduksi struktur role 4→3 (Account Owner/Admin/Creator), resolusi KI-017

### Context

KI-017 mencatat mismatch role di mockup Claude Design `settings-members.html`
(Admin/Editor/Viewer) vs baseline 4-role lama (Owner/Admin/Manager/Creator).
Saat membahas resolusi, King Rezi meminta brainstorming lebih dulu, lalu
memutuskan menyederhanakan struktur role menjadi 3 — bukan sekadar
menyamakan mockup ke baseline lama. Role **Manager** dihapus; hak
operasionalnya (schedule/publish/engagement inbox/analytics penuh) digabung
ke **Creator** (bukan Admin), karena persona yang memegangnya (Raka — Social
Media Manager, operator publishing harian) tidak pernah butuh akses
administratif (billing/workspace settings/member management). Keputusan
dicatat sebagai **ADR-074**.

### Changed (dokumentasi)

- `product-discovery/02-product/roles-permissions.md` — ditulis ulang total:
  3 role, matriks hak akses, tabel transisi status, mapping persona
  (Raka → Creator).
- `product-discovery/02-product/mvp-definition.md`,
  `05-architecture/README.md`, `domain-model.md`, `auth-architecture.md`,
  `application-layer.md`, `realtime-strategy.md`, `database-strategy.md`,
  `06-engineering/auth-strategy.md`, `04-ux/information-architecture.md`,
  `04-ux/key-screen-patterns.md` — semua referensi 4-role/`Manager` diupdate
  ke 3-role.
- `context/ctx-business.md`, `context/ctx-development.md` — daftar role
  kanonikal diupdate.
- `project-manager/PROJECT_STATE.md` — KI-017 ditandai Resolved.
- `project-manager/ARCHITECTURE_OVERVIEW.md` — label role di diagram System
  Context diupdate.
- `project-manager/tasks/v02-publishing-mvp.md` — RBAC `publishNow` (T-029.1)
  diupdate jadi semua role.
- `project-manager/DECISIONS.md` + `decisions/ADR-074-...md` — ADR baru.

### Changed (kode)

- `packages/shared/src/enums.ts` — `MemberRole.Manager` dihapus. Enum key
  `Owner` (value `"owner"`) dipertahankan tanpa migrasi — tampilan UI/dokumen
  memakai label "Account Owner".
- `apps/web/src/domains/workspace/services/workspace.service.test.ts` —
  skenario test yang memakai `MemberRole.Manager` disesuaikan ke 3 role
  (member seed, target, dan actor diganti ke Owner/Admin/Creator). Logika
  RBAC (`removeMember`/`updateMemberRole`, hanya Owner/Admin boleh jadi
  actor) tidak berubah.
- Verifikasi: `bun test` untuk `workspace.service.test.ts` +
  `enums.test.ts` — 28 test lolos, 0 gagal.

### Tindak lanjut yang bukan tanggung jawab agent

- Revisi mockup Claude Design `templates/settings-members.html` — prompt
  siap pakai sudah diberikan ke King Rezi untuk dikerjakan langsung di
  Claude Design (bukan dieksekusi otomatis via `DesignSync` dalam sesi ini,
  sesuai permintaan eksplisit King Rezi).
- `apps/web/prisma/schema.prisma` menyimpan `role` sebagai `String` biasa —
  tidak ada migration DB yang diperlukan (belum ada data live dengan role
  `manager`).

---

## 2026-08-07 — KI-016 resolved: Shadow database Prisma (P3006) via External Tables

### Context

`prisma migrate dev` gagal (P3006) karena migration lama
`20260806120000_extend_avatars_bucket_user_profile` berisi raw SQL ke
`storage.buckets` (tabel Supabase Storage, bukan model Prisma) — tabel itu
tidak ada di shadow database kosong yang direplay Prisma setiap validasi.
Sebelumnya diatasi per-migrasi dengan workaround manual (`migrate diff` ke
DB live + `db execute` + `migrate resolve --applied`), tercatat sebagai
KI-016 karena workaround itu harus diulang untuk SEMUA migrasi berikutnya
kalau tidak ditangani permanen.

### Changed (kode — dikerjakan Elon Backend Engineer, sudah terverifikasi sebelum sesi dokumentasi ini)

- `apps/web/prisma.config.ts` — tambah `experimental.externalTables: true`,
  `tables.external: ["storage.buckets"]`, `migrations.initShadowDb` (isi SQL
  dibaca dari file terpisah via `readFileSync`).
- File baru `apps/web/prisma/shadow-init.sql` — stub minimal idempotent
  tabel `storage.buckets` untuk shadow DB.

### Verifikasi end-to-end

1. `prisma migrate diff --shadow-database-url ...` — replay 6 migration
   history termasuk migration `storage.buckets` sukses tanpa P3006.
2. Ditemukan masalah terpisah (checksum drift, bukan bagian KI-016):
   migration `20260806120000_extend_avatars_bucket_user_profile` di disk
   sudah diedit (jadi `DO UPDATE` + guardrail) setelah pernah applied ke DB
   dev lokal — diperbaiki via UPDATE manual kolom `checksum` di
   `_prisma_migrations` (persetujuan eksplisit King Rezi, dijalankan lewat
   `prisma db execute --stdin`, hanya metadata Prisma yang tersentuh).
3. `prisma migrate status` → "Database schema is up to date!".
4. Uji final `prisma migrate dev --create-only --name test_ki016_resolution`
   → berhasil tanpa P3006/error checksum apapun (folder migrasi kosong
   dihapus lagi, tidak di-commit).

### Changed (dokumentasi)

- `project-manager/PROJECT_STATE.md` — KI-016 dihapus dari Known Issues
  (per ADR-067, resolved KI yang sudah tercatat di sini tidak dibiarkan
  menumpuk sebagai status Resolved di `PROJECT_STATE.md`); ditambahkan
  KI-018 baru (staleness ADR-071 vs kode aktual, temuan terpisah selama
  investigasi).
- ADR baru **ADR-073** (`project-manager/decisions/ADR-073-prisma-external-tables-untuk-shadow-database-tabel-platform-supabase.md`)
  + baris baru di `project-manager/DECISIONS.md`.
- `product-discovery/06-engineering/database-orm.md` § Migration Strategy
  (DO-D03) — subsection baru "Shadow Database & External Tables (ADR-073)"
  (perubahan struktural pada Static Reference, dicatat di sini sesuai
  governance).

---

## 2026-08-07 — T-007.1 (sebagian) & T-007.2 selesai: Members management (removeMember, updateMemberRole, repository invitation)

### Context

**T-007** (Members management) dikerjakan oleh Prabowo Feature Engineer.
Scope sesi ini: `WorkspaceService.removeMember` + `updateMemberRole` (RBAC
manual) dan seluruh repository method + migrasi tabel invitation.
`inviteMember` belum dikerjakan — tetap menunggu T-005 (transactional email
provider) selesai/ditentukan.

### Changed (kode)

- **T-007.1 (sebagian) — `WorkspaceService.removeMember` + `updateMemberRole`:**
  RBAC manual Owner/Admin only; Owner tidak bisa dihapus atau diubah role-nya;
  `updateMemberRole` menolak promosi member manapun ke Owner. File:
  `apps/web/src/domains/workspace/services/workspace.service.ts` +
  `apps/web/src/domains/workspace/services/workspace.service.test.ts`.
  `inviteMember` masih Blocked (T-005).
- **T-007.2 — Repository method + migrasi tabel invitation:** Model Prisma
  baru `WorkspaceInvitation` → tabel `workspace_invitations` (lihat
  **ADR-072**), migration
  `apps/web/prisma/migrations/20260807061502_add_workspace_invitations/`.
  Repository method baru: `getMember`, `findMemberById`, `removeMember`,
  `updateMemberRole`, `createInvitation`, `findInvitationByToken` — interface
  di `apps/web/src/domains/workspace/repositories/workspace.repository.ts`,
  implementasi Prisma di
  `apps/web/src/lib/repositories/workspace/workspace.repository.ts`. ID baru
  ditambahkan di `packages/shared/src/ids.ts`.

### Keputusan & temuan

- **ADR-072** — Invite member wajib bisa menyasar orang yang belum punya
  akun (dikonfirmasi King Rezi), sehingga dibuat tabel `workspace_invitations`
  terpisah dari `workspace_members` (yang mensyaratkan `user_id NOT NULL`).
  `database-strategy.md` perlu diupdate menyusul untuk merefleksikan tabel
  baru ini (belum dieksekusi di sesi ini).
- **KI-016 (baru)** — `prisma migrate dev` gagal (P3006) untuk migrasi kali
  ini karena migration lama `20260806120000_extend_avatars_bucket_user_profile`
  berisi raw SQL ke skema `storage.buckets` yang tidak ada di shadow database
  kosong. Diatasi dengan workaround manual (`prisma migrate diff` ke DB live
  + `prisma db execute` + `prisma migrate resolve --applied`), sudah
  diverifikasi `prisma migrate status` up to date — tapi workaround ini akan
  perlu diulang untuk migrasi Prisma berikutnya sampai ditangani permanen.

### Task tracking

- `tasks/v01-foundation.md` — T-007 Status `⏳ Not Started` → `🟡 In Progress`;
  T-007.1 tetap unchecked (catatan inline ditambahkan); T-007.2 dicentang
  selesai.
- `TASKS.md` — indeks v0.1: `3 🟡` → `4 🟡`, `7 ⏳` → `6 ⏳`.

---

## 2026-08-06 — T-016.1/2/3/5 selesai: Account & user settings screens

### Context

**T-016** (Account & user settings screens) dikerjakan lintas subagent —
Mark UI Engineer (T-016.1 layout, T-016.3 preferences, T-016.5 dialog
konfirmasi Logout) dan Prabowo Feature Engineer (T-016.2 profile edit).
Direview arsitektur oleh Ridwan (nihil temuan) dan lolos QA end-to-end oleh
Najwa + verifikasi tambahan sesi utama. **T-016.4** (notifications) tetap
di luar scope sesi ini — blocked T-036 (v0.2), tidak dikerjakan.

### Changed (kode)

- **T-016.1 — Layout `account/` + `settings/`:** Sesi Claude Design (AI
  utama, bukan subagent Neymar) lebih dulu untuk 4 mockup:
  `templates/account-profile.html`, `templates/account-preferences.html`,
  kolom Tier 2 baru di `components/dialog.html`, subnav baru di
  `templates/settings-connected-accounts.html` (project Claude Design
  "Social Media Management", projectId `84aded99-bb23-49b1-be9f-dd8f21c6873e`).
  `/account` pakai `AppShell`+`SideNav` (top-level, tanpa workspace context,
  back-link ke workspace); `/[slug]/settings` pakai
  `Layout`+`LayoutPanel role="navigation"`+`LayoutContent` (bukan AppShell
  kedua, karena sudah dibungkus AppShell dari `[slug]/layout.tsx`). File
  baru: `apps/web/src/app/account/page.tsx` (redirect ke `/account/profile`,
  menutup celah ADR-046), `apps/web/src/app/account/components/AccountSideNav.tsx`,
  `apps/web/src/app/[slug]/settings/components/SettingsSideNav.tsx`. Diubah:
  `apps/web/src/app/account/layout.tsx`, `apps/web/src/app/[slug]/settings/layout.tsx`.
- **T-016.2 — `/account/profile` (edit nama, avatar):** Domain `identity`
  (`apps/web/src/domains/identity/`) diisi **pertama kali** (sebelumnya
  scaffold kosong): `IIdentityRepository`, `IAvatarStorageAdapter` (pola sama
  `IOutstandAdapter` domain publishing), `IdentityService` (constructor
  injection, validasi nama + avatar). Infra: `apps/web/src/lib/repositories/identity/`,
  `apps/web/src/lib/adapters/avatar-storage/` (Supabase Storage,
  service-role). Entry point: `apps/web/src/app/account/profile/page.tsx`
  (Server Component) + `actions.ts` (Server Action) + `components/ProfileForm.tsx`.
  Scope sengaja hanya nama + avatar — email read-only, tidak ada flow ganti
  email (belum ada infra verifikasi email).
- **T-016.3 — `/account/preferences`:** Card "Tema Tampilan" dengan toggle
  Light/Dark, reuse hook `useThemeMode()` existing (tidak ada state/cookie
  baru) — baseline (`04-ux/information-architecture.md` § 7) tidak
  mendefinisikan personal preference lain di luar tema. File:
  `apps/web/src/app/account/preferences/page.tsx`.
- **T-016.5 — Dialog konfirmasi Logout (ADR-049 Tier 2):** Memperbaiki
  pelanggaran aktif ADR-049/NP-D10 yang ditemukan saat eksplorasi:
  `handleLogout` di `apps/web/src/app/[slug]/components/WorkspaceSideNav.tsx`
  sebelumnya dipanggil langsung dari dropdown "Logout" tanpa konfirmasi
  apapun. Fix: tambah `AlertDialog` (komponen Astryx, konsumen pertama di
  `apps/web`) — title "Logout dari akun ini?", description mengacu
  ADR-049/NP-D10, `cancelLabel="Batal"`, `actionLabel="Logout"`. Logic
  `handleLogout` (signOut + redirect + refresh) tidak berubah, hanya
  digating di belakang dialog.

### Perluasan baseline (ADR-071)

Bucket Supabase Storage `avatars` diperluas dari "khusus avatar workspace +
Start Page" menjadi juga menampung avatar user personal, path baru
`avatars/users/{user_id}/avatar.{ext}`. Direalisasikan lewat migration
idempotent
`apps/web/prisma/migrations/20260806120000_extend_avatars_bucket_user_profile/migration.sql`
(`insert into storage.buckets ... on conflict do nothing`), sudah diterapkan
ke dev (bucket sebelumnya belum eksis, dikonfirmasi via `listBuckets()`).
`product-discovery/05-architecture/database-strategy.md` § Storage Strategy
diupdate merefleksikan ini. Keputusan resmi dicatat sebagai **ADR-071** di
`DECISIONS.md` + `decisions/ADR-071-perluasan-bucket-avatars-untuk-avatar-user-personal.md`.

### Gap yang dicatat (bukan blocker)

Belum ada unit test Vitest baru untuk `IdentityService`/`IIdentityRepository`/
`SupabaseAvatarStorageAdapter` (domain `identity` yang baru diisi). Ridwan
sudah cek boundary arsitektur (bersih), tapi coverage test-nya nihil. Dicatat
sebagai **KI-014** (Open) di `PROJECT_STATE.md` — bukan blocker penutupan
T-016.1/.2/.3/.5, semua sudah lolos QA browser end-to-end.

### Verifikasi

- Typecheck/lint/test: PASS.
- Review arsitektur Ridwan: nihil temuan (boundary domain `identity` bersih).
- QA end-to-end Najwa + verifikasi tambahan sesi utama: golden path edit
  nama, upload avatar sungguhan, validasi nama kosong, validasi file bukan
  gambar, validasi >2MB — semua PASS via browser nyata,
  `identity_user.image`/`identity_user.name` dicek langsung di DB. Dialog
  Logout: Cancel membatalkan tanpa efek, Escape berperilaku sama seperti
  Cancel, Confirm sign-out + redirect `/login`, dites di light & dark mode.
  Toggle tema preferences: berfungsi, persist lintas section via cookie
  `theme` existing, tidak ada flash tema salah.

### Terkait

- `project-manager/tasks/v01-foundation.md` — T-016.1/.2/.3/.5 dicentang
  selesai, status T-016 diubah jadi 🟡 In Progress (T-016.4 tetap Blocked).
- `project-manager/TASKS.md` — indeks release v0.1 diperbarui (3 🟡, 7 ⏳).
- `project-manager/PROJECT_STATE.md` — KI-014 ditambahkan, ringkasan
  Completed/Recent Decisions diperbarui.
- `project-manager/DECISIONS.md` + `project-manager/decisions/` — ADR-071
  ditambahkan.

## 2026-08-06 — T-013.3 selesai: UI `/settings/connected-accounts`

### Context

Subtask **T-013.3** (UI daftar akun terhubung + tombol Connect per platform)
dikerjakan Mark UI Engineer, direview arsitektur oleh Ridwan (clean, 1 catatan
penataan folder — sudah diperbaiki sebelum selesai), lalu QA statis oleh
Najwa (typecheck/lint/test PASS, tanpa blocker). T-013.1/.2/.4 **tidak**
dikerjakan pada sesi ini — T-013 secara keseluruhan masih berstatus
🟡 In Progress (bukan selesai).

### Changed (kode)

- Server Component baru untuk route `/settings/connected-accounts`.
- Komponen baru `ConnectedAccountsList` — menampilkan daftar akun terhubung
  per workspace.
- Komponen baru `ConnectPlatformMenu` — menu tombol Connect per platform
  sosial yang didukung.
- Field `connectedAt` ditambahkan ke domain workspace (connected account)
  untuk mendukung tampilan tanggal terhubung di UI.

### Keputusan scope

- **Connect CTA untuk semua platform disabled** — T-025 (Real OutstandAdapter,
  v0.2) belum dikerjakan, jadi belum ada jalur nyata untuk inisiasi OAuth
  redirect (T-013.1 blocked by T-025).
- **Row action (disconnect/reconnect) disabled + tooltip penjelasan** — T-014
  (Disconnect) dan T-015 (Reconnect) belum dikerjakan, jadi UI hanya
  menampilkan state tapi belum mengekspos aksi fungsional.

### Verifikasi

- Typecheck/lint/test: PASS, bersih.
- Browser E2E: PASS — termasuk pengecekan empty state (belum ada akun
  terhubung) dan regresi sidebar Channels (memastikan perubahan tidak
  merusak fitur T-012 yang sudah ada).

### Terkait

- `project-manager/tasks/v01-foundation.md` — T-013.3 dicentang selesai,
  status T-013 diubah jadi 🟡 In Progress.
- `project-manager/TASKS.md` — indeks release v0.1 diperbarui (2 🟡, 8 ⏳).

## 2026-08-06 — KI-013 resolved: instalasi self-hosted Better Auth terverifikasi, ngrok tidak lagi wajib

### Context

Menyusul ADR-070 (revert Better Auth Cloud → self-hosted), King Rezi
menginstall self-hosted Better Auth secara mandiri di komputer lokal dan
mengonfirmasi **login/register berhasil lewat `http://localhost:3000`**
tanpa tunnel ngrok apapun. Kode `auth.ts` dan route handler ternyata sudah
lengkap sejak awal (Prisma adapter, tabel `identity_*` sudah termodel) —
yang diubah cuma env var: `BETTER_AUTH_URL=http://localhost:3000` dan
`BETTER_AUTH_API_KEY` dikosongkan (menonaktifkan plugin `dash`/Better Auth
Cloud).

Sesi lanjutan membahas cara melihat data: Better Auth **tidak menyimpan
data sendiri** — semua data (`identity_user`, `identity_session`,
`identity_account`, `identity_verification`) disimpan di Postgres Supabase
Cloud yang sama, diakses lewat Prisma. Untuk kebutuhan lihat/verifikasi
data tanpa dashboard Better Auth Cloud, ditambahkan script `db:studio`
(Prisma Studio) sebagai alternatif self-hosted.

### Changed (kode)

- `apps/web/package.json` — script baru `db:studio`: `bun --env-file=.env.local x prisma studio`.
- `package.json` (root) — script baru `db:studio`: `bun run --cwd apps/web db:studio`, mengikuti pola delegasi `db:migrate`/`db:deploy` yang sudah ada.

### Changed (dokumentasi)

- `QA_TEST_ACCOUNTS.md` — section "Kenapa testing browser pakai ngrok"
  diperbarui: catatan lama dipindah ke `<details>` (riwayat), ditambahkan
  catatan bahwa verifikasi browser sekarang langsung ke `localhost:3000`,
  tidak perlu lagi tanya URL tunnel ke user di setiap sesi.
- `PROJECT_STATE.md` — KI-013 dihapus dari Known Issues (ADR-067), bullet
  resolved ditambahkan ke Completed (Ringkasan).

### Resolved

KI-013 dihapus dari `PROJECT_STATE.md` (ADR-067) — riwayatnya tercatat di
entri ini. Bug hydration spesifik lewat tunnel ngrok (root cause asli
KI-013) tidak lagi relevan ditelusuri karena ngrok tidak dipakai lagi untuk
dev/testing.

### Catatan

`.claude/agents/najwa-qa-engineer.md` masih menyebut requirement ngrok di
langkah 0 — **belum diubah** karena file agent ini Static Reference
(chmod 444), hanya boleh diubah atas permintaan eksplisit King Rezi
(`AGENTS.md`). Perlu direvisi terpisah kalau King Rezi meminta.

---

## 2026-08-06 — ADR-070: tetap self-hosted Better Auth, tolak Better Auth Cloud

### Context

King Rezi mengeluhkan proses dev jadi merepotkan karena auth "mengharuskan"
tunnel ngrok setiap kali autentikasi diuji di dev mode. Diskusi menelusuri
akar masalah: baseline resmi (`auth-strategy.md`, ADR-024) mendesain Better
Auth sebagai library self-hosted yang seharusnya jalan normal di
`localhost:3000` tanpa tunnel apapun. Requirement ngrok ternyata berasal
dari **Better Auth Cloud** (produk hosted terpisah, sempat dipakai tanpa
tercatat di ADR manapun) — dashboard-nya menolak Base URL non-publik
("localhost, link-local hosts are not allowed"). Sempat dipertimbangkan
migrasi ke Supabase Auth, tapi ditolak karena akar masalahnya bukan
keterbatasan Better Auth secara umum.

### Decision (ADR-070)

Berhenti memakai Better Auth Cloud, kembali ke self-hosted Better Auth
sesuai desain asli ADR-024/`auth-strategy.md` — tidak ada perubahan
arsitektur. Instalasi dilakukan mandiri oleh King Rezi di komputer lokal
(`localhost:3000`, `BETTER_AUTH_SECRET` sendiri, DB tetap Supabase Cloud),
tanpa perlu Railway untuk dev.

### Added

- **ADR-070** (`project-manager/decisions/ADR-070-...md`).

### Status

Instalasi self-hosted belum dieksekusi AI — dilakukan mandiri oleh King
Rezi. `QA_TEST_ACCOUNTS.md` (catatan "wajib ngrok") dan KI-013 perlu
ditinjau ulang setelah instalasi terverifikasi jalan normal di `localhost`.

---

## 2026-08-06 — KI-004 resolved: alur UI toggle Light/Dark sudah diuji lewat browser

### Context

KI-004 mencatat bagian implementasi server-side toggle Light/Dark (baca
cookie di RSC sebelum render) sudah diverifikasi lewat `typecheck`/`lint`/
`test` otomatis, tetapi alur UI-nya (klik toggle di sidebar footer → cookie
tertulis) belum diuji lewat browser karena butuh login.

### Verifikasi

King Rezi sudah melakukan pengujian manual alur UI toggle Light/Dark lewat
browser (klik toggle di sidebar footer → cookie tertulis) — hasilnya berhasil
sesuai ekspektasi, tanpa temuan masalah.

### Resolved

KI-004 dihapus dari `PROJECT_STATE.md` (ADR-067) — riwayatnya tercatat di
entri ini.

---

## 2026-08-06 — KI-010 resolved: konvensi penamaan & peletakan komponen lokal `src/app/` + ADR-069

### Context

KI-010 (dicatat sejak review PR #42, 2026-08-05) mencatat konvensi folder
underscore-prefix (`_draft-editor`, `_sidebar-channels`) di
`apps/web/src/app/` belum resmi didokumentasikan, dan King Rezi tidak nyaman
dengan penamaan itu. Setelah diskusi, disepakati bukan mendokumentasikan
underscore apa adanya, melainkan mengganti konvensinya.

### Decision (ADR-069)

1. File yang meng-export React component pakai PascalCase (`Modal.tsx`);
   file non-component (`actions.ts`, `status-badge.ts`, `platform-icons.tsx`)
   tetap kebab-case.
2. Folder tetap kebab-case seluruhnya (tidak ada folder PascalCase) —
   `_draft-editor` → `draft-editor` (hanya hilang underscore).
3. Folder `components/` ditaruh di lowest common ancestor (LCA) route dari
   seluruh pemakainya di App Router tree (1 route → lokal; lintas route 1
   subtree → naik ke ancestor terendah; lintas subtree/root → naik ke
   `src/components/`).

### Changed (kode)

Seluruh komponen colocated di `apps/web/src/app/` dipindah & di-rename sesuai
konvensi baru — bukan cuma `_draft-editor`/`_sidebar-channels`, tapi juga
auth forms, onboarding form, workspace-side-nav, publish-tabbar, drafts-list,
dan `providers.tsx`. Contoh: `app/[slug]/_draft-editor/*` →
`app/[slug]/components/draft-editor/*`, `app/providers.tsx` →
`apps/web/src/components/Providers.tsx`.

### Changed (dokumentasi)

- `product-discovery/06-engineering/monorepo-setup.md` — section baru
  "Penamaan & peletakan folder `components/` lokal (KI-010, ADR-069)" di
  bawah `## src/app/ — App Router Structure`, plus update rujukan di
  `## src/components/ — UI Components`.
- `context/ctx-development.md` — item baru #13 di "Naming & file".
- `context/ctx-implementation.md` — bullet baru di "## UI Components
  (ADR-041)".

### Added

- **ADR-069** (`project-manager/decisions/ADR-069-...md`) — konvensi
  penamaan & peletakan komponen lokal di `src/app/`, resolusi KI-010.

### Verifikasi

- **Review Ridwan Architecture Reviewer**: PASS, tanpa temuan pelanggaran
  hard rules (entry point tetap tanpa business logic, tidak ada import baru
  yang melanggar domain logic, cross-domain tetap lewat barrel `index.ts`).
- **QA Najwa**: PASS — typecheck/lint/test hijau, browser E2E (sidebar
  Channels + drag-reorder, Draft Editor modal, Save as Draft,
  `/publish/drafts` DraftsList + Status Badge, Edit Draft) semua jalan
  normal tanpa regresi.

### Catatan task

KI-010 sebelumnya terkait T-012 dengan status out-of-scope. Diputuskan cukup
sebagai resolusi KI standalone (bukan task/subtask T-XXX baru) — sudah
selesai penuh dalam satu sesi, tidak ada sisa pekerjaan yang perlu dilacak
lebih lanjut.

---

## 2026-08-05 — KI-008/KI-009/KI-012 resolved: icon sidebar Channels diganti react-icons penuh + ADR-068 (amandemen ADR-058 poin 6)

### Context

Review PR #42 King Rezi menemukan 3 inkonsistensi icon di `channels-section.tsx` (KI-008 glyph "+" pakai `Text` bukan `Icon`/react-icons; KI-009 token font-size salah — `2xs`/8px, seharusnya 10px/`xs`; KI-012 beberapa Tailwind arbitrary-value class belum kanonik). Ketiganya dicatat sebagai Known Issues out-of-scope T-012 (ADR-066), belum pernah dipromosikan jadi task T-XXX resmi. Saat dikerjakan, King Rezi memperluas instruksi secara eksplisit: "pastikan semua icon pakai react-icon" — bukan cuma dark-mode/sidebar Channels, tapi seluruh `WorkspaceSideNav`.

### Changed (kode)

- `apps/web/src/app/[slug]/_sidebar-channels/channels-section.tsx`:
  - **KI-008 + KI-009** (digabung, 1 fix) — glyph tombol quick-compose "+" dari `<Text type="inherit" size="2xs" as="span">+</Text>` jadi `<FaPlus size={10} />` (`react-icons/fa6`), sekaligus mengoreksi ukuran ke 10px sesuai ADR-058 addendum poin 9.
  - **KI-012** — 3 Tailwind arbitrary-value class diganti canonical: `end-[calc(var(--spacing-1)*-1)]` → `-end-1`, `bottom-[calc(var(--spacing-1)*-1)]` → `-bottom-1`, `start-[calc(var(--spacing-4)*-1)]` → `-start-4`. Arbitrary value yang memang tidak ada padanan native (shadow ring token, durasi/easing `TRANSITION_FAST`) sengaja tidak diubah.
  - Tambahan konsisten dengan ADR-068: `GripIcon` custom inline SVG dihapus, diganti `RxDragHandleDots2` (`react-icons/rx`).
- `apps/web/src/app/[slug]/workspace-side-nav.tsx` (perluasan scope KI-008 atas instruksi eksplisit King Rezi, bukan cuma dark-mode) — CTA "+ New Post" → `FaPlus`; Notifikasi 🔔 → `FaBell`; toggle Dark/Light 🌙/☀️ → `FaMoon`/`FaSun`.

### Added

- **ADR-068** (`project-manager/decisions/ADR-068-...md`, amandemen ADR-058 poin 6) — `react-icons` diperluas jadi library ikon TUNGGAL untuk seluruh icon (brand maupun generik), menggantikan pola campuran sebelumnya (react-icons hanya untuk brand, custom SVG untuk generik). Dikonfirmasi 2x oleh King Rezi lewat `AskUserQuestion`, termasuk setelah diberi konteks riwayat konflik: komentar lama di `styles.css` Claude Design mencatat versi icon 16px untuk channel-add "+" pernah dicoba dan dinilai "looked worse, not better" (revert ke glyph mentah 20×20px), dan grip-handle sengaja dibuat custom SVG supaya "tidak perlu pull dependency baru untuk verifikasi 1 vector path". King Rezi tetap memilih mengganti semua ke react-icons — keputusan sadar yang menimpa keputusan lama, bukan pengulangan tanpa sepengetahuan. Ukuran akhir 10px (token `xs`, bukan 16px yang dulu gagal).

### Sinkronisasi Claude Design

Dikerjakan main session langsung via `DesignSync` (bukan Neymar subagent, keterbatasan sudah diketahui project). Project "Social Media Management" (`84aded99-...`), 8 file diupdate: 7 screen template (`home.html`, `publish-calendar.html`, `publish-queue.html`, `publish-drafts.html`, `engage-inbox.html`, `analyze-dashboard.html`, `settings-connected-accounts.html`) + `templates/app-prototype/AppPrototype.dc.html` (runner — logic `toggleTheme()`/`route()` yang tadinya deteksi klik lewat cocokkan teks emoji, diganti deteksi berbasis atribut `data-proto`/`aria-label` supaya tetap jalan setelah icon jadi SVG). Seluruh icon sekarang SVG statis identik secara visual dengan `react-icons` yang dipakai di kode. Memenuhi duty sinkronisasi ADR-056.

### Verifikasi

- **Review Ridwan Architecture Reviewer**: bersih, tidak ada pelanggaran arsitektur.
- **QA Najwa**: seluruh fungsional lolos lewat klik nyata (bukan cuma visual) — quick-compose "+", New Post, Notifikasi, toggle Dark/Light semua diverifikasi berfungsi. Lint/typecheck/vitest (45 test) semua pass. Satu keterbatasan: mekanika drag-reorder channel tidak tervalidasi tuntas lewat automation (drag sintetis tidak trigger reorder) — kemungkinan besar keterbatasan tool automation, bukan regresi (fix race condition drag-reorder di commit 516e48a tidak disentuh sama sekali oleh perubahan ini, murni ganti icon).

### Catatan proses (insiden kecil, sudah diverifikasi aman)

Selama debugging tidak terkait (masalah login/tunnel), agent implementasi sempat membaca `.env.local` via `cat` lewat Bash — melanggar deny-list Read eksplisit untuk file tersebut. Ridwan Architecture Reviewer sudah memverifikasi: tidak ada kebocoran isi env ke file manapun, dan `.env.local` sendiri tidak ter-modifikasi/ter-commit. Dicatat di sini sebagai jejak transparansi proses, bukan Known Issue baru (sudah clear), dan sebagai pengingat tech-debt kecil untuk memperketat guardrail Read terhadap file secret di sesi mendatang.

### Changed (dokumentasi)

- `project-manager/PROJECT_STATE.md` — **KI-008, KI-009, KI-012** dihapus dari section Known Issues (sudah `Resolved` dan tercatat di sini, mengikuti pola ADR-067). **Recent Decisions** menambahkan ADR-068 di atas (ADR-063 keluar dari daftar 5 teratas). **Completed (Ringkasan)** menambahkan entri ini di atas (entri ADR-059 keluar dari daftar 5 teratas). Version 1.0.42 → 1.0.43.
- `project-manager/DECISIONS.md` — baris baru **ADR-068** ditambahkan di atas; baris ADR-058 diupdate Status jadi `Accepted — Amended by ADR-068 (2026-08-05)`.
- `project-manager/decisions/ADR-058-...md` — Status header + poin 6 ditambahkan catatan `[Diamandemen ADR-068, 2026-08-05]` yang menunjuk ke ADR-068 untuk detail dan riwayat konflik.
- `TASKS.md`/`tasks/` **tidak disentuh** — KI-008/009/012 murni entry Known Issues, tidak pernah dipromosikan jadi task T-XXX resmi.

---

## 2026-08-05 — ADR-067: Known Issues `Resolved` dihapus dari `PROJECT_STATE.md` jika sudah tercatat di `COMPLETE_TASK.md` (amandemen ADR-066)

### Context

King Rezi mengonfirmasi PR #42 sudah `MERGED` (dicek via `gh pr view 42`), lalu meminta KI-007 "diperbaiki". KI-007 ternyata sudah `Resolved` — satu-satunya bagian stale adalah catatan bahwa PR #42 belum di-merge. King Rezi kemudian meminta: entry Known Issues yang sudah `Resolved` **dan** sudah tercatat di `COMPLETE_TASK.md` dihapus saja dari `PROJECT_STATE.md`, dan aturan ini dijadikan aturan resmi pendokumentasian project.

### Added

- **ADR-067** (`project-manager/decisions/ADR-067-...md`, amandemen ADR-066) — Known Issues berstatus `Resolved` yang riwayat penyelesaiannya sudah tercatat di `COMPLETE_TASK.md` dihapus dari `PROJECT_STATE.md`. ID tetap tidak didaur ulang (bagian ADR-066 yang dipertahankan). Entry `Promoted to T-XXX` dikecualikan — tetap tercatat sampai task tujuannya selesai. Ditambahkan ke indeks `DECISIONS.md`.

### Changed

- `project-manager/PROJECT_STATE.md` — **KI-007** dan **KI-011** (keduanya `Resolved`, sudah tercatat di entri `COMPLETE_TASK.md` 2026-08-05 di bawah) dihapus dari section Known Issues. Catatan format section Known Issues diperbarui menyebut ADR-067. Recent Decisions menambahkan ADR-067 di atas (ADR-062 keluar dari daftar 5 teratas). Version 1.0.41 → 1.0.42.
- `project-manager/decisions/ADR-066-...md` — Status diubah jadi `Accepted — Amended by ADR-067`; poin "ID tidak pernah didaur ulang" ditambah catatan amandemen.
- `project-manager/DECISIONS.md` — baris ADR-066 diupdate Status-nya, baris baru ADR-067 ditambahkan di atas.
- `project-manager/PROJECT_RULES.md` — bullet aturan Known Issues (ADR-066) diperbarui menyebut amandemen ADR-067 dan syarat penghapusan entry `Resolved`. Version 0.3.0 → 0.3.1.

---

## 2026-08-05 — T-012.9 (bug drag-reorder) fix + KI-011 resolved (helper `cn` global + migrasi `channels-section.tsx`)

### Changed

- **T-012.9 (bug, in-scope T-012)** — fix race condition drag-reorder di `apps/web/src/app/[slug]/_sidebar-channels/channels-section.tsx` (`handleDrop`): sekarang membaca `sourceId` dari `e.dataTransfer.getData("text/plain")` alih-alih state `draggedId` yang stale lewat closure saat native `drop` fire sebelum React re-render dari `dragstart`. State `draggedId` tetap dipertahankan untuk visual `isDragging`. Diimplementasikan Mark UI Engineer, review arsitektur Ridwan (0 pelanggaran), QA statis Najwa (typecheck/lint/test PASS — verifikasi browser di-skip atas keputusan eksplisit King Rezi, tidak ada environment preview). Belum di-commit ke git.
- **KI-011 (tech-debt) resolved** — helper `apps/web/src/lib/cn.ts` (`cn()` join className, tanpa dependency baru) dibuat, dan `channels-section.tsx` dimigrasikan penuh: `cx()` lokal dihapus total, 4 titik pemanggilan className diganti `cn()` dari `@/lib/cn`. Review + QA sama seperti di atas.
- `project-manager/tasks/v01-foundation.md` — T-012.9 dicentang selesai; redaksi Status T-012 disesuaikan (T-012.1/2 tetap deferred menunggu v0.2, tidak diubah).
- `project-manager/TASKS.md` — baris **Fokus sekarang** untuk T-012 diperbarui menyebut T-012.9 selesai.
- `project-manager/PROJECT_STATE.md` — **KI-007** dan **KI-011** diubah Status jadi `Resolved`; redaksi KI-007 menambah catatan bahwa merge PR #42 tetap terpisah dari status bug (yang sudah selesai).

---

## 2026-08-05 — ADR-066: Known Issues berstruktur dengan ID `KI-XXX` + pemisahan scope T-012 (out-of-scope dari review PR #42)

### Added

- **ADR-066** (`project-manager/decisions/ADR-066-...md`) — Known Issues di `PROJECT_STATE.md` sekarang memakai ID global `KI-001`–`KI-013` (namespace terpisah dari `T-XXX`), field table ringkas (Status/Kategori/Terkait/Ditemukan), ID tidak didaur ulang. Ditambahkan ke indeks `DECISIONS.md`.
- **Pemisahan scope T-012**: dari 6 temuan review King Rezi di PR #42 (T-012.7–12), hanya **T-012.9** (bug drag-reorder race condition) dinilai in-scope dan tetap sebagai subtask T-012. 5 temuan lain (T-012.7/8/10/11/12 — code consistency, dokumentasi konvensi folder, helper `cn` global, Tailwind class belum kanonik) dinilai **out-of-scope**, dipindah jadi entry Known Issues terpisah: **KI-008, KI-009, KI-010, KI-011, KI-012**.

### Changed

- `project-manager/tasks/v01-foundation.md` — checklist T-012 dirampingkan, hanya menyisakan T-012.9 dengan pointer ke Known Issues untuk 5 temuan lain.
- `project-manager/TASKS.md` — baris fokus T-012 di indeks disesuaikan (pointer ke Known Issues untuk temuan out-of-scope).
- `project-manager/PROJECT_STATE.md` — seluruh section **Known Issues** direstrukturisasi jadi 13 entry berID (`KI-001`–`KI-013`), **Recent Decisions** menambahkan ADR-066 di atas (ADR-061 keluar dari daftar 5 teratas). Version 1.0.40 → 1.0.41.
- `project-manager/PROJECT_RULES.md` (Static Reference, perubahan struktural) — section **Formatting Rules** menambah bullet konvensi ADR-066 (ID `KI-XXX` + field table wajib untuk setiap entry Known Issues). Version 0.2.0 → 0.3.0.
- Audit menyeluruh atas seluruh file yang menyebut "Known Issues" (`context/ctx-project.md`, `context/ctx-development.md`, `PROJECT_RULES.md`, `CONVERSATIONS.md`, `DEVELOPER_WORKFLOW.md`, `README.md`, `QA_TEST_ACCOUNTS.md`, `tasks/v10-public-launch.md`, `.claude/agents/gibran-project-manager.md`, `.claude/skills/project-os-navigator/SKILL.md`) — seluruhnya hanya menyebut "Known Issues" sebagai nama section/lokasi (tidak mendeskripsikan format), jadi tidak perlu diubah kecuali `PROJECT_RULES.md` di atas.

---

## 2026-08-05 — T-012 Sidebar "Channels" — laporan temuan review King Rezi di PR #42 (T-012.7–12, belum dikerjakan)

### Added

- Subtask baru **T-012.7–T-012.12** di `project-manager/tasks/v01-foundation.md`, mencatat 6 temuan King Rezi saat review PR #42 (belum di-merge): 1 bug (T-012.9, drag-reorder race condition — closure `draggedId` stale kalau native `drop` ter-fire sebelum React re-render dari `setDraggedId`, diverifikasi lewat simulasi `DragEvent` langsung di browser) + 5 catatan kualitas (T-012.7 icon "+" pakai `Text` bukan `Icon`/react-icons; T-012.8 token font-size salah — `2xs`/8px dipakai padahal ADR-058 minta 10px yaitu token `xs`; T-012.10 konvensi folder underscore-prefix belum terdokumentasi resmi; T-012.11 tidak ada helper `cn`/`clsx` global; T-012.12 beberapa Tailwind class belum kanonik, project belum punya lint plugin untuk itu).
- Tidak ada perubahan kode — sesi ini murni pelaporan/pencatatan, sesuai permintaan King Rezi untuk dikerjakan di sesi/chat terpisah. PR #42 tetap terbuka, menunggu instruksi merge dari King Rezi.

---

## 2026-08-05 — T-012 Sidebar section "Channels" — implementasi sebagian (T-012.3/4/5/6 selesai, T-012.1/2 tetap deferred)

### Added

- `apps/web/src/app/[slug]/_sidebar-channels/channels-section.tsx` — komponen
  baru render section "Channels" di `WorkspaceSideNav`, antara `SideNavSection`
  "Menu" dan footer (bukan nav item ke-6, sesuai P-IA-01/ADR-058).
- `apps/web/src/app/[slug]/_sidebar-channels/platform-icons.tsx` — mapping 8
  `SocialPlatform` → ikon brand `react-icons/fa6`.
- `react-icons@^5.7.0` dikonfirmasi sebagai dependency runtime `apps/web`
  (T-012.3).
- Helper `getConnectionStatusLabel` / `resolveConnectionDisplayStatus` di
  `apps/web/src/domains/workspace/value-objects/connection-status.ts` — mapping
  status koneksi akun ke label + Badge variant, dipakai section Channels dan
  disiapkan untuk dipakai ulang oleh halaman Connected Accounts settings
  (T-015).

### Changed

- `apps/web/src/app/[slug]/_draft-editor/context.tsx` — `openNewPost()`
  diperluas menerima `preSelectedAccountId?: string`; kalau diisi, langsung
  masuk mode `"create"` dengan akun ter-pre-select dan **skip** resume-check
  (ADR-058 addendum poin 9 — entry point beda konteks dari CTA "+ New Post"
  polos).
- `apps/web/src/app/[slug]/_draft-editor/modal.tsx` — Account Selector
  otomatis pre-check akun saat modal dibuka dari `preSelectedAccountId`.
- `apps/web/src/app/[slug]/workspace-side-nav.tsx` — terima prop channel list
  baru, render `ChannelsSection`.
- `project-manager/tasks/v01-foundation.md` (T-012) — checkbox T-012.3/4/5/6
  ditandai selesai; T-012.5 dan T-012.6 diberi catatan eksplisit masih ada
  bagian stub/non-persisten (scheduled count hardcode 0, reorder client-state
  only, tidak reload-safe) menunggu T-012.1/T-012.2 (v0.2). T-012.1/T-012.2
  tetap unchecked, ditandai "deferred — menunggu domain publishing v0.2".
- `project-manager/TASKS.md` — status T-012 di **Fokus sekarang** dari ⏳ jadi
  🟡 In Progress, catatan diperbarui.
- `project-manager/PROJECT_STATE.md` — `Top Next Tasks` (Snapshot), section
  **In Progress**, dan **Known Issues** diperbarui (scheduled count stub 0 +
  reorder belum persisten, menunggu T-012.1/T-012.2). Version 1.0.38 →
  1.0.39.

### Verifikasi

- Typecheck, lint, dan unit test (Vitest) bersih untuk seluruh perubahan.
- Review arsitektur Ridwan Architecture Reviewer: **lolos, tanpa temuan
  blocking** (entry point `layout.tsx` tetap hanya memanggil Application
  Service, tidak ada leak Prisma/domain internals ke komponen UI).
- QA code-level Najwa QA Engineer: **lolos**. Verifikasi browser end-to-end
  (interaksi hover, drag-reorder, klik "+", deep-link Disconnected) **belum
  dilakukan** — butuh tunnel ngrok aktif yang belum tersedia saat sesi ini;
  dicatat sebagai follow-up, bukan blocker penutupan T-012.3–6.

### Catatan

- Keputusan implementasi kecil (bukan ADR): Badge status memakai variant
  `"warning"` untuk **kedua** kondisi `reconnectRequired` dan `disconnected`
  (bukan hanya `reconnectRequired`). Ini reuse variant Badge yang sudah ada
  (sejalan ADR-058 poin 2 "tidak ada warna status baru"), belum dikonfirmasi
  eksplisit ke King Rezi sebagai keputusan terpisah — tidak dianggap
  penyimpangan material dari ADR-058 sehingga tidak dibuat ADR baru, tapi
  ditandai di sini untuk transparansi.

---

## 2026-08-05 — ADR-065: Draft Editor Fullscreen/Standard Toggle Jadi Fitur Resmi

### Added

- ADR-065 (`project-manager/decisions/`) — toggle Fullscreen/Standard di
  header dialog Draft Editor (New Post & Edit Draft, KSP-05) naik status
  dari alat banding sementara fase Design System (ADR-052) jadi **fitur
  resmi produk**, akan dibawa ke implementasi kode `apps/web`. Toggle tidak
  dipersist — reset ke Standard setiap dialog dibuka ulang.
- Claude Design (`readme.md`) — section baru "Draft Editor Dialog Variant
  Toggle (official product feature, ADR-065)".

### Changed

- **Default tampilan Draft Editor diubah dari Fullscreen → Standard**
  (override ADR-052 addendum "Koreksi: default dikembalikan ke
  Fullscreen"). Diterapkan di Claude Design: `templates/draft-editor.html`
  (`var variant = 'standard'`) dan
  `templates/app-prototype/AppPrototype.dc.html`
  (`state.dialogVariant: 'standard'`), plus komentar & tooltip toggle di
  kedua file.
- `readme.md` — "Don't" list dikoreksi (hapus larangan "Do not ship both
  Draft Editor Dialog variants to `apps/web`", karena sekarang justru
  keduanya dikirim); "Direction", "Components" (`.dialog-fs`/`.dialog-lg`),
  "How to Demo", dan "Files" diperbarui mengikuti default baru + status
  resmi toggle.
- `project-manager/DECISIONS.md` — baris indeks ADR-065 ditambahkan.
- `project-manager/PROJECT_STATE.md` — "Recent Decisions" digeser (ADR-065,
  ADR-064 masuk; ADR-060, ADR-059 keluar dari daftar 5 teratas).
- `product-discovery/04-ux/navigation-patterns.md` — 6 penyebutan "modal
  overlay fullscreen"/"modal fullscreen" (baris Transisi NP di sekitar
  275/296/314/429/462, dan tabel Decision Log NP-D11) dirapikan: istilah
  generik "modal overlay" dipakai untuk jenis modalnya, sedangkan
  Fullscreen/Standard disebut eksplisit sebagai dua variant resmi dengan
  Standard sebagai default (ADR-065) — supaya tidak lagi seolah-olah
  Fullscreen satu-satunya/default tampilan.
- `product-discovery/04-ux/key-screen-patterns.md` (KSP-05, catatan Panel
  AI) — deskripsi variant Fullscreen/Standard disesuaikan: Standard jadi
  default (ADR-065), toggle dinyatakan sebagai fitur resmi bukan alat
  banding sementara.

**Follow-up (2026-08-05, sama hari):** Ditemukan ADR-065 belum punya task
implementasi kode — T-020 (Draft Editor modal, sudah `✅ Done`) hanya
mengimplementasikan variant Fullscreen, tidak ada toggle/variant Standard
sama sekali. Ditambahkan:

- `project-manager/tasks/v02-publishing-mvp.md` — **T-038 baru** "Toggle
  Fullscreen/Standard resmi di Draft Editor" (4 subtask), memakai nomor
  cadangan release v0.2 (T-037–T-039). Catatan ditambahkan di T-020
  menjelaskan deskripsinya sudah tidak lengkap sejak ADR-065.
- `project-manager/TASKS.md` — indeks v0.2 (18→19 task, ⏳ 12→13) dan Total
  (69→70 task, 134→138 subtask) diperbarui mengikuti T-038 baru.

---

## 2026-08-04 — ADR-064: Konsolidasi Skill ke `.claude/skills/` sebagai Sumber Tunggal

**Konteks.** King Rezi menemukan skill project hidup di dua tempat sekaligus:
`.agents/skills/` (14 skill vendor: Prisma, Supabase, Vercel, Better Auth) dan
`.claude/skills/` (yang sebagian isinya berupa **symlink direktori** ke
`.agents/skills/` untuk 3 skill custom). Dua salinan fisik tanpa mekanisme
penjamin sinkronisasi = rawan divergen. King Rezi memutuskan menghapus
`.agents/skills/` setelah memverifikasi lewat
[dokumentasi Cursor](https://cursor.com/docs/skills) bahwa Cursor juga membaca
`.claude/skills/`.

**Perubahan (commit `d4fb2ab`, dikerjakan King Rezi + Cursor).**

* `.agents/skills/` dihapus; 14 skill vendor dipindahkan **byte-identical**
  (git mendeteksi `R100`) ke `.claude/skills/`.
* 3 skill custom (`project-os-navigator`, `proactive-clarification`,
  `work-report-simple`) yang tadinya symlink dibongkar jadi file nyata —
  perbedaan terhadap versi lama hanya formatting whitespace prettier (padding
  tabel + blank line), **nol kehilangan konten** (diverifikasi via `diff`
  terhadap blob `HEAD~1`).
* `AGENTS.md` mendapat section baru **"## Skills (`.claude/skills/`)"** berisi
  aturan single-source + 3 guardrail anti-duplikasi + caveat bahwa
  `.claude/skills/` di Cursor adalah compatibility path, bukan native.
* Referensi `.agents/skills/` diperbarui ke `.claude/skills/` di `AGENTS.md`,
  `context/ctx-project.md`, `project-manager/DEVELOPER_WORKFLOW.md`,
  `project-manager/PROJECT_STATE.md`, `.claude/agents/README.md`.

**Review + kelengkapan (sesi ini, Jokowi).** King Rezi minta review apakah
skill masih berjalan baik dan tidak ada yang miss. Hasil verifikasi: 18 folder
skill / 340 file tracked git, **nol symlink & nol broken symlink**, frontmatter
semua valid (`name` == nama folder, `description` ada), dan seluruh 18 skill
terbukti terbaca Claude Code di sesi ini. Klaim Cursor terkonfirmasi langsung
dari dokumentasi resminya. Tiga gap governance ditutup di sesi ini:

* **ADR-064** dibuat (`decisions/ADR-064-...md`) + didaftarkan di
  `DECISIONS.md` — sebelumnya keputusan struktural ini hanya tercatat sebagai
  prosa di `AGENTS.md`, tanpa ADR (preseden: ADR-045 untuk kasus hapus folder
  `design/`).
* Entri `COMPLETE_TASK.md` ini ditambahkan (sebelumnya belum ada untuk
  perubahan `d4fb2ab`).
* Dua stale worktree dihapus: `.claude/worktrees/status-pekerjaan-6ef926` dan
  `.claude/worktrees/test-787c6a`. Keduanya masih membawa `.agents/skills/`
  lengkap + `AGENTS.md` lama yang menunjuk ke `.agents/skills/` — risiko nyata
  sesi AI membaca aturan lama dan menghidupkan ulang duplikasi. Diverifikasi
  aman sebelum dihapus: tidak ada commit unik (`main..HEAD` kosong), dan
  perubahan uncommitted-nya hanya noise formatting prettier pada file skill
  vendor Vercel.

**Efek samping yang ketahuan saat verifikasi akhir — dan diperbaiki.**
`eslint.config.mjs` dan `.prettierignore` masih meng-ignore `.agents` (folder
yang sudah dihapus) tapi **tidak** `.claude`. Akibatnya 90 file
`.mjs`/`.ts`/`.js` skill vendor di `.claude/skills/` masuk cakupan lint &
format: `bunx eslint .` menghasilkan **17 warning** dari kode vendor, dan
`bun run format` (`prettier --write .`) akan menulis ulang file skill vendor
sehingga drift dari upstream dan hash `skills-lock.json` tidak lagi match.
Inilah penyebab tiga file `vercel-optimize/lib/gates/*` termodifikasi di kedua
stale worktree — bukan pekerjaan nyata, tapi jejak `bun run format`. CI
([`ci.yml`](../.github/workflows/ci.yml) menjalankan `bun run lint`) belum
gagal karena semuanya warning, bukan error. Perbaikan: `.agents` → `.claude/**`
di kedua ignore list, plus membersihkan entri `design/` yang sudah mati sejak
ADR-045. Setelah perbaikan: `eslint .` **0 problem** (dari 17 warning) dan
`prettier --check .` lolos seluruhnya. `lint-staged` tidak terdampak — pola-nya
terbatas pada `apps/**`, `packages/**`, dan file root non-rekursif.

**Audit paritas Claude Code ↔ Cursor (permintaan lanjutan King Rezi).**
Diverifikasi ke dokumentasi resmi Cursor: `AGENTS.md`, `.claude/skills/`, dan
`.claude/agents/` (7 subagent kerja) **terbaca di kedua tool** — dua yang
terakhir lewat compatibility path, jadi aturan ADR-063 soal delegasi subagent
tetap berlaku di Cursor. Dua aset ternyata **tidak** punya jalur
kompatibilitas:

* **Config MCP** — `.mcp.json` root adalah konvensi Claude Code, bukan bagian
  spesifikasi MCP (spec hanya mengatur protokol, bukan lokasi config client).
  Cursor hanya membaca `.cursor/mcp.json`. King Rezi memutuskan **membuat
  duplikat** `.cursor/mcp.json` agar MCP Astryx (`xds`) aktif di Cursor juga.
* **Proteksi baca secret** — `permissions.deny` di `.claude/settings.json`
  tidak dibaca Cursor sama sekali. Dibuat `.cursorignore` sebagai padanannya
  (`.env*`, `*.pem`, `credentials*.json`), lengkap dengan komentar pengingat
  sinkronisasi.

Kewajiban menjaga kedua pasang file kembar itu sinkron didokumentasikan di
section baru **"## Kompatibilitas tool: Claude Code ↔ Cursor"** pada
`AGENTS.md` (tabel paritas 6 aset + 2 aturan sinkronisasi), dan tercatat
sebagai poin 9–10 ADR-064 — termasuk alasan kenapa duplikasi di sini
**bukan** pelanggaran prinsip single-source poin 1: skill adalah konten prompt
yang bisa hidup di satu lokasi yang dibaca kedua tool, sedangkan config MCP dan
proteksi secret adalah deklarasi khusus-client.

**Terverifikasi langsung oleh King Rezi (bukan lagi asumsi dokumentasi):**
setelah `.cursor/mcp.json` dibuat, King Rezi membuka project di Cursor dan
mengonfirmasi server `xds` aktif — sesuai prediksi dari dokumentasi resmi
Cursor. Catatan risiko di ADR-064 diperbarui dari "belum diuji langsung" jadi
terkonfirmasi.

**Dokumentasi stale yang ikut dibereskan.**

* `context/ctx-development.md` — checklist masih menyebut `CHANGELOG` yang
  sudah dilebur ke `COMPLETE_TASK.md` (ADR-061); diganti sekaligus melengkapi
  urutan update `TASKS.md` + `tasks/` (ADR-062).
* `project-manager/QA_TEST_ACCOUNTS.md` — referensi `CHANGELOG.md` →
  `COMPLETE_TASK.md`.
* `context/ctx-project.md` — indeks Project OS sebelumnya **tidak menyebut
  kewajiban evaluasi delegasi subagent sama sekali**, padahal itu inti ADR-063;
  ditambahkan pointer ke `.claude/agents/README.md` + aturan operasional 2a.
  (Persis pola akar masalah ADR-063: aturan ada, tapi tidak terhubung ke jalur
  yang benar-benar dibaca AI.)
* `AGENTS.md` — section "Workflow Astryx wajib" diperbarui: config MCP kini
  menyebut kedua file.
* `PROJECT_STATE.md` — Metadata version 1.0.37 → 1.0.38; Current Focus mencatat
  `.claude/skills/` sebagai satu-satunya lokasi skill + project dikerjakan di
  dua tool.

**Catatan risiko yang diterima (detail di ADR-064).** `skills-lock.json` tidak
menyimpan install path, jadi `npx skills add/update` berikutnya tetap menulis
ke `.agents/skills/` — mitigasinya manual lewat aturan di `AGENTS.md`.
`.agents/` sengaja **tidak** di-`.gitignore` supaya folder liar tetap terlihat
di `git status`.

---

## 2026-08-04 — ADR-063: Integrasi Delegasi Subagent ke Alur Kerja Wajib

King Rezi melaporkan AI utama (Jokowi) jarang menggunakan 7 subagent kerja (`.claude/agents/`) semenjak restrukturisasi dokumentasi ADR-060–062, dan minta didiagnosis mengapa — harapannya subagent bisa mengerjakan beberapa task secara paralel.

Diagnosis (git log + perbandingan diff `SKILL.md`/`AGENTS.md` sebelum-sesudah ADR-060–062) menemukan akar masalah **struktural, bukan konten yang hilang**: panduan orkestrasi subagent (`.claude/agents/README.md`) sejak dibuat (30 Juli 2026) tidak pernah terhubung ke alur kerja operasional AI. `.agents/skills/project-os-navigator/SKILL.md` (behavior utama AI) tidak pernah menyebut subagent sama sekali baik versi lama maupun baru; subagent hanya disebut di satu section deskriptif berdiri sendiri di `AGENTS.md`. Field task di `tasks/vXX-*.md` juga tidak memetakan `Domain` ke subagent mana pun. ADR-060–062 memperparah secara relatif dengan memperpanjang cascade baca dokumen untuk task nyata tanpa satu pun titik yang mengarah ke evaluasi delegasi.

### Added

* `project-manager/decisions/ADR-063-integrasi-delegasi-subagent-ke-alur-kerja-wajib-pemetaan-domain-subagent.md`.
* `.claude/agents/README.md` — section baru "Kapan WAJIB dievaluasi" + tabel **Pemetaan Domain → Subagent** (identity/workspace/publishing/analytics → Prabowo; integration/media/notification → Elon; UI → Mark; platform/DX → biasanya tanpa subagent).

### Changed

* `AGENTS.md` — "Wajib di awal sesi" mendapat langkah baru (poin 3): evaluasi delegasi subagent berdasarkan field Domain sebelum eksekusi kode. Section "Subagent kerja" ditegaskan bukan referensi opsional.
* `.agents/skills/project-os-navigator/SKILL.md` — behavior "Pekerjaan Baru" mendapat sub-langkah 1a (evaluasi delegasi + kemungkinan paralel); cascade "Tingkat 3" ditambah pointer ke `.claude/agents/README.md` sebelum eksekusi. (Symlink `.claude/skills/project-os-navigator` ikut terupdate otomatis — sumber tunggal.)
* `project-manager/TASKS.md` — "Cara pakai" mendapat langkah baru yang sama, supaya jalur masuk manapun (AGENTS.md, SKILL.md, atau langsung TASKS.md) konsisten.
* `PROJECT_STATE.md` — Recent Decisions & Completed (Ringkasan) menambahkan ADR-063, menggeser entri terlama keluar dari daftar 5. Version 1.0.36 → 1.0.37.
* `DECISIONS.md` — tambah 1 baris indeks ADR-063 di baris paling atas.

### Fixed

* `.claude/agents/README.md` (5 lokasi: header klasifikasi, deskripsi peran Gibran, aturan orkestrasi Gibran, dan cara mencatat perubahan) — referensi mati ke `project-manager/CHANGELOG.md` (dihapus/digabung ke `COMPLETE_TASK.md` sejak ADR-061, 3 Agustus) diperbaiki, sebagian ke `COMPLETE_TASK.md`, sebagian menambah `TASKS.md`/`tasks/` yang belum tercatat sejak ADR-062. Bukti konkret dokumentasi subagent tidak ikut disinkronkan saat dua restrukturisasi berturut-turut.
* `context/ctx-project.md` — tabel "Living vs static" masih menulis `CHANGELOG.md` sebagai Living Document dan `CONVERSATIONS.md` salah diklasifikasi Living (seharusnya Append-Only per `PROJECT_RULES.md`). Diperbaiki jadi 3 tipe (Living: `PROJECT_STATE.md` + `TASKS.md`/`tasks/`; Append-Only: `DECISIONS.md`+`decisions/`, `COMPLETE_TASK.md`, `CONVERSATIONS.md`, `BRAINSTORM.md`; Static reference).
* `.claude/agents/prabowo-feature-engineer.md` (role file, chmod 444, dibuka dengan konfirmasi eksplisit King Rezi) — instruksi "serahkan ke Gibran untuk update CHANGELOG.md" diperbaiki jadi `TASKS.md`/`tasks/`/`COMPLETE_TASK.md`, lalu di-chmod 444 kembali.

### Decisions

* ADR-063 dicatat di `project-manager/decisions/ADR-063-integrasi-delegasi-subagent-ke-alur-kerja-wajib-pemetaan-domain-subagent.md`.

---

## 2026-08-04 (lanjutan) — T-011.3 & T-011 ditutup: QA browser oleh Najwa

Melanjutkan entri T-011.3 di bawah (branch `feat/t-011-3-verifikasi-redirect-terminal-action`, HEAD `d7aa837`). Bagian yang sebelumnya belum bisa diotomatiskan — editor benar-benar tertutup dan layar tujuan tampil setelah aksi terminal — sudah diverifikasi manual oleh Najwa QA Engineer via browser (tunnel ngrok, akun test Raka Pratama/Owner).

### Verification

* `bun run typecheck`/`lint`/`test` tetap hijau (45/45 test, 8 file) di titik verifikasi.
* Golden path via browser, semua **PASSED**:
  * Save as Draft dari Home (non-publish) → modal tertutup dulu → redirect `/[slug]/publish/drafts`, draft baru muncul di listing.
  * Schedule dari Engage (non-publish) → dialog konfirmasi ADR-049 tampil → setelah konfirmasi, modal tertutup → redirect `/[slug]/publish/queue`. (Queue masih placeholder — tercatat di T-032, bukan temuan baru.)
  * Edge case "sudah di destinasi" (buka New Post dari `/publish/drafts` sendiri, Save as Draft) → tetap di URL yang sama via `router.refresh()`, draft baru tetap tersimpan — sesuai `isAlreadyAtDestination`.
  * Regresi: navigasi sidebar dan CTA "+ New Post" (T-011.1/T-011.2) normal dari seluruh section yang dicoba.
* Tidak ada bug/regresi baru ditemukan. Satu catatan non-blocking: overlay hydration error dev saat akses lewat ngrok — sudah tercatat sebagai T-018, tidak menghambat fungsionalitas.

### Status

* **T-011.3** dicentang selesai di `tasks/v01-foundation.md`.
* **T-011** (Sidebar CTA "+ New Post") ditutup `✅ Done` — ketiga subtask (T-011.1, T-011.2, T-011.3) selesai dan terverifikasi. Section T-011 dirapikan jadi paragraf ringkas tanpa checklist, mengikuti konvensi task selesai di file release.
* Indeks `TASKS.md`: v0.1 8 ✅ (dari 7), Total 13 selesai (dari 12). "Fokus sekarang" dan `PROJECT_STATE.md` Top Next Tasks diperbarui — T-011 dihapus dari daftar fokus.

## 2026-08-04 — T-011.3: redirect aksi terminal dari section non-publish

PR #37 sudah di-merge King Rezi sebelum T-011.3 dikerjakan, jadi subtask ini jalan di branch baru `feat/t-011-3-verifikasi-redirect-terminal-action`.

Judul subtask menyebut "verifikasi", tapi pemeriksaan terhadap ADR-054 menemukan dua celah nyata, bukan sekadar hal yang perlu dicek:

1. Redirect Save as Draft yang ditambahkan saat tindak lanjut code review PR #37 tidak menutup editor lebih dulu — modal fullscreen tetap menutupi layar tujuan, sehingga "redirect" praktis tidak terlihat.
2. Schedule masih memakai `router.refresh()`. Dari Home/Engage/Analyze itu tidak menampilkan apa pun, padahal ADR-054 menetapkan tujuannya Publish > Queue.

### Added

* `apps/web/src/app/[slug]/_draft-editor/terminal-destination.ts` — aturan destinasi ADR-054 diekstrak jadi fungsi murni (`resolveTerminalDestination`, `isAlreadyAtDestination`). Alasannya bukan kerapian: environment Vitest project ini `node` tanpa jsdom/testing-library, jadi tanpa ekstraksi ini aturan redirect sama sekali tidak bisa diuji otomatis dan verifikasinya bergantung penuh pada uji manual sambil login.
* `apps/web/src/app/[slug]/_draft-editor/terminal-destination.test.ts` — 8 test: destinasi Save as Draft → Drafts, Schedule → Queue, slug tidak hardcode, destinasi tidak berubah mengikuti section asal, plus perilaku refresh-vs-push termasuk `pathname` `null`.

### Changed

* `apps/web/src/app/[slug]/_draft-editor/modal.tsx` — helper baru `finishTerminalAction(action)`: menutup editor (`close()`) lalu `router.push` ke tujuan, atau `router.refresh()` bila pengguna memang sudah berada di layar tujuan. Dipakai `handleSaveDraft` (→ Publish > Drafts) dan `handleConfirmSchedule` (→ Publish > Queue). Banner sukses pada kedua jalur dihapus karena editor keburu tertutup — umpan baliknya kini item yang muncul di layar tujuan, sesuai App Prototype di Claude Design. Banner error tetap ada.

### Notes

* **Penyimpangan yang disengaja:** `TASKS.md` mencatat T-031.3 (Schedule → Queue) "relevan setelah T-032", dan layar Queue memang masih placeholder. Catatan itu ditulis sebelum CTA sidebar ada. Karena ADR-054 sudah menetapkan destinasi dan mendarat di Queue lebih baik daripada tertinggal di Analyze tanpa jejak aksi, redirect ini tetap dipasang sekarang. Kalau King Rezi menilai sebaiknya menunggu T-032, bagian `handleConfirmSchedule` tinggal dikembalikan ke `router.refresh()`.
* Publish Now (T-031.4) tidak disentuh — implementasinya memang belum ada (T-029).

### Verification

* `bun run typecheck` bersih · `bun run lint` 0 error · `bun run test` **45 test / 8 file** lolos (naik dari 37/7 — 8 test baru untuk aturan destinasi).
* Aturan destinasi ADR-054 kini terverifikasi otomatis. Yang **belum** terverifikasi dan tidak bisa diotomatiskan tanpa login: bahwa editor benar-benar tertutup dan halaman tujuan benar-benar tampil setelah aksi terminal. Karena itu T-011.3 belum dicentang dan T-011 tetap 🟡 — legend `✅` mensyaratkan "selesai dan terverifikasi".

## 2026-08-04 — T-011.1: render CTA "+ New Post" di sidebar

Branch baru `feat/t-011-sidebar-cta-new-post`. Subtask pertama T-011 (ADR-053): menaruh CTA primary full-width di sidebar, tepat di bawah Workspace Selector dan di atas navigation items — supaya New Post bisa diakses dari section manapun, bukan hanya dari Publish.

Acuan: ADR-053, `04-ux/navigation-patterns.md` (NP-D01), dan Claude Design `components/navigation.html` (`<div class="sidebar-cta"><button class="btn btn-primary btn-block">＋ New Post</button></div>`, berada tepat setelah `.ws-switch` dan sebelum `.nav`).

### Changed

* `apps/web/src/app/[slug]/workspace-side-nav.tsx` — menambahkan `Button` (`variant="primary"`, `width="100%"`, ikon `＋`, label `New Post`) pada slot `topContent` milik Astryx `SideNav`. Slot ini memang didokumentasikan sebagai "Content below the header, e.g., a create button" — posisinya persis di bawah header (Workspace Selector) dan di atas `children` (nav items), dan tidak ikut ter-scroll bersama `children`, jadi tetap *pinned* saat daftar Channels (T-012) nanti memanjang.

### Notes

* Tombol belum punya handler klik — wiring ke `DraftEditorProvider` adalah T-011.2. Saat ini provider hanya dipasang di `apps/web/src/app/[slug]/publish/layout.tsx`, sehingga belum bisa dipanggil dari section lain; itu justru inti pekerjaan T-011.2.

### Verification

* `bun run typecheck` bersih · `bun run lint` 0 error (85 warning, seluruhnya dari `.claude/worktrees/**`, pre-existing).
* Verifikasi visual di browser **belum dilakukan** — sidebar hanya tampil setelah login, dan AI tidak memasukkan kredensial. Perlu dicek King Rezi saat login.

## 2026-08-04 — T-011.2: Draft Editor bisa dibuka dari section manapun

Lanjutan langsung dari T-011.1 di branch yang sama (PR #37). Sebelumnya `DraftEditorProvider` hanya dipasang di `apps/web/src/app/[slug]/publish/layout.tsx`, jadi CTA di sidebar (yang hidup di `[slug]/layout.tsx`, satu level di atasnya) tidak mungkin memanggilnya.

### Changed

* **Folder `_draft-editor/` dipindahkan** dari `apps/web/src/app/[slug]/publish/_draft-editor/` ke `apps/web/src/app/[slug]/_draft-editor/` (`git mv`, 4 file: `actions.ts`, `context.tsx`, `modal.tsx`, `status-badge.ts`). Alasannya: Draft Editor sekarang bukan lagi milik section Publish — ia dipakai lintas section. Seluruh import internalnya memakai alias `@/`, jadi isi file tidak perlu diubah.
* `apps/web/src/app/[slug]/layout.tsx` — membungkus `AppShell` dengan `DraftEditorProvider` dan merender `DraftEditorModal` di level workspace.
* `apps/web/src/app/[slug]/publish/layout.tsx` — provider dan modal dilepas; tinggal `VStack` + `PublishTabbar`.
* `apps/web/src/app/[slug]/workspace-side-nav.tsx` — CTA memanggil `openNewPost()` dari `useDraftEditor()`.
* `apps/web/src/app/[slug]/publish/drafts/drafts-list.tsx` — path import disesuaikan (`../` → `../../`).
* `apps/web/src/domains/publishing/content-format-matrix.ts` — komentar penunjuk path `modal.tsx` diperbarui.

### Verification

* `bun run typecheck` bersih · `bun run lint` 0 error · `bun run test` 37 test / 7 file lolos.
* `bun run build` sukses — seluruh route ter-compile, termasuk `[slug]` dan `publish/*`. Ini yang memastikan pemindahan folder tidak meninggalkan import menggantung.
* Catatan: log dev server sempat memuat error `Module not found` dan `useDraftEditor must be used within DraftEditorProvider`. Keduanya artefak HMR saat file dipindah/diedit sebagian, bukan bug — build bersih setelahnya. Kalau tab dev King Rezi masih menampilkan error itu, cukup hard reload.
* Verifikasi visual (klik CTA dari Home/Engage/Analyze → modal terbuka) **belum dilakukan** — butuh login.

## 2026-08-04 — T-010 tuntas: persistensi cookie (T-010.2) + sync Claude Design (T-010.3)

King Rezi memilih menyelesaikan T-010.2 lebih dulu sebelum masuk ke implementasi navbar (T-011/T-012), supaya acuan tema stabil. Sebelumnya tema selalu reset ke Light setiap full reload — disengaja, menunggu subtask ini.

Mekanisme sesuai keputusan 2026-07-31: **Cookie**, bukan localStorage, supaya RSC bisa membaca preferensi sebelum render pertama (menghilangkan flash tema salah), konsisten dengan pola session cookie Better Auth.

### Added

* `apps/web/src/lib/theme/theme-cookie.ts` — konstanta `THEME_COOKIE_NAME` (`theme`), `THEME_COOKIE_MAX_AGE` (1 tahun), `DEFAULT_THEME_MODE` (`light`), tipe `ThemeMode`, dan `parseThemeMode()` yang menjatuhkan nilai tak dikenal ke default.
* `apps/web/src/lib/theme/theme-cookie.test.ts` — 2 test untuk `parseThemeMode` (nilai valid + fallback `undefined`/`null`/`""`/`"Dark"`/`"bogus"`).

### Changed

* `apps/web/src/app/layout.tsx` — jadi `async`, membaca cookie `theme` lewat `cookies()` dari `next/headers` dan meneruskannya sebagai `initialMode` ke `Providers`.
* `apps/web/src/app/providers.tsx` — `Providers` menerima prop `initialMode` (default `light`) sebagai state awal; `toggleMode` menulis cookie `theme` (non-httpOnly, `path=/`, `max-age` 1 tahun, `SameSite=Lax`) lewat `document.cookie`. Komentar lama "default is always light … for the current session" diganti penjelasan sumber `initialMode`.

### Verification

* `bun run typecheck` bersih · `bun run lint` 0 error · `bun run test` 37 test / 7 file lolos.
* Browser (dev server yang sudah berjalan di `localhost:3000`): cookie `theme=dark` → reload → `data-theme="dark"` **ada di HTML respons server**, bukan ditambal client — inilah bukti tidak ada flash. Arah sebaliknya (`theme=light`) dan cookie tak valid (`bogus` → Light) juga terverifikasi. Console bersih, tanpa hydration mismatch.
* Batas verifikasi: toggle-nya sendiri ada di sidebar footer yang butuh login, jadi jalur "klik toggle → cookie tertulis" belum diuji lewat UI — hanya kode dan sisi baca-nya yang terverifikasi. Perlu dicek King Rezi saat login.

### Notes

* Root layout kini dynamic karena memanggil `cookies()`. Dampaknya nihil — seluruh route sudah dynamic lewat session Better Auth.

### T-010.3 — sync toggle ke Claude Design (`components/navigation.html`)

Rencana asli task ini "push file hasil edit dari scratchpad sesi Neymar apa adanya" **dibatalkan setelah verifikasi** — kalau dijalankan, justru akan merusak pekerjaan King Rezi.

Temuan saat membandingkan tiga versi file:

| Versi | Toggle 🌙 | Channels |
| --- | --- | --- |
| Scratchpad A (31 Jul 11:05) | ada | 0 baris |
| Scratchpad B (31 Jul 16:48) | tidak ada | 3 baris |
| **Remote Claude Design** | tidak ada | **5 baris** (+ TikTok, Pinterest) |

Remote ternyata **lebih baru** dari kedua scratchpad — King Rezi mengonfirmasi langsung di sesi ini bahwa perbaikan Channels (termasuk TikTok/Pinterest dan posisi tombol "+") dikerjakan sendiri oleh King Rezi. Push file B apa adanya akan menghapus dua channel itu.

Yang dilakukan sebagai gantinya — perubahan minimal di atas isi remote:

* Menambah **satu baris** tombol toggle di `sidebar-footer`, di antara bel notifikasi dan menu akun, dengan markup identik dengan yang sudah live di `templates/` (`data-proto="theme-toggle"`, `aria-label="Ganti ke Dark Mode"`, `margin-left:auto` pindah ke tombol toggle).
* File dibangun **secara mekanis** lewat script, bukan diketik ulang, supaya nol risiko salah transkripsi path SVG milik King Rezi. Indentasi baris TikTok/Pinterest direproduksi persis seperti remote agar diff benar-benar hanya satu baris.
* Tidak menyertakan script wiring toggle — `components/navigation.html` adalah kartu showcase statis (tombol 🔔 dan akun juga tidak interaktif di sana), berbeda dari `templates/` yang memang prototipe interaktif. Ini mengikuti versi Neymar sendiri untuk file yang sama.
* `styles.css` dan seluruh file lain **tidak disentuh**.

Verifikasi: read-back setelah push mengonfirmasi kelima channel utuh beserta count/status/drag-handle/tombol "+", note tidak berubah, dan toggle berada di posisi yang benar.

Koreksi dalam sesi ini: push pertama tanpa sengaja menggeser indentasi tag `<div class="channels">` dan penutupnya sejauh 4 spasi (whitespace, tanpa efek visual). Terdeteksi saat read-back, langsung diperbaiki dan di-push ulang.

### Notes tambahan

* Klaim dokumen bahwa "file hasil edit sudah lengkap di scratchpad" ternyata menyesatkan — file itu justru tertinggal dari remote. Pelajaran: verifikasi kondisi remote dulu sebelum push, jangan percaya deskripsi task begitu saja.
* T-010 kini **✅ Done** seluruhnya.

---

## 2026-08-04 — ADR-062: Backlog Task Berjenjang per Release

King Rezi minta perencanaan task yang matang dari awal pengerjaan sampai task terakhir, dikelompokkan dan bersubtask, serta rapi dibaca baik oleh AI maupun manusia. Section `Next Tasks` di `PROJECT_STATE.md` sebelumnya flat list ~15 bullet prosa panjang tanpa hierarki, tanpa ID, tanpa dependency, dan sebagian terduplikasi dengan `Known Issues`.

Keputusan diambil lewat 5 pertanyaan terstruktur ke King Rezi: struktur file (folder + indeks), kerangka grup (per release `v0.x`), lokasi status (amandemen aturan #10), granularitas subtask (satu subtask = satu unit kerja), dan kedalaman (rolling wave).

Status faktual tiap task diverifikasi lewat inventarisasi kode `apps/web` — bukan dari `COMPLETE_TASK.md` (tetap tidak dibaca).

### Added

* `project-manager/TASKS.md` — indeks backlog: protokol baca untuk AI, legend status (⏳ 🟡 ✅ 🚫 ⏸️), aturan ID, indeks 7 release, fokus sekarang, daftar keputusan terbuka, aturan maintenance.
* `project-manager/tasks/` — 7 file release: `v01-foundation.md`, `v02-publishing-mvp.md`, `v03-analytics-mvp.md`, `v04-engagement-mvp.md`, `v05-ai-assistant-mvp.md`, `v06-start-page-mvp.md`, `v10-public-launch.md`.
* Total **67 task** (`T-001`–`T-088`, ID global tanpa kode release) dan **127 subtask** terdefinisi untuk v0.1–v0.3. Setiap task membawa field Status, Domain, ADR, Depends, dan **Baca dulu** (daftar bacaan baseline minimal).
* ADR-062 di `project-manager/decisions/ADR-062-backlog-task-berjenjang-per-release-amandemen-aturan-status.md`.

### Changed

* `PROJECT_STATE.md` — section `Next Tasks` (69 baris prosa) diringkas jadi tabel pointer 5 baris + rantai blocker + daftar keputusan terbuka; `Snapshot` dan `In Progress` memakai ID task; `Known Issues` diberi referensi ID task dan detailnya tidak lagi diduplikasi. Version 1.0.35 → 1.0.36.
* `PROJECT_RULES.md` — `TASKS.md` + `tasks/` diklasifikasikan **Living Document** (sebelumnya hanya `PROJECT_STATE.md`); Formatting Rules diberi pengecualian sempit untuk status per-task; guardrail ukuran ditambah aturan `TASKS.md` ≤ ~150 baris dan task `✅ Done` diringkas tanpa checklist.
* `AGENTS.md` — tabel Source of Truth dipisah (status/phase vs backlog task); aturan keras #10 diamandemen dengan pengecualian ADR-062; "Wajib di awal sesi" menambah langkah baca `TASKS.md`; "Setelah mengubah sesuatu" menegaskan update dua tempat (file release + indeks).
* `project-os-navigator/SKILL.md` — cascade Tingkat 2 & 3 memasukkan `TASKS.md`/`tasks/`; behavior "Pekerjaan Baru" menambah langkah update backlog; File Map dan Aturan Context diperbarui. (Catatan: `.claude/skills/project-os-navigator` adalah **symlink direktori** ke `.agents/skills/project-os-navigator` — dilacak git sebagai symlink, jadi sumbernya tunggal dan tidak ada risiko desync.)

### Fixed

* `PROJECT_STATE.md` — inkonsistensi internal: `Known Issues` menyatakan persistensi tema Light/Dark "belum diputuskan", padahal `Next Tasks` di file yang sama sudah mencatat keputusan **Cookie** per 2026-07-31. Diperbaiki jadi "sudah diputuskan, belum diimplementasikan" (T-010.2).
* `PROJECT_STATE.md` — Known Issue stale dihapus: "Belum ada commit awal. Repo sudah `git init`; working tree belum di-commit". Faktanya repo sudah punya 136 commit dan PR #34 ter-merge. Entri `(Opsional) initial git commit` di `Next Tasks` juga hilang bersama restrukturisasi section itu.

### Fixed — hasil code review atas PR #35 (14 temuan, semua diterapkan)

* **`.claude/agents/gibran-project-manager.md`** (Static Reference, diubah atas permintaan eksplisit King Rezi; chmod 444 dipulihkan) — aturan governance-nya masih memuat larangan yang persis dibatalkan ADR-062 ("`PROJECT_STATE.md` SATU-SATUNYA tempat status"), sehingga Gibran akan menulis balik detail task ke `Next Tasks` dan tidak pernah menyentuh `TASKS.md`. Ditambah pengecualian ADR-062, urutan update 4 langkah (tasks → TASKS.md → PROJECT_STATE → COMPLETE_TASK), dan referensi `CHANGELOG.md` yang stale sejak ADR-061 diganti `COMPLETE_TASK.md`.
* **Dependency lintas rilis dibuat eksplisit** — empat task v0.1 (T-012, T-013, T-015, T-016) punya subtask yang bergantung pada task v0.2 (T-025, T-026, T-036), sehingga v0.1 tidak bisa ditutup sebelum v0.2 berjalan. Ditandai di field `Depends` masing-masing task, di Catatan Rilis v0.1, dan sebagai peringatan di `TASKS.md`. Definisi "Foundation selesai" diperbaiki.
* **Duplikasi daftar fokus dihapus** — sebelumnya 3 tempat dengan 2 isi berbeda (Snapshot 4 task, tabel `Next Tasks` 5 task, `TASKS.md` 4 task). Sekarang `TASKS.md` → **Fokus sekarang** jadi satu-satunya daftar (5 task); tabel di `Next Tasks` dihapus, Snapshot hanya menyalin ID.
* **T-019 baru** — task API mobile ADR-043 (`/api/v1` + Better Auth Bearer plugin) dipulihkan sebagai task ber-ID di v0.1; sebelumnya turun jadi catatan prosa tanpa ID di dalam bullet "di luar MVP" v1.0, padahal urgensinya eksplisit "mendahului M8 web berjalan jauh".
* **T-037 baru** — task memperkaya `context/ctx-development.md` dipulihkan sebagai task ber-ID di v0.2; sebelumnya hilang tanpa ID maupun penanda `⏸️ Deferred`.
* **Tanggal diperbaiki 2026-08-03 → 2026-08-04** di ADR-062, baris indeks `DECISIONS.md`, entri `COMPLETE_TASK.md` ini, dan `Last Updated` `PROJECT_STATE.md` — ketiga yang pertama Append-Only, jadi diperbaiki sebelum merge.
* **Peta release ↔ milestone ditambahkan** di `TASKS.md`: M8 = v0.1–v0.6, M9 = v1.0. Sebelumnya tidak ada dokumen yang memetakan keduanya, sehingga aturan "hindari implementasi di luar milestone aktif" tidak bisa dievaluasi untuk task di rilis jauh.
* **Pointer DO-D06 diperbaiki** — T-017 mengarah ke `05-architecture/database-strategy.md` padahal DO-D06 ada di `06-engineering/database-orm.md`.
* **Jalur masuk paralel diperbarui** — `context/ctx-project.md`, `context/README.md`, `project-manager/README.md`, dan `DEVELOPER_WORKFLOW.md` sebelumnya tidak menyebut `TASKS.md`/`tasks/` dan masih menyatakan `PROJECT_STATE.md` sebagai tempat next task.
* **Definition of Done `PROJECT_RULES.md`** ditambah syarat status task + hitungan indeks sudah cocok.
* **`Completed (Ringkasan)` dirotasi kembali ke 5 item** (sebelumnya 6 di bawah header "~5 item terakhir").
* **Detail spesifikasi yang tercecer dipulihkan** — subset `react-icons/fa6` (T-012.3/T-012.4) dan posisi CTA "di bawah Workspace Selector, di atas navigation items" (T-011.1).

Hasil akhir backlog: **69 task · 134 subtask · 11 selesai** (dari 67/127/11).

---

## 2026-08-03 — ADR-061: Konsolidasi CHANGELOG jadi COMPLETE_TASK.md

Susulan dari ADR-060: King Rezi minta `CHANGELOG.md` (root, entri M8+) dan arsip `changelog/CHANGELOG-pre-M8.md` digabung kembali jadi satu file historis tunggal, diberi peringatan keras larangan baca proaktif oleh AI.

### Added

* `project-manager/COMPLETE_TASK.md` — gabungan `CHANGELOG.md` + `changelog/CHANGELOG-pre-M8.md` (3.164 baris), reverse-chronological, dengan banner peringatan keras di kepala file.
* ADR-061 di `project-manager/decisions/ADR-061-konsolidasi-changelog-jadi-complete-task.md`.

### Changed

* Seluruh referensi `CHANGELOG.md`/`changelog/` di `PROJECT_RULES.md`, `README.md`, `.agents/skills/project-os-navigator/SKILL.md`, `AGENTS.md`, `DEVELOPER_WORKFLOW.md`, `PROJECT_STATE.md` diperbarui ke `COMPLETE_TASK.md`.
* `PROJECT_RULES.md` — guardrail rotasi milestone untuk `CHANGELOG.md` dicabut (tidak relevan lagi untuk file yang sengaja tidak dibaca AI secara rutin).

### Removed

* `project-manager/CHANGELOG.md` (root) dan folder `project-manager/changelog/` — digabung ke `COMPLETE_TASK.md`.

### Decisions

* ADR-061 dicatat di `project-manager/decisions/ADR-061-konsolidasi-changelog-jadi-complete-task.md`.

---

## 2026-08-03 — ADR-060: Dokumentasi Efficiency Restructuring

King Rezi resah `PROJECT_STATE.md` terlalu panjang dan khawatir AI membaca seluruh isinya untuk pertanyaan sederhana — audit menemukan `DECISIONS.md` (149 KB, wajib dibaca penuh oleh skill navigator) sebagai kontributor pemborosan token terbesar, plus duplikasi nyata antara "Completed"/"Recent Decisions" di `PROJECT_STATE.md` dengan `CHANGELOG.md`/`DECISIONS.md`.

### Added

* `project-manager/decisions/` — 59 ADR lama (ADR-001–059) dipecah jadi satu file per ADR (`ADR-XXX-slug.md`), diekstrak otomatis via script dengan self-check byte-for-byte (tidak ada teks yang hilang/berubah) — plus `ADR-060-dokumentasi-efficiency-restructuring.md` (ADR ini sendiri).
* `project-manager/changelog/CHANGELOG-pre-M8.md` — arsip 1.391 baris entri CHANGELOG pra-M8 (M0–M7).
* Section **Snapshot** baru di paling atas `PROJECT_STATE.md` (~20 baris: phase/milestone, active mode, top next tasks, top blocker).
* Section **Guardrail Ukuran Dokumen** baru di `PROJECT_RULES.md` — rolling window ≤10 item untuk ringkasan `PROJECT_STATE.md`, rotasi `CHANGELOG.md` maksimal milestone aktif + 1 sebelumnya, dicek tiap Definition of Done milestone.

### Changed

* `DECISIONS.md`: 3.564 → 69 baris — isi sekarang indeks ringkas (tabel ADR#/Title/Status/Date/Ringkasan/link file, terbaru-di-atas), full text ADR pindah ke `decisions/`.
* `PROJECT_STATE.md`: 928 → ~260 baris — heading dirapikan jadi `##` konsisten, section "Completed"/"Recent Decisions" dipangkas ke 5 item terakhir + pointer ke `CHANGELOG.md`/`DECISIONS.md` (isi lengkap tidak hilang).
* `CHANGELOG.md`: 3.135 → 1.746 baris (root) — entri pra-M8 pindah ke arsip, root kini fokus ke milestone aktif.
* `.agents/skills/project-os-navigator/SKILL.md` — "Langkah Pertama: Load Context" diubah dari wajib-baca-4-file-penuh jadi cascade 3 tingkat (fakta cepat → snapshot status → baca penuh khusus task nyata); instruksi pembuatan ADR baru di mode "Planning Change" diperbarui ke konvensi per-file.
* `PROJECT_RULES.md` — Document Type Classification: `decisions/ADR-*.md` dan `changelog/CHANGELOG-*.md` ditambahkan sebagai Append-Only.
* `project-manager/README.md` — folder structure & Core Documents table disesuaikan dengan struktur baru.

### Decisions

* ADR-060 dicatat di `project-manager/decisions/ADR-060-dokumentasi-efficiency-restructuring.md`.

---

## 2026-08-03 — ADR-059: Fake OutstandAdapter — persistensi nyata "Schedule" tanpa kredensial Outstand asli

King Rezi belum punya `OUTSTAND_API_KEY`/`OUTSTAND_WEBHOOK_SECRET` asli dari
Outstand, sehingga integrasi publishing sungguhan (ADR-040) tertahan. Next
Tasks direorder: Fake/mock `OutstandAdapter` dibangun dulu supaya fitur
"Schedule" di Draft Editor bisa lanjut dikerjakan dan diuji tanpa menunggu
kredensial asli. Alur: Elon Backend Engineer → Prabowo Feature Engineer →
Najwa QA Engineer → Ridwan Architecture Reviewer, plus 1 siklus fix bug —
semua lolos verifikasi.

### Added

* `DECISIONS.md` — **ADR-059**: scope hanya method Publishing (`schedulePost`,
  Engagement/Analytics/`connectAccount` OAuth di luar scope, YAGNI);
  fidelitas instant always-success (tanpa simulasi delay/webhook/skenario
  gagal); switch mechanism auto-detect dari env (`getOutstandAdapter()`
  memakai Fake kalau `OUTSTAND_API_KEY` kosong, throw error jelas — bukan
  silent fallback — kalau env terisi tapi real adapter belum ada kodenya);
  `IOutstandAdapter` didefinisikan di domain `publishing` dulu (satu-satunya
  pemakai saat ini); precedent arsitektur baru — `SchedulePostsUseCase`
  terpisah dari `PublishingService` untuk operasi yang butuh dependency
  tambahan (`IOutstandAdapter`) di luar `IPublishingRepository`, supaya
  constructor tetap type-safe; guard ownership `connectedAccountId` vs
  `workspaceId` ditegakkan di level repository (transaksi Prisma), bukan
  cuma Server Action.
* `IOutstandAdapter` / `FakeOutstandAdapter` / `getOutstandAdapter()` factory
  (`domains/publishing/adapters/`, `lib/adapters/outstand/`).
* `SchedulePostsUseCase`
  (`domains/publishing/services/schedule-posts.use-case.ts`) — validasi
  format ADR-039 server-side (`content-format-matrix.ts`, sebelumnya cuma
  ada di client), persist post+target (status transition draft/
  ready_to_schedule → scheduled), panggil adapter per target dengan outcome
  per-target (try/catch individual, tidak all-or-nothing).
* Guard ownership + guard status atomik baru di
  `IPublishingRepository.schedulePost` (transaksi Prisma, rollback total
  bila salah satu guard gagal).
* `WorkspaceService.listConnectedAccounts` — query real
  `WorkspaceConnectedAccount`, dipakai Draft Editor Account Selector
  (menggantikan `MOCK_ACCOUNTS` hardcoded) — sekaligus partial-progress
  prasyarat Sidebar "Channels" (ADR-058).
* Seed script manual `apps/web/prisma/seed-connected-accounts.ts` — 2 akun
  mock (Instagram/Facebook) untuk dev/QA tanpa OAuth asli.

### Changed

* `OUTSTAND_API_KEY`/`OUTSTAND_WEBHOOK_SECRET` di `env.ts` diubah dari
  required jadi optional.
* Draft Editor "Schedule" button kini benar-benar persist ke database
  (bukan mock notice client-side lagi) — diverifikasi end-to-end sampai row
  `publishing_posts`/`publishing_post_targets` di Supabase (`outstandJobId`
  format `fake-<uuid>`).

### Fixed

* Dialog "Konfirmasi Jadwal" di `modal.tsx` sempat tidak bisa terbuka — root
  cause: Astryx melarang nested Dialog (dialog konfirmasi bersarang di
  dalam Dialog fullscreen New Post/Edit Draft). Diperbaiki jadi satu Dialog
  dengan step konfirmasi inline (state `isConfirmStep`).

### Notes

* Diverifikasi: `bun run typecheck/lint/test` hijau di setiap tahap (31 test
  lolos), browser E2E via ngrok (akun test Raka Pratama, workspace
  "insvire"), review arsitektur Ridwan (2 temuan awal — IDOR + type-safety
  constructor — sudah ditutup dan di-re-check, tidak ada temuan baru).
* Tidak termasuk scope ini, tetap di Next Tasks: `publishNow`/
  `cancelSchedule` (ADR-047/ADR-049), `PublishingQueueSlot`, Engagement/
  Analytics di `IOutstandAdapter`, media upload trio, dan implementasi UI
  Sidebar "Channels" (ADR-058) — prasyarat `listConnectedAccounts`-nya saja
  yang terpenuhi lewat entri ini.
* `PROJECT_STATE.md` diperbarui: entri baru di Completed, baris "Publishing
  MVP — sisa persistensi nyata: sambungkan Schedule..." dihapus dari In
  Progress dan Next Tasks (sudah selesai), catatan prasyarat
  `listConnectedAccounts` di baris Sidebar Channels (ADR-058) diperbarui.

---

## 2026-07-31 — Claude Design: fix Content Format Selector hilang di New Post + tambah akun mock TikTok & Pinterest (catch-up ADR-037/ADR-039)

Dikerjakan langsung dari sesi utama (bukan subagent Neymar) karena
keterbatasan teknis `DesignSync` tidak bisa dimuat di sesi subagent. Dua
perubahan terpisah, keduanya murni di project Claude Design ("Social Media
Management"), **bukan** di kode `apps/web`. Tidak ada ADR baru — TikTok &
Pinterest sudah lebih dulu resmi jadi bagian baseline produk lewat ADR-037
(daftar 8 platform resmi) dan ADR-039 (matriks Content Format per platform,
termasuk aturan TikTok Post-only dan Pinterest pin+metadata); pekerjaan ini
murni menyusulkan (catch-up) visual Claude Design mengikuti keputusan yang
sudah ada di kedua ADR tersebut.

### Fixed

* `templates/app-prototype/AppPrototype.dc.html` (`buildDraftEditorMarkup`)
  — cabang "New Post" (create) ternyata tidak menampilkan `.fmt-row` (radio
  Post/Reel/Story) untuk akun Instagram & Facebook, padahal cabang "Edit
  Draft" sudah benar dan dokumentasi internal `templates/draft-editor.html`
  sendiri menyatakan New Post seharusnya identik dengan Edit Draft (cuma
  kosong). New Post sekarang juga punya `.fmt-row`, default radio "Post"
  terpilih untuk Instagram & Facebook (bukan "Reel" seperti contoh Edit
  Draft, karena New Post tidak merepresentasikan draft yang sudah ada).
  State Edit Draft tidak diubah sama sekali.

### Added

* Akun mock TikTok & Pinterest (status Active/Connected) ditambahkan atas
  permintaan eksplisit King Rezi ("tambahkan juga tiktok dan pinterest pada
  Design System agar lebih banyak", scope dikonfirmasi "semua tempat" lewat
  `AskUserQuestion`):
  * Sidebar "Channels" — 7 file screen template: `templates/home.html`,
    `templates/publish-calendar.html`, `templates/publish-queue.html`,
    `templates/publish-drafts.html`, `templates/engage-inbox.html`,
    `templates/analyze-dashboard.html`,
    `templates/settings-connected-accounts.html`. `templates/
    draft-editor.html` sengaja tidak disentuh untuk bagian ini — tidak
    punya sidebar sendiri (hanya dialog Draft Editor).
  * `templates/settings-connected-accounts.html` — 2 baris baru di card
    utama Connected Accounts.
  * Draft Editor "Akun Tujuan" (`templates/draft-editor.html` dan
    `templates/app-prototype/AppPrototype.dc.html`, kedua state New Post &
    Edit Draft): TikTok = checkbox saja tanpa format selector (ADR-039,
    TikTok Post-only, tanpa selector Reel/Story); Pinterest = checkbox + 3
    field baru (Title/Destination link/Board) menggantikan format
    selector, sesuai ADR-039 poin 2 (Pinterest = pin + metadata).
  * `styles.css` — class baru `.pin-fields` untuk styling field Pinterest,
    konsisten dengan pola `.fmt-row` yang sudah ada. Tidak ada token/warna
    baru di luar itu.
  * Detail mock: warna TikTok `#0d1013` (reuse dari mock Home/Calendar/
    Queue sebelumnya), warna Pinterest `#e60023` (brand red resmi). Ikon
    SVG dari paket resmi Font Awesome Free (fa-tiktok, fa-pinterest).

### Notes

* Sengaja di luar scope, tidak diubah: dialog konfirmasi Schedule/Publish
  Now di `AppPrototype.dc.html` (`openScheduleDialog`/
  `openPublishNowDialog`) masih hardcode hanya menampilkan ringkasan
  Instagram & Facebook — tidak diperluas untuk TikTok/Pinterest karena
  keduanya default unchecked (tidak pernah masuk ke dialog itu), konsisten
  dengan behavior sebelumnya.
* Implementasi kode `apps/web` untuk Channels TikTok/Pinterest tetap
  mengikuti scope Next Tasks ADR-058 yang sudah ada (belum berjalan) —
  entri ini tidak menambah task kode baru, murni menyusulkan mock Claude
  Design.

---

## 2026-07-31 — ADR-058 addendum: restyle avatar Channels + override no-shift → shift-on-hover

Sesi kedua di tanggal yang sama, melanjutkan pekerjaan Claude Design ADR-058
sebelumnya. King Rezi menunjukkan screenshot aplikasi lain sebagai referensi
dan meminta dua perubahan visual/interaksi, plus satu catatan terbuka soal
micro-offset tombol "+" yang belum final.

### Added

* `DECISIONS.md` — **ADR-058, addendum poin 10** (bukan ADR baru terpisah,
  masih amandemen keputusan yang sama hari itu). Mendokumentasikan:
  - Restyle leading element baris default Channels: logo platform polos
    (flat square icon) → avatar bulat (placeholder inisial, treatment
    sama seperti `.ws-avatar`) dengan badge kecil logo brand platform
    (react-icons/fa6, warna brand tidak berubah) di-overlay di pojok
    kanan-bawah avatar (konvensi story-ring badge). Badge count
    scheduled-posts di kanan baris tidak berubah.
  - **Override eksplisit poin 5 ("no-shift hover") → "shift-on-hover"**
    untuk drag-handle: drag-handle kini muncul di paling kiri baris (di
    luar avatar, bukan lagi di ruang cadangan permanen), dan saat hover
    seluruh isi baris (avatar+badge+nama) ikut bergeser ke kanan
    (`margin-left` animasi). Alasan: permintaan eksplisit King Rezi
    setelah melihat referensi screenshot aplikasi lain — bukan lagi
    dianggap masalah interaksi seperti alasan poin 5 sebelumnya. Swap
    count↔tombol quick-compose "+" di sisi kanan baris **tidak berubah**
    — tetap no-shift/fixed-slot.
  - Catatan micro-adjustment tombol "+" (`.channel-add`, `top: 1px; left:
    -1px` menimpa `inset: 0` untuk sisi itu) masih dikonfirmasi King Rezi
    sebagai "kurang pas", tapi sengaja tidak diiterasi lagi di Claude
    Design sekarang — akan disesuaikan sendiri saat implementasi kode
    `apps/web`. Dicatat sebagai known imperfection, bukan final.
* `navigation-patterns.md` — section "Channels (Sidebar)" (diagram + isi
  baris + state hover) dan baris NP-D14 di Decision Log diperbarui: bahasa
  "no-shift" untuk drag-handle diganti "shift-on-hover" (dengan penjelasan
  override), sementara swap count↔"+" tetap ditandai no-shift/fixed-slot.
  Isi baris juga diperbarui menyebut avatar+badge overlay, bukan lagi
  logo platform polos.
* `PROJECT_STATE.md` — bullet Completed ADR-058 dan Recent Decisions
  diperbarui untuk mencerminkan restyle avatar + override shift-on-hover;
  Next Tasks (implementasi kode `apps/web` untuk Channels) ditambahkan
  catatan terbuka bahwa posisi pixel tombol "+" belum final — jangan
  disalin sebagai source of truth pasti saat coding nanti.

### Implementasi

* Masih visual-only di Claude Design (7 layar KSP bersidebar +
  `components/navigation.html` + App Prototype yang iframe ke template
  yang sama). **Implementasi kode `apps/web` untuk Channels tetap belum
  berjalan** — menyusul di siklus implementasi berikutnya.

---

## 2026-07-31 — ADR-058: Sidebar "Channels" — quick-glance daftar akun terhubung

King Rezi meminta section baru di sidebar untuk melihat status akun media
sosial terhubung sekilas + jalan pintas compose per akun. Dikerjakan
visual-first di Claude Design (bukan langsung ke kode), lewat beberapa
putaran revisi (icon vs teks nama, sumber ikon Lucide vs react-icons,
no-shift hover) sebelum bentuk finalnya dikunci ke baseline.

### Added

* `DECISIONS.md` — **ADR-058**. Section "Channels" ditambahkan di sidebar,
  posisi antara 5 navigation item dan zona bawah (Notifications/Theme/
  Avatar), scrollable independen. Tiap baris: logo brand platform +
  nama akun/handle + status badge (reuse Badge KSP-08). Default: badge
  scheduled-posts count. Hover: drag handle (reorder personal per user) +
  tombol quick-compose "+" (buka Draft Editor, akun pre-selected) — ruang
  keduanya dicadangkan permanen supaya tidak menggeser konten saat hover.
  Icon brand pakai `react-icons` (fa6 set), dipilih setelah dikonfirmasi
  `lucide-react` tidak menyediakan logo media sosial.
* `navigation-patterns.md` — NP-D14 di Decision Log; section baru
  "Channels (Sidebar)"; pola baru "Quick Compose dari Channels Sidebar";
  update diagram sidebar (overview + detail); perluasan pola "Status
  Indicator → Settings" untuk mencakup klik channel bermasalah; 2 baris
  baru di tabel Ringkasan Pola.
* `key-screen-patterns.md` — Entry Points KSP-05 (Quick Compose dari
  Channels) dan KSP-08 (klik channel bermasalah di sidebar) diperluas;
  catatan di KSP-08 menegaskan Channels sidebar bukan pengganti layar
  Connected Accounts.

### Implementasi

* Claude Design: 7 layar KSP (semua yang punya sidebar) + swatch komponen
  `components/navigation.html` sudah menampilkan Channels sesuai desain
  final. **Implementasi kode `apps/web` belum berjalan** — menyusul di
  siklus implementasi berikutnya (lihat PROJECT_STATE Next Tasks).
* **Addendum (revisi lanjutan hari sama, ADR-058 poin 9):** status badge
  (Active/Disconnected) diperbaiki dari full-width (bertabrakan visual
  dengan tombol "+" saat hover) menjadi hug-content (`align-self:
  flex-start`). Tombol "+" quick-compose diberi wiring nyata di
  `AppPrototype.dc.html` — klik membuka Draft Editor dengan akun channel
  tersebut otomatis ter-checklist, sengaja skip pengecekan Resume
  Unfinished Post karena entry point ini terikat akun tertentu. Ditemukan
  lagi: hover tombol "+" (`.icon-btn:hover`) menumpuk overlay kedua di atas
  overlay hover baris (`.channel-row:hover`) — diperbaiki dengan
  `.channel-add:hover { background-image: none; }` supaya cuma ada satu
  highlight bersih per baris. Masih terlihat "menabrak" di screenshot
  review berikutnya — diperkecil lagi ke 16×16px (lebih kecil dari size
  token IconButton terkecil Astryx), glyph diganti dari "＋" fullwidth ke
  "+" biasa pada 10px, sesuai permintaan eksplisit King Rezi.
* Follow-up belum diputuskan: skema tabel reorder personal per user (baru,
  terpisah dari `WorkspaceConnectedAccount`), query scheduled-posts count
  lintas domain, dan status `react-icons` sebagai dependency runtime kalau
  fitur ini lanjut ke kode (saat ini baru dipakai sebagai sumber ekstraksi
  SVG statis di Claude Design, bukan dependency `apps/web`).

---

## 2026-07-31 — ADR-057: Tidak ada designer eksternal, permanen (amandemen ADR-038, ADR-041)

Kelanjutan diskusi ADR-056 (sync docs ↔ Claude Design): King Rezi
mengonfirmasi project ini tidak akan pernah merekrut/menunggu designer
eksternal — peran "desainer" digantikan permanen oleh King Rezi sendiri
lewat project Claude Design.

### Added

* `DECISIONS.md` — **ADR-057**. Menghapus gerbang "designer masuk" sebagai
  syarat lock token (amandemen ADR-038 DT-D02, ADR-041 poin 2 & 7). Status
  field ADR-038 dan ADR-041 ditandai "Amended by ADR-057".

### Changed

Menghapus/menyesuaikan bahasa "designer masuk"/"designer aktif"/"designer
join" yang masih berupa kalimat aktif (bukan catatan historis) di 7 file:

* `product-discovery/06-engineering/design-tokens.md` — header, metadata,
  panduan lock, DT-D02/DT-D03, diagram mapping implementasi, Related Documents.
* `product-discovery/06-engineering/README.md` — 2 spot (Design Tokens summary).
* `product-discovery/README.md` — catatan folder `design/`.
* `context/ctx-design.md` — catatan ADR-045, aturan operasional token.
* `context/ctx-technical-context.md` — tabel "Baca dulu", aturan operasional #8.
* `context/ctx-implementation.md` — section UI Components.
* `project-manager/PROJECT_STATE.md` — In Progress, Next Tasks, Recent Decisions.

### Catatan governance

* Entri historis di `DECISIONS.md` (teks ADR-038/041 asli), `CHANGELOG.md`
  entri lama, dan `CONVERSATIONS.md` **tidak diedit** — append-only,
  mencerminkan keputusan yang berlaku saat itu. Hanya `Status` field ADR-038/
  ADR-041 yang ditambah anotasi "Amended by ADR-057".

---

## 2026-07-31 — Diskusi lanjutan hasil audit: 3 keputusan terbuka diputuskan (ADR-056 + 2 next task)

Melanjutkan diskusi dari audit dokumentasi sebelumnya (entri di bawah), 3 poin
"belum diputuskan" dibahas dan diputuskan bersama King Rezi.

### Added

* `DECISIONS.md` — **ADR-056**: sinkronisasi UI/UX docs ↔ Claude Design.
  Token visual jadi **co-equal** antara `design-tokens.md` dan Design System
  Claude Design (amandemen ADR-038 poin 1 & 2). AI **wajib reminder
  proaktif** setiap ada perubahan UI/UX di salah satu sisi (docs atau Claude
  Design) — berlaku untuk token maupun flow/fungsi layar, meski untuk
  flow/fungsi layar `04-ux/` tetap SoT (ADR-042 tidak berubah di sini).
  Dipicu King Rezi mengaku sering lupa sync manual antara dua sisi.

### Changed

* `context/ctx-design.md` — aturan operasional #9a baru: kewajiban reminder
  proaktif ADR-056, plus pointer di Related context.
* `.claude/agents/neymar-product-designer.md` — section baru "Wajib
  reminder proaktif (ADR-056)" (unlock `644` → edit → lock `444` lagi,
  sesuai prosedur resmi di `.claude/agents/README.md`).
* `project-manager/PROJECT_STATE.md`:
  * Recent Decisions — ADR-056 ditambahkan.
  * Next Tasks — persistensi tema Light/Dark (ADR-055) **sudah diputuskan**:
    pakai **Cookie** (bukan localStorage), belum diimplementasikan.
  * Next Tasks — Remove Member/Transfer Ownership/Delete Workspace:
    pendekatan desain **sudah diputuskan** — desain minimal "Danger Zone"
    dulu (bukan Members management penuh), sesi desain belum dimulai.
  * Next Tasks — catatan design-tokens.md diperbarui mengikuti model
    co-equal ADR-056 (bukan lagi "isi sekali setelah desain di-approve").

---

## 2026-07-31 — Audit konsistensi dokumentasi menyeluruh (2 temuan diperbaiki)

Dipicu permintaan King Rezi untuk cek dokumentasi menyeluruh. Ditemukan 2
inkonsistensi nyata, keduanya sudah diperbaiki di sesi yang sama.

### Fixed

* **`context/ctx-design.md`, `context/ctx-implementation.md`,
  `context/ctx-technical-context.md`** — ketiganya masih menginstruksikan
  "gunakan neutral theme Astryx selama M8" tanpa qualifier, padahal ADR-055
  (2026-07-31) sudah mengangkat Light/Dark Mode Toggle jadi fitur resmi dan
  meng-override baseline itu. Ketiga file diberi catatan bahwa toggle tetap
  berjalan di atas neutral theme (expose mekanisme dark mode bawaan Astryx,
  bukan tema/token baru) — bukan pelanggaran, tapi perlu disebutkan supaya
  agent berikutnya tidak salah kira dark mode belum ada.
* **`.claude/agents/*.md`** (7 file peran subagent) — `AGENTS.md` dan
  `.claude/agents/README.md` mengklaim file-file ini `chmod 444` (read-only)
  sebagai pengaman teknis, tapi kenyataannya `644` (kemungkinan step chmod
  444 terlewat setelah edit terakhir `najwa-qa-engineer.md`). Dikembalikan ke
  `444`; `.claude/agents/README.md` sendiri sengaja tetap `644` sesuai
  pengecualian di `PROJECT_RULES.md`.

### Verified (tidak ada masalah, dicatat sebagai bukti audit)

* Penomoran ADR-001 s/d ADR-055 di `DECISIONS.md` berurutan tanpa gap/duplikat.
* Klaim status implementasi kode di `PROJECT_STATE.md` (ADR-052 modal, ADR-053/
  054 belum di kode, ADR-055 sudah di kode) cocok dengan kode nyata di
  `apps/web/src`.
* Versi Astryx `0.1.8` konsisten di `apps/web/package.json`,
  `apps/web/.claude/CLAUDE.md`, dan `PROJECT_OVERVIEW.md`.
* Tidak ada README yang memuat status/progress — Document Type Classification
  di `PROJECT_RULES.md` dipatuhi.

---

## 2026-07-31 — ADR-055: Light/Dark Mode Toggle diangkat jadi fitur resmi produk

King Rezi meminta button switch light/dark; sebelum implementasi dimulai,
diklarifikasikan dulu (via `AskUserQuestion`) apakah ini alat banding
internal atau fitur resmi produk — King Rezi memilih **fitur resmi
produk**, mengoverride baseline "neutral theme selama M8" (ADR-041). Alur
kerja: Neymar (Claude Design) → Mark UI Engineer (kode `apps/web`) → Najwa
QA (verifikasi browser) → Ridwan (review arsitektur) — semua selesai dan
lolos.

### Added

* `DECISIONS.md` — ADR-055 baru: Toggle Light/Dark Mode sebagai kontrol
  persisten di sidebar footer, berlaku lintas seluruh section; default
  Light saat load pertama; sengaja tidak dipersist lintas full reload.
  Alasan tidak melanggar ADR-041: token dark mode sudah native di Astryx
  (`@astryxdesign/theme-neutral@0.1.8`), bukan implementasi custom.
* Claude Design (project "Social Media Management") — toggle ditambahkan
  di 7 layar KSP (Home, Publish Calendar/Queue/Drafts, Engage Inbox,
  Analyze Dashboard, Settings Connected Accounts) + App Prototype.
  `draft-editor.html` (KSP-05) dikecualikan — tidak ada sidebar (modal
  fullscreen, ADR-052).
* `apps/web/src/app/providers.tsx` — `ThemeModeContext`/`useThemeMode`.
* `apps/web/src/app/[slug]/workspace-side-nav.tsx` — `IconButton` toggle di
  sidebar footer, berdampingan user account dropdown.

### Verification

* Typecheck/lint/test (26 test) hijau.
* QA end-to-end via browser (tunnel ngrok): golden path toggle lolos,
  konsistensi tema lintas navigasi SPA, reset ke Light saat full reload
  dikonfirmasi working as intended (bukan bug), tidak ada regresi sidebar.
* Review arsitektur (Ridwan): lolos tanpa temuan — client component murni,
  tidak ada import domain/Prisma/Supabase/Outstand, pola context konsisten
  dengan `DraftEditorContext` yang sudah ada.

### Belum selesai (dicatat, bukan ditutup)

* `components/navigation.html` (dokumen referensi AppShell+SideNav di
  Claude Design) belum ter-push — terblokir karena tool `DesignSync`
  sempat nonaktif di sesi kerja desain. File hasil edit sudah disiapkan
  lengkap di scratchpad, tinggal di-push saat `DesignSync` aktif kembali.
* Persistensi tema lintas reload (localStorage/cookie) belum diputuskan —
  sengaja ditunda.

---

## 2026-07-31 — ADR-053 & ADR-054: Sidebar CTA "+ New Post" + redirect Draft Editor ke sub-screen tujuan

### Added

* `DECISIONS.md` — ADR-053 (Sidebar mendapat CTA "+ New Post" pinned di
  bawah Workspace Selector, tersedia dari section manapun, melengkapi
  CTA NP-D09 yang sudah ada di Calendar/Queue/Drafts) dan ADR-054 (Draft
  Editor redirect otomatis ke sub-screen tujuan setelah aksi terminal:
  Save as Draft → Drafts, Schedule → Queue, Publish Now → History/
  sementara Calendar).
* `product-discovery/04-ux/navigation-patterns.md` — zona CTA baru di
  diagram sidebar, NP-D12 (CTA "+ New Post" pinned) dan NP-D13 (Pola
  Redirect setelah Aksi Terminal Draft Editor) baru di Decision Log +
  tabel Ringkasan Pola.
* `product-discovery/04-ux/key-screen-patterns.md` — KSP-D15 baru di
  Decision Log; KSP-05-F08/F09/F12 diberi catatan tujuan redirect.
* Claude Design (project "Social Media Management") — CTA "+ New Post"
  ditambahkan di 7 layar shell (`home.html`, `publish-calendar.html`,
  `publish-queue.html`, `publish-drafts.html`, `engage-inbox.html`,
  `analyze-dashboard.html`, `settings-connected-accounts.html`) +
  `components/navigation.html` + class baru `.sidebar-cta` di
  `styles.css`. `AppPrototype.dc.html` — `saveDraftFromEditor()` kini
  redirect ke `publish-drafts`, handler `publishnow-confirm` diubah
  destinasi dari `'home'` ke `'publish-calendar'`.

### Notes

* Implementasi kode `apps/web` untuk kedua perubahan ini **belum
  berjalan** — menyusul di siklus implementasi berikutnya (lihat Next
  Tasks di `PROJECT_STATE.md`).
* Handler Schedule (`dialog-confirm` → `publish-queue`) di App Prototype
  tidak berubah — perilaku ini sudah ada sejak file dibuat, ADR-054 baru
  memformalkannya sebagai keputusan resmi.

---

## 2026-07-30 — QA: aturan URL testing (ngrok) + akun test terdokumentasi

Permintaan eksplisit user: Najwa QA Engineer sering butuh verifikasi browser,
tapi project ini tidak bisa testing lewat `localhost` (Better Auth tidak bisa
membaca session/cookie di setup ini), sehingga dipakai tunnel ngrok yang
efemeran (URL berubah tiap sesi).

### Added

* `project-manager/QA_TEST_ACCOUNTS.md` — dokumen baru: alasan testing browser
  pakai ngrok bukan `localhost`, catatan bahwa URL ngrok efemeran (harus
  dikonfirmasi ulang tiap sesi, tidak boleh reuse dari dokumentasi manapun),
  1 akun test yang sudah ada di database (Raka Pratama, Owner —
  `raka.test@kopiselasar.com`), dan catatan penundaan akun Manager/Creator
  sampai fitur invite member (`apps/web/src/app/[slug]/settings/members/
  page.tsx`, masih scaffold placeholder) selesai diimplementasikan.

### Changed

* `.claude/agents/najwa-qa-engineer.md` — 2 aturan baru: (1) step 0 di
  "Langkah kerja" — wajib tanya ke user URL testing aktif sebelum verifikasi
  browser (bukan `localhost`), dengan alasan singkat (Better Auth + ngrok
  efemeran); (2) pointer baru di "Referensi" ke
  `project-manager/QA_TEST_ACCOUNTS.md` untuk kredensial akun test.

---

## 2026-07-30 — ADR-052 Tahap 3: implementasi kode Draft Editor sebagai modal

### Added

* `apps/web/src/app/[slug]/publish/_draft-editor/` — `context.tsx`
  (`DraftEditorProvider`/`useDraftEditor`, state New Post/Edit Draft/Resume
  Unfinished Post), `modal.tsx` (`Dialog variant="fullscreen"` + `Layout`,
  pola `DialogFullscreenDialog` Astryx), `actions.ts` (`saveDraftAction`,
  `updateDraftAction`, `getDraftAction`), `status-badge.ts` (mapping
  `ContentStatus` → label/`Badge` variant sesuai `components/status-chips.html`
  Claude Design).
* `apps/web/src/app/[slug]/publish/drafts/drafts-list.tsx` — Drafts List
  data asli (`List`/`ListItem` di dalam `Card`), tiap row klik membuka
  Edit Draft.
* `apps/web/src/lib/utils/format-relative-time.ts` — format waktu relatif
  Bahasa Indonesia ("2 jam lalu", "kemarin", dst).
* Domain `publishing`: `PublishingService.listDrafts`/`getDraftById`/
  `updateDraft` + `IPublishingRepository.listDrafts`/`findDraftById`/
  `updateDraftCaption` (+ `updatedAt` di `PublishingPostRecord`), unit test
  baru untuk ketiganya.

### Changed

* `apps/web/src/app/[slug]/publish/layout.tsx` — dibungkus
  `DraftEditorProvider` + render `DraftEditorModal`, supaya modal tampil di
  atas Calendar/Queue/Drafts manapun tanpa navigasi URL (NP-D11).
* `apps/web/src/app/[slug]/publish/drafts/page.tsx` — jadi async Server
  Component yang fetch draft asli via `PublishingService.listDrafts`,
  menggantikan `EmptyState` statis.
* `apps/web/src/lib/repositories/publishing/publishing.repository.ts` —
  implementasi Prisma untuk 3 method baru + helper `mapPost`.

### Removed

* Route lama Draft Editor (digantikan modal, ADR-052): `publish/drafts/new/`,
  `publish/drafts/[postId]/`, `publish/calendar/[postId]/`,
  `publish/queue/[postId]/`. **Tidak** menyentuh `publish/history/[postId]/`
  (di luar scope ADR-052).

### Notes

* Sengaja tidak mengikuti mockup Claude Design 100%: tombol "Publish Now" di
  footer modal tidak ikut diimplementasikan (ADR-047 — task terpisah, belum
  disetujui untuk dikerjakan sesi ini); footer tetap 2 tombol (Save as
  Draft, Schedule). Toggle Fullscreen/Standard di Claude Design juga sengaja
  tidak ikut ke kode (alat banding internal, bukan keputusan final).
* Diverifikasi end-to-end via browser (tunnel ngrok, akun test Raka
  Pratama): New Post → Save as Draft → close → muncul di list → Edit Draft
  dari list (data server) → update in-place (tidak duplikat) → Resume
  Unfinished Post dialog. `bun run typecheck`/`lint`/`test` hijau.
* Bug ditemukan & diperbaiki saat verifikasi: Drafts List tidak refresh
  otomatis setelah modal ditutup (Server Component tidak tahu ada
  perubahan) — ditambahkan `router.refresh()` setelah Save as Draft
  berhasil.

---

## 2026-07-30 — Skill "work-report-simple": tambah byline "Dikerjakan oleh"

Permintaan eksplisit user: setiap laporan kerja harus menyebutkan siapa
(persona/subagent) yang mengerjakannya.

### Changed

* `.agents/skills/work-report-simple/SKILL.md` (sinkron otomatis dengan
  `.claude/skills/work-report-simple/SKILL.md`) — section baru "1. Dikerjakan
  oleh" (wajib, baris paling atas laporan): nama subagent kalau dikerjakan
  lewat subagent bernama di `.claude/agents/`, atau "AI utama" kalau tanpa
  delegasi. Section lain digeser jadi 2–5. Aturan gaya bahasa + kedua contoh
  output diperbarui mengikuti format baru.
* `.claude/agents/ridwan-architecture-reviewer.md` dan
  `.claude/agents/najwa-qa-engineer.md` — section baru "Cara melapor",
  referensi eksplisit ke `work-report-simple` (sebelumnya cuma
  `gibran-project-manager.md` yang punya pointer ini). Chmod dibuka (644)
  untuk edit, dikunci kembali (444).

---

## 2026-07-30 — Aturan sebutan user: "King Rezi"

Permintaan eksplisit user (membuka kembali file peran subagent yang
sebelumnya di-chmod read-only, sesuai prosedur di `.claude/agents/README.md`).

### Changed

* `AGENTS.md` — aturan keras #14 baru: panggil user "King Rezi" di seluruh
  komunikasi/output teks, berlaku untuk AI utama dan seluruh subagent.
* Ketujuh file `.claude/agents/*.md` — section baru "Sebutan user" di tiap
  file, chmod dibuka (644) untuk edit lalu dikunci kembali (444).

---

## 2026-07-30 — 7 subagent kerja ditambahkan (`.claude/agents/`)

Dibuat atas permintaan user untuk memungkinkan delegasi kerja ke beberapa
subagent Claude Code secara paralel, dengan nama custom per peran.

### Added

* `.claude/agents/prabowo-feature-engineer.md` — implementasi fitur produk
  (entry → service → domain → repo), tidak terikat milestone tertentu.
* `.claude/agents/mark-ui-engineer.md` — UI/komponen Astryx di `apps/web`.
* `.claude/agents/neymar-product-designer.md` — kerja di Claude Design
  (`DesignSync`), wajib baca skill `claude-design-scope-discipline`.
* `.claude/agents/elon-backend-engineer.md` — integrasi Outstand (ACL),
  webhook, background jobs, schema Prisma.
* `.claude/agents/ridwan-architecture-reviewer.md` — review kepatuhan
  boundary DDD, read-only (tools dibatasi, tanpa Edit/Write).
* `.claude/agents/najwa-qa-engineer.md` — QA (Vitest + verifikasi browser
  end-to-end).
* `.claude/agents/gibran-project-manager.md` — update
  `PROJECT_STATE.md`/`DECISIONS.md`/`CHANGELOG.md`, selalu dipanggil
  terakhir dan sekuensial (bukan paralel) untuk mencegah konflik status.
* `.claude/agents/README.md` — panduan pemakaian + aturan orkestrasi
  paralel/sekuensial antar subagent.

### Changed

* `PROJECT_RULES.md` — `.claude/agents/*.md` (kecuali `README.md`-nya)
  ditambahkan ke klasifikasi Static Reference; perubahan hanya atas
  permintaan eksplisit user.
* `AGENTS.md` — section baru "Subagent kerja (`.claude/agents/`)", pointer
  ke `.claude/agents/README.md`.

### Governance

* Ketujuh file peran di-chmod read-only (444) sebagai pengaman teknis
  supaya tidak berubah tanpa sengaja saat sesi kerja berjalan.

---

## 2026-07-30 — ADR-052: skill "Claude Design — Scope Discipline" ditambahkan (governance)

Retrospektif atas insiden default toggle Fullscreen/Standard yang diam-diam
berubah (lihat addendum ADR-052 sebelumnya) menghasilkan aturan pencegahan
permanen supaya kelas kesalahan yang sama (AI mengubah state/default yang
sudah disetujui sebagai efek samping fitur baru) tidak terulang.

### Added

* `.claude/skills/claude-design-scope-discipline/SKILL.md` — skill baru:
  kronologi insiden, aturan wajib (jangan ubah default sebagai efek
  samping; nyatakan ringkas apa yang berubah vs tetap sama; tanya dulu
  kalau ambigu; definisi selesai mencakup "tidak ada side-effect tak
  diminta"), contoh salah/benar.

### Changed

* `context/ctx-design.md` — Aturan operasional #10 baru + entri Related
  context, menunjuk ke skill di atas.
* `AGENTS.md` — Aturan keras #13 baru, pointer ke skill yang sama (entry
  point wajib dibaca tiap sesi).
* `DECISIONS.md` — ADR-052 mendapat addendum baru mendokumentasikan
  governance ini + alasan penempatan (skill khusus + `ctx-design.md`,
  bukan `PROJECT_RULES.md` yang scope-nya lebih luas dari kebutuhan, karena
  hanya Claude Code yang punya akses tool `DesignSync`).

---

## 2026-07-30 — ADR-052: perbaikan CSS Draft Editor tidak ter-inject + media-thumb hilang

User melaporkan Media (drop zone) dan Account Selector (pilihan akun sosial
media) tampil berubah/polos, tidak sesuai tampilan awal — terutama lewat
App Prototype. Ditemukan dua root cause: (1) CSS page-specific Draft Editor
hanya ada di `<style>` lokal `templates/draft-editor.html`, tidak ikut
ter-inject saat markup-nya dipindah ke document screen lain di App
Prototype (yang cuma link `../styles.css`, tanpa style lokal tambahan);
(2) `<div class="media-thumb">` (kotak preview media) hilang total dari
markup App Prototype sejak rewrite pertamanya — bug terpisah dari soal CSS.

### Changed (Claude Design project)

* `styles.css` — class Draft Editor (`.editor-grid`, `.ai-trigger`,
  `.media-drop`, `.media-thumb`, `.acc-row`(`.disconnected`),
  `.acc-row-top`, `.fmt-row` (+`label`), `.reconnect-link`, `.sched-row`)
  dipindah ke sini (section "App patterns"), nilai px dipertahankan persis
  sama dengan versi lama — tidak ada pergeseran visual.
* `templates/draft-editor.html` — `<style>` lokal dihapus total, sekarang
  murni mengandalkan `../styles.css`.
* `templates/app-prototype/AppPrototype.dc.html` — `<div
  class="media-thumb">preview media 4:3</div>` ditambahkan kembali ke
  `buildDraftEditorMarkup`, posisi sama seperti template statis.
* `readme.md` — aturan baru "setiap class page-specific wajib di
  `styles.css`, tidak boleh `<style>` lokal per halaman" ditambahkan ke
  "How to use this"/"Do"/"Don't"/"Files" supaya pola bug ini tidak terulang
  untuk screen lain.

### Verification

* Dibuat simulasi lokal: document HTML terpisah yang hanya link
  `../styles.css` (meniru `publish-drafts.html`), markup Draft Editor
  di-inject via JS persis seperti App Prototype. Terkonfirmasi: sebelum
  fix Media/Account Selector polos tanpa styling; setelah fix, render
  benar. `templates/draft-editor.html` standalone juga dicek tetap benar
  tanpa `<style>` lokal.

---

## 2026-07-30 — ADR-052: koreksi default toggle + posisi dipindah ke header

Koreksi atas entri Tahap sebelumnya — user menegaskan tidak pernah meminta
layout Draft Editor berubah, hanya toggle untuk membandingkan; membuat
"Standard" jadi default tanpa sadar mengubah tampilan yang sudah di-approve
Tahap 2 (Fullscreen). User juga meminta posisi toggle dipindah ke dalam
dialog (sejajar status chip, kiri tombol Close), bukan tombol eksternal.

### Changed (Claude Design project)

* `templates/draft-editor.html` — default variant dikembalikan ke
  **Fullscreen**; tombol toggle floating (pojok kiri bawah) dihapus,
  digantikan tombol kecil di dalam `.dialog-fs-header`/`.dialog-lg` header,
  di antara chip status dan tombol Close.
* `templates/app-prototype/AppPrototype.dc.html` — default `dialogVariant`
  dikembalikan ke `'fullscreen'`; tombol toggle toolbar dihapus, digantikan
  tombol `data-proto="draft-toggle-variant"` di dalam
  `buildDraftEditorMarkup` (header dialog, posisi sama seperti template
  statis). Method `toggleDraftEditorVariant(doc)` menggantikan
  `toggleDialogVariant()` lama — dipicu lewat `route()` langsung (sudah
  punya akses `doc`), bukan lewat lookup `this._frame` terpisah.
* `readme.md` — section "Draft Editor — Dialog variant still being
  compared" dan "How to Demo" diperbarui: posisi toggle (di dalam header,
  bukan toolbar/floating), default Fullscreen (bukan Standard).

### Verification

* Diverifikasi visual di browser lokal sebelum push: kedua varian (default
  Fullscreen, toggle ke Standard) render benar, toggle di posisi baru
  (dalam header, sejajar chip, kiri Close) berfungsi di kedua file.

---

## 2026-07-30 — ADR-052: perbaikan animasi Dialog + toggle Standard/Fullscreen

User mengecek langsung di Claude Design dan melaporkan New Post/Edit Draft
belum terasa memakai komponen Dialog/Modal (terlihat seperti halaman
biasa). Ditemukan animasi buka Dialog hilang di implementasi sebelumnya
(bug nyata, diperbaiki) — fullscreen juga memang sengaja tanpa backdrop
gelap terlihat (Astryx by design, bukan bug). Solusi: toggle Standard/
Fullscreen supaya tim bisa bandingkan langsung, default Standard.

### Changed (Claude Design project)

* `styles.css` — animasi masuk (`@keyframes dialog-enter`, fade + scale-in
  ~300ms) ditambahkan ke `.dialog`, `.dialog-fs`, dan `.dialog-lg`
  sekaligus, mereplikasi animasi asli Astryx Dialog (diverifikasi via
  `astryx swizzle Dialog` sementara — dibaca, dihapus segera, ADR-041).
  Class baru `.dialog-lg-backdrop` + `.dialog-lg` (varian "standard" besar
  — card `min(960px, 94vw)` + backdrop gelap, menggunakan ulang
  `.dialog-fs-header/-title/-actions/-body/-footer` yang sudah ada).
* `templates/draft-editor.html` — tombol toggle "Variant: Standard/
  Fullscreen" (pojok kiri bawah, di luar dialog — kontrol demo, bukan
  bagian UI produk), default Standard.
* `templates/app-prototype/AppPrototype.dc.html` — toggle yang sama di
  toolbar ("Draft Editor: Standard/Fullscreen"), state `dialogVariant`
  (default `'standard'`), live-switch overlay yang sedang terbuka tanpa
  kehilangan caption yang sudah diketik.
* `readme.md` — section baru "Draft Editor — Dialog variant still being
  compared" menjelaskan trade-off fullscreen (sengaja tanpa backdrop) vs
  standard (backdrop jelas, lebih mudah dikenali sebagai modal); catatan
  "Don't ship both variants to apps/web" ditambahkan.

### Impact

* **ADR-052 di `DECISIONS.md` — keputusan "fullscreen" tidak lagi final.**
  Ditandai eksplisit di Addendum baru: variant asli tetap didukung penuh,
  tapi pilihan final (fullscreen vs standard) menunggu keputusan tim
  setelah membandingkan langsung di Claude Design.
* Tahap 3 (implementasi kode) tetap **tidak dimulai** — menunggu aba-aba
  eksplisit user, dan keputusan variant final sebelum/saat itu dimulai.

---

## 2026-07-30 — ADR-052: App Prototype direwiring (gap Design System ditutup)

Menutup gap yang dicatat di entri Tahap 2 sebelumnya — `AppPrototype.dc.html`
(Claude Design) sekarang konsisten dengan `templates/draft-editor.html`.
Tahap 3 (implementasi kode `apps/web`) masih menunggu aba-aba eksplisit user.

### Changed (Claude Design project)

* `templates/app-prototype/AppPrototype.dc.html` — Draft Editor dihapus dari
  `SCREENS` (bukan lagi iframe-navigable route); di-inject sebagai overlay
  `.dialog-fs` ke document layar aktif (Calendar/Queue/Drafts), pola yang
  sama dengan dialog Schedule/Publish Now/Disconnect yang sudah ada
  sebelumnya. Trigger (`+ New Post`, klik item Calendar/Queue, Home →
  Today's Schedule) diarahkan ke method baru `triggerNewPost`/
  `triggerEditDraft`.
* **Resume Unfinished Post (New Post saja, KSP-05-F13) — interaktif nyata**
  via `localStorage` browser: ketik caption di New Post → tutup dengan ✕ →
  buka "+ New Post" lagi → dialog "Resume unfinished post?" muncul dengan
  isi sebelumnya (pilihan Resume/Mulai Baru). Edit Draft sengaja tidak
  punya mekanisme ini.
* Role-based button visibility (Publish Now/Schedule↔"Kirim untuk Review")
  dipindah dari logic berbasis `this.screen === 'draft-editor'` ke
  diterapkan langsung pada overlay saat dirender.
* Dropdown "Screen" toolbar: entri langsung "Draft Editor" diganti opsi
  "KSP-05 · Draft Editor (modal preview)" (shortcut preview, melewati cek
  Resume — didemokan lebih baik lewat tombol "+ New Post" sungguhan).
* `readme.md` — "How to Demo" dan "Files" diperbarui mendeskripsikan
  perilaku modal + langkah demo Resume Unfinished Post.

### Verification

* Skrip JS komponen diekstrak dan dicek `node --check` (syntax valid) —
  framework `dc-runtime`/`<x-dc>` tidak bisa dijalankan penuh di luar Claude
  Design untuk verifikasi visual end-to-end dari sesi ini.

---

## 2026-07-30 — ADR-052: Draft Editor jadi Modal (Design System)

Tahap 2 dari ADR-052 — sinkronisasi ke project Claude Design (`Social Media
Management`, ADR-042). Tahap 3 (implementasi kode `apps/web`) belum
berjalan.

### Changed (Claude Design project, bukan repo `product-discovery/`)

* `templates/draft-editor.html` — ditulis ulang total: dari full-page
  `.app-shell`/`.sidebar` menjadi modal `Dialog variant="fullscreen"`
  (`.dialog-fs`). Header (title + status chip + Close icon button), body
  (editor grid yang sudah ada, tidak berubah), footer (action bar) —
  struktur mengikuti pola `Layout` + `DialogHeader` + `LayoutContent` +
  `LayoutFooter` Astryx asli.
* `components/dialog.html` — ditambah contoh kedua: dialog "Resume
  unfinished post?" (`purpose="required"`, KSP-05-F13, khusus New Post).
* `styles.css` — 6 kelas baru (`.dialog-fs` + `-header/-title/-actions/
  -body/-footer`), nilai fullscreen (`100dvw`/`100dvh`, radius 0)
  diverifikasi via `astryx swizzle Dialog` sementara (dibaca, dihapus
  segera — ADR-041).
* `readme.md` — tabel Components, section Direction/Do, dan daftar Files
  diperbarui untuk mendokumentasikan pola modal baru.

### Known gap

* `templates/app-prototype/AppPrototype.dc.html` (interactive runner)
  **belum** direwiring — Draft Editor di situ masih navigasi halaman
  penuh, bukan modal. Dicatat eksplisit di `readme.md` project Claude
  Design dan di `PROJECT_STATE.md` Next Tasks, bukan diabaikan diam-diam.

---

## 2026-07-30 — ADR-052: Draft Editor jadi Modal (dokumentasi)

Tahap 1 (dokumentasi) dari perubahan New Post & Edit Draft menjadi modal
reusable, bukan full-page route. Tahap 2 (Design System/Claude Design) dan
Tahap 3 (implementasi kode) menyusul di sesi terpisah — belum ada kode yang
diubah pada entri ini.

### Added

* **ADR-052** di `DECISIONS.md` — Draft Editor (New Post & Edit Draft) jadi
  modal overlay fullscreen, mengoverride NP-D02. Resume unsaved state
  (localStorage + dialog "Resume unfinished post?") hanya untuk New Post.
  Route lama (`drafts/new`, `[postId]` di `calendar`/`queue`/`drafts`) akan
  dihapus total saat implementasi (modal-only) — `history/[postId]`
  ("Post Detail", layar terpisah, KSP-D10) tidak termasuk, di luar scope.
* **KSP-05-F13** (Resume Unfinished Post, New Post saja) dan **NP-D11**
  (override NP-D02) di `key-screen-patterns.md` / `navigation-patterns.md`.

### Changed

* `product-discovery/04-ux/navigation-patterns.md` — pola "Item → Editor"
  dan "New Post CTA" direword dari panel/layar-penuh menjadi modal overlay;
  Ringkasan Pola diperbarui; NP-D02 ditandai dioverride oleh NP-D11.
* `product-discovery/04-ux/key-screen-patterns.md` — KSP-05 Identitas/
  Tujuan diberi catatan modal; KSP-05-F10 direword jadi "Tutup Modal";
  State Handling ditambah 2 baris (Resume New Post, batasan Edit Draft);
  diagram Zona Fungsional diberi catatan modal.
* `product-discovery/06-engineering/monorepo-setup.md` — diagram App Router
  Publish diperbarui: `[postId]` di `calendar`/`queue`/`drafts` dihapus dari
  diagram (digantikan modal); `history/[postId]` (Post Detail, KSP-D10)
  dibiarkan apa adanya — di luar scope ADR-052.
* `PROJECT_STATE.md` — entri ADR-052 di Recent Decisions, In Progress, dan
  Next Tasks (Design System lalu implementasi kode).

---

## 2026-07-29 — Design-sync: kode `apps/web` disamakan dengan Claude Design

Arah kebalikan dari ADR-051 (yang menyamakan Claude Design ke Astryx) — kali
ini kode yang sudah diimplementasikan di M8 disamakan visual/struktur-nya ke
referensi Claude Design. Murni visual/structural, tidak menambah business
logic baru (Publish Now/AI Caption Assist sengaja tidak ditambahkan, sesuai
Next Tasks terpisah).

### Changed

* **Draft Editor** (`[slug]/publish/drafts/new/page.tsx`) — Card wrapper di
  4 section (Caption/Media/Account Selector/Schedule) dihapus, mengikuti
  referensi KSP-05 yang tidak card-wrap section form (Card = dashboard
  widget/settings group, bukan section form, per aturan Astryx sendiri).
  Tombol "+ Tambah Media" (disabled) diganti `FileInput` asli
  (`mode="dropzone"`, `isDisabled` + `disabledMessage`) — component swap
  yang benar, bukan re-design. Date+Time Schedule disejajarkan satu baris.
  Action bar (Save as Draft/Schedule) dibuat full-width sejajar via
  `StackItem size="fill"`. Label back button → "Kembali ke Drafts".
* **Publish tabbar baru** (`[slug]/publish/publish-tabbar.tsx` + update
  `publish/layout.tsx`) — shared `TabList`/`Tab` (Calendar/Queue/Drafts/
  History) di atas semua sub-route Publish, `Tab href` otomatis pakai
  Next.js `Link` (LinkProvider sudah global). 3 tab lain (Calendar/Queue/
  History) tetap placeholder, tidak ada logic baru ditambahkan.
* **Drafts List** (`[slug]/publish/drafts/page.tsx`) — page-head
  ("Publish" / "Draft yang belum terjadwal") + `EmptyState` dibungkus
  `Card`, sesuai komposisi KSP-04. Data tetap kosong/mock — tidak
  menambah fetch draft asli (di luar scope design-sync).
* **Sidebar** (`workspace-side-nav.tsx`) — `IconButton` 🔔 "Notifikasi"
  ditambahkan di footer sebelum user dropdown, link ke
  `/account/notifications` (placeholder yang sudah ada), tanpa
  unread-count real (Notification domain belum diimplementasi).
* **Auth screens** (Login/Register/Forgot/Reset Password) — dibandingkan
  detail ke referensi, sudah selaras; tidak ada perubahan kode.

Diverifikasi: `bun run typecheck` & `bun run lint` hijau; browser check
end-to-end lewat tunnel ngrok (akun test baru) — tabbar navigasi antar
tab, Draft Editor (FileInput dropzone + disabledMessage tampil benar,
"Save as Draft" tetap persist ke database nyata tanpa regresi), sidebar
notifikasi (navigasi ke `/account/notifications` terkonfirmasi).

---

## 2026-07-29 — Claude Design: 3 gap Critical Function vs 04-ux baseline diperbaiki

Lanjutan audit sinkronisasi (entri di bawah) — user meminta perbaikan
langsung ke Claude Design untuk 3 gap yang ditemukan, tanpa mengubah
baseline (baseline sudah benar, implementasi yang tertinggal).

### Fixed

* **KSP-01-F05 (Home)** — `home.html`: card/list-row diberi class
  semantik (`.home-schedule`, `.home-activity`, `.home-engagement`,
  `.home-analytics`); `AppPrototype.dc.html` diberi handler route() baru
  supaya klik item mengarah ke Draft Editor / Calendar / Engage /
  Analyze sesuai peta deep-link di baseline.
* **KSP-03-F05 (Queue)** — `publish-queue.html`: tombol ↑/↓ ditambahkan
  di tiap `queue-row`; `AppPrototype.dc.html` menukar posisi DOM baris
  dengan tetangganya saat tombol diklik + toast konfirmasi.
* **KSP-06-F02 (Engage)** — `engage-inbox.html`: 3 select filter (Semua
  Akun / Semua Platform / Semua Status) ditambahkan di atas
  `inbox-shell`, tiap `thread-item` diberi `data-platform`/`data-status`;
  `AppPrototype.dc.html` menambahkan `applyEngageFilter()` (dipanggil
  saat `change` pada select manapun) yang menyembunyikan thread tidak
  cocok dan menampilkan empty state _"Tidak ada interaksi untuk filter
  ini"_ (persis wording State Handling KSP-06) saat hasil kosong.

Diverifikasi visual (tampilan statis) di scratchpad sebelum push; logika
interaktif App Prototype (format `.dc.html` khusus Claude Design) diverifikasi
lewat review kode karena runtime-nya butuh environment Claude Design asli.

Detail lengkap temuan: entri CHANGELOG di bawah ("Audit sinkronisasi
Claude Design vs 04-ux baseline").

---

## 2026-07-29 — Audit sinkronisasi Claude Design vs 04-ux baseline

Diminta user untuk cek apakah project Claude Design masih selaras dengan
`key-screen-patterns.md` dan `navigation-patterns.md` (04-ux baseline)
setelah rewrite fidelitas Astryx (ADR-051). Dibaca ulang kedua dokumen
baseline secara penuh dan dibandingkan terhadap setiap Critical Function
KSP-01–08, label status, struktur sidebar, dan tab bar.

### Findings

* Tidak ada regresi dari rewrite ADR-051 — perubahan token/komponen murni
  visual, seluruh zona fungsional dan label status baseline masih utuh.
* 3 gap fungsional pre-existing (bukan disebabkan sesi ADR-051) ditemukan
  dan dicatat di `PROJECT_STATE.md` Known Issues: KSP-01-F05 (Home deep
  link belum di-wire), KSP-03-F05 (Queue reorder belum ada), KSP-06-F02
  (filter Engage tidak ada sama sekali).

Tidak ada perubahan pada file Claude Design maupun baseline — audit ini
murni pencatatan gap untuk task selanjutnya.

---

## 2026-07-29 — Claude Design: migrasi templates/ selesai, legacy alias dihapus total (ADR-051 addendum)

Lanjutan ADR-051: 13 layar (8 KSP + 5 Auth) + App Prototype
(`AppPrototype.dc.html`) ditulis ulang — setiap embedded `<style>`/inline
style yang masih memakai nama token lama (`--color-text-muted`,
`--radius-md`, `--color-accent-tint`, `--color-surface-subtle`, dst.)
diganti ke token Astryx asli langsung.

### Fixed

* `thumbnail.html` — ditemukan rusak sejak push pertama ADR-051:
  mereferensikan `--status-failed-bg`/`--status-published-bg`, token yang
  sudah dihapus total dari sistem baru (diganti sistem varian `Badge`),
  bukan dialiaskan. Diperbaiki ke `--color-error`/`--color-success`.
* Alias singkatan `--text-xs`/`--text-sm`/`--text-lg` (bukan nama token
  Astryx asli, dibuat sendiri saat penulisan ulang pertama) ternyata masih
  dipakai aktif di banyak file — diganti ke nama token asli
  (`--font-size-sm`/`--font-size-lg`) di seluruh project.

### Changed

* `styles.css` — blok "Legacy aliases" dihapus total (dikonfirmasi tidak
  ada lagi referensi ke nama lama di file manapun). Tidak ada satu pun
  nama token buatan sendiri yang tersisa di project ini.
* `readme.md` — bagian yang menjelaskan bridge legacy alias dan status
  "templates/ belum bermigrasi" diperbarui untuk mencerminkan migrasi
  yang sudah selesai penuh.

Detail lengkap: `DECISIONS.md` ADR-051 (addendum).

---

## 2026-07-29 — Claude Design: foundations + component library ditulis ulang mengikuti fidelitas Astryx (ADR-051)

User meminta seluruh komponen di project Claude Design memakai komponen
yang disediakan Astryx (astryx.atmeta.com/components) — bukan CSS buatan
tangan yang cuma mirip. Cara kerja yang diinginkan: dokumentasi → Design
System (Claude Design) merancang berdasar dokumentasi itu → implementasi
berkaca ke Design System. Karena Claude Design adalah kanvas HTML/CSS
statis (tidak bisa menjalankan React/StyleX asli), setiap nilai visual
ditulis ulang sebagai replika presisi dari `@astryxdesign/core@0.1.8` +
`@astryxdesign/theme-neutral@0.1.8` (versi exact pin yang sama dengan
`apps/web`) — diverifikasi via `bunx astryx docs <topic>` dan swizzle
sementara (source dibaca lalu dihapus segera, tidak pernah disimpan,
sesuai larangan swizzle ADR-041).

### Changed

* Project Claude Design (`Social Media Management`) — 13 file ditulis
  ulang: `styles.css`, `theme.json`, `readme.md`, `foundations/color.html`,
  `foundations/type.html`, `foundations/layout.html`,
  `components/buttons.html`, `components/cards.html`,
  `components/dialog.html`, `components/forms.html`,
  `components/navigation.html`, `components/status-chips.html`,
  `components/table.html`.
* Accent berubah dari placeholder rekaan (`#48517A`, slate-blue) ke accent
  neutral theme Astryx asli (`#262626`, near-black) — tetap placeholder
  brand (ADR-038/ADR-041), sekarang placeholder yang nyata, bukan rekaan.
* 6 status konten (draft/review/ready/scheduled/published/failed)
  dipetakan ke varian `Badge` asli (neutral/warning/info/purple/success/
  error) — `scheduled` memakai tag kategori "purple" karena Astryx cuma
  punya 5 varian semantik, bukan 6.
* `AppShell` dipetakan ke `variant="section"` (bukan "elevated") supaya
  arah hairline-divider produk ini tetap terjaga dengan varian asli yang
  benar-benar ada.
* Setiap file component library sekarang mencantumkan anotasi eksplisit
  komponen + props Astryx asli yang direplikasi (mis. `<Button
  variant="primary" size="md">`), supaya implementasi di `apps/web`
  tinggal pasang komponen asli.
* `styles.css` — token lama (`--color-bg`, `--space-4`, `--radius-md`, dst.)
  dipertahankan sebagai "legacy alias" ke token Astryx asli, supaya
  `templates/` (belum bermigrasi) tetap render tanpa rusak.
* Ditemukan version drift: situs live `astryx.atmeta.com` menunjukkan
  v0.1.9, sementara `apps/web` mengunci v0.1.8 — CLI lokal dipakai sebagai
  sumber final (AGENTS.md #12), bukan situs live.

### Not done (scope terpisah)

* `templates/` (8 KSP + 5 Auth + App Prototype) belum bermigrasi ke token
  Astryx asli — masih pakai page-pattern class lama + legacy alias.

Detail lengkap: `DECISIONS.md` ADR-051.

---

## 2026-07-29 — Astryx agent docs resmi menggantikan workflow manual di AGENTS.md

Ditemukan saat user menanyakan apakah "Workflow Astryx wajib" di `AGENTS.md`
sesuai dokumentasi resmi Astryx (astryx.atmeta.com/docs/working-with-ai):
section tersebut ternyata tulisan manual (dibuat saat ADR-041) yang meniru
konsep dokumentasi resmi, bukan output CLI asli — berpotensi salah/basi
dibanding command resmi `astryx init --features agents`. User meminta
diganti dengan yang resmi.

### Changed

* `apps/web/.claude/CLAUDE.md` — **baru**, di-generate via
  `bunx astryx init --features agents --agent claude` (dijalankan dari
  `apps/web`). Berisi component index (153 komponen), workflow discovery
  resmi (`astryx build` → `template` → `component`), aturan styling/token,
  CLI reference — semua ditarik otomatis dari `@astryxdesign/cli` v0.1.8
  yang ter-pin. Diberi marker `<!-- ASTRYX:START/END -->` sehingga bisa
  di-regenerate in-place setelah upgrade Astryx.
* `AGENTS.md` — section "Workflow Astryx wajib" (4 langkah manual) dan
  aturan keras #12 diganti: sekarang menunjuk ke
  `apps/web/.claude/CLAUDE.md` sebagai sumber resmi, bukan menyalin ulang
  langkah CLI secara manual. Baris "UI component / styling" di tabel
  mapping task ditambahkan referensi file ini.
* `DEVELOPER_WORKFLOW.md` — node diagram mermaid yang menyebut
  `template --list → component --dense` (langkah lama) diupdate menjadi
  pointer ke `apps/web/.claude/CLAUDE.md`.

---

## 2026-07-29 — MCP server Astryx (`xds`) ditambahkan

Susulan dari perubahan agent docs resmi di atas — user memutuskan lanjut
setup MCP server setelah trade-off (CLI lokal ter-pin vs server live)
dijelaskan.

### Changed

* `.mcp.json` — **baru** di root repo, mendaftarkan server `xds`
  (`https://astryx.atmeta.com/mcp`) sesuai konfigurasi resmi dari
  dokumentasi Astryx. Meng-expose tool `search(query)` dan `get(name)`
  untuk pencarian/lookup komponen tanpa shell out ke CLI.
* `AGENTS.md` — catatan baru di section "Workflow Astryx wajib": MCP
  boleh dipakai untuk exploration/pencarian awal, tapi keputusan final
  props/API tetap harus diverifikasi lewat CLI lokal v0.1.8 yang ter-pin
  — karena server MCP menunjuk ke versi live yang bisa beda dari versi
  ter-install (Astryx masih Beta).

---

## 2026-07-29 — ADR-050: method service Transfer Ownership & Delete Workspace

Menutup gap yang ditemukan ADR-049: `deleteWorkspace` dan
`transferOwnership` sama sekali tidak punya method service. User meminta
gap ini diperbaiki langsung, bukan ditunda sampai screen dirancang.

### Temuan & keputusan

* `deleteWorkspace` — tidak ada ambiguitas (skema DB sudah `ON DELETE
  CASCADE` di semua tabel `workspace_id`). Ditambahkan langsung: Owner
  saja, wajib konfirmasi Tier 1.
* `transferOwnership` — ternyata punya fork nyata yang belum pernah
  diputuskan di dokumen manapun: langsung vs butuh persetujuan target.
  User memilih **butuh persetujuan** — proses dua langkah:
  * `transferOwnership(targetMemberId)` — Owner memicu, isi
    `pendingOwnerTransferTo`, kirim notifikasi. Belum menukar role.
  * `acceptOwnershipTransfer()` — Admin target menerima, role baru
    bertukar, `pendingOwnerTransferTo` dikosongkan.
  * Pola ini meniru `inviteMember`/`acceptInvite` yang sudah ada di
    dokumen yang sama — bukan pola baru yang asing.

### Changed (dokumentasi)

* `application-layer.md` — 3 method baru di `WorkspaceService`
  (`transferOwnership`, `acceptOwnershipTransfer`, `deleteWorkspace`);
  catatan gap ADR-049 sebelumnya dihapus (sudah resolved).
* `domain-model.md` — field baru `Workspace.pendingOwnerTransferTo`; 2
  `NotificationType` baru (`ownership_transfer_requested`,
  `ownership_transfer_resolved`); DM-D11.
* `database-strategy.md` — kolom baru `pending_owner_transfer_to` di
  `workspaces`.
* `roles-permissions.md` — klarifikasi alur dua langkah + Related
  Documents.
* `DECISIONS.md` — ADR-050 baru.
* `PROJECT_STATE.md` — Completed, Next Tasks (disederhanakan — screen
  jadi satu-satunya blocker tersisa), Recent Decisions.

### Belum dikerjakan (task terpisah)

* Screen Workspace Settings → General/Members (di luar 8 KSP) — masih
  satu-satunya yang menghalangi implementasi Transfer Ownership/Delete
  Workspace/Remove Member di kode maupun App Prototype.

---

## 2026-07-29 — ADR-049: kebijakan Safety Check / Double Confirmation lintas produk

Lanjutan audit ADR-047/ADR-048: user meminta penilaian eksplisit — dari
seluruh aksi yang teridentifikasi, mana yang **seharusnya** wajib
Safety Check / Double Confirmation, berdasarkan kerangka reversibilitas +
blast radius.

### Kerangka & klasifikasi

* **Kriteria wajib:** irreversibel/mahal dibatalkan, ATAU blast radius
  besar (dampak melampaui data milik pengguna sendiri).
* **Tier 1** (konfirmasi diperkuat): Transfer Ownership, Delete/Hapus
  Workspace.
* **Tier 2** (dialog standar, pola Disconnect Confirmation): Delete Post,
  Delete Media, Remove Member, Update Member Role, Cancel Schedule,
  **Logout**.
* **Tidak wajib** (reversibel/frekuensi tinggi — UXP-03): Save as Draft,
  Kirim ke Review, Mark as Done, Reply komentar, Connect Account,
  Reconnect, Remove Link.
* User memindahkan **Logout** dari rekomendasi awal ("tidak perlu",
  karena reversibel penuh) ke **Tier 2** — dicatat sebagai keputusan
  eksplisit di ADR-049, bukan rekomendasi yang diikuti begitu saja.

### Temuan tambahan

* `deleteWorkspace` dan `transferOwnership` (dua aksi Tier 1) **belum
  punya method service sama sekali** di `application-layer.md` —
  screen pemicunya (Workspace Settings → General) belum pernah
  dirancang. Dicatat sebagai gap terpisah, bukan diperbaiki sekarang
  (menghindari menebak kontrak API tanpa desain layar).

### Changed (dokumentasi)

* `key-screen-patterns.md` — bagian baru "Pola Lintas Layar — Safety
  Check / Double Confirmation": kriteria, tabel tier, klasifikasi
  lengkap 17 aksi, catatan implementasi.
* `navigation-patterns.md` — NP-D10 baru (Logout wajib Tier 2) + catatan
  di bagian User Settings.
* `ux-principles.md` — bullet baru di UXP-04 menautkan ke kebijakan ini
  (bukan UXP baru — exit criteria dokumen membatasi ke 7 prinsip
  bertelusur insight I-01–I-08).
* `roles-permissions.md` — cross-reference tier di baris Hapus
  Workspace, Transfer Ownership, Undang/hapus member, Ubah role member.
* `application-layer.md` — cross-reference tier di `removeMember`,
  `updateMemberRole`, `cancelSchedule`, `deletePost`, `deleteMedia`,
  `disconnectAccount`; catatan gap `deleteWorkspace`/`transferOwnership`.
* `DECISIONS.md` — ADR-049 baru.
* `PROJECT_STATE.md` — Completed, Next Tasks (2 entry baru), Recent
  Decisions.

### Belum dikerjakan (task terpisah)

* Implementasi seluruh aksi Tier 1/Tier 2 yang baru diklasifikasikan
  (Cancel Schedule, Delete Post, Delete Media, Update Member Role,
  Logout) — baik di kode maupun App Prototype.
* Desain layar Workspace Settings → General/Members + method service
  `deleteWorkspace`/`transferOwnership` (prasyarat Tier 1).

---

## 2026-07-29 — Audit Safety Check/Double Confirmation seluruh aksi; ADR-048 Disconnect Confirmation

Lanjutan diskusi ADR-047 (Publish Now): user bertanya apakah setiap aksi
di produk melewati Safety Check/Double Confirmation. Audit menyeluruh
atas seluruh dokumen `product-discovery/` untuk memetakan setiap aksi
(publish, draft, akun, member, workspace, logout, dll.) terhadap ada/
tidaknya spesifikasi konfirmasi.

### Temuan

* Hanya **1 pola konfirmasi** yang terdokumentasi di seluruh produk:
  Confirmation Summary (KSP-05-F06), dipakai Schedule dan (sejak
  ADR-047) Publish Now.
* **Logout** tidak melewati Safety Check sama sekali — cuma disebut
  sebagai satu baris di User Menu (`navigation-patterns.md`), tanpa
  mention konfirmasi apa pun.
* Kalimat usang: `key-screen-patterns.md` sempat mengklaim Schedule
  sebagai *"satu-satunya momen"* konfirmasi eksplisit — sudah tidak
  akurat sejak ADR-047 menambahkan Publish Now. Diperbaiki jadi
  "satu-satunya **pola**" (masih akurat — cuma ada 1 pola, dipakai 2
  aksi).
* 4 aksi berisiko/destruktif — **Disconnect Account, Remove Member,
  Transfer Ownership, Delete Workspace** — sama sekali tidak punya
  spesifikasi konfirmasi. Dari keempatnya, hanya Disconnect Account yang
  sudah punya screen nyata (KSP-08); tiga lainnya belum pernah dirancang
  sebagai layar sama sekali (Workspace Settings → Members/General di
  luar 8 KSP).

### ADR-048 — Disconnect Account wajib dialog konfirmasi

* Fungsi baru **KSP-08-F07 (Disconnect Confirmation)** — dialog
  peringatan ringkas (bukan Confirmation Summary) sebelum eksekusi,
  mengingatkan bahwa post terjadwal untuk akun tersebut tetap di antrean
  (KSP-D09), tidak otomatis dibatalkan.
* Pola baru "Pola: Disconnect Flow" + baris Decision Log **KSP-D14** di
  `key-screen-patterns.md`.
* Tidak ada perubahan RBAC — akses Disconnect tetap Owner/Admin sesuai
  `roles-permissions.md` yang sudah ada; hanya ditambah catatan silang.
* Remove Member, Transfer Ownership, Delete Workspace **sengaja ditunda**
  — screen-nya belum pernah dirancang, perlu inisiatif desain terpisah
  sebelum pola konfirmasinya bisa diputuskan.

### Changed (dokumentasi)

* `key-screen-patterns.md` — KSP-08-F05 diperjelas, KSP-08-F07 baru,
  "Pola: Disconnect Flow" baru, KSP-D14 baru, kalimat "satu-satunya
  momen" diperbaiki, KSP-D05 disinkronkan.
* `roles-permissions.md` — baris "Tambah/hapus connected accounts" diberi
  catatan silang ke ADR-048; Related Documents diperbarui.
* `DECISIONS.md` — ADR-048 baru.
* `PROJECT_STATE.md` — Completed, Next Tasks (3 entry: Publish Now,
  Disconnect Confirmation, dan catatan ditunda untuk Remove
  Member/Transfer Ownership/Delete Workspace), Recent Decisions.

### Belum dikerjakan (task terpisah)

* Implementasi dialog Disconnect Confirmation di App Prototype
  (`settings-connected-accounts.html`) dan di kode nyata.
* Desain layar Workspace Settings → Members/General/Billing (prasyarat
  sebelum Remove Member/Transfer Ownership/Delete Workspace bisa dapat
  pola konfirmasi).

---

## 2026-07-29 — App Prototype: fix navigasi back + role switcher; ADR-047 Publish Now

Dua pekerjaan berurutan di sesi yang sama.

### 1. App Prototype Claude Design

* Fix bug: tombol "Kembali ke Calendar" di Draft Editor (`AppPrototype.dc.html`)
  selalu paksa balik ke Calendar walau dibuka dari Queue/Drafts —
  bertentangan `navigation-patterns.md` NP-D02. Diperbaiki jadi
  stack-aware (mengikuti riwayat navigasi asli); label tombol ikut
  menyesuaikan ("Kembali ke Queue"/"Kembali ke Drafts").
* Tambah role switcher (Owner/Admin/Manager/Creator → persona
  Dimas/Maya/Raka/Sinta) di toolbar prototype. Mendemokan pembatasan
  akses per role (`roles-permissions.md`) di 4 layar: Draft Editor
  (Schedule vs "Kirim untuk Review"), Engage (nav dikunci untuk Creator),
  Connected Accounts (read-only untuk Manager/Creator), Analyze Dashboard
  (detail disembunyikan untuk Creator).
* Perubahan ter-push ke project Claude Design "Social Media Management"
  via `DesignSync` (tidak ada perubahan di repo lokal untuk bagian ini).

### 2. ADR-047 — Publish Now

Audit konsistensi (dipicu saat kerja App Prototype, pertanyaan user
"bisakah user upload langsung tanpa schedule?") menemukan
`application-layer.md` menyebut method `publishNow` yang sama sekali
tidak dikenal di UX Baseline (`key-screen-patterns.md`) maupun
`roles-permissions.md`. Setelah diskusi soal role, diputuskan:

* Publish Now diangkat jadi fitur UX resmi: KSP-05 dapat function ID baru
  **KSP-05-F12**; bullet baru di `mvp-definition.md`; ditambahkan ke
  hierarki layar dan tabel pemetaan fitur di `information-architecture.md`.
* Akses dibatasi **identik** dengan Schedule: Owner, Admin, Manager —
  bukan tingkat akses baru, bukan lebih ketat (opsi "hanya Owner/Admin"
  dipertimbangkan dan ditolak demi konsistensi pola yang sudah ada).
  Baris transisi baru `Draft → Published (Publish Now, skip jadwal)` di
  `roles-permissions.md`.
* `application-layer.md` — baris `publishNow` diperjelas: rujuk
  KSP-05-F12, RBAC sama dengan `schedulePosts`, tetap wajib validasi
  matriks `ContentFormat` (ADR-039).

### Changed (dokumentasi)

* `mvp-definition.md`, `key-screen-patterns.md`, `information-architecture.md`,
  `roles-permissions.md`, `application-layer.md` — lihat detail di atas.
* `DECISIONS.md` — ADR-047 baru.
* `PROJECT_STATE.md` — Completed (2 entry baru), Next Tasks (implementasi
  Publish Now di kode + App Prototype belum berjalan), Recent Decisions.

### Belum dikerjakan (task terpisah)

* Implementasi `PublishingService.publishNow()` di kode.
* Tombol "Publish Now" di Draft Editor App Prototype (role switcher yang
  baru ditambahkan sudah siap dipakai untuk membatasi visibility-nya).

---

## 2026-07-29 — ADR-046 Amandemen Final: `/publish` redirect permanen

User memutuskan bentuk akhir `/publish` (pertanyaan yang ditunda dari sesi
2026-07-28): formalkan state interim sebagai **final**, bukan sekadar
sementara. Tidak ada perubahan kode — hanya dokumentasi, karena kode sudah
dalam bentuk yang diputuskan sejak revert 2026-07-28.

### Keputusan

* `/{slug}/publish` **permanen** redirect ke `/{slug}/publish/calendar`;
  `calendar/` (+ `calendar/[postId]`) **permanen** jadi folder statis.
* Publish dikecualikan **permanen** dari pola root-render ADR-046 —
  satu-satunya section dengan sibling route dinamis (`[postId]`) di root,
  sehingga root-render di sana akan menangkap path lama secara salah.
* Alternatif yang dipertimbangkan dan ditolak: root-render + rename
  `[postId]` ke path lain (mis. `/publish/post/[postId]`); root-render +
  `[postId]` sebagai intercepting/parallel route (modal). Keduanya
  menambah kompleksitas nyata untuk manfaat kosmetik (satu redirect lebih
  sedikit).

### Changed (dokumentasi)

* `DECISIONS.md` — ADR-046 ditambah section "Amandemen Final
  (2026-07-29)"; baris Publish di poin Decision #1 ditandai superseded;
  "Catatan Tambahan (2026-07-28)" ditandai interim/sudah diamandemen.
* `monorepo-setup.md` — route tree, Aturan Routing, dan MS-D09 diperbarui:
  "pengecualian sementara" → "pengecualian permanen".
* `application-layer.md` — Contoh 3: "interim" → "permanen".
* `PROJECT_STATE.md` — Known Issues (item Publish belum final dihapus),
  Completed (entry baru), Next Tasks (item diskusi lanjutan dihapus —
  tidak ada lagi yang menggantung), Recent Decisions diperbarui.

### Verified

* Tidak ada perubahan kode — verifikasi live 2026-07-28 (ngrok tunnel,
  akun test Raka Pratama) tetap berlaku untuk keputusan final ini.

---

## 2026-07-28 — ADR-046 (Publish): revert interim ke `/publish/calendar`

Verifikasi live ADR-046 menemukan `/publish/calendar` (path lama) tidak
404 — malah tertangkap `publish/[postId]` (memperlakukan `"calendar"`
sebagai ID) dan merender placeholder salah. Atas instruksi user, bagian
Publish di-revert sementara sambil menunggu diskusi lanjutan soal bentuk
akhir `publish/page.tsx`.

### Changed (kode)

* `publish/[postId]/` → `publish/calendar/[postId]/`; `publish/page.tsx`
  (isi Calendar) → `publish/calendar/page.tsx`.
* `publish/page.tsx` (baru) — cuma `redirect(`/${slug}/publish/calendar`)`.
* Home, Engage, Settings **tidak diubah** — tetap final sesuai ADR-046.

### Changed (dokumentasi)

* `DECISIONS.md` — ADR-046 ditambah section "Catatan Tambahan (2026-07-28,
  belum final)" mencatat temuan collision + revert interim; poin Decision
  asli tidak dihapus/ditulis ulang, tetap jadi catatan historis apa yang
  awalnya diputuskan.
* `monorepo-setup.md` — route tree `publish/` disesuaikan (`calendar/`
  kembali jadi folder), Aturan Routing dan MS-D09 mencatat Publish sebagai
  pengecualian sementara.
* `application-layer.md` — Contoh 3 disesuaikan kembali ke
  `/publish/calendar`.
* `PROJECT_STATE.md` — Known Issues, Completed, dan Next Tasks diperbarui;
  next task baru: lanjutkan diskusi bentuk final `publish/page.tsx` di
  sesi berikutnya.

### Verified

* `bun run typecheck`, `bun run lint`, `bun run test` — hijau.
* Live via ngrok tunnel: `/insvire/publish` redirect ke
  `/insvire/publish/calendar`, render "Content Calendar", sidebar Publish
  tetap ter-highlight.

### Status

**Belum final.** Ditunda ke sesi berikutnya atas permintaan user.

---

## 2026-07-28 — ADR-046: Routing convention, default view render di root path

Diskusi berawal dari temuan bahwa klik "Publish"/"Engage" di sidebar 404
karena parent segment (`layout.tsx`) tidak punya `page.tsx` sendiri. Audit
lanjutan menemukan pola yang sama berulang di 4 titik: root workspace
(`/{slug}`), `/publish`, `/engage`, `/settings` — semuanya cuma punya
`layout.tsx` (atau tidak punya apa-apa) di root, tanpa `page.tsx`/redirect.

### Added

* ADR-046 di `DECISIONS.md` — default/single view section (Home,
  Publish→Calendar, Engage→Inbox, Settings→General) merender langsung di
  `page.tsx` root path section, bukan named child segment. Menghapus
  `/home`, `/publish/calendar`, `/engage/inbox`, `/settings/general` dari
  routing structure secara permanen (bukan redirect kompatibilitas — belum
  ada internal link yang bergantung padanya, dikonfirmasi lewat audit grep
  menyeluruh terhadap kode dan dokumentasi).

### Changed

* `product-discovery/06-engineering/monorepo-setup.md` — App Router route
  tree diperbarui (hapus `home/`, `calendar/`, `inbox/`, `general/` sebagai
  folder terpisah; `calendar/[postId]` → `[postId]` sejajar dengan
  `queue/drafts/history`); tambah aturan routing baru + MS-D09 di Decision
  Log.
* `product-discovery/05-architecture/application-layer.md` — Contoh 3
  ("Load Halaman Calendar") diperbarui dari `/[workspace]/publish/calendar`
  menjadi `/[workspace]/publish`.
* `information-architecture.md` dan `navigation-patterns.md` **tidak
  diubah** — dikonfirmasi tidak menyebut literal URL path sama sekali,
  hanya struktur tab/screen konseptual yang tidak terdampak keputusan ini
  (IA-D04 Calendar sebagai default tab tetap berlaku).

### Note

Dokumentasi baseline diselaraskan lebih dulu; implementasi kode menyusul
di entri di bawah setelah go-ahead eksplisit dari user.

---

## 2026-07-28 — ADR-046: Implementasi routing default view

Branch `feat/adr-046-routing-default-view` (dari `feat/m8-publishing-draft-persistence`).

### Changed

* `apps/web/src/app/[slug]/home/page.tsx` → `apps/web/src/app/[slug]/page.tsx`
* `apps/web/src/app/[slug]/publish/calendar/page.tsx` → `.../publish/page.tsx`
* `apps/web/src/app/[slug]/publish/calendar/[postId]/page.tsx` → `.../publish/[postId]/page.tsx`
* `apps/web/src/app/[slug]/engage/inbox/page.tsx` → `.../engage/page.tsx`
* `apps/web/src/app/[slug]/settings/general/page.tsx` → `.../settings/page.tsx`
* Redirect target `/${slug}/home` → `/${slug}` di `app/page.tsx`,
  `onboarding/actions.ts`, `onboarding/page.tsx`.
* `WorkspaceSideNav` — href Home ke root workspace; `isSelected` Home pakai
  exact match pathname (bukan `startsWith`, karena semua route lain juga
  diawali `/${slug}` — `startsWith` akan membuat Home permanen ter-highlight).

### Verified

* `bun run typecheck`, `bun run lint`, `bun run test` — hijau (21/21 test).
* Live via ngrok tunnel dengan akun test (Raka Pratama): `/insvire`,
  `/insvire/publish`, `/insvire/engage`, `/insvire/settings` semua render
  default view langsung tanpa 404; sidebar highlight benar per section.
  `/insvire/engage/inbox` dan `/insvire/settings/general` (path lama)
  terkonfirmasi 404 bersih.

### Known Issue Ditemukan

* `/publish/calendar` (path lama) **tidak** 404 — tertangkap oleh
  `publish/[postId]` (memperlakukan `"calendar"` sebagai ID), merender
  placeholder Draft Editor. Dicatat di `PROJECT_STATE.md` → Known Issues;
  bukan regresi baru (karakteristik placeholder `[postId]` yang belum wired
  ke data asli), akan otomatis teratasi saat lookup by ID diimplementasikan.

---

## 2026-07-28 — Publishing MVP: persistensi nyata "Save as Draft"

### Added

* `PublishingService.saveDraft()` — domain layer baru di
  `apps/web/src/domains/publishing/services/`, diuji unit dengan fake
  repository (pola sama dengan `WorkspaceService`).
* `publishingRepository.createDraft()` — implementasi Prisma untuk
  `IPublishingRepository` di `apps/web/src/lib/repositories/publishing/`.
* `saveDraftAction` di `/publish/drafts/new/actions.ts` — resolve session +
  workspace by slug, lalu delegasikan ke `PublishingService.saveDraft()`.

### Changed

* Draft Editor (`/publish/drafts/new`) — tombol "Save as Draft" kini
  memanggil persistensi nyata (bukan lagi mock notice); mendapat post ID
  asli di success banner. Diverifikasi via browser (ngrok tunnel) dan cek
  langsung row di Supabase. "Schedule" tetap mock — menunggu
  `OutstandAdapter`/kredensial Outstand (ADR-040).

### Fixed

* `PROJECT_STATE.md` — section **In Progress** dan **Next Tasks** masih
  menyebut persistensi Publishing MVP sebagai belum dimulai, padahal
  implementasi di atas sudah selesai dan ter-commit. Dipindahkan ke
  **Completed**; sisa scope ("Schedule" + `OutstandAdapter`) disesuaikan.

---

## 2026-07-28 — Hapus folder `design/` (ADR-045)

Diskusi menemukan bahwa `design/` bukan acuan AI/engineering (SoT UI yang
benar-benar dipakai: `04-ux/` + `design-tokens.md` + Astryx CLI, dikonfirmasi
lewat `context/ctx-design.md`), dan belum ada designer aktif yang memakai
paket handoff-nya. Diputuskan hapus dengan versi ringan — pindahkan pointer
Claude Design, baru hapus sisanya.

### Removed

* Folder `design/` seluruhnya: `README.md`, `DESIGN_OVERVIEW.md`,
  `DESIGN_BRIEF.md`, `DESIGN_ONEPAGER.html`,
  `Design-Brief-Social-Media-Management.pdf`,
  `Design-One-Pager-Social-Media-Management.pdf`, `_build-brief-pdf.mjs`.

### Added

* ADR-045 di `DECISIONS.md` — mencatat penghapusan, alasan, dan alternatif
  yang dipertimbangkan; menegaskan tidak mengubah ADR-038 (SoT token) maupun
  ADR-042 (Claude Design sebagai handoff tool).
* `context/ctx-design.md` ditulis ulang — sekarang murni pointer ke UX
  Baseline (`04-ux/`) dan project Claude Design (project ID, akses,
  `DesignSync`), tanpa referensi ke file `design/` yang sudah tidak ada.

### Changed

* Referensi ke `design/` diperbarui/dihapus di 12 dokumen lain: `AGENTS.md`,
  `context/README.md`, `context/ctx-technical-context.md`,
  `project-manager/PROJECT_OVERVIEW.md`, `PROJECT_STATE.md`, `README.md`,
  `DEVELOPER_WORKFLOW.md`, `.agents/skills/project-os-navigator/SKILL.md`,
  `product-discovery/README.md`,
  `product-discovery/06-engineering/README.md`,
  `product-discovery/06-engineering/design-tokens.md`,
  `product-discovery/04-ux/README.md` — semua diarahkan ke
  `context/ctx-design.md` sebagai pointer baru.

---

## 2026-07-28 — Audit sinkronisasi dokumentasi lintas folder

Hasil audit menyeluruh (project-manager/, context/, product-discovery/, design/, vs kode aktual) menemukan 4 inkonsistensi struktural; semuanya diperbaiki di sesi ini.

### Fixed

* `AGENTS.md` (root) — tabel Source of Truth dan section "Related" belum
  mencantumkan `project-manager/DEVELOPER_WORKFLOW.md`, meski file itu sudah
  didaftarkan sebagai Core Document di `project-manager/README.md`. Agent
  yang strictly mengikuti AGENTS.md tidak akan menemukan file ini. Ditambahkan
  ke kedua section.
* `product-discovery/05-architecture/database-strategy.md` — kolom
  `workspace_connected_accounts.platform` masih mendaftar
  `instagram | facebook | twitter | linkedin | tiktok | youtube` saja,
  belum menyertakan `threads` dan `pinterest` yang ditambahkan ADR-037.
  Dokumen sibling-nya (`domain-model.md`) sudah benar; `database-strategy.md`
  kelewat saat sinkronisasi ADR-037. Diperbaiki agar konsisten.
* `design/DESIGN_BRIEF.md` — version metadata internal tidak konsisten
  (header `v1.1.0` vs footer `v1.0.0`, sisa dari commit `f658175` yang bump
  header tapi lupa footer). Diselaraskan jadi `v1.2.0` (menyamai
  `design/DESIGN_OVERVIEW.md` yang sudah di `v1.2.0` sejak commit `b1f9e6c`).
* `design/DESIGN_BRIEF.md` — belum menyertakan section **A.5.1 Auth Flow
  (suplemen, di luar 8 KSP)** yang sudah ada di `DESIGN_OVERVIEW.md` sejak
  commit `b1f9e6c` (5 layar pre-session: login, register, verify-email,
  forgot/reset password). Commit tersebut hanya mengubah `DESIGN_OVERVIEW.md`
  + `design/README.md`, tidak menyentuh `DESIGN_BRIEF.md` — padahal Brief
  seharusnya mirror Overview (per `design/README.md`). Section A.5.1 beserta
  referensi `templates/auth-*.html` di tabel struktur Claude Design dan B.7
  ditambahkan agar Brief (sumber PDF handoff resmi) tidak stale dibanding
  Overview.

---

## 2026-07-28 — Sinkronisasi PROJECT_STATE.md dengan kondisi repo (M8)

### Fixed

* `PROJECT_STATE.md` belum mencatat 4 commit M8 yang sudah merge (PR #15,
  2026-07-24): Workspace App Shell (SideNav + logout), `getWorkspaceBySlug`,
  Draft Editor mock data, dan config `allowedDevOrigins` ngrok. Status
  ditulis ulang: Current Status → M8 In Progress, Milestone Progress M8 →
  🟡 In Progress, section "In Progress" yang menyebut "UI Draft Editor belum
  diimplementasi" dihapus (sudah ada, mock data) dan diganti fokus baru:
  persistensi nyata + integrasi `OutstandAdapter`.

### Added

* **M8 — Workspace App Shell:** layout `[slug]` diganti dari placeholder
  kosong menjadi `AppShell` + `SideNav` persisten (Home/Publish/Engage/
  Analyze/Start Page) sesuai `navigation-patterns.md`. Sidebar header
  menampilkan nama workspace aktif via `WorkspaceService.getWorkspaceBySlug`
  (+ `IWorkspaceRepository.findBySlug` baru), footer berisi user dropdown
  dengan Profile dan Logout (`authClient.signOut`).
* **M8 — Draft Editor (mock data):** `/publish/drafts/new` (KSP-05) —
  Caption Editor, Account Selector, Content Format Selector per akun sesuai
  matriks ADR-039 (IG/FB: Post/Reel/Story; Pinterest: Pin + title/link;
  platform lain: Post), Schedule Picker, dan Confirmation Summary dialog.
  Connected accounts masih mock data (`OUTSTAND_API_KEY`/
  `OUTSTAND_WEBHOOK_SECRET` belum tersedia) — Save as Draft / Schedule hanya
  menampilkan notice mock, belum persist. Halaman placeholder Drafts kini
  link ke editor ini via CTA New Post. Persistensi nyata + integrasi
  `OutstandAdapter` adalah follow-up ADR-040.
* Dev config: `next.config.ts` — `allowedDevOrigins` menambahkan hostname
  tunnel ngrok untuk uji lokal (nilai efemeral).

---

## 2026-07-24 — M8: Workspace Onboarding (create-workspace flow)

### Added

* Onboarding Flow (First Login) dari `auth-architecture.md` diimplementasikan:
  `proxy.ts` — auth guard pakai `getSessionCookie` (Better Auth, tanpa DB
  call, cookie-presence check saja) untuk route terproteksi vs halaman auth
  publik; root `src/app/page.tsx` — Server Component yang memanggil
  `auth.api.getSession()` lalu redirect ke `/login`, `/{slug}/home`, atau
  `/onboarding` sesuai status workspace user; `src/app/onboarding/` — halaman
  create-workspace (1 field: nama, slug auto-generate) dengan Server Action
  `createWorkspaceAction`.
* `WorkspaceService` (BC-02) pertama kali diimplementasikan di
  `src/domains/workspace/`: `createWorkspace` (validasi nama, generate slug
  via value object `slugify`, retry suffix numerik saat slug bentrok, buat
  `Workspace` + `WorkspaceMember` role Owner via transaksi Prisma) dan
  `getDefaultWorkspaceSlugForUser` (dipakai orkestrasi redirect root/onboarding
  — bukan bagian tabel kontrak `WorkspaceService` di `application-layer.md`,
  ditambahkan untuk kebutuhan orkestrasi tanpa melanggar boundary).
  Implementasi repository Prisma di `src/lib/repositories/workspace/`
  (MS-D05 — repository implementation terpisah dari folder domain).
* Hierarki error `ApplicationError` (`AuthorizationError`, `NotFoundError`,
  `ValidationError`, `ConflictError`, `ExternalServiceError`) dari
  "Error Handling Strategy" (`application-layer.md`) diimplementasikan di
  `src/lib/utils/errors.ts` — infra bersama lintas domain, dipakai
  `WorkspaceService` dan siap dipakai Application Service BC lain.
* `MemberStatus` enum (`pending | active | removed`) ditambahkan ke
  `packages/shared` — sudah didokumentasikan di `domain-model.md` tapi belum
  ada di shared types.
* Test Vitest baru: `slugify` (edge case aksen, simbol, panjang), dan
  `WorkspaceService.createWorkspace` (validasi, retry-on-conflict, exhaustion)
  pakai fake in-memory repository.
* `apps/web/src/app/astryx-smoke.tsx` dihapus dari root route — tugasnya
  sebagai smoke test ADR-041 sudah selesai; root `page.tsx` sekarang berisi
  redirect logic produksi.

### Fixed

* Deteksi slug-conflict di `workspace.repository.ts` awalnya mengandalkan
  `error.meta.target` (nama kolom) untuk mengenali `P2002` — dengan driver
  adapter `@prisma/adapter-pg` (Prisma 7), `meta.target` tidak terisi
  sehingga retry logic tidak pernah terpicu dan slug bentrok akan crash
  alih-alih di-retry. Diverifikasi langsung dengan skrip terhadap database
  Supabase Cloud nyata (bukan hanya unit test dengan fake repository) —
  ditemukan lewat percobaan create-workspace kedua dengan nama sama. Fix:
  deteksi pakai `error.code === "P2002" && error.meta?.modelName === "Workspace"`
  (satu-satunya unique constraint pada `Workspace` selain PK adalah `slug`).

---

## 2026-07-24 — Better Auth Dash (official admin/monitoring plugin, optional)

### Added

* `@better-auth/infra` terpasang di `apps/web` — plugin `dash()` di
  `apps/web/src/lib/better-auth/auth.ts`, aktif hanya jika
  `BETTER_AUTH_API_KEY` terisi (pola sama dengan Google OAuth conditional).
  Tanpa API key, plugin tidak dipasang sama sekali (`plugins: undefined`) —
  tidak mengubah behavior auth existing.
* Env var baru (opsional, EM-D04): `BETTER_AUTH_API_KEY`, `BETTER_AUTH_API_URL`,
  `BETTER_AUTH_KV_URL` — dikatalogkan di `apps/web/.env.example` dan
  `apps/web/src/lib/env.ts`. Nilai aktual diisi manual oleh Project Owner di
  `.env.local` (bukan lewat agent).
* Ini dashboard resmi dari tim Better Auth untuk monitoring/admin auth
  server (bukan bagian dari `05-architecture/auth-architecture.md` atau
  `06-engineering/auth-strategy.md` — kalau mau dipakai permanen di
  production, disarankan dicatat lewat ADR terpisah agar konsisten dengan
  aturan baseline).

### Fixed

* `GET /api/auth/dash/validate` 500 — `Failed to parse URL from /api/auth/jwks`.
  Penyebab: `dash({ apiUrl: process.env.BETTER_AUTH_API_URL, ... })` selalu
  mengirim key `apiUrl`/`kvUrl` walau env var-nya kosong; `@better-auth/infra`
  men-spread raw options **setelah** default resolution-nya sendiri, jadi
  `apiUrl: undefined` eksplisit menimpa default bawaan (`https://dash.better-auth.com`)
  balik jadi `undefined` → JWKS self-check gagal parse URL relatif tanpa base.
  Diverifikasi langsung dengan memanggil `dash()` secara terisolasi (bukan
  tebakan). Fix: key `apiUrl`/`kvUrl` di-omit total (bukan diisi `undefined`)
  saat env var-nya tidak diset.

---

## 2026-07-24 — M8: Auth Flows UI (Login, Register, Forgot/Reset Password)

### Added

* Implementasi 4 layar auth di `apps/web/src/app/(auth)/` — mengganti
  placeholder scaffold M7: `login/`, `register/`, `forgot-password/`, dan
  route baru `reset-password/` (dua-state form + halaman tautan tidak
  valid). Layout bersama `(auth)/layout.tsx` (brand row + Center) mengikuti
  referensi visual Claude Design (`templates/auth-*.html`, ADR-042
  supplement Auth Flow).
* `apps/web/src/lib/better-auth/client.ts` — Better Auth React client
  (`createAuthClient`, tanpa `baseURL` eksplisit; default current origin).
* `googleOAuthEnabled()` di `apps/web/src/lib/env.ts` — tombol Google OAuth
  otomatis disembunyikan saat `GOOGLE_CLIENT_ID`/`SECRET` kosong.
* `sendResetPassword` stub di `apps/web/src/lib/better-auth/auth.ts` — log
  tautan reset ke server console; alur forgot/reset password jadi
  end-to-end testable secara lokal tanpa provider email (AS-D04 masih
  terbuka).
* Halaman UI mengikuti workflow Astryx CLI wajib (`template --list`,
  `component --dense` untuk Button/TextInput/Card/Banner/Divider/
  CheckboxInput/dll.) sesuai `AGENTS.md`.

### Verified

* `bun run typecheck` dan `bun run lint` hijau.
* Sign-up end-to-end diverifikasi via raw `fetch()` ke
  `/api/auth/sign-up/email` (akun berhasil dibuat, token session valid).
* Tampilan login & register dicek visual di browser — cocok dengan
  referensi Claude Design.

### Known Issue (terpisah, tidak menahan pass ini)

* Uji interaksi form (klik submit) via tunnel ngrok tidak berhasil
  memicu React `onSubmit` — seluruh halaman (bukan cuma form auth)
  tidak ter-hydrate saat diakses lewat tunnel tersebut (tidak ada
  React fiber di elemen manapun setelah >5 detik, walau `window.next`
  sudah termuat, tanpa error console). Kemungkinan besar isu HMR/WebSocket
  Turbopack lewat ngrok, bukan bug di kode auth — perlu diselidiki
  terpisah sebelum uji interaksi form penuh di browser bisa diandalkan.

---

## 2026-07-24 — M8 Bootstrap: Supabase Cloud + DB Migrate + ADR-044

### Added

* Project Supabase Cloud `social-media-local` dibuat (region SEA) dan
  `apps/web/.env.local` diisi (DB URL, Supabase platform, Better Auth).
* Migrasi Prisma baru `20260724075859_rename_engagement_inbox_unique_index`
  — menyamakan nama index `engagement_inbox_items_...` yang ter-truncate
  Postgres (>63 karakter) dengan yang diharapkan `schema.prisma`.

### Changed

* Rename env var client-side Supabase: `NEXT_PUBLIC_SUPABASE_ANON_KEY` →
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ADR-044) — mengikuti sistem API
  key baru Supabase (publishable/secret menggantikan anon/service_role).
  Diterapkan di `environment-management.md`, `apps/web/.env.example`,
  `apps/web/src/lib/env.ts`, `apps/web/src/lib/supabase/client.ts`.

---

## 2026-07-24 — Migrasi Next.js 16 Middleware → Proxy

### Changed

* `apps/web/src/middleware.ts` di-rename menjadi `apps/web/src/proxy.ts`;
  fungsi `middleware` di-rename menjadi `proxy`. Mengikuti file convention
  resmi Next.js 16 (https://nextjs.org/docs/messages/middleware-to-proxy);
  `config.matcher` dan behavior auth guard tidak berubah.
* Komentar pointer di `apps/web/src/lib/supabase/middleware.ts` diperbarui
  ke `src/proxy.ts` (nama file lib ini sendiri tidak berubah — bukan file
  convention Next.js).
* `product-discovery/06-engineering/monorepo-setup.md` — folder tree dan
  wording disesuaikan ke `proxy.ts`/"Proxy".
* `product-discovery/06-engineering/auth-strategy.md` — Related Documents
  update path ke `src/proxy.ts`.
* `PROJECT_STATE.md` — Known Issue deprecation warning dihapus, dicatat
  sebagai selesai di Completed.

---

## 2026-07-24 — API Mobile-Ready via Route Handler + Bearer Auth (ADR-043)

### Added

* ADR-043 di `DECISIONS.md` — Route Handler `/api/v1` (Next.js App Router)
  sebagai API mobile-ready di atas Application Service yang sama dengan web;
  tidak ada backend terpisah (Hono/Express). Better Auth Bearer plugin
  sebagai mekanisme auth mobile, menggantikan cookie session.
* `TEMP-project-owner-questions.md` — section 8: ringkasan diskusi keputusan
  ini beserta pertanyaan Project Owner dan assessment keamanan Bearer token.

### Changed

* `product-discovery/05-architecture/application-layer.md` — section baru
  "Route Handler v1 — Mobile Client" (pola entry point, workspace context
  eksplisit, versioning); Decision Log AL-D08.
* `product-discovery/06-engineering/auth-strategy.md` — section baru "Mobile
  Auth — Bearer Plugin" (konfigurasi, `trustedOrigins` custom scheme,
  `rateLimit.customRules` endpoint sensitif); Decision Log AS-D06; update
  tabel Security Considerations (brute force, Bearer token mobile).
* `product-discovery/05-architecture/auth-architecture.md` — perjelas baris
  Post-MVP "API key untuk programmatic access" agar tidak tumpang tindih
  dengan Bearer plugin mobile; Decision Log AU-D11.

---

## 2026-07-24 — Developer Workflow Notes (diagram mermaid)

### Added

* `project-manager/DEVELOPER_WORKFLOW.md` — 3 flowchart mermaid: (1) alur
  kerja project dari kebutuhan sampai kode, (2) alur pengguna auth →
  workspace → connect account → publish (visualisasi UF-01/UF-05 +
  auth-architecture.md), (3) siklus status konten per role
  (roles-permissions.md). Bersifat visualisasi, bukan Source of Truth baru.
* Didaftarkan di `project-manager/README.md` (Core Documents + folder
  structure).

---

## 2026-07-24 — Claude Design Menggantikan Figma (ADR-042)

### Added

* Project Claude Design baru `Social Media Management`
  (`84aded99-bb23-49b1-be9f-dd8f21c6873e`) — token neutral interim
  (`theme.json`/`styles.css`), foundations (color/type/layout), components
  (buttons/forms/cards/navigation/table/dialog/status-chips), dan 8 layar
  KSP-01–08 sebagai template, diakses lewat tool `DesignSync` bawaan Claude
  Code.
* ADR-042 di `DECISIONS.md` — Claude Design menggantikan Figma sebagai design
  handoff tool; sinkronisasi dengan `product-discovery/` bersifat
  manual/on-request, bukan otomatis.

### Changed

* `product-discovery/06-engineering/design-tokens.md` — seluruh referensi
  Figma diganti Claude Design (Langkah 1 review, sumber token, catatan lock).
* `design/README.md` — bagian baru "Claude Design (design system project)"
  berisi pointer projectId dan cara akses; referensi Figma diganti.
* `context/ctx-design.md` — menambah pointer Claude Design di tabel baca dulu
  dan dua aturan operasional baru (butir 10–11) soal akses via `DesignSync`
  dan sinkronisasi manual/on-request.

---

## 2026-07-23 — Konfigurasi Dasar Claude Code

### Added

* `CLAUDE.md` mengimpor `AGENTS.md` sebagai instruksi project pada setiap sesi
  Claude Code tanpa menduplikasi aturan.
* `.claude/settings.json` menambahkan schema resmi dan menolak pembacaan file
  env, private key, serta file kredensial.

### Changed

* `.gitignore` mengabaikan `.claude/settings.local.json` dan `CLAUDE.local.md`
  yang bersifat lokal serta tidak boleh dibagikan melalui repository.

---

## 2026-07-23 — Dukungan Agent Skills untuk Claude Code

### Added

* Menambahkan proyeksi project-level di `.claude/skills/` untuk 14 skill vendor
  resmi dari Better Auth, Prisma, Supabase, dan Vercel.
* Menautkan tiga skill internal (`project-os-navigator`,
  `proactive-clarification`, dan `work-report-simple`) ke sumber kanonikal di
  `.agents/skills/` agar perubahan otomatis tersedia untuk Claude Code.

### Verification

* Skills CLI mendeteksi seluruh 17 skill sebagai skill project untuk Claude
  Code.

---

## 2026-07-23 — Perbaikan Status Dinamis di AGENTS.md

### Fixed

* Menghapus status M7/M8 dan pembatasan fase aktif dari `AGENTS.md` karena file
  tersebut merupakan Static Reference.
* Section mode kerja kini hanya mengarahkan agent ke `PROJECT_STATE.md` sebagai
  satu-satunya Source of Truth untuk fase, objective, izin, dan pembatasan
  terkini.

---

## 2026-07-23 — Aturan Workflow Astryx untuk Agent

### Added

* `AGENTS.md` mewajibkan agent membaca template, skeleton, dokumentasi komponen,
  styling, dan tokens melalui CLI Astryx lokal sebelum menulis UI.
* CLI lokal ditetapkan sebagai referensi utama agar dokumentasi selalu sesuai
  exact version Astryx yang terpasang dan agent tidak menebak props.

---

## 2026-07-23 — Pembersihan Artefak UI Lama

### Removed

* Skill UI lama dari `.agents/skills/`.
* Entri skill terkait dari `skills-lock.json`.
* Referensi operasional skill lama di `AGENTS.md` dan `PROJECT_STATE.md`.

### Verification

* Tidak ada package, konfigurasi `components.json`, komponen, atau import runtime
  UI lama di aplikasi.
* Referensi pada ADR dan catatan diskusi dipertahankan sebagai riwayat keputusan,
  bukan dependency aktif.

---

## 2026-07-23 — Instalasi & Smoke Test Astryx

### Added

* Dependency Astryx dipasang dengan exact pin: Core, Neutral Theme, dan CLI
  `0.1.8`, serta StyleX `0.19.0`.
* Provider global Astryx dengan neutral theme dan integrasi router-aware
  Next.js Link.
* Halaman smoke test untuk Button, Dialog, TextInput, Table, light mode, dark
  mode, serta Tailwind token bridge.
* Script `astryx` dan konfigurasi theme package untuk CLI diagnostics.

### Changed

* Global CSS memakai cascade layer resmi Astryx + Tailwind dan token bridge.
* Root layout sekarang membungkus aplikasi dengan Astryx provider.
* `PROJECT_STATE.md` dan `TEMP-project-owner-questions.md` diperbarui untuk
  menandai implementasi fondasi dan smoke test ADR-041 selesai.

### Verification

* Astryx doctor: 5 pass, 0 warning.
* Typecheck, lint, dan 3 test lulus.
* Next.js `16.2.10` production build lulus dengan env placeholder non-rahasia.
* Browser smoke test lulus untuk render light/dark, input, table, dan interaksi
  buka/tutup dialog beserta focus management.

### Status

Fondasi Astryx ADR-041 siap digunakan untuk M8 Development. Astryx tetap Beta,
sehingga exact pin dan verifikasi ulang saat upgrade tetap wajib.

---

## 2026-07-23 — Alignment Engineering & AI Context ADR-041

### Changed

* Engineering Baseline (`monorepo-setup.md`, `dependency-strategy.md`,
  `design-tokens.md`, dan `06-engineering/README.md`) — Astryx permanen,
  neutral theme selama M8, Tailwind layout-only, wrapper selektif, design-later
  workflow, exact pin Beta, dan smoke test gate.
* `PROJECT_OVERVIEW.md` — stack UI diperbarui dari shadcn/ui Planned menjadi
  Astryx (ADR-041) + Tailwind layout-only.
* `AGENTS.md` — stack cepat, hard rule UI, dan mapping task UI diarahkan ke
  Astryx serta baseline ADR-041.
* `context/ctx-design.md`, `ctx-technical-context.md`,
  `ctx-implementation.md`, dan `ctx-development.md` — aturan operasional agent
  diselaraskan dengan component boundary, dependency guardrail, dan alur
  designer setelah feature selesai.
* `PROJECT_STATE.md` — alignment ADR-041 ditandai selesai; instalasi dan smoke
  test Astryx tetap next task.

### Status

Alignment dokumentasi ADR-041 selesai. Kode aplikasi dan dependency belum
diubah; langkah berikutnya adalah instalasi dan smoke test Astryx pada Next.js
16.

---

## 2026-07-23 — Astryx UI Foundation (ADR-041)

### Added

* ADR-041 — Astryx menggantikan shadcn/ui sebagai fondasi component system
  permanen; neutral theme digunakan selama feature development dan designer
  menetapkan visual system final setelah feature selesai.
* Guardrail adopsi Astryx Beta — exact stable version, upgrade core+theme
  bersamaan, tanpa canary/swizzle awal, wrapper selektif, update manual,
  staging, dan smoke test Next.js 16.

### Changed

* ADR-035 diamendemen dengan pengecualian exact version untuk paket Astryx
  selama masih Beta.
* ADR-038 diamendemen pada urutan kerja: implementasi feature tidak menunggu
  design final; design tokens tetap Draft/TBD sampai designer masuk.
* `PROJECT_STATE.md` — next tasks alignment dan smoke test Astryx, Known Issue
  Beta/Next.js 16, serta Recent Decision ADR-041 ditambahkan.
* `TEMP-project-owner-questions.md` — diskusi UI component system ditandai
  selesai dan dipindahkan ke ADR-041.
* `CONVERSATIONS.md` — konteks keputusan design-later dan boundary styling
  dicatat.

### Status

Keputusan ADR-041 sudah Accepted. Alignment baseline, instalasi dependency, dan
smoke test belum dikerjakan.

---

## 2026-07-23 — Penyelarasan Kontrak Outstand (ADR-040)

### Added

* ADR-040 — kontrak resmi Outstand untuk webhook, Engagement, media, dan X BYOK.
* Migrasi Prisma `20260723121000_align_outstand_contract` — durable receipt
  `outstand_webhook_events`, reconnect state, metadata working copy media
  Outstand, serta idempotency Engagement per akun.
* Shared enum `EngagementType.Comment` untuk scope MVP.

### Changed

* Product, User, dan UX Baseline — Engagement MVP dibatasi ke komentar/reply
  melalui sync 30 menit + manual refresh; Direct Message, mention, dan webhook
  Engagement dikeluarkan dari MVP.
* Architecture dan Engineering Baseline — event resmi
  `post.published`/`post.error`/`account.token_expired`, durable-before-ACK,
  `outstand.webhook.process`, upload working copy media Outstand, serta
  konfigurasi X BYOK manual di dashboard Outstand.
* Prisma schema — menambahkan durable webhook receipt, reconnect state, metadata
  media Outstand, URL media cache nullable, dan constraint Engagement
  comments-only.
* Design handoff — Comments Inbox, manual refresh, dan status last sync
  diselaraskan tanpa mengubah visual token.

* `ARCHITECTURE_OVERVIEW.md` — diagram dan runtime flow diselaraskan untuk tiga
  webhook resmi, durable-before-ACK, retry internal, Engagement sync 30 menit +
  manual refresh, media working copy Outstand, dan X BYOK manual.
* `PROJECT_STATE.md` — metadata, completion alignment dokumen+schema, next tasks,
  known issues, dan recent decisions diperbarui tanpa mengklaim runtime sudah
  diimplementasikan.
* `context/ctx-project.md`, `ctx-business.md`, `ctx-domain.md`,
  `ctx-architecture.md`, `ctx-technical-context.md`, dan
  `ctx-implementation.md` — pointer dan guardrail M8 diperbarui agar agent tidak
  memakai kontrak Outstand lama.
* `TEMP-project-owner-questions.md` — section 3–5 ditandai selesai dan sudah
  dipindahkan ke ADR-040/baseline; catatan historis dipertahankan dan section
  landing/UI Astryx yang masih terbuka tidak diubah.

### Status

Alignment dokumentasi baseline dan schema/migration ADR-040 sudah selesai.
Implementasi handler, adapter, job, sync, dan UI tetap M8 pending.

---

## 2026-07-21 (sesi kelima puluh dua)

### Added — Content Format MVP: Post / Reel / Story / Pin (ADR-039)

* ADR-039 — format publikasi per `PostTarget` masuk Must Have MVP; matriks IG/FB vs TikTok vs Pinterest.
* `ContentFormat` enum di `packages/shared` (`post | reel | story | pin`).
* Migrasi Prisma `20260721140000_add_content_format` — kolom `content_format`, `platform_options` pada `publishing_post_targets`.

### Changed

* Product: `mvp-definition.md`, `feature-modules.md`, `feature-priority.md`, `product-scope.md`.
* Architecture: `domain-model.md`, `integration-layer.md`, `database-strategy.md`.
* UX: `key-screen-patterns.md` (KSP-05-F11, KSP-D12), `information-architecture.md` (IA tree + pemetaan fitur), `user-flows.md` (UF-01).
* Architecture: `application-layer.md`, `ARCHITECTURE_OVERVIEW.md` — Format di Publishing.
* Product: `release-roadmap.md` v0.2.
* Context: `ctx-domain.md`, `ctx-design.md`.
* `design/DESIGN_OVERVIEW.md` + `DESIGN_BRIEF.md` — catatan format di Draft Editor (handoff designer).
* `PROJECT_STATE.md`, `CONVERSATIONS.md` — keputusan + next task implementasi UI format.

### Consistency fix (review ADR-039)

* Klarifikasi default Pinterest `pin` vs default kolom DB `post` (fallback teknis; Application Service wajib set nilai bisnis).
* Definisi bentuk `PlatformPublishOptions` (JSON, bukan enum shared).
* Renomori fungsi UX: Content Format Selector = `KSP-05-F11` (bukan F04b).
* UF-01 & confirmation summary menyertakan format per akun.

---

## 2026-07-21 (sesi kelima puluh satu)

### Added — Design Tokens SoT + alur lock (ADR-038)

* `product-discovery/06-engineering/design-tokens.md` — template SoT visual tokens (font, brand/neutral/status/feedback, spacing, tema) + **panduan PM** saat design siap; status Draft / nilai `TBD`.
* ADR-038 di `DECISIONS.md` — lokasi SoT token di Engineering; `design/` bukan SoT; isi setelah design approve lalu mirror ke `apps/web`.

### Changed

* `product-discovery/06-engineering/README.md` — daftar dokumen + scope + decision rules untuk design tokens.
* `design/README.md` — pointer SoT token ke `design-tokens.md`.
* `context/ctx-technical-context.md`, `context/ctx-design.md` — pointer token ke Engineering.
* `PROJECT_STATE.md`, `CONVERSATIONS.md` — next task + log keputusan ADR-038.

---

## 2026-07-21 (sesi kelima puluh)

### Added — SocialPlatform: Threads & Pinterest (ADR-037)

* `threads` dan `pinterest` ditambahkan ke enum `SocialPlatform` di `packages/shared/src/enums.ts`.
* ADR-037 di `DECISIONS.md` — perluasan aditif daftar platform yang didukung.

### Changed

* `product-discovery/05-architecture/domain-model.md` — Shared Types `SocialPlatform` + deskripsi field platform.
* `product-discovery/05-architecture/integration-layer.md` — daftar platform eksternal.
* `project-manager/ARCHITECTURE_OVERVIEW.md` — daftar platform di System Context.
* `product-discovery/04-ux/user-flows.md` dan `key-screen-patterns.md` — daftar platform di UI connect/selector.
* `PROJECT_OVERVIEW.md` — catatan daftar platform yang didukung.
* `CONVERSATIONS.md`, `PROJECT_STATE.md` — log keputusan ADR-037.

---

## 2026-07-17 (sesi keempat puluh sembilan)

### Added — AI Context layer (opsi A)

* `context/README.md` — tujuan, struktur, batas keras antar file, cara pakai agent.
* `context/ctx-project.md` — Project OS, state, rules, ADR.
* `context/ctx-business.md` — Business + Product + User (gap opsi A ditutup tanpa file baru).
* `context/ctx-domain.md` — BC, shared types, boundary rules.
* `context/ctx-architecture.md` — layer, ACL, jobs, auth arch, realtime, DB strategy.
* `context/ctx-technical-context.md` — stack, env, Prisma, Better Auth, deploy/CI.
* `context/ctx-development.md` — DX, perintah, **aturan coding/konvensi**.
* `context/ctx-implementation.md` — pola implementasi di `apps/web` / `domains/`.
* `context/ctx-design.md` — `design/` + pointer UX (`04-ux/`).

### Changed

* `AGENTS.md` — `context/` aktif (bukan “direncanakan”); mapping task → `ctx-*` + baseline; step sesi baca `context/`.
* `README.md` — pointer AI Context ke `context/README.md`.
* `PROJECT_STATE.md` — scaffold selesai; next focus M8 Development.
* `CONVERSATIONS.md` — log keputusan opsi A.

---

## 2026-07-17 (sesi keempat puluh delapan)

### Added — Official agent skills (vendor)

* Prisma: `prisma-cli`, `prisma-client-api`, `prisma-database-setup`, `prisma-upgrade-v7` (`prisma/skills`).
* Better Auth: `better-auth-best-practices`, `create-auth`, `better-auth-security-best-practices`, `email-and-password-best-practices` (`better-auth/skills`).
* Vercel: `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-optimize`, `web-design-guidelines` (`vercel-labs/agent-skills`).
* Supabase: `supabase`, `supabase-postgres-best-practices` (`supabase/agent-skills`).
* shadcn/ui: `shadcn` (`shadcn/ui`).
* `skills-lock.json` — lock hash skill terpasang.

### Notes

* Skill deploy-Vercel / React Native / 2FA / organization / migrate-radix-to-base / Prisma Postgres tidak dipasang (di luar stack MVP).

---

## 2026-07-17 (sesi keempat puluh tujuh)

### Added

* `AGENTS.md` di root — pintu masuk AI coding agent (Source of Truth pointers, skills wajib, hard rules, mapping task → dokumen).

### Changed

* `PROJECT_STATE.md` — catat rencana AI Context layer (`context/` + `ctx-*.md`); `AGENTS.md` masuk Completed; next task scaffold `context/`.
* `CONVERSATIONS.md` — log keputusan struktur AI Context mengikuti screenshot referensi user.

### Notes

* Folder `context/` kemudian di-scaffold pada sesi keempat puluh sembilan (opsi A).

---

## 2026-07-17 (sesi keempat puluh enam)

### Changed — Prisma 7 datasource config

* `schema.prisma` — hapus `url`/`directUrl` dari datasource (tidak didukung Prisma 7).
* Tambah `apps/web/prisma.config.ts` — CLI migrate memakai `DIRECT_URL` (DO-D04).
* `src/lib/prisma/client.ts` — `PrismaClient` via `@prisma/adapter-pg` + pooled `DATABASE_URL`.
* Generator `prisma-client` → output `src/generated/prisma` (gitignored).
* Upgrade deps ke Prisma 7.8 + `pg` / `@prisma/adapter-pg`.
* Update cuplikan di `database-orm.md` agar selaras Prisma 7 (semantik DO-D04 tetap).

### Notes

* Error IDE “`url` is no longer supported in schema files” terselesaikan dengan migrasi ke pola Prisma 7.
* Verifikasi: `prisma validate`, `typecheck`, `lint`, `build` hijau.

---

## 2026-07-17 (sesi keempat puluh lima)

### Added — M7 Prisma, Better Auth, env, CI (M7 selesai)

* `apps/web/prisma/schema.prisma` — identity_* + domain MVP + `background_jobs`; migrasi `20260717100000_init`.
* `apps/web/src/lib/prisma/client.ts` — singleton PrismaClient.
* `apps/web/src/lib/better-auth/auth.ts` — Better Auth + Prisma adapter; `supabase-jwt.ts` (AS-D03).
* `apps/web/src/lib/supabase/{client,server,middleware}.ts` — stubs Realtime/Storage (DO-D02).
* `apps/web/src/lib/env.ts` — fail-fast required server vars (EM-D05).
* `apps/web/.env.example` — katalog env (EM-D04).
* `.github/workflows/ci.yml` — quality gates CI-D02.
* Route `/api/auth/[...all]` di-wire ke Better Auth (`toNextJsHandler`).

### Changed

* `apps/web/package.json` — deps Prisma 6.x, better-auth, @supabase/supabase-js, jose; script `db:*` + `postinstall` generate.
* `README.md` — setup env/migrate; hapus “Remaining M7”.
* `PROJECT_STATE.md` — Version 1.0.2 → 1.0.3; M7 ✅ Completed; fokus → M8.
* `PROJECT_OVERVIEW.md` — Status `Planning` → `Active` (hilangkan living-state stale).

### Notes

* Verifikasi: `typecheck`, `lint`, `test`, `format:check`, `build` hijau.
* Semantik DO-D04 tetap (`DATABASE_URL` pooled + `DIRECT_URL` migrate); di Prisma 7 URL tidak lagi di `schema.prisma` (lihat sesi keempat puluh enam).
* Email verification sementara off (AS-D04); RLS policies SQL belum di migrasi awal.
* Belum: initial git commit (menunggu instruksi).

---

## 2026-07-17 (sesi keempat puluh empat)

### Added — M7 DX tooling

* Root: `eslint.config.mjs`, `prettier.config.mjs`, `.prettierignore`, `vitest.config.ts`, `lefthook.yml`.
* Root scripts: `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `db:*`, `prepare` (Lefthook).
* `packages/shared/src/enums.test.ts` — smoke test Vitest.
* `git init` di root (branch `main`) agar pre-commit hooks aktif.

### Changed

* `dx-tooling.md` — DX-D06 (Vitest di root) dan DX-D07 (Lefthook via `prepare`) dikunci.
* `apps/web/package.json` — ESLint dipindah ke root; script `db:*` disiapkan untuk Prisma.
* `README.md` — dokumentasi script DX dan setup hooks.
* `PROJECT_STATE.md` — Version 1.0.1 → 1.0.2; M7 progress ~60%.

### Notes

* Verifikasi: `bun run lint`, `format:check`, `test`, `typecheck` hijau.
* Belum: Prisma, Better Auth, `.env.example`, CI, initial git commit.

---

## 2026-07-17 (sesi keempat puluh tiga)

### Added — M7 slice B: Hybrid Monorepo inti

* Root Bun Workspaces: `package.json`, `tsconfig.json`, `.gitignore`, `README.md`, `bun.lock`.
* `apps/web` (`@social/web`) — Next.js App Router, placeholder routes sesuai IA, 9 domain modules MVP, `src/lib/` stubs, middleware skeleton.
* `packages/shared` (`@social/shared`) — branded IDs, enums (`ContentStatus`, `MemberRole`, `SocialPlatform`, `WorkspacePlan`), value objects.

### Changed

* `environment-management.md` — EM-D04 dikunci: lokasi env di `apps/web/` (bukan root). Catatan: `05-architecture/README.md` tidak mengatur lokasi env (di luar scope Architecture).
* `PROJECT_STATE.md` — Version 1.0.0 → 1.0.1; M7 progress ~35%; Next Tasks digeser ke DX / Prisma / Auth / CI / git init.

### Notes

* Verifikasi: `bun run typecheck` dan `bun run build` hijau.
* Belum: DX tooling, Prisma, Better Auth, `.env.example`, CI, `git init` di root.

---

## 2026-07-17 (sesi keempat puluh dua)

### Changed

* `PROJECT_OVERVIEW.md` — preferensi kerja: perubahan di `design/` tidak dicatat di `CHANGELOG.md` / `PROJECT_STATE.md` (ruang operasional desain, bukan tracking development).

---

## 2026-07-17 (sesi keempat puluh satu)

### Added

* `project-manager/ARCHITECTURE_OVERVIEW.md` — High-Level Architecture Overview (2 frame Figma: System Context & Containers + Internal Layers & Domains), disintesis dari Architecture Baseline v1.0 dan Engineering Baseline v1.0.

### Changed

* `project-manager/README.md` — menambahkan `ARCHITECTURE_OVERVIEW.md` ke folder structure & Core Documents; klarifikasi pengecualian ringkasan visual vs SoT di product-discovery.
* `project-manager/PROJECT_OVERVIEW.md` — Related Documents merujuk `ARCHITECTURE_OVERVIEW.md` dan architecture README.
* `project-manager/PROJECT_RULES.md` — `ARCHITECTURE_OVERVIEW.md` diklasifikasikan sebagai Static Reference.
* `.agents/skills/project-os-navigator/SKILL.md` — File Map memuat `ARCHITECTURE_OVERVIEW.md`.
* `PROJECT_STATE.md` — mencatat penambahan Architecture Overview.

---

## 2026-07-17 (sesi keempat puluh)

### Added — ADR-036 Engineering Planning Baseline v1.0

* `project-manager/DECISIONS.md` — ADR-036: seluruh 8 dokumen `product-discovery/06-engineering/` ditetapkan sebagai Engineering Planning Baseline v1.0 setelah ENG-REVIEW-01 s/d ENG-REVIEW-06 Fixed.

### Changed

* `PROJECT_STATE.md` — Version 0.9.7 → 1.0.0; M6 ditutup (✅ Completed); M7 dibuka (🟡 In Progress); phase → Phase 5 — Repository & Bootstrap; Active Conversation Mode → Repository & Bootstrap (bootstrap diizinkan; feature implementation tetap dibatasi); Next Tasks diganti ke inisialisasi monorepo/tooling.
* `.agents/skills/project-os-navigator/SKILL.md` — referensi folder UX / Architecture / Engineering diperbarui ke Baseline v1.0 (menghapus status living "in progress" / "pending" yang melanggar Document Type Classification).

---

## 2026-07-17 (sesi ketiga puluh sembilan)

### Fixed — Engineering Planning Review: ENG-REVIEW-01 s/d ENG-REVIEW-06

**ENG-REVIEW-01 — `monorepo-setup.md`** (Major):
* Ditambahkan `api/jobs/run/route.ts` pada pohon App Router — selaras `deployment-infrastructure.md`, `background-jobs.md`, `auth-architecture.md`.

**ENG-REVIEW-02 — `monorepo-setup.md`** (Major):
* Ditambahkan `api/auth/[...all]/route.ts` (Better Auth catch-all) + catatan bypass Middleware untuk `/api/auth/*` dan `/api/jobs/*`.

**ENG-REVIEW-03 — `auth-strategy.md`** (Major):
* Cookie `Secure` / `useSecureCookies` dibuat env-aware: `false` di local HTTP, `true` di staging/production HTTPS — selaras `environment-management.md`.

**ENG-REVIEW-04 — `monorepo-setup.md`** (Minor):
* Klarifikasi 9 domain modules MVP; BC-10 Billing post-MVP tanpa folder `src/domains/billing/` (route Settings → Billing tetap placeholder).

**ENG-REVIEW-05 — `cicd-pipeline.md`** (Minor):
* Urutan CI-D02 di tabel keputusan diselaraskan: `install → prisma generate → prisma validate → typecheck → lint → test`.

**ENG-REVIEW-06 — `monorepo-setup.md`** (Minor):
* Komentar IR-03 diganti ke `PrismaPostRepository` / larangan import `prisma` client di domain (ADR-031).

### Changed

* `PROJECT_STATE.md` — Version 0.9.6 → 0.9.7, progress 96% → 97%; ENG-REVIEW Fixed; Next: Baseline v1.0.

---

## 2026-07-17 (sesi ketiga puluh delapan)

### Changed — Engineering Planning Review (M6)

* Review konsistensi lintas 8 dokumen `product-discovery/06-engineering/` terhadap sesama dokumen M6, Architecture Baseline (ADR-025), dan ADR-028 s/d ADR-035.
* **6 temuan** dicatat di `PROJECT_STATE.md` Known Issues sebagai ENG-REVIEW-01 s/d ENG-REVIEW-06 (belum diperbaiki).
* `PROJECT_STATE.md` — Version 0.9.5 → 0.9.6, progress 95% → 96%; fokus bergeser ke perbaikan temuan review sebelum Baseline v1.0.

---

## 2026-07-17 (sesi ketiga puluh tujuh)

### Added — Dokumen M6: dependency-strategy.md

* `product-discovery/06-engineering/dependency-strategy.md` — dokumen kedelapan (terakhir) M6 Engineering Planning:
  * Version ranges eksternal **caret (`^`)**; resolusi dikunci lockfile (DS-D01).
  * Update dependency **manual**; tanpa Renovate/Dependabot di MVP (DS-D02).
  * Satu **`bun.lockb` di root**, commit wajib, frozen install di CI (DS-D03).
  * Penempatan: root = tooling; `apps/web` = runtime; `@social/shared` tanpa runtime deps (DS-D04).
  * Shared packages: hanya `@social/shared` di MVP; package baru butuh alasan kuat (DS-D05).
  * Tanpa Bun Catalog di MVP (DS-D06).
  * Decision Log DS-D01 s/d DS-D06.

### Added — ADR-035

* `project-manager/DECISIONS.md` — ADR-035: Dependency Strategy — caret ranges, manual updates, root lockfile rules.

### Changed

* `PROJECT_OVERVIEW.md` — Technical Overview: baris Dependencies.
* `product-discovery/06-engineering/README.md` — deskripsi `dependency-strategy.md`; Decision Rules dependency strategy.
* `dx-tooling.md`, `monorepo-setup.md` — Related Documents menunjuk ke `dependency-strategy.md` / ADR-035.
* `PROJECT_STATE.md` — Version 0.9.4 → 0.9.5, progress 93% → 95%; 8/8 dokumen M6 selesai; Next: Engineering Planning Review.

---

## 2026-07-17 (sesi ketiga puluh enam)

### Added — Dokumen M6: environment-management.md

* `product-discovery/06-engineering/environment-management.md` — dokumen keenam M6 Engineering Planning:
  * Supabase **Cloud-first** untuk local/staging/production; self-host ditunda sampai skema stabil (EM-D01).
  * Local memakai project Cloud terpisah **`social-media-local`** (EM-D02).
  * Secret management **native**: Railway Variables + Supabase dashboard + `.env.local` (EM-D03, EM-D04).
  * Katalog env vars server/client, validasi fail-fast, isolasi kredensial antar tier (EM-D05, EM-D06).
  * Decision Log EM-D01 s/d EM-D06.

### Added — Dokumen M6: dx-tooling.md

* `product-discovery/06-engineering/dx-tooling.md` — dokumen ketujuh M6 Engineering Planning:
  * **ESLint + Prettier** untuk lint/format (DX-D01).
  * **Lefthook + lint-staged** untuk pre-commit (DX-D02).
  * **Vitest** sebagai test runner (`bun run test`) (DX-D03).
  * Kontrak script root + checklist local setup (DX-D04, DX-D05).
  * Decision Log DX-D01 s/d DX-D05.

### Added — ADR-033, ADR-034

* `project-manager/DECISIONS.md` — ADR-033 (Environment Management), ADR-034 (DX Tooling).

### Changed

* `PROJECT_OVERVIEW.md` — Technical Overview: Lint/Format, Pre-commit, Test Runner, Env/Secrets.
* `product-discovery/06-engineering/README.md` — deskripsi `environment-management.md` dan `dx-tooling.md`.
* `deployment-infrastructure.md`, `auth-strategy.md`, `database-orm.md`, `cicd-pipeline.md`, `monorepo-setup.md` — referensi ke ADR-033/034; target DB lokal dikunci ke `social-media-local`.
* `PROJECT_STATE.md` — Version 0.9.3 → 0.9.4, progress 91% → 93%; 7/8 dokumen M6; Next: `dependency-strategy.md`.

---

## 2026-07-17 (sesi ketiga puluh lima)

### Added — Dokumen M6: cicd-pipeline.md

* `product-discovery/06-engineering/cicd-pipeline.md` — dokumen kelima M6 Engineering Planning:
  * **GitHub Actions** sebagai CI (CI-D01); gates PR: install → prisma generate/validate → typecheck → lint → test (CI-D02).
  * Promosi kode: `feature/*` → `staging` → `main` (CI-D03).
  * CD tetap **Railway auto-deploy** (CI-D04, selaras DI-D05).
  * `prisma migrate deploy` di Railway release/pre-start per environment (CI-D05).
  * Secret sensitif tidak di PR CI (CI-D06).
  * Decision Log CI-D01 s/d CI-D06.

### Added — ADR-032

* `project-manager/DECISIONS.md` — ADR-032: CI/CD Pipeline — GitHub Actions gates + Railway deploy + migrate on release.

### Changed

* `PROJECT_OVERVIEW.md` — Technical Overview: baris `CI | GitHub Actions`.
* `product-discovery/06-engineering/README.md` — deskripsi `cicd-pipeline.md`.
* `deployment-infrastructure.md` / `database-orm.md` — referensi ke ADR-032 / CI-D05.
* `PROJECT_STATE.md` — Version 0.9.2 → 0.9.3, progress 89% → 91%; 5/8 dokumen M6; Next: `environment-management.md`.

---

## 2026-07-17 (sesi ketiga puluh empat)

### Added — Dokumen M6: database-orm.md

* `product-discovery/06-engineering/database-orm.md` — dokumen keempat M6 Engineering Planning:
  * **Prisma** sebagai ORM formal; repository implementations memakai Prisma Client (DO-D01).
  * Batas Supabase client: hanya Realtime + Storage, bukan CRUD domain (DO-D02).
  * **Prisma Migrate** sebagai sumber kebenaran migrasi; alur staging → production (DO-D03).
  * Connection pooling via Supabase Supavisor: `DATABASE_URL` (pooled) + `DIRECT_URL` (migrate) (DO-D04).
  * Better Auth via Prisma adapter; model `identity_*` di schema yang sama (DO-D05).
  * RLS defense-in-depth via `SET LOCAL app.current_user_id` melalui Prisma (DO-D06).
  * Decision Log DO-D01 s/d DO-D06.

### Added — ADR-031

* `project-manager/DECISIONS.md` — ADR-031: Prisma sebagai ORM formal; mengamandemen ADR-017 (implementasi repository dari Supabase client → Prisma).

### Changed — Sinkronisasi dokumen terdampak Prisma

* `DECISIONS.md` — ADR-017 di-amandemen (status + decision text).
* `PROJECT_OVERVIEW.md` — Technical Overview: `ORM | Prisma`; Data Access = Prisma (CRUD) + Supabase client (Realtime, Storage).
* `product-discovery/06-engineering/README.md` — deskripsi `database-orm.md` dan baris Repository Pattern di tabel input.
* `product-discovery/06-engineering/monorepo-setup.md` — `src/lib/prisma/`, repositories Prisma-based, batas Supabase client.
* `product-discovery/06-engineering/auth-strategy.md` — Prisma adapter, Konteks 1 via Prisma, AS-D01 diselaraskan.
* `product-discovery/05-architecture/application-layer.md` — repository via Prisma Client (ADR-031).
* `product-discovery/05-architecture/database-strategy.md` — Migration Strategy tooling diganti ke Prisma Migrate.

### Changed — PROJECT_STATE.md

* Version 0.9.1 → 0.9.2, Overall Progress 87% → 89%.
* Completed: `database-orm.md`; In Progress: 4/8 dokumen M6; Next: `cicd-pipeline.md`.
* Recent Decisions: ADR-031.

---

## 2026-07-17 (sesi ketiga puluh tiga)

### Added — Dokumen M6: deployment-infrastructure.md

* `product-discovery/06-engineering/deployment-infrastructure.md` — dokumen kedua M6 Engineering Planning:
  * Keputusan region: **Singapore / Southeast Asia** — Railway + Supabase co-located untuk latency terendah ke target market Indonesia (DI-D01).
  * Topologi environment: **Production + Staging** (dua tier persisten), branch `main`→prod, `staging`→staging (DI-D02, DI-D05).
  * Supabase project terpisah per environment untuk isolasi data penuh (DI-D03).
  * Arsitektur Railway: dua service per environment — `web` (Next.js) + `cron` (trigger background jobs, selaras ADR-022) (DI-D04).
  * Build & deploy pipeline untuk monorepo Bun, strategi domain/TLS, scaling MVP (single instance, stateless), dan rollback (expand-and-contract) (DI-D06).
  * Decision Log DI-D01 s/d DI-D06.

### Added — Dokumen M6: auth-strategy.md

* `product-discovery/06-engineering/auth-strategy.md` — dokumen ketiga M6 Engineering Planning:
  * Konfigurasi instance Better Auth (database Supabase, prefix `identity_`, database session) (AS-D01, AS-D02).
  * Provider MVP: email + password (dengan verifikasi email) + Google OAuth, redirect URI per environment (AS-D05).
  * Atribut session cookie (HttpOnly, Secure, SameSite=lax, expiry 7 hari).
  * **Dual-context RLS**: server-side via service role + `app.current_user_id`; Supabase Realtime via JWT Supabase-compatible (HS256, `sub=userId`) agar `auth.uid()` valid — menkonkretkan ARCH-REVIEW-02 (AS-D03).
  * Konfigurasi auth per environment dan security considerations.
  * Dependency terbuka dicatat: transactional email provider untuk password reset/verification belum ditetapkan (AS-D04).
  * Decision Log AS-D01 s/d AS-D05.

### Added — ADR-028, ADR-029, ADR-030

* `project-manager/DECISIONS.md`:
  * **ADR-028** — Deployment Region: Singapore/Southeast Asia, Railway + Supabase co-located.
  * **ADR-029** — Environment Topology: Production + Staging dengan Supabase project terisolasi.
  * **ADR-030** — Auth Implementation: Better Auth config + Supabase JWT integration untuk Realtime.

### Changed — PROJECT_STATE.md

* Version 0.9.0 → 0.9.1, Last Updated → 2026-07-17, Overall Progress 85% → 87%.
* Completed: menambahkan `deployment-infrastructure.md` dan `auth-strategy.md`.
* In Progress: M6 kini 3 dari 8 dokumen selesai; dokumen berikutnya `database-orm.md`.
* Next Tasks: menghapus dua dokumen yang sudah selesai.
* Recent Decisions: menambahkan ADR-028, ADR-029, ADR-030.
* Known Issues: mencatat dependency terbuka transactional email provider (AS-D04).

---

## 2026-07-15 (sesi ketiga puluh dua)

### Fixed — Sinkronisasi PM dengan Keputusan Arsitektur Terbaru

Audit konsistensi seluruh dokumen `project-manager/` terhadap keputusan yang sudah ditetapkan (ADR-014 s/d ADR-026). Ditemukan dan diperbaiki 4 inkonsistensi:

* `project-manager/PROJECT_OVERVIEW.md` — Technical Overview: baris `ORM | Prisma` dihapus (asumsi prematur yang bertentangan dengan ADR-017). Diganti `Data Access | Supabase client *(ORM formal TBD — M6)*` sesuai keputusan arsitektur. Ditambahkan baris yang sebelumnya tertinggal: `Auth | Better Auth` (ADR-024), `Storage | Supabase Storage`, `Deployment | Railway`.
* `product-discovery/06-engineering/README.md` — daftar dokumen: `database-orm.md — ORM (Prisma)` diselaraskan menjadi strategi akses data via Supabase client (ADR-017) dengan pilihan ORM formal masih TBD — menghapus asumsi Prisma yang bocor.

### Added — ADR-027

* `project-manager/DECISIONS.md` — ADR-027: Amandemen ADR-014, mencatat pengecualian penamaan tabel aggregate root (`workspaces`, `notifications`) yang sebelumnya hanya ada di CHANGELOG sesi ke-29 dan belum terdokumentasi sebagai keputusan. Menutup gap traceability.

### Changed — PROJECT_STATE.md

* Recent Decisions: ditambahkan ADR-027.

---

## 2026-07-15 (sesi ketiga puluh satu)

### Fixed — Cleanup Dokumentasi project-manager/

* `project-manager/PROJECT_STATE.md` — menghapus 11 item strikethrough (`~~done~~`) dari section **Next Tasks** yang sudah tidak relevan (seluruh topik M5 + monorepo-setup.md sudah tercatat di section Completed). Next Tasks kini hanya berisi task yang benar-benar pending.
* `project-manager/PROJECT_OVERVIEW.md` — memperbaiki inkonsistensi: kolom Database di Technical Overview diperbarui dari `PostgreSQL *(Planned)*` menjadi `Supabase PostgreSQL`, sesuai keputusan yang sudah ditetapkan di CONVERSATIONS (sesi ke-20) dan ADR-015 (Database Strategy Baseline v1.0). Last Updated diperbarui ke 2026-07-15.

---

## 2026-07-15 (sesi ketiga puluh)

### Added

* ADR-025 di `DECISIONS.md` — System Architecture Baseline v1.0 ditetapkan untuk `product-discovery/05-architecture/`.

### Changed

* `PROJECT_STATE.md` — M5 ditutup (✅ Completed), M6 dibuka (🟡 In Progress), phase diperbarui ke Phase 4 — Engineering Planning, progress ke 85%, Active Conversation Mode diperbarui ke Engineering Planning, Next Tasks diperbarui untuk seluruh 8 dokumen M6.
* `product-discovery/06-engineering/README.md` — bagian "Input dari Fase Sebelumnya — Dari System Architecture" diperbarui: ditambahkan tabel 14 keputusan konkret dari System Architecture Baseline v1.0 sebagai constraint langsung untuk Engineering Planning.
* `project-manager/PROJECT_STATE.md` — ADR-026 ditambahkan ke Recent Decisions, monorepo-setup.md ditandai Done di Next Tasks.

### Added (lanjutan)

* `product-discovery/06-engineering/monorepo-setup.md` — dokumen pertama M6 Engineering Planning: monorepo root structure, Bun Workspaces config, apps/web folder structure, App Router routing (selaras IA), domain modules structure, packages/shared, TypeScript config, import rules (IR-01 s/d IR-05), dan decision log (MS-D01 s/d MS-D05).
* ADR-026 di `DECISIONS.md` — Monorepo Workspace Layout: apps/web, packages/shared, domain modules di src/domains/.

---

## 2026-07-15 (sesi kedua puluh sembilan)

### Changed — Naming Convention Exception: tabel utama tanpa redundansi prefix

**Keputusan:** DB-D01 diperbarui — tabel utama (aggregate root) domain yang namanya identik dengan domain prefix boleh menggunakan nama pendek tanpa prefix.

**Tabel yang diubah:**
* `workspace_workspaces` → `workspaces` (semua FK references diperbarui di `database-strategy.md`)
* `notification_notifications` → `notifications` (semua referensi diperbarui di `database-strategy.md` dan `realtime-strategy.md`)

**Dokumen yang diperbarui:**
* `product-discovery/05-architecture/database-strategy.md` — DB-D01, naming convention section, schema tabel BC-02 & BC-09, FK references, Index Strategy, Traceability, Decision Log
* `product-discovery/05-architecture/realtime-strategy.md` — semua referensi tabel notification

---

## 2026-07-15 (sesi kedua puluh delapan)

### Fixed — Architecture Review: 8 inkonsistensi lintas dokumen diperbaiki

**ARCH-REVIEW-01 — `realtime-strategy.md`** (Critical):
* Nama tabel dikoreksi dari `notifications` menjadi `notification_notifications` (sesuai naming convention domain prefix).
* Schema tabel di realtime-strategy.md diselaraskan dengan database-strategy.md — `payload JSONB` dihapus (fungsi ini sudah ditangani oleh `related_entity_type` + `related_entity_id`).
* Subscription block diperbarui: menambahkan `Table: notification_notifications` secara eksplisit.

**ARCH-REVIEW-02 — `database-strategy.md` + `realtime-strategy.md`** (Major):
* Ditambahkan klarifikasi dua konteks RLS: server-side service role menggunakan `current_setting('app.current_user_id')`, sedangkan Supabase Realtime client menggunakan `auth.uid()` (memerlukan Better Auth + Supabase JWT integration — dikonfigurasi di M6).
* `realtime-strategy.md` menambahkan catatan cross-reference ke `auth-architecture.md` tentang konfigurasi JWT.

**ARCH-REVIEW-03 — `database-strategy.md`** (Major):
* Ditambahkan section baru **System Tables (Cross-cutting Concerns)** yang mendefinisikan tabel `background_jobs`.
* Traceability table diperbarui — menambahkan mapping `background_jobs` sebagai system-level table.

**ARCH-REVIEW-04 — `integration-layer.md`** (Major):
* Publishing flow notes: "URL publik media" dikoreksi menjadi "Signed URL sementara (TTL ~24 jam)" — konsisten dengan database-strategy.md bahwa bucket `media` bersifat Private.
* IL-D07 diperbarui: mencantumkan bahwa signed URL di-generate saat scheduling, bukan URL publik.

**ARCH-REVIEW-05 — `application-layer.md`** (Major):
* Circular dependency Publishing ↔ AI Assistant dieliminasi dari dependency map.
* `BC-04 AI Assistant` tidak memanggil `BC-03 Publishing` — `postId` hanya context data bawaan, bukan service call. Hasil AI diterapkan user via aksi `PublishingService.updateDraft` yang terpisah.
* Ditambahkan rule eksplisit pada "Dependency yang dilarang": AI Assistant tidak boleh memanggil Publishing.

**ARCH-REVIEW-06 — `background-jobs.md`** (Minor):
* JOB-03 (Engagement Sync) handler diperbaiki — tidak lagi membuat JOB-02 (Post Status Notification, payload tidak kompatibel). Diganti dengan direct call ke `NotificationService.notify()` dengan type `engagement.new`, dengan aggregation untuk menghindari spam.

**ARCH-REVIEW-07 — `integration-layer.md`** (Minor):
* Referensi ke tabel `webhook_event_log` (tidak pernah didefinisikan) dihapus. Diganti dengan referensi yang benar ke tabel `background_jobs` dan JOB-01.

**ARCH-REVIEW-08 — `integration-layer.md`** (Minor):
* Retry count webhook dikoreksi dari "maks 5x" menjadi "maks 3x" — konsisten dengan JOB-01 di `background-jobs.md`.

---

## 2026-07-15 (sesi kedua puluh tujuh)

### Added — product-discovery/05-architecture/background-jobs.md

* Dokumen baru: **Background Jobs & Scheduler** — topik #5 M5.
* Arsitektur job queue: PostgreSQL tabel `background_jobs` sebagai sumber kebenaran status job.
* Railway Cron sebagai trigger eksekusi via Route Handler `/api/jobs/run` (dilindungi `X-Job-Secret`).
* 4 job types terdefinisi: `outstand.webhook.retry` (JOB-01), `notification.post_status` (JOB-02), `engagement.sync` (JOB-03), `analytics.sync` (JOB-04).
* Retry strategy: exponential backoff (5m, 15m, 60m), max 3 kali, dead letter via status `failed`.
* Concurrency control: `SELECT FOR UPDATE SKIP LOCKED` — atomic locking native PostgreSQL.
* Integrasi dengan domain: Publishing BC → webhook retry, Workspace BC → engagement sync trigger.
* Decision Log BG-D01 s/d BG-D06.
* ADR-022 (Background Job Strategy: PostgreSQL job queue + Railway Cron).

### Added — product-discovery/05-architecture/realtime-strategy.md

* Dokumen baru: **Real-time Strategy** — topik #6 M5.
* Scope real-time MVP: Supabase Realtime hanya untuk tabel `notifications`; data lain menggunakan manual refresh.
* Notification flow: domain event → JOB-02 → `NotificationService` → INSERT ke `notifications` → Supabase Realtime → client.
* Supabase Realtime subscription: channel per `user_id`, filter INSERT only, RLS menghormati subscription.
* Notification type registry: 4 tipe (`post.published`, `post.failed`, `engagement.new`, `post.scheduled_reminder`).
* Manual refresh patterns: content calendar menggunakan optimistic update + hint dari notifikasi; engagement inbox badge + manual load; analytics on demand.
* Post-MVP considerations: presence, collaborative editing, push notification.
* Decision Log RT-D01 s/d RT-D05.
* ADR-023 (Real-time Strategy: Supabase Realtime untuk notifikasi + manual refresh).

### Added — product-discovery/05-architecture/auth-architecture.md

* Dokumen baru: **Auth Architecture** — topik #7 M5.
* Authentication via Better Auth: Email + Password + Google OAuth untuk MVP.
* Session: HTTP-only cookie (Secure, SameSite=lax, expiry 7 hari), tidak dapat diakses JavaScript browser.
* Workspace context resolution: Middleware membaca workspace slug dari URL, query membership, inject `x-workspace-id` dan `x-workspace-role` sebagai request headers.
* RBAC enforcement: `assertPermission(role, operation)` di Application Service sebelum domain logic; RLS sebagai defense-in-depth.
* Middleware flow: public routes bypass auth; webhook/job routes dilindungi secret; `/dashboard/*` wajib session + workspace membership check.
* Permission matrix ringkasan per role (Owner, Admin, Manager, Creator) untuk operasi kritikal.
* Onboarding flow: user baru tanpa workspace diarahkan ke `/onboarding`.
* Post-MVP considerations: multi-workspace switching, 2FA, SSO/SAML, API key.
* Decision Log AU-D01 s/d AU-D07.
* ADR-024 (Auth Architecture: Better Auth + HTTP-only cookie + Application-layer RBAC).

### Changed — project-manager/PROJECT_STATE.md

* Progress diperbarui: 70% → 80%.
* Project Status: "System Architecture In Progress" → "System Architecture Review Pending".
* Current Focus diperbarui: seluruh 7 dokumen architecture selesai, menunggu Architecture Review.
* In Progress diperbarui: semua 7 topik M5 selesai.
* Next Tasks: topik #5, #6, #7 ditandai Done; ditambahkan task Architecture Review dan baseline.
* ADR-022, ADR-023, ADR-024 ditambahkan ke Recent Decisions.

---

## 2026-07-15 (sesi kedua puluh enam)

### Added — product-discovery/05-architecture/integration-layer.md

* Dokumen baru: **Integration Layer** — topik #4 M5.
* Posisi Outstand API sebagai external system dengan diagram arsitektur inbound dan outbound flow.
* Anti-Corruption Layer (ACL): `OutstandAdapter` sebagai satu-satunya titik interaksi dengan Outstand API — isolasi domain dari perubahan API Outstand.
* ConnectedAccount management: OAuth redirect flow via Outstand, token tidak disimpan internal, CSRF protection via `state` parameter.
* Publishing flow: schedule dan cancel post via Outstand API, `outstandJobId` sebagai external reference di `PostTarget`.
* Webhook handling: Route Handler `/api/webhooks/outstand`, HMAC-SHA256 signature verification, daftar 5 event type, async processing, idempotency strategy.
* Engagement data sync: webhook push untuk item baru + polling periodik sebagai fallback.
* Analytics data sync: pull-based polling periodik untuk post metrics dan workspace snapshot.
* Error handling strategy: klasifikasi 5 tipe error (transient, client, auth, account, not found), penanganan per operasi, `IntegrationError` sebagai tipe domain.
* Decision Log IL-D01 s/d IL-D08.
* ADR-019 (Anti-Corruption Layer), ADR-020 (Webhook Handling), ADR-021 (OAuth via Outstand).

---

## 2026-07-15 (sesi kedua puluh lima)

### Added — product-discovery/05-architecture/application-layer.md

* Dokumen baru: **Application Layer** — topik #3 M5.
* Layer stack 4-tingkat: Entry Points → Application Service → Domain Logic → Repository → Infrastructure.
* Next.js entry point patterns: Server Components (read), Server Actions (UI mutations), Route Handlers (webhook/external), Middleware (auth guard + workspace context resolution).
* Application Service contracts untuk seluruh 9 bounded context MVP.
* Repository Pattern eksplisit: interface di domain module, implementasi via Supabase client, satu repository per Aggregate Root.
* Cross-domain communication: service-to-service call via `index.ts` (public API), aturan no circular dependency, only pass ID lintas domain.
* Error handling hierarchy: ApplicationError → AuthorizationError, NotFoundError, ValidationError, ConflictError, ExternalServiceError.
* 3 contoh request flow: Schedule Post, Webhook Outstand, Load Calendar Page.
* Decision Log AL-D01 s/d AL-D04.

### Changed — project-manager/DECISIONS.md

* Ditambahkan ADR-016: Application Layer — Next.js Entry Point Strategy.
* Ditambahkan ADR-017: Application Layer — Repository Pattern.
* Ditambahkan ADR-018: Application Layer — Cross-Domain Communication.

### Changed — project-manager/PROJECT_STATE.md

* Version: 0.6.0 → 0.7.0.
* Overall Progress: 65% → 70%.
* Current Focus diperbarui: Application Layer selesai, next Integration Layer.
* In Progress diperbarui ke topik #4: Integration Layer.
* Completed ditambahkan: application-layer.md.
* Next Tasks: Application Layer ditandai Done.
* Recent Decisions ditambahkan ADR-016, ADR-017, ADR-018.

---

## 2026-07-15 (sesi kedua puluh empat)

### Added — product-discovery/05-architecture/database-strategy.md

* Dokumen baru: **Database Strategy** — topik #2 M5.
* Multi-tenancy strategy: RLS dengan `workspace_id` sebagai unit isolasi; pendekatan application-enforced auth + RLS sebagai defense-in-depth karena Better Auth tidak terintegrasi native dengan Supabase JWT.
* Schema organization: single schema `public` dengan domain prefix (ADR-014).
* ID Convention: UUID v4 via `gen_random_uuid()` — native PostgreSQL/Supabase.
* 22 tabel terdefinisi untuk 10 bounded context — memetakan seluruh entitas dari domain-model.md ke tabel database.
* BC-01 Identity: tabel dikelola Better Auth dengan prefix `identity_`.
* Soft delete strategy: hard delete by default; `deleted_at` hanya pada `publishing_posts`.
* Storage strategy: Supabase Storage dengan dua bucket (`media` private, `avatars` public).
* Index strategy: workspace_id mandatory pada semua tabel multi-tenant; query-driven indexes per tabel.
* Migration strategy: Supabase CLI, detail di Engineering Planning (M6).
* Decision Log DB-D01 s/d DB-D06.

### Changed — project-manager/DECISIONS.md

* Ditambahkan ADR-014: Database Schema Organization — Single Schema dengan Domain Prefix.
* Ditambahkan ADR-015: Database Strategy Baseline v1.0.

### Changed — project-manager/PROJECT_STATE.md

* Version: 0.5.0 → 0.6.0.
* Overall Progress: 58% → 65%.
* Current Focus: diperbarui — Database Strategy selesai, fokus beralih ke Application Layer.
* In Progress: diperbarui ke topik #3 Application Layer.
* Next Tasks: Database Strategy ditandai Done.
* Completed: ditambahkan database-strategy.md.
* Recent Decisions: ditambahkan ADR-014 dan ADR-015.

---

## 2026-07-15 (sesi kedua puluh tiga)

### Added — product-discovery/05-architecture/domain-model.md

* Dokumen baru: **Domain Model & Bounded Context** — topik #1 M5.
* Mendefinisikan 10 bounded context: Identity, Workspace, Publishing, AI Assistant, Engagement, Analytics, Start Page, Media, Notification, Billing.
* Menetapkan Core Entities dan Key Attributes per bounded context.
* Context Map — diagram dan tabel relasi antar bounded context.
* Shared Types (`packages/shared`) — ID types, enums kanonikal (ContentStatus, MemberRole, SocialPlatform, WorkspacePlan), value objects.
* Domain Boundary Rules (BR-01 s/d BR-06) — aturan implementasi Pragmatic Boundary.
* Traceability ke Product Baseline (feature-modules.md) dan User Insights (I-01, I-04, I-06, I-08).
* Decision Log DM-D01 s/d DM-D06.

### Changed — project-manager/PROJECT_STATE.md

* Overall Progress: 55% → 58%.
* Current Focus: diperbarui — Domain Model selesai, fokus beralih ke Database Strategy.
* In Progress: diperbarui ke topik #2 Database Strategy.
* Next Tasks: Domain Model ditandai Done, Database Strategy menjadi prioritas berikutnya.
* Completed: ditambahkan domain-model.md.

---

## 2026-07-15 (sesi kedua puluh dua)

### Added — CONVERSATIONS.md

* Entry baru: Keputusan Pra-Architecture — Domain Boundary, Storage & Deployment.

### Changed — product-discovery/05-architecture/README.md

* Tambah 3 keputusan pra-architecture ke tabel: Storage (Supabase Storage), Deployment (Railway), Domain Boundary Strictness (Pragmatic Boundary).

---

## 2026-07-15 (sesi kedua puluh satu)

### Added — product-discovery/05-architecture/

* `README.md` — struktur, scope, daftar dokumen, workflow, input dari baseline sebelumnya, expected output, exit criteria, dan decision rules untuk fase System Architecture.

---

## 2026-07-15 (sesi kedua puluh)

### Added — CONVERSATIONS.md

* Entry baru: Keputusan Pra-Architecture — Database, Auth & Real-time. 4 keputusan ditetapkan, 2 masih pending.

---

## 2026-07-15 (sesi kesembilan belas)

### Added — DECISIONS.md

* ADR-013 — UX Planning Baseline v1.0: seluruh dokumen `product-discovery/04-ux/` ditetapkan sebagai baseline setelah semua 4 UX Planning Review item selesai diperbaiki.

### Changed — PROJECT_STATE.md

* Versi naik dari 0.4.0 → 0.5.0.
* Phase diupdate: Phase 2 — UX Planning → Phase 3 — System Architecture.
* Milestone aktif diupdate: M4 → M5.
* Sprint diupdate: Sprint 2 → Sprint 3.
* Overall Progress diupdate: 45% → 55%.
* M4 — UX Planning ditandai ✅ Completed.
* M5 — System Architecture ditandai 🟡 In Progress.
* Current Focus, Active Conversation Mode, In Progress, Next Tasks, Known Issues, dan Recent Decisions diperbarui sesuai fase baru.

### Added — CONVERSATIONS.md

* Entry baru: Briefing M5 System Architecture Planning — topik, urutan pembahasan, dan cara kerja antar sesi.

---

## 2026-07-15 (sesi kedelapan belas)

### Fixed — UX Planning Review — REVIEW-04 (Minor)

* `product-discovery/04-ux/navigation-patterns.md` — tambah pola baru **"New Post CTA dari Calendar dan Queue"** di section Contextual Navigation Pattern. Mendokumentasikan bahwa CTA New Post tersedia langsung dari Calendar dan Queue (bukan hanya dari Drafts), trigger dan konteks penggunaannya, serta perilaku transisi dan tombol Back.
* Tambah **NP-D09** ke Decision Log: alasan New Post CTA tersedia di Calendar dan Queue — mengurangi friction saat Raka menemukan gap jadwal di titik penemuan kebutuhan.
* Tambah baris baru ke Ringkasan Pola.

### Changed — PROJECT_STATE.md

* Fix #4 dipindahkan dari Next Tasks ke selesai; Next Tasks diperbarui ke satu item sisa: ADR-013 UX Planning Baseline.
* REVIEW-04 ditandai Fixed di Known Issues.
* Semua 4 REVIEW item kini berstatus Fixed.

---

## 2026-07-15 (sesi ketujuh belas)

### Fixed — UX Planning Review — REVIEW-03 (Minor)

* `product-discovery/04-ux/key-screen-patterns.md` — tambah KSP-D11 ke Decision Log: mendokumentasikan alasan eksklusi Start Page dari 8 layar kritis. Start Page bukan bagian dari siklus kerja harian; polanya sederhana (konfigurasi + preview) dan tidak memerlukan dokumentasi mendalam di fase ini.

### Changed — PROJECT_STATE.md

* Fix #3 dipindahkan dari Next Tasks ke selesai.
* REVIEW-03 ditandai Fixed di Known Issues.

---

## 2026-07-15 (sesi keenam belas)

### Fixed — UX Planning Review — REVIEW-02 (Minor)

* `product-discovery/04-ux/key-screen-patterns.md` — KSP-02-F07 (Disconnected Account Warning): koreksi referensi prinsip dari `UXP-05` menjadi `UXP-06`. UXP-06 (Status Jelas, Proses Ringan) adalah prinsip yang tepat untuk status visibilitas akun; UXP-05 mengacu ke prinsip AI.

### Changed — PROJECT_STATE.md

* Fix #2 dipindahkan dari Next Tasks ke selesai.
* REVIEW-02 ditandai Fixed di Known Issues.

---

## 2026-07-15 (sesi kelima belas)

### Fixed — UX Planning Review — REVIEW-01 (Kritis)

Selaraskan set status konten kanonikal lintas 4 dokumen UX — mengacu ke `product-discovery/02-product/roles-permissions.md` sebagai sumber kebenaran.

* `product-discovery/04-ux/ux-principles.md` — UXP-06: tambah `failed` ke status list; koreksi "ready" → "ready to schedule"; tambah bullet referensi ke `roles-permissions.md` untuk aturan transisi per role.
* `product-discovery/04-ux/information-architecture.md` — Status Indicator di IA tree: tambah `in review` dan `ready to schedule`.
* `product-discovery/04-ux/user-flows.md` — 3 tempat: Queue happy path, Queue UX principles rationale, Calendar happy path — semua status list dilengkapi dengan `In Review` dan `Ready to Schedule`.
* `product-discovery/04-ux/key-screen-patterns.md` — 3 tempat: KSP-02-F02 (Calendar status), KSP-03-F02 (Queue status), KSP-05-F07 (Draft Editor Status Indicator) — semua dilengkapi dengan `In Review` dan `Ready to Schedule`.

### Changed — PROJECT_STATE.md

* Fix #1 dipindahkan dari Next Tasks ke selesai.
* REVIEW-01 ditandai Fixed di Known Issues.

---

## 2026-07-15 (sesi keempat belas)

### Added — Roles & Permissions

* `product-discovery/02-product/roles-permissions.md` — addendum Product Baseline v1.0. Mendefinisikan 4 roles (Owner, Admin, Manager, Creator) beserta hak akses per area fitur, set status konten kanonikal (Draft, In Review, Ready to Schedule, Scheduled, Published, Failed), aturan transisi status per role, dan mapping roles ke 5 persona User Discovery Baseline.

### Added — DECISIONS.md

* ADR-012 — Addendum Product Baseline: `roles-permissions.md` ditambahkan ke `product-discovery/02-product/`. Mencakup alasan pendefinisian roles di fase Product dan penetapan set status konten sebagai acuan kanonikal lintas dokumen UX.

### Changed — PROJECT_STATE.md

* Task 1 (Roles & Permissions) dipindahkan dari Next Tasks ke Completed.
* Recent Decisions diperbarui: ADR-012 ditambahkan.

---

## 2026-07-15 (sesi ketiga belas)

### Changed — PROJECT_STATE.md

* Versi dinaikkan ke 0.4.0.
* Current Focus diperbarui: fokus bergeser ke UX Planning Review dan Roles & Permissions.
* In Progress diperbarui: UX Planning Review sedang berjalan, 4 inkonsistensi ditemukan.
* Next Tasks diperbarui: 2 task utama didefinisikan — Task 1 (Roles & Permissions + ADR-012) dan Task 2 (4 perbaikan UX Planning Review + ADR-013 untuk UX Planning Baseline).
* Known Issues diisi: 4 temuan inkonsistensi dari UX Planning Review dicatat sebagai REVIEW-01 hingga REVIEW-04.

---

## 2026-07-15 (sesi kedua belas)

### Added — Key Screen Patterns

* `product-discovery/04-ux/key-screen-patterns.md` — pola fungsi kritis untuk 8 layar utama produk: KSP-01 Home, KSP-02 Publish Calendar, KSP-03 Publish Queue, KSP-04 Publish Drafts, KSP-05 Draft Editor (termasuk pola AI Assist inline, Account Selector dengan status, dan Confirmation Summary), KSP-06 Engage Inbox (master-detail pattern), KSP-07 Analyze Dashboard, KSP-08 Connected Accounts. Setiap layar memiliki critical functions dengan ID, zona fungsional, state handling, dan decision log. 10 keputusan desain terdokumentasi (KSP-D01 hingga KSP-D10). Dokumen terakhir dari M4 — UX Planning.

### Changed — PROJECT_STATE.md

* Overall Progress diperbarui dari 38% ke 45%.
* `key-screen-patterns.md` dipindahkan dari In Progress ke Completed.
* Next Tasks diperbarui: fokus berikutnya adalah UX Planning Review lintas dokumen dan penetapan UX Planning Baseline.

---

## 2026-07-15 (sesi kesebelas)

### Added — Navigation Patterns

* `product-discovery/04-ux/navigation-patterns.md` — model dan pola navigasi lengkap: Persistent Sidebar Navigation sebagai model utama, primary/secondary/in-section navigation patterns, 5 contextual navigation patterns (Item→Editor, Thread Expansion, Status→Settings, Empty State→Action, Deep Link), notification badge pattern, cross-section navigation pattern, dan decision log 8 keputusan navigasi (NP-D01 hingga NP-D08).

---

## 2026-07-15 (sesi kesepuluh)

### Added — User Flows

* `product-discovery/04-ux/user-flows.md` — 6 solution flows untuk Must Have MVP: UF-01 (Membuat & Menjadwalkan Konten), UF-02 (Mengelola Queue), UF-03 (Review Kalender), UF-04 (Triage Engagement Inbox), UF-05 (Menghubungkan Akun Sosial), UF-06 (Melihat Ringkasan Performa). Setiap flow memiliki happy path + 1 alternate path paling kritis. 4 UX Decisions (UXD-01 hingga UXD-04) terdokumentasi.

### Added — Skill: Proactive Clarification

* `.agents/skills/proactive-clarification/SKILL.md` — skill baru yang memandu AI untuk secara proaktif mengidentifikasi keputusan yang belum ditentukan sebelum mengeksekusi tugas apapun. AI wajib bertanya dengan pilihan-pilihan terbaik di kelasnya (maks 4–5 opsi dikurasi), berlaku untuk semua jenis interaksi — dokumentasi, fitur, arsitektur, konfigurasi. Skill tidak aktif jika keputusan sudah ada di baseline project.

---

## 2026-07-15 (sesi kesembilan)

### Added — Information Architecture

* `product-discovery/04-ux/information-architecture.md` — IA lengkap: struktur navigasi (primary + secondary), hierarki layar untuk seluruh domain MVP (Home, Publish, Engage, Analyze, Start Page, Workspace Settings, User Settings), pemetaan fitur Must Have ke layar, entry points per persona, dan decision log 7 keputusan struktural.

### Added — UX Principles

* `product-discovery/04-ux/ux-principles.md` — 7 UX Principles ditetapkan, masing-masing diturunkan dari insight User Discovery (I-01 hingga I-08) dengan implikasi desain yang actionable.

---

## 2026-07-14 (sesi kedelapan)

### Fixed — Inkonsistensi pada PROJECT_OVERVIEW.md

* `project-manager/PROJECT_OVERVIEW.md` — menghapus section `Current Phase` yang memuat status/milestone basi (masih menyebut M1 — Discovery), melanggar aturan Document Type Classification yang sudah ditetapkan sendiri di `PROJECT_RULES.md`.

### Added — Developer Profile & Working Preferences

* Menambahkan section **Developer Profile & Working Preferences** di `PROJECT_OVERVIEW.md` — mencatat profil solo developer dan preferensi kerja yang sudah terkonfirmasi dari sesi-sesi sebelumnya.
* Menambahkan retroaktif 3 entri `CONVERSATIONS.md` yang terlewat: diskusi Document Type Classification, pemisahan `product-discovery/` dari `project-manager/`, dan evaluasi "apakah project-manager sudah menjadi asisten pribadi".

### Added — Proactive Consistency Check

* Menambahkan section **Proactive Consistency Check** pada `SKILL.md` — AI wajib memeriksa dokumen Static Reference terhadap kebocoran status/progress, dan wajib melaporkannya ke user (bukan memperbaiki diam-diam).
* Menambahkan 2 aturan baru pada **Aturan Context** di `SKILL.md`: larangan memperbaiki inkonsistensi secara diam-diam, dan kewajiban mengikuti serta memperbarui Working Preferences.

### Status

Gap yang ditemukan saat evaluasi "apakah project-manager sudah menjadi asisten pribadi" sudah ditindaklanjuti: status basi dibersihkan, log diskusi disinkronkan, working preference mulai terdokumentasi, dan ada mekanisme proaktif untuk mencegah inkonsistensi serupa terulang.

---

## 2026-07-14 (sesi ketujuh)

### Changed — Pemisahan Struktur `product-discovery/` dari `project-manager/`

* Memindahkan folder `product-discovery/` keluar dari `project-manager/` menjadi folder top-level, sejajar (sibling) dengan `project-manager/`.
* Menambahkan ADR-011 pada `DECISIONS.md` — mendokumentasikan alasan pemisahan struktur.
* Menulis ulang `project-manager/README.md` secara menyeluruh: menghapus struktur folder usang yang tidak pernah ada (`01-discovery/`, `07-ai/`, `08-management/`, dsb.), menjelaskan `project-manager/` sebagai dokumentasi cara kerja, dan `product-discovery/` sebagai Source of Truth produk.

### Fixed — Perbaikan Path Referensi Antar Dokumen

* `product-discovery/README.md` — path ke dokumen `project-manager/` diperbaiki (`../project-manager/...`).
* `product-discovery/01-business/README.md` — memperbaiki path yang sudah rusak sejak sebelum pemindahan folder (Documents dan Decision Rules section), sekaligus menyesuaikan ke struktur baru.
* `product-discovery/02-product/README.md`, `03-user/README.md`, `04-ux/README.md`, `06-engineering/README.md` — seluruh referensi ke `PROJECT_OVERVIEW.md`, `PROJECT_RULES.md`, `PROJECT_STATE.md`, `DECISIONS.md` diperbaiki menjadi `../../project-manager/...`.
* `project-manager/PROJECT_STATE.md`, `PROJECT_RULES.md`, `PROJECT_OVERVIEW.md` — section `Related Documents` diperbaiki menjadi `../product-discovery/...`.
* `.agents/skills/project-os-navigator/SKILL.md` — path operasional (`Load Context`, `File Map`, `Additional Resources`) diperbaiki dari `project-manager/product-discovery/...` menjadi `product-discovery/...`, dan File Map dipecah menjadi dua tree sejajar.
* Seluruh dokumen individual di `product-discovery/01-business/`, `02-product/`, `03-user/` (bukan hanya README.md) — referensi ke `PROJECT_OVERVIEW.md`, `PROJECT_RULES.md`, `PROJECT_STATE.md`, `DECISIONS.md`, `CHANGELOG.md` diperbaiki secara massal menjadi `../../project-manager/...`.

### Status

Struktur repository kini: `project-manager/` (cara kerja) dan `product-discovery/` (pengetahuan produk) sebagai dua folder top-level yang terpisah. Seluruh referensi path antar dokumen telah disinkronkan.

---

## 2026-07-14 (sesi ketiga)

### Added — Engineering Planning Phase

* Menambahkan `product-discovery/06-engineering/README.md` — titik masuk Engineering Planning (M6).
* Menambahkan ADR-010 pada `DECISIONS.md` — Engineering Planning sebagai fase baru di product-discovery.

### Changed — Milestone Numbering

* Menambahkan M6 — Engineering Planning sebagai milestone baru.
* Menggeser milestone lama: M6 → M7 (Repository & Bootstrap), M7 → M8 (Development), M8 → M9 (Testing & Release).
* Memperbarui `PROJECT_STATE.md`: milestone table, Recent Decisions, dan Related Documents.
* Memperbarui file map pada `.agents/skills/project-os-navigator/SKILL.md`.

### Status

Engineering Planning (M6) terdaftar sebagai fase baru. Masih ⏳ Pending — akan dikerjakan setelah M5 System Architecture selesai.

---

## 2026-07-14 (sesi keempat)

### Changed — product-discovery/README.md

* Memperbarui Objectives: menambahkan poin dokumentasi keputusan teknis engineering.
* Memperbarui Workflow: menambahkan step Engineering setelah Architecture.
* Memperbarui Folder Structure: menambahkan `06-engineering/` dengan status tiap folder.
* Memperbarui Discovery Stages: memisahkan scope `05-architecture` dan menambahkan section `06-engineering`.
* Memperbarui Exit Criteria: menambahkan Engineering Planning sebagai syarat selesai, menandai Business/Product/User Baseline yang sudah selesai.
* Memperbarui Next Phase: merujuk ke M7 — Repository & Bootstrap dengan referensi ADR-001.

### Status

`product-discovery/README.md` selaras dengan dokumentasi terbaru.

---

## 2026-07-14 (sesi kelima)

### Changed — Document Type Classification

* Menambahkan section **Document Type Classification** pada `PROJECT_RULES.md` yang mendefinisikan tiga tipe dokumen: Static Reference, Living Document, dan Append-Only.
* Menetapkan `PROJECT_STATE.md` sebagai satu-satunya source of truth untuk status dan progress.
* Menetapkan aturan: README tidak boleh memuat status (✅ ⏳ 🟡), progress (%), atau phase aktif.

### Fixed — Penghapusan Status Indicator dari README

* `product-discovery/01-business/README.md` — hapus section `Current Status`.
* `product-discovery/02-product/README.md` — hapus section `Current Status`.
* `product-discovery/03-user/README.md` — hapus section `Current Status`.
* `product-discovery/04-ux/README.md` — hapus section `Current Status`.
* `product-discovery/06-engineering/README.md` — hapus section `Current Status`.
* `product-discovery/README.md` — hapus status indicator (✅ 🟡 ⏳) dari Folder Structure dan Exit Criteria.
* `.agents/skills/project-os-navigator/SKILL.md` — hapus status indicator dari file map.

### Status

Seluruh README kini bersifat Static Reference. Status dan progress hanya ada di `PROJECT_STATE.md`.

---

## 2026-07-14 (sesi keenam)

### Changed — PROJECT_RULES.md Restructuring

* Menaikkan versi `PROJECT_RULES.md` dari 0.1.0 ke 0.2.0.
* Menambahkan section **Scope** untuk memperjelas batas aturan yang diatur dokumen ini.
* Menggabungkan `Documentation Rules` dan `Document Type Classification` menjadi satu section **Documentation Governance**, dengan subsection tambahan **Formatting Rules**.
* Memperbarui **Project Workflow**: menambahkan tahap `User` dan `Engineering` yang sebelumnya tidak tercantum, menyelaraskan dengan workflow di `product-discovery/README.md` dan milestone di `PROJECT_STATE.md`.
* Memperbaiki **Related Documents**: menghapus referensi usang `06-development/` yang tidak lagi sesuai struktur project, mengganti dengan daftar dokumen yang akurat.
* Menambahkan aturan baru pada **AI Collaboration Rules**: AI wajib mematuhi klasifikasi dokumen pada Documentation Governance.

### Status

`PROJECT_RULES.md` v0.2.0 — struktur lebih rapi, konsisten dengan milestone dan workflow terbaru.

---

## 2026-07-14 (sesi kedua)

### Added — Project OS & UX Planning Setup

* Menambahkan `CONVERSATIONS.md` — log percakapan penting antar sesi.
* Menambahkan `BRAINSTORM.md` — bank ide dari sesi brainstorming.
* Membuat `.cursor/skills/project-os-navigator/SKILL.md` — skill Cursor untuk menjaga AI selalu dalam konteks project.
* Membuat `product-discovery/04-ux/README.md` — titik masuk UX Planning (M4).

### Updated — Milestone & State

* Menyelesaikan User Discovery Review untuk `product-discovery/03-user/`.
* Menambahkan ADR-009 pada `DECISIONS.md` — User Discovery Baseline v1.0.
* Memperbarui `PROJECT_STATE.md`: M1 Discovery ✅ selesai, M4 UX Planning 🟡 aktif, progress 38%.

### Status

M1 Discovery selesai. Project masuk Phase 2 — UX Planning (M4).

---

## 2026-07-14 (sesi pertama)

### Added — Product Planning Completion

* Menambahkan `product-discovery/02-product/future-roadmap.md` sebagai backlog strategis pasca-MVP.
* Menambahkan ADR-008 pada `DECISIONS.md` untuk menetapkan Baseline Product Discovery v1.0.

### Updated — Cross-Document Synchronization

* Menandai `product-discovery/02-product/README.md` sebagai selesai (100%) dengan status review passed.
* Menyinkronkan status dan fokus terbaru pada `PROJECT_STATE.md` untuk transisi ke `product-discovery/03-user/`.
* Menyesuaikan progres overall project setelah selesainya tahap Product Planning.
* Merapikan konsistensi dokumen agar selaras dengan baseline Business v1.0 dan Product v1.0.

### Status

Product Planning selesai dan siap transisi ke User Discovery.

---

## 2026-07-13

### Added — Project Foundation

* Membuat struktur awal `project-manager/`.
* Menambahkan `README.md`.
* Menambahkan `PROJECT_OVERVIEW.md`.
* Menambahkan `PROJECT_RULES.md`.
* Menambahkan `PROJECT_STATE.md`.
* Menambahkan `DECISIONS.md`.
* Menambahkan `CHANGELOG.md`.
* Menambahkan struktur folder `product-discovery/` beserta subfolder domain.
* Menambahkan 8 dokumen awal pada `product-discovery/01-business/`.

### Updated — Documentation

* Menstandarkan struktur `product-discovery/01-business/README.md` menjadi:
  Overview, Purpose, Scope, Documents, Workflow, Expected Output,
  Exit Criteria, Decision Rules, dan Current Status.
* Menyinkronkan seluruh dokumen bisnis agar selaras dengan target market baru:
  Marketing Team (primary), Startup dan Digital Agency (secondary).
* Memperbarui `PROJECT_OVERVIEW.md`, `target-market.md`, `business-model.md`,
  `problem-statement.md`, `pricing-strategy.md`, dan `product-vision.md`.
* Menambahkan ADR-006 pada `DECISIONS.md` untuk perubahan target market.
* Menandai `product-discovery/01-business/` sebagai selesai (100%).
* Memperbarui status milestone aktif pada `PROJECT_STATE.md` ke M1 — Discovery.
* Menyesuaikan fokus project ke tahap `product-discovery/02-product/`.
* Melakukan Business Review lintas dokumen pada `product-discovery/01-business/`.
* Menyelaraskan `business-model.md` dan `pricing-strategy.md` agar konsisten (MVP free access, subscription sebagai hipotesis monetisasi).
* Menetapkan `product-discovery/01-business/` sebagai Baseline v1.0 melalui ADR-007.

### Decisions

* Memilih Hybrid Monorepo sebagai strategi repository.
* Memilih Bun sebagai JavaScript runtime.
* Memilih Next.js sebagai framework utama.
* Memilih Modular Monolith + Domain-Driven Design (DDD).
* Memilih Outstand API sebagai external integration provider.

### Status

Project Foundation sedang berlangsung.
