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

`✅ Done` (2026-09-02) · **Domain** UI · **ADR** ADR-097 · **Depends** T-096
**Baca dulu:** `04-ux/` layar terkait (login, register, forgot/reset password, invite, onboarding)

~19 file, isolated dari route segment lain — aman dikerjakan paralel
dengan T-098/T-099/T-100/T-101 begitu T-096 selesai.

- [x] **T-097.1** Login & Register forms (`app/(auth)/login/`,
      `app/(auth)/register/` — `LoginForm`, `RegisterForm`, page wrapper)
- [x] **T-097.2** Forgot/Reset password forms (`ForgotPasswordForm`,
      `ResetPasswordForm`, page wrapper masing-masing)
- [x] **T-097.3** Accept Invite pages (`AcceptInvitePageClient`,
      `AcceptInviteForm`, `app/(auth)/invite/[token]/page.tsx`)
- [x] **T-097.4** `app/(auth)/layout.tsx` (Center/HStack/Text/VStack)
- [x] **T-097.5** Onboarding flow (`app/onboarding/page.tsx`,
      `app/onboarding/layout.tsx`, `CreateWorkspaceForm`)
- Catatan penting (2026-09-02, implementasi Mark UI Engineer, review
  arsitektur Ridwan 0 temuan, QA Najwa semua PASS):
  * Komponen shadcn baru di-install: `alert`, `checkbox`, `label`,
    `separator`, `field` (Field/FieldGroup/FieldLabel/FieldSeparator/
    FieldDescription), `empty` (Empty/EmptyHeader/EmptyMedia/EmptyTitle/
    EmptyDescription), `input-group`, `textarea` (dependency ikutan,
    tidak dipakai langsung di scope ini).
  * Astryx `Banner status="info"/"error"` → shadcn `Alert` cuma punya
    varian `default`/`destructive` (tidak ada varian info) — error dipetakan
    ke `destructive`, info ke `default` netral, tidak mengarang varian baru.
  * **Gap desain terverifikasi (Mark, dikonfirmasi independen Ridwan via
    grep `globals.css`)**: Stone theme shadcn **belum punya token
    `--success`/`--warning`**, hanya `--destructive`. Astryx
    `EmptyState color="success"/"warning"/"error"` dipakai untuk 3 state
    Accept Invite (success/expired/invalid) — karena token tidak ada,
    state "invalid" dipetakan ke `text-destructive` (token yang memang
    ada), sedangkan "expired"/"success" dibiarkan netral (bukan mengarang
    hex/token baru tanpa ADR). Dicatat sebagai **KI-041** (`PROJECT_STATE.md`)
    — keputusan terbuka untuk King Rezi, belum ditutup sendiri.
  * Penyesuaian teknis kecil (settled, bukan gap): `max-w-[400px]`/`[480px]`
    arbitrary value → `max-w-sm`/`max-w-md` (kena rule lint
    `tailwindcss/no-arbitrary-value`); `text-on-accent` →
    `text-accent-foreground` (nama token shadcn yang benar); `Button`
    tidak punya prop `isLoading` bawaan → dipakai pola manual `disabled`
    + ikon spinner `animate-spin`.
  * Verifikasi: typecheck 0 error, lint 0 error (2 warning kosmetik
    pre-existing di `textarea.tsx`, bukan dari perubahan ini), Vitest 235
    passed/4 skipped, browser E2E semua PASS (login, register,
    forgot/reset password, accept invite golden+edge case, onboarding,
    dark/light mode via cookie `theme`, regresi shell `(app)/layout.tsx`
    dari T-096 aman). Seluruh import `@astryxdesign/*` di
    `app/(auth)/**` dan `app/onboarding/**` sudah hilang (diverifikasi
    grep, sisa cuma di komentar dokumentasi). Dikerjakan di branch
    `feature/t-097-auth-flows-onboarding` (dicabang dari
    `feature/t-096-core-infra-migration`).

---

### T-098 · Migrasi App Shell & Navigasi

`✅ Done` (2026-09-02, T-098.4 tuntas — 4/4 subtask) · **Domain** UI · **ADR** ADR-097 · **Depends** T-096, T-036 (fungsional stabil)
**Baca dulu:** `04-ux/information-architecture.md`

Termasuk penghapusan wrapper selektif `Drawer.tsx` — salah satu hasil
konkret migrasi ini adalah menghilangkan kebutuhan wrapper custom yang
lahir dari keterbatasan Astryx.

- [x] **T-098.1** `WorkspaceSideNav.tsx`, `SettingsSideNav.tsx`,
      sidebar-channels `ChannelsSection.tsx`
- [x] **T-098.2** Notification panel (`NotificationBell.tsx`) — ganti
      wrapper `components/ui/Drawer.tsx` (custom, berbasis `useLayer`/
      `useFocusTrap`/`useScrollLock` Astryx) dengan komponen shadcn
      `Sheet` asli; **hapus** `Drawer.tsx` setelah tidak ada consumer lagi
- [x] **T-098.3** Re-verifikasi **KI-040** (gap visual panel notifikasi)
      setelah migrasi ke `Sheet` — kemungkinan root cause (geometri/
      proporsi panel) hilang bersama penghapusan wrapper custom; tutup
      atau update KI-040 sesuai hasil verifikasi browser nyata
- Catatan penting (2026-09-02, implementasi Mark UI Engineer, review
  arsitektur Ridwan 0 temuan, QA Najwa PASS penuh setelah 1 bug
  ditemukan+diperbaiki):
  * Komponen shadcn baru di-install: `avatar`, `badge`, `dropdown-menu`,
    `alert-dialog`, `sheet`, `tooltip`. Helper baru
    `apps/web/src/lib/utils/get-initials.ts`. `TooltipProvider`
    ditambahkan ke `apps/web/src/components/Providers.tsx`.
  * Wrapper custom `apps/web/src/components/ui/Drawer.tsx` **dihapus** —
    dikonfirmasi tidak ada consumer lain oleh Mark, di-cross-check ulang
    oleh Ridwan.
  * **KI-040 Closed (2026-09-02)** — diverifikasi Najwa lewat browser
    nyata (light & dark mode); root cause lama (geometri wrapper `Drawer`
    custom) hilang bersama penggantian ke `Sheet` asli.
  * QA Najwa menemukan 1 bug (dot indikator unread menimpa teks timestamp
    di panel notifikasi) — diperbaiki, lalu re-verifikasi PASS penuh.
    Seluruh checklist (nav items, logout Tier-2 safety check,
    `ChannelsSection`, notification panel mark-read/mark-all-read/
    persistence, light+dark mode) PASS. Typecheck/lint/Vitest bersih (235
    passed/4 skipped/0 fail — baseline sama, tidak ada regresi).
  * **Gap terbuka, belum diputuskan** — komentar existing (dari T-096.3)
    di `apps/web/src/app/(app)/layout.tsx` menyebut sidebar mobile
    (hamburger + drawer) akan "menyusul di T-098", tapi breakdown resmi
    T-098 (3 subtask di atas) tidak mencakup migrasi `layout.tsx`/
    `AppSideNav.tsx` ke shadcn `Sidebar` primitive (built-in
    mobile-`Sheet`). **Belum dikerjakan** — di luar file yang di-scope
    T-098.1–.3. Dicatat **KI-042** di `PROJECT_STATE.md`, menunggu
    keputusan King Rezi (subtask baru T-098.4? task terpisah? tetap
    ditunda?). Dikerjakan di branch `feature/t-098-app-shell-navigation`.
  * **Keputusan King Rezi:** jadi subtask baru **T-098.4**, tapi ditunda
    dulu (belum dikerjakan). Blocker rancangan Claude Design yang dicatat
    **KI-042** sudah **resolved (2026-09-02)** — rancangan mobile shell
    (sidebar hamburger+drawer, top bar) dan pola tabel mobile card sudah
    dibuat di Claude Design (project "Social Media Management"):
    `styles.css` (pattern Mobile Shell + Table mobile card, breakpoint
    768px), `foundations/layout.html` (section baru "Shell — Mobile
    (≤768px, KI-042)"), `components/navigation-mobile.html` (file baru,
    3 demo state), `components/table.html` (section baru mobile card).
    Detail lengkap di **KI-042** § `PROJECT_STATE.md`. **T-098.4 sendiri
    (implementasi kode) tetap ditunda** — rancangan tersedia tapi belum
    ada kode, menunggu keputusan King Rezi kapan lanjut.

