# v0.7 — Migrasi Astryx → shadcn/ui

> Bagian dari backlog berjenjang. Indeks + legend status: [`../TASKS.md`](../TASKS.md).

**Tujuan rilis:** Mengganti fondasi UI component system dari Astryx ke
shadcn/ui secara menyeluruh, sesuai **ADR-097** (reverse ADR-041).

**Sifat rilis:** Berbeda dari v0.1–v0.6 (rilis fitur produk), rilis ini
**cross-cutting** — menyentuh UI di semua route segment yang sudah dibangun
release lain (auth, onboarding, app shell, settings, publish, dashboard)
tanpa mengubah business logic/domain sama sekali. Ditempatkan sebagai
release tersendiri (bukan disisipkan ke v0.1–v0.6) karena skalanya besar
(8 task, 26 subtask) — beda dari pola T-094 (1 task tooling kecil yang
cukup disisipkan ke `v01-foundation.md`).

**Strategi migrasi (ADR-097 poin 2):** incremental per route-segment,
Astryx & shadcn/ui **coexist** sementara — bukan big-bang/freeze fitur.
Urutan task di bawah = urutan pengerjaan yang disarankan (T-095 →
T-096 → … → T-102), tapi T-097–T-101 secara teknis independen satu sama
lain (file/route berbeda) begitu T-095/T-096 selesai, sehingga bisa
dikerjakan **paralel lewat beberapa subagent** (lihat field **Domain** tiap
task dan pemetaan di `.claude/agents/README.md`, ADR-063).

**Baseline audit:** hasil audit lengkap (2026-09-01) — 49 file unik
meng-import `@astryxdesign/*`, ~44 komponen/hook berbeda, 1 wrapper
selektif (`components/ui/Drawer.tsx`), 0 file test komponen UI (tidak ada
regression safety-net otomatis untuk layer ini, verifikasi wajib
manual/visual). Seluruh pemakaian Astryx terisolasi di `app/` (46 file)
dan `components/` (3 file) — `domains/` dan `lib/` sudah bersih.

**Known Issues yang berpotensi resolved setelah migrasi ini:** KI-005
(Astryx masih Beta — jadi moot), KI-030 (`TimeInput` tanpa input-guard),
KI-035 poin 1 & 2 (StyleX/`xstyle` gagal setup, `Badge` tanpa
`size`/truncation). **KI-040** (gap visual notification panel) perlu
diverifikasi ulang setelah migrasi, tidak otomatis resolved.

---

### T-095 · Setup Fondasi shadcn/ui & Tooling Migrasi

`⏳ Not Started` · **Domain** platform/tooling · **ADR** ADR-097, ADR-064 · **Depends** —
**Baca dulu:** `ADR-097` · `AGENTS.md` § Kompatibilitas tool (ADR-064)

Setup awal sebelum migrasi komponen apa pun bisa dimulai — CLI/MCP, agent
docs, dan aturan governance. Semua subtask di sini **wajib selesai lebih
dulu** sebelum T-096 dimulai.

- [ ] **T-095.1** Install & init shadcn/ui di `apps/web` (struktur
      `components.json`, util `cn()`, kompatibel Tailwind v4 CSS-first —
      project **tidak** punya `tailwind.config.js`, hanya
      `postcss.config.mjs`, jadi verifikasi jalur init yang benar untuk
      setup ini)
- [ ] **T-095.2** Install & konfigurasi **MCP server shadcn** — tambahkan
      ke **`.mcp.json` dan `.cursor/mcp.json` sekaligus** dalam perubahan
      yang sama (dua file kembar wajib sinkron, ADR-064; jangan hanya
      update salah satu)
- [ ] **T-095.3** Tulis ulang total `apps/web/.claude/CLAUDE.md` — ganti
      seluruh workflow agent docs dari Astryx CLI (`astryx build/
      template/component`) ke workflow shadcn CLI/MCP yang setara
      (discover-first, larangan menebak nama komponen/props)
