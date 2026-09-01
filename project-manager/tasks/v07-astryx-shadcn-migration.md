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

`✅ Done` (2026-09-01) · **Domain** platform/tooling · **ADR** ADR-097, ADR-064 · **Depends** —
**Baca dulu:** `ADR-097` · `AGENTS.md` § Kompatibilitas tool (ADR-064)

Setup awal sebelum migrasi komponen apa pun bisa dimulai — CLI/MCP, agent
docs, dan aturan governance. Semua subtask di sini **wajib selesai lebih
dulu** sebelum T-096 dimulai.

- [x] **T-095.1** Install & init shadcn/ui di `apps/web` (struktur
      `components.json`, util `cn()`, kompatibel Tailwind v4 CSS-first —
      project **tidak** punya `tailwind.config.js`, hanya
      `postcss.config.mjs`, jadi verifikasi jalur init yang benar untuk
      setup ini). Detail:
      * Base library **Radix** (dikonfirmasi King Rezi setelah dijelaskan
        3 opsi radix/base-ui/react-aria) + style preset **Maia** →
        `components.json` `"style": "radix-maia"`.
      * shadcn CLI v4.19.1 gagal deteksi Tailwind v4 karena `globals.css`
        project pakai 3 baris `@import` terpisah
        (`tailwindcss/theme.css`+`preflight.css`+`utilities.css`, bukan
        `@import "tailwindcss";` tunggal — CLI cuma cek substring exact).
        Diganti ke `@import "tailwindcss";` tunggal — **identik secara
        fungsional** (isi `tailwindcss/index.css` upstream persis 3 baris
        itu digabung), urutan `@layer` tidak berubah karena cascade layer
        order ditentukan oleh deklarasi `@layer reset, theme, base,
        astryx-base, astryx-theme, components, utilities;` di baris 1,
        bukan posisi fisik import.
      * `bunx shadcn@latest init` auto-edit `layout.tsx` (tambah font
        Figtree + import `cn` dari `@/lib/utils`) dan `globals.css`
        (append CSS variable tema shadcn default + `@layer base` baru) —
        perilaku bawaan CLI, bukan langkah manual.
      * **Bug CLI ditemukan & diperbaiki:** hasil merge CLI menulis
        `--font-sans: var(--font-sans);` (self-referencing/circular) di
        `@theme inline` — dikembalikan ke `var(--font-geist-sans)` sesuai
        intent semula, supaya `font-sans` tidak resolve ke initial value.
      * Preset Maia default **`iconLibrary: "hugeicons"`** (bukan
        `lucide-react` yang lebih umum di ekosistem shadcn) —
        **dikonfirmasi King Rezi (2026-09-01): tetap hugeicons**, ikuti
        default preset apa adanya, konsisten dengan gaya visual Maia yang
        sudah dipilih. `react-icons` (Astryx lama) tetap coexist sampai
        migrasi selesai — wajar untuk masa transisi ADR-097, bukan
        dianggap masalah.
      * Dependency baru: `radix-ui`, `class-variance-authority`, `clsx`,
        `tailwind-merge`, `tw-animate-css`, `shadcn` (CLI, devDep-style
        tapi tercatat CLI di `dependencies`), `@hugeicons/core-free-icons`,
        `@hugeicons/react`.
      * Verifikasi: `bun run typecheck` bersih; dev server restart bersih
        (`GET / 200`, `GET /api/realtime/token 200`, tidak ada error di
        log). Verifikasi visual di Browser pane sempat terhambat redirect
        loop `/`↔`/login` akibat session cookie basi di profil browser
        (bukan bug dari perubahan T-095.1 — `proxy.ts` cuma cek
        *keberadaan* cookie, bukan validitasnya, untuk redirect cepat
        halaman auth publik; kalau cookie ada tapi invalid, terjadi loop.
        Layak jadi temuan terpisah, bukan diperbaiki di sini karena beda
        domain/scope). Diatasi dengan sign-out manual lewat
        `/api/auth/sign-out` (bypass path), lalu halaman `/login` render
        normal — styling Astryx utuh, tidak ada regresi visual dari
        `globals.css` baru.