- [x] **T-098.4** Implementasi sidebar mobile (hamburger + drawer) + pola
      tabel mobile card, menutup **KI-042**. Rancangan Claude Design
      sudah dibuat sesi sebelumnya (lihat catatan di atas). **Terkait
      KI-042.**
- Catatan implementasi (2026-09-02, dikerjakan sesi utama — bukan lewat
  Mark UI Engineer, karena `DesignSync` juga gagal dimuat di sesi subagent
  Mark, konfirmasi ketiga kalinya pola keterbatasan yang sama seperti
  Neymar sebelumnya):
  * **Scope 1 — Sidebar mobile (hamburger + Sheet):**
    `apps/web/src/app/(app)/layout.tsx` — `<aside>` desktop diubah jadi
    `hidden md:flex` (sebelumnya selalu `flex`, gap ini eksplisit dicatat
    di komentar T-096.3 lama; komentar itu sekarang diupdate menyatakan
    gap sudah ditutup). Ditambah `<MobileTopBar>` di atas baris
    sidebar+main. File baru
    `apps/web/src/app/(app)/components/MobileTopBar.tsx` — top bar
    (`md:hidden`, tinggi 52px/`h-13`) dengan tombol hamburger
    (`Menu01Icon`) yang membuka shadcn `Sheet` (`side="left"`, lebar 3/4
    layar) berisi `AppSideNav` yang **sama persis** dengan sidebar
    desktop (tidak diduplikasi) — title top bar dinamis: nama workspace
    di luar `/settings`, "Settings" di dalamnya.
    `apps/web/src/app/(app)/components/AppSideNav.tsx`,
    `WorkspaceSideNav.tsx`,
    `apps/web/src/app/(app)/settings/components/SettingsSideNav.tsx` —
    ditambah prop opsional `onNavigate?: () => void` (dipanggil di setiap
    Link/tombol nav utama) supaya Sheet otomatis tertutup setelah user
    memilih menu di mobile; prop ini `undefined` di sidebar desktop jadi
    tidak ada perubahan behavior di sana. Breakpoint `md` (768px
    Tailwind), sama dengan keputusan breakpoint di rancangan Claude
    Design.
  * **Scope 2 — Members table responsive:**
    `apps/web/src/app/(app)/settings/members/components/MembersTable.tsx`
    — tabel desktop shadcn `Table` dibungkus `hidden md:block` (isi tidak
    diubah), ditambah blok baru `flex flex-col gap-3 md:hidden` berisi
    card per anggota (avatar+nama+email, badge Status, baris Role, lalu
    `MemberActions` dengan prop baru `fullWidth` yang membuat tombol
    Change Role/Remove full-width sebagai baris terpisah dengan
    border-top, alih-alih rata-kanan di sel tabel).
  * **Verifikasi:** `bun run typecheck` bersih (0 error). `bun run lint`
    bersih (0 error) — sempat 1 error `no-restricted-syntax` di
    `MobileTopBar.tsx` (raw `<div>`), diberi `eslint-disable-next-line`
    dengan alasan file baru dikomposisi Tailwind shadcn sejak awal, bukan
    migrasi Astryx. **Verifikasi visual browser TIDAK berhasil dilakukan**
    — tool Browser pane gagal total (navigate timeout 300s berulang, baik
    ke `localhost` dev server maupun file lokal), tampak masalah
    infrastruktur/tooling sesi ini, bukan masalah kode (dev server
    Next.js start normal, "Ready in 319ms", tidak ada error compile di
    log; dev server masih berjalan di background sesi ini).
  * **Status realistis (saat itu):** kode sudah ditulis, belum direview
    Ridwan dan belum di-QA Najwa, verifikasi visual manual juga belum
    berhasil dilakukan siapa pun.
  * **Review Ridwan (Architecture Reviewer), 2026-09-02 — 0 temuan:**
    entry point bersih, tidak ada import Prisma/Supabase di komponen
    client (`MobileTopBar.tsx`, `AppSideNav.tsx`, `WorkspaceSideNav.tsx`,
    `SettingsSideNav.tsx`, `MembersTable.tsx`), cross-domain lewat public
    API domain (tidak ada import implementasi lintas folder baru), prop
    `onNavigate?: () => void` opsional dikonfirmasi tidak breaking
    (default `undefined` di sidebar desktop, behavior lama tidak
    berubah), prop `fullWidth` baru di `MemberActions` konsisten dipakai
    di kedua varian (desktop table row vs mobile card).
  * **QA Najwa, 2026-09-02 — PASS penuh:**
    - Automated: `bun run typecheck` PASS (0 error), `bun run lint` PASS
      (0 error), `bun run test` PASS (235 lulus, 4 skipped — baseline
      sama, tidak ada regresi).
    - Desktop (≥768px): tidak ada regresi — sidebar & `MembersTable.tsx`
      identik dengan sebelum T-098.4.
    - Mobile (375px, 320px): `MobileTopBar` + hamburger + `Sheet`
      berfungsi benar untuk `WorkspaceSideNav` maupun `SettingsSideNav`
      (termasuk auto-close `Sheet` via `onNavigate` saat memilih menu),
      `MembersTable.tsx` berganti ke card layout dengan tombol
      Change Role/Remove full-width berfungsi normal, dialog konfirmasi
      Tier-2 (ADR-049) tetap muncul benar dari card mobile.
    - Edge case: tidak ada horizontal overflow di layar sempit
      (320–375px), dark mode smoke test oke.
    - 2 temuan DI LUAR SCOPE T-098.4 (dicatat, bukan blocker penutupan
      ini): (a) tabel Members di lebar persis 768px butuh scroll
      horizontal internal — perilaku tabel yang **sudah ada sebelum**
      T-098.4, bukan regresi baru; (b) card "Analytics Snapshot" di
      halaman Home tetap berlatar putih saat dark mode aktif — bug dark
      mode pre-existing, tidak terkait perubahan T-098.4.
  * **T-098.4 selesai (2026-09-02)** — lolos review Ridwan (0 temuan) dan
    QA Najwa (PASS penuh). T-098 ditutup `✅ Done` (4/4 subtask tuntas).
    **KI-042 Closed (2026-09-02)** — lihat `PROJECT_STATE.md` § KI-042
    untuk catatan penutup.

---

### T-099 · Migrasi Settings