- [ ] **T-095.4** Update `AGENTS.md` rule 14 & 15 — UI produk wajib
      shadcn/ui, bukan Astryx; cek registry/MCP/CLI shadcn dulu sebelum
      menulis/mengubah komponen
- [ ] **T-095.5** Tentukan & dokumentasikan pemetaan token/theme —
      nilai warna/font theme Stone (ADR-087) ke CSS variable shadcn
      (`globals.css`); catat sebagai referensi untuk T-096.1
- [ ] **T-095.6** Update definisi subagent **Mark UI Engineer**
      (`.claude/agents/mark-ui-engineer.md`) dari "Astryx" ke "shadcn" —
      file ini Static Reference (chmod 444), **wajib** permintaan
      eksplisit King Rezi sebelum diedit, jangan dilakukan diam-diam
- [x] **T-095.7** Sinkronisasi seluruh dokumentasi baseline/reference yang
      masih menyebut Astryx sebagai fondasi aktif — **dikerjakan
      front-loaded sebelum T-096 mulai** (permintaan eksplisit King Rezi,
      2026-09-01), bukan ditunda ke T-102 cleanup:
      * `context/ctx-implementation.md`, `ctx-technical-context.md`,
        `ctx-development.md`, `ctx-design.md`
      * `product-discovery/06-engineering/dependency-strategy.md`
        (DS-D07 exact-pin Astryx — jadi moot), `monorepo-setup.md`,
        `README.md`, `design-tokens.md`
      * `product-discovery/04-ux/key-screen-patterns.md`,
        `navigation-patterns.md` (nama komponen Astryx spesifik, mis.
        `Popover` di KSP-02-F04/F08 — diganti generik/shadcn)
      * `.claude/agents/README.md` (tabel Domain→Subagent baris UI),
        `.claude/agents/prabowo-feature-engineer.md` (boundary rule)
      * `AGENTS.md` bagian selain rule 14/15 (tabel mapping task, section
        "Workflow Astryx wajib")
      * Status ADR-041, ADR-055, ADR-057, ADR-082 — tambah catatan
        "Amended by ADR-097 (2026-09-01)", **tanpa** mengubah isi
        Decision/Reason/Alternatives (riwayat keputusan tetap utuh)

---

### T-096 · Migrasi Core Infra & Shared Primitives

`⏳ Not Started` · **Domain** UI · **ADR** ADR-097 · **Depends** T-095
**Baca dulu:** `ADR-097` · `product-discovery/06-engineering/design-tokens.md`

Fondasi yang dipakai seluruh app tree — dikerjakan sebelum route-segment
manapun karena blast radius-nya mencakup semua halaman. Highest-risk task
di rilis ini (root layout + provider), verifikasi ekstra hati-hati.

- [ ] **T-096.1** `globals.css` baru — hapus `@layer astryx-base,
      astryx-theme` dan `@import` Astryx (`reset.css`, `astryx.css`,
      `theme-stone/theme.css`, `tailwind-theme.css`), pasang base
      Tailwind v4 + shadcn sesuai pemetaan token T-095.5
- [ ] **T-096.2** `components/Providers.tsx` — ganti `Theme`/`stoneTheme`
      Astryx dengan pendekatan shadcn (Tailwind `dark:` class strategy);
      **pertahankan** `ThemeModeContext`/`useThemeMode` custom (cookie
      persisted) apa adanya — logic ini sudah independen dari Astryx
- [ ] **T-096.3** Root `app/(app)/layout.tsx` — migrasi `AppShell` Astryx
      (1 titik pakai, tapi dampak ke seluruh app) ke komposisi shadcn
      (mis. `Sidebar` primitive shadcn atau layout custom Tailwind)
- [ ] **T-096.4** Bangun primitive dasar yang dipakai lintas hampir semua
      file lain: `Button`, `Text`/Typography, `Card`, `Input`, `Dialog` —
      prioritaskan berdasarkan frekuensi pakai di audit (Button/Text/
      VStack/HStack adalah yang paling sering muncul)

---

### T-097 · Migrasi Auth Flows & Onboarding