- [x] **T-095.2** Install & konfigurasi **MCP server shadcn** — tambahkan
      ke **`.mcp.json` dan `.cursor/mcp.json` sekaligus** dalam perubahan
      yang sama (dua file kembar wajib sinkron, ADR-064; jangan hanya
      update salah satu). Dikerjakan via CLI resmi
      (`bunx shadcn@latest mcp init --client claude` lalu
      `--client cursor`, dijalankan dari root repo) — server terdaftar
      `stdio` (`npx shadcn@latest mcp`, bukan `http` seperti `xds`/
      `supabase`/`railway`) di kedua file, isinya identik. Sebagai efek
      samping CLI menambah devDependency `shadcn@^4.19.1` di root
      `package.json` (selain yang sudah ada di `apps/web/package.json`
      dari T-095.1) — versi konsisten, dibiarkan. Sempat gagal connect
      (`CONNECTION_CLOSED`) setelah restart Claude Code karena cache
      `~/.npm/_cacache` root-owned (bug lama npm dari sudo npm/npx
      sebelumnya) — `npx shadcn@latest mcp` gagal EACCES saat di-spawn.
      Diperbaiki King Rezi via `sudo chown -R 501:20 ~/.npm` lalu restart
      ulang. **Terverifikasi tersambung** — 7 tool muncul:
      `search_items_in_registries`, `view_items_in_registries`,
      `list_items_in_registries`, `get_add_command_for_items`,
      `get_item_examples_from_registries`, `get_project_registries`,
      `get_audit_checklist`.
- [x] **T-095.3** Tulis ulang total `apps/web/.claude/CLAUDE.md` — ganti
      seluruh workflow agent docs dari Astryx CLI (`astryx build/
      template/component`) ke workflow shadcn CLI/MCP yang setara
      (discover-first, larangan menebak nama komponen/props). Workflow baru:
      cek `components/ui/` dulu → search registry (MCP
      `search_items_in_registries` / `shadcn search`) → view source/props
      (`view_items_in_registries` / `shadcn view`) → cek contoh pakai
      (`get_item_examples_from_registries`) → install
      (`get_add_command_for_items` / `shadcn add`) → audit
      (`get_audit_checklist`). Rules diganti dari model props-only Astryx
      ke model Tailwind-utility + `cva` variants + `cn()` shadcn; icon
      library `hugeicons` (preset Maia) dicatat sebagai default komponen
      baru, `react-icons` tetap coexist untuk kode yang belum migrasi.
- [x] **T-095.4** Update `AGENTS.md` rule 14 & 15 — UI produk wajib
      shadcn/ui, bukan Astryx; cek registry/MCP/CLI shadcn dulu sebelum
      menulis/mengubah komponen. **Sudah selesai lebih dulu** — masuk
      commit `07a3aa2` ("docs: sinkronkan baseline UI docs ke shadcn/ui
      sesuai ADR-097"), bagian dari sinkronisasi dokumentasi baseline
      sebelum T-095.1–.3 dikerjakan di sesi ini (bukan pekerjaan T-095.7,
      itu daftarnya beda — lihat isi commit). Diverifikasi ulang isinya
      di sesi ini (2026-09-01): rule 14 sudah menyebut shadcn/ui + ADR-097
      + coexist Astryx sementara; rule 15 sudah mewajibkan cek
      `apps/web/.claude/CLAUDE.md` dan/atau registry/CLI/MCP shadcn,
      larangan menebak nama komponen/props — tidak ada gap, tidak perlu
      edit tambahan.
- [x] **T-095.5** Tentukan & dokumentasikan pemetaan token/theme —
      nilai warna/font theme Stone (ADR-087) ke CSS variable shadcn
      (`globals.css`); catat sebagai referensi untuk T-096.1. Ditulis di
      `product-discovery/06-engineering/design-tokens.md` § "Engineering
      Mapping — Stone theme → CSS variable shadcn/ui (T-095.5)" (bukan
      token brand baru — brand/status/feedback tetap `TBD` menunggu design
      lock, DT-D06). Isi: tabel 1:1 warna light/dark (`--background` dst.
      → sumber `--color-*` Stone, dipecah dari `light-dark()` ke
      `:root`/`.dark`), tabel `--sidebar-*`, keputusan **tidak** memetakan
      chart palette (belum ada domain Analytics termigrasi) dan radius
      (dipertahankan default preset Maia, bukan skala radius Stone —
      supaya komponen tergenerate seperti `Button` `rounded-4xl` tidak
      bergeser tanpa review visual), dan gap font: `--font-sans` (Figtree)
      sudah cocok, `--font-heading` masih fallback ke Figtree padahal
      Stone pakai Montserrat khusus heading — dicatat sebagai to-do
      konkret untuk T-096.1 (load `Montserrat` via `next/font/google`).