`✅ Done` (2026-09-02) · **Domain** UI · **ADR** ADR-097 · **Depends** T-096
**Baca dulu:** `04-ux/` layar Settings terkait

~9 file di `app/(app)/settings/`.

- [x] **T-099.1** `WorkspaceGeneralSettings.tsx`, `ProfileForm.tsx`,
      `preferences/page.tsx`, `SettingsPageHead.tsx`
- [x] **T-099.2** `MembersTable.tsx` (termasuk migrasi helper
      `pixel`/`proportional` Table column-width Astryx),
      `InviteMemberDialog.tsx`, `InviteMemberAction.tsx`
- [x] **T-099.3** `ConnectedAccountsList.tsx`, `ConnectPlatformMenu.tsx`,
      `WorkspacesSettingsView.tsx`
- Catatan penting (2026-09-02, implementasi Mark UI Engineer, review
  arsitektur Ridwan 0 temuan, QA Najwa PASS dengan 1 temuan minor):
  * Komponen shadcn baru di-install: `alert-dialog`, `avatar`, `badge`,
    `dropdown-menu`, `item`, `radio-group`, `select`, `table`,
    `toggle`/`toggle-group`, `tooltip`.
  * `MembersTable.tsx` — sistem kolom `pixel()`/`proportional()` Astryx
    dihapus total, diganti shadcn `Table` primitive + JSX langsung.
  * Helper baru `getInitials()` ditambahkan ke `apps/web/src/lib/utils.ts`
    (dipakai di 4 file). `TooltipProvider` ditambahkan ke
    `apps/web/src/components/Providers.tsx`.
  * Review Ridwan: 0 temuan pelanggaran arsitektur — entry point bersih,
    tidak ada leak Prisma/Supabase/Outstand, cross-domain lewat public API,
    validasi file avatar dikonfirmasi tetap otoritatif di server
    (`IdentityService.updateProfile`), tidak hilang saat migrasi
    client-side check.
  * QA Najwa: seluruh golden path PASS (General settings edit+persist,
    Danger Zone Transfer Ownership & Delete Workspace dialog Tier 1,
    upload avatar + validasi ukuran file, toggle tema Preferences, invite
    member flow lengkap sampai buka link undangan, Connected Accounts,
    switch workspace) di light & dark mode. Typecheck/lint/vitest bersih
    (235 pass, 4 skip, 0 fail).
  * **Temuan minor (Moderate, dicatat sebagai detail tambahan di
    KI-042):** kolom "Actions" (Change Role/Remove) di `MembersTable.tsx`
    tidak terlihat penuh pada viewport sempit (~800px) — perlu scroll
    horizontal (shadcn `Table` sudah punya `overflow-x-auto` bawaan,
    bukan crash/broken, tapi UX kurang optimal). Root cause sama dengan
    KI-042 (aplikasi belum punya strategi responsive/mobile yang
    didesain), bukan bug lokal satu komponen.
  * **Gap KI-041 meluas:** `MembersTable.tsx` status "Pending" dipetakan
    ke `Badge variant="outline"` (bukan "secondary" seperti Active/
    Removed) karena tidak ada token warning — treatment varian, bukan
    warna baru, konsisten pola sebelumnya di KI-041.

---

### T-100 · Migrasi Publish — Draft Editor Modal

`✅ Done (2026-09-03)` · **Domain** UI · **ADR** ADR-097 · **Depends** T-096
**Baca dulu:** `04-ux/key-screen-patterns.md` § Draft Editor · ADR-065 (default Standard) · ADR-052 (toggle Fullscreen)

File paling kompleks di seluruh audit (`Modal.tsx`, ~68 titik pakai
Astryx) — layak jadi task tersendiri terpisah dari Publish lainnya.

- [x] **T-100.1** Struktur modal + layout (`Dialog`, `DialogHeader`,
      `Layout`/`LayoutContent`/`LayoutFooter` → shadcn `Dialog` +
      Tailwind layout, pertahankan varian Standard/Fullscreen ADR-065/052)
- [x] **T-100.2** Form controls: `TextInput`, `TextArea`,
      `CheckboxInput`, `RadioList`/`RadioListItem`, `DateInput`,
      `FileInput`, `Selector` → padanan shadcn (`Input`, `Textarea`,
      `Checkbox`, `RadioGroup`, `Select`, dst.)
- [x] **T-100.3** `TimeInput` khusus — evaluasi apakah shadcn/Radix time
      input (atau native `<input type="time">` + Tailwind) menutup
      **KI-030** (tidak ada input-guard di Astryx `TimeInput`); tutup
      KI-030 kalau terbukti resolved
- [x] **T-100.4** Verifikasi behavior penuh (Banner, Badge, Divider, Link
      di dalam modal) — regresi manual end-to-end karena tidak ada test
      komponen untuk file ini
- Catatan T-100.1 (2026-09-03, King Rezi, branch
  `feature/t-100-draft-editor-modal`):
  * `apps/web/src/app/(app)/components/draft-editor/Modal.tsx` — Astryx
    `Dialog`/`DialogHeader` → shadcn `Dialog`/`DialogContent`/
    `DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter`;
    Astryx `Layout`/`LayoutContent`/`LayoutFooter` → komposisi Tailwind
    manual (beberapa `<div>` mentah pakai
    `eslint-disable-next-line no-restricted-syntax` per-baris, pola sama
    `InviteMemberDialog.tsx` T-099.2); Astryx `Button` → shadcn `Button`
    di seluruh CTA header/footer, loading state via `Spinner`.
  * Varian **Standard/Fullscreen** (ADR-065/ADR-052) dipertahankan penuh —
    Standard pakai `style` inline (bukan class arbitrary-value, kena rule
    `tailwindcss/no-arbitrary-value` di luar `components/ui/**`);
    Fullscreen pakai `style` inline + class `translate-none` eksplisit
    (bug ditemukan+diperbaiki saat verifikasi browser: Tailwind v4
    memisahkan CSS property `translate` dari `transform`, jadi override
    inline `transform:none` saja tidak cukup membatalkan utility
    `-translate-1/2` bawaan `DialogContent` shadcn).
  * `ResumeDialog` (KSP-05-F13) — perilaku `purpose="required"` Astryx
    (tidak bisa ditutup Escape/klik-luar, tanpa tombol close) direplikasi
    manual via `onEscapeKeyDown`/`onInteractOutside` `preventDefault()` +
    `showCloseButton={false}`.
  * Scope yang sengaja belum disentuh (menyusul T-100.2/.3/.4): form
    controls di body (`TextArea`, `CheckboxInput`, `RadioList`,
    `DateInput`, `FileInput`, `TextInput` Pinterest) masih Astryx;
    `TimeInput` masih Astryx (termasuk evaluasi **KI-030**); `Badge`/
    `Banner`/`Divider`/`Link` di body masih Astryx, belum diverifikasi
    regresi end-to-end penuh.
  * Verifikasi: typecheck 0 error, lint 0 error untuk file ini, browser
    E2E manual (akun Raka Pratama, workspace "Insvire") — New Post
    Standard, toggle Fullscreen↔Standard, tombol close, alur Resume
    Unfinished Post end-to-end — seluruhnya PASS. Belum dijalankan:
    review arsitektur Ridwan, QA Najwa formal, Vitest suite (belum
    diminta King Rezi).