`⏳ Not Started` · **Domain** UI · **ADR** ADR-097 · **Depends** T-096
**Baca dulu:** `04-ux/` layar terkait (login, register, forgot/reset password, invite, onboarding)

~19 file, isolated dari route segment lain — aman dikerjakan paralel
dengan T-098/T-099/T-100/T-101 begitu T-096 selesai.

- [ ] **T-097.1** Login & Register forms (`app/(auth)/login/`,
      `app/(auth)/register/` — `LoginForm`, `RegisterForm`, page wrapper)
- [ ] **T-097.2** Forgot/Reset password forms (`ForgotPasswordForm`,
      `ResetPasswordForm`, page wrapper masing-masing)
- [ ] **T-097.3** Accept Invite pages (`AcceptInvitePageClient`,
      `AcceptInviteForm`, `app/(auth)/invite/[token]/page.tsx`)
- [ ] **T-097.4** `app/(auth)/layout.tsx` (Center/HStack/Text/VStack)
- [ ] **T-097.5** Onboarding flow (`app/onboarding/page.tsx`,
      `app/onboarding/layout.tsx`, `CreateWorkspaceForm`)

---

### T-098 · Migrasi App Shell & Navigasi

`⏳ Not Started` · **Domain** UI · **ADR** ADR-097 · **Depends** T-096, T-036 (fungsional stabil)
**Baca dulu:** `04-ux/information-architecture.md`

Termasuk penghapusan wrapper selektif `Drawer.tsx` — salah satu hasil
konkret migrasi ini adalah menghilangkan kebutuhan wrapper custom yang
lahir dari keterbatasan Astryx.

- [ ] **T-098.1** `WorkspaceSideNav.tsx`, `SettingsSideNav.tsx`,
      sidebar-channels `ChannelsSection.tsx`
- [ ] **T-098.2** Notification panel (`NotificationBell.tsx`) — ganti
      wrapper `components/ui/Drawer.tsx` (custom, berbasis `useLayer`/
      `useFocusTrap`/`useScrollLock` Astryx) dengan komponen shadcn
      `Sheet` asli; **hapus** `Drawer.tsx` setelah tidak ada consumer lagi
- [ ] **T-098.3** Re-verifikasi **KI-040** (gap visual panel notifikasi)
      setelah migrasi ke `Sheet` — kemungkinan root cause (geometri/
      proporsi panel) hilang bersama penghapusan wrapper custom; tutup
      atau update KI-040 sesuai hasil verifikasi browser nyata

---

### T-099 · Migrasi Settings

`⏳ Not Started` · **Domain** UI · **ADR** ADR-097 · **Depends** T-096
**Baca dulu:** `04-ux/` layar Settings terkait

~9 file di `app/(app)/settings/`.

- [ ] **T-099.1** `WorkspaceGeneralSettings.tsx`, `ProfileForm.tsx`,
      `preferences/page.tsx`, `SettingsPageHead.tsx`
- [ ] **T-099.2** `MembersTable.tsx` (termasuk migrasi helper
      `pixel`/`proportional` Table column-width Astryx),
      `InviteMemberDialog.tsx`, `InviteMemberAction.tsx`
- [ ] **T-099.3** `ConnectedAccountsList.tsx`, `ConnectPlatformMenu.tsx`,
      `WorkspacesSettingsView.tsx`

---

### T-100 · Migrasi Publish — Draft Editor Modal

`⏳ Not Started` · **Domain** UI · **ADR** ADR-097 · **Depends** T-096
**Baca dulu:** `04-ux/key-screen-patterns.md` § Draft Editor · ADR-065 (default Standard) · ADR-052 (toggle Fullscreen)

File paling kompleks di seluruh audit (`Modal.tsx`, ~68 titik pakai
Astryx) — layak jadi task tersendiri terpisah dari Publish lainnya.

- [ ] **T-100.1** Struktur modal + layout (`Dialog`, `DialogHeader`,
      `Layout`/`LayoutContent`/`LayoutFooter` → shadcn `Dialog` +
      Tailwind layout, pertahankan varian Standard/Fullscreen ADR-065/052)