- [x] **T-095.6** Update definisi subagent **Mark UI Engineer**
      (`.claude/agents/mark-ui-engineer.md`) dari "Astryx" ke "shadcn" —
      file ini Static Reference (chmod 444), **wajib** permintaan
      eksplisit King Rezi sebelum diedit, jangan dilakukan diam-diam.
      Diedit setelah izin eksplisit King Rezi (2026-09-01, sekaligus
      dengan permintaan mengerjakan T-095.6). Perubahan: frontmatter
      `description` (Astryx → shadcn, plus catatan coexist migrasi
      incremental), body diganti total — workflow discover-first
      (`components/ui/` → search → view → examples → install → audit,
      dipetakan ke tool MCP shadcn), rules dari model Astryx (props-only,
      Tailwind layout-only) ke model shadcn (Tailwind utility utama,
      `cn()`, `cva` variant dibaca dari file komponen, `hugeicons`
      default icon library), plus rule baru: cek dulu file yang disentuh
      masih Astryx atau sudah shadcn sebelum mengasumsikan fondasi UI-nya
      (ADR-097 migrasi per route-segment, bukan big-bang).
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

`✅ Done` (2026-09-01) · **Domain** UI · **ADR** ADR-097 · **Depends** T-095
**Baca dulu:** `ADR-097` · `product-discovery/06-engineering/design-tokens.md`

Fondasi yang dipakai seluruh app tree — dikerjakan sebelum route-segment
manapun karena blast radius-nya mencakup semua halaman. Highest-risk task
di rilis ini (root layout + provider), verifikasi ekstra hati-hati.

- [x] **T-096.1** `globals.css` baru — hapus `@layer astryx-base,
      astryx-theme` dan `@import` Astryx (`reset.css`, `astryx.css`,
      `theme-stone/theme.css`, `tailwind-theme.css`), pasang base
      Tailwind v4 + shadcn sesuai pemetaan token T-095.5
- [x] **T-096.2** `components/Providers.tsx` — ganti `Theme`/`stoneTheme`
      Astryx dengan pendekatan shadcn (Tailwind `dark:` class strategy);
      **pertahankan** `ThemeModeContext`/`useThemeMode` custom (cookie
      persisted) apa adanya — logic ini sudah independen dari Astryx
- [x] **T-096.3** Root `app/(app)/layout.tsx` — migrasi `AppShell` Astryx
      (1 titik pakai, tapi dampak ke seluruh app) ke komposisi shadcn
      (mis. `Sidebar` primitive shadcn atau layout custom Tailwind)
- [x] **T-096.4** Bangun primitive dasar yang dipakai lintas hampir semua
      file lain: `Button`, `Text`/Typography, `Card`, `Input`, `Dialog` —
      prioritaskan berdasarkan frekuensi pakai di audit (Button/Text/
      VStack/HStack adalah yang paling sering muncul)
- Catatan penting (2026-09-01, disetujui King Rezi):
  * `@import` CSS Astryx di `globals.css` **sengaja dipertahankan**
    (tidak dihapus sesuai rencana awal T-096.1) karena route-segment
    yang belum dimigrasi (auth/settings/publish — T-097–T-101) masih
    butuh CSS itu; akan dihapus di T-102 setelah semua route-segment
    selesai migrasi.
  * `<Theme>` Astryx di `Providers.tsx` **sengaja dipertahankan
    berdampingan** dengan class `dark` shadcn (bukan pengganti) —
    supaya dark/light mode tidak desync antara bagian yang sudah
    shadcn dan yang masih Astryx; akan dilepas di T-102.
  * Gap yang sengaja belum ditutup: sidebar mobile (hamburger+drawer)
    di `(app)/layout.tsx` belum direplikasi di layout baru, menyusul
    di T-098 bersamaan migrasi `WorkspaceSideNav`/`SettingsSideNav`
    ke `Sheet`.
  * Komponen primitive baru yang ditambahkan: `Button`, `Card`,
    `Dialog`, `Input` (via CLI shadcn resmi), `Text`/Typography
    (ditulis manual — shadcn tidak punya komponen Typography resmi).
  * Verifikasi: typecheck bersih, lint bersih, verifikasi visual
    manual di browser tidak menemukan regresi. Dikerjakan di branch
    `feature/t-096-core-infra-migration`, dikonfirmasi King Rezi
    ("aman").

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