- Catatan T-100.2 (2026-09-03, Mark UI Engineer, review Ridwan Architecture
  Reviewer, QA Najwa QA Engineer, branch `feature/t-100-draft-editor-modal`,
  file `apps/web/src/app/(app)/components/draft-editor/Modal.tsx`):
  * **Implementasi (Mark):** Caption — Astryx `TextArea` → shadcn
    `Textarea` + `Label` (sr-only) + `FieldDescription`. Media — Astryx
    `FileInput` (dropzone disabled) → native `<input type="file">` lewat
    `Input` shadcn, tetap disabled + pesan penjelasan. Account checkbox —
    Astryx `CheckboxInput` → shadcn `Checkbox` + `Label` per-akun,
    `onCheckedChange` di-cast eksplisit ke boolean. Content Format —
    Astryx `RadioList`/`RadioListItem` → shadcn `RadioGroup`/
    `RadioGroupItem` + `Label`, orientasi horizontal dipertahankan.
    Pinterest Pin Title/Destination Link — Astryx `TextInput` → shadcn
    `Input` (prop `isOptional` kosmetik dihapus, tidak pernah memengaruhi
    validasi). Tanggal Jadwal — Astryx `DateInput` → native
    `<input type="date">` lewat `Input` shadcn (bukan Popover+Calendar) —
    keputusan konsistensi karena `TimeInput` di sebelahnya masih Astryx
    (scope T-100.3) dan tetap compact inline; tidak menambah dependency
    baru (`react-day-picker`/`date-fns`) untuk satu field. Tidak ada
    komponen shadcn baru yang perlu diinstall (semua sudah ada dari
    T-099.2: `checkbox`, `input`, `label`, `radio-group`, `textarea`,
    `field`). Behavior/logic form (validasi
    `isReadyToSchedule`/`isReadyToPublishNow`, Server Action
    `scheduleDraftAction`/`publishNowAction`/`saveDraftAction`) tidak
    diubah — murni migrasi UI library.
  * Verifikasi Mark: typecheck 0 error, lint 0 error, browser E2E manual
    PASS (New Post → isi form → Schedule → dialog konfirmasi benar →
    redirect Home sesuai ADR-054), dark mode dicek visual OK.
  * **Review Ridwan (0 temuan):** Entry point bersih (tidak ada Server
    Action tersentuh di diff); tidak ada import Prisma/Supabase/Outstand
    HTTP client; cross-domain lewat public API, shared types tetap dari
    `@social/shared`; klaim "behavior tidak berubah" diverifikasi
    baris-per-baris untuk 6 kontrol — semua identik secara semantik.
    Catatan non-blocking: file ini belum pakai komposisi penuh
    `Field`/`FieldLabel`/`FieldContent`/`FieldGroup` seperti
    `InviteMemberDialog.tsx` (T-099.2) — wajar karena migrasi bertahap
    (layout `VStack`/`HStack` masih Astryx, menyusul subtask lain).
    Dipertimbangkan saat migrasi layout berikutnya, bukan blocking
    sekarang.
  * **QA Najwa (PASS):** `bun run typecheck` PASS, `bun run lint` PASS,
    `bun run test` PASS (235 pass, 4 skip, 0 fail). Semua kontrol form
    (golden path + edge case) PASS: Caption, Media disabled, Account
    checkbox multi-select, Content Format `RadioGroup` switch, Tanggal
    Jadwal kombinasi dengan `TimeInput` Astryx. Pinterest Pin
    Title/Destination Link **tidak bisa diuji** — workspace test
    (Insvire/Raka Pratama) tidak punya akun Pinterest terhubung; risiko
    dinilai rendah karena komponen `Input` sama dengan field lain yang
    sudah terverifikasi dan logic kondisional tidak diubah di diff ini.
    Alur end-to-end PASS semua: Save Draft→reload persist, Schedule→dialog
    konfirmasi→redirect queue (ADR-054), Publish Now→confirm→redirect
    calendar (ADR-054), Resume Unfinished Post (caption ter-restore;
    account/format/jadwal memang tidak ter-restore — desain lama
    `UnsavedNewPost` interface, bukan regresi), toggle
    Fullscreen↔Standard sambil form terisi (state terjaga), light & dark
    mode kontras OK, regresi Calendar/Queue/Drafts tidak ada crash.
  * **Temuan Minor (bukan blocker, bukan regresi T-100.2 — sudah ada
    sejak versi lama file, diverifikasi via `git log -p`):**
    `clearUnsavedNewPost()` di `Modal.tsx` hanya dipanggil di
    `handleSaveDraft`, tidak dipanggil di
    `handleConfirmSchedule`/`handleConfirmPublishNow`. Akibatnya
    localStorage "unsaved draft" tidak terhapus setelah Schedule/Publish
    Now sukses (kalau user sempat trigger `persistUnsavedNewPost`
    sebelumnya) — `ResumeDialog` bisa muncul lagi dengan caption basi di
    sesi New Post berikutnya. Dicatat sebagai **KI-043** (lihat
    `PROJECT_STATE.md`), di luar scope T-100.2.
- Catatan T-100.3 (2026-09-03, Mark UI Engineer, review Ridwan Architecture
  Reviewer, QA Najwa QA Engineer, branch `feature/t-100-draft-editor-modal`,
  file `apps/web/src/app/(app)/components/draft-editor/Modal.tsx`):
  * **Implementasi (Mark):** Dicek MCP shadcn
    (`search_items_in_registries`) — tidak ada komponen time-picker resmi
    di registry shadcn. Pilih native `<input type="time">` dibungkus
    `Input` shadcn, pola identik dengan field tanggal (`Input
    type="date"`) dari T-100.2. Astryx `TimeInput` (import dari
    `@astryxdesign/core/TimeInput`) dihapus, diganti `Label
    htmlFor="draft-schedule-time" className="sr-only"` + `Input
    id="draft-schedule-time" type="time"`, `value={scheduleTime ?? ""}`,
    `onChange` set `scheduleTime` ke `event.target.value || undefined`.
    `handleConfirmSchedule` (compose `` `${scheduleDate}T${scheduleTime}` ``)
    dan `isReadyToSchedule` tidak disentuh — format `HH:mm` native
    kompatibel langsung.
  * Verifikasi Mark: typecheck 0 error, lint 0 error, browser E2E (dark &
    light) — uji ketik huruf/simbol/overflow ke field waktu
    ditolak/clamp oleh browser, submit Schedule end-to-end sukses dengan
    waktu tersimpan tepat. **Kesimpulan Mark: KI-030 RESOLVED**
    (dibuktikan lewat pengujian eksplisit).
  * **Review Ridwan (0 temuan):** tidak ada business logic baru, tidak ada
    import Prisma/Supabase/Outstand, cross-domain tetap lewat Server
    Action existing; `handleConfirmSchedule`/`isReadyToSchedule`
    dikonfirmasi via grep benar-benar tidak tersentuh diff; konsisten
    pola dengan field tanggal T-100.2. Catatan non-arsitektur (sudah
    dikonfirmasi King Rezi via AskUserQuestion): native time input tidak
    lagi membatasi ke kelipatan 15 menit seperti Astryx `increment={15}`
    lama — **keputusan produk eksplisit King Rezi: dibiarkan bebas**,
    bukan bug, tidak perlu ditambah `step={900}`.
  * **QA Najwa (PASS, verifikasi independen):** `bun run typecheck` PASS,
    `bun run lint` PASS, `bun run test` PASS (235 pass, 4 skip, 0 fail).
    **KI-030 diverifikasi ulang independen dan dikonfirmasi RESOLVED** —
    ketik huruf/simbol/karakter berlebih ke field waktu ditolak total oleh
    browser native, tidak seperti Astryx lama yang bisa diketik bebas.
    Golden path Schedule PASS (waktu 14:07 tersimpan tepat), menit bebas
    (bukan kelipatan 15) PASS sesuai keputusan produk, jam batas 00:00 &
    23:59 PASS, clear/reset field PASS, Publish Now tidak terpengaruh
    PASS, Resume Unfinished Post tidak ada regresi PASS, light/dark mode
    PASS, regresi Calendar/Queue/Drafts PASS.
  * **KI-030 Closed (2026-09-03)** — root cause (Astryx `TimeInput`
    internal `<input type="text">` tanpa `maxLength`/`pattern`) hilang
    total setelah migrasi ke native `<input type="time">`. Lihat
    `PROJECT_STATE.md` § KI-030 untuk catatan penutup lengkap.
  * **Temuan Minor baru (pre-existing gap, bukan regresi T-100.3,
    dikonfirmasi King Rezi untuk dicatat sebagai KI baru):** tidak ada
    validasi yang mencegah Schedule ke waktu yang sudah lewat pada
    tanggal hari ini (mis. jadwalkan jam 08:00 padahal sekarang sudah jam
    11:48) — post berhasil masuk Queue tanpa penolakan/warning. Gap ini
    sudah ada sejak sebelum migrasi (Astryx `TimeInput` juga tidak punya
    validasi ini), bukan regresi baru. Dicatat sebagai **KI-044** (lihat
    `PROJECT_STATE.md`), di luar scope T-100.3.