- [ ] **T-100.2** Form controls: `TextInput`, `TextArea`,
      `CheckboxInput`, `RadioList`/`RadioListItem`, `DateInput`,
      `FileInput`, `Selector` → padanan shadcn (`Input`, `Textarea`,
      `Checkbox`, `RadioGroup`, `Select`, dst.)
- [ ] **T-100.3** `TimeInput` khusus — evaluasi apakah shadcn/Radix time
      input (atau native `<input type="time">` + Tailwind) menutup
      **KI-030** (tidak ada input-guard di Astryx `TimeInput`); tutup
      KI-030 kalau terbukti resolved
- [ ] **T-100.4** Verifikasi behavior penuh (Banner, Badge, Divider, Link
      di dalam modal) — regresi manual end-to-end karena tidak ada test
      komponen untuk file ini

---

### T-101 · Migrasi Publish — Calendar, Queue, Drafts, Dashboard

`⏳ Not Started` · **Domain** UI · **ADR** ADR-097 · **Depends** T-096
**Baca dulu:** `04-ux/key-screen-patterns.md` § Calendar/Queue · ADR-090/091 (Popover)

~10 file, boleh dipecah lebih lanjut jadi sub-sesi kalau perlu.

- [ ] **T-101.1** Calendar: `CalendarMonthGrid.tsx`,
      `CalendarWeekGrid.tsx`, `CalendarToolbar.tsx`,
      `CalendarPostPopover.tsx` (→ shadcn `Popover`, pertahankan pola
      ADR-090/091), `CalendarEntryFooter.tsx`, `CalendarScreen.tsx` —
      sekaligus re-evaluasi **KI-035** poin 1 (StyleX/`xstyle` tidak
      relevan lagi) dan poin 3 (layout mobile sempit, kalau shadcn Grid/
      Tailwind memberi kontrol lebih baik)
- [ ] **T-101.2** Queue: `QueueList.tsx`, `QueueScreen.tsx`
- [ ] **T-101.3** Drafts: `DraftsList.tsx`
- [ ] **T-101.4** `PublishPageHeader.tsx`, `PublishTabbar.tsx`,
      `app/(app)/publish/layout.tsx`
- [ ] **T-101.5** Dashboard: `DashboardHome.tsx` — catat juga **KI-036**
      (dashboard fetch via Server Action, menyimpang RS-D02) tetap
      technical debt terpisah, tidak termasuk scope migrasi UI ini

---

### T-102 · Cleanup & Verifikasi Akhir

`⏳ Not Started` · **Domain** platform/tooling · **ADR** ADR-097 · **Depends** T-097, T-098, T-099, T-100, T-101
**Baca dulu:** —

Task penutup — baru dikerjakan setelah **semua** route segment selesai
dimigrasikan, memastikan tidak ada sisa Astryx di codebase.

- [ ] **T-102.1** Hapus dependency `@astryxdesign/core`,
      `@astryxdesign/theme-stone`, `@astryxdesign/cli` dari
      `apps/web/package.json`; hapus script `astryx`; hapus field
      `"astryx"` config
- [ ] **T-102.2** Grep ulang seluruh `apps/web/src` untuk memastikan **0**
      import `@astryxdesign/*` tersisa (safety check sebelum uninstall)
- [ ] **T-102.3** Update dokumen `context/ctx-design.md` dan
      `context/ctx-implementation.md` yang masih menyebut Astryx sebagai
      baseline aktif
- [ ] **T-102.4** QA visual menyeluruh oleh Najwa QA Engineer, per area
      (Auth, Onboarding, App Shell, Settings, Publish, Dashboard) — wajib
      manual/browser karena tidak ada test komponen sebagai regression
      safety-net
- [ ] **T-102.5** Re-evaluasi & tutup **KI-005** (Astryx Beta — moot),
      **KI-030** (TimeInput, kalau belum ditutup di T-100.3), **KI-035**
      poin 1 & 2 (kalau belum ditutup di T-101.1) sesuai hasil migrasi
      nyata — jangan tutup otomatis tanpa verifikasi