- Catatan T-100.4 (2026-09-03, Najwa QA Engineer, branch
  `feature/t-100-draft-editor-modal`, file
  `apps/web/src/app/(app)/components/draft-editor/Modal.tsx`):
  * **QA Najwa (PASS) — verifikasi end-to-end penuh, bukan migrasi kode
    baru:** `bun run typecheck` PASS, `bun run lint` PASS, `bun run test`
    PASS (235 pass, 4 skip, 0 fail).
  * Full E2E regression PASS semua: New Post→Schedule, New Post→Publish
    Now, New Post→Save Draft (termasuk caption kosong), Edit Draft
    existing, `ResumeDialog` (`purpose="required"` — Escape/klik-luar
    tidak menutup, Resume/Mulai Baru keduanya benar), toggle
    Fullscreen↔Standard (data tidak hilang), Close via X/Escape/klik-luar
    di berbagai state form, entry point dari Calendar "+ New Post", Queue
    "Publish Now" icon, Queue "Edit".
  * `Banner`/`Badge`/`Divider` Astryx yang masih ada di modal (belum
    dimigrasi, di luar scope T-100 — menyusul task lain) dicek visual
    light+dark mode, tidak ada style clash dengan komponen shadcn yang
    sudah dimigrasi.
  * Accessibility: tab order logis, focus visible
    (`focus-visible:ring-[3px]`), Escape/klik-luar konsisten sesuai
    desain per varian dialog.
  * RBAC: dicek `roles-permissions.md`, tidak ada perbedaan behavior
    modal antar role (Owner/Admin/Creator) untuk fitur draft/schedule/
    publish — tidak ada gap.
  * Console bersih, tidak ada error selama seluruh sesi testing.
  * **Catatan minor (informational, bukan bug):** Link "Reconnect"
    (skenario akun Disconnected) dan field Pinterest (Pin Title/
    Destination Link) tidak bisa diverifikasi karena data test (workspace
    Insvire) tidak punya akun dengan kondisi tersebut — gap coverage data
    test, bukan bug, direkomendasikan ditambah ke data seed kalau ingin
    coverage 100%. Juga dicatat ulang **KI-032** (Edit Draft tidak
    preload akun yang sebelumnya dijadwalkan) — sudah ada sebelum T-100,
    bukan regresi baru, tidak perlu KI baru (sudah tercatat).
  * **Kesimpulan QA: T-100 siap Done sepenuhnya.**
- **T-100 Done (2026-09-03)** — seluruh 4/4 subtask (T-100.1–T-100.4)
  tuntas: struktur modal + layout, form controls, `TimeInput` (KI-030
  Closed), verifikasi behavior penuh. Lihat catatan per-subtask di atas
  untuk detail lengkap.

---

### T-101 · Migrasi Publish — Calendar, Queue, Drafts, Dashboard

`✅ Done` (2026-09-03) · **Domain** UI · **ADR** ADR-097 · **Depends** T-096
**Baca dulu:** `04-ux/key-screen-patterns.md` § Calendar/Queue · ADR-090/091 (Popover)

~10 file, boleh dipecah lebih lanjut jadi sub-sesi kalau perlu.

- [x] **T-101.1** Calendar: `CalendarMonthGrid.tsx`,
      `CalendarWeekGrid.tsx`, `CalendarToolbar.tsx`,
      `CalendarPostPopover.tsx` (→ shadcn `Popover`, pertahankan pola
      ADR-090/091), `CalendarEntryFooter.tsx`, `CalendarScreen.tsx` —
      sekaligus re-evaluasi **KI-035** poin 1 (StyleX/`xstyle` tidak
      relevan lagi) dan poin 3 (layout mobile sempit, kalau shadcn Grid/
      Tailwind memberi kontrol lebih baik)
- [x] **T-101.2** Queue: `QueueList.tsx`, `QueueScreen.tsx`
- [x] **T-101.3** Drafts: `DraftsList.tsx`
- [x] **T-101.4** `PublishPageHeader.tsx`, `PublishTabbar.tsx`,
      `app/(app)/publish/layout.tsx`
- [x] **T-101.5** Dashboard: `DashboardHome.tsx` — catat juga **KI-036**
      (dashboard fetch via Server Action, menyimpang RS-D02) tetap
      technical debt terpisah, tidak termasuk scope migrasi UI ini

- Catatan T-101.1 (2026-09-03, branch
  `feature/t-101-publish-calendar-queue-drafts-migration`, file di
  `apps/web/src/app/(app)/publish/calendar/components/`):
  * File diubah: `CalendarScreen.tsx`, `CalendarToolbar.tsx`,
    `CalendarPostPopover.tsx`, `CalendarEntryFooter.tsx`,
    `CalendarMonthGrid.tsx`, `CalendarWeekGrid.tsx`. Baru:
    `apps/web/src/components/ui/popover.tsx` (generated via shadcn CLI).
  * 4 dari 6 file (`CalendarMonthGrid`, `CalendarWeekGrid`,
    `CalendarToolbar`, `CalendarScreen`) full shadcn.
    `CalendarPostPopover.tsx` dimigrasi ke shadcn `Popover` (controlled
    `open`/`onOpenChange`), pola ADR-090/091 dipertahankan penuh (klik →
    Popover ringkasan → CTA "Buka Draft Editor"; hover tidak membuka
    popover, dikonfirmasi browser).
  * `CalendarPostPopover.tsx` dan `CalendarEntryFooter.tsx` sengaja
    mempertahankan Astryx `Badge`/`StatusDot`/`Icon` untuk indikator status
    warna — Stone theme shadcn belum punya token semantik
    `success`/`warning`/`info`/`purple` untuk 6 varian `ContentStatus`
    (hanya `accent`/`destructive`). Pola sama dengan `Modal.tsx` (T-100.1) —
    gap desain-token, bukan penyimpangan baru.
  * **Re-evaluasi KI-035:** poin 1 (StyleX/`xstyle`) dikonfirmasi tidak
    relevan lagi — grid Calendar sekarang 100% Tailwind (`grid-cols-7`),
    ditutup. Poin 3 (layout mobile sempit ~375px) tetap Open — diverifikasi
    browser mobile 375px: toolbar filter stack vertikal, footer card pakai
    `StatusDot`+`Icon` compact (bukan `Badge` penuh), sudah berfungsi baik,
    tapi perubahan mendasar ke pola agenda/list butuh rancangan baru di
    Claude Design (di luar scope T-101.1).
  * Verifikasi: `bun run typecheck` PASS 0 error; `bun run lint`/`bunx
    eslint` 7 file PASS 0 error/warning; verifikasi visual browser (Mark UI
    Engineer, akun Maya Anggraini/Admin, workspace Insvire) PASS semua —
    month view, week view, toolbar (Today/‹/›, filter status+akun, toggle
    Week/Month), Popover klik-post (light-dismiss OK), light mode, dark
    mode, mobile 375px, tidak ada regresi visual; review arsitektur Ridwan
    0 temuan (entry point tidak tersentuh, tidak ada import Prisma/
    Supabase/HTTP Outstand, cross-domain lewat public API index, props/
    variant shadcn diverifikasi valid ke `cva()` source).
  * T-101 tetap `🟡 In Progress` — T-101.2 (Queue), T-101.3 (Drafts),
    T-101.4 (header/tabbar/layout), T-101.5 (Dashboard) belum dikerjakan.
- Catatan T-101.2 (2026-09-03, Mark UI Engineer, branch
  `feature/t-101-publish-calendar-queue-drafts-migration`, file di
  `apps/web/src/app/(app)/publish/queue/components/`):
  * File diubah: `QueueList.tsx`, `QueueScreen.tsx`. Tidak ada komponen
    shadcn baru yang perlu di-install — semua (`Button`, `Card`, `Select`,
    `Empty`, `Text`, `Separator`, `Tooltip`, `Alert`, `AlertDialog`,
    `Spinner`) sudah tersedia dari migrasi sebelumnya.
  * Icon aksi (Publish Now, Edit, Cancel Schedule) dan icon jam pindah ke
    `hugeicons` (`SentIcon`, `PencilEdit01Icon`, `Cancel01Icon`,
    `Clock01Icon`). Icon platform (Instagram/Facebook) tetap `react-icons` —
    dikecualikan per ADR-058 (ikon brand), dikonfirmasi bukan pelanggaran
    oleh Ridwan.
  * Dialog "Batalkan jadwal ini?" (Cancel Schedule, Tier 2 ADR-049) memakai
    pola `AlertDialogAction` + `preventDefault()` sesuai presedan
    `MembersTable.tsx` — dialog tetap terbuka sampai proses selesai.
  * **Gap dicatat (bukan penyimpangan):** `useToast` masih dari Astryx —
    dikonfirmasi (grep) sebagai satu-satunya titik pakai Toast di seluruh
    app, belum ada padanan shadcn (`sonner`) terpasang. Migrasi toast butuh
    keputusan sistem baru untuk seluruh app → di luar scope T-101.2. Ridwan
    menilai ini gap yang sah di bawah kebijakan migrasi incremental
    ADR-097, bukan pelanggaran — dicatat sebagai technical debt terpisah:
    pilih & install sistem toast shadcn/sonner, migrasi titik pakai
    terakhir (`useToast` Astryx), di luar scope T-101.
  * Verifikasi: `bun run typecheck` PASS 0 error; `bunx eslint` pada 2 file
    PASS 0 error; verifikasi visual browser (akun Raka Pratama/Owner,
    workspace Insvire) PASS — tampilan normal, filter akun berfungsi
    (termasuk reset ke "Semua akun"), dialog Cancel Schedule berfungsi
    end-to-end (toast muncul, item hilang dari list), tidak ada regresi;
    light mode, dark mode, mobile 375px dicek — tidak ada overflow/elemen
    rusak; console browser bersih. Review arsitektur Ridwan 0 temuan (entry
    point `actions.ts` tidak tersentuh, domain `publishing` tidak tersentuh,
    tidak ada import Prisma/Supabase/Outstand, cross-domain lewat barrel
    `@/domains/publishing`, semua prop/variant shadcn diverifikasi valid ke
    source `cva()`).
  * T-101 tetap `🟡 In Progress` — T-101.3 (Drafts), T-101.4
    (header/tabbar/layout), T-101.5 (Dashboard) belum dikerjakan.
- Catatan T-101.3 (2026-09-03, Mark UI Engineer, branch
  `feature/t-101-publish-calendar-queue-drafts-migration`, file di
  `apps/web/src/app/(app)/publish/drafts/components/`):
  * File diubah: `DraftsList.tsx` — migrasi penuh dari Astryx (`VStack`,
    `Card`, `EmptyState`, `List`/`ListItem`) ke shadcn/ui
    (`Card`/`CardContent`, `Empty`/`EmptyHeader`/`EmptyTitle`/
    `EmptyDescription`, `Item`/`ItemGroup`/`ItemContent`/`ItemTitle`/
    `ItemDescription`/`ItemActions`). Tidak ada komponen shadcn baru yang
    di-install — `Card`/`Empty`/`Item` sudah ada dari migrasi T-099.3
    (`ConnectedAccountsList.tsx`, `WorkspacesSettingsView.tsx`), dipakai
    sebagai presedan langsung (baris klik-penuh pakai `Item asChild`
    membungkus `<button>`, divider antar baris pakai `divide-y
    divide-border` pada `ItemGroup`).
  * `Badge` Astryx (`@astryxdesign/core/Badge`) sengaja dipertahankan untuk
    indikator warna status (6 varian status semantik
    `neutral/warning/info/purple/success/error`, Stone theme shadcn cuma
    punya `default/secondary/destructive/outline/ghost/link`) — presedan
    sama persis dengan `Modal.tsx` (T-100.1) dan
    `CalendarPostPopover.tsx`/`CalendarEntryFooter.tsx` (T-101.1), bukan
    penyimpangan baru.
  * Verifikasi: `bun run typecheck` PASS 0 error; `bunx eslint` pada file
    yang diubah PASS 0 error/warning; verifikasi visual browser (akun Raka
    Pratama/Owner, workspace Insvire) PASS — list drafts render normal,
    klik baris membuka modal Edit Draft dengan benar, light mode OK, dark
    mode OK, mobile 375px OK (tidak ada overflow/elemen rusak, caption
    panjang wrap dengan baik), console browser bersih. Review arsitektur
    Ridwan 0 temuan — file murni komponen UI client, tidak menyentuh
    Server Action/domain layer, import `PublishingPostRecord` lewat
    barrel `@/domains/publishing` (public API, bukan implementasi
    langsung), tidak ada import Prisma/Supabase/HTTP Outstand,
    props/variant shadcn (`Card`, `Empty`, `Item`, dst.) dicocokkan valid
    ke source `cva()` di `apps/web/src/components/ui/`. `eslint-disable
    no-restricted-syntax` pada `<div>` pembungkus dicek valid — ada
    exception rule resmi di `eslint.config.mjs` untuk file yang sudah
    dimigrasi shadcn.
  * T-101 tetap `🟡 In Progress` — T-101.4 (header/tabbar/layout), T-101.5
    (Dashboard) belum dikerjakan.
- Catatan T-101.4 (2026-09-03, Mark UI Engineer, branch
  `feature/t-101-publish-calendar-queue-drafts-migration`, file di
  `apps/web/src/app/(app)/publish/`):
  * File diubah: `components/PublishPageHeader.tsx`,
    `components/PublishTabbar.tsx`, `layout.tsx`.
  * `PublishPageHeader.tsx`: `HStack`/`VStack`/`Heading`/`Text`/`Button`
    Astryx → Tailwind flex + `<h1>` raw (pola sama dengan
    `SettingsPageHead` T-099.1) + `Text` (`variant="muted"`) + `Button`
    shadcn. Icon `PlusSignIcon` (hugeicons) mengganti label literal "+".
  * `PublishTabbar.tsx`: `TabList`/`Tab` Astryx → shadcn `Tabs`/`TabsList`
    (`variant="line"`)/`TabsTrigger` (Radix Tabs). Karena navigasi rute
    (bukan tab client-side), tiap `TabsTrigger` di-render `asChild`
    sebagai `next/link` Link, `Tabs` dikontrol lewat `value` dari
    `usePathname()` supaya active state sinkron dengan URL (tanpa
    `onValueChange`, murni route-driven).
  * `layout.tsx`: `VStack` Astryx → Tailwind flex, tetap composition murni
    tanpa business logic (diverifikasi Ridwan — 0 temuan arsitektur).
  * Komponen shadcn baru: `tabs` (`bunx shadcn@latest add @shadcn/tabs` →
    `apps/web/src/components/ui/tabs.tsx`, style `radix-maia`). Komponen
    lain (`Button`, `Text`) sudah tersedia dari migrasi sebelumnya.
  * Catatan minor (bukan penyimpangan): ukuran heading "Publish"
    (`text-2xl font-semibold`) keputusan gaya Mark karena tidak ada
    variant `Text` shadcn yang cocok untuk page-header ringkas — sama
    alasan dengan `SettingsPageHead` (T-099.1) pakai `<h2>` raw. Nit
    non-arsitektur dari Ridwan: docstring di `PublishTabbar.tsx` menyebut
    `onValueChange` padahal tidak dipakai di kode (kosmetik, tidak perlu
    dicatat sebagai KI).
  * History tab menampilkan halaman scaffold placeholder (T-034, di luar
    scope task ini) — bukan regresi.
  * Verifikasi: `bun run typecheck` PASS 0 error; `bunx eslint` pada 4
    file PASS 0 error/warning; verifikasi visual browser (akun Raka
    Pratama/Owner, workspace Insvire) — light/dark mode, tab switching
    Calendar→Queue→Drafts→History (active underline & subtitle header
    berpindah benar, routing Next.js tanpa full reload), tombol "+ New
    Post" membuka Draft Editor modal, mobile ~375px rapi, tidak ada
    regresi. Review arsitektur Ridwan: 0 temuan (entry point tanpa
    business logic, tidak ada import Prisma/Supabase/HTTP Outstand, tidak
    ada pelanggaran cross-domain/shared types).
  * T-101 tetap `🟡 In Progress` — T-101.5 (Dashboard) belum dikerjakan.
- Catatan T-101.5 (2026-09-03, Mark UI Engineer, branch
  `feature/t-101-publish-calendar-queue-drafts-migration`, file di
  `apps/web/src/app/(app)/components/`):
  * File diubah: `DashboardHome.tsx` — migrasi penuh dari Astryx (`Card`,
    `EmptyState`, `Grid`, `Heading`, `HStack`, `ProgressBar`, `Section`,
    `Selector`, `Text`, `VStack`) ke shadcn/ui.
  * Komponen shadcn baru: `progress` (`bunx shadcn@latest add progress` →
    `apps/web/src/components/ui/progress.tsx`, belum pernah ada sebelumnya,
    di-discover dulu via MCP search/view/examples sebelum install).
  * Pemetaan: `VStack`/`HStack`/`Section` → Tailwind flex/grid (pola sama
    `PublishPageHeader.tsx` T-101.4); `Heading level={1}`/`level={2}` →
    `<h1>`/`<h2>` raw + Tailwind (pola sama `SettingsPageHead` T-099.1);
    `Text type="supporting"` → shadcn `Text variant="muted"`/`"small"`;
    `Selector` (weekly/monthly) → shadcn `Select`/`SelectTrigger`/
    `SelectValue`/`SelectContent`/`SelectItem` (pola sama
    `CalendarToolbar.tsx` T-101.1); `Card` → shadcn `Card`/`CardContent`;
    `EmptyState` → shadcn `Empty`/`EmptyHeader`/`EmptyTitle`/
    `EmptyDescription`; `Grid` (3 StatTile) → `grid grid-cols-1
    sm:grid-cols-3 gap-4`; `ProgressBar` → shadcn `Progress` (Radix, skala
    value 0-100).
  * **Gap dicatat (bukan penyimpangan):** shadcn `Progress` tidak punya
    value-label formatting bawaan seperti Astryx (`hasValueLabel`/
    `formatValueLabel`) — label persentase dirender manual sebagai `Text`
    di atas komponen `Progress`. Konsisten dengan presedan gap
    desain-token serupa di T-101.1/T-101.3, bukan penyimpangan baru.
  * Tidak diubah: state `period`, `useTransition`, Server Action
    `getDashboardSummaryAction`, guard `latestRequestedPeriod` — murni
    migrasi presentasi. **KI-036** (dashboard fetch via Server Action
    menyimpang RS-D02) tetap technical debt terpisah, tidak disentuh.
  * Rancangan dicek dulu ke Claude Design project "Social Media
    Management" (`templates/home.html`, KSP-01 — Home, section Analytics
    Snapshot) sesuai gate rule 17 `AGENTS.md` — sudah ada, implementasi
    lanjut tanpa hambatan.
  * Verifikasi: `bun run typecheck` PASS 0 error; `bunx eslint` PASS 0
    error; verifikasi visual browser — empty state dark mode PASS, golden
    path dark+light mode PASS, mobile 375px PASS (tidak overflow),
    interaksi ganti periode Mingguan↔Bulanan via Select berfungsi, console
    browser bersih. Review arsitektur Ridwan: 0 temuan (logic tidak
    berubah, tidak ada import Prisma/Supabase/HTTP Outstand, cross-domain
    lewat barrel `@/domains/analytics`, prop/variant shadcn diverifikasi
    valid ke source `cva()`).
  * **T-101 selesai (5/5 subtask)** — Calendar, Queue, Drafts,
    header/tabbar/layout, dan Dashboard seluruhnya sudah dimigrasikan ke
    shadcn/ui.

---

### T-102 · Cleanup & Verifikasi Akhir

`🟡 In Progress` · **Domain** platform/tooling · **ADR** ADR-097 · **Depends** T-097, T-098, T-099, T-100, T-101
**Baca dulu:** —

Task penutup — baru dikerjakan setelah **semua** route segment selesai
dimigrasikan, memastikan tidak ada sisa Astryx di codebase.

- [x] **T-102.2** Grep ulang seluruh `apps/web/src` untuk memastikan **0**
      import `@astryxdesign/*` tersisa (safety check sebelum uninstall)
- [x] **T-102.1** Hapus dependency `@astryxdesign/core`,
      `@astryxdesign/theme-stone`, `@astryxdesign/cli` dari
      `apps/web/package.json`; hapus script `astryx`; hapus field
      `"astryx"` config — **tuntas sepenuhnya** (2026-09-04): setelah
      T-102.6 selesai, `@astryxdesign/core` juga sudah dihapus, `bun
      install` sukses, `bun.lock` sinkron
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
- [x] **T-102.6** (baru, ditemukan 2026-09-04) Migrasi `useToast` di
      `apps/web/src/app/(app)/publish/queue/components/QueueScreen.tsx` dari
      `@astryxdesign/core/Toast` ke padanan shadcn (mis. `sonner`/toast
      shadcn — discover dulu via MCP/CLI shadcn, jangan menebak nama).
      Setelah ini selesai, hapus `@astryxdesign/core` dari
      `apps/web/package.json` untuk menuntaskan T-102.1 sepenuhnya.

> **Update (2026-09-04):** Grep ulang `apps/web/src` (T-102.2) menemukan 9
> file dengan import `@astryxdesign/*` aktif yang tersisa meski T-097–T-101
> sudah ditandai ✅ Done — gap yang tidak tercatat sebelumnya. Dimigrasi
> Mark UI Engineer di branch `feature/t-102-cleanup-verifikasi-akhir`:
> `Modal.tsx` & `status-badge.ts` (draft-editor), `calendar-grid-shared.ts`,
> `CalendarEntryFooter.tsx`, `CalendarPostPopover.tsx` (calendar),
> `DraftsList.tsx` (drafts), `ScaffoldPlaceholder.tsx`, `Providers.tsx`
> (Theme/stoneTheme/LinkProvider dilepas sepenuhnya — semua konsumen sudah
> bersih), `globals.css` (4 baris `@import` Astryx + layer astryx-base/theme
> dihapus). Pemetaan komponen: `Badge`→shadcn `Badge`, `Banner`→`Alert`/
> `AlertTitle`, `Divider`→`Separator`, `Heading`→`Text variant="h4"`,
> `HStack`/`VStack`/`Center`/`Stack`→Tailwind flex, `Link`→`next/link`,
> `EmptyState`→shadcn `Empty`, `StatusDot`/`Icon` (compact mobile
> `CalendarEntryFooter`) dipertahankan sebagai custom dot+icon kecil setelah
> retest 375px menunjukkan `Badge` shadcn overflow di kolom grid sempit —
> **bukan regresi, keputusan sadar**. Gap desain-token warna semantik
> `success`/`warning`/`info`/`purple` untuk `ContentStatus` (**KI-041**,
> berulang sejak T-097/T-099/T-101) tetap terbuka — dipetakan sementara ke
> variant shadcn existing (`outline`/`secondary`/`default`/`destructive`),
> bukan keputusan final. `bun run typecheck` & `bun run lint` PASS 0 error.
> Verifikasi visual manual (light+dark, mobile 375px) PASS, 0 regresi.
> Setelah migrasi ini, hanya tersisa 1 import `@astryxdesign/*` aktif:
> `useToast` di `QueueScreen.tsx` (sengaja dipertahankan, belum ada padanan
> shadcn) — dicatat sebagai **T-102.6** baru. T-102.1 dieksekusi partial:
> `theme-stone`+`cli`+script/config `astryx` dihapus dari
> `apps/web/package.json`, `@astryxdesign/core` dipertahankan sampai
> T-102.6 tuntas. `bun install` sukses, lockfile sinkron.

> **Update (2026-09-04, T-102.6 selesai — T-102.1 tuntas penuh):** **T-102.6**
> (migrasi `useToast` Astryx → shadcn) selesai dikerjakan Mark UI Engineer di
> branch `feature/t-102-cleanup-verifikasi-akhir`. Component `sonner`
> di-install via `bunx shadcn@latest add @shadcn/sonner` ke
> `apps/web/src/components/ui/sonner.tsx`, lalu diadaptasi: dependensi
> `useTheme` dari `next-themes` dihapus (project punya mekanisme tema
> sendiri — cookie + class `dark`, lihat ADR-055/ADR-097 poin 9) — `theme`
> diterima sebagai prop biasa dengan default `"system"`. `<Toaster
> theme={mode} />` dipasang sekali di root
> [`Providers.tsx`](../../apps/web/src/components/Providers.tsx), memakai
> `mode` dari `useThemeMode` context yang sudah ada — pola yang sama
> seperti `TooltipProvider`. Di
> [`QueueScreen.tsx`](../../apps/web/src/app/(app)/publish/queue/components/QueueScreen.tsx),
> `useToast` dari `@astryxdesign/core/Toast` diganti `toast()` dari
> `sonner`, pesan dipertahankan persis ("Jadwal dibatalkan — post kembali
> ke Drafts"). Dependency `sonner` ditambahkan ke `apps/web/package.json`;
> `next-themes` yang otomatis ditambah CLI dihapus lagi karena jadi unused
> setelah adaptasi. Dengan ini **T-102.1 tuntas sepenuhnya**:
> `@astryxdesign/core` dihapus dari `apps/web/package.json`, `bun install`
> dijalankan di root repo, `bun.lock` sinkron. Verifikasi: `bun run
> typecheck` PASS 0 error; `bunx eslint .` PASS 0 error (1 pesan info
> generik "Pages directory cannot be found" dari plugin next/eslint
> dikonfirmasi pre-existing lewat `git stash` test, bukan regresi). Grep
> `@astryxdesign` di `apps/web/src` sekarang **0 import aktif** (sisa hanya
> komentar historis yang menyebut nama package sebagai referensi). **Gap
> terbuka:** verifikasi visual browser (bagian dari T-102.4) **belum bisa
> dilakukan** dalam sesi ini — dev server lokal minta login dan tidak ada
> kredensial test tersedia untuk memverifikasi toast baru tampil benar di
> Publish → Queue (trigger Cancel Schedule); presedan sama dengan yang
> dicatat di `COMPLETE_TASK.md` baris 1405. Kode sudah siap tapi eyeball
> check masih pending — perlu King Rezi kasih kredensial atau cek manual
> sendiri sebelum T-102.4 ditutup. Subtask v0.7 selesai naik 33 → **35**
> dari 38 total (T-102.1 dan T-102.6 keduanya jadi ✅). Sisa T-102:
> T-102.3, T-102.4, T-102.5.

> **Update (2026-09-04, gap verifikasi visual T-102.6 ditutup):** King Rezi
> mengecek manual sendiri di browser (Publish → Queue → trigger Cancel
> Schedule) dan mengonfirmasi singkat: **"toast oke"** — toast baru dari
> `sonner` tampil benar menggantikan toast Astryx lama. Dengan ini, gap
> verifikasi visual yang tercatat terbuka di update sebelumnya untuk
> **T-102.6** sudah ditutup sepenuhnya. Catatan: ini **bukan** menutup
> **T-102.4** (QA visual menyeluruh Najwa QA Engineer, area Auth/
> Onboarding/App Shell/Settings/Publish/Dashboard) — konfirmasi ini hanya
> menutup satu titik verifikasi (toast Cancel Schedule), scope T-102.4
> masih jauh lebih besar dan tetap `[ ]` belum dikerjakan. Status T-102
> keseluruhan tetap `🟡 In Progress`, sisa T-102.3, T-102.4, T-102.5.
